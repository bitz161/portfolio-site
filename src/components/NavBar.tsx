import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function NavBar() {
  return (
    <header className="border-b-[3px] border-border">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="font-serif text-xl font-black tracking-tight text-foreground-bright"
        >
          Bitz Garcia
        </Link>
        <ul className="flex gap-8 text-sm font-semibold tracking-wide text-foreground uppercase">
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
