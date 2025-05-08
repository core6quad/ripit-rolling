import { onBeforeUnmount } from 'vue';

type EventHandler = (event: string, payload: any) => void;

export function useProcessorListener(
	processor: { on: Function; off: Function },
	handler: EventHandler
) {
	processor.on('*', handler);

	onBeforeUnmount(() => {
		processor.off('*', handler);
	});
}
