<template>
	<div class="home-container">
		<div class="toolbar">
			<n-space justify="space-between">
				<div>
					<n-checkbox v-model:checked="selectAll" @update:checked="toggleSelectAll">
						Select All
					</n-checkbox>
				</div>
				<n-space>
					<n-button size="small" @click="downloadSelectedFiles" :disabled="!selectedFiles.length || isDownloading">
						Download
						<n-icon v-if="isDownloading">
							<loading />
						</n-icon>
					</n-button>
					<n-button size="small" type="error" @click="deleteSelectedFiles"
						:disabled="!selectedFiles.length || isDeleting">
						Delete
						<n-icon v-if="isDeleting">
							<loading />
						</n-icon>
					</n-button>
				</n-space>
			</n-space>
		</div>

		<n-list bordered>
			<n-list-item v-for="file in mediaFiles" :key="file.id">
				<n-collapse>
					<n-collapse-item>
						<!-- Заголовок плашки -->
						<template #header>
							<div class="list-item-header">
								<div class="header-left">
									<n-checkbox :checked="isSelected(file.id)" @update:checked="toggleSelectFile(file.id)" />
								</div>
								<div class="header-center">
									<div class="file-name">
										<n-ellipsis :line-clamp="2">{{ file.source.title }}</n-ellipsis>
									</div>

									<n-space size="small" align="center" wrap>
										<n-tag type="info" :bordered="false">{{ file.source.extractor }} : {{ file.source.id }}</n-tag>
										<!-- <n-tag type="info" :bordered="false">{{ file.source.id }}</n-tag> -->

										<n-tooltip trigger="hover">
											<template #trigger>
												<n-button quaternary size="tiny" @click.stop="copyUrl(file.source.webpageUrl)">
													<template #icon>
														<n-icon>
															<CopyOutline />
														</n-icon>
													</template>
												</n-button>
											</template>
											Copy URL to clipboard
										</n-tooltip>

										<n-tooltip trigger="hover">
											<template #trigger>
												<n-button quaternary size="tiny" @click.stop="openUrl(file.source.webpageUrl)">
													<template #icon>
														<n-icon>
															<OpenOutline />
														</n-icon>
													</template>
												</n-button>
											</template>
											Open in browser
										</n-tooltip>
									</n-space>

									<n-space size="small" wrap>
										<n-tooltip v-for="track in file.trackIds" :key="track.formatId" trigger="hover" placement="bottom">
											<template #trigger>
												<n-tag :type="getTrackType(track)" :bordered="false" size="small">
													<n-icon :component="CheckmarkCircle" />
													{{ track.formatId }}
												</n-tag>
											</template>
											<span>{{ track.format }} / {{ track.ext }}</span>
										</n-tooltip>
									</n-space>

								</div>

								<div class="header-right">
									<img :src="file.source.thumbnail" alt="Preview" v-if="file.source.thumbnail" />
									<div v-else class="no-preview">Нет превью</div>
								</div>
							</div>
						</template>

						<!-- Детали при раскрытии -->
						<div class="collapse-body">
							<MediaFileDetails :file="file" />
							<div class="edit-button">
								<n-button size="small" @click="configureFile(file)">Редактировать</n-button>
							</div>
						</div>
					</n-collapse-item>
				</n-collapse>
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
import { CheckmarkCircle, CopyOutline, OpenOutline } from '@vicons/ionicons5'; // или любой другой набор иконок
import { useMessage } from 'naive-ui';



const router = useRouter();
const bridge = useElectronBridge();
const mediaFiles = ref<MediaFile.Data[]>([]);
const selectedIds = ref<Set<string>>(new Set());
const selectAll = ref(false);
const isDownloading = ref(false);
const isDeleting = ref(false);

onMounted(loadList);

async function loadList() {
	try {
		const list = await bridge.getList();
		mediaFiles.value = list;
	} catch (e) {
		console.error('Ошибка загрузки списка файлов', e);
	}
}

function toggleSelectFile(id: string) {
	if (selectedIds.value.has(id)) {
		selectedIds.value.delete(id);
	} else {
		selectedIds.value.add(id);
	}
}

function isSelected(id: string) {
	return selectedIds.value.has(id);
}

function toggleSelectAll(checked: boolean) {
	if (checked) {
		selectedIds.value = new Set(mediaFiles.value.map((f) => f.id));
	} else {
		selectedIds.value.clear();
	}
}

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

async function deleteSelectedFiles() {
	isDeleting.value = true;
	try {
		for (const file of selectedFiles.value) {
			// await bridge.deleteFile(file.id); // TODO: реализация на стороне Electron
		}
		await loadList();
	} finally {
		isDeleting.value = false;
	}
}

function configureFile(file: MediaFile.Data) {
	router.push({ name: 'task-settings', query: { id: file.id } });
}

function getTrackType(track: MediaFile.Track): 'success' | 'warning' | 'error' | 'default' {
	switch (true) {
		case track.hasVideo && track.hasAudio:
			return 'error';
		case track.hasVideo:
			return 'success';
		case track.hasAudio:
			return 'warning';
		default:
			return 'default';
	}
}

const message = useMessage();

function copyUrl(url: string) {
	navigator.clipboard.writeText(url).then(() => {
		message.success('Ссылка скопирована');
	}).catch(() => {
		message.error('Ошибка копирования');
	});
}

async function openUrl(url: string) {
	try {
		// await bridge.openExternal(url);
	} catch (e) {
		message.error('Не удалось открыть ссылку');
	}
}
</script>

<style scoped>
.home-container {
	margin-top: 20px;
}

.toolbar {
	margin-bottom: 12px;
}

.list-item-header {
	display: flex;
	align-items: flex-start;
	width: 100%;
	gap: 16px;
}

.header-left {
	padding-top: 4px;
}

.header-center {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	font-size: 14px;
}

.file-name {
	font-weight: 600;
}

.source-line {
	color: #888;
}

.track-ids {
	color: #444;
	font-size: 12px;
}

.header-right {
	width: 180px;
	height: 100px;
	background: #f5f5f5;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
}

.header-right img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.no-preview {
	font-size: 12px;
	color: #999;
	text-align: center;
}

.collapse-body {
	padding-top: 8px;
}

.edit-button {
	margin-top: 10px;
	text-align: right;
}
</style>
