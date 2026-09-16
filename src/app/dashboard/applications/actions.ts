'use server'

import * as actions from '@/lib/applications/actions'
import type { ApplicationInput } from '@/lib/validations/application'
import type { ApplicationStatus } from '@/types/application'

export async function createApplication(input: ApplicationInput) {
  return actions.createApplication(input)
}

export async function updateApplication(id: string, input: ApplicationInput) {
  return actions.updateApplication(id, input)
}

export async function deleteApplication(id: string) {
  return actions.deleteApplication(id)
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return actions.updateApplicationStatus(id, status)
}
