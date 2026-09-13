import { getCurrentStaffProfile } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";
import { DashboardNav } from "@/components/DashboardNav";
import { logoutAction } from "@/app/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = getServerSupabase();
  // Having a Supabase Auth session is NOT enough — this must also be an active
  // staff_profiles row, and RLS is what actually enforces that (see docs/AUDIT_2026-09-13.md).
  // If this returns null, either the user isn't staff, or their account was deactivated.
  const staff = await getCurrentStaffProfile(supabase);

  if (!staff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-lg font-semibold text-ink-900">Access restricted</h1>
          <p className="mt-2 text-sm text-ink-500">
            Your account is signed in but is not registered as active staff. Please contact an
            administrator.
          </p>
          <form action={logoutAction} className="mt-6">
            <button type="submit" className="btn-secondary w-full">
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <DashboardNav staff={staff} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
