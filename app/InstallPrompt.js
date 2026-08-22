"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!visible) return null;

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  return (
    <div
      style={{
        position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
        zIndex: 200, background: "var(--graphite)", color: "var(--paper)",
        borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center",
        gap: 12, boxShadow: "0 10px 30px rgba(0,0,0,.25)", maxWidth: "calc(100vw - 32px)",
      }}
    >
      <span style={{ fontSize: 13.5 }}>Instalează FixEasy pe telefon pentru acces rapid.</span>
      <button className="btn btn-orange" style={{ padding: "8px 14px", fontSize: 13, flexShrink: 0 }} onClick={install}>
        Instalează
      </button>
      <button
        onClick={() => setVisible(false)}
        style={{ background: "none", border: "none", color: "rgba(243,248,251,.6)", cursor: "pointer", fontSize: 16, flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  );
}
