import React, { useState } from 'react';
import { generateAffiliateLink, formatPrice } from '../services/mercadolivre';
import { generateWhatsAppMessage, copyToClipboard, getWhatsAppShareUrl } from '../services/whatsapp';
import './ProductCard.css';

export default function ProductCard({ product, affiliateTag }) {
    const [copied, setCopied] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');

    const affiliateLink = generateAffiliateLink(product.permalink, affiliateTag);
    const whatsappMessage = generateWhatsAppMessage(product, affiliateLink);

    const handleCopy = async () => {
        // Copy message with image URL
        const messageWithImage = `${product.image}\n\n${whatsappMessage}`;
        const success = await copyToClipboard(messageWithImage);

        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleWhatsAppShare = () => {
        const url = getWhatsAppShareUrl(whatsappMessage, phoneNumber);
        window.open(url, '_blank');
    };

    return (
        <div className="product-card card fade-in">
            <div className="product-image-wrapper">
                <img
                    src={product.image}
                    alt={product.title}
                    className="product-image"
                    loading="lazy"
                />
                {product.shipping.freeShipping && (
                    <span className="product-badge">Frete Grátis</span>
                )}
            </div>

            <div className="product-content">
                <h3 className="product-title">{product.title}</h3>

                <div className="product-price">
                    {product.originalPrice && product.originalPrice > product.price && (
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--color-text-muted)',
                            textDecoration: 'line-through',
                            marginBottom: 'var(--spacing-xs)'
                        }}>
                            {formatPrice(product.originalPrice)}
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        {formatPrice(product.price)}
                        {product.discount > 0 && (
                            <span style={{
                                background: 'hsl(142, 76%, 36%)',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}>
                                -{product.discount}%
                            </span>
                        )}
                    </div>
                </div>

                {product.soldQuantity > 0 && (
                    <p className="product-sold text-muted">
                        {product.soldQuantity} vendidos
                    </p>
                )}

                <div className="product-actions">
                    <button
                        className="btn btn-primary btn-block"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M10 1C5 1 1 5 1 10s4 9 9 9 9-4 9-9-4-9-9-9z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M10 7v6M7 10h6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        {showPreview ? 'Ocultar Mensagem' : 'Ver Mensagem WhatsApp'}
                    </button>
                </div>

                {showPreview && (
                    <div className="whatsapp-preview">
                        <div className="whatsapp-preview-header">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <span>Prévia WhatsApp</span>
                        </div>

                        <div className="whatsapp-message">
                            <div className="product-preview-image">
                                <img src={product.image} alt={product.title} />
                            </div>
                            <pre className="whatsapp-text">{whatsappMessage}</pre>
                        </div>

                        <div className="whatsapp-actions">
                            <div className="phone-input-wrapper">
                                <label htmlFor={`phone-${product.id}`} className="phone-label">
                                    📱 Enviar para número/grupo (opcional):
                                </label>
                                <input
                                    id={`phone-${product.id}`}
                                    type="tel"
                                    className="input phone-input"
                                    placeholder="Ex: 5511999999999"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                                <small className="phone-hint">
                                    Digite o número com código do país ou deixe vazio para escolher o contato
                                </small>
                            </div>

                            <button
                                className={`btn ${copied ? 'btn-success' : 'btn-secondary'} btn-block`}
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path
                                                d="M16.667 5L7.5 14.167 3.333 10"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        Copiado!
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <rect
                                                x="7"
                                                y="7"
                                                width="11"
                                                height="11"
                                                rx="2"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />
                                            <path
                                                d="M13 7V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                        Copiar Mensagem + Imagem
                                    </>
                                )}
                            </button>

                            <button
                                className="btn btn-success btn-block"
                                onClick={handleWhatsAppShare}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                {phoneNumber ? 'Enviar para Número/Grupo' : 'Abrir no WhatsApp'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
