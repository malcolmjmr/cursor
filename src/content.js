// This is the content script entry point that will be bundled
import ContentApp from './ContentApp.svelte';

// Mount the Svelte app
const app = new ContentApp({
  target: container
});

export default app; 