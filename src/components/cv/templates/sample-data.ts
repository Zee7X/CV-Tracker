import type { CVWithRelations } from '@/types/cv'

/**
 * Deterministic full sample CV for live preview, testing, and empty-state guidance.
 */
export const SAMPLE_CV: CVWithRelations = {
  id: 'sample-cv-deterministic',
  user_id: 'sample-user-deterministic',
  name: 'Nadia Putri - Professional CV',
  template: 'modern',
  personal_info: {
    full_name: 'Nadia Putri',
    professional_title: 'Project & Operations Coordinator',
    email: 'nadia.putri@example.com',
    phone: '+62 812 3456 7890',
    location: 'Jakarta, Indonesia',
    linkedin: 'https://linkedin.com/in/nadia-putri',
    github: '',
    portfolio: 'https://nadiaputri.example.com',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
  },
  summary:
    'Organized and collaborative professional with 6+ years of experience coordinating projects, improving day-to-day operations, and supporting customers and internal teams. Known for clear communication, practical problem-solving, and delivering work on schedule.',
  skills: [
    'Project Coordination',
    'Stakeholder Communication',
    'Process Improvement',
    'Customer Service',
    'Data Analysis',
    'Microsoft Excel',
    'Google Workspace',
    'Budget Tracking',
    'Team Leadership',
    'Presentation',
    'Research',
    'Problem Solving',
  ],
  experiences: [
    {
      id: 'exp-1',
      cv_id: 'sample-cv-deterministic',
      company: 'Aruna Retail Group',
      position: 'Senior Operations Coordinator',
      location: 'Jakarta, Indonesia',
      start_date: '2022-03',
      end_date: null,
      is_current: true,
      description:
        'Coordinate weekly operations across four branches and prepare performance reports for management. Redesigned the purchase-request workflow, reducing average processing time by 28% while improving documentation accuracy.',
      sort_order: 1,
    },
    {
      id: 'exp-2',
      cv_id: 'sample-cv-deterministic',
      company: 'Nusantara Service Hub',
      position: 'Customer Experience Specialist',
      location: 'Bandung, Indonesia',
      start_date: '2019-06',
      end_date: '2022-02',
      is_current: false,
      description:
        'Handled customer cases across email, phone, and in-person channels, maintaining a 95% satisfaction score. Created a shared knowledge guide that shortened onboarding for new team members by two weeks.',
      sort_order: 2,
    },
    {
      id: 'exp-3',
      cv_id: 'sample-cv-deterministic',
      company: 'Mitra Karya Foundation',
      position: 'Program Assistant',
      location: 'Yogyakarta, Indonesia',
      start_date: '2017-08',
      end_date: '2019-05',
      is_current: false,
      description:
        'Supported community training programs for more than 300 participants, including scheduling, vendor coordination, attendance records, and post-event evaluation.',
      sort_order: 3,
    },
  ],
  educations: [
    {
      id: 'edu-1',
      cv_id: 'sample-cv-deterministic',
      institution: 'Universitas Negeri Jakarta',
      degree: 'Bachelor of Management',
      field_of_study: 'Business Administration',
      start_date: '2013-09',
      end_date: '2017-05',
      description: 'Graduated with honors. Active in the student association and community service programs.',
      sort_order: 1,
    },
  ],
  projects: [
    {
      id: 'proj-1',
      cv_id: 'sample-cv-deterministic',
      name: 'Branch Service Improvement',
      description:
        'Led a three-month initiative to map customer wait times, revise staff schedules, and introduce a clearer queue process across four locations.',
      project_url: 'https://nadiaputri.example.com/service-improvement',
      start_date: '2023-01',
      end_date: '2023-11',
      sort_order: 1,
    },
    {
      id: 'proj-2',
      cv_id: 'sample-cv-deterministic',
      name: 'Community Career Workshop',
      description:
        'Planned a volunteer-led workshop for 120 job seekers, coordinating speakers, venue logistics, participant communication, and feedback reporting.',
      project_url: 'https://nadiaputri.example.com/career-workshop',
      start_date: '2022-05',
      end_date: '2022-12',
      sort_order: 2,
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      cv_id: 'sample-cv-deterministic',
      name: 'Project Management Foundations',
      issuer: 'Professional Learning Institute',
      issue_date: '2023-08',
      credential_url: 'https://example.com/credentials/project-management',
      sort_order: 1,
    },
    {
      id: 'cert-2',
      cv_id: 'sample-cv-deterministic',
      name: 'Microsoft Office Specialist: Excel',
      issuer: 'Microsoft',
      issue_date: '2022-11',
      credential_url: 'https://example.com/credentials/excel',
      sort_order: 2,
    },
  ],
  created_at: '2026-01-15T08:00:00.000Z',
  updated_at: '2026-09-15T12:00:00.000Z',
}

/**
 * Deterministic empty CV with safe zero-values.
 */
export const EMPTY_CV: CVWithRelations = {
  id: 'empty-cv',
  user_id: 'empty-user',
  name: 'Untitled CV',
  template: 'ats',
  personal_info: {
    full_name: '',
    professional_title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    photo_url: null,
  },
  summary: null,
  skills: [],
  experiences: [],
  educations: [],
  projects: [],
  certifications: [],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

/**
 * Detects if a CV has essentially no user-entered content.
 */
export function isEmptyCV(cv?: Partial<CVWithRelations> | null): boolean {
  if (!cv) return true
  const info = cv.personal_info
  const hasName = Boolean(info?.full_name?.trim())
  const hasEmail = Boolean(info?.email?.trim())
  const hasSummary = Boolean(cv.summary?.trim())
  const hasExp = Boolean(cv.experiences && cv.experiences.length > 0)
  const hasEdu = Boolean(cv.educations && cv.educations.length > 0)
  const hasSkills = Boolean(cv.skills && cv.skills.length > 0)
  const hasProjects = Boolean(cv.projects && cv.projects.length > 0)
  const hasCerts = Boolean(cv.certifications && cv.certifications.length > 0)

  return !hasName && !hasEmail && !hasSummary && !hasExp && !hasEdu && !hasSkills && !hasProjects && !hasCerts
}

/**
 * Formats start and end dates with Present fallback.
 */
export function formatDateRange(
  startDate?: string | null,
  endDate?: string | null,
  isCurrent?: boolean
): string {
  const start = formatMonthYear(startDate)
  if (isCurrent) {
    return start ? `${start} – Present` : 'Present'
  }
  const end = formatMonthYear(endDate)
  if (start && end) return `${start} – ${end}`
  if (start) return start
  if (end) return end
  return ''
}

/**
 * Formats YYYY-MM or YYYY string into readable month & year.
 */
export function formatMonthYear(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return ''
  const trimmed = dateStr.trim()
  if (!trimmed) return ''

  // Format YYYY-MM
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    const [year, month] = trimmed.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const mIndex = parseInt(month, 10) - 1
    if (mIndex >= 0 && mIndex < 12) {
      return `${months[mIndex]} ${year}`
    }
  }

  return trimmed
}

/**
 * Cleans a URL for display (stripping protocol and trailing slash).
 */
export function formatDisplayUrl(url?: string | null): string {
  if (!url) return ''
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}
