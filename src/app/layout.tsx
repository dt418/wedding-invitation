import type { Metadata } from "next";
import { Cormorant_Infant, Plus_Jakarta_Sans, Great_Vibes } from "next/font/google";
import { ScrollRevealScript } from "@/components/scroll-reveal";
import "./globals.css";

const cormorantInfant = Cormorant_Infant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wedding Invitation | Create Beautiful Digital Invitations",
  description:
    "Design stunning digital wedding invitations with beautiful templates. Import guests, track RSVPs, and share easily with your loved ones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorantInfant.variable} ${plusJakarta.variable} ${greatVibes.variable}`}
    >
      <body className="min-h-full flex flex-col antialiased">
      <ScrollRevealScript />
      {children}
    </body>
    </html>
  );
}