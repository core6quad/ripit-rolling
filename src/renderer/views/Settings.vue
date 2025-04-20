<template>
	<div class="settings-container">
		<h2>Program Settings</h2>
		<n-form :model="form" label-placement="left" label-width="auto">
			<n-form-item label="Default Save Path">
				<n-input v-model:value="form.savePath" placeholder="Enter save path" />
				<n-button type="primary" @click="editSavePath" style="margin-left: 10px;">
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
	savePath: '/default/path'
})

const editSavePath = () => {
	alert(`Save path updated to: ${form.value.savePath}`)
}
</script>

<style scoped>
.settings-container {
	margin-top: 20px;
}
</style>