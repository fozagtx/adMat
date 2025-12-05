import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sora Video Studio - AI-Powered Video Generation",
  description: "Transform your ideas into stunning videos with AI-powered generation. Create cinematic, realistic, and artistic videos from simple text prompts using SoraV2 technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
