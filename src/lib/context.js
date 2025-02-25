// Helper functions for extracting context from different elements

/**
 * Extract context based on scope from the current element
 * @param {Element} element - DOM element containing text
 * @param {string} scope - Context scope (sentence, paragraph, document)
 * @returns {Object} Context object with text and position
 */
export function extractContext(element, scope = 'paragraph') {
  if (!element || !isEditableElement(element)) {
    return { text: '', start: 0, end: 0 };
  }
  
  let text = '';
  let start = 0;
  let end = 0;
  
  // Different extraction logic based on element type
  if (element.nodeName === 'TEXTAREA' || element.nodeName === 'INPUT') {
    return extractFromInputElement(element, scope);
  } else if (element.isContentEditable) {
    return extractFromContentEditable(element, scope);
  }
  
  return { text: '', start: 0, end: 0 };
}

/**
 * Extract context from input or textarea elements
 */
function extractFromInputElement(element, scope) {
  const fullText = element.value || '';
  const cursorPos = element.selectionStart;
  
  if (scope === 'sentence') {
    return extractSentence(fullText, cursorPos);
  } else if (scope === 'paragraph') {
    return extractParagraph(fullText, cursorPos);
  } else if (scope === 'document') {
    return { text: fullText, start: 0, end: fullText.length };
  }
  
  return { text: '', start: 0, end: 0 };
}

/**
 * Extract context from contentEditable elements
 */
function extractFromContentEditable(element, scope) {
  const selection = window.getSelection();
  
  if (!selection.rangeCount) {
    return { text: '', start: 0, end: 0 };
  }
  
  const range = selection.getRangeAt(0);
  const cursorNode = range.startContainer;
  const cursorOffset = range.startOffset;
  
  // For content editable, we need to consider the DOM structure
  if (scope === 'sentence') {
    return extractSentenceFromNode(cursorNode, cursorOffset);
  } else if (scope === 'paragraph') {
    return extractParagraphFromNode(cursorNode, cursorOffset);
  } else if (scope === 'document') {
    return { 
      text: element.textContent,
      start: 0,
      end: element.textContent.length
    };
  }
  
  return { text: '', start: 0, end: 0 };
}

/**
 * Extract sentence from plain text
 */
function extractSentence(text, position) {
  const sentenceDelimiters = ['.', '!', '?', '\n'];
  
  let start = position;
  while (start > 0) {
    start--;
    if (sentenceDelimiters.includes(text[start])) {
      start++;
      break;
    }
  }
  
  let end = position;
  while (end < text.length) {
    if (sentenceDelimiters.includes(text[end])) {
      end++;
      break;
    }
    end++;
  }
  
  return {
    text: text.substring(start, end).trim(),
    start,
    end
  };
}

/**
 * Extract paragraph from plain text
 */
function extractParagraph(text, position) {
  const paragraphDelimiters = ['\n\n', '\r\n\r\n'];
  
  let start = position;
  let found = false;
  
  while (start > 0 && !found) {
    start--;
    for (const delimiter of paragraphDelimiters) {
      if (text.substring(start, start + delimiter.length) === delimiter) {
        start += delimiter.length;
        found = true;
        break;
      }
    }
  }
  
  if (!found) start = 0;
  
  let end = position;
  found = false;
  
  while (end < text.length && !found) {
    for (const delimiter of paragraphDelimiters) {
      if (text.substring(end, end + delimiter.length) === delimiter) {
        end = end;
        found = true;
        break;
      }
    }
    if (!found) end++;
  }
  
  return {
    text: text.substring(start, end).trim(),
    start,
    end
  };
}

/**
 * Extract sentence from DOM node
 */
function extractSentenceFromNode(node, offset) {
  // This is a simplified version - a real implementation would need to traverse DOM
  const text = node.textContent || '';
  return extractSentence(text, offset);
}

/**
 * Extract paragraph from DOM node
 */
function extractParagraphFromNode(node, offset) {
  // Find the parent paragraph or equivalent block element
  let paragraphNode = node;
  while (paragraphNode && 
         !['P', 'DIV', 'LI', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']
           .includes(paragraphNode.nodeName)) {
    paragraphNode = paragraphNode.parentNode;
  }
  
  if (!paragraphNode) {
    // Fallback to text-based extraction if no paragraph container found
    const text = node.textContent || '';
    return extractParagraph(text, offset);
  }
  
  return {
    text: paragraphNode.textContent.trim(),
    node: paragraphNode,
    start: 0,
    end: paragraphNode.textContent.length
  };
}

/**
 * Check if element is editable
 */
export function isEditableElement(element) {
  if (!element) return false;
  
  return element.isContentEditable || 
         element.nodeName === 'TEXTAREA' || 
         (element.nodeName === 'INPUT' && 
          ['text', 'search', 'email', 'url'].includes(element.type));
}

/**
 * Highlight the context in the document
 */
export function highlightContext(context) {
  if (!context || !context.text) return null;
  
  const highlightEl = document.createElement('div');
  highlightEl.className = 'writing-assistant-highlight';
  
  try {
    // Position the highlight element
    if (context.node) {
      // For DOM-based context
      const rect = context.node.getBoundingClientRect();
      highlightEl.style.top = `${rect.top + window.scrollY}px`;
      highlightEl.style.left = `${rect.left + window.scrollX}px`;
      highlightEl.style.width = `${rect.width}px`;
      highlightEl.style.height = `${rect.height}px`;
    } else {
      // For text position-based context (more complex positioning required)
      // This is a simplified placeholder - actual implementation would need to
      // convert text positions to screen coordinates
      highlightEl.style.display = 'none';
    }
  } catch (e) {
    console.error('Error highlighting context:', e);
    return null;
  }
  
  return highlightEl;
} 