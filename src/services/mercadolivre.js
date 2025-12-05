// Mercado Livre API Service
// Use proxy in development to avoid CORS issues
const ML_API_BASE = import.meta.env.DEV ? '/api' : 'https://api.mercadolibre.com';

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

        const url = `${ML_API_BASE}/sites/MLB/search?${params.toString()}`;
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
        console.log(`✅ Encontrados ${data.results?.length || 0} produtos`);

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

        const url = `${ML_API_BASE}/sites/MLB/search?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('CORS_ERROR');
            }
            throw new Error('Erro ao buscar ofertas');
        }

        const data = await response.json();

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
 * Generate affiliate link by adding tag to product URL
 * @param {string} productUrl - Original product URL
 * @param {string} affiliateTag - Affiliate tag
 * @returns {string} Affiliate link
 */
export function generateAffiliateLink(productUrl, affiliateTag) {
    if (!affiliateTag) {
        return productUrl;
    }

    try {
        const url = new URL(productUrl);
        url.searchParams.set('tag', affiliateTag);
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
