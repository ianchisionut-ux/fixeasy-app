export default function manifest() {
  return {
    name: "FixEasy — profesioniști verificați, programare rapidă",
    short_name: "FixEasy",
    description: "Marketplace pentru instalatori, electricieni și mecanici auto, cu programări online.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F3F8FB",
    theme_color: "#0B3552",
    lang: "ro",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
