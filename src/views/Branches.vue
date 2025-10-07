<template>
  <div class="app">
    <header class="header">
      <h1>Reservations</h1>
      <BaseButton variant="primary" @click="disableAllReservations"
        >Disable Reservations</BaseButton
      >
    </header>

    <main class="content">
      <BranchesTable
        :branches="branches"
        @add-branch="openAddModal"
        @edit-branch="openEditBranchModal"
      />
    </main>

    <footer class="footer">© 2025 My App</footer>

    <!-- Add Modal -->
    <AddBranchModal
      :is-open="showAddModal"
      :disabled-branches="disabledBranches"
      @close="closeAddModal"
      @add-branches="handleAddBranches"
    />

    <!-- Edit Modal -->
    <EditBranchModal
      :is-open="showEditModal"
      :branch="selectedBranch"
      :working-from="workingFrom"
      :working-to="workingTo"
      @close="closeEditModal"
      @save="handleSaveBranch"
    />
  </div>

  <p v-if="loading" style="padding: 8px">Loading…</p>
  <p v-else-if="error" style="padding: 8px; color: #b91c1c">{{ error }}</p>
</template>

<script setup lang="ts">
defineOptions({ name: 'BranchesView' })
import { ref, onMounted } from 'vue'
import type { Branch, BranchForm } from '@/types/branches'
import { useBranches } from '@/composables/useBranches'
import BranchesTable from '@/components/BranchesTable.vue'
import AddBranchModal from '@/components/AddBranchModal.vue'
import EditBranchModal from '@/components/EditBranchModal.vue'
import BaseButton from '@/components/BaseButton.vue'

// Use the branches composable
const {
  loading,
  branches,
  disabledBranches,
  error,
  loadBranches,
  updateBranchReservationStatus,
  updateBranch,
} = useBranches()

// Modal state
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedBranch = ref<Branch | null>(null)

// Simulated props — replace with real ones later
const workingFrom = '00:00'
const workingTo = '00:00'

// table options now derived inside EditBranchModal from branch.sections[*].tables

// Modal handlers
function openAddModal() {
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
}

function openEditBranchModal(branch: Branch) {
  selectedBranch.value = branch
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  selectedBranch.value = null
}

// Event handlers
async function handleAddBranches(branchIds: string[]) {
  try {
    await Promise.all(branchIds.map((id) => updateBranchReservationStatus(id, true, false)))
    await loadBranches()
    closeAddModal()
  } catch (e) {
    console.error('Failed to add branches:', e)
    alert('Failed to add branches')
  }
}

async function handleSaveBranch(form: BranchForm) {
  if (!selectedBranch.value) return

  try {
    await updateBranch(selectedBranch.value.id, form)
    // closeEditModal()
  } catch (e) {
    console.error('Failed to save branch:', e)
    alert('Failed to save branch')
  }
}

onMounted(loadBranches)

async function disableAllReservations() {
  try {
    // branches is a computed of enabled branches
    const current = branches.value
    await Promise.all(current.map((b) => updateBranchReservationStatus(b.id, false, false)))
    await loadBranches()
  } catch (e) {
    console.error('Failed to disable reservations for all branches:', e)
    alert('Failed to disable reservations for all branches')
  }
}
</script>

<style scoped lang="scss">
.app {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.header {
  padding: 16px;
  background: #fff;
  color: #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  padding: 40px;
  background-color: #eff3f6;
}

.footer {
  padding: 12px;
  background: #f2f2f2;
  text-align: center;
}
</style>
