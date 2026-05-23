import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TERRAFORM — Living Design Intelligence",
  description:
    "A living ecological intelligence system for Central Texas landscape architecture. Multi-agent AI orchestration for emotionally resonant outdoor spaces.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
