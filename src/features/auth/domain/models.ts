export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl?: string
}

export type AuthStatus = 'loading' | 'guest' | 'authenticating' | 'authenticated' | 'error'
