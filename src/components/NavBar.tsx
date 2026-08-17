import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function NavBar() {
  return (
    <header className="border-b-[3px] border-border bg-background">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="font-serif text-lg tracking-tight text-foreground-bright"
        >
          Bitz Garcia
        </Link>
        <ul className="flex gap-6 text-xs font-bold tracking-wide text-foreground uppercase sm:gap-8">
          {links.map((link) => (
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
