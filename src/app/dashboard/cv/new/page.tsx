import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CVForm } from '@/components/cv/editor/cv-form'

export const dynamic = 'force-dynamic'

export default async function NewCVPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <div>
        <CVForm />
      </div>
    </>
  )
}
