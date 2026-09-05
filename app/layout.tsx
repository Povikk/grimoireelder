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
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('elderwood-house-theme');if(!['aerwyn','brumval','falcon','venatrix'].includes(t))t='falcon';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='falcon'}setTimeout(function(){document.documentElement.classList.add('grimoire-ready')},1800)})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
