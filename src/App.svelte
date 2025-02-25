<script>
  function handleClick() {
    alert('Button clicked!');
  }
</script>

<main>
  <h2>My Svelte Extension</h2>
  <button on:click={handleClick}>Click Me</button>
</main>

<style>
  main {
    width: 300px;
    padding: 10px;
  }
  
  button {
    margin: 5px;
    padding: 5px 10px;
  }
</style>
