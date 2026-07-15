import { useEffect, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db } from './firebase/config.js';

const ADMIN_UID = '7G4v3hEMtaVzI8MUDsXjVCNXGJz1';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    signInAnonymously(auth).catch(() => {
      setError('Não foi possível iniciar a sessão do visitante.');
    });

    const productsQuery = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(
      productsQuery,
      snapshot => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      () => {
        setError('O catálogo ainda não pôde ser carregado do Firebase.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Versão 2.0 em construção</p>
        <h1>O Jardim de Desejos de Michèlé Joohann</h1>
        <p>Uma aplicação conectada ao Firebase, preparada para catálogo, reservas e painel administrativo.</p>
      </header>

      <main className="content">
        <section className="status-card">
          <h2>Fundação concluída</h2>
          <p>React, Vite, Firebase Authentication, Firestore e Storage já estão conectados no novo projeto.</p>
          <dl>
            <div><dt>Produtos no Firestore</dt><dd>{loading ? 'Carregando…' : products.length}</dd></div>
            <div><dt>Administrador configurado</dt><dd>{auth.currentUser?.uid === ADMIN_UID ? 'Sim' : 'Acesso protegido'}</dd></div>
          </dl>
          {error && <p className="error" role="alert">{error}</p>}
        </section>

        <section>
          <h2>Próximas entregas</h2>
          <div className="roadmap">
            <article><strong>1</strong><span>Migrar os produtos atuais para o Firestore</span></article>
            <article><strong>2</strong><span>Criar catálogo público em tempo real</span></article>
            <article><strong>3</strong><span>Implementar reservas compartilhadas</span></article>
            <article><strong>4</strong><span>Criar painel administrativo protegido</span></article>
          </div>
        </section>
      </main>
    </div>
  );
}
