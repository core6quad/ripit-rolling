import {
  createRouter,
  createWebHashHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw
} from 'vue-router'

import Home from '../views/Home.vue'
import Settings from '../views/Settings.vue'
import TaskSettings from '../views/TaskSettings.vue'
import AddSource from '../views/AddSource.vue'

import {
  HomeOutline,
  SettingsOutline,
  AddCircleOutline,
  ListOutline
} from '@vicons/ionicons5'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Home',
      breadcrumb: 'Home',
      icon: HomeOutline
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: 'Settings',
      breadcrumb: 'Settings',
      icon: SettingsOutline
    }
  },
  {
    path: '/task-settings',
    name: 'TaskSettings',
    component: TaskSettings,
    meta: {
      title: 'Task Settings',
      breadcrumb: 'Task Settings',
      icon: ListOutline
    }
  },
  {
    path: '/add-source',
    name: 'AddSource',
    component: AddSource,
    meta: {
      title: 'Add Source',
      breadcrumb: 'Add Source',
      icon: AddCircleOutline
    }
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Extended meta type to include custom fields
interface RouteMeta {
  title?: string
  breadcrumb?: string
  icon?: any
}

// Set dynamic title and breadcrumb metadata
router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const meta = to.meta as RouteMeta

  // Update document title dynamically
  const title = meta?.title ? `${meta.title.replace(' Page', '')} - Ripit Downloader` : 'Ripit Downloader'
  document.title = title

  // Breadcrumb and icon meta values are available on each route for use in header
  // Use them in header UI, no mutation here
  next()
})
