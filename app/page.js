import { providers } from "../lib/store";
import Marketplace from "./Marketplace";

export default function HomePage() {
  return (
    <>
      <header>
        <div className="nav">
          <a href="/" className="logo"><img src="/logo.png" alt="FixEasy.ro" /></a>
          <nav className="nav-links">
            <a href="#marketplace">Meseriași</a>
            <a href="/dashboard">Dashboard prestator</a>
          </nav>
        </div>
      </header>

      <div className="hero">
        <span className="eyebrow">● {providers.length} meseriași verificați activi azi</span>
        <h1>Găsești meseriașul potrivit. Programezi în 60 de secunde.</h1>
        <p>Instalatori, electricieni și mecanici auto verificați — programarea se salvează live, cu status urmărit în dashboard.</p>
      </div>

      <section id="marketplace">
        <div className="section-head">
          <span className="eyebrow" style={{ background: "rgba(44,74,94,.1)", color: "var(--steel)" }}>Prestatori</span>
          <h2>Alege și programează</h2>
          <p>Fiecare programare e salvată real prin API — vezi rezultatul în dashboard.</p>
        </div>
        <Marketplace initialProviders={providers} />
      </section>

      <footer>
        <b>FixEasy</b> — aplicație demonstrativă (date în memorie, se resetează la restart server).
      </footer>
    </>
  );
}
