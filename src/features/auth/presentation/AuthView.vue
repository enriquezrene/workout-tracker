<script setup lang="ts">
import { Dumbbell, LogIn } from '@lucide/vue'

defineProps<{ loading: boolean; errorMessage: string }>()
defineEmits<{ signIn: [] }>()
</script>

<template>
  <main class="auth-shell">
    <section class="auth-panel" aria-labelledby="auth-title">
      <Dumbbell class="auth-mark" :size="34" aria-hidden="true" />
      <p class="eyebrow">Workout tracker</p>
      <h1 id="auth-title">Sign in to Gym log</h1>
      <p class="auth-copy">Use your Google account to access your workout history.</p>
      <button type="button" :disabled="loading" @click="$emit('signIn')">
        <LogIn :size="19" aria-hidden="true" />
        {{ loading ? 'Connecting...' : 'Continue with Google' }}
      </button>
      <p v-if="errorMessage" class="auth-error" role="alert">{{ errorMessage }}</p>
    </section>
  </main>
</template>

<style scoped>
.auth-shell {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 20px;
}
.auth-panel {
  display: grid;
  width: min(420px, 100%);
  padding: 30px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--panel);
  box-shadow: var(--shadow);
}
.auth-mark {
  margin-bottom: 20px;
  color: var(--green);
}
h1 {
  margin-bottom: 10px;
  color: var(--dark);
  font-size: 2rem;
  letter-spacing: 0;
}
.auth-copy {
  margin-bottom: 24px;
  color: var(--muted);
}
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 48px;
  border: 1px solid var(--green);
  border-radius: var(--radius);
  background: var(--green);
  color: #fff;
  font-weight: 800;
}
button:disabled {
  cursor: wait;
  opacity: 0.7;
}
.auth-error {
  margin: 14px 0 0;
  color: var(--danger);
  font-size: 0.86rem;
  font-weight: 700;
}
</style>
