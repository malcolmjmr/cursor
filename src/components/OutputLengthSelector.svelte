<script>
  import { createEventDispatcher } from 'svelte';
  
  export let length = 'sentence';
  
  const lengths = [
    { id: 'phrase', label: 'P', title: 'Phrase Output' },
    { id: 'sentence', label: 'S', title: 'Sentence Output' },
    { id: 'paragraph', label: '¶', title: 'Paragraph Output' }
  ];
  
  const dispatch = createEventDispatcher();
  
  function cycleLength() {
    const currentIndex = lengths.findIndex(l => l.id === length);
    const nextIndex = (currentIndex + 1) % lengths.length;
    length = lengths[nextIndex].id;
    dispatch('change', { length });
  }
  
  $: currentLength = lengths.find(l => l.id === length) || lengths[0];
</script>

<div class="length-selector" on:click={cycleLength} title={currentLength.title}>
  {currentLength.label}
</div>

<style>
  .length-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #f1f1f1;
    border-radius: 4px;
    margin-left: 8px;
    font-size: 14px;
    cursor: pointer;
    user-select: none;
  }
  
  .length-selector:hover {
    background: #e0e0e0;
  }
</style> 