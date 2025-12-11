// Vercel Serverless Function para buscar produtos no Mercado Livre com Autenticação
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

    // Verificar se as credenciais estão configuradas
    const APP_ID = process.env.ML_APP_ID;
    const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;

    if (!APP_ID || !CLIENT_SECRET) {
        console.error('❌ Credenciais da API do Mercado Livre não configuradas.');
        return res.status(500).json({
            error: 'Configuration Error',
            message: 'Credenciais da API do Mercado Livre não configuradas no servidor.'
        });
    }

    try {
        // 1. Obter Access Token (Client Credentials Flow)
        const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: APP_ID,
                client_secret: CLIENT_SECRET
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('❌ Erro ao obter token:', tokenResponse.status, errorText);
            throw new Error(`Falha na autenticação: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 2. Buscar Produtos com o Token
        const { q, limit = 50, sort, shipping, condition, DEAL, category } = req.query;

        const params = new URLSearchParams({
            limit: limit.toString()
        });

        if (q) params.append('q', q);
        if (sort) params.append('sort', sort);
        if (shipping) params.append('shipping', shipping);
        if (condition) params.append('condition', condition);
        if (DEAL) params.append('DEAL', DEAL);
        if (category) params.append('category', category);

        const url = `https://api.mercadolibre.com/sites/MLB/search?${params.toString()}`;

        const searchResponse = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'ML-Afiliados/1.0'
            }
        });

        if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            console.error('❌ Erro na busca:', searchResponse.status, errorText);
            throw new Error(`Erro na API de busca: ${searchResponse.status}`);
        }

        const data = await searchResponse.json();

        // Retornar dados
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error in authenticated search:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}
