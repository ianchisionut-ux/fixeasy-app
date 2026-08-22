import "./globals.css";

export const metadata = {
  title: "FixEasy — meseriași verificați, programare rapidă",
  description: "Marketplace pentru instalatori, electricieni și mecanici auto, cu programări online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
