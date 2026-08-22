"use client";

import { useRouter } from "next/navigation";

export default function HeaderAuth({ session }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!session) {
    return (
      <div className="nav-cta" style={{ display: "flex", gap: 10 }}>
        <a href="/login" className="btn btn-outline" style={{ color: "var(--graphite)", borderColor: "var(--line)" }}>Autentificare</a>
        <a href="/inregistrare" className="btn btn-orange">Creează cont</a>
      </div>
    );
  }

  return (
    <div className="nav-cta" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 13.5, color: "var(--slate)" }}>Salut, {session.name?.split(" ")[0]}</span>
      <button className="btn btn-outline" style={{ color: "var(--graphite)", borderColor: "var(--line)" }} onClick={logout}>Ieși din cont</button>
    </div>
  );
}
