import { apiClient } from './client'

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  email: string; full_name: string; phone?: string
  password: string; password_confirm: string
}
export interface MFAVerifyPayload { email: string; token: string; mfa_type: 'totp' | 'email' }

export const authApi = {
  login: (data: LoginPayload) => apiClient.post('/api/auth/login/', data),
  register: (data: RegisterPayload) => apiClient.post('/api/auth/register/', data),
  logout: (refresh: string) => apiClient.post('/api/auth/logout/', { refresh }),
  refreshToken: (refresh: string) => apiClient.post('/api/auth/token/refresh/', { refresh }),
  mfaVerify: (data: MFAVerifyPayload) => apiClient.post('/api/auth/login/mfa/', data),
  getProfile: () => apiClient.get('/api/auth/profile/'),
  updateProfile: (data: FormData | Record<string, unknown>) => apiClient.patch('/api/auth/profile/', data),
  submitProfileUpdateRequest: (data: FormData) =>
    apiClient.post('/api/auth/profile/update-request/', data),
  changePassword: (data: { current_password: string; new_password: string; new_password_confirm: string }) =>
    apiClient.post('/api/auth/change-password/', data),
  requestPasswordReset: (email: string) => apiClient.post('/api/auth/password-reset/', { email }),
  confirmPasswordReset: (data: { token: string; new_password: string; new_password_confirm: string }) =>
    apiClient.post('/api/auth/password-reset/confirm/', data),
  kycUpload: (formData: FormData) =>
    apiClient.post('/api/auth/kyc/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  toggleMFA: () => apiClient.post('/api/auth/mfa/toggle/'),
}
