<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal" :style="{ maxWidth }" ref="modalRef">
      <header class="modal__header">
        <slot name="header">
          <h2 class="modal__title">{{ title }}</h2>
        </slot>
        <button class="icon-btn" @click="$emit('close')">✕</button>
      </header>

      <div class="modal__body">
        <slot />
      </div>

      <footer class="modal__footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  title?: string
  maxWidth?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  maxWidth: '520px',
})

defineEmits<{ close: [] }>()
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.modal {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  outline: none;
}

.modal {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid #eee;
  }

  &__body {
    padding: 16px;
    max-height: 500px;
    overflow-y: auto;
  }

  &__footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding: 12px;
  }
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.modal__title {
  font-size: 18px;
}
</style>
