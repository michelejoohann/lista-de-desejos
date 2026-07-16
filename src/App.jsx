import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db } from './firebase/config.js';
import ProductCard from './components/ProductCard.jsx';
import AdminMigrationPanel from './components/AdminMigrationPanel.jsx';
import { legacyProducts } from './data/legacyProducts.js';

const categoryLabels = {
  casa: '🏡 Casa',
  moda: '👗 Vestuário',
  joias: '💍 Joias',
  livros: '📚 Livros',
  tecnologia: '💻 Tecnologia',
  arte: '🎨 Arte e espiritualidade',
  jardim: '🌳 Jardim externo',
};

function labelFromValue(value) {
  return value
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function App() {
  const [firestoreProducts, setFirestoreProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [subcategory, setSubcategory] = useState('all');
  const [sort, setSort] = useState('default');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      if (!currentUser) {
        signInAnonymously(auth).catch(() => setError('Não foi possível iniciar a sessão do visitante.'));
      }
    });

    const productsQuery = query(collection(db, 'products'), orderBy('name'));
    const unsubscribeProducts = onSnapshot(
      productsQuery,
      snapshot => {
        setFirestoreProducts(snapshot.docs.map(document => ({ id: document.id, ...document.data() })));
        setLoading(false);
      },
      () => {
        setError('O Firestore ainda não pôde ser consultado. O catálogo de segurança foi carregado.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
    };
  }, []);

  const sourceProducts = firestoreProducts.length ? firestoreProducts : legacyProducts;
  const usingFallback = !loading && !firestoreProducts.length;

  const availableCategories = useMemo(
    () => [...new Set(sourceProducts.map(product => product.category).filter(Boolean))].sort(),
    [sourceProducts]
  );

  const availableSubcategories = useMemo(() => {
    const productsInCategory = category === 'all'
      ? sourceProducts
      : sourceProducts.filter(product => product.category === category);
    return [...new Set(productsInCategory.map(product => product.subcategory).filter(Boolean))].sort();
  }, [sourceProducts, category]);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const filtered = sourceProducts.filter(product => {
      if (product.published === false) return false;
      const matchesCategory = category === 'all' || product.category === category;
      const matchesSubcategory = subcategory === 'all' || product.subcategory === subcategory;
      const searchable = `${product.name} ${product.collection} ${product.description} ${product.dream || ''} ${product.story || ''}`.toLocaleLowerCase('pt-BR');
      return matchesCategory && matchesSubcategory && searchable.includes(term);
    });

    if (sort === 'priceAsc') return [...filtered].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === 'priceDesc') return [...filtered].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    if (sort === 'nameAsc') return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    return filtered;
  }, [sourceProducts, search, category, subcategory, sort]);

  function handleCategoryChange(event) {
    setCategory(event.target.value);
    setSubcategory('all');
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Jardim de Desejos · versão 2.1</p>
        <h1>O Jardim de Desejos de Michèlé Joohann</h1>
        <p>Sonhos cultivados com carinho, significado e história.</p>
        <div className="hero-stats">
          <span>{sourceProducts.length} desejos no jardim</span>
          <span>{visibleProducts.length} exibidos</span>
          <span>{firestoreProducts.length ? 'Sincronizado com Firestore' : 'Catálogo de segurança ativo'}</span>
        </div>
      </header>

      <main className="content">
        <AdminMigrationPanel user={user} firestoreCount={firestoreProducts.length} />

        <section className="catalog-toolbar" aria-label="Controles do catálogo">
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar por nome, sonho, coleção ou história…"
            aria-label="Buscar presentes"
          />
          <select value={category} onChange={handleCategoryChange} aria-label="Filtrar por ambiente">
            <option value="all">Todos os ambientes</option>
            {availableCategories.map(value => (
              <option key={value} value={value}>{categoryLabels[value] || labelFromValue(value)}</option>
            ))}
          </select>
          <select value={subcategory} onChange={event => setSubcategory(event.target.value)} aria-label="Filtrar por canteiro">
            <option value="all">Todos os canteiros</option>
            {availableSubcategories.map(value => (
              <option key={value} value={value}>{labelFromValue(value)}</option>
            ))}
          </select>
          <select value={sort} onChange={event => setSort(event.target.value)} aria-label="Ordenar presentes">
            <option value="default">Ordem original</option>
            <option value="priceAsc">Menor valor ao maior</option>
            <option value="priceDesc">Maior valor ao menor</option>
            <option value="nameAsc">Nome de A a Z</option>
          </select>
        </section>

        {loading && <p className="notice">Conectando ao Jardim…</p>}
        {usingFallback && <p className="notice warning">O banco ainda está vazio. Entre como administradora acima e execute a importação inicial.</p>}
        {error && <p className="notice error" role="alert">{error}</p>}

        <section className="product-grid" aria-live="polite">
          {visibleProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </section>

        {!loading && visibleProducts.length === 0 && <p className="empty-state">Nenhum desejo encontrado com esses filtros.</p>}
      </main>
    </div>
  );
}