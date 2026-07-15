# Arquitetura — Jardim de Desejos de Michèlé Joohann

## 1. Visão do produto

O Jardim de Desejos é uma aplicação web pública para organizar desejos, presentes, reservas e itens realizados. O projeto deve ser fácil de manter, visualmente elegante e seguro para visitantes e administradora.

A versão 2.0 terá dois ambientes principais:

- **Site público:** catálogo, busca, filtros, fotos, valores, reserva de presentes e status em tempo real.
- **Painel administrativo:** autenticação, cadastro e edição de produtos, upload de imagens, visualização de reservas e marcação de itens como recebidos.

## 2. Objetivos

- Eliminar a necessidade de editar HTML para cadastrar produtos.
- Manter os dados centralizados no Firebase.
- Permitir reservas em tempo real sem expor dados pessoais.
- Suportar fotos originais dos produtos.
- Manter o site público no GitHub Pages.
- Organizar o código como um projeto profissional e evolutivo.

## 3. Arquitetura geral

```text
Usuário público
      |
      v
GitHub Pages
      |
      v
React + Vite
      |
      +--> Firebase Authentication
      +--> Cloud Firestore
      +--> Firebase Storage

Administradora
      |
      v
Painel Administrativo
      |
      +--> Authentication por e-mail e senha
      +--> CRUD de produtos
      +--> Upload de imagens
      +--> Gestão de reservas
```

## 4. Tecnologias

### Front-end

- React
- Vite
- JavaScript ou TypeScript
- CSS modular ou CSS global organizado por tema
- React Router

### Back-end gerenciado

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase App Check em etapa posterior

### Hospedagem

- GitHub Pages
- GitHub Actions para build e deploy

## 5. Estrutura de diretórios proposta

```text
lista-de-desejos/
├── public/
│   ├── favicon.svg
│   └── images/
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   └── routes.jsx
│   ├── components/
│   │   ├── ProductCard.jsx
│   │   ├── ProductFilters.jsx
│   │   ├── ProductModal.jsx
│   │   ├── ReservationModal.jsx
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── GardenPage.jsx
│   │   ├── AdminLoginPage.jsx
│   │   ├── AdminDashboardPage.jsx
│   │   ├── AdminProductsPage.jsx
│   │   └── AdminReservationsPage.jsx
│   ├── services/
│   │   ├── firebase.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── reservationService.js
│   │   └── storageService.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useProducts.js
│   │   └── useReservations.js
│   ├── utils/
│   │   ├── currency.js
│   │   ├── validators.js
│   │   └── slug.js
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   └── components.css
│   └── main.jsx
├── firebase/
│   ├── firestore.rules
│   ├── storage.rules
│   └── firestore.indexes.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   └── ROADMAP.md
├── .github/workflows/deploy.yml
├── package.json
├── vite.config.js
└── README.md
```

## 6. Modelo de dados

### Coleção `products`

Documento: `products/{productId}`

```json
{
  "name": "Vestido Super Midi Galadriel",
  "slug": "vestido-super-midi-galadriel",
  "category": "moda",
  "collection": "Galadriel",
  "description": "Vestido romântico em off-white.",
  "story": "Há vestidos que vestem o corpo; este veste um sonho.",
  "price": 429.90,
  "priceLabel": "R$ 429,90",
  "currency": "BRL",
  "url": "https://...",
  "imageUrl": "https://...",
  "priority": 5,
  "status": "available",
  "isNew": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Valores possíveis de `status`:

- `available`
- `reserved`
- `received`
- `unavailable`

### Coleção `publicReservations`

Documento: `publicReservations/{productId}`

```json
{
  "status": "reserved",
  "reservedAt": "timestamp"
}
```

Essa coleção é pública e não contém dados pessoais.

### Coleção `privateReservations`

Documento: `privateReservations/{productId}`

```json
{
  "productId": "produto-id",
  "visitorUid": "uid-anonimo",
  "name": "Nome da pessoa",
  "email": "email opcional",
  "message": "Mensagem opcional",
  "createdAt": "timestamp"
}
```

Somente a administradora poderá ler esses documentos.

### Coleção `settings`

Documento: `settings/site`

```json
{
  "title": "O Jardim de Desejos de Michèlé Joohann",
  "intro": "Texto de apresentação",
  "allowReservations": true,
  "updatedAt": "timestamp"
}
```

## 7. Autenticação e papéis

### Visitantes

- Login anônimo em segundo plano.
- Podem consultar produtos.
- Podem criar uma reserva para um item disponível.
- Não podem visualizar dados privados de outras reservas.

### Administradora

UID administrativo:

```text
7G4v3hEMtaVzI8MUDsXjVCNXGJz1
```

Permissões:

- Criar, editar e excluir produtos.
- Fazer upload de imagens.
- Ver dados privados das reservas.
- Liberar reservas.
- Marcar produtos como recebidos.
- Alterar configurações do site.

## 8. Regras de segurança planejadas

### Firestore

- `products`: leitura pública; escrita somente pela administradora.
- `publicReservations`: leitura pública; criação por usuário autenticado; alteração e exclusão somente pela administradora.
- `privateReservations`: criação pelo próprio usuário anônimo; leitura, alteração e exclusão somente pela administradora.
- `settings`: leitura pública; escrita somente pela administradora.

### Storage

- Leitura pública das imagens dos produtos.
- Upload, edição e exclusão somente pela administradora.
- Limite de tamanho e tipos aceitos: JPG, PNG e WebP.

## 9. Fluxos principais

### Fluxo público

1. Visitante abre o Jardim.
2. Aplicação autentica anonimamente.
3. Produtos são carregados do Firestore.
4. Visitante usa busca, categoria, faixa de valor e ordenação.
5. Visitante abre um produto.
6. Visitante escolhe “Vou presentear”.
7. Aplicação cria os documentos público e privado da reserva.
8. O produto passa a aparecer como reservado para todos.

### Fluxo administrativo

1. Administradora acessa `/admin`.
2. Faz login com e-mail e senha.
3. Sistema valida o UID.
4. Painel carrega produtos e reservas.
5. Administradora cadastra, edita ou remove produtos.
6. Imagens são enviadas ao Firebase Storage.
7. Administradora marca produtos como recebidos ou libera reservas.

## 10. Telas previstas

### Site público

- Página principal do Jardim
- Modal de produto
- Modal de reserva
- Página de item individual em fase posterior
- Página de desejos realizados em fase posterior

### Painel administrativo

- Login
- Dashboard
- Lista de produtos
- Formulário de produto
- Lista de reservas
- Configurações do site

## 11. Requisitos não funcionais

- Responsivo para celular, tablet e computador.
- Acessível por teclado.
- Textos e botões com contraste adequado.
- Carregamento progressivo de imagens.
- Mensagens claras de erro e sucesso.
- Nenhuma senha ou dado privado no repositório.
- Configuração pública do Firebase separada em arquivo próprio.
- Regras do Firestore versionadas no GitHub.

## 12. Estratégia de migração

### Fase 1 — Preparação

- Criar projeto React + Vite.
- Configurar Firebase.
- Configurar rotas.
- Publicar uma versão visualmente equivalente ao site atual.

### Fase 2 — Dados

- Criar serviços do Firestore.
- Migrar os produtos do arquivo `products.js` para `products`.
- Validar filtros, busca e ordenação.

### Fase 3 — Reservas

- Implementar autenticação anônima.
- Implementar reserva pública e privada.
- Aplicar regras de segurança.

### Fase 4 — Administração

- Criar login administrativo.
- Criar painel de produtos.
- Criar painel de reservas.
- Criar upload de imagens.

### Fase 5 — Publicação

- Criar GitHub Action.
- Fazer build do Vite.
- Publicar no GitHub Pages.
- Testar domínio autorizado no Firebase.

## 13. Critérios de aceite da versão 2.0

A versão 2.0 estará concluída quando:

- todos os produtos vierem do Firestore;
- o site público mantiver busca, filtros e ordenação;
- visitantes puderem reservar itens;
- reservas forem sincronizadas em tempo real;
- dados pessoais não forem públicos;
- a administradora conseguir acessar o painel;
- produtos puderem ser criados e editados sem alterar código;
- imagens puderem ser enviadas pelo painel;
- o site estiver publicado no GitHub Pages.

## 14. Decisões arquiteturais

- **React + Vite:** escolhido pela simplicidade, desempenho e facilidade de publicação.
- **Firestore:** escolhido para sincronização em tempo real e baixa manutenção.
- **Firebase Storage:** escolhido para imagens administradas pelo painel.
- **GitHub Pages:** mantido por ser gratuito e já estar configurado.
- **Login anônimo:** evita obrigar convidados a criar contas.
- **Separação entre reserva pública e privada:** evita exposição de nome, e-mail e mensagem.

## 15. Próximo passo técnico

Criar o esqueleto React + Vite em uma branch separada, preservando a versão atual até a versão 2.0 estar funcional e revisada.
