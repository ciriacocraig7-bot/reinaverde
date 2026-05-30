import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { GrainOverlay } from "@/components/marketing/grain-overlay";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reina Verde — Casa de catering, bienestar y nutrición",
  description:
    "Tres divisiones, una sola casa colombiana: catering corporativo, fito-bienestar y frutas liofilizadas. Pedido, pago y logística en un solo flujo.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Reina Verde",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D1B12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans selection:bg-ink selection:text-cream">
        <GrainOverlay />
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "!bg-ink !text-cream !border-ink/10 !font-sans !rounded-none !shadow-paper",
            },
          }}
        />
      </body>
    </html>
  );
}
