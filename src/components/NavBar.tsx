import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function NavBar({ isAdmin = false }: { isAdmin?: boolean }) {
  const navLinks = isAdmin ? [...links, { href: "/admin", label: "Admin" }] : links;
  return (
    <header className="bg-background">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-7">
        <Link
          href="/"
          className="font-serif text-lg font-bold tracking-tight text-foreground-bright"
        >
          Josue Garcia
        </Link>
        <ul className="flex gap-6 font-mono text-[11px] font-bold tracking-[0.14em] text-foreground-bright uppercase sm:gap-9">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
