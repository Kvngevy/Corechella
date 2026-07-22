import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CORECHELLA_THEME, CORECHELLA_ABOUT } from "@/lib/data";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: `Corechella — ${CORECHELLA_THEME}`,
  description: CORECHELLA_ABOUT,
  icons: {
    icon: images.hero,
    apple: images.hero,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="relative min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <div className="relative z-10 flex min-h-full flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
