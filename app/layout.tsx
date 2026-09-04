import type { Metadata } from 'next';
import './globals.css';
import './rules.css';
import './lore.css';
import './enhancements.css';
import './school.css';
export const metadata: Metadata = {
  title: 'Elderwood · Grimoire privé',
  description:
    'Carnet local de personnages, lieux, connaissances et projets RP.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body>{children}</body>
    </html>
  );
}
