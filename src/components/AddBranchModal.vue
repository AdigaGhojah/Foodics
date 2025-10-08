<template>
  <BaseModal :is-open="isOpen" title="Add Branches" @close="$emit('close')">
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

    <template #footer>
      <BaseButton color="secondary" @click="$emit('close')">Cancel</BaseButton>
      <BaseButton :disabled="!selectedBranchIds.length || isAdding" @click="addSelectedBranches">
        Add Branches
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Branch } from '@/types/branches'
import MultiSelect from './MultiSelect.vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import { useBranches, disabledBranches } from '@/composables/useBranches'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const selectedBranchIds = ref<string[]>([])
const errors = reactive<{ [K in keyof Branch]?: string }>({})
const isAdding = ref(false)

const { updateBranchReservationStatus, loadBranches } = useBranches()

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

async function addSelectedBranches() {
  if (!selectedBranchIds.value.length) return

  isAdding.value = true
  try {
    await Promise.all(
      selectedBranchIds.value.map((id) => updateBranchReservationStatus(id, true, false)),
    )
    await loadBranches()
    selectedBranchIds.value = []
    emit('close')
  } catch (e) {
    console.error('Failed to add branches:', e)
    alert('Failed to add branches')
  } finally {
    isAdding.value = false
  }
}
</script>

<style scoped lang="scss">
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
</style>
