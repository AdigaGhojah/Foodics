<template>
  <div class="loading-spinner overlay">
    <div class="spinner"></div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Loading...',
})
</script>

<style scoped lang="scss">
.loading-spinner {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;

  &.overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 1000;
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #5f27cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-message {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
