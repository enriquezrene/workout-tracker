<script setup lang="ts">
import type { AuthUser } from '../domain/models'

defineProps<{ user: AuthUser }>()
defineEmits<{ signOut: [] }>()
</script>

<template>
  <div class="user-menu" role="group" aria-label="Signed-in account">
    <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="" referrerpolicy="no-referrer" />
    <span v-else class="avatar-fallback" aria-hidden="true">{{ user.name.charAt(0).toUpperCase() }}</span>
    <div class="account-details">
      <span class="user-name" :title="user.name">{{ user.name }}</span>
      <span class="account-provider">Google account</span>
    </div>
    <button type="button" @click="$emit('signOut')">Sign out</button>
  </div>
</template>

<style scoped>
.user-menu {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-width: 0;
}
img,
.avatar-fallback {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-fallback {
  display: grid;
  place-items: center;
  background: var(--green-soft);
  color: var(--green);
  font-weight: 850;
}
.account-details {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.user-name {
  max-width: 150px;
  overflow: hidden;
  font-size: 0.8rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.account-provider {
  color: var(--muted);
  font-size: 0.7rem;
}
button {
  min-width: 56px;
  min-height: 44px;
  padding: 0 4px;
  border: 0;
  border-radius: var(--radius);
  background: transparent;
  color: var(--muted);
  font-size: 0.75rem;
  white-space: nowrap;
}
button:hover {
  color: var(--danger);
  text-decoration: underline;
}
</style>
