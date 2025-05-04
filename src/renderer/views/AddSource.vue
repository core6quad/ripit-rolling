<template>
	<n-page>
		<div class="add-source-container">
			<n-space vertical size="large">
				<!-- Input and Check button -->
				<n-input-group>
					<n-input v-model:value="url" placeholder="Enter video URL" clearable @keyup.enter="checkSource" />

					<n-button :loading="loading" :disabled="!url.trim() || loading" @click="checkSource" type="primary">
						<template #icon>
							<n-icon v-if="loading">
								<n-spin />
							</n-icon>
							<n-icon v-else>
								<InformationCircleOutline />
							</n-icon>
						</template>
						Check
					</n-button>
				</n-input-group>

				<!-- Error message -->
				<n-alert v-if="error" type="error" title="Error" :show-icon="true" closable @close="error = null">
					{{ error }}
				</n-alert>

				<!-- Source preview area -->
				<div class="source-info">
					<template v-if="source">
						<n-card title="Video Info" size="small">
							<n-space vertical>
								<div><strong>{{ source.title }}</strong></div>
								<div>ID: {{ source.id }}</div>
								<div>Uploader: {{ source.uploader || 'Unknown' }}</div>
								<div>Duration: {{ source.duration || 'N/A' }} sec</div>
								<div>Formats: {{ source.tracks.length }}</div>
								<img v-if="source?.thumbnail" :src="source.thumbnail" alt="Thumbnail" width="360px" />

								<!-- Display tracks with checkbox selection -->
								<track-selector v-if="source.tracks.length > 0" :tracks="source.tracks" v-model="selectedTracks" />
							</n-space>

							<template #footer>
								<n-button type="success" :disabled="selectedTracks.length === 0" @click="addSource">
									Add
								</n-button>
							</template>
						</n-card>
					</template>
					<template v-else>
						<n-empty description="Video info will appear here once checked" />
					</template>
				</div>
			</n-space>
		</div>
	</n-page>
</template>

<script setup lang="ts">
import { readonly, ref } from 'vue';
import { useRouter } from 'vue-router';
import { NInput, NButton, NInputGroup, NCard, NAlert, NSpace, NEmpty, NIcon, NSpin } from 'naive-ui';
import { useElectronBridge } from '../plugins/electron-bridge';
import { InformationCircleOutline } from '@vicons/ionicons5';
import TrackSelector from './TrackSelector.vue';
import { MediaFile } from '../../shared/types/media-file';
import { createMediaFile } from '../lib/utils/media-file';

const url = ref('');
const error = ref<string | null>(null);
const source = ref<MediaFile.SourceFile | null>(null);
// const source = readonly(_source);

const loading = ref(false);

const selectedTracks = ref<MediaFile.Track[]>([]);

const router = useRouter();

async function getSourceInfo(url: string): Promise<MediaFile.SourceFile | MediaFile.SourcePlaylist> {
	const bridge = useElectronBridge();
	return await bridge.getSourceByUrl(url);
}

async function addSourceToLibrary(data: MediaFile.Data): Promise<boolean> {
	const bridge = useElectronBridge();
	console.log('[UI][Add]', { bridge, data, isExist: !!bridge.addSource });
	return await bridge.addSource(data);
}

async function checkSource() {
	error.value = null;
	source.value = null;
	selectedTracks.value = [];
	loading.value = true;
	try {
		const result = await getSourceInfo(url.value.trim());

		console.log('[UI][checkSource] result', result);

		// if ('error' in result) {
		// 	error.value = result.error;
		// } else 



		if ('entries' in result) {
			error.value = 'Playlists are not supported yet.';
		} else {
			source.value = result;
		}
	} catch (err: any) {
		error.value = 'Failed to fetch media info: ' + err.message;
	} finally {
		loading.value = false;
	}
}

async function addSource() {
	if (!source.value || !selectedTracks.value) return;
	// https://www.youtube.com/watch?v=WaEshTB4wrc

	const fileName = "";

	console.log({ source });
	const data: MediaFile.Data = createMediaFile(fileName, selectedTracks.value, source.value);

	console.log({ data });

	try {
		const ok = await addSourceToLibrary(data);
		if (ok) {
			router.push('/');
		} else {
			error.value = 'Failed to add media source.';
		}
	} catch (err: any) {
		error.value = 'Error adding source: ' + err.message;
	}
}
</script>

<style scoped>
.add-source-container {
	max-width: 800px;
	margin: 0 auto;
	padding: 24px 16px;
}

.source-info {
	margin-top: 24px;
}
</style>
