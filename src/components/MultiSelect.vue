<template>
  <div class="multiselect" ref="containerRef">
    <div class="multiselect-control" @click="toggleOpen" role="button" tabindex="0">
      <div class="multiselect-tags">
        <template v-if="selectedItems.length">
          <span v-for="item in selectedItems" :key="getItemId(item)" class="tag" @click.stop>
            {{ getItemLabel(item) }}
            <button class="tag__x" @click="removeItem(getItemId(item))">×</button>
          </span>
        </template>
        <span v-else class="multiselect-placeholder">{{ placeholder }}</span>
      </div>
      <span class="multiselect-caret">▾</span>
    </div>

    <div v-if="isOpen" class="multiselect-dropdown" role="listbox">
      <div
        v-for="item in options"
        :key="getItemId(item)"
        class="multiselect-option"
        @click.stop="toggleItem(getItemId(item))"
      >
        <input
          class="multiselect-checkbox"
          type="checkbox"
          :checked="selectedIds.includes(getItemId(item))"
          @change.prevent
        />
        <span class="multiselect-label">{{ getItemLabel(item) }}</span>
      </div>

      <div v-if="!options.length" class="multiselect-empty">{{ emptyText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  options: unknown[]
  selectedIds: string[]
  placeholder?: string
  emptyText?: string
  getItemId?: (item: unknown) => string
  getItemLabel?: (item: unknown) => string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select items...',
  emptyText: 'No items available',
  getItemId: (item: unknown) => (item as { id: string }).id,
  getItemLabel: (item: unknown) =>
    (item as { name?: string; label?: string }).name ||
    (item as { label?: string }).label ||
    String(item),
})

const emit = defineEmits<{
  'update:selectedIds': [ids: string[]]
  toggle: [id: string]
  remove: [id: string]
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const selectedItems = computed(() => {
  return props.options.filter((item) => props.selectedIds.includes(props.getItemId(item)))
})

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function toggleItem(id: string) {
  emit('toggle', id)
}

function removeItem(id: string) {
  emit('remove', id)
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.multiselect {
  &-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 40px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 6px 10px;
    background: #fff;
    cursor: pointer;
  }

  &-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
  }

  &-placeholder {
    color: #94a3b8;
  }

  &-caret {
    margin-left: 8px;
    user-select: none;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 999px;
    background: #eef2ff;
    color: #1e293b;
    border: 1px solid #c7d2fe;
    font-size: 13px;
  }

  .tag__x {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0 2px;
    color: #475569;
  }

  &-dropdown {
    position: absolute;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    max-height: 260px;
    overflow: auto;
    padding: 6px;
    z-index: 10;
    max-width: 488px;
    width: 100%;
  }

  &-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
      background: #f8fafc;
    }
  }

  &-checkbox {
    pointer-events: none;
  }

  &-label {
    font-size: 14px;
    color: #111827;
  }

  &-empty {
    padding: 10px;
    color: #64748b;
    font-size: 14px;
    text-align: center;
  }
}
</style>
