import type { Metadata } from "next";
import "./game.css";
import "./auth.css";
import "./studio.css";
import "./discovery.css";
import "./quality.css";
import "./start.css";
import "./releases.css";
import "./mobile-game.css";
import "./playful-studio.css";
import "./atlas-adventure.css";
import "./crafted-play.css";
import "./word-access.css";

export const viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#f7f7ef'};

export const metadata: Metadata = {
  metadataBase: new URL("https://kelime-teneffusu.healica.chatgpt.site"),
  title: "Kelime Teneffüsü | Keşfet, bul, kapış",
  description: "16 dünya, özel keşif rotaları, Gizli Tema ve arkadaşlarınla gerçek kelime düelloları. Merakına bir teneffüs.",
  alternates: {canonical:"/"},
  openGraph: {title:"Kelime Teneffüsü",description:"Keşfet. Bul. Arkadaşlarınla kapış.",locale:"tr_TR",type:"website",images:[{url:"/share-card.png",width:1200,height:630,alt:"Kelime Teneffüsü: merakına bir teneffüs."}]},
  twitter: {card:"summary_large_image",title:"Kelime Teneffüsü",images:["/share-card.png"]},
  manifest: "/manifest.webmanifest",
  appleWebApp: {capable:true,title:"Kelime Teneffüsü",statusBarStyle:"default"},
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon-192.png",
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
