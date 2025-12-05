# Mercado Livre Afiliados - Gerador de Links

Aplicação web simples para buscar produtos no Mercado Livre, gerar links de afiliado e criar publicações formatadas para WhatsApp.

## Funcionalidades

- 🔍 Buscar produtos por palavra-chave
- 🔗 Gerar links de afiliado automaticamente
- 📱 Criar mensagens formatadas para WhatsApp com imagem
- 📋 Copiar mensagens com um clique
- 🎨 Interface moderna e responsiva

## Como usar

### 1. Instale as dependências:
```bash
npm install
```

### 2. Configure sua tag de afiliado

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua tag de afiliado:
```
VITE_ML_AFFILIATE_TAG=sua_tag_aqui
```

> **Onde encontrar sua tag?** Acesse o [programa de afiliados do Mercado Livre](https://afiliados.mercadolivre.com.br/)

### 3. Execute o projeto:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173/`

## ⚠️ Nota Importante sobre a API

A API pública do Mercado Livre pode bloquear requisições vindas de `localhost` devido a políticas de CORS. 

### Soluções:

**1. 🚀 Deploy em Produção (Recomendado)**

A forma mais confiável é fazer deploy da aplicação:

**Vercel:**
```bash
npm run build
vercel --prod
```

**Netlify:**
```bash
npm run build
netlify deploy --prod --dir=dist
```

Não esqueça de configurar a variável `VITE_ML_AFFILIATE_TAG` no painel do serviço!

**2. 🔧 Extensão de Navegador (Temporário)**

Para desenvolvimento local, você pode usar extensões que desabilitam CORS:
- **Chrome**: "CORS Unblock" ou "Allow CORS: Access-Control-Allow-Origin"
- **Firefox**: "CORS Everywhere"

**3. 🌐 Usar Ngrok/Localtunnel**

Exponha seu localhost com uma URL pública:
```bash
npx ngrok http 5173
```

## 🎯 Filtros de Promoção

A aplicação agora suporta filtros avançados para encontrar as melhores ofertas:
- 🏷️ **Produtos com desconto**
- 🚚 **Frete grátis**
- 💰 **Ordenação por preço** (menor/maior)
- ⭐ **Ordenação por relevância**
- 🆕 **Filtro por condição** (novo/usado)

## Tecnologias

- Vite + React
- CSS moderno com design premium
- API do Mercado Livre
- Google Fonts (Inter)

## Estrutura

```
src/
  ├── components/     # Componentes React (SearchBar, ProductCard)
  ├── services/       # Integração com API do Mercado Livre e WhatsApp
  ├── index.css       # Design system
  └── App.jsx         # Componente principal
```

## Formato da Mensagem WhatsApp

```
🛍️ *[Nome do Produto]*

💰 *Preço:* R$ XX,XX

🚚 *Frete GRÁTIS* (quando disponível)

🔗 *Link:* [link com tag de afiliado]

✨ Aproveite essa oferta!
```

A mensagem copiada inclui a URL da imagem do produto para facilitar o envio no WhatsApp!

---

Feito com 💜 para afiliados do Mercado Livre
