export default function ProductCard({ product }) {
  const statusLabel = product.status === 'reserved' ? 'Reservado' : product.status === 'received' ? 'Realizado' : 'Disponível';
  const imageUrl = product.imageUrl || product.image;
  const meanings = Array.isArray(product.meanings) ? product.meanings : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];

  return (
    <article className="product-card">
      <div className="product-media">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <span className="product-icon" aria-hidden="true">{product.icon || '🌿'}</span>
        )}
        <span className={`status-badge status-${product.status || 'available'}`}>{statusLabel}</span>
      </div>

      <div className="product-body">
        <p className="collection-name">
          {product.collection}
          {product.subcategory ? ` · ${product.subcategory}` : ''}
        </p>
        <h2>{product.name}</h2>
        <p className="product-description">{product.description}</p>

        {product.dream && (
          <section className="dream-section" aria-label="O sonho deste presente">
            <span className="dream-label">🌱 O sonho</span>
            <p>{product.dream}</p>
          </section>
        )}

        {meanings.length > 0 && (
          <div className="meaning-tags" aria-label="Significados">
            {meanings.map(meaning => <span key={meaning}>{meaning}</span>)}
          </div>
        )}

        {sizes.length > 0 && (
          <p className="product-meta"><strong>Tamanho desejado:</strong> {sizes.join(', ')}</p>
        )}

        {product.story && (
          <details className="story-details">
            <summary>📖 A história</summary>
            <blockquote>{product.story}</blockquote>
          </details>
        )}

        <div className="product-footer">
          <strong>{product.priceLabel || 'Consultar valor na loja'}</strong>
          <a href={product.url} target="_blank" rel="noopener noreferrer">Ver presente</a>
        </div>
      </div>
    </article>
  );
}