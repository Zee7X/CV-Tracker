import type { CoverLetter, CoverLetterInput, CoverLetterTemplate } from '@/types/cover-letter'

export interface TemplateDefinition {
  id: CoverLetterTemplate
  name: string
  badge: string
  description: string
  language: 'id' | 'en'
}

export const COVER_LETTER_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'formal_id',
    name: 'Formal Indonesian',
    badge: 'Official / BUMN',
    description: 'Standard formal format with polite structure, perfect for national corporations and institutions.',
    language: 'id',
  },
  {
    id: 'professional_en',
    name: 'Professional English',
    badge: 'International',
    description: 'Structured corporate format with strong impact paragraphs for multinational & remote companies.',
    language: 'en',
  },
  {
    id: 'email_short',
    name: 'Concise Email Body',
    badge: 'Email Ready',
    description: 'Compact & to-the-point format ready to paste directly into your email body when attaching your CV.',
    language: 'id',
  },
  {
    id: 'creative',
    name: 'Creative Startup',
    badge: 'Modern Tech',
    description: 'Dynamic, confident pitch highlighting projects, initiative, and cultural alignment with the company.',
    language: 'id',
  },
]

interface GenerateParams {
  template: CoverLetterTemplate
  jobTitle?: string
  companyName?: string
  recipientName?: string
  source?: string
  senderName?: string
  skillsSummary?: string
  language?: 'id' | 'en'
}

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Formats YYYY-MM-DD or date strings into words like "22 September 2026" or "September 22, 2026".
 */
export function formatCoverLetterDate(dateStr?: string | null, language: 'id' | 'en' = 'id'): string {
  if (!dateStr) return ''
  const trimmed = dateStr.trim()
  const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (!ymdMatch) return trimmed

  const year = ymdMatch[1]
  const mIndex = parseInt(ymdMatch[2], 10) - 1
  const day = parseInt(ymdMatch[3], 10)

  if (mIndex >= 0 && mIndex < 12) {
    if (language === 'en') {
      return `${MONTHS_EN[mIndex]} ${day}, ${year}`
    }
    return `${day} ${MONTHS_ID[mIndex]} ${year}`
  }
  return trimmed
}

export function generateTemplateContent({
  template,
  jobTitle = '[Posisi Pekerjaan]',
  companyName = '[Nama Perusahaan]',
  recipientName = '',
  source = '',
  senderName = '[Nama Anda]',
  skillsSummary = '',
  language = 'id',
}: GenerateParams): { opening: string; body: string; closing: string } {
  const isEn = template === 'professional_en' || language === 'en'
  const recipient = recipientName || (isEn ? 'Hiring Manager' : 'Bapak/Ibu HRD')
  const srcMentionId = source ? ` melalui ${source}` : ''
  const srcMentionEn = source ? ` via ${source}` : ''
  const skillsTextId = skillsSummary
    ? `Keahlian utama saya mencakup ${skillsSummary}, yang saya terapkan untuk menyelesaikan berbagai target secara efektif.`
    : 'Selama pengalaman kerja dan pembelajaran saya, saya telah membiasakan diri bekerja secara terorganisir, disiplin, dan berorientasi pada pencapaian target tim.'
  const skillsTextEn = skillsSummary
    ? `My core competencies include ${skillsSummary}, which I leverage to deliver impactful and measurable results.`
    : 'Throughout my professional career, I have honed the ability to collaborate effectively, solve complex problems, and deliver quality results on schedule.'

  switch (template) {
    case 'professional_en':
      return {
        opening: `I am writing to express my strong enthusiasm for the ${jobTitle} position at ${companyName}${srcMentionEn}. With my background in delivering results and collaborating across teams, I am confident in my ability to make an immediate, valuable contribution to your organization.`,
        body: `${skillsTextEn}\n\nAt my previous responsibilities, I consistently focused on streamlining processes, solving challenges proactively, and maintaining high standards of quality. I admire ${companyName}'s growth and values, and I am excited by the opportunity to contribute my skills to your ongoing initiatives.`,
        closing: `I welcome the opportunity to discuss how my background, skills, and enthusiasm align with the goals of ${companyName}. Thank you for your time and consideration.`,
      }

    case 'email_short':
      if (isEn) {
        return {
          opening: `Dear ${recipient} at ${companyName},\n\nI am writing to submit my application for the ${jobTitle} position at ${companyName}${srcMentionEn}.`,
          body: `I have a strong interest and relevant experience in this area. ${skillsTextEn}\n\nAttached to this email, please find my Curriculum Vitae (CV) and supporting materials detailing my background and qualifications.`,
          closing: `I would welcome the opportunity to speak with you regarding how my experience can support ${companyName}. Thank you for your time and consideration.`,
        }
      }
      return {
        opening: `Yth. ${recipient} di ${companyName},\n\nMelalui email ini, saya bermaksud untuk mengajukan lamaran kerja sebagai ${jobTitle} di ${companyName}${srcMentionId}.`,
        body: `Saya memiliki ketertarikan besar dan pengalaman yang relevan di bidang ini. ${skillsTextId}\n\nBersama dengan email ini, saya melampirkan berkas Curriculum Vitae (CV) dan dokumen pendukung saya untuk memberikan gambaran lengkap mengenai kualifikasi saya.`,
        closing: `Besar harapan saya untuk diberikan kesempatan wawancara guna mendiskusikan bagaimana kontribusi saya dapat mendukung kemajuan ${companyName}. Atas perhatian dan kesempatan yang diberikan, saya ucapkan terima kasih.`,
      }

    case 'creative':
      if (isEn) {
        return {
          opening: `Hello ${companyName} Hiring Team,\n\nI have long admired the vision, creativity, and impact created by ${companyName}. When I discovered the opening for ${jobTitle}${srcMentionEn}, I was immediately energized to apply and connect with your team.`,
          body: `As a proactive and growth-minded professional, I love tackling challenges and creating meaningful solutions. ${skillsTextEn}\n\nI believe the combination of my practical skills, rapid learning curve, and enthusiasm for your mission will allow me to deliver tangible value to projects at ${companyName}.`,
          closing: `I would love the opportunity to share how my energy and experience align with your vision. Thank you for your time, consideration, and this exciting opportunity!`,
        }
      }
      return {
        opening: `Halo Tim Rekrutmen ${companyName},\n\nSaya selalu mengagumi inovasi dan dampak yang diciptakan oleh ${companyName}. Ketika saya mengetahui adanya lowongan untuk posisi ${jobTitle}${srcMentionId}, saya langsung terdorong untuk bergabung dan berkolaborasi bersama tim Anda.`,
        body: `Sebagai seorang profesional yang berorientasi pada hasil dan pertumbuhan, saya senang mengeksplorasi solusi kreatif untuk memecahkan masalah. ${skillsTextId}\n\nSaya percaya bahwa kombinasi antara keahlian teknis, kemauan belajar yang tinggi, dan kecocokan nilai kerja akan memungkinkan saya memberikan kontribusi nyata bagi proyek-proyek di ${companyName}.`,
        closing: `Saya sangat antusias untuk berdiskusi lebih lanjut tentang bagaimana pengalaman dan energi saya dapat mendukung misi ${companyName}. Terima kasih atas waktu dan kesempatan yang diberikan!`,
      }

    case 'formal_id':
    default:
      if (isEn) {
        return {
          opening: `Dear ${recipient},\n\nIn response to the opening for the ${jobTitle} role at ${companyName}${srcMentionEn}, I am writing to respectfully submit my application for consideration.`,
          body: `I am a dedicated, disciplined, and detail-oriented professional with a proven commitment to high standards. ${skillsTextEn}\n\nI adapt quickly to dynamic work environments, collaborate smoothly with diverse teams, and consistently focus on delivering optimal results for organizational success.`,
          closing: `Thank you for taking the time to review my application. I look forward to the opportunity to discuss my qualifications and potential contributions in an interview. Sincerely.`,
        }
      }
      return {
        opening: `Dengan hormat,\n\nSehubungan dengan informasi lowongan pekerjaan yang saya dapatkan${srcMentionId} mengenai posisi ${jobTitle} di ${companyName}, melalui surat ini saya bermaksud mengajukan diri untuk bergabung dengan perusahaan yang Bapak/Ibu pimpin.`,
        body: `Saya merupakan individu yang berdedikasi, teliti, dan memiliki komitmen tinggi dalam bekerja. ${skillsTextId}\n\nSaya terbiasa beradaptasi dengan cepat di lingkungan kerja dinamis, mampu bekerja secara mandiri maupun berkolaborasi dalam tim, serta selalu berupaya memberikan hasil kerja yang optimal demi kemajuan perusahaan.`,
        closing: `Demikian surat lamaran pekerjaan ini saya sampaikan. Besar harapan saya untuk memperoleh kesempatan mengikuti tahapan seleksi selanjutnya agar saya dapat menjelaskan potensi dan kualifikasi saya secara lebih mendalam. Atas perhatian dan kebijaksanaan Bapak/Ibu, saya mengucapkan terima kasih.`,
      }
  }
}

/**
 * Formats a complete cover letter into clean, copyable plain text for email or document paste.
 */
export function formatCoverLetterPlaintext(
  letter: Partial<CoverLetterInput>,
  language: 'id' | 'en' = 'id'
): string {
  const isEn = letter.template === 'professional_en' || language === 'en'
  const isEmail = letter.template === 'email_short'

  const rawDate = letter.letter_date || new Date().toISOString().split('T')[0]
  const formattedDate = formatCoverLetterDate(rawDate, isEn ? 'en' : 'id')
  const senderName = letter.sender_name || ''
  const senderEmail = letter.sender_email || ''
  const senderPhone = letter.sender_phone ? ` | ${letter.sender_phone}` : ''
  const senderLoc = letter.sender_location ? ` | ${letter.sender_location}` : ''
  const company = letter.company_name || ''
  const position = letter.job_title || ''
  const recipient = letter.recipient_name || (isEn ? 'Hiring Team' : 'Bapak/Ibu HRD')
  const address = letter.company_address ? `\n${letter.company_address}` : ''

  if (isEmail) {
    const subjectPrefix = isEn ? 'Subject: Job Application' : 'Subject: Lamaran Pekerjaan'
    const signOff = isEn ? 'Sincerely,' : 'Hormat saya,'
    return `${subjectPrefix} - ${position} - ${senderName}

${letter.opening || ''}

${letter.body || ''}

${letter.closing || ''}

${signOff}
${senderName}
${senderEmail}${senderPhone}${senderLoc}`
  }

  if (isEn) {
    return `${senderName}
${senderEmail}${senderPhone}${senderLoc}

Date: ${formattedDate}

To:
${recipient}
${company}${address}

Dear ${recipient},

${letter.opening || ''}

${letter.body || ''}

${letter.closing || ''}

Sincerely,

${senderName}`
  }

  // Formal Indonesian
  const city = letter.sender_location ? `${letter.sender_location.split(',')[0].trim()}, ` : ''
  return `${city}${formattedDate}

Hal: Lamaran Pekerjaan — ${position}
Lampiran: Berkas CV dan Dokumen Pendukung

Kepada Yth.
${recipient}
${company}${address}

${letter.opening || ''}

Berikut adalah ringkasan data diri saya:
Nama: ${senderName}
Email: ${senderEmail}
Telepon: ${letter.sender_phone || '-'}
Lokasi: ${letter.sender_location || '-'}

${letter.body || ''}

${letter.closing || ''}

Hormat saya,


${senderName}`
}

