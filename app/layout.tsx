import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/shared/styles/global.css";

const inter = localFont({
  src: [
    {
      path: "../public/assets/fonts/Inter_24pt-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Inter_24pt-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Inter_24pt-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Inter_24pt-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Exine Test",
  description: "Slider with slug pages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @view-transition {
            navigation: auto;
          }
          
          img {
            image-rendering: crisp-edges;
            image-rendering: -webkit-optimize-contrast;
          }
        `}</style>
      </head>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
