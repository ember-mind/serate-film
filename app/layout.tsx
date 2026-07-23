import type { Metadata } from "next";
import { Cinzel, Spline_Sans, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
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
  description: "Il cinema club del gruppo: cartellone, votazioni e registro di sala.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${cinzel.variable} ${spline.variable} ${splineMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
