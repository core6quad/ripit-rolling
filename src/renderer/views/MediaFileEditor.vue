<template>
	<n-card :title="isNew ? 'New Media File' : 'Edit Media File'" size="small">
		<template #header-extra>
			<n-space justify="end" style="width: 100%">
				<n-button :type="isNew ? 'primary' : 'success'" :disabled="isButtonDisabled" @click="saveData">
					{{ isNew ? 'Add file' : 'Apply changes' }}
				</n-button>
			</n-space>
		</template>

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
					<div>Uploader: {{ data.source.uploader || 'Unknown' }} @{{ Formatters.formatShortDate(data.source.uploadDate) }}</div>
					<div>Duration: {{ getDuration(data.source.duration) }}</div>
					<div>Status: {{ isNew ? 'New' : data.status }}</div>
				</n-space>
			</n-space>

			<!-- File name section -->
			<div>
				<n-text strong>File name</n-text>
			</div>

			<n-input v-model:value="data.fileName" placeholder="Enter file name" style="flex: 1 1 auto" :status="fileNameInvalid ? 'error' : undefined" />

			<!-- Preset tags -->
			<n-space wrap size="small">
				<n-tag v-for="preset in fileNamePresets" :key="preset.label" @click="data.fileName = preset.generate(data)"
					type="info" bordered style="cursor: pointer">
					{{ preset.label }}
				</n-tag>
			</n-space>

			<!-- Track selector with tooltip -->
			<div>
				<n-tooltip trigger="hover" placement="bottom" :style="{ maxWidth: '200px', whiteSpace: 'normal' }">
					<template #trigger>
						<n-text strong>Select tracks</n-text>
					</template>
					<span>Select tracks that will be downloaded. These tracks will only be applied at the time of download and will not affect previously downloaded files if modified later.</span>
				</n-tooltip>
			</div>

			<track-selector :tracks="data.source.tracks" v-model="data.trackIds" />

			<!-- Save button -->
			<template #footer>
				<n-button type="success" :disabled="fileNameInvalid || data.trackIds.length === 0" @click="saveData">
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
import { cloneDeep } from 'lodash';

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

// Check if the file name is valid
const fileNameInvalid = computed(() => {
	const regex = /^[a-zA-Z0-9 ._\-\[\]()#&@]+$/;
	return !regex.test(data.value.fileName);
});

const isButtonDisabled = computed(() => fileNameInvalid.value || data.value.trackIds.length === 0);

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

// Function to save data and notify parent
function saveData() {
	const saveData: MediaFile.Data = cloneDeep(data.value);
	// console.log('[UI][Editor] Save, data=', saveData)
	emit('save', saveData);
}

function getDuration(seconds: number | unknown) {
	const d = Formatters.toDuration(seconds);
	return d ? `${d} (${seconds}s)` : '-';
}

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
