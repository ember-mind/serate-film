import type { Metadata } from "next";
import { Bricolage_Grotesque, Spline_Sans, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["wdth"],
});

const spline = Spline_Sans({
  variable: "--font-spline",
  subsets: ["latin"],
});

const splineMono = Spline_Sans_Mono({
  variable: "--font-spline-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Serate Film",
  description: "Il cinema club del gruppo: watchlist, sondaggi e storico delle serate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${bricolage.variable} ${spline.variable} ${splineMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
