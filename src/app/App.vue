<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { BarChart3, CalendarDays, Dumbbell } from '@lucide/vue'
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
import {
  createUserScopedWorkoutRepository,
  LocalStorageWorkoutRepository,
} from '@/features/workout/infrastructure/localStorageWorkoutRepository'
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
const authenticationRequired = Boolean(authController)
const authLoading = computed(
  () => authController?.status.value === 'loading' || authController?.status.value === 'authenticating',
)
const authError = computed(() => authController?.errorMessage.value || '')

function startLocalWorkout() {
  controller.value?.dispose()
  const repository = new LocalStorageWorkoutRepository(window.localStorage, browserDateProvider)
  controller.value = createWorkoutController(repository, browserIdGenerator)
}

function startAuthenticatedWorkout(userId: string) {
  if (!supabaseClient) return
  controller.value?.dispose()
  const repository = createUserScopedWorkoutRepository(window.localStorage, browserDateProvider, userId)
  const historyRepository = new SupabaseWorkoutHistoryRepository(supabaseClient)
  controller.value = createWorkoutController(repository, browserIdGenerator, historyRepository)
}

if (authController) {
  watch(
    authController.user,
    (user) => {
      activeView.value = 'track'
      if (user) startAuthenticatedWorkout(user.id)
      else {
        controller.value?.dispose()
        controller.value = undefined
      }
    },
    { immediate: true },
  )
} else {
  startLocalWorkout()
}

const signIn = () => authController?.commands.signInWithGoogle(window.location.origin)
const signOut = () => authController?.commands.signOut()
</script>

<template>
  <AuthView
    v-if="authenticationRequired && !currentUser"
    :loading="authLoading"
    :error-message="authError"
    @sign-in="signIn"
  />
  <main v-else-if="controller" class="app-shell">
    <section class="topbar" aria-label="Workout overview">
      <div>
        <p class="eyebrow">Workout tracker</p>
        <h1>Gym log</h1>
      </div>
      <div class="topbar-actions">
        <UserMenu v-if="currentUser" :user="currentUser" @sign-out="signOut" />
        <label class="date-control"
          ><CalendarDays :size="18" aria-hidden="true" /><span class="sr-only">Workout date</span
          ><input
            :value="controller.state.sessionDate"
            type="date"
            aria-label="Workout date"
            @input="controller.commands.setSessionDate(($event.target as HTMLInputElement).value)"
        /></label>
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
    <SaveToast :visible="controller.saveNoticeVisible" :message="controller.saveNoticeMessage" />
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}
.topbar-actions {
  display: grid;
  justify-items: end;
  gap: 8px;
}
h1 {
  margin: 0;
  color: var(--dark);
  font-size: clamp(2.2rem, 7vw, 4.3rem);
  line-height: 0.95;
}
.date-control {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--panel);
  box-shadow: var(--shadow);
}
.date-control input {
  border: 0;
  background: transparent;
  color: var(--ink);
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
    padding-bottom: 104px;
  }
  .topbar {
    align-items: stretch;
    flex-direction: column;
  }
  .topbar-actions {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    justify-items: stretch;
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
    padding-bottom: 102px;
  }
  .topbar-actions {
    grid-template-columns: 1fr;
  }
}
</style>
