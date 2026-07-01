import Link from "next/link";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/session";
import { destroySession } from "@/lib/session";
import { BrandMark } from "@/components/brand-mark";

async function logout() {
  "use server";
  await destroySession();
  redirect("/");
}

export async function SiteHeader() {
  const session = await readSession();

  const links: { href: string; label: string }[] = [];
  if (!session) {
    links.push({ href: "/request/new", label: "Find care" });
    links.push({ href: "/onboarding/caregiver", label: "For caregivers" });
  } else if (session.role === "FAMILY") {
    links.push({ href: "/request/new", label: "Find care" });
    links.push({ href: "/dashboard/family", label: "My requests" });
  } else if (session.role === "CAREGIVER") {
    links.push({ href: "/dashboard/caregiver", label: "Dashboard" });
    links.push({ href: "/dashboard/caregiver/leads", label: "Leads" });
  } else if (session.role === "ADMIN") {
    links.push({ href: "/admin/verification", label: "Verification queue" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-[62px] flex items-center gap-5">
        <Link href="/" className="flex items-center gap-2.5 font-serif-display text-xl font-semibold text-ink">
          <BrandMark />
          <span className="leading-none">
            Kindred Care
            <span className="block text-[10px] tracking-[0.12em] uppercase text-faint font-sans font-semibold mt-0.5">
              Nurses &amp; home care
            </span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 text-sm font-semibold">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="px-3 py-2 rounded-full text-muted hover:text-ink hover:bg-surface-2">
              {l.label}
            </Link>
          ))}
          {session ? (
            <form action={logout}>
              <button type="submit" className="btn btn-ghost btn-sm ml-2">
                Log out
              </button>
            </form>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm ml-2">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
