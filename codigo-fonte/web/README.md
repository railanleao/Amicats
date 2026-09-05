# Web

Painel web em Next.js, usado remotamente pela administração/coordenação e pelas clínicas parceiras, sempre com internet estável. Consome a API do [backend](../backend). Veja a arquitetura completa em [`documentos/02-Especificação do Projeto.md`](../../documentos/02-Especificação%20do%20Projeto.md).

## Pré-requisitos

- **Docker** e **Docker Compose** — suficiente para rodar tudo (banco, backend e web) sem instalar mais nada

Só é necessário instalar o restante abaixo se for rodar o web **fora** do Docker (mais prático no dia a dia de desenvolvimento, com atualização automática a cada alteração):

- **Node.js 20 LTS ou superior** e **npm**

## Como rodar

**Opção 1 — tudo via Docker Compose** (banco, backend e web juntos). Na raiz do repositório:

```bash
docker compose up -d --build
```

Acesse `http://localhost:3000`.

**Opção 2 — web local** (com hot-reload). A partir de `codigo-fonte/web`:

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse `http://localhost:3000`.

## Build e testes

```bash
npm run build   # build de produção
npm start        # roda o build de produção gerado
npm run lint     # checagem de lint
```

## Lint e formatação

```bash
npm run lint             # ESLint (eslint-config-next)
npx prettier --check .   # verifica formatação
npx prettier --write .   # corrige formatação
```

O ESLint e o Prettier já rodam sozinhos no pre-commit do repositório, só nos arquivos alterados (veja o [`CONTRIBUTING.md`](../../CONTRIBUTING.md) na raiz) — os comandos acima são só para checar manualmente antes de commitar.

## Estrutura de pastas

Dentro de `src`:

| Pasta                | Conteúdo                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `app`                | Rotas e páginas (App Router do Next.js)                                                                                            |
| `components`         | Componentes de UI compartilhados entre páginas (botões, inputs, layout etc.)                                                       |
| `presentations`      | Composição específica de cada página — monta a tela usando componentes de `components`, mantendo o arquivo de rota em `app` enxuto |
| `services/http`      | Cliente HTTP — configuração base de acesso à API do [backend](../backend)                                                          |
| `services/resources` | Um módulo por recurso da API (ex.: animais, salas, prontuários), consumindo o cliente de `services/http`                           |
| `hooks`              | Hooks React customizados                                                                                                           |
| `lib`                | Funções utilitárias que não têm relação com a API (formatação, constantes etc.)                                                    |
| `types`              | Tipos e interfaces TypeScript compartilhados                                                                                       |

Todas ainda estão vazias (só com um `.gitkeep`) — a estrutura existe para orientar onde cada novo arquivo deve entrar conforme as telas e a integração com o backend forem implementadas.
