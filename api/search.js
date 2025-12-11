// Vercel Serverless Function para buscar produtos no Mercado Livre
export default async function handler(req, res) {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { q, limit = 50, sort, shipping, condition, DEAL } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Construir URL da API do Mercado Livre
        const params = new URLSearchParams({
            q: q,
            limit: limit.toString()
        });

        if (sort) params.append('sort', sort);
        if (shipping) params.append('shipping', shipping);
        if (condition) params.append('condition', condition);
        if (DEAL) params.append('DEAL', DEAL);

        const url = `https://api.mercadolibre.com/sites/MLB/search?${params.toString()}`;

        // Fazer requisição para a API do Mercado Livre
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        // Retornar dados
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching from Mercado Livre:', error);
        return res.status(500).json({
            error: 'Failed to fetch products',
            message: error.message
        });
    }
}
