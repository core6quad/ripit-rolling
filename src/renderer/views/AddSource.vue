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
						Check
					</n-button>
				</n-input-group>

				<!-- Error -->
				<n-alert v-if="error" type="error" title="Error" :show-icon="true" closable @close="error = null">
					{{ error }}
				</n-alert>

				<!-- Result -->
				<div class="source-info">
					<template v-if="mediaData">
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
import { ref } from 'vue';
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
} from 'naive-ui';
import { useElectronBridge } from '../plugins/electron-bridge';
import { InformationCircleOutline } from '@vicons/ionicons5';

import { MediaFile } from '../../shared/types/media-file';
import MediaFileEditor from './MediaFileEditor.vue';
// import { mockedSource } from './mock';
import { createMediaFile } from '../lib/utils/media-file';
import { Formatters } from '../lib/utils/formatters';

const url = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

// Final editable media data
const mediaData = ref<MediaFile.Data | null>(null);

const router = useRouter();

async function getSourceInfo(url: string): Promise<MediaFile.SourceFile | MediaFile.SourcePlaylist> {
	// return mockedSource;
	const bridge = useElectronBridge();
	return await bridge.getSourceByUrl(url);
}

async function checkSource() {
	error.value = null;
	mediaData.value = null;
	loading.value = true;

	try {
		const result = await getSourceInfo(url.value.trim());

		if ('entries' in result) {
			error.value = 'Playlists are not supported yet.';
		} else {
			const source = result;

			const defaultFileName = `${Formatters.sanitizeFileName(source.title)} [${source.extractor}][${source.id}]`;

			// Construct editable media data
			const data: MediaFile.Data = createMediaFile(defaultFileName, [], source);
			// {
			// 	id: source.id,
			// 	status: 'Added',
			// 	fileName: defaultFileName,
			// 	trackIds: [],
			// 	source,
			// };

			mediaData.value = data;
		}
	} catch (err: any) {
		error.value = 'Failed to fetch media info: ' + err.message;
	} finally {
		loading.value = false;
	}
}

async function handleSaveData(data: MediaFile.Data) {
	try {
		const bridge = useElectronBridge();
		const ok = await bridge.addSource(data);

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
