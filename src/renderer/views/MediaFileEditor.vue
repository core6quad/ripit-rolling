<template>
	<n-card title="Edit Media File" size="small">
		<n-space vertical>
			<!-- Editable fields for MediaFile.Data -->
			<div>
				<n-ellipsis :line-clamp="2">
					<strong>{{ source.title }}</strong>
				</n-ellipsis>
			</div>
			<n-space justify="space-between">
				<n-space vertical>
					<div> ID: {{ source.extractor }}:{{ source.id }}</div>
					<div>Uploader: {{ source.uploader }} @{{ Formatters.formatShortDate(source.uploadDate) }}</div>
					<div>Duration: {{ getDuration(source.duration) }}</div>
				</n-space>

				<div class="header-right">
					<img :src="source.thumbnail" alt="Preview" v-if="source.thumbnail" />
					<div v-else class="no-preview">No preview</div>
				</div>
			</n-space>

			<div>
				File name: <n-input v-model="source.uploader" placeholder="Enter uploader" />
			</div>

			<div>
				Tracks:
				<track-selector :tracks="source.tracks" v-model="selectedTracks" />
			</div>

			<template #footer>
				<n-button type="success" :disabled="selectedTracks.length === 0" @click="saveData">
					Save
				</n-button>
			</template>
		</n-space>
	</n-card>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { MediaFile } from '../../shared/types/media-file';
import TrackSelector from './TrackSelector.vue';
import { Formatters } from '../lib/utils/formatters';

const props = defineProps({
	source: {
		type: Object as () => MediaFile.SourceFile,
		required: true,
	},
	selectedTracks: {
		type: Array as () => MediaFile.Track[],
		required: true,
	},
});

const selectedTracks = ref(props.selectedTracks);

const saveData = () => {
	// Emit the edited data to the parent component
	const editedData: MediaFile.Data = {
		id: props.source.id,
		status: 'Added',  // Assuming status is added for this case
		fileName: props.source.title,
		trackIds: selectedTracks.value,
		source: props.source,
	};
	emit('save', editedData);
};

function getDuration(seconds: number | unknown) {
	const d = Formatters.toDuration(seconds);
	return d
		? `${d}(${seconds}s)`
		: '-'
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
</style>