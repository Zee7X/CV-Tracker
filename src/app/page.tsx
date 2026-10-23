import Link from 'next/link'
import { Logo, LogoMark } from '@/components/brand/logo'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { ButtonLink } from '@/components/ui/button-link'
import { AtsTemplate, SAMPLE_CV } from '@/components/cv/templates'

const workflow = [
  {
    title: 'Write the CV once',
    copy: 'Fill in contact details, experience, projects and skills section by section. The A4 preview updates as you type.',
  },
  {
    title: 'Pick the language and the format',
    copy: 'Each CV is written in English or Indonesian, and headings, months and "Present" follow that choice. Switch between ATS Clean, Professional and Modern without retyping anything.',
  },
  {
    title: 'Record where it went',
    copy: 'Log the company, role, posting link and the CV version you sent, then move it through screening, interview and offer.',
  },
]

const templates = [
  { name: 'ATS Clean', use: 'Applying through job portals and applicant tracking systems.', layout: 'Single column, plain headings, no photo.' },
  { name: 'Professional', use: 'Formal roles where a reviewer reads the printed page.', layout: 'Section labels in a left column, serif type.' },
  { name: 'Modern', use: 'Design, product and digital roles.', layout: 'Sidebar for contact and skills, optional photo.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden text-slate-900">
      <header className="sticky top-3 z-40 px-3 sm:px-5">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 rounded-full border border-slate-200/80 bg-white/90 px-4 shadow-xs backdrop-blur-md sm:px-6">
          <Logo className="mr-auto" />
          <LanguageSwitcher compact />
          <ButtonLink href="/login" variant="ghost" size="sm" className="rounded-full">
            Sign in
          </ButtonLink>
          <ButtonLink href="/register" size="sm" className="hidden rounded-full min-[400px]:inline-flex">
            Create account
          </ButtonLink>
        </div>
      </header>

      <main>
        <section>
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              <h1 className="font-display max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-slate-900 sm:text-[56px]">
                Write your CV, send it, and know which version went where.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                A CV editor with a live A4 preview and PDF export, plus a simple log of every job you applied to and the
                CV you used for it.
              </p>
              <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row">
                <ButtonLink href="/register" size="lg" className="rounded-full">
                  Create a free account
                </ButtonLink>
                <ButtonLink href="/login" variant="outline" size="lg" className="rounded-full">
                  Sign in
                </ButtonLink>
              </div>
            </div>

            <figure className="hidden lg:block">
              <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur-md">
                <div className="h-[540px] w-[420px] overflow-hidden rounded-[18px] bg-white shadow-xl">
                  <div className="w-[794px] origin-top-left scale-[0.529]" aria-hidden="true" data-no-translate>
                    <AtsTemplate cv={SAMPLE_CV} language="en" />
                  </div>
                </div>
              </div>
              <figcaption className="mt-3 text-sm text-slate-500">
                The ATS Clean template, rendered with sample data. Your PDF uses the same layout.
              </figcaption>
            </figure>
          </div>
        </section>

        <section aria-labelledby="workflow-title" className="px-3 sm:px-5">
          <div className="mx-auto grid max-w-6xl gap-10 rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-xs sm:p-12 md:grid-cols-[260px_minmax(0,1fr)]">
            <h2 id="workflow-title" className="text-2xl font-bold tracking-tight text-slate-900">
              How it fits into a job search
            </h2>
            <ol className="space-y-8">
              {workflow.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4">
                  <span className="orb flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums text-white">{index + 1}</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">{step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="templates-title">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 id="templates-title" className="text-2xl font-bold tracking-tight text-slate-900">
              Three templates, one set of content
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Changing the template never changes what you wrote. Duplicate a CV when you want a different version for a
              different role.
            </p>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500">
                    <th scope="col" className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Template</th>
                    <th scope="col" className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Good for</th>
                    <th scope="col" className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Layout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {templates.map((template) => (
                    <tr key={template.name} className="align-top hover:bg-slate-50/50">
                      <th scope="row" className="px-6 py-4 font-bold text-slate-900" data-no-translate>
                        {template.name}
                      </th>
                      <td className="px-6 py-4 text-slate-600">{template.use}</td>
                      <td className="px-6 py-4 text-slate-500">{template.layout}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="px-3 pb-14 sm:px-5">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-full border border-slate-200/80 bg-white px-6 py-5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="font-display text-base font-semibold text-slate-800">Start with your most recent job. The rest can wait.</p>
            <ButtonLink href="/register" size="lg" className="rounded-full">
              Create a free account
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-6">
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
  )
}
