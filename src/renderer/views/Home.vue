<template>
	<div class="home-container">
		<h2>Media Files List</h2>
		<n-list bordered>
			<n-list-item v-for="task in tasks" :key="task.id">
				<n-thing :title="task.fileName || 'Untitled'" :description="task.source.webpageUrl">
					<template #action>
						<n-space>
							<n-button size="small" @click="downloadTask(task)">Download</n-button>
							<n-button size="small" @click="configureTask(task)">Configure</n-button>
							<n-button size="small" type="error" @click="deleteMediaFile(task.id)">Delete</n-button>
						</n-space>
					</template>
				</n-thing>
			</n-list-item>
		</n-list>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NList, NListItem, NThing, NSpace } from 'naive-ui';
import { useElectronBridge } from '../plugins/electron-bridge';
import type { MediaFile } from '../../shared/types/media-file';

const router = useRouter();
const bridge = useElectronBridge();
const tasks = ref<MediaFile.Data[]>([]);

// Загрузка списка из ElectronBridge
async function loadList() {
	try {
		const list = await bridge.getList();
		console.log('[UI][GetList]', { list });
		tasks.value = list;
	} catch (e) {
		console.error('Failed to load tasks', e);
	}
}

onMounted(loadList);

// Обработчики действий
function downloadTask(task: MediaFile.Data) {
	alert(`Downloading ${task.fileName}`);
}

function configureTask(task: MediaFile.Data) {
	router.push({ name: 'task-settings', query: { id: task.id } });
}

async function deleteMediaFile(id: string) {
	// const list = await bridge.deleteFile(id);	
}
</script>

<style scoped>
.home-container {
	margin-top: 20px;
}
</style>
