import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecureVerify — Decentralized Certificate Verification",
  description:
    "Issue and verify academic certificates securely on the Polygon blockchain with IPFS storage. Tamper-proof, instant, and transparent.",
  keywords: [
    "blockchain",
    "certificate verification",
    "polygon",
    "IPFS",
    "decentralized",
    "academic credentials",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-surface-primary text-white">
        {/* Grid overlay background */}
        <div className="grid-overlay" />
        {children}
      </body>
    </html>
  );
}
