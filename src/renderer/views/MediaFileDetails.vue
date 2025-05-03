<template>
  <n-descriptions column="1" size="small" bordered>
    <n-descriptions-item label="Extractor">{{ file.source.extractor }}</n-descriptions-item>
    <n-descriptions-item label="Source ID">{{ file.source.id }}</n-descriptions-item>
    <n-descriptions-item label="Выбранные треки">
      <div v-for="track in file.trackIds.map(e => e.formatId)" :key="track">{{ track }}</div>
    </n-descriptions-item>
  </n-descriptions>
</template>

<script setup lang="ts">
import type { MediaFile } from '../../shared/types/media-file';

defineProps({
  file: {
    type: Object as () => MediaFile.Data,
    required: true,
  },
});
</script>
