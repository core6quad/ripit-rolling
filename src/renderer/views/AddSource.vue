<template>
	<n-page>
		<div class="add-source-container">
			<n-space vertical size="large">
				<!-- Input and Check button -->
				<n-input-group>
					<n-input v-model:value="url" placeholder="Enter video URL" clearable @keyup.enter="checkSource" />

					<n-button :loading="loading" :disabled="!url.trim() || loading" @click="checkSource" type="primary">
						<!-- Button spinner -->
						<template #icon>
							<n-icon v-if="loading">
								<!-- Spin icon when loading -->
								<n-spin />
							</n-icon>
							<n-icon v-else>
								<!-- FileInfo icon when not loading -->
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
								<img v-if="source?.thumbnail" :src="source.thumbnail" alt="Thumbnail"  width="360px"/>
								<!-- Display tracks -->
								<div v-if="source.tracks.length > 0">
									<n-list bordered>
										<n-list-item v-for="(track, index) in source.tracks" :key="index">
											<div>{{ track.format }}</div>
										</n-list-item>
									</n-list>
								</div>
							</n-space>
							<template #footer>
								<n-button type="success" @click="addSource">Add</n-button>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NInput, NButton, NInputGroup, NCard, NAlert, NSpace, NEmpty, NIcon, NSpin, NList, NListItem } from 'naive-ui';
import { MediaFile } from '@shared/types/media-file';
import { useElectronBridge } from '../plugins/electron-bridge';
import { InformationCircleOutline } from '@vicons/ionicons5';

// State
const url = ref('');
const error = ref<string | null>(null);
const source = ref<MediaFile.SourceFile | null>(null);
const loading = ref(false); // New loading state

const router = useRouter();

/**
 * Gets media source info using the Electron bridge.
 * Requires the ElectronBridge plugin to be installed in the Vue app.
 */
async function getSourceInfo(url: string): Promise<MediaFile.SourceFile | MediaFile.SourcePlaylist> {
	const bridge = useElectronBridge(); // Injected via plugin
	return await bridge.getSourceByUrl(url);
}

async function addSourceToLibrary(source: MediaFile.SourceFile): Promise<boolean> {
	const bridge = useElectronBridge();
	return await bridge.addSource(source);
}

// Logic
async function checkSource() {
	error.value = null;
	source.value = null;
	loading.value = true; // Set loading to true when starting the request
	try {
		const result = await getSourceInfo(url.value.trim());

		console.log('[UI][checkSource] result', result);

		if ('error' in result) {
			error.value = result.error;
		} else if ('entries' in result) {
			// Playlist detected
			error.value = 'Playlists are not supported yet.';
		} else {
			source.value = result;
		}
	} catch (err: any) {
		error.value = 'Failed to fetch media info: ' + err.message;
	} finally {
		loading.value = false; // Reset loading once the request finishes
	}
}

async function addSource() {
	if (!source.value) return;

	try {
		const ok = await addSourceToLibrary(source.value);
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
