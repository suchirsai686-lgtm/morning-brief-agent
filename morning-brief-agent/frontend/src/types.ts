export interface UserProfile {
  email: string
  name: string
  timezone: string
  city: string
  wake_time: string
  tasks: string[]
  lastBrief?: string
  lastGenerated?: string
  createdAt?: string
  updatedAt?: string
}

export interface GenerateBriefResponse {
  brief: string
  generatedAt: string
  email: string
}

export interface ApiError {
  error: string
}
