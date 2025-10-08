import { ref, computed } from 'vue'
import { getJSON, putJSON } from '@/lib/api'
import type { Branch, Response, BranchForm } from '@/types/branches'

export function useBranches() {
  const loading = ref(false)
  const branches = ref<Branch[]>([])
  const disabledBranches = ref<Branch[]>([])
  const error = ref<string | null>(null)

  const enabledBranches = computed(() => {
    return branches.value.filter((branch) => branch.accepts_reservations === true)
  })

  async function loadBranches() {
    loading.value = true

    error.value = null
    try {
      const res = await getJSON<Response>(
        '/branches?include[0]=sections&include[1]=sections.tables',
      )
      disabledBranches.value = []
      branches.value = res.data.filter((branch) => {
        if (branch.accepts_reservations === true) {
          const sections = branch.sections || []
          let total = 0
          for (const section of sections) {
            total += (section.tables || []).filter((t) => t.accepts_reservations).length
          }
          branch.numberOfTables = total
          return branch
        } else {
          disabledBranches.value.push(branch)
        }
      })
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load branches'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function updateBranchReservationStatus(
    branchId: string,
    accepts: boolean = true,
    reload: boolean = true,
  ) {
    loading.value = true

    try {
      await putJSON<Branch>(`/branches/${branchId}`, { accepts_reservations: accepts })
      if (reload) {
        await loadBranches()
      }
    } catch (e) {
      console.error('Update failed:', e)
      throw new Error('Failed to update branch reservation status')
    } finally {
      loading.value = false
    }
  }

  async function updateBranch(branchId: string, data: BranchForm) {
    loading.value = true

    try {
      await putJSON<Branch>(`/branches/${branchId}`, data)
      await loadBranches()
    } catch (e: unknown) {
      console.error('Update failed:', e)
      throw new Error('Failed to update branch')
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    branches: enabledBranches,
    disabledBranches,
    error,
    loadBranches,
    updateBranchReservationStatus,
    updateBranch,
  }
}
