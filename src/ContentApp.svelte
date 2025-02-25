<script>
  import { onMount, onDestroy } from 'svelte';
  import AssistantUI from './components/AssistantUI.svelte';
  import { isEditableElement } from './lib/context';
  import { extractContext, highlightContext } from './lib/context';
  
  // State
  let isAssistantVisible = false;
  let triggerElement = null;
  let assistantPosition = { x: 0, y: 0 };
  let contextText = '';
  let contextScope = 'paragraph';
  let outputLength = 'sentence';
  let selectedPromptIndex = 0;
  let contextHighlightElement = null;
  let isEnabled = true;
  let apiKey = '';
  let selectedModel = 'gpt-4';
  
  // Default prompts
  const defaultPrompts = [
    { id: 1, title: "Rewrite clearly", text: "Rewrite this to make it clearer and more concise" },
    { id: 2, title: "Expand on this", text: "Expand on this point with more details" },
    { id: 3, title: "Make professional", text: "Rewrite this in a more professional tone" },
    { id: 4, title: "Fix grammar", text: "Fix any grammar or spelling issues in this text" },
    { id: 5, title: "Add examples", text: "Add some examples to illustrate this point" }
  ];
  
  let prompts = [...defaultPrompts];
  
  // Space bar tracking variables
  let lastSpaceTime = 0;
  let lastKeyWasSpace = false;
  
  onMount(() => {
    // Load settings from Chrome storage
    chrome.storage.sync.get(['isEnabled', 'apiKey', 'selectedModel'], (result) => {
      isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
      apiKey = result.apiKey || '';
      selectedModel = result.selectedModel || 'gpt-4';
      
      if (isEnabled) {
        // Set up event listeners
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('click', handleDocumentClick);
      }
    });
    
    // Create context highlight element
    contextHighlightElement = document.createElement('div');
    contextHighlightElement.className = 'writing-assistant-context-highlight';
    contextHighlightElement.style.display = 'none';
    document.body.appendChild(contextHighlightElement);
    
    // Add styles
    addStyles();
    
    // Listen for storage changes
    chrome.storage.onChanged.addListener(handleStorageChanges);
  });
  
  onDestroy(() => {
    // Clean up event listeners
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('click', handleDocumentClick);
    chrome.storage.onChanged.removeListener(handleStorageChanges);
    
    // Remove highlight element
    if (contextHighlightElement && contextHighlightElement.parentNode) {
      contextHighlightElement.parentNode.removeChild(contextHighlightElement);
    }
  });
  
  function handleStorageChanges(changes) {
    if (changes.isEnabled) {
      isEnabled = changes.isEnabled.newValue;
      
      if (isEnabled) {
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('click', handleDocumentClick);
      } else {
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('click', handleDocumentClick);
        hideAssistant();
      }
    }
    
    if (changes.apiKey) {
      apiKey = changes.apiKey.newValue;
    }
    
    if (changes.selectedModel) {
      selectedModel = changes.selectedModel.newValue;
    }
  }
  
  function addStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      #writing-assistant-root {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        overflow: visible;
        z-index: 9999;
      }
      
      .writing-assistant-context-highlight {
        position: absolute;
        background-color: rgba(255, 255, 0, 0.2);
        border-radius: 2px;
        pointer-events: none;
        z-index: 9998;
      }
    `;
    
    document.head.appendChild(styleElement);
  }
  
  function handleKeydown(event) {
    // Only proceed if extension is enabled
    if (!isEnabled) return;
    
    // Only detect on editable elements
    if (!isEditableElement(event.target)) return;
    
    if (event.key === ' ') { // Space key
      const now = Date.now();
      
      // Check for double-space trigger
      if (lastKeyWasSpace && (now - lastSpaceTime < 500)) {
        // Check if we're in the middle of text
        if (!isAtParagraphStart(event.target)) {
          showAssistant(event.target, 'double-space');
          event.preventDefault(); // Prevent the second space
        }
      }
      // Check for space at paragraph start
      else if (isAtParagraphStart(event.target)) {
        showAssistant(event.target, 'paragraph-start');
      }
      
      lastSpaceTime = now;
      lastKeyWasSpace = true;
    } else {
      lastKeyWasSpace = false;
      
      // Hide assistant on Escape
      if (event.key === 'Escape' && isAssistantVisible) {
        hideAssistant();
      }
    }
  }
  
  function isAtParagraphStart(element) {
    if (!element) return false;
    
    if (element.nodeName === 'TEXTAREA' || element.nodeName === 'INPUT') {
      const cursorPos = element.selectionStart;
      const text = element.value;
      
      // Check if we're at position 0 or after a newline
      return cursorPos === 0 || text.charAt(cursorPos - 1) === '\n';
    } 
    else if (element.isContentEditable) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return false;
      
      const range = selection.getRangeAt(0);
      const node = range.startContainer;
      const offset = range.startOffset;
      
      // At start of element
      if (offset === 0) {
        // Check if previous node exists and is a paragraph break
        const prevNode = node.previousSibling;
        if (!prevNode) return true;
        
        return prevNode.nodeName === 'BR' || 
               prevNode.nodeName === 'P' ||
               prevNode.textContent.endsWith('\n');
      }
      
      return false;
    }
    
    return false;
  }
  
  function handleDocumentClick(event) {
    // Hide assistant when clicking outside
    if (isAssistantVisible && 
        event.target.closest('#writing-assistant-root') === null) {
      hideAssistant();
    }
  }
  
  function showAssistant(element, triggerType) {
    // Store the current element
    triggerElement = element;
    
    // Calculate position
    assistantPosition = getCursorCoordinates(element);
    
    // Extract context
    const context = extractContext(element, contextScope);
    contextText = context.text;
    
    // Highlight context
    showContextHighlight(element, context);
    
    // Show the assistant
    isAssistantVisible = true;
  }
  
  function hideAssistant() {
    isAssistantVisible = false;
    hideContextHighlight();
  }
  
  function showContextHighlight(element, context) {
    if (!contextHighlightElement) return;
    
    try {
      if (context.node) {
        // For DOM-based context (contenteditable)
        const rect = context.node.getBoundingClientRect();
        contextHighlightElement.style.top = `${rect.top + window.scrollY}px`;
        contextHighlightElement.style.left = `${rect.left + window.scrollX}px`;
        contextHighlightElement.style.width = `${rect.width}px`;
        contextHighlightElement.style.height = `${rect.height}px`;
      } else if (element.nodeName === 'TEXTAREA' || element.nodeName === 'INPUT') {
        // For input elements, try to highlight relevant portion of text
        // This is a simplified version - a real implementation would need more complex calculations
        const rect = element.getBoundingClientRect();
        contextHighlightElement.style.top = `${rect.top + window.scrollY}px`;
        contextHighlightElement.style.left = `${rect.left + window.scrollX}px`;
        contextHighlightElement.style.width = `${rect.width}px`;
        contextHighlightElement.style.height = `${rect.height}px`;
      }
      
      contextHighlightElement.style.display = 'block';
    } catch (e) {
      console.error('Error highlighting context:', e);
      contextHighlightElement.style.display = 'none';
    }
  }
  
  function hideContextHighlight() {
    if (contextHighlightElement) {
      contextHighlightElement.style.display = 'none';
    }
  }
  
  function getCursorCoordinates(element) {
    if (!element) return { x: 0, y: 0 };
    
    if (element.nodeName === 'TEXTAREA' || element.nodeName === 'INPUT') {
      // For input elements, position near the element
      const rect = element.getBoundingClientRect();
      return { 
        x: rect.left + 10, 
        y: rect.bottom + 10
      };
    } 
    else if (element.isContentEditable) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return { x: 0, y: 0 };
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      return { 
        x: rect.left, 
        y: rect.bottom + 5
      };
    }
    
    return { x: 0, y: 0 };
  }
  
  async function handleAssistantSubmit(event) {
    const inputText = event.detail.input;
    await generateText(inputText);
    hideAssistant();
  }
  
  async function handlePromptSelect(event) {
    const selectedPrompt = prompts[event.detail.index];
    await generateText(selectedPrompt.text);
    hideAssistant();
  }
  
  function handleChangeScope(event) {
    contextScope = event.detail.scope;
    
    // Update context and highlight when scope changes
    if (triggerElement) {
      const context = extractContext(triggerElement, contextScope);
      contextText = context.text;
      showContextHighlight(triggerElement, context);
    }
  }
  
  function handleChangeLength(event) {
    outputLength = event.detail.length;
  }
  
  function handleNavigatePrompt(event) {
    const direction = event.detail.direction;
    const newIndex = (selectedPromptIndex + direction + prompts.length) % prompts.length;
    selectedPromptIndex = newIndex;
  }
  
  async function generateText(prompt) {
    if (!apiKey) {
      alert('Please set your API key in the extension settings.');
      return;
    }
    
    try {
      // Construct system message based on output length
      let systemMessage = 'You are a helpful writing assistant.';
      
      switch (outputLength) {
        case 'phrase':
          systemMessage += ' Provide a brief phrase as response (3-7 words).';
          break;
        case 'sentence':
          systemMessage += ' Provide a single complete sentence as response.';
          break;
        case 'paragraph':
          systemMessage += ' Provide a full paragraph as response.';
          break;
      }
      
      // Create user message with context and prompt
      const userMessage = `Context: ${contextText}\n\nInstruction: ${prompt}`;
      
      // Make direct API call to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: outputLength === 'paragraph' ? 250 : (outputLength === 'sentence' ? 60 : 20)
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate text');
      }
      
      const generatedText = data.choices[0].message.content.trim();
      
      // Insert text at cursor
      if (triggerElement && generatedText) {
        insertTextAtCursor(triggerElement, generatedText);
      }
      
    } catch (error) {
      console.error('Error generating text:', error);
      alert(`Error: ${error.message || 'Failed to generate text'}`);
    }
  }
  
  function insertTextAtCursor(element, text) {
    if (!element || !text) return;
    
    if (element.nodeName === 'TEXTAREA' || element.nodeName === 'INPUT') {
      const startPos = element.selectionStart;
      const endPos = element.selectionEnd;
      const beforeText = element.value.substring(0, startPos);
      const afterText = element.value.substring(endPos);
      
      element.value = beforeText + text + afterText;
      
      // Move cursor to end of inserted text
      const newCursorPos = startPos + text.length;
      element.selectionStart = newCursorPos;
      element.selectionEnd = newCursorPos;
      element.focus();
    } 
    else if (element.isContentEditable) {
      const selection = window.getSelection();
      
      if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        
        // Move cursor to end of inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }
</script>

{#if isAssistantVisible}
  <AssistantUI 
    position={assistantPosition}
    context={contextText}
    contextScope={contextScope}
    outputLength={outputLength}
    prompts={prompts}
    selectedPromptIndex={selectedPromptIndex}
    on:submit={handleAssistantSubmit}
    on:selectPrompt={handlePromptSelect}
    on:changeScope={handleChangeScope}
    on:changeLength={handleChangeLength}
    on:navigatePrompt={handleNavigatePrompt}
    on:close={hideAssistant}
  />
{/if} 