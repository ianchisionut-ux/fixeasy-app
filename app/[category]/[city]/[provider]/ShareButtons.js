"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "../../../Toast";

export default function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // utilizatorul a anulat sau share nu a functionat — nu facem nimic
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("Link copiat");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Nu am putut copia linkul", "error");
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="share-row">
      <span className="share-label">Distribuie:</span>

      <a href={whatsappHref} target="_blank" rel="noreferrer" className="share-btn" aria-label="Distribuie pe WhatsApp" title="WhatsApp">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.26.86 5.82 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24a8.2 8.2 0 0 1-4.17-1.14l-.3-.17-3.12.82.83-3.04-.2-.32a8.18 8.18 0 0 1-1.25-4.37c0-4.54 3.7-8.24 8.24-8.24M8.53 6.6c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.72 4.2 3.71 2.08.83 2.5.66 2.95.62.45-.04 1.46-.6 1.66-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.46-.28-.24-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.24-.64.8-.78.97-.14.16-.29.18-.53.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.01-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.56-1.36-.77-1.86-.2-.48-.4-.42-.56-.43-.14-.01-.3-.01-.46-.01Z"/></svg>
      </a>

      <a href={facebookHref} target="_blank" rel="noreferrer" className="share-btn" aria-label="Distribuie pe Facebook" title="Facebook">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.46 1.49-1.46H16.5V4.32C16.15 4.27 15.02 4.17 13.7 4.17c-2.77 0-4.67 1.69-4.67 4.79v2.55H6.5v3h2.53V21h4.47Z"/></svg>
      </a>

      <button onClick={copyLink} className="share-btn" aria-label="Copiază linkul" title="Copiază linkul">
        {copied ? <Check size={16} strokeWidth={2.4} /> : <Copy size={15} strokeWidth={2.2} />}
      </button>

      {canNativeShare && (
        <button onClick={nativeShare} className="share-btn" aria-label="Mai multe opțiuni de distribuire" title="Mai multe opțiuni">
          <Share2 size={15} strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}
