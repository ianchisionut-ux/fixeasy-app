"use client";

import { Share2 } from "lucide-react";
import { toast } from "./Toast";

export default function CardShareButton({ url, title }) {
  async function share(e) {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
      } catch {
        // anulat de utilizator — nu facem nimic
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      toast("Link copiat — gata de distribuit");
    } catch {
      toast("Nu am putut copia linkul", "error");
    }
  }

  return (
    <button onClick={share} className="card-share-btn" aria-label="Distribuie acest profil" title="Distribuie">
      <Share2 size={14} strokeWidth={2.2} />
    </button>
  );
}
