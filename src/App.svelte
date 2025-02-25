<script>
  import { onMount } from 'svelte';
  
  // Component state
  let isEnabled = true;
  let apiKey = '';
  let selectedModel = 'gpt-4';
  
  // Available models
  const models = [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
  ];
  
  onMount(async () => {
    // Load settings from Chrome storage
    chrome.storage.sync.get(['isEnabled', 'apiKey', 'selectedModel'], (result) => {
      isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
      apiKey = result.apiKey || '';
      selectedModel = result.selectedModel || 'gpt-4';
    });
  });
  
  // Save settings to Chrome storage
  function saveSettings() {
    chrome.storage.sync.set({
      isEnabled,
      apiKey,
      selectedModel
    });
  }
</script>

<main>
  <h1>Writing Assistant</h1>
  
  <div class="form-group">
    <label class="toggle">
      <span>Enable Writing Assistant</span>
      <input type="checkbox" bind:checked={isEnabled} on:change={saveSettings}>
      <span class="slider"></span>
    </label>
  </div>
  
  <div class="form-group">
    <label for="apiKey">OpenAI API Key:</label>
    <input 
      type="password" 
      id="apiKey" 
      bind:value={apiKey} 
      on:blur={saveSettings}
      placeholder="sk-..."
    >
  </div>
  
  <div class="form-group">
    <label for="modelSelect">Language Model:</label>
    <select id="modelSelect" bind:value={selectedModel} on:change={saveSettings}>
      {#each models as model}
        <option value={model.id}>{model.name}</option>
      {/each}
    </select>
  </div>
  
  <p class="info">
    Click in a text field and press space at the beginning of a paragraph
    or double-space in the middle of text to trigger the writing assistant.
  </p>
</main>

<style>
  main {
    width: 300px;
    padding: 15px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  
  h1 {
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 16px;
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }
  
  input, select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }
  
  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    background-color: #ccc;
    border-radius: 20px;
    transition: .4s;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: .4s;
  }
  
  input:checked + .slider {
    background-color: #2196F3;
  }
  
  input:checked + .slider:before {
    transform: translateX(20px);
  }
  
  .info {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
  }
</style> 