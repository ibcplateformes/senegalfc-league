import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SenegalFC League - Ligue Sénégalaise EA Sports FC',
  description: 'Plateforme officielle de gestion de la Ligue Sénégalaise EA Sports FC. Classements, résultats et statistiques en temps réel.',
  keywords: ['sénégal', 'football', 'esport', 'ea sports fc', 'ligue', 'classement'],
  authors: [{ name: 'SenegalFC League' }],
  openGraph: {
    title: 'SenegalFC League',
    description: 'Ligue Sénégalaise EA Sports FC - Classements et résultats en temps réel',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SenegalFC League',
    description: 'Ligue Sénégalaise EA Sports FC',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}