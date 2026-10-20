import { describe, expect, it, vi } from 'vitest'
import type { AuthRepository } from '@/features/auth/application/ports'
import type { AuthUser } from '@/features/auth/domain/models'
import { createAuthController } from '@/features/auth/presentation/useAuthController'

describe('auth controller', () => {
  it('starts Google sign-in and reacts to authenticated sessions', async () => {
    let authListener: (user: AuthUser | null) => void = () => undefined
    const signInWithGoogle = vi.fn(async () => undefined)
    const repository: AuthRepository = {
      currentUser: async () => null,
      signInWithGoogle,
      signOut: async () => undefined,
      onAuthStateChange: (listener) => {
        authListener = listener
        return () => undefined
      },
    }
    const controller = createAuthController(repository)

    await vi.waitFor(() => expect(controller.status.value).toBe('guest'))
    await controller.commands.signInWithGoogle('http://localhost:5173')
    expect(signInWithGoogle).toHaveBeenCalledWith('http://localhost:5173')

    authListener({ id: 'user-1', email: 'rene@example.com', name: 'Rene' })
    expect(controller.user.value?.id).toBe('user-1')
    expect(controller.status.value).toBe('authenticated')
  })
})
