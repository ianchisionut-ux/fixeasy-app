import "./globals.css";
import { Suspense } from "react";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import InstallPrompt from "./InstallPrompt";
import GoogleAnalytics from "./GoogleAnalytics";
import ToastContainer from "./Toast";

const SITE_URL = "https://fixeasy-app-pmcustoms.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FixEasy — profesioniști verificați, programare rapidă",
    template: "%s | FixEasy",
  },
  description: "Marketplace pentru instalații sanitare, electrice, amenajări, reparații electrocasnice și mecanici auto, cu programări online.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FixEasy",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: "FixEasy",
    title: "FixEasy — profesioniști verificați, programare rapidă",
    description: "Găsește instalatori, electricieni, tehnicieni și alți profesioniști verificați, aproape de tine. Programează online, fără telefoane.",
    url: SITE_URL,
    images: [{ url: "/hero-professionals.jpg", width: 1600, height: 893, alt: "Profesioniști FixEasy la lucru" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FixEasy — profesioniști verificați, programare rapidă",
    description: "Găsește profesioniști verificați, aproape de tine. Programează online, fără telefoane.",
    images: ["/hero-professionals.jpg"],
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  }),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B3552",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister />
        <InstallPrompt />
        <ToastContainer />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
