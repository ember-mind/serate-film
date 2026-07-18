import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { Nav } from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <Nav isAdmin={user.isAdmin} userName={user.name} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 sm:pb-12">
        {children}
      </main>
      <footer className="hidden border-t border-riga py-4 text-center sm:block">
        <form action={logout}>
          <button className="eyebrow hover:text-schermo">Esci · {user.name}</button>
        </form>
      </footer>
    </div>
  );
}
