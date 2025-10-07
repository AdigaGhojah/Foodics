<template>
  <div
    v-if="isOpen"
    class="modal-backdrop"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
  >
    <div class="modal" role="dialog" ref="modalRef">
      <header class="modal__header">
        <h2 id="addBranchTitle">Add Branches</h2>
        <button class="icon-btn" @click="$emit('close')">✕</button>
      </header>

      <div class="modal__body">
        <div class="field">
          <label for="name">Branches</label>
          <p v-if="errors.name" class="err">{{ errors.name }}</p>
          <MultiSelect
            :options="disabledBranches"
            :selected-ids="selectedBranchIds"
            placeholder="Select branches…"
            empty-text="No disabled branches"
            @toggle="toggleBranch"
            @remove="removeBranch"
          />
        </div>
      </div>

      <footer class="modal__footer">
        <button type="button" class="button" @click="$emit('close')">Cancel</button>
        <button type="submit" class="button primary">Save</button>
        <div class="ms-actions">
          <button class="button" :disabled="!selectedBranchIds.length" @click="addSelectedBranches">
            Add Branches
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Branch } from '@/types/branches'
import MultiSelect from './MultiSelect.vue'

interface Props {
  isOpen: boolean
  disabledBranches: Branch[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'add-branches': [branchIds: string[]]
}>()

const modalRef = ref<HTMLElement | null>(null)
const selectedBranchIds = ref<string[]>([])
const errors = reactive<{ [K in keyof Branch]?: string }>({})

function toggleBranch(id: string) {
  const index = selectedBranchIds.value.indexOf(id)
  if (index >= 0) {
    selectedBranchIds.value.splice(index, 1)
  } else {
    selectedBranchIds.value.push(id)
  }
}

function removeBranch(id: string) {
  const index = selectedBranchIds.value.indexOf(id)
  if (index >= 0) {
    selectedBranchIds.value.splice(index, 1)
  }
}

function addSelectedBranches() {
  if (!selectedBranchIds.value.length) return
  emit('add-branches', selectedBranchIds.value)
  selectedBranchIds.value = []
}
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
  max-width: 520px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  outline: none;
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
}

.modal__body {
  padding: 16px;
}

.modal__footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 8px;
  padding: 0 12px 12px;
}

.field {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;

  label {
    font-size: 14px;
    color: #222;
  }

  .err {
    color: #b91c1c;
    font-size: 12px;
  }
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.button {
  padding: 8px 16px;
  background-color: #5f27cc;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: filter 0.2s ease;

  &:hover {
    filter: brightness(0.95);
  }

  &.primary {
    background-color: #5f27cc;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.ms-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
