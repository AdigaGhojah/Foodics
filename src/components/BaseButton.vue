<template>
  <button :class="['button', variant, { disabled }]" :disabled="disabled" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
})

defineEmits<{ click: [] }>()
</script>

<style scoped lang="scss">
.button {
  padding: 8px 16px;
  background-color: #e2e8f0;
  color: #111827;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: filter 0.2s ease;

  &:hover {
    filter: brightness(0.95);
  }
}

.primary {
  background-color: #5f27cc;
  color: #fff;
}

.secondary {
  background-color: #e5e7eb;
  color: #111827;
}

.danger {
  background-color: #ef4444;
  color: #fff;
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
