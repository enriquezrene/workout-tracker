import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AuthView from '@/features/auth/presentation/AuthView.vue'

describe('AuthView', () => {
  it('offers Google sign-in and reports the user intent', async () => {
    const wrapper = mount(AuthView, { props: { loading: false, errorMessage: '' } })

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('h1').text()).toBe('Sign in to Gym log')
    expect(wrapper.emitted('signIn')).toHaveLength(1)
  })
})
