<template>
	<n-card :title="isNew ? 'New Media File' : 'Edit Media File'" size="small">
		<n-space vertical>
			<!-- Basic info -->
			<div>
				<n-ellipsis :line-clamp="2">
					<strong>{{ data.source.title }}</strong>
				</n-ellipsis>
			</div>

			<n-space justify="space-between">
				<n-space vertical>
					<div>ID: {{ data.source.extractor }}:{{ data.source.id }}</div>
					<div>Uploader: {{ data.source.uploader || 'Unknown' }} @{{ Formatters.formatShortDate(data.source.uploadDate)
					}}</div>
					<div>Duration: {{ getDuration(data.source.duration) }}</div>
					<div>Status: {{ isNew ? 'New' :data.status }}</div>
				</n-space>

				<div class="header-right">
					<img :src="data.source.thumbnail" alt="Preview" v-if="data.source.thumbnail" />
					<div v-else class="no-preview">No preview</div>
				</div>
			</n-space>

			<!-- File name section -->
			<div>
				<n-text strong>File name</n-text>
			</div>

			<n-input v-model:value="data.fileName" placeholder="Enter file name" style="flex: 1 1 auto" />

			<!-- Preset tags -->
			<n-space wrap size="small">
				<n-tag v-for="preset in fileNamePresets" :key="preset.label" @click="data.fileName = preset.generate(data)"
					type="info" bordered style="cursor: pointer">
					{{ preset.label }}
				</n-tag>
			</n-space>

			<!-- File name editor with reset -->
			<!-- <n-flex justify="space-between" align="center" style="width: 100%" :wrap="false" :gap="8">
				<n-input v-model:value="data.fileName" placeholder="Enter file name" style="flex: 1 1 auto" />
				<n-button quaternary size="small" @click="resetFileName" :title="defaultFileName">
					<template #icon>
						<n-icon>
							<RefreshOutline />
						</n-icon>
					</template>
Reset
</n-button>
</n-flex> -->

			<!-- Track selector -->
			<track-selector :tracks="data.source.tracks" v-model="data.trackIds" />

			<!-- Save button -->
			<template #footer>
				<n-button type="success" :disabled="data.trackIds.length === 0" @click="saveData">
					Save
				</n-button>
			</template>
		</n-space>
	</n-card>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import { MediaFile } from '../../shared/types/media-file';
import TrackSelector from './TrackSelector.vue';
import { Formatters } from '../lib/utils/formatters';
import { RefreshOutline } from '@vicons/ionicons5';

const props = defineProps<{
	data: MediaFile.Data;
	isNew?: boolean;
}>();

const emit = defineEmits<{
	(e: 'save', payload: MediaFile.Data): void;
}>();

// Create a local reference to the incoming data
const data = ref({ ...props.data });

// Default filename formatter
const defaultFileName = computed(() =>
	`${data.value.source.title} [${data.value.source.extractor}][${data.value.source.id}]`
);

function resetFileName() {
	data.value.fileName = defaultFileName.value;
}

function saveData() {
	emit('save', data.value);
}

function getDuration(seconds: number | unknown) {
	const d = Formatters.toDuration(seconds);
	return d ? `${d} (${seconds}s)` : '-';
}

// Preset filename generators
const fileNamePresets: Array<{
	label: string;
	generate: (data: MediaFile.Data) => string;
}> = [
		{
			label: 'default',
			generate: (d: MediaFile.Data) =>
				Formatters.sanitizeFileName(d.source.title) + `[${d.source.extractor}][${d.source.id}]`,
		},
		{
			label: 'date only',
			generate: (d: MediaFile.Data) =>
				`${Formatters.formatShortDate(d.source.uploadDate, '', '-')} [${d.source.id}]`,
		},
		{
			label: 'short',
			generate: (d: MediaFile.Data) =>
				`${d.source.uploader}_${Formatters.formatShortDate(d.source.uploadDate, '', '-')} [${d.source.id}]`,
		},
		{
			label: 'long+',
			generate: (d: MediaFile.Data) =>
				`${d.source.uploader} - ${Formatters.formatShortDate(d.source.uploadDate, '', '-')} ${Formatters.sanitizeFileName(d.source.title)} [${d.source.id}]`,
		},
		{
			label: 'clean',
			generate: (d: MediaFile.Data) =>
				Formatters.sanitizeFileName(d.source.title) + `[${d.source.id}]`,
		},
	];

</script>

<style scoped>
.header-right {
	width: 180px;
	height: 100px;
	background: #f5f5f5;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
}

.no-preview {
	font-size: 12px;
	color: #999;
	text-align: center;
}

.f-g {
	flex-grow: 1;
}

.grow {
	flex: 1 1 auto;
}
</style>
