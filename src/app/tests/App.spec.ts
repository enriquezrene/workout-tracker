import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App.vue'
import type { AuthUser } from '@/features/auth/domain/models'

const auth = vi.hoisted(() => ({
  listener: undefined as ((user: AuthUser | null) => void) | undefined,
  list: vi.fn(async () => []),
  save: vi.fn<(session: unknown) => Promise<void>>(async () => undefined),
}))
const user: AuthUser = { id: 'user-1', name: 'Rene', email: 'rene@example.test' }

vi.mock('@/shared/infrastructure/supabaseClient', () => ({
  createConfiguredSupabaseClient: () => ({}),
}))
vi.mock('@/features/auth/infrastructure/supabaseAuthRepository', () => ({
  SupabaseAuthRepository: class {
    currentUser = async () => ({ ...user })
    signInWithGoogle = async () => undefined
    signOut = async () => auth.listener?.(null)
    onAuthStateChange(listener: (user: AuthUser | null) => void) {
      auth.listener = listener
      return () => {
        auth.listener = undefined
      }
    }
  },
}))
vi.mock('@/features/workout/infrastructure/supabaseWorkoutHistoryRepository', () => ({
  SupabaseWorkoutHistoryRepository: class {
    list = auth.list
    save = auth.save
  },
}))

describe('authenticated workout state', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    auth.listener = undefined
  })

  it('keeps the workout date, saved history, and previous references when the same account refreshes', async () => {
    const wrapper = mount(App)
    try {
      await flushPromises()
      auth.listener?.({ ...user })
      await flushPromises()
      expect(auth.list).toHaveBeenCalledTimes(1)
      expect(wrapper.find('.save-toast').exists()).toBe(false)

      const date = wrapper.get('input[aria-label="Workout date"]')
      await date.setValue('2026-09-14')
      await wrapper.get('input[aria-label="Barbell Squat, set 1, weight"]').setValue('40')
      await wrapper.get('input[aria-label="Barbell Squat, set 1, repetitions"]').setValue('8')
      await wrapper.get('button[title="Mark set complete"]').trigger('click')
      await flushPromises()
      expect(wrapper.get('.save-toast').text()).toBe('Changes saved')
      expect(auth.save).toHaveBeenLastCalledWith(
        expect.objectContaining({ date: '2026-09-14', completedSets: 1 }),
      )

      await date.setValue('2026-09-15')
      auth.listener?.({ ...user })
      await flushPromises()
      expect(auth.list).toHaveBeenCalledTimes(1)
      expect(wrapper.get('#exercise-barbell-squat .exercise-meta').text()).toContain('2026-09-14')
      expect(wrapper.get('#exercise-barbell-squat .previous-cell').text()).toBe('40 x 8')
    } finally {
      wrapper.unmount()
    }
  })
})
