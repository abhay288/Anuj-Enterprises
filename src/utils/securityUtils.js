/**
 * Central Security Guard & Content Sanitizer for Anuj Enterprises
 * Blocks profanity, offensive language, spam keywords, and malicious script injection (XSS/SQLi).
 */

// List of prohibited unwanted profanity and abusive terms (English + Hinglish/Hindi)
export const UNWANTED_WORDS = [
  // Common Vulgarities & Profanity
  'fuck', 'fucking', 'fucker', 'shit', 'shitty', 'bitch', 'bastard', 'asshole', 
  'dick', 'cunt', 'pussy', 'whore', 'slut', 'nigger', 'crap',
  
  // Hinglish / Hindi Abusive Terms
  'madarchod', 'mc', 'bhenchod', 'bc', 'chutiya', 'choot', 'gaand', 'laund', 
  'lauda', 'loda', 'gand', 'harami', 'kamina', 'saala', 'randi', 'bhosdike', 
  'bhosdi', 'chut', 'tatte', 'tatta',

  // Spam & Fraud Keywords
  'casino', 'viagra', 'crypto scam', 'free money', 'lottery winner', 'poker bonus'
];

// Malicious Injection Patterns (XSS & SQL Injection)
export const MALICIOUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /eval\s*\(/gi,
  /document\.cookie/gi,
  /<iframe/gi,
  /<svg.*?onload/gi,
  /UNION\s+SELECT/gi,
  /DROP\s+TABLE/gi
];

/**
 * Checks if a string contains any unwanted/profane words or malicious code injection.
 * @param {string} input - The user string input to test.
 * @returns {{ hasUnwanted: boolean, matchedWord: string }}
 */
export const checkUnwantedContent = (input) => {
  if (!input || typeof input !== 'string') return { hasUnwanted: false, matchedWord: '' };

  const cleanInput = input.trim();
  const lowerInput = cleanInput.toLowerCase();

  // 1. Check for malicious code patterns
  for (const pattern of MALICIOUS_PATTERNS) {
    if (pattern.test(cleanInput)) {
      return { hasUnwanted: true, matchedWord: 'Malicious Script / Code Injection' };
    }
  }

  // 2. Check for unwanted / profane words
  // Match whole words or substrings for explicit profanity
  for (const word of UNWANTED_WORDS) {
    const wordPattern = new RegExp(`\\b${word}\\b`, 'i');
    if (wordPattern.test(lowerInput) || (word.length > 4 && lowerInput.includes(word))) {
      return { hasUnwanted: true, matchedWord: word };
    }
  }

  return { hasUnwanted: false, matchedWord: '' };
};

/**
 * Sanitizes input text by removing HTML tags and censoring unwanted words.
 * @param {string} input - Raw input string
 * @returns {string} Cleaned & sanitized string
 */
export const sanitizeInputText = (input) => {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input.trim();

  // Strip script and HTML tags
  sanitized = sanitized.replace(/<[^>]*>?/gm, '');

  // Censor unwanted words with asterisks
  UNWANTED_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '***');
  });

  return sanitized;
};
