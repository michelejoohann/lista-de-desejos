export default function ProductCard({ product }) {
  const statusLabel = product.status === 'reserved' ? 'Reservado' : product.status === 'received' ? 'Realizado' : 'Disponível';

  return (
    <article className="product-card">
      <div className="product-media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <span className="product-icon" aria-hidden="true">{product.icon || '🌿'}</span>
        )}
        <span className={`status-badge status-${product.status || 'available'}`}>{statusLabel}</span>
      </div>
      <div className="product-body">
        <p className="collection-name">{product.collection}</p>
        <h2>{product.name}</h2>
        <p className="product-description">{product.description}</p>
        <blockquote>{product.story}</blockquote>
        <div className="product-footer">
          <strong>{product.priceLabel || 'Consultar valor na loja'}</strong>
          <a href={product.url} target="_blank" rel="noopener noreferrer">Ver presente</a>
        </div>
      </div>
    </article>
  );
}