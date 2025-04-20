<template>
    <n-page-header title="Task Manager">
        <n-breadcrumb>
            <n-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path">
                <router-link :to="item.path">{{ item.name }}</router-link>
            </n-breadcrumb-item>
        </n-breadcrumb>
    </n-page-header>
</template>

<script setup>
import { NBreadcrumb, NBreadcrumbItem, NPageHeader } from 'naive-ui'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbItems = computed(() => {
    const paths = route.path.split('/').filter(p => p)
    const items = [{ name: 'Home', path: '/' }]

    if (paths.includes('settings')) {
        items.push({ name: 'Settings', path: '/settings' })
    }
    if (paths.includes('task-settings')) {
        items.push({ name: 'Task Settings', path: '/task-settings' })
    }

    return items
})
</script>