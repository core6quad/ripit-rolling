<template>
	<n-config-provider :theme="theme">
		<div class="app-container">
			<Header />
			<n-message-provider>
				<router-view />
			</n-message-provider>
		</div>
	</n-config-provider>
</template>

<script setup>
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import Header from './components/Header.vue'
import { lightTheme } from 'naive-ui'

const theme = lightTheme
</script>

<style scoped>
.app-container {
	padding: 20px;
}
</style>