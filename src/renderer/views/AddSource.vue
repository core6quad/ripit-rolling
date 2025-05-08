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

				<!-- Info/Progress -->
				<n-alert v-if="progress" type="success" title="Request is being processed..." :show-icon="true"
					@close="progress = null">
					<div class="alert-content">
						<div>
							<p>{{ progress }}</p>
							<!-- <n-progress type="line" :percentage="progress" :show-indicator="false" status="success" /> -->
						</div>
						<n-button text type="error" class="cancel-button" @click="handleCancel">
							Cancel request
						</n-button>
					</div>
				</n-alert>

				<!-- Error -->
				<n-alert v-if="error" type="error" title="Error" :show-icon="true" closable @close="error = null">
					<!-- If it's an array, render each string inside a <div> -->
					<template v-if="Array.isArray(error)">
						<div v-for="(msg, idx) in error" :key="idx">{{ msg }}</div>
					</template>

					<!-- If it's a single string, render as-is -->
					<template v-else>
						{{ error }}
					</template>
				</n-alert>

				<!-- Result -->
				<div class="source-info">
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
import { onBeforeUnmount, onMounted, Ref, ref } from 'vue';
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
import { useTaskProcessor } from '../plugins/task-processor';
import { useProcessorListener } from '../lib/utils/use-processor-listener';
import { TaskProc } from '../../shared/types/task-processor';
const message = useMessage();

const url = ref('');
const error = ref<string | Array<string | null> | null>(null);

const progress = ref<string | null>(null);
const loading = ref(false);

// Final editable media data
const mediaData = ref<MediaFile.Data | null>(null);

const router = useRouter();

const taskIdRef = ref<string | null>(null);

const bridge = useElectronBridge();
const processor = useTaskProcessor();

const done = () => {
	loading.value = false;
	taskIdRef.value = null;
	progress.value = null;
}

async function handleCancel() {
	await cancelRequest();
}
const cancelRequest = async () => {
	if (taskIdRef?.value?.length) {
		const res = await bridge.abortTask(taskIdRef?.value);
		console.log('[UI][Abort][REQ] id=...' + taskIdRef?.value?.slice(-5), res);
	}
}

const handler = async (type, taskEvent) => {
	// const { taskId, type, payload } = taskEvent;
	console.log('[UI][AddSource][RESP]', { taskEvent, type, taskId: taskIdRef?.value });
	// skip other receivers events
	if (taskIdRef?.value?.length && taskEvent?.taskId !== taskIdRef.value) return;

	switch (taskEvent.type) {
		case 'progress':
			// console.log('[Progress]', taskEvent.payload);
			if ('string' === typeof taskEvent.payload) {
				console.log('[Progress]', taskEvent.payload);
				progress.value = taskEvent.payload;
			}
			break;

		case 'result':
			console.log('[Result]', taskEvent.payload);
			const source = taskEvent.payload as MediaFile.SourceFile;
			const defaultFileName = `${Formatters.sanitizeFileName(source.title)} [${source.extractor}][${source.id}]`;
			const data = createMediaFile(defaultFileName, [], source);
			mediaData.value = data;
			done();
			break;

		case 'error':
			error.value = [
				'Failed to fetch media info:',
				(taskEvent.payload?.error || String(taskEvent.payload))
			];
			done();
			break;

		case 'cancelled':
			console.log('[Task Cancelled]');
			// error.value = 'Task was cencelled';
			done();
			break;

		default: {

		}
	}
};
useProcessorListener(processor, handler);

async function checkSource() {
	error.value = null;
	mediaData.value = null;
	loading.value = true;

	try {
		// if (taskIdRef?.value?.length) {
		// 	const res = await bridge.abortTask(taskIdRef?.value);
		// 	console.log('[UI][Abort][REQ] id=...' + taskIdRef?.value?.slice(0, -5), res);
		// }
		await cancelRequest();
		const params: TaskProc.Input = { type: 'analyze-media-info', payload: { url: url.value.trim() } }
		const taskId = await bridge.runTask(params);

		console.log('[UI][AddSource][checkSource]', { processor, taskId });
		progress.value = 'Step 1/2. Detecting media type...';
		taskIdRef.value = taskId;

	} catch (err: any) {
		error.value = 'Failed to start task: ' + err.message;
	} finally {
		// loading.value = false;
		// taskIdRef.value = null;
	}
}

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


async function checkSource_() {
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

	error.value = [
		'The provided URL is not a valid single media source.',
		info.error ? `Error: ${info.error}` : null,
		info.title ? `Title: ${info.title}` : null,
		info.uploader ? `Uploader: ${info.uploader}` : null,
		`Detected Type: ${info.type}`,
		`Entries Count: ${info.count}`,
	].filter(Boolean);
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

.alert-content {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	gap: 16px;
}

.cancel-button {
	white-space: nowrap;
}
</style>
