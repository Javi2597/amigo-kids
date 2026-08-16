import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import { SettingsProvider } from "@/lib/settings";
import FloatingTino from "@/components/FloatingTino";
import TimeLimitGate from "@/components/TimeLimitGate";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-rounded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Amigo Kids",
  description:
    "Asistente de voz amigable para niños de 3 a 12 años: aprende, juega y organiza tus rutinas del día a día.",
  manifest: "/manifest.webmanifest",
  applicationName: "Amigo Kids",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Amigo Kids",
  },
  formatDetection: {
    telephone: false,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FFF8F1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${fredoka.variable} font-rounded`}>
        <SettingsProvider>
          <ErrorBoundary>
            {children}
            <TimeLimitGate />
            <FloatingTino />
          </ErrorBoundary>
        </SettingsProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}) });`,
          }}
        />
      </body>
    </html>
  );
}