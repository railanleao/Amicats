# Web

Painel web em Angular, usado remotamente pela administração/coordenação e pelas clínicas parceiras, sempre com internet estável. Consome a API do [backend](../backend). Veja a arquitetura completa em [`documentos/02-Especificação do Projeto.md`](../../documentos/02-Especificação%20do%20Projeto.md).

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
   npm start
   ```
3. Acesse `http://localhost:4200`.

## URL da API

O endereço do backend fica em `src/environments/environment.ts` (desenvolvimento) e `src/environments/environment.prod.ts` (build de produção, usado pelo Docker), na chave `apiUrl`. Por padrão aponta para `http://localhost:8080`, batendo com a porta padrão do [backend](../backend). Se você mudar `BACKEND_PORT` no `.env` da raiz, atualize `apiUrl` nesses arquivos antes de buildar a imagem — é uma SPA estática, então esse valor é fixado no build, não lido em tempo de execução do container.

## Build e testes

```bash
npm run build   # build de produção (sai em dist/web/browser)
npm test         # testes unitários (Karma + Jasmine)
```

## Lint e formatação

```bash
npm run lint             # ESLint (angular-eslint)
npx prettier --check .   # verifica formatação
npx prettier --write .   # corrige formatação
```

O ESLint e o Prettier já rodam sozinhos no pre-commit do repositório, só nos arquivos alterados (veja o [`CONTRIBUTING.md`](../../CONTRIBUTING.md) na raiz) — os comandos acima são só para checar manualmente antes de commitar.

## Estrutura de pastas

Dentro de `src/app`:

| Pasta                | Conteúdo                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pages`              | Componentes de rota — uma tela por pasta, ligados em `app.routes.ts`                                            |
| `components`         | Componentes de UI compartilhados entre páginas (botões, inputs, layout etc.)                                    |
| `services/http`      | Cliente HTTP — configuração base de acesso à API do [backend](../backend) (interceptors, `HttpClient` injetado) |
| `services/resources` | Um serviço por recurso da API (ex.: animais, salas, prontuários), consumindo o cliente de `services/http`       |
| `models`             | Tipos e interfaces TypeScript compartilhados                                                                    |
| `lib`                | Funções utilitárias que não têm relação com a API (formatação, constantes etc.)                                 |

Todas ainda estão vazias (só com um `.gitkeep`) — a estrutura existe para orientar onde cada novo arquivo deve entrar conforme as telas e a integração com o backend forem implementadas.

Não existe uma pasta `hooks`: em Angular, lógica com estado reutilizável entre componentes vai em um serviço injetável (`services/`) em vez de um hook — é o equivalente idiomático mais próximo.
