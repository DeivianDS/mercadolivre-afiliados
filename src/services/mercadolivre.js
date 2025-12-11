// Mercado Livre API Service
// Use CORS proxy in production to avoid CORS issues and Vercel IP blocks
const ML_API_BASE = 'https://api.mercadolibre.com';

/**
 * Search products on Mercado Livre with filters
 * @param {string} query - Search term
 * @param {Object} options - Search options
 * @param {number} options.limit - Number of results (default: 50)
 * @param {string} options.sort - Sort order: 'price_asc', 'price_desc', 'relevance' (default)
 * @param {boolean} options.freeShipping - Filter by free shipping
 * @param {string} options.condition - Product condition: 'new', 'used', or null for all
 * @param {boolean} options.discount - Filter products with discount
 * @returns {Promise<Array>} Array of products
 */
export async function searchProducts(query, options = {}) {
    const {
        limit = 50,
        sort = 'relevance',
        freeShipping = false,
        condition = null,
        discount = false
    } = options;

    try {
        // Build query parameters
        const params = new URLSearchParams({
            q: query,
            limit: limit.toString()
        });

        // Add sorting
        if (sort === 'price_asc') {
            params.append('sort', 'price_asc');
        } else if (sort === 'price_desc') {
            params.append('sort', 'price_desc');
        }

        // Add free shipping filter
        if (freeShipping) {
            params.append('shipping', 'free');
        }

        // Add condition filter
        if (condition) {
            params.append('condition', condition);
        }

        // Add discount filter (using DEAL attribute)
        if (discount) {
            params.append('DEAL', 'true');
        }

        const targetUrl = `${ML_API_BASE}/sites/MLB/search?${params.toString()}`;
        // Use CodeTabs as alternative proxy
        const url = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;

        console.log('🔍 Buscando produtos:', url);

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro na API:', response.status, errorText);

            if (response.status === 403 || response.status === 0) {
                throw new Error('CORS_ERROR');
            }

            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('📦 Dados recebidos:', data);

        if (!data.results) {
            // Check if it's an error response from ML passed through
            if (data.error) {
                throw new Error(`ML API Error: ${data.message || data.error}`);
            }
            return [];
        }

        console.log(`✅ Encontrados ${data.results.length} produtos`);

        // Transform the response to a simpler format
        return data.results.map(product => ({
            id: product.id,
            title: product.title,
            price: product.price,
            originalPrice: product.original_price || null,
            currency: product.currency_id,
            thumbnail: product.thumbnail,
            image: product.thumbnail.replace('-I.jpg', '-O.jpg'), // Get higher quality image
            permalink: product.permalink,
            condition: product.condition,
            availableQuantity: product.available_quantity,
            soldQuantity: product.sold_quantity,
            shipping: {
                freeShipping: product.shipping?.free_shipping || false,
            },
            discount: product.original_price ?
                Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0
        }));
    } catch (error) {
        console.error('❌ Error searching products:', error);

        // Provide helpful error messages for CORS issues
        if (error.message === 'CORS_ERROR' || error.message.includes('CORS')) {
            console.error(`
╔════════════════════════════════════════════════════════════════╗
║  ⚠️  ERRO DE CORS - API do Mercado Livre Bloqueada            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  A API do Mercado Livre bloqueia requisições de localhost.    ║
║                                                                ║
║  SOLUÇÕES:                                                     ║
║                                                                ║
║  1. 🚀 DEPLOY EM PRODUÇÃO (Recomendado)                       ║
║     • Vercel: vercel --prod                                   ║
║     • Netlify: netlify deploy --prod --dir=dist               ║
║                                                                ║
║  2. 🔧 EXTENSÃO DE NAVEGADOR (Temporário)                     ║
║     • Chrome: "CORS Unblock" ou "Allow CORS"                  ║
║     • Firefox: "CORS Everywhere"                              ║
║                                                                ║
║  3. 🌐 USAR NGROK/LOCALTUNNEL                                 ║
║     • Expor localhost com URL pública                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
            `);

            throw new Error('A API do Mercado Livre bloqueou a requisição (CORS). Veja o console para soluções.');
        }

        throw error;
    }
}

/**
 * Get deals and promotions
 * @param {string} category - Category ID or null for all categories
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Array of products on sale
 */
export async function getDeals(category = null, limit = 50) {
    try {
        const params = new URLSearchParams({
            limit: limit.toString(),
            DEAL: 'true',
            sort: 'price_asc'
        });

        if (category) {
            params.append('category', category);
        }

        const targetUrl = `${ML_API_BASE}/sites/MLB/search?${params.toString()}`;
        // Use CodeTabs as alternative proxy
        const url = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('CORS_ERROR');
            }
            throw new Error('Erro ao buscar ofertas');
        }

        const data = await response.json();

        if (!data.results) {
            if (data.error) {
                throw new Error(`ML API Error: ${data.message || data.error}`);
            }
            return []; // Return empty array if no results or error
        }

        return data.results.map(product => ({
            id: product.id,
            title: product.title,
            price: product.price,
            originalPrice: product.original_price || null,
            currency: product.currency_id,
            thumbnail: product.thumbnail,
            image: product.thumbnail.replace('-I.jpg', '-O.jpg'),
            permalink: product.permalink,
            condition: product.condition,
            availableQuantity: product.available_quantity,
            soldQuantity: product.sold_quantity,
            shipping: {
                freeShipping: product.shipping?.free_shipping || false,
            },
            discount: product.original_price ?
                Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0
        }));
    } catch (error) {
        console.error('Error getting deals:', error);
        throw error;
    }
}

/**
 * Generate affiliate link by adding affiliate parameters to product URL
 * Supports two formats:
 * 1. Simple tag format: ?tag=YOURTAG
 * 2. Matt tool format: ?matt_word=USERNAME&matt_tool=ID
 * 
 * @param {string} productUrl - Original product URL
 * @param {string} affiliateTag - Affiliate tag (can be "tag:VALUE" or "matt:USERNAME:TOOLID")
 * @returns {string} Affiliate link
 */
export function generateAffiliateLink(productUrl, affiliateTag) {
    if (!affiliateTag) {
        return productUrl;
    }

    try {
        const url = new URL(productUrl);

        // Check if using matt_word/matt_tool format
        // Format: "matt:pamelabenachio:78793736"
        if (affiliateTag.startsWith('matt:')) {
            const parts = affiliateTag.split(':');
            if (parts.length >= 3) {
                const mattWord = parts[1];
                const mattTool = parts[2];
                url.searchParams.set('matt_word', mattWord);
                url.searchParams.set('matt_tool', mattTool);
            }
        } else {
            // Simple tag format
            url.searchParams.set('tag', affiliateTag);
        }

        return url.toString();
    } catch (error) {
        console.error('Error generating affiliate link:', error);
        return productUrl;
    }
}

/**
 * Format price in Brazilian Real
 * @param {number} price - Price value
 * @param {string} currency - Currency code (default: BRL)
 * @returns {string} Formatted price
 */
export function formatPrice(price, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency
    }).format(price);
}
