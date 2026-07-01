import { LoginForm } from "@/components/login-form";
import { readSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { roleHome } from "@/lib/roles";

export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string; next?: string }>;
}) {
  const session = await readSession();
  if (session) redirect(roleHome(session.role));

  const { intent, next } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <span className="eyebrow">
        {intent === "caregiver" ? "Caregiver sign-in" : "Welcome to Kindred Care"}
      </span>
      <h1 className="text-3xl mt-2 mb-2">
        {intent === "caregiver" ? "Register or log in" : "Log in with your mobile"}
      </h1>
      <p className="text-muted text-sm mb-6">
        We&apos;ll send a one-time password to verify your number. No passwords to remember.
      </p>
      <div className="card" style={{ padding: 26 }}>
        <LoginForm intent={intent ?? ""} next={next ?? ""} />
      </div>
      <p className="text-xs text-faint mt-4 text-center">
        By continuing you agree to our{" "}
        <a href="/legal/terms" className="text-primary-deep underline">Terms</a> and{" "}
        <a href="/legal/privacy" className="text-primary-deep underline">Privacy Policy</a>.
      </p>
    </div>
  );
}
