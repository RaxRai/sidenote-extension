import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SideNote",
  description:
    "A tiny Chrome extension for notes in the side panel. Export to Markdown or text; saves locally.",
  icons: {
    icon: [{ url: "/icon-128.png", type: "image/png", sizes: "128x128" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
