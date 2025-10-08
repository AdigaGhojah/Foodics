<template>
  <div :class="['time-slot', { invalid: !isValid }]">
    <div class="time-group">
      <input
        class="time-input"
        :value="startHours"
        maxlength="2"
        @input="updateTime('start', 'hours', $event)"
        @paste="handlePaste('start', $event)"
        @keydown.backspace="handleBackspace('start', 'hours', $event)"
      />
      <span>:</span>
      <input
        class="time-input"
        :value="startMinutes"
        maxlength="2"
        @input="updateTime('start', 'minutes', $event)"
        @keydown.backspace="handleBackspace('start', 'minutes', $event)"
      />
    </div>

    <span>–</span>

    <div class="time-group">
      <input
        class="time-input"
        :value="endHours"
        maxlength="2"
        @input="updateTime('end', 'hours', $event)"
        @paste="handlePaste('end', $event)"
        @keydown.backspace="handleBackspace('end', 'hours', $event)"
      />
      <span>:</span>
      <input
        class="time-input"
        :value="endMinutes"
        maxlength="2"
        @input="updateTime('end', 'minutes', $event)"
        @keydown.backspace="handleBackspace('end', 'minutes', $event)"
      />
    </div>

    <button class="delete-btn" @click="$emit('remove')">×</button>
    <span v-if="!isValid" class="slot-err">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  startTime: string
  endTime: string
  minDuration?: number
  hasOverlap?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:startTime': [time: string]
  'update:endTime': [time: string]
  remove: []
  'validity-change': [isValid: boolean]
}>()

// Computed properties for cleaner template
const startHours = computed(() => props.startTime.split(':')[0] || '')
const startMinutes = computed(() => props.startTime.split(':')[1] || '')
const endHours = computed(() => props.endTime.split(':')[0] || '')
const endMinutes = computed(() => props.endTime.split(':')[1] || '')

// Utility functions
const clampValue = (value: string, max: number): string => {
  const num = Math.min(max, Math.max(0, parseInt(value.replace(/\D/g, ''), 10) || 0))
  return num.toString().padStart(2, '0')
}

const formatTime = (hours: string, minutes: string): string => {
  const h = hours ? clampValue(hours, 23) : ''
  const m = minutes ? clampValue(minutes, 59) : ''
  return h && m ? `${h}:${m}` : h || m ? `${h || '00'}:${m || '00'}` : ''
}

const toMinutes = (time: string): number | null => {
  const [h, m] = time.split(':')
  if (!h || !m) return null
  const hours = parseInt(h, 10)
  const minutes = parseInt(m, 10)
  if (isNaN(hours) || isNaN(minutes)) return null
  return hours * 60 + minutes
}

// Event handlers
const updateTime = (type: 'start' | 'end', part: 'hours' | 'minutes', event: Event) => {
  const input = event.target as HTMLInputElement
  const inputEvent = event as InputEvent

  if (inputEvent.data && !/^\d$/.test(inputEvent.data)) {
    input.value = input.value.replace(inputEvent.data, '')
    return
  }

  const value = input.value.replace(/\D/g, '').slice(0, 2)

  const clampedValue = part === 'hours' ? clampValue(value, 23) : clampValue(value, 59)

  if (clampedValue !== value) {
    input.value = clampedValue
  }

  if (type === 'start') {
    const newTime = formatTime(
      part === 'hours' ? clampedValue : startHours.value,
      part === 'minutes' ? clampedValue : startMinutes.value,
    )

    emit('update:startTime', newTime)

    if (part === 'hours' && clampedValue.length === 2) {
      focusNextInput(input, 'minutes')
    }
  } else {
    const newTime = formatTime(
      part === 'hours' ? clampedValue : endHours.value,
      part === 'minutes' ? clampedValue : endMinutes.value,
    )
    emit('update:endTime', newTime)

    if (part === 'hours' && clampedValue.length === 2) {
      focusNextInput(input, 'minutes')
    }
  }
}

const handleBackspace = (
  type: 'start' | 'end',
  part: 'hours' | 'minutes',
  event: KeyboardEvent,
) => {
  const input = event.target as HTMLInputElement
  if (input.value.length === 0) {
    // Clear the field and focus previous
    if (type === 'start') {
      emit('update:startTime', part === 'hours' ? '00:00' : `${startHours.value}:00`)
    } else {
      emit('update:endTime', part === 'hours' ? '00:00' : `${endHours.value}:00`)
    }
    focusNextInput(input, 'hours')
  }
}

const handlePaste = (type: 'start' | 'end', event: ClipboardEvent) => {
  const text = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 4)
  if (text.length >= 3) {
    event.preventDefault()
    const hours = clampValue(text.slice(0, 2), 23)
    const minutes = clampValue(text.slice(2, 4), 59)
    const newTime = `${hours}:${minutes}`

    if (type === 'start') {
      emit('update:startTime', newTime)
    } else {
      emit('update:endTime', newTime)
    }

    const input = event.target as HTMLInputElement
    focusNextInput(input, 'minutes')
  }
}

const focusNextInput = (currentInput: HTMLInputElement, target: 'hours' | 'minutes') => {
  const group = currentInput.closest('.time-group')
  if (!group) return

  const selector = target === 'hours' ? 'input:first-child' : 'input:last-child'
  const targetInput = group.querySelector(selector) as HTMLInputElement
  targetInput?.focus()
  targetInput?.select()
}

const isValid = computed(() => {
  const start = toMinutes(props.startTime)
  const end = toMinutes(props.endTime)

  if (start === null || end === null) return false
  if (end <= start) return false
  if (props.minDuration && end - start < props.minDuration) return false
  if (props.hasOverlap) return false

  return true
})

const errorMessage = computed(() => {
  if (props.hasOverlap) return 'Overlaps with another slot'

  const start = toMinutes(props.startTime)
  const end = toMinutes(props.endTime)

  if (start === null || end === null) return 'Invalid time'
  if (end <= start) return 'End must be after start'
  if (props.minDuration && end - start < props.minDuration) {
    return `Minimum ${props.minDuration} minutes`
  }

  return 'Invalid slot'
})

watch(isValid, (v) => emit('validity-change', v), { immediate: true })
</script>

<style scoped lang="scss">
.time-slot {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid #9f7aea;
  border-radius: 999px;
  position: relative;

  &.invalid {
    border-color: #ef4444;
  }

  .time-group {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .time-input {
    width: 20px;
    border: none;
    outline: none;
    background: transparent;
    text-align: center;
    font-size: 14px;
  }

  .delete-btn {
    position: absolute;
    right: -6px;
    top: -6px;
    border: 1px solid #ccc;
    background: white;
    border-radius: 999px;
    width: 20px;
    height: 20px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.slot-err {
  color: #b91c1c;
  font-size: 12px;
  margin-left: 6px;
}
</style>
