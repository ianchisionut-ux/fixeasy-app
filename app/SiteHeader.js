"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function SiteHeader({ session, links = [] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const allLinks = [...links];
  if (session?.role === "provider") {
    allLinks.push({ href: "/dashboard", label: "Dashboard prestator" });
  }
  if (session?.role === "client") {
    allLinks.push({ href: "/programarile-mele", label: "Programările mele" });
  }

  return (
    <header>
      <div className="nav">
        <a href="/" className="logo">
          <Image src="/logo.png" alt="FixEasy.ro" width={249} height={177} priority />
        </a>

        <nav className="nav-links">
          {allLinks.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>

        <div className="nav-cta">
          {session ? (
            <>
              <span style={{ fontSize: 13.5, color: "var(--slate)" }}>Salut, {session.name?.split(" ")[0]}</span>
              <button className="btn btn-outline" onClick={logout}>Ieși din cont</button>
            </>
          ) : (
            <>
              <a href="/login" className="btn btn-outline">Autentificare</a>
              <a href="/inregistrare" className="btn btn-orange">Creează cont</a>
            </>
          )}
        </div>

        <button className="hamburger" aria-label="Meniu" onClick={() => setOpen(!open)}>
          {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>

        <div className={"mobile-drawer" + (open ? " open" : "")}>
          {allLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          {session ? (
            <button onClick={logout}>Ieși din cont ({session.name?.split(" ")[0]})</button>
          ) : (
            <>
              <a href="/login" className="btn btn-outline" onClick={() => setOpen(false)}>Autentificare</a>
              <a href="/inregistrare" className="btn btn-orange" onClick={() => setOpen(false)}>Creează cont</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
