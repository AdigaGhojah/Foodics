<template>
  <div :class="['time-slot', { invalid: !isValid }]">
    <!-- START TIME -->
    <div class="time-group">
      <input
        class="time-input"
        :value="getPart(startTime, 'h')"
        maxlength="2"
        inputmode="numeric"
        pattern="\d*"
        data-part="h"
        :data-field="0"
        @input="onTimePartInput($event, 0, 'h')"
        @paste="onTimePaste($event, 0)"
        @keydown.backspace="onPartBackspace($event, 0, 'h')"
      />
      <span>:</span>
      <input
        class="time-input"
        :value="getPart(startTime, 'm')"
        maxlength="2"
        inputmode="numeric"
        pattern="\d*"
        data-part="m"
        :data-field="0"
        @input="onTimePartInput($event, 0, 'm')"
        @keydown.backspace="onPartBackspace($event, 0, 'm')"
      />
    </div>

    <span>–</span>

    <!-- END TIME -->
    <div class="time-group">
      <input
        class="time-input"
        :value="getPart(endTime, 'h')"
        maxlength="2"
        inputmode="numeric"
        pattern="\d*"
        data-part="h"
        :data-field="1"
        @input="onTimePartInput($event, 1, 'h')"
        @paste="onTimePaste($event, 1)"
        @keydown.backspace="onPartBackspace($event, 1, 'h')"
      />
      <span>:</span>
      <input
        class="time-input"
        :value="getPart(endTime, 'm')"
        maxlength="2"
        inputmode="numeric"
        pattern="\d*"
        data-part="m"
        :data-field="1"
        @input="onTimePartInput($event, 1, 'm')"
        @keydown.backspace="onPartBackspace($event, 1, 'm')"
      />
    </div>

    <button class="delete-btn" @click="$emit('remove')">×</button>
    <span v-if="!isValid" class="slot-err"> Invalid slot </span>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  startTime: string
  endTime: string
  minDuration?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:startTime': [time: string]
  'update:endTime': [time: string]
  remove: []
  'validity-change': [isValid: boolean]
}>()

function getPart(v: string, part: 'h' | 'm'): string {
  const [h = '', m = ''] = (v || '').split(':')
  return part === 'h' ? h : m
}

function clampTime(part: 'h' | 'm', raw: string): string {
  let d = raw.replace(/\D/g, '').slice(0, 2)
  if (!d) return ''
  const n = Number(d)
  if (part === 'h') d = String(Math.min(23, n)).padStart(d.length === 2 ? 2 : d.length, '0')
  else d = String(Math.min(59, n)).padStart(d.length === 2 ? 2 : d.length, '0')
  return d.slice(0, 2)
}

function setSlotPart(field: 0 | 1, part: 'h' | 'm', val: string) {
  const currentTime = field === 0 ? props.startTime : props.endTime
  let [h = '', m = ''] = currentTime.split(':')
  if (part === 'h') h = val
  else m = val
  const combined =
    (h ? h.padStart(2, '0') : '') + (m !== '' ? `:${m.padStart(2, '0')}` : h && m === '' ? ':' : '')

  if (field === 0) {
    emit('update:startTime', combined)
  } else {
    emit('update:endTime', combined)
  }
}

function focusSibling(el: HTMLInputElement, want: 'm' | 'h') {
  const group = el.closest('.time-group') as HTMLElement | null
  if (!group) return
  const target = group.querySelector<HTMLInputElement>(`input[data-part="${want}"]`)
  target?.focus()
  target?.select()
}

function onTimePartInput(e: Event, field: 0 | 1, part: 'h' | 'm') {
  const input = e.target as HTMLInputElement
  const cleaned = input.value.replace(/\D/g, '').slice(0, 2)
  const clamped = clampTime(part, cleaned)
  input.value = clamped

  setSlotPart(field, part, clamped)

  if (part === 'h' && clamped.length === 2) {
    focusSibling(input, 'm')
  }
}

function onPartBackspace(e: KeyboardEvent, field: 0 | 1, part: 'h' | 'm') {
  const input = e.target as HTMLInputElement
  if (input.value.length === 0) {
    const currentTime = field === 0 ? props.startTime : props.endTime
    let [h = '', m = ''] = currentTime.split(':')
    if (part === 'h') h = '00'
    else m = '00'
    const newTime = `${h}:${m}`

    if (field === 0) {
      emit('update:startTime', newTime)
    } else {
      emit('update:endTime', newTime)
    }

    focusSibling(input, 'h')
  }
}

function onTimePaste(e: ClipboardEvent, field: 0 | 1) {
  const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 4)
  if (text.length >= 3) {
    e.preventDefault()
    const hh = clampTime('h', text.slice(0, 2))
    const mm = clampTime('m', text.slice(2, 4))
    setSlotPart(field, 'h', hh)
    setSlotPart(field, 'm', mm)
    const target = e.target as HTMLInputElement
    focusSibling(target, 'm')
  }
}

function toMinutes(v: string): number | null {
  const [hs, ms] = (v || '').split(':')
  if (hs === undefined || ms === undefined || hs === '' || ms === '') return null
  const h = Number(hs)
  const m = Number(ms)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

const isValid = computed(() => {
  const start = toMinutes(props.startTime)
  const end = toMinutes(props.endTime)
  if (start === null || end === null) return false
  if (end < start) return false
  if (props.minDuration && end - start < props.minDuration) return false
  return true
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
