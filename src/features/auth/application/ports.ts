import type { AuthUser } from '../domain/models'

export interface AuthRepository {
  currentUser(): Promise<AuthUser | null>
  signInWithGoogle(redirectTo: string): Promise<void>
  signOut(): Promise<void>
  onAuthStateChange(listener: (user: AuthUser | null) => void): () => void
}
