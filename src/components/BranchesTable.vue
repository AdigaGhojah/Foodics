<template>
  <div class="table-container">
    <div class="table-header">
      <button class="button secondary" @click="$emit('add-branch')">Add Branches</button>
    </div>

    <table class="branches-table">
      <thead>
        <tr>
          <th>Branch</th>
          <th>Reference</th>
          <th>Number Of Tables</th>
          <th>Reservation Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(branch, i) in branches" :key="i" @click="$emit('edit-branch', branch)">
          <td>{{ branch.name }}</td>
          <td>{{ branch.reference || '--' }}</td>
          <td>{{ branch.numberOfTables || 0 }}</td>
          <td>{{ branch.reservation_duration }} Minutes</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Branch } from '@/types/branches'

interface Props {
  branches: Branch[]
}

defineProps<Props>()

defineEmits<{
  'add-branch': []
  'edit-branch': [branch: Branch]
}>()
</script>

<style scoped lang="scss">
.table-container {
  max-width: 1440px;
  margin: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  border-radius: 16px;

  .table-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 16px;
  }
}

.branches-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border: none;
    border-top: 1px solid #ccc;
    padding: 8px 12px;
    text-align: left;
    vertical-align: middle;
  }

  tr {
    cursor: pointer;
    &:hover {
      background: #f9f9f9;
    }
  }

  thead th {
    background: #fafafa;
    font-weight: 600;
  }
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

  &.secondary {
    background-color: #fff;
    border: 1px solid #aaa;
    color: #333;

    &:hover {
      background-color: #f2f2f2;
    }
  }
}
</style>
