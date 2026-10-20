<script setup lang="ts">
import { computed, onUnmounted, ref, shallowRef, watch } from 'vue'
import { BarChart3, Dumbbell } from '@lucide/vue'
import AuthView from '@/features/auth/presentation/AuthView.vue'
import UserMenu from '@/features/auth/presentation/UserMenu.vue'
import { createAuthController } from '@/features/auth/presentation/useAuthController'
import { SupabaseAuthRepository } from '@/features/auth/infrastructure/supabaseAuthRepository'
import WorkoutView from '@/features/workout/presentation/WorkoutView.vue'
import WeeklySummaryView from '@/features/weekly-summary/presentation/WeeklySummaryView.vue'
import SaveToast from '@/shared/components/SaveToast.vue'
import {
  createWorkoutController,
  type WorkoutController,
} from '@/features/workout/presentation/useWorkoutController'
import { browserDateProvider, browserIdGenerator } from '@/features/workout/infrastructure/browserAdapters'
import { SupabaseWorkoutHistoryRepository } from '@/features/workout/infrastructure/supabaseWorkoutHistoryRepository'
import { createConfiguredSupabaseClient } from '@/shared/infrastructure/supabaseClient'
import type { ViewName } from '@/features/workout/domain/models'

const activeView = ref<ViewName>('track')
const supabaseClient = createConfiguredSupabaseClient()
const authController = supabaseClient
  ? createAuthController(new SupabaseAuthRepository(supabaseClient))
  : undefined
const controller = shallowRef<WorkoutController>()

const currentUser = computed(() => authController?.user.value || null)
const authLoading = computed(
  () => authController?.status.value === 'loading' || authController?.status.value === 'authenticating',
)
const authError = computed(() =>
  supabaseClient
    ? authController?.errorMessage.value || ''
    : 'Sign-in is unavailable. Please contact the app owner.',
)

function startAuthenticatedWorkout() {
  if (!supabaseClient) return
  controller.value?.dispose()
  const historyRepository = new SupabaseWorkoutHistoryRepository(supabaseClient)
  controller.value = createWorkoutController(historyRepository, browserDateProvider, browserIdGenerator)
}

if (authController) {
  watch(
    () => authController.user.value?.id,
    (userId) => {
      activeView.value = 'track'
      if (userId) startAuthenticatedWorkout()
      else {
        controller.value?.dispose()
        controller.value = undefined
      }
    },
    { immediate: true },
  )
}

onUnmounted(() => {
  authController?.dispose()
  controller.value?.dispose()
})

function setWorkoutDate(event: Event) {
  const input = event.target as HTMLInputElement
  controller.value?.commands.setSessionDate(input.value)
  input.value = controller.value?.state.sessionDate || ''
}

const signIn = () => authController?.commands.signInWithGoogle(window.location.origin)
const signOut = () => authController?.commands.signOut()
</script>

<template>
  <AuthView
    v-if="!currentUser"
    :loading="authLoading"
    :error-message="authError"
    :disabled="!supabaseClient"
    @sign-in="signIn"
  />
  <main v-else-if="controller" class="app-shell">
    <section class="topbar" aria-label="Workout overview">
      <div>
        <p class="eyebrow">Workout tracker</p>
        <h1>Gym log</h1>
      </div>
      <div class="topbar-actions">
        <label class="date-control"
          ><span class="date-label">Workout date</span
          ><input
            :value="controller.state.sessionDate"
            type="date"
            aria-label="Workout date"
            :disabled="!controller.canEdit.value"
            required
            @input="setWorkoutDate"
        /></label>
        <UserMenu v-if="currentUser" class="account-control" :user="currentUser" @sign-out="signOut" />
      </div>
    </section>
    <nav class="app-menu" aria-label="Main menu">
      <button type="button" :class="{ active: activeView === 'track' }" @click="activeView = 'track'">
        <Dumbbell :size="18" aria-hidden="true" />Track
      </button>
      <button type="button" :class="{ active: activeView === 'week' }" @click="activeView = 'week'">
        <BarChart3 :size="18" aria-hidden="true" />Weekly summary
      </button>
    </nav>
    <WorkoutView v-if="activeView === 'track'" :controller="controller" />
    <WeeklySummaryView
      v-else
      :history="controller.state.history"
      :session-date="controller.state.sessionDate"
      @back="activeView = 'track'"
    />
    <SaveToast :visible="controller.saveNoticeVisible.value" :message="controller.saveNoticeMessage.value" />
  </main>
</template>

<style scoped>
.app-shell {
  width: min(940px, 100%);
  margin: 0 auto;
  padding: 28px;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 22px;
  min-width: 0;
}
.account-control {
  padding-left: 22px;
  border-left: 1px solid var(--border);
}
h1 {
  margin: 0;
  color: var(--dark);
  font-size: clamp(2.2rem, 5vw, 2.625rem);
  line-height: 0.95;
}
.date-control {
  display: grid;
  gap: 4px;
  flex-shrink: 0;
}
.date-label {
  color: var(--muted);
  font-size: 0.7rem;
}
.date-control input {
  width: 160px;
  max-width: 100%;
  min-height: 44px;
  padding: 7px 0;
  border: 0;
  border-bottom: 1px solid var(--border);
  border-radius: 0;
  background: transparent;
  color: var(--ink);
  font-size: 1rem;
}
.app-menu {
  display: inline-flex;
  gap: 8px;
  margin-bottom: 18px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--panel);
  box-shadow: var(--shadow-soft);
}
.app-menu button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: var(--radius);
  background: transparent;
  color: var(--muted);
  font-weight: 800;
}
.app-menu button.active {
  border-color: rgb(47 125 109 / 30%);
  background: var(--green-soft);
  color: var(--green);
}
@media (max-width: 720px) {
  .app-shell {
    padding: 16px;
  }
  .topbar {
    align-items: stretch;
    flex-direction: column;
  }
  .topbar-actions {
    justify-content: space-between;
    gap: 14px;
  }
  .account-control {
    padding-left: 14px;
  }
  .app-menu {
    position: sticky;
    top: 8px;
    z-index: 20;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }
}
@media (max-width: 520px) {
  .app-shell {
    padding: 12px;
  }
  .topbar-actions {
    display: grid;
    grid-template-areas: 'account' 'date';
    grid-template-columns: minmax(0, 1fr);
    justify-content: stretch;
  }
  .account-control {
    grid-area: account;
    padding-left: 0;
    border-left: 0;
  }
  .date-control {
    grid-area: date;
    justify-self: start;
  }
}
</style>
