# Migração inicial do catálogo

A versão 2.0 contém um painel administrativo que importa os produtos do arquivo `src/data/legacyProducts.js` para a coleção `products` do Firestore.

## Pré-requisitos

- Authentication com Email/Senha ativado.
- Usuária administrativa criada com UID `7G4v3hEMtaVzI8MUDsXjVCNXGJz1`.
- Regras seguras do Firestore publicadas.
- Aplicação da branch `feature/v2-react-firebase` executando localmente ou em ambiente de homologação.

## Procedimento

1. Abra a aplicação da versão 2.0.
2. Na seção **Importação inicial do catálogo**, informe o e-mail e a senha da conta administrativa.
3. Clique em **Entrar como administradora**.
4. Confirme que a seção muda para **Migrar produtos para o Firestore**.
5. Clique em **Importar catálogo atual**.
6. Confirme a operação.
7. Aguarde a mensagem de sucesso.
8. No Firebase Console, abra Firestore > Dados > `products` e confirme os documentos.

A migração usa IDs estáveis e `merge: true`. Ela pode ser executada novamente para atualizar os dados sem duplicar produtos.

## Validação

- O contador deve mostrar 29 produtos no Firestore.
- O aviso de catálogo de segurança deve desaparecer.
- Busca, filtros e ordenação devem continuar funcionando.
- Nenhuma coleção privada deve ficar visível para visitantes.
