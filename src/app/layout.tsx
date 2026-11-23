import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter, Poppins } from 'next/font/google'
import { LanguageProvider } from '@/components/i18n/language-provider'
import { THEME_BOOT_SCRIPT, ThemeProvider } from '@/components/theme/theme-provider'
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

// Big page and section headings: a soft, heavy serif (variable, with the SOFT axis).
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['SOFT', 'opsz'],
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

// Colours the mobile browser bar to match the page in light and dark.
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ececef' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0c10' },
  ],
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
      className={`${inter.variable} ${poppins.variable} ${fraunces.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LANGUAGE_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
