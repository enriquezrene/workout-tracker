import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { AuthRepository } from '../application/ports'
import type { AuthUser } from '../domain/models'

export function mapSupabaseUser(user: User): AuthUser {
  const metadata = user.user_metadata
  return {
    id: user.id,
    email: user.email || '',
    name: String(metadata.full_name || metadata.name || user.email || 'Google user'),
    avatarUrl: metadata.avatar_url ? String(metadata.avatar_url) : undefined,
  }
}

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  async currentUser(): Promise<AuthUser | null> {
    const { data, error } = await this.client.auth.getSession()
    if (error) throw error
    return data.session?.user ? mapSupabaseUser(data.session.user) : null
  }

  async signInWithGoogle(redirectTo: string): Promise<void> {
    const { error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) throw error
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut()
    if (error) throw error
  }

  onAuthStateChange(listener: (user: AuthUser | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      listener(session?.user ? mapSupabaseUser(session.user) : null)
    })
    return () => data.subscription.unsubscribe()
  }
}
