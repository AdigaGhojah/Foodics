import { createRouter, createWebHistory } from 'vue-router'
import Branches from '@/views/Branches.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Branches',
      component: Branches,
    },
  ],
})

export default router
