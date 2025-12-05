import React from 'react';

function FilterBar({ filters, onFilterChange, isLoading }) {
    const handleSortChange = (e) => {
        onFilterChange({ ...filters, sort: e.target.value });
    };

    const handleFreeShippingChange = (e) => {
        onFilterChange({ ...filters, freeShipping: e.target.checked });
    };

    const handleDiscountChange = (e) => {
        onFilterChange({ ...filters, discount: e.target.checked });
    };

    const handleConditionChange = (e) => {
        onFilterChange({ ...filters, condition: e.target.value || null });
    };

    return (
        <div className="card mb-lg">
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-md)',
                alignItems: 'end'
            }}>
                {/* Sort */}
                <div>
                    <label htmlFor="sort" style={{
                        display: 'block',
                        marginBottom: 'var(--spacing-xs)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--color-text-secondary)'
                    }}>
                        Ordenar por
                    </label>
                    <select
                        id="sort"
                        value={filters.sort}
                        onChange={handleSortChange}
                        disabled={isLoading}
                        className="input"
                        style={{ width: '100%' }}
                    >
                        <option value="relevance">Relevância</option>
                        <option value="price_asc">Menor preço</option>
                        <option value="price_desc">Maior preço</option>
                    </select>
                </div>

                {/* Condition */}
                <div>
                    <label htmlFor="condition" style={{
                        display: 'block',
                        marginBottom: 'var(--spacing-xs)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--color-text-secondary)'
                    }}>
                        Condição
                    </label>
                    <select
                        id="condition"
                        value={filters.condition || ''}
                        onChange={handleConditionChange}
                        disabled={isLoading}
                        className="input"
                        style={{ width: '100%' }}
                    >
                        <option value="">Todos</option>
                        <option value="new">Novo</option>
                        <option value="used">Usado</option>
                    </select>
                </div>

                {/* Checkboxes */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-sm)'
                }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        cursor: 'pointer',
                        userSelect: 'none'
                    }}>
                        <input
                            type="checkbox"
                            checked={filters.freeShipping}
                            onChange={handleFreeShippingChange}
                            disabled={isLoading}
                            style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.875rem' }}>🚚 Frete grátis</span>
                    </label>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        cursor: 'pointer',
                        userSelect: 'none'
                    }}>
                        <input
                            type="checkbox"
                            checked={filters.discount}
                            onChange={handleDiscountChange}
                            disabled={isLoading}
                            style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.875rem' }}>🏷️ Com desconto</span>
                    </label>
                </div>
            </div>
        </div>
    );
}

export default FilterBar;
