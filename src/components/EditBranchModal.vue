<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal" ref="modalRef">
      <header class="modal__header">
        <h2>Edit {{ branch?.name }} branch reservation settings</h2>
        <button class="icon-btn" @click="$emit('close')">✕</button>
      </header>

      <div class="notice">Branch working hours are {{ workingFrom }} - {{ workingTo }}</div>

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
            :get-item-label="(item) => `${item.section_name} - ${item.table_name}`"
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
                @update:start-time="updateSlotTime(day, i, 0, $event)"
                @update:end-time="updateSlotTime(day, i, 1, $event)"
                @remove="removeSlot(day, i)"
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

      <footer class="modal__footer">
        <button class="button" @click="$emit('close')">Cancel</button>
        <button class="button primary" @click="saveBranch">Save</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { Branch, TableOption, BranchForm } from '@/types/branches'
import MultiSelect from './MultiSelect.vue'
import TimeSlot from './TimeSlot.vue'

interface Props {
  isOpen: boolean
  branch: Branch | null
  workingFrom?: string
  workingTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  workingFrom: '00:00',
  workingTo: '00:00',
})

const emit = defineEmits<{
  close: []
  save: [form: BranchForm]
}>()

const modalRef = ref<HTMLElement | null>(null)
const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const form = reactive<BranchForm>({
  reservation_duration: 30,
  table_ids: [],
  reservation_times: Object.fromEntries(days.map((d) => [d, []])) as Record<
    string,
    [string, string][]
  >,
})

// Build tableOptions from branch.sections[*].tables
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

// Watch for branch changes to populate form
watch(
  () => props.branch,
  (newBranch) => {
    if (newBranch) {
      form.reservation_duration = newBranch.reservation_duration
      // Preselect tables that accept reservations
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
  // Remove non-digit characters
  input.value = input.value.replace(/\D/g, '')
  // Update model
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
    form.reservation_times[day].push(['11:00', '17:00'])
  }
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

function saveBranch() {
  emit('save', { ...form })
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
</style>
