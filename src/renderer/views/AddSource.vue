<template>
	<n-page>
		<div class="add-source-container">
			<n-space vertical size="large">
				<!-- Input and Check button -->
				<n-input-group>
					<n-input v-model:value="url" placeholder="Enter video URL" clearable @keyup.enter="checkSource" />
					<n-button :loading="loading" :disabled="!url.trim() || loading" @click="checkSource" type="primary">
						<template #icon>
							<n-icon v-if="loading"><n-spin /></n-icon>
							<n-icon v-else>
								<InformationCircleOutline />
							</n-icon>
						</template>
						Get Url Info
					</n-button>
				</n-input-group>

				<!-- Error -->
				<n-alert v-if="error" type="error" title="Error" :show-icon="true" closable @close="error = null">
					{{ error }}
				</n-alert>

				<!-- Result -->
				<div class="source-info">
					<!-- <template v-if="mediaData">
						<media-file-editor :data="mediaData" :isNew="true" @save="handleSaveData" />
					</template> -->
					<template v-if="mediaData">
						<!-- Media File Editor -->
						<media-file-editor :data="mediaData" :isNew="true" @save="handleSaveData" />
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
import { Ref, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
	NInput,
	NButton,
	NInputGroup,
	NCard,
	NAlert,
	NSpace,
	NEmpty,
	NIcon,
	NSpin,
	useMessage,
} from 'naive-ui';
import { useElectronBridge } from '../plugins/electron-bridge';
import { InformationCircleOutline } from '@vicons/ionicons5';

import { MediaFile } from '../../shared/types/media-file';
import MediaFileEditor from './MediaFileEditor.vue';
import { createMediaFile } from '../model/media-file';
import { Formatters } from '../lib/utils/formatters';
// import { mockedSource } from './mock';
// import { mock2 } from './mock2';
const message = useMessage();

const url = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

// Final editable media data
const mediaData = ref<MediaFile.Data | null>(null);

const router = useRouter();

// async function getSourceInfo(url: string): Promise<MediaFile.SourceFile> {
// 	const bridge = useElectronBridge();
// 	const result = await bridge.getSourceByUrl(url);

// 	if ('type' in result && result.type !== 'video') {
// 		throw new Error(`Unsupported media type: ${result.type}`);
// 	}

// 	// now it's safe to assume it's a SourceFile
// 	return result as MediaFile.SourceFile;
// }

/**
 * Gets media source info from backend.
 * If it's a valid single file, returns SourceFile.
 * Otherwise shows an error and returns null.
 */
async function getSourceInfo(url: string): Promise<MediaFile.SourceFile | null> {
	// return mock2 as any; 
	const bridge = useElectronBridge();
	const result = await bridge.getSourceByUrl(url);

	if ('type' in result && result.type !== 'video') {
		showUrlInfoError(result);
		return null;
	}

	return result as MediaFile.SourceFile;
}


async function checkSource() {
	error.value = null;
	mediaData.value = null;
	loading.value = true;

	try {
		const result = await getSourceInfo(url.value.trim());

		if (!result) return; // Stop on playlist or error

		if ('entries' in result) {
			error.value = 'Playlists are not supported yet.';
		} else {
			const source = result;
			const defaultFileName = `${Formatters.sanitizeFileName(source.title)} [${source.extractor}][${source.id}]`;

			// Construct editable media data
			const data: MediaFile.Data = createMediaFile(defaultFileName, [], source);

			mediaData.value = data;
		}
	} catch (err: any) {
		error.value = 'Failed to fetch media info: ' + err.message;
	} finally {
		loading.value = false;
	}
}

// Handle saving data
async function handleSaveData(data: MediaFile.Data) {
	try {
		// Logic for saving the data, i.e., add to the database, etc.
		const bridge = useElectronBridge();
		console.log('[UI][Add File] data=', data);

		const success = await bridge.addSource(data);

		if (success) {
			router.push('/');
		} else {
			error.value = 'Failed to add media source.';
		}
	} catch (err: any) {
		error.value = 'Error adding source: ' + err.message;
	}
}


/**
 * Displays an error notification for unsupported or invalid URL info.
 * @param info The returned UrlInfo object from yt-dlp
 */
//  function showUrlInfoError(info: MediaFile.UrlInfo) {
// 	const details = [
// 		info.error ? `Error: ${info.error}` : null,
// 		info.title ? `Title: ${info.title}` : null,
// 		info.uploader ? `Uploader: ${info.uploader}` : null,
// 		`Detected Type: ${info.type}`,
// 		`Entries Count: ${info.count}`,
// 	].filter(Boolean).join('\n');

// 	message.error(
// 		`The provided URL is not a valid single media source.\n\n${details}`,
// 		{ duration: 8000 }
// 	);
// }
function showUrlInfoError(info: MediaFile.UrlInfo) {
	// REWORK! Error message
	const details = [
		info.error ? `Error: ${info.error}` : null,
		info.title ? `Title: ${info.title}` : null,
		info.uploader ? `Uploader: ${info.uploader}` : null,
		`Detected Type: ${info.type}`,
		`Entries Count: ${info.count}`,
	].filter(Boolean).join('\n');

	error.value = `
    The provided URL is not a valid single media source.\n\n${details}
  `;
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
