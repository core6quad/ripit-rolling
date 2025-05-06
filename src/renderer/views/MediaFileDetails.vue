<template>
	<n-space vertical>
		<n-descriptions title="Media File Information" size="small" bordered label-placement="left" :column="3">
			<n-descriptions-item label="Info">{{ '-' }}</n-descriptions-item>
			<n-descriptions-item label="Size">{{ formatFileSize(file.size) }}</n-descriptions-item>
			<n-descriptions-item label="Status">{{ 'Added' }}</n-descriptions-item>

			<n-descriptions-item label="File name" :span="3">{{ file.fileName || 'not set' }}</n-descriptions-item>
		</n-descriptions>

		<n-descriptions title="Source Information" size="small" bordered label-placement="left" :column="3">

			<n-descriptions-item label="Source Url" :span="3">
				<n-ellipsis :line-clamp="2">
					{{ file.source.webpageUrl }}
				</n-ellipsis>
			</n-descriptions-item>

			<n-descriptions-item label="Orig. title" :span="3">
				<n-ellipsis :line-clamp="2">
					{{ file.source.title }}
				</n-ellipsis>
			</n-descriptions-item>

			<n-descriptions-item label="Extractor:ID" :span="2">
				{{ file.source.extractor }}:{{ file.source.id }}
				<n-button quaternary size="small" @click.stop="copyUrl(file.source.extractor + ':' + file.source.id)">
					<template #icon>
						<n-icon>
							<CopyOutline />
						</n-icon>
					</template>
				</n-button>
			</n-descriptions-item>

			<n-descriptions-item label="Duration">{{ getDuration(file.source.duration) }}</n-descriptions-item>

			<n-descriptions-item label="Uploader" :span="2">{{ file.source.uploader || '-' }}</n-descriptions-item>
			<n-descriptions-item label="on">{{ Formatters.formatShortDate(file.source.uploadDate) }}</n-descriptions-item>

			<n-descriptions-item label="Tracks" :span="3">
				<n-space size="small" wrap>
					<n-tooltip v-for="track in file.source.tracks" :key="track.formatId" trigger="hover" placement="bottom">
						<template #trigger>
							<n-tag :type="getTrackType(track)" :bordered="isSelectedTrack(track.formatId)" size="small">
								<template v-if="isSelectedTrack(track.formatId)" #icon>
									<n-icon :component="CheckmarkCircle" />
								</template>
								{{ track.format }}
							</n-tag>
						</template>
						<span>
							{{ track.format }} / {{ track.ext }} /
							{{ formatFileSize(track.filesize, 'stream') }}
						</span>
					</n-tooltip>
				</n-space>
			</n-descriptions-item>

			<n-descriptions-item label="Description">
				<n-ellipsis :line-clamp="12">{{ file.source.description || '-' }}</n-ellipsis>
			</n-descriptions-item>
		</n-descriptions>
	</n-space>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MediaFile } from '../../shared/types/media-file';
import { filesize } from 'filesize';
import { CheckmarkCircle, CopyOutline } from '@vicons/ionicons5';
import { useMessage } from 'naive-ui';
import { Formatters } from '../lib/utils/formatters';

// Типизация пропса через дженерик
const props = defineProps<{
	file: MediaFile.Data; // Указываем правильный тип для пропса 'file'
}>();

// Извлечение файла из пропсов
const file = props.file;

// Получаем массив trackIds
const selectedFormatIds = computed(() =>
	file.trackIds.map(track => track.formatId)
);

// Функция для проверки, выбран ли трек
function isSelectedTrack(formatId: string): boolean {
	return selectedFormatIds.value.includes(formatId);
}

// Функция для определения типа трека (успех, предупреждение, ошибка или стандарт)
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

// Функция для форматирования размера файла
function formatFileSize(size?: number, defaultValue = '-'): string {
	return size ? filesize(size) : defaultValue;
}

const message = useMessage();

function copyUrl(text: string) {
	navigator.clipboard.writeText(text).then(() => {
		message.success('Ссылка скопирована');
	}).catch(() => {
		message.error('Ошибка копирования');
	});
}

function getDuration(seconds: number | unknown) {
	const d = Formatters.toDuration(seconds);
	return d
		? `${d}(${seconds}s)`
		: '-'
}

</script>
