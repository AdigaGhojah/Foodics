<template>
  <button
    :class="['button', color, variant, { disabled }]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  color?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  variant?: 'text' | 'contained' | 'outlined'
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
  disabled: false,
  variant: 'contained',
})

defineEmits<{ click: [] }>()
</script>

<style scoped lang="scss">
.button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: filter 0.2s ease;

  &:hover {
    filter: brightness(0.95);
  }
}

/* Color tokens */
.primary {
  --btn-bg: #5f27cc;
  --btn-fg: #ffffff;
  --btn-border: #5f27cc;
}
.secondary {
  --btn-bg: #e5e7eb;
  --btn-fg: #111827;
  --btn-border: #888888;
}
.danger {
  --btn-bg: #ef4444;
  --btn-fg: #ffffff;
  --btn-border: #ef4444;
}

/* Variants */
.contained {
  background-color: var(--btn-bg);
  color: var(--btn-fg);
  border: 1px solid transparent;
}

.outlined {
  background-color: transparent;
  color: var(--btn-border);
  border: 1px solid var(--btn-border);
}

.text {
  background-color: transparent;
  color: var(--btn-border);
  border: 1px solid transparent;
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
