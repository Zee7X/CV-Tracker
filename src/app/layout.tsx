import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { LanguageProvider } from '@/components/i18n/language-provider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteName = 'CV Tracker'
const title = 'CV Tracker — Build your CV and track applications'
const description = 'Build a focused CV, export a clean PDF, and track every job application.'

export const metadata: Metadata = {
  // Needed so the file-based opengraph-image.png resolves to an absolute URL for scrapers.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cv-tracker-z.vercel.app'
  ),
  title,
  description,
  openGraph: { type: 'website', siteName, title, description },
  twitter: { card: 'summary_large_image', title, description },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
