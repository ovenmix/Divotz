import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Divotz",
    template: "%s · Divotz",
  },
  description:
    "Run your golf club's tournaments, leagues, members and tee sheets - on your club's own site.",
};

export const viewport: Viewport = {
  // Light only. There is no user-selectable dark mode in Divotz; club colours
  // are the customization story, and they are handled per club.
  colorScheme: "light",
  themeColor: "#5E765A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
