-- Bug fix: property_media_public_select (0005_properties.sql) checked property status via
-- a subquery against the raw `properties` table. Anon has no SELECT grant on `properties`
-- (by design — only the public_properties view is anon-readable), so that EXISTS subquery
-- silently matched zero rows for every property, not just non-AVAILABLE ones. Net effect:
-- the public website could never actually read any property photos. Caught by manually
-- testing the *positive* case (an AVAILABLE property) instead of only the negative case
-- the original audit covered.
--
-- Fix: check membership against the public_properties view instead of the raw table. The
-- view runs with its owner's privileges for underlying-table access (standard Postgres
-- view behavior), so this still enforces "only AVAILABLE properties" without requiring
-- anon to have direct access to `properties`.
drop policy if exists property_media_public_select on property_media;

create policy property_media_public_select on property_media
  for select to anon
  using (
    exists (
      select 1 from public_properties pp
      where pp.id = property_media.property_id
    )
  );
