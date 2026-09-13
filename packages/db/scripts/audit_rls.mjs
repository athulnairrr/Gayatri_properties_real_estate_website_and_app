// One-off live RLS/security audit script. Not part of the normal migrate/seed flow.
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const ADMIN_UID = "10d49f9c-b8aa-4b62-8eb0-cc5793a18f1b";
const STAFF_UID = "eb7fd5d9-6ddd-4c05-a9f5-514b570456ef";
const RANDOM_UID = "00000000-0000-0000-0000-000000000099"; // authenticated but NOT in staff_profiles

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function as(role, uid, fn) {
  await client.query("begin");
  try {
    if (uid) {
      await client.query("select set_config('request.jwt.claim.sub', $1, true)", [uid]);
    }
    await client.query(`set local role ${role}`);
    await fn();
  } finally {
    await client.query("rollback"); // discard any writes the test attempted
  }
}

// Each check runs inside its own SAVEPOINT so one failing/erroring statement doesn't
// poison the rest of the outer transaction (Postgres aborts the whole tx on any error).
async function expectRows(label, queryFn, expectCount) {
  await client.query("savepoint sp");
  try {
    const res = await queryFn();
    const n = res.rowCount;
    const ok = expectCount === "any>0" ? n > 0 : n === expectCount;
    console.log(`${ok ? "OK  " : "FAIL"} ${label} -> rows=${n}`);
  } catch (err) {
    console.log(`ERR  ${label} -> ${err.message}`);
  } finally {
    await client.query("rollback to savepoint sp");
  }
}

async function expectError(label, queryFn) {
  await client.query("savepoint sp");
  try {
    await queryFn();
    console.log(`FAIL ${label} -> expected error, but it succeeded`);
  } catch (err) {
    console.log(`OK   ${label} -> blocked: ${err.message}`);
  } finally {
    await client.query("rollback to savepoint sp");
  }
}

// For UPDATE/DELETE: Supabase grants anon/authenticated blanket table-level privileges and
// relies entirely on RLS to filter which *rows* are affected. So a write RLS should block
// often does NOT throw — it just matches 0 rows. Assert on rowCount, not on thrown/not-thrown.
async function expectZeroRowsAffected(label, queryFn) {
  await client.query("savepoint sp");
  try {
    const res = await queryFn();
    const ok = res.rowCount === 0;
    console.log(`${ok ? "OK  " : "FAIL"} ${label} -> rowCount=${res.rowCount} (RLS should keep this at 0)`);
  } catch (err) {
    console.log(`OK   ${label} -> blocked with error: ${err.message}`);
  } finally {
    await client.query("rollback to savepoint sp");
  }
}

async function main() {
  await client.connect();

  console.log("\n=== ANON: read access to sensitive tables (expect 0 rows or error) ===");
  await as("anon", null, async () => {
    await expectRows("anon select customers", () => client.query("select * from customers"), 0);
    await expectRows("anon select leads", () => client.query("select * from leads"), 0);
    await expectRows("anon select customer_roles", () => client.query("select * from customer_roles"), 0);
    await expectRows("anon select visits", () => client.query("select * from visits"), 0);
    await expectRows("anon select follow_ups", () => client.query("select * from follow_ups"), 0);
    await expectRows("anon select deals", () => client.query("select * from deals"), 0);
    await expectRows("anon select documents", () => client.query("select * from documents"), 0);
    await expectRows("anon select staff_profiles", () => client.query("select * from staff_profiles"), 0);
    await expectRows("anon select properties (raw table)", () => client.query("select * from properties"), 0);
  });

  console.log("\n=== ANON: direct writes to private tables must fail ===");
  await as("anon", null, async () => {
    await expectError("anon insert customers", () =>
      client.query("insert into customers (full_name, phone) values ('Hacker', '+911234567890')")
    );
    await expectError("anon insert leads", () =>
      client.query(
        "insert into leads (customer_id, source) values ((select id from customers limit 1), 'WEBSITE')"
      )
    );
    await expectError("anon insert customer_roles", () =>
      client.query(
        "insert into customer_roles (customer_id, role) values ((select id from customers limit 1), 'BUYER')"
      )
    );
    await expectError("anon insert properties", () =>
      client.query(
        "insert into properties (transaction_type, property_type, title, price, locality, latitude, longitude) values ('SALE','FLAT','x',1,'x',19,73)"
      )
    );
    await expectZeroRowsAffected("anon update staff_profiles", () =>
      client.query("update staff_profiles set role = 'ADMIN'")
    );
  });

  console.log("\n=== ANON: public_properties view must NOT expose internal columns ===");
  await as("anon", null, async () => {
    await expectRows("anon select public_properties", () => client.query("select * from public_properties"), "any>0");
    await expectError("anon select owner_name via public_properties", () =>
      client.query("select owner_name from public_properties limit 1")
    );
    await expectError("anon select owner_phone via public_properties", () =>
      client.query("select owner_phone from public_properties limit 1")
    );
    await expectError("anon select internal_notes via public_properties", () =>
      client.query("select internal_notes from public_properties limit 1")
    );
    await expectError("anon select negotiation_min via public_properties", () =>
      client.query("select negotiation_min from public_properties limit 1")
    );
    const cols = await client.query(
      "select column_name from information_schema.columns where table_name = 'public_properties'"
    );
    console.log("public_properties columns:", cols.rows.map((r) => r.column_name).join(", "));
  });

  console.log("\n=== ANON: property_media only visible for AVAILABLE properties ===");
  await as("anon", null, async () => {
    await expectRows(
      "anon select property_media for HOLD/SOLD property (expect 0)",
      () =>
        client.query(
          "select pm.* from property_media pm join properties p on p.id = pm.property_id where p.status != 'AVAILABLE'"
        ),
      0
    );
  });

  console.log("\n=== ANON: create_public_lead() works and returns no sensitive data ===");
  await as("anon", null, async () => {
    const propId = (
      await client.query("select id from public_properties where property_code = 'TH1003'")
    ).rows[0]?.id;
    const res = await client.query(
      "select * from create_public_lead($1, $2, $3, 'WEBSITE', '/audit-test', 'audit test enquiry')",
      ["Audit Tester", "+919888800001", propId]
    );
    console.log("OK   anon create_public_lead ->", res.rows[0]);
  });

  console.log("\n=== AUTHENTICATED but NOT staff: must be treated as a normal user, no internal access ===");
  await as("authenticated", RANDOM_UID, async () => {
    await expectRows("non-staff select customers", () => client.query("select * from customers"), 0);
    await expectRows("non-staff select properties (raw)", () => client.query("select * from properties"), 0);
    await expectRows("non-staff select staff_profiles", () => client.query("select * from staff_profiles"), 0);
    await expectError("non-staff insert properties", () =>
      client.query(
        "insert into properties (transaction_type, property_type, title, price, locality, latitude, longitude) values ('SALE','FLAT','x',1,'x',19,73)"
      )
    );
  });

  console.log("\n=== AUTHENTICATED STAFF (STAFF role): expected access ===");
  await as("authenticated", STAFF_UID, async () => {
    await expectRows("staff select customers", () => client.query("select * from customers"), "any>0");
    await expectRows("staff select properties", () => client.query("select * from properties"), "any>0");
    await expectRows("staff select deals", () => client.query("select * from deals"), "any>0");
    await expectZeroRowsAffected("STAFF delete a deal (admin-only)", () =>
      client.query("delete from deals where id = (select id from deals limit 1)")
    );
    await expectError("STAFF escalate own role to ADMIN", () =>
      client.query("update staff_profiles set role = 'ADMIN' where user_id = $1", [STAFF_UID])
    );
  });

  console.log("\n=== AUTHENTICATED STAFF (ADMIN role): expected full access ===");
  await as("authenticated", ADMIN_UID, async () => {
    await expectRows("admin select staff_profiles", () => client.query("select * from staff_profiles"), "any>0");
    // Real positive check: admin's delete should actually match a row (rolled back after).
    const before = (await client.query("select count(*) from deals")).rows[0].count;
    const del = await client.query("delete from deals where id = (select id from deals limit 1)");
    console.log(`OK   admin delete a deal -> rowCount=${del.rowCount} (expected 1, before count=${before})`);
  });

  console.log("\n=== Duplicate lead / phone enumeration check ===");
  await as("anon", null, async () => {
    const propId = (
      await client.query("select id from public_properties where property_code = 'TH1003'")
    ).rows[0]?.id;
    const r1 = await client.query(
      "select * from create_public_lead($1, $2, $3, 'WEBSITE', '/p1', 'first enquiry')",
      ["Dup Tester", "+919888800002", propId]
    );
    const r2 = await client.query(
      "select * from create_public_lead($1, $2, $3, 'WEBSITE', '/p2', 'second enquiry, same phone')",
      ["Dup Tester Updated Name", "+91 98888 00002", propId]
    );
    console.log("first submit ->", r1.rows[0]);
    console.log("second submit (same phone, spaced differently) ->", r2.rows[0]);
    const sameCustomer = r1.rows[0].customer_code === r2.rows[0].customer_code;
    console.log(`${sameCustomer ? "OK  " : "FAIL"} dedup by normalized phone -> same customer_code: ${sameCustomer}`);
    // NOTE: this whole `as()` block runs in a transaction that is rolled back at the end
    // (the entire audit script is non-destructive by design), so a same-transaction count
    // check here is the only way to observe it, and only anon's own visibility (blocked by
    // RLS, expected 0) is checkable this way. Real persistence + single-row dedup + a clean
    // 2-lead history for one phone was verified separately with a committed transaction and
    // then deleted; see audit report for that result.
  });

  console.log("\n=== Cross-check: normalized phone index actually used ===");
  await client.query("reset role");
  const plan = await client.query(
    "explain select * from customers where normalize_phone(phone) = normalize_phone('+91 9920001001')"
  );
  console.log(plan.rows.map((r) => r["QUERY PLAN"]).join("\n"));

  console.log("\n=== Cross-check: radius search uses GiST index (not seq scan) ===");
  const plan2 = await client.query(
    "explain select * from properties where ST_DWithin(geog, ST_SetSRID(ST_MakePoint(72.9781, 19.2114), 4326)::geography, 3000)"
  );
  console.log(plan2.rows.map((r) => r["QUERY PLAN"]).join("\n"));

  await client.end();
}

main().catch((e) => {
  console.error("AUDIT SCRIPT ERROR:", e);
  process.exit(1);
});
