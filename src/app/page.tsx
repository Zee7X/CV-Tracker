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
    <div className="min-h-screen overflow-x-hidden bg-[#f5f3ed] text-stone-950">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#f5f3ed]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Logo className="mr-auto" />
          <LanguageSwitcher compact />
          <ButtonLink href="/login" variant="ghost" size="sm">
            Sign in
          </ButtonLink>
          <ButtonLink href="/register" size="sm" className="hidden min-[400px]:inline-flex">
            Create account
          </ButtonLink>
        </div>
      </header>

      <main>
        <section className="border-b border-stone-300">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl">
                Write your CV, send it, and know which version went where.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
                A CV editor with a live A4 preview and PDF export, plus a simple log of every job you applied to and the
                CV you used for it.
              </p>
              <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row">
                <ButtonLink href="/register" size="lg">
                  Create a free account
                </ButtonLink>
                <ButtonLink href="/login" variant="outline" size="lg">
                  Sign in
                </ButtonLink>
              </div>
            </div>

            <figure className="hidden lg:block">
              <div className="h-[540px] w-[420px] overflow-hidden rounded-md bg-white shadow-[0_24px_48px_-20px_rgba(28,25,23,0.35)] ring-1 ring-stone-200">
                <div className="w-[794px] origin-top-left scale-[0.529]" aria-hidden="true" data-no-translate>
                  <AtsTemplate cv={SAMPLE_CV} language="en" />
                </div>
              </div>
              <figcaption className="mt-3 text-sm text-stone-500">
                The ATS Clean template, rendered with sample data. Your PDF uses the same layout.
              </figcaption>
            </figure>
          </div>
        </section>

        <section aria-labelledby="workflow-title" className="border-b border-stone-300 bg-[#fffefa]">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[260px_minmax(0,1fr)]">
            <h2 id="workflow-title" className="text-2xl font-semibold tracking-[-0.02em]">
              How it fits into a job search
            </h2>
            <ol className="space-y-8">
              {workflow.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3">
                  <span className="pt-0.5 text-sm font-semibold tabular-nums text-stone-400">{index + 1}.</span>
                  <div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-1.5 max-w-2xl leading-7 text-stone-600">{step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="templates-title" className="border-b border-stone-300">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 id="templates-title" className="text-2xl font-semibold tracking-[-0.02em]">
              Three templates, one set of content
            </h2>
            <p className="mt-2 max-w-2xl text-stone-600">
              Changing the template never changes what you wrote. Duplicate a CV when you want a different version for a
              different role.
            </p>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-400 text-stone-500">
                    <th scope="col" className="py-2 pr-4 font-medium">Template</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Good for</th>
                    <th scope="col" className="py-2 font-medium">Layout</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.name} className="border-b border-stone-300 align-top">
                      <th scope="row" className="py-4 pr-4 font-semibold text-stone-950" data-no-translate>
                        {template.name}
                      </th>
                      <td className="py-4 pr-4 text-stone-700">{template.use}</td>
                      <td className="py-4 text-stone-600">{template.layout}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-lg font-medium">Start with your most recent job. The rest can wait.</p>
          <ButtonLink href="/register" size="lg">
            Create a free account
          </ButtonLink>
        </section>
      </main>

      <footer className="border-t border-stone-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-stone-500 sm:flex-row sm:justify-between sm:px-6">
          <p className="flex items-center gap-2">
            <LogoMark className="h-5 w-5" />
            <span>© {new Date().getFullYear()} CV Tracker</span>
          </p>
          <nav aria-label="Footer" className="flex gap-5">
            <Link href="/login" className="hover:text-stone-950">Sign in</Link>
            <Link href="/register" className="hover:text-stone-950">Create account</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
