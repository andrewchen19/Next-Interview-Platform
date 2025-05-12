import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AceAhead",
  description: "An AI-powered platform for preparing for mock interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // guarantee only dark mode is applied
    <html lang="en" className="dark">
      {/* .className -> applied that font everywhere on the website */}
      <body className={`${monaSans.className} antialiased`}>{children}</body>
    </html>
  );
}
