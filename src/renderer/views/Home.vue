<template>
	<div class="home-container">
		<div class="toolbar">
			<n-space justify="space-between">
				<div>
					<n-checkbox v-model:checked="selectAll" @update:checked="toggleSelectAll">Выбрать все</n-checkbox>
				</div>
				<n-space>
					<n-button size="small" @click="downloadSelectedFiles" :disabled="!selectedFiles.length || isDownloading">
						Загрузить
						<n-icon v-if="isDownloading">
							<loading />
						</n-icon>
					</n-button>
					<n-button size="small" type="error" @click="deleteSelectedFiles"
						:disabled="!selectedFiles.length || isDeleting">
						Удалить
						<n-icon v-if="isDeleting">
							<loading />
						</n-icon>
					</n-button>
				</n-space>
			</n-space>
		</div>

		<n-list bordered>
			<n-list-item v-for="file in mediaFiles" :key="file.id">
				<n-space align="start" style="width: 100%">
					<n-checkbox :checked="isSelected(file.id)" @update:checked="toggleSelectFile(file.id)" />


					<n-collapse style="flex: 1">
						<n-collapse-item :title="file.fileName || 'Без имени'">
							<MediaFileDetails :file="file" />
							<div class="edit-button">
								<n-button size="small" @click="configureFile(file)">Редактировать</n-button>
							</div>
						</n-collapse-item>
					</n-collapse>

					<div class="preview">
						<img :src="file.source.thumbnail" alt="Preview" v-if="file.source.thumbnail" />
						<div v-else>Нет превью</div>
					</div>
				</n-space>
			</n-list-item>
		</n-list>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
	NButton,
	NList,
	NListItem,
	NCollapse,
	NCollapseItem,
	NCheckbox,
	NSpace,
	NIcon,
} from 'naive-ui';
import { useElectronBridge } from '../plugins/electron-bridge';
import type { MediaFile } from '../../shared/types/media-file';
import MediaFileDetails from './MediaFileDetails.vue';

const router = useRouter();
const bridge = useElectronBridge();
const mediaFiles = ref<MediaFile.Data[]>([]);
const selectedIds = ref<Set<string>>(new Set());
const selectAll = ref(false);
const isDownloading = ref(false);
const isDeleting = ref(false);

onMounted(async () => {
	await loadList();
});

async function loadList() {
	try {
		const list = await bridge.getList();
		mediaFiles.value = list;
	} catch (e) {
		console.error('Ошибка загрузки списка файлов', e);
	}
}

// Toggle select individual file
function toggleSelectFile(id: string) {
	if (selectedIds.value.has(id)) {
		selectedIds.value.delete(id);
	} else {
		selectedIds.value.add(id);
	}
}

// Check if file is selected
function isSelected(id: string) {
	return selectedIds.value.has(id);
}

// Toggle "Select All" checkbox
function toggleSelectAll(checked: boolean) {
	if (checked) {
		selectedIds.value = new Set(mediaFiles.value.map((f) => f.id));
	} else {
		selectedIds.value.clear();
	}
}

// Watch for selectAll changes and update the selected files
watch(selectAll, (val) => {
	if (val) {
		selectedIds.value = new Set(mediaFiles.value.map((f) => f.id));
	} else {
		selectedIds.value.clear();
	}
});

const selectedFiles = computed(() =>
	mediaFiles.value.filter((f) => selectedIds.value.has(f.id))
);

// Download selected files
async function downloadSelectedFiles() {
	isDownloading.value = true;
	try {
		for (const file of selectedFiles.value) {
			alert(`Downloading ${file.fileName}`);
		}
	} finally {
		isDownloading.value = false;
	}
}

// Delete selected files
async function deleteSelectedFiles() {
	isDeleting.value = true;
	try {
		for (const file of selectedFiles.value) {
			// await bridge.deleteFile(file.id); // Реализовать на стороне bridge
		}
		await loadList();
	} finally {
		isDeleting.value = false;
	}
}

// Configure selected file
function configureFile(file: MediaFile.Data) {
	router.push({ name: 'task-settings', query: { id: file.id } });
}
</script>

<style scoped>
.home-container {
	margin-top: 20px;
}

.toolbar {
	margin-bottom: 12px;
}

.preview {
	width: 240px;
	max-width: 240px;
	min-height: 80px;
	background: #f5f5f5;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px;
	overflow: hidden;
}

.preview img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}


.edit-button {
	margin-top: 10px;
	text-align: right;
}
</style>
