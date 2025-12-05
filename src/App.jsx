import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import ProductCard from './components/ProductCard';
import { searchProducts } from './services/mercadolivre';
import './index.css';

function App() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentQuery, setCurrentQuery] = useState('');
    const [filters, setFilters] = useState({
        sort: 'relevance',
        freeShipping: false,
        condition: null,
        discount: false
    });

    // Get affiliate tag from environment variable
    const affiliateTag = import.meta.env.VITE_ML_AFFILIATE_TAG || '';

    const performSearch = async (query, searchFilters) => {
        setIsLoading(true);
        setError(null);

        try {
            const results = await searchProducts(query, searchFilters);
            setProducts(results);
        } catch (err) {
            if (err.message.includes('CORS')) {
                setError(
                    'A API do Mercado Livre bloqueou a requisição. ' +
                    'Para usar a aplicação, faça deploy em produção (Vercel/Netlify) ou use uma extensão de navegador para desabilitar CORS. ' +
                    'Veja o console do navegador para mais detalhes.'
                );
            } else {
                setError('Erro ao buscar produtos. Tente novamente.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setCurrentQuery(query);
        setHasSearched(true);
        await performSearch(query, filters);
    };

    const handleFilterChange = async (newFilters) => {
        setFilters(newFilters);
        // Re-search with new filters if there's a current query
        if (currentQuery) {
            await performSearch(currentQuery, newFilters);
        }
    };


    return (
        <div className="app">
            <header className="app-header">
                <div className="container">
                    <h1>🛍️ Mercado Livre Afiliados</h1>
                    <p>Busque produtos e gere links de afiliado para WhatsApp</p>
                </div>
            </header>

            <main className="app-main">
                <div className="container">
                    <SearchBar onSearch={handleSearch} isLoading={isLoading} />

                    {hasSearched && (
                        <FilterBar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            isLoading={isLoading}
                        />
                    )}

                    {!affiliateTag && (
                        <div className="card mb-lg" style={{ background: 'hsl(45, 100%, 15%)', borderColor: 'hsl(45, 100%, 30%)' }}>
                            <p style={{ color: 'hsl(45, 100%, 70%)', marginBottom: 0 }}>
                                ⚠️ <strong>Atenção:</strong> Configure sua tag de afiliado no arquivo <code>.env</code> para gerar links personalizados.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="card mb-lg" style={{ background: 'hsl(0, 76%, 15%)', borderColor: 'hsl(0, 76%, 30%)' }}>
                            <p style={{ color: 'hsl(0, 76%, 70%)', marginBottom: 0 }}>
                                ❌ {error}
                            </p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="empty-state">
                            <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
                            <p style={{ marginTop: 'var(--spacing-lg)' }}>Buscando produtos...</p>
                        </div>
                    )}

                    {!isLoading && hasSearched && products.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <h3>Nenhum produto encontrado</h3>
                            <p>Tente buscar com outras palavras-chave</p>
                        </div>
                    )}

                    {!isLoading && products.length > 0 && (
                        <>
                            <div className="mb-lg">
                                <p className="text-muted">
                                    Encontrados <strong style={{ color: 'var(--color-text-primary)' }}>{products.length}</strong> produtos
                                </p>
                            </div>

                            <div className="grid grid-3">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        affiliateTag={affiliateTag}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {!hasSearched && (
                        <div className="empty-state">
                            <div className="empty-state-icon">🚀</div>
                            <h3>Comece sua busca</h3>
                            <p>Digite o nome de um produto para começar</p>
                        </div>
                    )}
                </div>
            </main>

            <footer style={{
                textAlign: 'center',
                padding: 'var(--spacing-xl)',
                borderTop: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)'
            }}>
                <p className="mb-0">
                    Feito com 💜 para afiliados do Mercado Livre
                </p>
            </footer>
        </div>
    );
}

export default App;
