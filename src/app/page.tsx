import Link from 'next/link'
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Download,
  FileText,
  LayoutTemplate,
} from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { Button } from '@/components/ui/button'

const workflow = [
  {
    number: '01',
    title: 'Add the details that matter.',
    copy: 'Work section by section, without fighting a word processor.',
  },
  {
    number: '02',
    title: 'Pick a format for the role.',
    copy: 'Use ATS for simple parsing, Professional for formal roles, or Modern for a stronger visual hierarchy.',
  },
  {
    number: '03',
    title: 'Export and keep the context.',
    copy: 'Download the PDF, then record the company, role, status, link, and CV version you sent.',
  },
]

const features = [
  {
    icon: LayoutTemplate,
    title: 'Edit without losing the overview',
    copy: 'The form and live preview stay side by side, so every change has visible context.',
  },
  {
    icon: FileText,
    title: 'Know which CV went where',
    copy: 'Attach a CV version to each application instead of guessing later.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'See the next follow-up',
    copy: 'Filter applications by stage and keep interview notes beside the job link.',
  },
]

const templates = [
  { code: '01', name: 'ATS', label: 'Single column', note: 'Easy to scan and parse' },
  { code: '02', name: 'Professional', label: 'Formal hierarchy', note: 'Clear sections for traditional roles' },
  { code: '03', name: 'Modern', label: 'Structured sidebar', note: 'A bolder layout for digital roles' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f3ed] text-stone-950">
      <header className="sticky top-0 z-40 border-b border-stone-300 bg-[#f5f3ed]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-4 sm:px-6">
          <Link href="/" className="mr-auto flex items-center gap-2 text-base font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            CV Tracker
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex" aria-label="Primary navigation">
            <a href="#how-it-works" className="hover:text-blue-800">How It Works</a>
            <a href="#features" className="hover:text-blue-800">Features</a>
            <a href="#templates" className="hover:text-blue-800">Templates</a>
          </nav>

          <LanguageSwitcher compact />
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/register" className="hidden min-[430px]:block">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-stone-300">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-7 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-800">
                A calmer way to run your job search.
              </p>
              <h1 className="max-w-4xl text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-stone-950 min-[430px]:text-5xl sm:text-6xl lg:text-7xl">
                One CV workspace. Every application in view.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-stone-600">
                Write a focused CV, export it as a clean PDF, and keep a useful record of where you sent it.
                <span className="text-stone-950"> No spreadsheets required.</span>
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Create CV <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Track Applications
                  </Button>
                </Link>
              </div>
            </div>

            <div className="border-t-2 border-blue-600 bg-[#fffefa]">
              <div className="flex items-center justify-between border-b border-stone-300 px-5 py-4">
                <span className="font-mono text-xs uppercase tracking-widest text-stone-500">Current file</span>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-950">Ready</span>
              </div>
              <div className="p-6" data-no-translate>
                <div className="mb-6 border-b border-stone-300 pb-5">
                  <p className="text-2xl font-bold tracking-tight">Nadia Putri</p>
                  <p className="mt-1 text-sm text-stone-600">Product Designer · Jakarta</p>
                </div>
                <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-blue-800">Experience</p>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">Senior Product Designer</p>
                    <p className="text-sm text-stone-600">Aruna Labs</p>
                  </div>
                  <p className="font-mono text-xs text-stone-500">2023—Now</p>
                </div>
                <div className="mt-7 flex items-center justify-between border-t border-stone-300 pt-4 text-sm">
                  <span className="inline-flex items-center gap-2 text-stone-600">
                    <Check className="h-4 w-4 text-blue-700" aria-hidden="true" /> ATS checked
                  </span>
                  <span className="inline-flex items-center gap-2 font-semibold text-blue-800">
                    <Download className="h-4 w-4" aria-hidden="true" /> PDF
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl border-x border-t border-stone-300 bg-[#fffefa] sm:grid-cols-3">
            {[
              ['Three CV formats', 'ATS, professional, and modern'],
              ['Print-ready PDF', 'A4 layout with selectable text'],
              ['Application history', 'CV version, notes, and status together'],
            ].map(([title, copy], index) => (
              <div key={title} className={`p-5 ${index ? 'border-t border-stone-300 sm:border-l sm:border-t-0' : ''}`}>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm text-stone-500">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-b border-stone-300 bg-[#fffefa]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mb-12 grid gap-4 md:grid-cols-2 md:items-end">
              <h2 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">From blank page to follow-up</h2>
              <p className="max-w-md text-stone-600 md:justify-self-end">One short workflow for writing the CV and keeping track after you send it.</p>
            </div>
            <ol className="grid border-y border-stone-300 md:grid-cols-3">
              {workflow.map((step, index) => (
                <li key={step.number} className={`py-7 md:px-7 ${index ? 'border-t border-stone-300 md:border-l md:border-t-0' : ''}`}>
                  <span className="font-mono text-sm text-blue-700">{step.number}</span>
                  <h3 className="mt-12 text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{step.copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="border-b border-stone-300">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-800">Built around the actual work</p>
            <div className="mt-9 grid gap-px overflow-hidden border border-stone-300 bg-stone-300 md:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="bg-[#f5f3ed] p-7">
                  <feature.icon className="h-5 w-5 text-blue-800" strokeWidth={1.75} aria-hidden="true" />
                  <h2 className="mt-14 text-xl font-semibold tracking-tight">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{feature.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="templates" className="border-b border-stone-300 bg-[#fffefa]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Choose a starting point</h2>
              <p className="mt-3 text-stone-600">The content stays yours. The format can change when the role does.</p>
            </div>
            <div className="divide-y divide-stone-300 border-y border-stone-300">
              {templates.map((template) => (
                <div key={template.name} className="grid gap-3 py-5 sm:grid-cols-[4rem_1fr_1fr_1fr] sm:items-center">
                  <span className="font-mono text-xs text-stone-400">{template.code}</span>
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                  <p className="text-sm font-medium text-stone-700">{template.label}</p>
                  <p className="text-sm text-stone-500">{template.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-blue-700 text-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="max-w-3xl text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Start with the CV. Keep the search organized after that.</h2>
              <p className="mt-3 text-blue-100">Create a free workspace and build your first CV.</p>
            </div>
            <Link href="/register">
              <Button size="lg" className="border-white bg-white text-slate-950 hover:bg-blue-100">
                Create Your CV <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#fffefa]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="font-semibold text-stone-800">CV Tracker</span>
          <span>© {new Date().getFullYear()} CV Tracker</span>
        </div>
      </footer>
    </div>
  )
}
