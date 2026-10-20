<script setup lang="ts">
import { LogOut } from '@lucide/vue'
import type { AuthUser } from '../domain/models'

defineProps<{ user: AuthUser }>()
defineEmits<{ signOut: [] }>()
</script>

<template>
  <div class="user-menu" aria-label="Signed-in account">
    <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="" referrerpolicy="no-referrer" />
    <span v-else class="avatar-fallback" aria-hidden="true">{{ user.name.charAt(0).toUpperCase() }}</span>
    <span class="user-name">{{ user.name }}</span>
    <button type="button" title="Sign out" aria-label="Sign out" @click="$emit('signOut')">
      <LogOut :size="18" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.user-menu {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 34px;
  gap: 8px;
  align-items: center;
  min-height: 46px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--panel);
  box-shadow: var(--shadow-soft);
}
img,
.avatar-fallback {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
.avatar-fallback {
  display: grid;
  place-items: center;
  background: var(--green-soft);
  color: var(--green);
  font-weight: 850;
}
.user-name {
  max-width: 150px;
  overflow: hidden;
  font-size: 0.8rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}
button {
  display: grid;
  width: 34px;
  height: 34px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: var(--radius);
  background: transparent;
  color: var(--muted);
}
button:hover {
  background: #fff3ef;
  color: var(--danger);
}
</style>
