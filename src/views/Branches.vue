<template>
  <div class="app">
    <header class="header">
      <h1>Reservations</h1>
      <BaseButton color="primary" @click="disableAllReservations">Disable Reservations</BaseButton>
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
      :branches-composable="branchesComposable"
      @close="closeAddModal"
    />

    <!-- Edit Modal -->
    <EditBranchModal
      :is-open="showEditModal"
      :branch="selectedBranch"
      :branches-composable="branchesComposable"
      @close="closeEditModal"
    />
  </div>
  <LoadingSpinner v-if="loading" message="Loading branches..." />
</template>

<script setup lang="ts">
defineOptions({ name: 'BranchesView' })
import { ref, onMounted } from 'vue'
import type { Branch } from '@/types/branches'
import { useBranches } from '@/composables/useBranches'
import BranchesTable from '@/components/BranchesTable.vue'
import AddBranchModal from '@/components/AddBranchModal.vue'
import EditBranchModal from '@/components/EditBranchModal.vue'
import BaseButton from '@/components/BaseButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const branchesComposable = useBranches()
const { loading, branches, disabledBranches, loadBranches, updateBranchReservationStatus } =
  branchesComposable

const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedBranch = ref<Branch | null>(null)

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

onMounted(loadBranches)

async function disableAllReservations() {
  try {
    const currentBranches = branches.value
    await Promise.all(currentBranches.map((b) => updateBranchReservationStatus(b.id, false, false)))
    loadBranches()
  } catch (e) {
    console.error('Failed to disable reservations for all branches:', e)
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
