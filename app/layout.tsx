import type { Metadata } from "next";
import "./game.css";
import "./auth.css";

export const metadata: Metadata = {
  title: "Kelime Teneffüsü | Keşfet, bul, kapış",
  description: "16 dünya, 96 bölüm. Türkçe kelime bulmacaları, günlük keşifler ve 120 saniyelik canlı düellolar.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
