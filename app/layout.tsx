import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetaForge — Metadata & PWA Asset Studio",
  description:
    "Generate Next.js metadata, site manifests, and responsive favicon/PWA assets from a single source of truth.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-neutral-900 text-zinc-100 antialiased">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-gradient-to-br from-fuchsia-600/30 via-sky-500/20 to-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-gradient-to-tr from-sky-600/20 via-fuchsia-500/10 to-amber-500/10 blur-3xl" />
        </div>
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
