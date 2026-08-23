"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CalendarDays, CheckCircle2, ClipboardList, MapPin, CalendarCheck } from "lucide-react";
import { trackEvent } from "../GoogleAnalytics";

const CLIENT_STEPS = [
  { icon: Search, title: "Cauți în zona ta", text: "Filtrezi după meserie și oraș — vezi doar prestatori relevanți pentru tine." },
  { icon: CalendarDays, title: "Alegi un slot liber", text: "Programezi direct în calendarul prestatorului, fără telefoane." },
  { icon: CheckCircle2, title: "Primești confirmare", text: "Notificare instant, plus status urmărit live în cont." },
];

const PROVIDER_STEPS = [
  { icon: ClipboardList, title: "Îți creezi profilul", text: "Adaugi serviciile, prețurile și orașul în care lucrezi." },
  { icon: MapPin, title: "Apari clienților din zonă", text: "Ești vizibil automat clienților care caută în orașul tău." },
  { icon: CalendarCheck, title: "Accepți programări", text: "Gestionezi totul dintr-un calendar simplu — acceptă sau respinge într-un click." },
];

export default function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la înregistrare.");
      trackEvent("sign_up", { method: role });
      router.push(role === "provider" ? "/dashboard" : "/");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const steps = role === "provider" ? PROVIDER_STEPS : CLIENT_STEPS;

  return (
    <section className="register-layout">
      <div>
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 24px" }}>
          <h2>Creează cont</h2>
          <p>Alege tipul de cont potrivit.</p>
        </div>
        <div className="cat-row" style={{ marginBottom: 20, justifyContent: "flex-start" }}>
          <button type="button" className={"cat-btn" + (role === "client" ? " active" : "")} onClick={() => setRole("client")}>Sunt client</button>
          <button type="button" className={"cat-btn" + (role === "provider" ? " active" : "")} onClick={() => setRole("provider")}>Sunt prestator</button>
        </div>
        <form onSubmit={submit} style={{ background: "var(--white)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: 28, boxShadow: "var(--shadow-md)" }}>
          <span className="field-label">{role === "provider" ? "Nume business" : "Nume complet"}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder={role === "provider" ? "Ex: Ionescu Instalații" : "Ex: Andrei Popescu"} />
          <span className="field-label" style={{ marginTop: 14 }}>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nume@exemplu.ro" />
          <span className="field-label" style={{ marginTop: 14 }}>Telefon</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xx xxx xxx" />
          <span className="field-label" style={{ marginTop: 14 }}>Parolă</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Minim 6 caractere" />
          {error && <div className="error-msg">{error}</div>}
          <button className="btn btn-orange" style={{ width: "100%", marginTop: 18, padding: 13 }} disabled={loading}>
            {loading ? "Se creează…" : "Creează cont"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13.5, color: "var(--slate)" }}>
          Ai deja cont? <a href="/login" style={{ color: "var(--steel)", fontWeight: 600 }}>Autentifică-te</a>
        </p>
      </div>

      <div className={"how-col " + role} style={{ marginTop: 0 }}>
        <h3>{role === "provider" ? "Pentru prestatori" : "Pentru clienți"}</h3>
        <div className="how-sub">{role === "provider" ? "De la înscriere la primul client nou" : "De la căutare la lucrare finalizată"}</div>
        {steps.map((step, i) => (
          <div className="how-step" key={i}>
            <div className="how-num"><step.icon size={16} strokeWidth={2.2} /></div>
            <div>
              <div className="how-step-title">{step.title}</div>
              <div className="how-step-text">{step.text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
