# Configuração do Firebase — Jardim de Desejos v2

## 1. Publicar regras do Firestore

No Firebase Console, abra **Firestore Database → Regras** e substitua o conteúdo pelas regras do arquivo `firestore.rules` desta branch. Clique em **Publicar**.

Essas regras permitem leitura pública dos produtos publicados e restringem alterações ao UID administrativo configurado.

## 2. Conferir autenticação

Em **Authentication → Método de login**, mantenha ativos:

- Anônimo, para visitantes;
- E-mail/senha, para a administradora.

## 3. Domínio autorizado

Em **Authentication → Configurações → Domínios autorizados**, confirme:

- `michelejoohann.github.io`
- `localhost`

## 4. Migração dos produtos

A aplicação React possui um catálogo legado de segurança em `src/data/legacyProducts.js`. Enquanto a coleção `products` estiver vazia, esse catálogo será exibido automaticamente.

Na próxima etapa, o painel administrativo terá uma ação de migração que criará os documentos no Firestore. Após a migração, o catálogo passará a usar os dados do banco em tempo real.

## 5. Segurança da configuração Web

A configuração Web do Firebase é entregue ao navegador e não deve ser tratada como credencial administrativa. A proteção efetiva depende de:

- Firebase Authentication;
- Firestore Security Rules;
- Storage Security Rules;
- restrição da chave por domínio;
- App Check, em uma etapa posterior.
