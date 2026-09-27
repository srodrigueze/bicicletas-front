import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = next && next.startsWith("/") ? next : "/prestamos";

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
