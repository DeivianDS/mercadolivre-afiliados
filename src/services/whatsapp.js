/**
 * Generate WhatsApp message from product data
 * @param {Object} product - Product object
 * @param {string} affiliateLink - Affiliate link
 * @returns {string} Formatted WhatsApp message
 */
export function generateWhatsAppMessage(product, affiliateLink) {
    const message = `🛍️ *${product.title}*

💰 *Preço:* ${formatPrice(product.price)}

${product.shipping.freeShipping ? '🚚 *Frete GRÁTIS*\n\n' : ''}🔗 *Link:* ${affiliateLink}

✨ Aproveite essa oferta!`;

    return message;
}

/**
 * Generate WhatsApp share URL with pre-filled message
 * @param {string} message - Message to share
 * @param {string} phoneNumber - Optional phone number or group ID (format: 5511999999999)
 * @returns {string} WhatsApp URL
 */
export function getWhatsAppShareUrl(message, phoneNumber = '') {
    const encodedMessage = encodeURIComponent(message);

    if (phoneNumber) {
        // Remove any non-numeric characters
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    }

    return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (fallbackError) {
            console.error('Fallback copy failed:', fallbackError);
            return false;
        }
    }
}

/**
 * Format price in Brazilian Real
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}
