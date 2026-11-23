import Link from 'next/link'
import {
  ArrowRight,
  BriefcaseBusiness,
  Download,
  FileText,
  Languages,
  LayoutTemplate,
  ListChecks,
  Mail,
  MonitorSmartphone,
  Play,
  Send,
} from 'lucide-react'
import { LogoMark } from '@/components/brand/logo'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { ThemeToggleButton } from '@/components/theme/theme-toggle'
import { CVThumbnail } from '@/components/cv/cv-thumbnail'
import { SAMPLE_CV } from '@/components/cv/templates'
import type { CVTemplate } from '@/types/cv'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#templates', label: 'Templates' },
]

const features = [
  {
    icon: LayoutTemplate,
    title: 'Live A4 preview',
    copy: 'The form and live preview stay side by side, so every change has visible context.',
    tone: 'bg-brand-500 text-white',
  },
  {
    icon: Download,
    title: 'Print-ready PDF',
    copy: 'A4 layout with selectable text, so applicant tracking systems can read every line.',
    tone: 'bg-blush text-ink',
  },
  {
    icon: ListChecks,
    title: 'Application pipeline',
    copy: 'Move each job through applied, screening, interview, offer, accepted or rejected.',
    tone: 'bg-ink text-white',
  },
  {
    icon: Mail,
    title: 'Cover letters',
    copy: 'Write a letter for each job from a formal, professional, short email or creative starting point.',
    tone: 'bg-ink text-white',
  },
  {
    icon: Languages,
    title: 'English or Indonesian',
    copy: 'Each CV is written in English or Indonesian, and headings, months and "Present" follow that choice.',
    tone: 'bg-brand-500 text-white',
  },
  {
    icon: MonitorSmartphone,
    title: 'Light and dark, on any screen',
    copy: 'Works on your phone and laptop, in light or dark mode. Your CV preview always stays white like the PDF.',
    tone: 'bg-blush text-ink',
  },
]

const workflow = [
  {
    title: 'Write the CV once',
    copy: 'Fill in contact details, experience, projects and skills section by section. The A4 preview updates as you type.',
  },
  {
    title: 'Pick the language and the format',
    copy: 'Switch between ATS Clean, Professional and Modern without retyping anything.',
  },
  {
    title: 'Record where it went',
    copy: 'Log the company, role, posting link and the CV version you sent, then move it through screening, interview and offer.',
  },
]

const templates: { id: CVTemplate; name: string; use: string; layout: string }[] = [
  { id: 'ats', name: 'ATS Clean', use: 'Applying through job portals and applicant tracking systems.', layout: 'Single column, plain headings, no photo.' },
  { id: 'professional', name: 'Professional', use: 'Formal roles where a reviewer reads the printed page.', layout: 'Section labels in a left column, serif type.' },
  { id: 'modern', name: 'Modern', use: 'Design, product and digital roles.', layout: 'Sidebar for contact and skills, optional photo.' },
]

// Decorative sample rows for the hero; not real data.
const sampleApplications = [
  { company: 'Tokopedia', initial: 'T', status: 'Interview', progress: 'w-3/5', bar: 'bg-brand-500', dot: 'bg-emerald-500 text-white' },
  { company: 'Gojek', initial: 'G', status: 'Screening', progress: 'w-2/5', bar: 'bg-amber-400', dot: 'bg-ink text-white' },
  { company: 'Traveloka', initial: 'T', status: 'Offer', progress: 'w-4/5', bar: 'bg-blush-strong', dot: 'bg-sky-500 text-white' },
]

const weeklyBars = [38, 62, 30, 80, 54, 92, 46, 70, 34, 88, 58, 76, 40, 66, 28, 84, 50, 72]

function Watermark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="pointer-events-none absolute left-1/2 top-[-14rem] -z-10 h-[78rem] w-[78rem] -translate-x-1/2 text-slate-900 opacity-[0.035]">
      <g fill="currentColor">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <ellipse key={angle} cx="16" cy="7.6" rx="4.3" ry="7.1" transform={`rotate(${angle} 16 16)`} />
        ))}
      </g>
    </svg>
  )
}

function HeroDecorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block" data-no-translate>
      {/* A CV sheet stuck on like a sticker */}
      <div className="float-slow absolute right-[9%] top-[4%] rotate-[9deg] rounded-xl bg-white p-1.5 shadow-[0_18px_40px_-16px_rgba(24,24,27,0.45)]">
        <CVThumbnail cv={{ ...SAMPLE_CV, template: 'modern' }} className="w-24" />
      </div>

      {/* Briefcase tile */}
      <div className="float-slower absolute left-[11%] top-[14%] flex h-20 w-20 -rotate-12 items-center justify-center rounded-[26px] bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700 text-white shadow-[0_18px_40px_-14px_rgba(118,81,234,0.7)]">
        <BriefcaseBusiness className="h-9 w-9" strokeWidth={1.8} />
      </div>

      {/* Stacked application rows */}
      <div className="float-slower absolute bottom-[12%] left-[3%] w-72 -rotate-[7deg] space-y-[-10px]">
        {sampleApplications.map((app, index) => (
          <div
            key={app.company}
            className="relative flex items-center gap-3 rounded-full bg-white py-2.5 pl-2.5 pr-3 shadow-[0_10px_30px_-12px_rgba(24,24,27,0.35)]"
            style={{ marginLeft: index * 14, zIndex: 3 - index }}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold ${app.dot}`}>{app.initial}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-zinc-900">{app.company}</span>
              <span className="mt-1.5 block h-1.5 rounded-full bg-zinc-100">
                <span className={`block h-full rounded-full ${app.bar} ${app.progress}`} />
              </span>
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-700">{app.status}</span>
          </div>
        ))}
      </div>

      {/* Applications per week */}
      <div className="float-slow absolute bottom-[16%] right-[3%] flex w-80 rotate-[8deg] items-center gap-4 rounded-[28px] bg-white p-4 shadow-[0_18px_40px_-16px_rgba(24,24,27,0.4)]">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-zinc-500">Applications this month</p>
          <div className="mt-2 flex h-12 items-end gap-[3px]">
            {weeklyBars.map((height, index) => (
              <span key={index} className={`w-1.5 rounded-full ${index % 5 === 3 ? 'bg-blush-strong' : 'bg-brand-400'}`} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_8px_20px_-6px_rgba(118,81,234,0.8)]">
          <Send className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
}

/** The dark "now playing" style card: the CV you are about to send. */
function CurrentCVCard() {
  return (
    <div aria-hidden="true" data-no-translate className="relative z-10 mx-auto flex w-full max-w-sm items-center gap-3 rounded-[26px] bg-ink p-3 pr-4 text-white shadow-[0_24px_50px_-20px_rgba(24,24,27,0.7)]">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blush text-ink">
        <FileText className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-[15px] font-semibold">Frontend Engineer CV</span>
        <span className="block text-[11px] text-white/60">ATS Clean · version 3</span>
        <span className="mt-2 block h-1.5 rounded-full bg-white/15">
          <span className="block h-full w-3/4 rounded-full bg-gradient-to-r from-brand-400 to-blush-strong" />
        </span>
      </span>
      <span className="flex flex-col items-end gap-1 text-[11px] text-white/70">
        <Download className="h-4 w-4 text-white" />
        PDF
      </span>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip text-slate-900">
      <Watermark />

      <header className="sticky top-3 z-40 px-3 sm:top-4">
        {/* The pill is always ink; `dark` flips the language and theme controls to their light-on-dark look. */}
        <div className="dark mx-auto flex h-14 w-fit max-w-full items-center gap-1 rounded-full bg-ink py-1.5 pl-2.5 pr-1.5 shadow-[0_12px_30px_-12px_rgba(24,24,27,0.6)] sm:gap-2">
          <Link href="/" aria-label="CV Tracker home" className="mr-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
            <LogoMark className="h-9 w-9" />
          </Link>
          <nav aria-label="Main" className="hidden items-center md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="rounded-full px-3 py-2 text-[13px] font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white">
                {link.label}
              </a>
            ))}
            <Link href="/login" className="rounded-full px-3 py-2 text-[13px] font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white">
              Sign in
            </Link>
          </nav>
          <LanguageSwitcher compact />
          <ThemeToggleButton className="h-9 w-9 hover:bg-white/10" />
          <Link href="/login" className="rounded-full px-2.5 py-2 text-[13px] font-medium text-white/85 hover:text-white md:hidden">
            Sign in
          </Link>
          <Link
            href="/register"
            className="font-display inline-flex h-11 items-center rounded-full bg-blush px-5 text-[13px] font-semibold text-ink transition-colors hover:bg-blush-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Get started
          </Link>
        </div>
      </header>

      <main>
        <section className="relative px-4 pb-28 pt-16 sm:pt-24 lg:pb-40">
          <HeroDecorations />
          <div className="relative mx-auto max-w-4xl text-center">
            <h1 className="font-heading text-[clamp(2.6rem,8vw,5.75rem)] font-black leading-[1.02] text-slate-900">
              <span className="text-sticker block">Your Personal CV</span>
              <span className="text-sticker block text-brand-500">&amp; Job Tracker –</span>
              <span className="mt-3 block">
                <span className="ink-label">
                  <span>Land the </span>
                  <span className="text-hollow">Offer</span>
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-lg text-base font-medium leading-7 text-slate-700 sm:text-lg">
              Write a focused CV, export it as a clean PDF, and keep a useful record of where you sent it.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 min-[420px]:flex-row">
              <a
                href="#how-it-works"
                className="font-display inline-flex h-12 items-center gap-2 rounded-full border-2 border-slate-900 bg-surface/60 px-6 text-sm font-semibold text-slate-900 transition-colors hover:bg-surface"
              >
                See how it works
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              </a>
              <Link
                href="/register"
                className="font-display inline-flex h-12 items-center gap-2 rounded-full bg-brand-600 px-7 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(118,81,234,0.9)] transition-colors hover:bg-brand-700"
              >
                Create a free account
              </Link>
            </div>
            <div className="mt-14 lg:mt-20">
              <CurrentCVCard />
            </div>
          </div>
        </section>

        {/* Everything below sits on one white sheet that slides over the grey page. */}
        <div className="relative rounded-t-[40px] bg-surface shadow-[0_-12px_40px_-24px_rgba(24,24,27,0.25)] sm:rounded-t-[56px]">
          <section id="features" aria-labelledby="features-title" className="scroll-mt-24 px-4 pt-16 sm:px-8 sm:pt-24">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
              <h2 id="features-title" className="font-heading text-[clamp(2.1rem,5vw,3.6rem)] font-black leading-[1.05] text-slate-900">
                <span>Everything your job search needs, in </span>
                <span className="tag-label">one tracker</span>
              </h2>
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex -space-x-2" aria-hidden="true" data-no-translate>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-surface bg-brand-500 font-heading text-sm font-bold text-white">3</span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-surface bg-blush font-heading text-sm font-bold text-ink">6</span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-surface bg-ink font-heading text-sm font-bold text-white">2</span>
                  </span>
                  <p className="font-heading text-lg font-bold leading-6 text-slate-900">
                    <span>templates · stages · languages</span>
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Three CV templates, six application stages and two languages, from blank page to follow-up. No spreadsheets required.
                </p>
              </div>
            </div>

            <ul className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, copy, tone }) => (
                <li key={title} className="group rounded-[28px] border border-slate-200/80 bg-slate-50 p-6 transition-transform duration-200 hover:-translate-y-1">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone} transition-transform duration-200 group-hover:-rotate-6`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{copy}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-24 px-4 pt-20 sm:px-8 sm:pt-28">
            <div className="mx-auto max-w-6xl">
              <h2 id="how-title" className="font-heading text-[clamp(2rem,4.5vw,3.2rem)] font-black leading-[1.05] text-slate-900">
                <span>From blank page </span>
                <span className="text-brand-500">to follow-up</span>
              </h2>
              <ol className="mt-10 grid gap-4 md:grid-cols-3">
                {workflow.map((step, index) => (
                  <li key={step.title} className={`rounded-[28px] p-7 ${index === 1 ? 'bg-ink text-white' : 'border border-slate-200/80 bg-surface'}`}>
                    <span className={`font-heading text-5xl font-black ${index === 1 ? 'text-blush' : 'text-brand-500'}`} data-no-translate>
                      0{index + 1}
                    </span>
                    <h3 className={`mt-4 text-lg font-semibold ${index === 1 ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
                    <p className={`mt-2 text-sm leading-6 ${index === 1 ? 'text-white/70' : 'text-slate-600'}`}>{step.copy}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section id="templates" aria-labelledby="templates-title" className="scroll-mt-24 px-4 pt-20 sm:px-8 sm:pt-28">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <h2 id="templates-title" className="font-heading text-[clamp(2rem,4.5vw,3.2rem)] font-black leading-[1.05] text-slate-900">
                  <span>Three templates, </span>
                  <span className="ink-label">one set of content</span>
                </h2>
                <p className="max-w-sm text-sm leading-6 text-slate-600">
                  Changing the template never changes what you wrote. Duplicate a CV when you want a different version for a different role.
                </p>
              </div>
              <ul className="mt-10 grid gap-4 md:grid-cols-3">
                {templates.map((template, index) => (
                  <li key={template.id} className="rounded-[28px] border border-slate-200/80 bg-slate-50 p-5">
                    <div className={`flex justify-center rounded-[22px] py-8 ${['bg-brand-100', 'bg-blush/40', 'bg-slate-200/70'][index]}`}>
                      <div className={`rounded-lg bg-white p-1 shadow-[0_16px_30px_-16px_rgba(24,24,27,0.5)] ${['-rotate-3', 'rotate-2', '-rotate-2'][index]}`}>
                        <CVThumbnail cv={{ ...SAMPLE_CV, template: template.id }} className="w-32" />
                      </div>
                    </div>
                    <h3 className="mt-5 font-heading text-xl font-bold text-slate-900" data-no-translate>
                      {template.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-700">{template.use}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{template.layout}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="px-4 pb-10 pt-20 sm:px-8 sm:pt-28">
            <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 overflow-hidden rounded-[36px] bg-ink px-8 py-12 sm:px-14 md:flex-row md:items-center md:justify-between">
              <LogoMark className="pointer-events-none absolute -bottom-28 right-[30%] h-72 w-72 rotate-12 opacity-15" />
              <h2 className="relative max-w-xl font-heading text-[clamp(1.9rem,4vw,3rem)] font-black leading-[1.08] text-white">
                <span>Start with your most recent job. </span>
                <span className="text-blush">The rest can wait.</span>
              </h2>
              <Link
                href="/register"
                className="font-display relative inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-blush px-7 text-sm font-semibold text-ink transition-colors hover:bg-blush-strong"
              >
                Create a free account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          <footer className="px-4 pb-8 sm:px-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-slate-200/70 pt-6 text-sm text-slate-500 sm:flex-row sm:justify-between">
              <p className="flex items-center gap-2">
                <LogoMark className="h-5 w-5" />
                <span>© {new Date().getFullYear()} CV Tracker</span>
              </p>
              <nav aria-label="Footer" className="flex gap-5">
                <Link href="/login" className="hover:text-slate-900">Sign in</Link>
                <Link href="/register" className="hover:text-slate-900">Create account</Link>
              </nav>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
