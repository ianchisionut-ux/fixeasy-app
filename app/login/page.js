"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "../SiteHeader";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la autentificare.");
      router.push(data.user.role === "provider" ? "/dashboard" : "/");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader session={null} />
      <section style={{ maxWidth: 420, margin: "60px auto" }}>
        <div className="section-head">
          <h2>Autentificare</h2>
          <p>Intră în contul tău FixEasy.</p>
        </div>
        <form onSubmit={submit} style={{ background: "var(--white)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: 28, boxShadow: "var(--shadow-md)" }}>
          <span className="field-label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nume@exemplu.ro" />
          <span className="field-label" style={{ marginTop: 14 }}>Parolă</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          {error && <div className="error-msg">{error}</div>}
          <button className="btn btn-orange" style={{ width: "100%", marginTop: 18, padding: 13 }} disabled={loading}>
            {loading ? "Se autentifică…" : "Intră în cont"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13.5, color: "var(--slate)" }}>
          Nu ai cont? <a href="/inregistrare" style={{ color: "var(--steel)", fontWeight: 600 }}>Înregistrează-te</a>
        </p>
      </section>
    </>
  );
}
