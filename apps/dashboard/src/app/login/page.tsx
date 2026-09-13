import { LoginForm } from "./LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
            GP
          </div>
          <h1 className="text-lg font-semibold text-ink-900">Gayatri Properties Staff</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to access the internal dashboard.</p>
        </div>
        <LoginForm next={searchParams.next} />
      </div>
    </div>
  );
}
