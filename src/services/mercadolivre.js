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

        // Use our own authenticated serverless function
        const targetUrl = `/api/authenticated-search?${params.toString()}`;

        console.log('🔍 Buscando produtos (via backend):', targetUrl);

        const response = await fetch(targetUrl);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Erro na API:', response.status, errorData);

            if (errorData.error === 'Configuration Error') {
                throw new Error('CONFIG_ERROR');
            }

            throw new Error(`Erro ${response.status}: ${errorData.message || 'Falha na busca'}`);
        }

        const data = await response.json();
        console.log('📦 Dados recebidos:', data);

        if (!data.results) {
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

        if (error.message === 'CONFIG_ERROR') {
            console.error(`
╔════════════════════════════════════════════════════════════════╗
║  ⚠️  ERRO DE CONFIGURAÇÃO - Credenciais Ausentes              ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  As credenciais da API do Mercado Livre não foram configuradas.║
║  Por favor, configure ML_APP_ID e ML_CLIENT_SECRET na Vercel.  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
            `);
            throw new Error('Credenciais da API não configuradas. Verifique o console.');
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

        // Use our own authenticated serverless function
        const targetUrl = `/api/authenticated-search?${params.toString()}`;
        const response = await fetch(targetUrl);

        if (!response.ok) {
            throw new Error('Erro ao buscar ofertas');
        }

        const data = await response.json();

        if (!data.results) {
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
