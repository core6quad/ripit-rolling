<template>
	<div class="home-container">
		<n-button type="primary" @click="goToSettings">Settings</n-button>
		<n-button type="primary" @click="addSource">Add Source</n-button>
		<h2>Task List</h2>
		<n-list bordered>
			<n-list-item v-for="task in tasks" :key="task.id">
				<n-thing :title="`Task ${task.id}`" :description="task.text">
					<template #action>
						<n-space>
							<n-button size="small" @click="downloadTask(task.id)">Download</n-button>
							<n-button size="small" @click="configureTask(task.id)">Configure</n-button>
							<n-button size="small" type="error" @click="deleteTask(task.id)">Delete</n-button>
						</n-space>
					</template>
				</n-thing>
			</n-list-item>
		</n-list>
	</div>
</template>

<script setup>
import { NButton, NList, NListItem, NThing, NSpace } from 'naive-ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AddSource from './AddSource.vue'

const router = useRouter()

const tasks = ref([
	{ id: 1, text: 'Complete project documentation' },
	{ id: 2, text: 'Update database schema' },
	{ id: 3, text: 'Test API endpoints' }
])

const goToSettings = () => {
	router.push('/settings')
}

const downloadTask = (id) => {
	alert(`Downloading task ${id}`)
}

const addSource = () => {
	router.push('/add-source')
}

const configureTask = () => {
	router.push('/task-settings')
}

const deleteTask = (id) => {
	tasks.value = tasks.value.filter(task => task.id !== id)
}
</script>

<style scoped>
.home-container {
	margin-top: 20px;
}
</style>