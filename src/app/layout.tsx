import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ludoteca Chilena — Archivo histórico del juego de mesa chileno",
    template: "%s | Ludoteca Chilena",
  },
  description:
    "Plataforma de archivo histórico digital dedicada a preservar, organizar y difundir el patrimonio lúdico de Chile. Más de 130 juegos de mesa chilenos documentados.",
  keywords: [
    "juegos de mesa chilenos",
    "board games chile",
    "ludoteca",
    "patrimonio lúdico",
    "juegos de mesa",
    "archivo histórico",
  ],
  authors: [{ name: "Anatida.tech" }],
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://ludotecachilena.cl",
    siteName: "Ludoteca Chilena",
    title: "Ludoteca Chilena — Archivo histórico del juego de mesa chileno",
    description:
      "Preservando el patrimonio lúdico de Chile. Más de 130 juegos de mesa documentados.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
