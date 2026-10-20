import { readonly, ref } from 'vue'
import type { AuthRepository } from '../application/ports'
import type { AuthStatus, AuthUser } from '../domain/models'

export function createAuthController(repository: AuthRepository) {
  const user = ref<AuthUser | null>(null)
  const status = ref<AuthStatus>('loading')
  const errorMessage = ref('')

  const applyUser = (authenticatedUser: AuthUser | null) => {
    user.value = authenticatedUser
    status.value = authenticatedUser ? 'authenticated' : 'guest'
    errorMessage.value = ''
  }

  const unsubscribe = repository.onAuthStateChange(applyUser)

  async function initialize() {
    try {
      applyUser(await repository.currentUser())
    } catch {
      status.value = 'error'
      errorMessage.value = 'Unable to verify your account. Please try again.'
    }
  }

  const commands = {
    signInWithGoogle: async (redirectTo: string) => {
      status.value = 'authenticating'
      errorMessage.value = ''
      try {
        await repository.signInWithGoogle(redirectTo)
      } catch {
        status.value = 'error'
        errorMessage.value = 'Google sign-in could not be started. Please try again.'
      }
    },
    signOut: async () => {
      try {
        await repository.signOut()
      } catch {
        status.value = 'error'
        errorMessage.value = 'Sign out failed. Please try again.'
      }
    },
  }

  void initialize()

  return {
    user: readonly(user),
    status: readonly(status),
    errorMessage: readonly(errorMessage),
    commands,
    dispose: unsubscribe,
  }
}

export type AuthController = ReturnType<typeof createAuthController>
