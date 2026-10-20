import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { LanguageProvider } from '@/components/i18n/language-provider'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

// Headings, navigation and buttons, like the rounded geometric type in the reference design.
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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

// Runs before the first paint. When the saved UI language is Indonesian, the
// page is hidden until LanguageProvider has translated it (see globals.css).
const LANGUAGE_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem('cv-tracker-language');var id=s?s==='id':(navigator.language||'').toLowerCase().indexOf('id')===0;if(id){var d=document.documentElement;d.lang='id';d.setAttribute('data-i18n-pending','');setTimeout(function(){d.removeAttribute('data-i18n-pending')},1000)}}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // Lets Next turn smooth scrolling off during route changes so a new page starts at the top instantly.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANGUAGE_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
