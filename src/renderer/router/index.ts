import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Settings from '../views/Settings.vue';
import TaskSettings from '../views/TaskSettings.vue';
import type { RouteRecordRaw } from 'vue-router';
import AddSource from '../views/AddSource.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/task-settings',
    name: 'TaskSettings',
    component: TaskSettings
  },
  {
    path: '/add-source',
    name: 'AddSource',
    component: AddSource
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

// export default router