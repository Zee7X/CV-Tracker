import type { CV } from './cv'
import type { JobApplicationWithCV } from './application'

export interface DashboardMetrics {
  totalCVs: number
  totalApplications: number
  interviewCount: number
  offersCount: number
}

export interface DashboardData {
  metrics: DashboardMetrics
  recentCVs: CV[]
  recentApplications: JobApplicationWithCV[]
}
