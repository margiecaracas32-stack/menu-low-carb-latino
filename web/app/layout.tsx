import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Fraunces({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500"] });
const body = Source_Sans_3({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Menú Low Carb Latino | Tu semana resuelta",
  description: "Menús low carb familiares, lista de compras organizada y platos latinos cotidianos.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>;
}
