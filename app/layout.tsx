import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EPO Smart Campus",
  description:
    "Supervision, optimisation énergétique et aide à la décision pour le campus de l'École Polytechnique de Ouagadougou.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
