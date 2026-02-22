import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#131316",
};

export const metadata: Metadata = {
  title: "Simulação de Investimento Imobiliário em Aveiro | Silvermont Capital",
  description:
    "Simulação conservadora de investimento imobiliário residencial em Aveiro. Concebida para investidores racionais que procuram resultados plausíveis.",
  keywords: [
    "investimento imobiliário",
    "Aveiro",
    "simulação",
    "investimento residencial",
    "Silvermont Capital",
  ],
  robots: "index, follow",
  openGraph: {
    title:
      "Simulação de Investimento Imobiliário em Aveiro | Silvermont Capital",
    description:
      "Simulação conservadora de investimento imobiliário residencial em Aveiro.",
    type: "website",
    locale: "pt_PT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <head>
        {/* Facebook Pixel – replace YOUR_PIXEL_ID */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', 'YOUR_PIXEL_ID');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body className={inter.variable}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
