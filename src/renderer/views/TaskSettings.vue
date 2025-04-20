<template>
  <div class="task-settings-container">
    <h2>Task Settings</h2>
    <n-form :model="form" label-placement="left" label-width="auto">
      <n-form-item label="Task URL">
        <n-input v-model:value="form.taskUrl" placeholder="Enter task URL" />
        <n-button type="primary" @click="editTaskUrl" style="margin-left: 10px;">
          Edit
        </n-button>
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup>
import { NForm, NFormItem, NInput, NButton } from 'naive-ui'
import { ref } from 'vue'

const form = ref({
  taskUrl: 'https://example.com/task'
})

const editTaskUrl = () => {
  alert(`Task URL updated to: ${form.value.taskUrl}`)
}
</script>

<style scoped>
.task-settings-container {
  margin-top: 20px;
}
</style>