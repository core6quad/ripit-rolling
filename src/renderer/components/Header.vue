<template>
	<n-space align="center" justify="space-between" class="header-container">
		<!-- Left side: breadcrumbs styled as tags -->
		<n-space>
			<n-tag
				v-for="item in breadcrumbItems"
				:key="item.path"
				size="medium"
				:type="item.path === route.path ? 'primary' : 'default'"
				round
			>
				<router-link :to="item.path" class="breadcrumb-link">
					<n-icon
						v-if="item.icon"
						:component="item.icon"
						size="16"
						class="breadcrumb-icon"
					/>
					<span>{{ item.breadcrumb }}</span>
				</router-link>
			</n-tag>
		</n-space>

		<!-- Right side: toolbar-style buttons -->
		<n-space align="center">
			<n-button secondary size="small" @click="addSource">
				<template #icon>
					<Add />
				</template>
				Add Source
			</n-button>

			<n-button quaternary size="small" circle @click="goToSettings">
				<template #icon>
					<SettingsOutline />
				</template>
			</n-button>
		</n-space>
	</n-space>
</template>

<script setup lang="ts">
import { NSpace, NTag, NButton, NIcon } from 'naive-ui'
import { Add, SettingsOutline, HomeOutline } from '@vicons/ionicons5'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

interface BreadcrumbItem {
	path: string
	breadcrumb: string
	icon?: any
}

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
	const matched = route.matched
		.filter((r) => r.meta?.breadcrumb)
		.map((r) => ({
			path: r.path,
			breadcrumb: r.meta.breadcrumb as string,
			icon: r.meta.icon
		}))

	const hasHome = matched.some((item) => item.path === '/')
	if (!hasHome) {
		matched.unshift({
			path: '/',
			breadcrumb: 'Home',
			icon: HomeOutline
		})
	}

	return matched
})

function goToSettings() {
	router.push({ name: 'Settings' })
}

function addSource() {
	router.push({ name: 'AddSource' })
}
</script>

<style scoped>
.header-container {
	padding: 8px 12px;
}

.breadcrumb-link {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	text-decoration: none;
	color: inherit;
}

.breadcrumb-icon {
	color: currentColor;
	fill: currentColor;
}
</style>
