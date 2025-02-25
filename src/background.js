// Minimal background script - future features that need background tasks can go here
console.log("Writing Assistant: Background script loaded");

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Set default settings
  chrome.storage.sync.set({
    isEnabled: true,
    selectedModel: 'gpt-4'
  });
});

// Handle communication between content script and LLM service
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateText') {
    // Get API key from storage
    chrome.storage.sync.get(['apiKey', 'selectedModel'], async (result) => {
      const { apiKey, selectedModel } = result;
      
      if (!apiKey) {
        sendResponse({ error: 'API key not set. Please set your API key in the extension settings.' });
        return;
      }
      
      try {
        // Call OpenAI API
        const openaiResponse = await fetchFromLLM(apiKey, selectedModel, request.prompt, request.context, request.outputLength);
        sendResponse({ text: openaiResponse });
      } catch (error) {
        sendResponse({ error: error.message || 'Failed to generate text' });
      }
    });
    
    // Return true to indicate async response
    return true;
  }
});

// Function to call LLM API
async function fetchFromLLM(apiKey, model, prompt, context, outputLength) {
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
  const userMessage = `Context: ${context}\n\nInstruction: ${prompt}`;
  
  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: outputLength === 'paragraph' ? 250 : outputLength === 'sentence' ? 60 : 20
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to generate text');
  }
  
  return data.choices[0].message.content.trim();
} 