import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: "B-CSV | Corporate Data Intelligence",
  description:
    "Busca-CSV é a plataforma de busca inteligente e análise de dados corporativos inspirada no design Dell Technologies."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="bg-codex-cloud">
      <body className="min-h-screen bg-gradient-to-br from-white via-codex-cloud to-white text-codex-navy antialiased">
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}