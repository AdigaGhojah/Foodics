<template>
  <BaseModal
    :is-open="isOpen"
    :title="`Edit ${branch?.name ?? ''} branch reservation settings`"
    @close="$emit('close')"
  >
    <div class="notice">Branch working hours are 00:00 - 00:00</div>

    <div class="modal__body">
      <!-- Reservation Duration -->
      <div class="field">
        <label>Reservation Duration (minutes) <span class="required">*</span></label>
        <input type="text" v-model="form.reservation_duration" required @input="onNumberInput" />
        <p v-if="!form.reservation_duration" class="err">This field is required</p>
      </div>

      <!-- Tables -->
      <div class="field">
        <label>Tables</label>
        <MultiSelect
          :options="tableOptions"
          :selected-ids="form.table_ids"
          placeholder="Select tables..."
          empty-text="No tables available"
          :get-item-label="getTableLabel"
          @toggle="toggleTable"
          @remove="removeTable"
        />
      </div>

      <!-- Days and Slots -->
      <div class="days">
        <div v-for="day in days" :key="day" class="day">
          <div class="day-header">
            <span class="day-label">{{ capitalize(day) }}</span>
            <button
              v-if="day === 'saturday'"
              type="button"
              class="apply-btn"
              @click="applySaturdayToAll"
            >
              Apply on all days
            </button>
          </div>

          <div class="slots">
            <span class="placeholder" v-if="form.reservation_times[day]?.length == 0">
              Add Available Reservation Times
            </span>
            <TimeSlot
              v-for="(slot, i) in form.reservation_times[day] || []"
              :key="i"
              :start-time="slot[0]"
              :end-time="slot[1]"
              :min-duration="form.reservation_duration"
              @update:start-time="updateSlotTime(day, i, 0, $event)"
              @update:end-time="updateSlotTime(day, i, 1, $event)"
              @remove="removeSlot(day, i)"
              @validity-change="onSlotValidityChange(day, i, $event)"
            />
            <button
              class="add"
              :disabled="(form.reservation_times[day]?.length || 0) >= 3"
              @click="addSlot(day)"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="footer-container">
        <BaseButton color="danger" variant="text" @click="disableReservations"
          >Disable Reservations</BaseButton
        >
        <div class="footer-buttons">
          <BaseButton color="secondary" variant="outlined" @click="$emit('close')"
            >Cancel</BaseButton
          >
          <BaseButton color="primary" :disabled="isSaving" @click="saveBranch">Save</BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue'
import type { Branch, TableOption, BranchForm } from '@/types/branches'
import MultiSelect from './MultiSelect.vue'
import TimeSlot from './TimeSlot.vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import { useBranches } from '@/composables/useBranches'

interface Props {
  isOpen: boolean
  branch: Branch | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const form = reactive<BranchForm>({
  reservation_duration: 30,
  table_ids: [],
  reservation_times: Object.fromEntries(days.map((d) => [d, []])) as Record<
    string,
    [string, string][]
  >,
})

const invalidSlots = reactive<Record<string, Record<number, boolean>>>({})
const isSaving = ref(false)

const tableOptions = computed<TableOption[]>(() => {
  if (!props.branch) return []
  const sections = props.branch.sections || []
  const options: TableOption[] = []
  for (const section of sections) {
    for (const table of section.tables || []) {
      options.push({ id: table.id, section_name: section.name, table_name: table.name })
    }
  }
  return options
})

function getTableLabel(item: unknown) {
  const t = item as TableOption
  return `${t.section_name} - ${t.table_name}`
}

watch(
  () => props.branch,
  (newBranch) => {
    if (newBranch) {
      form.reservation_duration = newBranch.reservation_duration
      const selectedIds: string[] = []
      for (const section of newBranch.sections || []) {
        for (const table of section.tables || []) {
          if (table.accepts_reservations) selectedIds.push(table.id)
        }
      }
      form.table_ids = selectedIds
      form.reservation_times = { ...newBranch.reservation_times }
    }
  },
  { immediate: true },
)

function onNumberInput(e: Event) {
  const input = e.target as HTMLInputElement
  input.value = input.value.replace(/\D/g, '')
  form.reservation_duration = input.value ? parseInt(input.value, 10) : 0
}

function toggleTable(id: string) {
  const index = form.table_ids.indexOf(id)
  if (index >= 0) {
    form.table_ids.splice(index, 1)
  } else {
    form.table_ids.push(id)
  }
}

function removeTable(id: string) {
  form.table_ids = form.table_ids.filter((tid) => tid !== id)
}

function addSlot(day: string) {
  if (!form.reservation_times[day]) {
    form.reservation_times[day] = []
  }
  if (form.reservation_times[day].length < 3) {
    const startTime = '00:00'
    const endTime = minutesToTime(form.reservation_duration)
    form.reservation_times[day].push([startTime, endTime])
  }
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function removeSlot(day: string, index: number) {
  if (form.reservation_times[day]) {
    form.reservation_times[day].splice(index, 1)
  }
}

function updateSlotTime(day: string, index: number, field: 0 | 1, time: string) {
  if (form.reservation_times[day] && form.reservation_times[day][index]) {
    form.reservation_times[day][index][field] = time
  }
}

function onSlotValidityChange(day: string, index: number, isValid: boolean) {
  if (!invalidSlots[day]) invalidSlots[day] = {}
  invalidSlots[day][index] = !isValid
}

function applySaturdayToAll() {
  const saturdaySlots = form.reservation_times['saturday']
  if (saturdaySlots) {
    for (const day of days) {
      if (day !== 'saturday') {
        form.reservation_times[day] = JSON.parse(JSON.stringify(saturdaySlots))
      }
    }
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

async function saveBranch() {
  if (!form.reservation_duration) {
    return
  }
  for (const day in invalidSlots) {
    const indices = invalidSlots[day]
    if (indices && Object.values(indices).some((v) => v)) return
  }

  if (!props.branch) return

  isSaving.value = true
  try {
    await updateBranch(props.branch.id, { ...form })
    emit('close')
  } catch (e) {
    console.error('Failed to save branch:', e)
    alert('Failed to save branch')
  } finally {
    isSaving.value = false
  }
}

const { updateBranchReservationStatus, updateBranch } = useBranches()

async function disableReservations() {
  if (!props.branch) return
  try {
    await updateBranchReservationStatus(props.branch.id, false)
    emit('close')
  } catch (e) {
    console.error('Failed to disable reservation for branch:', e)
    alert('Failed to disable reservation')
  }
}
</script>

<style scoped lang="scss">
.notice {
  margin-top: 10px;
  background: #eaf2ff;
  padding: 10px;
  border-radius: 8px;
}

.field {
  margin-top: 12px;
  display: grid;
  gap: 6px;

  label {
    font-size: 14px;
    color: #222;
  }

  input {
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  .err {
    color: #b91c1c;
    font-size: 12px;
  }
}

.required {
  color: #b91c1c;
}

.days {
  display: grid;
  gap: 12px;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 6px;
  padding-right: 40px;
  position: relative;
  min-height: 48px;

  .add {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.placeholder {
  color: #888;
  font-size: 12px;
  user-select: none;
}

.add {
  border: 1px solid #ccc;
  background: white;
  border-radius: 999px;
  width: 20px;
  height: 20px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.apply-btn {
  background: none;
  border: none;
  color: #6d28d9;
  cursor: pointer;
  font-size: 14px;
}
.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.footer-buttons {
  display: flex;
  gap: 8px;
}
</style>
