<template>
  <n-page>
    <div class="add-source-container">
      <n-space vertical size="large">
        <!-- Input and Check button -->
        <n-input-group>
          <n-input
            v-model:value="url"
            placeholder="Enter video URL"
            clearable
            @keyup.enter="checkSource"
          />
          <n-button :disabled="!url.trim()" @click="checkSource" type="primary">
            Check
          </n-button>
        </n-input-group>

        <!-- Error message -->
        <n-alert
          v-if="error"
          type="error"
          title="Error"
          :show-icon="true"
          closable
          @close="error = null"
        >
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
import { NInput, NButton, NInputGroup, NCard, NAlert, NSpace, NEmpty } from 'naive-ui';
// import { MediaFile } from '../../shared/types/media-file';
import { MediaFile } from '@shared/types/media-file';


// State
const url = ref('');
const error = ref<string | null>(null);
const source = ref<MediaFile.SourceFile | null>(null);

const router = useRouter();

// Simulate IPC channel (replace with actual service later)
async function fetchSource(url: string): Promise<MediaFile.SourceFile | { error: string }> {
  const ipcResponse = await window.electron?.invoke('get-source-info', url);
  return ipcResponse;
}

async function addSourceToLibrary(source: MediaFile.SourceFile): Promise<boolean> {
  const ok = await window.electron?.invoke('add-source', source);
  return ok === true;
}

// Logic
async function checkSource() {
  error.value = null;
  source.value = null;
  try {
    const result = await fetchSource(url.value.trim());

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
