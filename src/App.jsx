import { useEffect, useMemo, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db } from './firebase/config.js';
import ProductCard from './components/ProductCard.jsx';
import { legacyProducts } from './data/legacyProducts.js';

export default function App() {
  const [firestoreProducts, setFirestoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('default');

  useEffect(() => {
    signInAnonymously(auth).catch(() => setError('Não foi possível iniciar a sessão do visitante.'));

    const productsQuery = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(
      productsQuery,
      snapshot => {
        setFirestoreProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      () => {
        setError('O Firestore ainda não pôde ser consultado. O catálogo de segurança foi carregado.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const sourceProducts = firestoreProducts.length ? firestoreProducts : legacyProducts;
  const usingFallback = !loading && !firestoreProducts.length;

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const filtered = sourceProducts.filter(product => {
      if (product.published === false) return false;
      const matchesCategory = category === 'all' || product.category === category;
      const searchable = `${product.name} ${product.collection} ${product.description}`.toLocaleLowerCase('pt-BR');
      return matchesCategory && searchable.includes(term);
    });

    if (sort === 'priceAsc') return [...filtered].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === 'priceDesc') return [...filtered].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    if (sort === 'nameAsc') return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    return filtered;
  }, [sourceProducts, search, category, sort]);

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Jardim de Desejos · versão 2.0</p>
        <h1>O Jardim de Desejos de Michèlé Joohann</h1>
        <p>Sonhos cultivados com carinho, agora em uma experiência dinâmica conectada ao Firebase.</p>
        <div className="hero-stats">
          <span>{sourceProducts.length} desejos no jardim</span>
          <span>{visibleProducts.length} exibidos</span>
          <span>{firestoreProducts.length ? 'Sincronizado com Firestore' : 'Catálogo de segurança ativo'}</span>
        </div>
      </header>

      <main className="content">
        <section className="catalog-toolbar" aria-label="Controles do catálogo">
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar por nome, coleção ou descrição…"
            aria-label="Buscar presentes"
          />
          <select value={category} onChange={event => setCategory(event.target.value)} aria-label="Filtrar por categoria">
            <option value="all">Todas as categorias</option>
            <option value="moda">Guarda-Roupa</option>
            <option value="joias">Tesouros</option>
            <option value="casa">Lar</option>
          </select>
          <select value={sort} onChange={event => setSort(event.target.value)} aria-label="Ordenar presentes">
            <option value="default">Ordem original</option>
            <option value="priceAsc">Menor valor ao maior</option>
            <option value="priceDesc">Maior valor ao menor</option>
            <option value="nameAsc">Nome de A a Z</option>
          </select>
        </section>

        {loading && <p className="notice">Conectando ao Jardim…</p>}
        {usingFallback && <p className="notice warning">O banco ainda está vazio. Exibindo os produtos já cadastrados enquanto preparamos a migração.</p>}
        {error && <p className="notice error" role="alert">{error}</p>}

        <section className="product-grid" aria-live="polite">
          {visibleProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </section>

        {!loading && visibleProducts.length === 0 && <p className="empty-state">Nenhum desejo encontrado com esses filtros.</p>}
      </main>
    </div>
  );
}