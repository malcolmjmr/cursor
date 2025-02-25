<script>
  import { createEventDispatcher } from 'svelte';
  import ContextSelector from './ContextSelector.svelte';
  import OutputLengthSelector from './OutputLengthSelector.svelte';
  import PromptList from './PromptList.svelte';
  
  export let position = { x: 0, y: 0 };
  export let context = '';
  export let contextScope = 'paragraph';
  export let outputLength = 'sentence';
  export let prompts = [];
  export let selectedPromptIndex = 0;
  
  let inputValue = '';
  const dispatch = createEventDispatcher();
  
  function handleInputKeydown(event) {
    if (event.key === 'Enter') {
      submit();
    } else if (event.key === 'Escape') {
      dispatch('close');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      dispatch('navigatePrompt', { direction: 1 });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      dispatch('navigatePrompt', { direction: -1 });
    } else if (event.key === 'Tab') {
      if (event.shiftKey) {
        event.preventDefault();
        dispatch('cycleOutputLength');
      } else {
        event.preventDefault();
        dispatch('cycleContextScope');
      }
    }
  }
  
  function submit() {
    if (inputValue.trim()) {
      dispatch('submit', { input: inputValue });
    } else if (prompts.length > 0) {
      dispatch('selectPrompt', { index: selectedPromptIndex });
    }
  }
  
  function handleScopeChange(event) {
    dispatch('changeScope', { scope: event.detail.scope });
  }
  
  function handleLengthChange(event) {
    dispatch('changeLength', { length: event.detail.length });
  }
  
  function handlePromptSelect(event) {
    dispatch('selectPrompt', { index: event.detail.index });
  }
  
  // Focus input when component is mounted
  import { onMount } from 'svelte';
  
  let inputElement;
  
  onMount(() => {
    if (inputElement) {
      inputElement.focus();
    }
  });
</script>

<div 
  class="assistant-container" 
  style="left: {position.x}px; top: {position.y}px;"
>
  <div class="assistant-input-row">
    <ContextSelector 
      scope={contextScope} 
      on:change={handleScopeChange} 
    />
    
    <input
      bind:this={inputElement}
      bind:value={inputValue}
      on:keydown={handleInputKeydown}
      class="assistant-input"
      placeholder="Type your writing intention..."
    />
    
    <OutputLengthSelector 
      length={outputLength} 
      on:change={handleLengthChange} 
    />
  </div>
  
  <PromptList 
    prompts={prompts} 
    selectedIndex={selectedPromptIndex}
    on:select={handlePromptSelect}
  />
</div>

<style>
  .assistant-container {
    position: absolute;
    z-index: 9999;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    width: 300px;
    padding: 10px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  
  .assistant-input-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .assistant-input {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px;
    font-size: 14px;
  }
</style> 