import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolarReno Previewer — Photorealistic Home Renovation MVP",
  description:
    "See high-definition 3D previews of solar panels and a swimming pool on a real Google Photorealistic 3D model of a home, with realistic sun positioning and shadows.",
  keywords: [
    "solar panels",
    "pool design",
    "3D home preview",
    "Google Photorealistic 3D Tiles",
    "CesiumJS",
    "home renovation",
  ],
  authors: [{ name: "SolarReno" }],
  openGraph: {
    title: "SolarReno Previewer",
    description:
      "Photorealistic 3D solar + pool previews on a real home with live sun & shadows.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-hidden bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
