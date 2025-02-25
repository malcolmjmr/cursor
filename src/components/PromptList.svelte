<script>
  import { createEventDispatcher } from 'svelte';
  
  export let prompts = [];
  export let selectedIndex = 0;
  
  const dispatch = createEventDispatcher();
  
  function selectPrompt(index) {
    dispatch('select', { index });
  }
</script>

<div class="prompt-list">
  {#if prompts.length > 0}
    {#each prompts as prompt, index}
      <div 
        class="prompt-item {index === selectedIndex ? 'selected' : ''}"
        on:click={() => selectPrompt(index)}
      >
        {prompt.title}
      </div>
    {/each}
  {:else}
    <div class="no-prompts">Type to filter prompts or enter custom instruction</div>
  {/if}
</div>

<style>
  .prompt-list {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .prompt-item {
    padding: 8px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .prompt-item:hover {
    background: #f5f5f5;
  }
  
  .prompt-item.selected {
    background: #e0e0ff;
  }
  
  .no-prompts {
    padding: 8px;
    color: #888;
    font-style: italic;
    font-size: 14px;
  }
</style> 