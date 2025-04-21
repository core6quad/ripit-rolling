<template>
	<n-config-provider :theme="theme">
		<div class="app-container">
			<Header />
			<router-view />
		</div>
	</n-config-provider>
</template>

<script setup>
import { NConfigProvider } from 'naive-ui'
import Header from './components/Header.vue'
import { lightTheme } from 'naive-ui'

const theme = lightTheme
</script>

<style scoped>
.app-container {
	padding: 20px;
}
</style>