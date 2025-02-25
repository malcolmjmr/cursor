<script>
  import { createEventDispatcher } from 'svelte';
  
  export let scope = 'paragraph';
  
  const scopes = [
    { id: 'sentence', label: 'S', title: 'Sentence Context' },
    { id: 'paragraph', label: '¶', title: 'Paragraph Context' },
    { id: 'document', label: 'D', title: 'Document Context' }
  ];
  
  const dispatch = createEventDispatcher();
  
  function cycleScope() {
    const currentIndex = scopes.findIndex(s => s.id === scope);
    const nextIndex = (currentIndex + 1) % scopes.length;
    scope = scopes[nextIndex].id;
    dispatch('change', { scope });
  }
  
  $: currentScope = scopes.find(s => s.id === scope) || scopes[0];
</script>

<div class="context-selector" on:click={cycleScope} title={currentScope.title}>
  {currentScope.label}
</div>

<style>
  .context-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #f1f1f1;
    border-radius: 4px;
    margin-right: 8px;
    font-size: 14px;
    cursor: pointer;
    user-select: none;
  }
  
  .context-selector:hover {
    background: #e0e0e0;
  }
</style> 