import type { UserProfile, GenerateBriefResponse } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`)
  }
  return data as T
}

export const api = {
  saveProfile: (profile: UserProfile) =>
    request<{ message: string; email: string }>('/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    }),

  getProfile: (email: string) =>
    request<UserProfile>(`/profile?email=${encodeURIComponent(email)}`),

  generateBrief: (email: string, sendEmail = false) =>
    request<GenerateBriefResponse>('/generate', {
      method: 'POST',
      body: JSON.stringify({ email, sendEmail }),
    }),

  sendEmail: (profile: UserProfile, brief: string) =>
    request<{ message: string; messageId: string }>('/send-email', {
      method: 'POST',
      body: JSON.stringify({ profile, brief }),
    }),
}
