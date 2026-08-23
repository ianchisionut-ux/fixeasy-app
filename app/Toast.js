"use client";

import { useEffect, useState } from "react";

let idCounter = 0;

export function toast(message, type = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("fixeasy-toast", { detail: { message, type, id: ++idCounter } }));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handler(e) {
      const t = e.detail;
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3800);
    }
    window.addEventListener("fixeasy-toast", handler);
    return () => window.removeEventListener("fixeasy-toast", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={"toast toast-" + t.type}>
          <span>{t.type === "error" ? "⚠" : "✓"}</span> {t.message}
        </div>
      ))}
    </div>
  );
}
