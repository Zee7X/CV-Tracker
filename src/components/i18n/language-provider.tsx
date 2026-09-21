'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'en' | 'id'

const id: Record<string, string> = {
  'How It Works': 'Cara Kerja',
  Features: 'Fitur',
  Templates: 'Template',
  'Sign In': 'Masuk',
  'Get Started': 'Mulai',
  'Create CV': 'Buat CV',
  'Create Your CV': 'Buat CV Anda',
  'Track Applications': 'Lacak Lamaran',
  'A calmer way to run your job search.': 'Cara yang lebih tenang untuk mengelola pencarian kerja.',
  'One CV workspace. Every application in view.': 'Satu ruang kerja CV. Semua lamaran tetap terpantau.',
  'Write a focused CV, export it as a clean PDF, and keep a useful record of where you sent it.':
    'Tulis CV yang terarah, ekspor sebagai PDF yang rapi, lalu catat setiap tempat Anda mengirimkannya.',
  'No spreadsheets required.': 'Tanpa perlu spreadsheet.',
  'Three CV formats': 'Tiga format CV',
  'ATS, professional, and modern': 'ATS, profesional, dan modern',
  'Print-ready PDF': 'PDF siap cetak',
  'A4 layout with selectable text': 'Tata letak A4 dengan teks yang dapat dipilih',
  'Application history': 'Riwayat lamaran',
  'CV version, notes, and status together': 'Versi CV, catatan, dan status dalam satu tempat',
  'From blank page to follow-up': 'Dari halaman kosong hingga tindak lanjut',
  'Add the details that matter.': 'Isi detail yang benar-benar diperlukan.',
  'Work section by section, without fighting a word processor.':
    'Isi bagian demi bagian tanpa repot mengatur dokumen manual.',
  'Pick a format for the role.': 'Pilih format yang sesuai dengan posisi.',
  'Use ATS for simple parsing, Professional for formal roles, or Modern for a stronger visual hierarchy.':
    'Gunakan ATS agar mudah dipindai sistem, Professional untuk posisi formal, atau Modern untuk hierarki visual yang lebih kuat.',
  'Export and keep the context.': 'Ekspor dan simpan konteksnya.',
  'Download the PDF, then record the company, role, status, link, and CV version you sent.':
    'Unduh PDF, lalu catat perusahaan, posisi, status, tautan, dan versi CV yang Anda kirim.',
  'Built around the actual work': 'Dibuat untuk pekerjaan yang benar-benar dilakukan',
  'Edit without losing the overview': 'Edit tanpa kehilangan gambaran besar',
  'The form and live preview stay side by side, so every change has visible context.':
    'Formulir dan pratinjau tampil berdampingan, sehingga setiap perubahan langsung terlihat.',
  'Know which CV went where': 'Tahu CV mana yang dikirim ke mana',
  'Attach a CV version to each application instead of guessing later.':
    'Hubungkan versi CV ke setiap lamaran agar tidak perlu menebak di kemudian hari.',
  'See the next follow-up': 'Lihat tindak lanjut berikutnya',
  'Filter applications by stage and keep interview notes beside the job link.':
    'Saring lamaran berdasarkan tahap dan simpan catatan wawancara di dekat tautan lowongan.',
  'Choose a starting point': 'Pilih titik awal',
  'The content stays yours. The format can change when the role does.':
    'Konten tetap milik Anda. Formatnya dapat berubah mengikuti posisi yang dituju.',
  'Single column': 'Satu kolom',
  'Easy to scan and parse': 'Mudah dibaca dan dipindai',
  Professional: 'Profesional',
  'Formal hierarchy': 'Hierarki formal',
  'Clear sections for traditional roles': 'Bagian yang jelas untuk posisi formal',
  Modern: 'Modern',
  'Structured sidebar': 'Sidebar terstruktur',
  'A bolder layout for digital roles': 'Tata letak lebih tegas untuk posisi digital',
  'Start with the CV. Keep the search organized after that.':
    'Mulai dari CV. Setelah itu, jaga pencarian kerja tetap teratur.',
  'Create a free workspace and build your first CV.': 'Buat ruang kerja gratis dan susun CV pertama Anda.',
  Dashboard: 'Dasbor',
  CV: 'CV',
  Applications: 'Lamaran',
  Account: 'Akun',
  Logout: 'Keluar',
  'Toggle menu': 'Buka atau tutup menu',
  'Welcome back! Track your job applications and manage your CVs in one place.':
    'Selamat datang kembali. Pantau lamaran dan kelola CV Anda dalam satu tempat.',
  'Add Application': 'Tambah Lamaran',
  'Dashboard Metrics': 'Metrik dasbor',
  'Recent Activity': 'Aktivitas terbaru',
  'Total CVs': 'Total CV',
  'Active CV profiles': 'Profil CV aktif',
  'Total Applications': 'Total Lamaran',
  'Tracked job searches': 'Pencarian kerja tercatat',
  Interviews: 'Wawancara',
  'In interview stage': 'Dalam tahap wawancara',
  Offers: 'Penawaran',
  'Job offers received': 'Penawaran kerja diterima',
  'Recent CVs': 'CV Terbaru',
  'Your most recently updated CVs': 'CV yang terakhir Anda perbarui',
  'View all': 'Lihat semua',
  'No CVs Created Yet': 'Belum Ada CV',
  Edit: 'Edit',
  'Recent Applications': 'Lamaran Terbaru',
  'Your latest job applications and status': 'Lamaran terbaru beserta statusnya',
  'No Applications Logged': 'Belum Ada Lamaran',
  Details: 'Detail',
  'My CVs': 'CV Saya',
  'Create and manage customized versions of your CV for different job roles.':
    'Buat dan kelola versi CV yang disesuaikan untuk posisi berbeda.',
  'Create and manage tailored CVs for every opportunity.': 'Buat dan kelola CV khusus untuk setiap peluang.',
  'No CVs yet': 'Belum ada CV',
  'Create your first CV and tailor it for the role you want.': 'Buat CV pertama Anda dan sesuaikan dengan posisi yang dituju.',
  'Create your first CV, choose a format, and adjust it for the role you want.':
    'Buat CV pertama Anda, pilih format, lalu sesuaikan dengan posisi yang dituju.',
  'Create Your First CV': 'Buat CV Pertama',
  'Job applications': 'Lamaran kerja',
  'Keep each role, CV version, and follow-up in one place.':
    'Simpan posisi, versi CV, dan tindak lanjut dalam satu tempat.',
  'Track and manage your job search pipeline across all stages.':
    'Pantau dan kelola proses lamaran kerja di setiap tahap.',
  'No Job Applications Yet': 'Belum Ada Lamaran Kerja',
  'Start tracking a role when you apply, then update its status as it moves forward.':
    'Catat posisi saat Anda melamar, lalu perbarui statusnya sepanjang proses.',
  'Search by company, position, or notes...': 'Cari perusahaan, posisi, atau catatan...',
  'Search applications': 'Cari lamaran',
  'Clear search query': 'Hapus pencarian',
  All: 'Semua',
  'No matching applications': 'Tidak ada lamaran yang cocok',
  'Try another search or status filter.': 'Coba kata kunci atau filter status lain.',
  'New Application': 'Lamaran Baru',
  'Edit Application': 'Edit Lamaran',
  'Application Details': 'Detail Lamaran',
  'Company Name': 'Nama Perusahaan',
  'Job Position': 'Posisi',
  'Date Applied': 'Tanggal Melamar',
  Status: 'Status',
  'Attached CV': 'CV Terhubung',
  '(Optional)': '(Opsional)',
  'None / Not Linked': 'Tidak ada / Belum dihubungkan',
  'Job Posting URL': 'Tautan Lowongan',
  'Notes & Details': 'Catatan & Detail',
  'Add salary expectations, interview feedback, contact details, recruiter notes...':
    'Tambahkan ekspektasi gaji, hasil wawancara, kontak, atau catatan rekruter...',
  Save: 'Simpan',
  'Saving...': 'Menyimpan...',
  Cancel: 'Batal',
  Applied: 'Dilamar',
  Screening: 'Seleksi',
  Interview: 'Wawancara',
  Offering: 'Penawaran',
  Rejected: 'Ditolak',
  Withdrawn: 'Dibatalkan',
  'Job Link': 'Tautan Lowongan',
  Notes: 'Catatan',
  'Delete application?': 'Hapus lamaran?',
  Delete: 'Hapus',
  'Account Settings': 'Pengaturan Akun',
  'Manage your account settings.': 'Kelola pengaturan akun Anda.',
  'Your account information and preferences.': 'Informasi dan preferensi akun Anda.',
  'Welcome back': 'Selamat datang kembali',
  'Sign in to your CV Tracker account': 'Masuk ke akun CV Tracker Anda',
  'Email address': 'Alamat email',
  Password: 'Kata sandi',
  'Show password': 'Tampilkan kata sandi',
  'Hide password': 'Sembunyikan kata sandi',
  'Forgot password?': 'Lupa kata sandi?',
  "Don't have an account?": 'Belum punya akun?',
  'Create account': 'Buat akun',
  'Create an account': 'Buat akun',
  'Start building and tracking your CVs': 'Mulai membuat dan melacak CV Anda',
  'Full name': 'Nama lengkap',
  'Confirm password': 'Konfirmasi kata sandi',
  'New password': 'Kata sandi baru',
  'Confirm new password': 'Konfirmasi kata sandi baru',
  'Choose a strong password for your account': 'Pilih kata sandi yang kuat untuk akun Anda',
  'Already have an account?': 'Sudah punya akun?',
  'At least 8 characters': 'Minimal 8 karakter',
  'Repeat your password': 'Ulangi kata sandi',
  'Reset your password': 'Atur ulang kata sandi',
  'Set a new password': 'Buat kata sandi baru',
  'Back to sign in': 'Kembali ke halaman masuk',
  'Personal Information': 'Informasi Pribadi',
  'Professional Summary': 'Ringkasan Profesional',
  Experience: 'Pengalaman',
  Education: 'Pendidikan',
  Skills: 'Keahlian',
  Projects: 'Proyek',
  Certifications: 'Sertifikasi',
  'Full Name': 'Nama Lengkap',
  'Professional Title': 'Gelar Profesional',
  'Email Address': 'Alamat Email',
  Phone: 'Telepon',
  Location: 'Lokasi',
  Portfolio: 'Portofolio',
  Summary: 'Ringkasan',
  'Work Experience': 'Pengalaman Kerja',
  'Add Experience': 'Tambah Pengalaman',
  'No work experience added yet.': 'Belum ada pengalaman kerja.',
  Remove: 'Hapus',
  'Move Up': 'Pindah ke Atas',
  'Move Down': 'Pindah ke Bawah',
  'Sort Newest First': 'Urutkan Terbaru',
  'Saat ini / Present': 'Saat ini',
  Present: 'Sekarang',
  'Job Title / Position': 'Jabatan / Posisi',
  'Start Date': 'Tanggal Mulai',
  'End Date': 'Tanggal Selesai',
  'Currently working here': 'Masih bekerja di sini',
  Description: 'Deskripsi',
  'Add Education': 'Tambah Pendidikan',
  'No education entries added yet.': 'Belum ada riwayat pendidikan.',
  'Institution / University': 'Institusi / Universitas',
  Degree: 'Gelar',
  'Field of Study': 'Bidang Studi',
  'Add skill': 'Tambah keahlian',
  'No skills added yet.': 'Belum ada keahlian.',
  'Popular Suggestions:': 'Saran populer:',
  'Add Project': 'Tambah Proyek',
  'No projects added yet.': 'Belum ada proyek.',
  'Project Name': 'Nama Proyek',
  'Project URL': 'Tautan Proyek',
  'Add Certification': 'Tambah Sertifikasi',
  'No certifications added yet.': 'Belum ada sertifikasi.',
  'Certification Name': 'Nama Sertifikasi',
  Issuer: 'Penerbit',
  'Issue Date': 'Tanggal Terbit',
  'Credential URL': 'Tautan Kredensial',
  'CV Name / Identifier': 'Nama / Penanda CV',
  'Select Template Design': 'Pilih Desain Template',
  'Save CV': 'Simpan CV',
  'Delete this CV?': 'Hapus CV ini?',
  'Delete CV?': 'Hapus CV?',
  Copy: 'Salin',
  'Live Preview': 'Pratinjau Langsung',
  'Your data': 'Data Anda',
  'Sample data': 'Data contoh',
  'Sample preview': 'Pratinjau contoh',
  'Sample Data ON': 'Data contoh aktif',
  'Show Sample': 'Lihat contoh',
  'Toggle between your CV data and filled sample data': 'Beralih antara data CV Anda dan data contoh',
  'Your CV is empty, so this preview uses sample data. The sample will not be saved.':
    'CV Anda masih kosong, jadi pratinjau memakai data contoh. Data contoh tidak akan disimpan.',
  'Zoom Out': 'Perkecil',
  'Zoom In': 'Perbesar',
  'Reset Zoom': 'Atur ulang zoom',
  'Fit to Width': 'Sesuaikan lebar',
  'Print or Save CV': 'Cetak atau simpan CV',
  'Please fix the highlighted fields before saving or downloading your CV.':
    'Perbaiki kolom yang ditandai sebelum menyimpan atau mengunduh CV.',
  'Fix the highlighted form fields before downloading your CV.':
    'Perbaiki kolom yang ditandai sebelum mengunduh CV.',
  'Invalid CV data': 'Data CV tidak valid',
  'End date cannot be earlier than start date': 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
  'End date is required unless this is your current role':
    'Tanggal selesai wajib diisi kecuali ini adalah pekerjaan Anda saat ini',
  'Please enter a valid email address': 'Masukkan alamat email yang valid',
  'Phone number contains invalid characters': 'Nomor telepon mengandung karakter yang tidak valid',
  'Phone number must contain at least 7 digits': 'Nomor telepon harus memiliki minimal 7 angka',
  'LinkedIn URL must be a complete http:// or https:// URL':
    'Tautan LinkedIn harus lengkap dan diawali http:// atau https://',
  'LinkedIn URL must use linkedin.com': 'Tautan LinkedIn harus menggunakan linkedin.com',
  'GitHub URL must be a complete http:// or https:// URL':
    'Tautan GitHub harus lengkap dan diawali http:// atau https://',
  'GitHub URL must use github.com': 'Tautan GitHub harus menggunakan github.com',
  'Portfolio URL must be a complete http:// or https:// URL':
    'Tautan portofolio harus lengkap dan diawali http:// atau https://',
  'Project URL must be a complete http:// or https:// URL':
    'Tautan proyek harus lengkap dan diawali http:// atau https://',
  'Credential URL must be a complete http:// or https:// URL':
    'Tautan kredensial harus lengkap dan diawali http:// atau https://',
  'Professional summary must be at least 40 characters': 'Ringkasan profesional minimal 40 karakter',
  'Professional summary must contain at least 4 words': 'Ringkasan profesional minimal terdiri dari 4 kata',
  'Experience description must be at least 24 characters': 'Deskripsi pengalaman minimal 24 karakter',
  'Experience description must contain at least 4 words': 'Deskripsi pengalaman minimal terdiri dari 4 kata',
  'Project description must be at least 24 characters': 'Deskripsi proyek minimal 24 karakter',
  'Project description must contain at least 4 words': 'Deskripsi proyek minimal terdiri dari 4 kata',
  'Use a valid date': 'Gunakan tanggal yang valid',
  'Use a valid start date': 'Gunakan tanggal mulai yang valid',
  'Remove duplicate skills': 'Hapus keahlian yang duplikat',
  'Enter a real full name, not placeholder or repeated text':
    'Masukkan nama lengkap sebenarnya, bukan teks contoh atau berulang',
  'Enter real professional title, not placeholder or repeated text':
    'Masukkan jabatan sebenarnya, bukan teks contoh atau berulang',
  'Enter a real company name, not placeholder or repeated text':
    'Masukkan nama perusahaan sebenarnya, bukan teks contoh atau berulang',
  'Enter a real position, not placeholder or repeated text':
    'Masukkan posisi sebenarnya, bukan teks contoh atau berulang',
  'Enter a real institution, not placeholder or repeated text':
    'Masukkan nama institusi sebenarnya, bukan teks contoh atau berulang',
  'Enter a real project name, not placeholder or repeated text':
    'Masukkan nama proyek sebenarnya, bukan teks contoh atau berulang',
  'Enter a real certification name, not placeholder or repeated text':
    'Masukkan nama sertifikasi sebenarnya, bukan teks contoh atau berulang',
  'Enter a real professional summary, not placeholder or repeated text':
    'Masukkan ringkasan profesional sebenarnya, bukan teks contoh atau berulang',
  'Failed to load dashboard': 'Dasbor gagal dimuat',
  'Something went wrong': 'Terjadi kesalahan',
  'Try again': 'Coba lagi',
  'Go back': 'Kembali',
  'e.g. Jane Doe': 'contoh: Nadia Putri',
  'e.g. Google, Stripe, Acme Corp': 'contoh: Tokopedia, Gojek, Acme Corp',
  'e.g. Operations Coordinator': 'contoh: Koordinator Operasional',
  'e.g. Operations Coordinator CV (2026)': 'contoh: CV Koordinator Operasional (2026)',
  'e.g. Acme Corp': 'contoh: Acme Corp',
  'Type a skill (e.g. Communication, Microsoft Excel) and press Enter':
    'Ketik keahlian (contoh: Komunikasi, Microsoft Excel), lalu tekan Enter',
  'Project / Portfolio URL': 'Tautan Proyek / Portofolio',
  'Description & Results': 'Deskripsi & Hasil',
  'e.g. Project Management Fundamentals': 'contoh: Dasar-Dasar Manajemen Proyek',
  'e.g. Professional Association': 'contoh: Asosiasi Profesi',
  'CV Basics & Template': 'Dasar & Template CV',
  'Personal Info': 'Informasi Pribadi',
  'Provide your basic contact details and links for recruiters to reach you.':
    'Cantumkan detail kontak dasar dan tautan agar rekruter dapat menghubungi Anda.',
  'Highlight your key achievements, strengths, and years of relevant experience.':
    'Sorot pencapaian utama, kelebihan, dan pengalaman kerja Anda.',
  'About You / Summary': 'Tentang Anda / Ringkasan',
  'Key Projects': 'Proyek Utama',
  'Certifications & Licenses': 'Sertifikasi & Lisensi',
  'Download PDF': 'Unduh PDF',
  'Exporting...': 'Mengekspor...',
  'Save Changes': 'Simpan Perubahan',
  'Duplicate': 'Gandakan',
  'Editor Form': 'Formulir Editor',
  'Show Editor Form': 'Tampilkan Formulir Editor',
  'Show Live Preview': 'Tampilkan Pratinjau',
  'Yes, Delete CV': 'Ya, Hapus CV',
  'Are you sure you want to delete': 'Apakah Anda yakin ingin menghapus',
  'This action will permanently remove all experiences, education, and projects linked to this CV.':
    'Tindakan ini akan menghapus permanen semua pengalaman, pendidikan, dan proyek yang terhubung ke CV ini.',
  'CV Details': 'Detail CV',
  'Template Design': 'Desain Template',
  'Choose a visual style': 'Pilih gaya visual',
  'ATS Clean': 'ATS Bersih',
  'High Parsing Rate': 'Tingkat Pemindaian Tinggi',
  'Clean, single-column, standard typography optimized for applicant tracking parsers.':
    'Rapi, satu kolom, tipografi standar yang dioptimalkan untuk sistem pelacak lamaran.',
  'Balanced corporate layout with structured headers and clear section dividers.':
    'Tata letak korporat seimbang dengan header terstruktur dan pemisah bagian yang jelas.',
  'Contemporary two-column design for portfolios, client-facing roles, and modern workplaces.':
    'Desain dua kolom kontemporer untuk portofolio dan lingkungan kerja modern.',
  'Popular': 'Populer',
  'Contemporary': 'Kontemporer',
  'PROFESSIONAL SUMMARY': 'RINGKASAN PROFESIONAL',
  'WORK EXPERIENCE': 'PENGALAMAN KERJA',
  'EDUCATION': 'PENDIDIKAN',
  'KEY SKILLS': 'KEAHLIAN UTAMA',
  'FEATURED PROJECTS': 'PROYEK UNGGULAN',
  'CERTIFICATIONS': 'SERTIFIKASI',
  'PROFILE': 'PROFIL',
  'EXPERIENCE': 'PENGALAMAN',
  'PROJECTS': 'PROYEK',
  'CONTACT': 'KONTAK',
  'SKILLS': 'KEAHLIAN',
  'SELECTED PROJECTS': 'PROYEK PILIHAN',
  'CORE COMPETENCIES': 'KOMPETENSI INTI',
  'CREDENTIALS': 'KREDENSIAL',
  'View Credential': 'Lihat Kredensial',
  'Verify': 'Verifikasi',
  'Credential': 'Kredensial',
  'Issued': 'Diterbitkan',
  'Issued:': 'Diterbitkan:',
  'LinkedIn Profile URL': 'Tautan Profil LinkedIn',
  'GitHub Profile URL': 'Tautan Profil GitHub',
  'Phone Number': 'Nomor Telepon',
  'Profile Photo': 'Foto Profil',
  'Upload Photo': 'Unggah Foto',
  'Upload Avatar': 'Unggah Avatar',
  'Profile Photo / Avatar': 'Foto Profil / Avatar',
  'Use Account Photo': 'Gunakan Foto Akun',
  'No Photo': 'Tanpa Foto',
  'Hide URL input': 'Sembunyikan URL',
  'Paste image URL': 'Tempel URL gambar',
  'Profile Information': 'Informasi Profil',
  'Update your account profile photo, display name, and login email.':
    'Perbarui foto profil akun, nama tampilan, dan email masuk Anda.',
  'Password & Security': 'Kata Sandi & Keamanan',
  'Update your account password to keep your CV workspace secure.':
    'Perbarui kata sandi akun untuk menjaga keamanan ruang kerja CV Anda.',
  'New Password': 'Kata Sandi Baru',
  'Confirm New Password': 'Konfirmasi Kata Sandi Baru',
  'Repeat your new password': 'Ulangi kata sandi baru',
  'Update Password': 'Perbarui Kata Sandi',
  'Updating...': 'Memperbarui...',
  'Save Profile Changes': 'Simpan Perubahan Profil',
  'Account Overview': 'Ringkasan Akun',
  'Member Since': 'Bergabung Sejak',
  'CV Photo Integration': 'Integrasi Foto CV',
  'Manage your profile details and security settings.':
    'Kelola detail profil dan pengaturan keamanan Anda.',
  'Sort experiences newest first': 'Urutkan pengalaman dari yang paling baru',
  'Sort education newest first': 'Urutkan pendidikan dari yang paling baru',
  'Sort projects newest first': 'Urutkan proyek dari yang paling baru',
  'Sort certifications newest first': 'Urutkan sertifikasi dari yang paling baru',
  'Cover Letters': 'Surat Lamaran',
  'Create Cover Letter': 'Buat Surat Lamaran',
  'Create Your First Cover Letter': 'Buat Surat Lamaran Pertama',
  'No Cover Letters Yet': 'Belum Ada Surat Lamaran',
  'Document Setup': 'Pengaturan Dokumen',
  'Document Title / Identifier': 'Judul / Penanda Dokumen',
  'Select Template Format': 'Pilih Format Template',
  'Job & Company Details': 'Detail Lowongan & Perusahaan',
  'Target Position / Job Title': 'Posisi yang Dituju',
  'Company Address / City': 'Alamat / Kota Perusahaan',
  'Recipient / HRD Name': 'Nama Penerima / HRD',
  'Job Source': 'Sumber Lowongan',
  'Letter Date': 'Tanggal Surat',
  'Your Contact Info': 'Informasi Kontak Anda',
  'Letter Content': 'Konten Surat',
  'Opening Paragraph': 'Paragraf Pembuka',
  'Main Body & Qualifications': 'Paragraf Inti & Kualifikasi',
  'Closing Paragraph & Call to Action': 'Paragraf Penutup & Harapan',
  'Reset Text': 'Atur Ulang Teks',
  'Live Document Preview': 'Pratinjau Dokumen',
  'Copy Text': 'Salin Teks',
  'Copied!': 'Tersalin!',
  'Edit Letter': 'Edit Surat',
  'Delete Cover Letter?': 'Hapus Surat Lamaran?',
  'Auto-Fill from your CV:': 'Isi Otomatis dari CV Anda:',
  'Choose a CV profile...': 'Pilih profil CV...',
  'Import': 'Impor',
  'New Cover Letter': 'Surat Lamaran Baru',
}

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)
const originalText = new WeakMap<Text, string>()
const originalAttributes = new WeakMap<Element, Map<string, string>>()
const translatedAttributes = ['placeholder', 'aria-label', 'title'] as const

export function translateText(value: string, language: Language) {
  if (language === 'en') return value
  const leading = value.match(/^\s*/)?.[0] ?? ''
  const trailing = value.match(/\s*$/)?.[0] ?? ''
  const key = value.trim()
  return key ? `${leading}${id[key] ?? key}${trailing}` : value
}

function shouldSkip(element: Element | null) {
  return Boolean(element?.closest('script, style, textarea, [data-no-translate]'))
}

function translateTree(root: Node, language: Language, refreshOriginal = false) {
  const nodes: Text[] = []

  if (root.nodeType === Node.TEXT_NODE) nodes.push(root as Text)
  if (root.nodeType === Node.ELEMENT_NODE) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) nodes.push(walker.currentNode as Text)
  }

  for (const node of nodes) {
    if (shouldSkip(node.parentElement)) continue
    const current = node.nodeValue ?? ''
    const previous = originalText.get(node)
    if (!previous || (refreshOriginal && current !== translateText(previous, language))) originalText.set(node, current)
    node.nodeValue = translateText(originalText.get(node) ?? current, language)
  }

  const elements = root.nodeType === Node.ELEMENT_NODE
    ? [root as Element, ...(root as Element).querySelectorAll('*')]
    : []

  for (const element of elements) {
    if (shouldSkip(element)) continue
    let originals = originalAttributes.get(element)
    if (!originals) {
      originals = new Map()
      originalAttributes.set(element, originals)
    }

    for (const attribute of translatedAttributes) {
      const current = element.getAttribute(attribute)
      if (current === null) continue
      const previous = originals.get(attribute)
      if (!previous || (refreshOriginal && current !== translateText(previous, language))) originals.set(attribute, current)
      element.setAttribute(attribute, translateText(originals.get(attribute) ?? current, language))
    }
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const saved = window.localStorage.getItem('cv-tracker-language')
    const preferred = saved === 'en' || saved === 'id'
      ? saved
      : window.navigator.language.toLowerCase().startsWith('id') ? 'id' : 'en'
    queueMicrotask(() => setLanguage(preferred))
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    window.localStorage.setItem('cv-tracker-language', language)

    const observer = new MutationObserver((mutations) => {
      observer.disconnect()
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') translateTree(mutation.target, language, true)
        for (const node of mutation.addedNodes) translateTree(node, language)
      }
      observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    })

    translateTree(document.body, language)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [language])

  const value = useMemo(() => ({ language, setLanguage }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
