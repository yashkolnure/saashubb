const PHONE_REGEX = /(\+?\d[\s\-]?){10,}/g;
const URL_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+/gi;
const SPAM_PHRASES = ['whatsapp me', 'call me at', 'contact me on', 'send payment', 'wire transfer', 'western union', 'bank account', 'personal email'];

const filterMessage = (content, messageIndex) => {
  if (messageIndex < 3) {
    if (PHONE_REGEX.test(content)) return { blocked: true, reason: 'Phone numbers not allowed in first 3 messages' };
    if (URL_REGEX.test(content)) return { blocked: true, reason: 'External links not allowed in first 3 messages' };
  }
  for (const phrase of SPAM_PHRASES) {
    if (content.toLowerCase().includes(phrase)) return { blocked: true, reason: 'Message contains potentially fraudulent content' };
  }
  return { blocked: false };
};

module.exports = { filterMessage };
