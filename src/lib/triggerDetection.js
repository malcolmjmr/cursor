import { isEditableElement } from './context';

// State for tracking spaces
let lastSpaceTime = 0;
let lastKeyWasSpace = false;

/**
 * Initialize trigger detection
 * @param {Function} callback - Function to call when trigger is detected
 * @returns {Function} Cleanup function to remove listeners
 */
export function initTriggerDetection(callback) {
  // Set up event listeners
  document.addEventListener('keydown', handleKeydown);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeydown);
  };
  
  function handleKeydown(event) {
    // Only detect on editable elements
    if (!isEditableElement(event.target)) return;
    
    if (event.key === ' ') { // Space key
      const now = Date.now();
      
      // Check for double-space trigger
      if (lastKeyWasSpace && (now - lastSpaceTime < 500)) {
        // Check if we're in the middle of text
        if (!isAtParagraphStart(event.target)) {
          callback(event.target, 'double-space');
          event.preventDefault(); // Prevent the second space
        }
      }
      // Check for space at paragraph start
      else if (isAtParagraphStart(event.target)) {
        callback(event.target, 'paragraph-start');
      }
      
      lastSpaceTime = now;
      lastKeyWasSpace = true;
    } else {
      lastKeyWasSpace = false;
    }
  }
}

/**
 * Check if cursor is at the start of a paragraph
 * @param {Element} element - The element to check
 * @returns {boolean} True if cursor is at paragraph start
 */
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

/**
 * Get cursor position coordinates
 * @param {Element} element - The element with the cursor
 * @returns {Object} Position with x, y coordinates
 */
export function getCursorCoordinates(element) {
  if (!element) return { x: 0, y: 0 };
  
  if (element.nodeName === 'TEXTAREA' || element.nodeName === 'INPUT') {
    // For input elements, position near the element
    const rect = element.getBoundingClientRect();
    return { 
      x: rect.left + 10 + window.scrollX, 
      y: rect.bottom + 10 + window.scrollY
    };
  } 
  else if (element.isContentEditable) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return { x: 0, y: 0 };
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    return { 
      x: rect.left + window.scrollX, 
      y: rect.bottom + 5 + window.scrollY
    };
  }
  
  return { x: 0, y: 0 };
} 