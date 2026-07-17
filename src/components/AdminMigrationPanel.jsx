import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config.js';
import { migrateLegacyProducts } from '../services/productMigration.js';

const ADMIN_UID = '7G4v3hEMtaVzI8MUDsXjVCNXGJz1';

export default function AdminMigrationPanel({ user, firestoreCount }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isAdmin = user?.uid === ADMIN_UID;

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (credential.user.uid !== ADMIN_UID) {
        await signOut(auth);
        throw new Error('Esta conta não possui acesso administrativo.');
      }
      setPassword('');
      setMessage('Acesso administrativo confirmado.');
    } catch (err) {
      setError(err?.message || 'Não foi possível entrar no painel.');
    } finally {
      setBusy(false);
    }
  }

  async function handleMigration() {
    const confirmed = window.confirm(
      `Importar os produtos atuais para o Firestore?\n\nO processo usa os IDs existentes e pode ser executado novamente sem duplicar documentos.`
    );
    if (!confirmed) return;

    setBusy(true);
    setMessage('');
    setError('');
    try {
      const total = await migrateLegacyProducts();
      setMessage(`${total} produtos foram gravados ou atualizados no Firestore.`);
    } catch (err) {
      setError(err?.message || 'A migração não pôde ser concluída.');
    } finally {
      setBusy(false);
    }
  }

  if (!isAdmin) {
    return (
      <section className="admin-panel" aria-labelledby="admin-title">
        <div>
          <p className="section-kicker">Administração</p>
          <h2 id="admin-title">Importação inicial do catálogo</h2>
          <p>Entre com a conta administrativa criada no Firebase para liberar a migração.</p>
        </div>
        <form className="admin-login" onSubmit={handleLogin}>
          <label>
            E-mail
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="username" />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={event => setPassword(event.target.value)} required autoComplete="current-password" />
          </label>
          <button type="submit" disabled={busy}>{busy ? 'Entrando…' : 'Entrar como administradora'}</button>
        </form>
        {message && <p className="notice success">{message}</p>}
        {error && <p className="notice error" role="alert">{error}</p>}
      </section>
    );
  }

  return (
    <section className="admin-panel" aria-labelledby="migration-title">
      <div>
        <p className="section-kicker">Painel administrativo</p>
        <h2 id="migration-title">Migrar produtos para o Firestore</h2>
        <p>O banco possui atualmente <strong>{firestoreCount}</strong> produtos. A importação grava os itens usando IDs estáveis e não cria duplicatas.</p>
      </div>
      <div className="admin-actions">
        <button type="button" onClick={handleMigration} disabled={busy}>{busy ? 'Importando…' : 'Importar catálogo atual'}</button>
        <button type="button" className="secondary-button" onClick={() => signOut(auth)} disabled={busy}>Sair</button>
      </div>
      {message && <p className="notice success">{message}</p>}
      {error && <p className="notice error" role="alert">{error}</p>}
    </section>
  );
}
