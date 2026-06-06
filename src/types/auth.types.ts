export type UserRole = 'student' | 'tutor' | 'admin'

export interface UserSession {
  id: string
  email: string
  isAdmin: boolean
}

export interface AuthUser {
  id: string
  email: string
}
