# Mobile

App em React Native (Expo) usado dentro do abrigo pelos voluntários e veterinários, com funcionamento offline. Consome a API do [backend](../backend). Veja a arquitetura completa em [`documentos/02-Especificação do Projeto.md`](../../documentos/02-Especificação%20do%20Projeto.md).

## Pré-requisitos

Instale antes de rodar o projeto:

- **Node.js 20 LTS ou superior** e **npm**
- **App Expo Go** no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) — forma mais simples de testar, sem precisar instalar Android Studio ou Xcode

Opcional, só se for rodar em emulador em vez do celular físico:

- **Android Studio** (para emulador Android) ou **Xcode**, somente em macOS (para simulador iOS)

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```
3. Escaneie o QR code exibido no terminal com o app **Expo Go** no celular (Android: dentro do próprio app; iOS: pela câmera nativa).

Por padrão o app aponta para `http://localhost:8080`. Isso funciona ao rodar `npm run web` ou em um emulador, mas não em um celular físico via Expo Go — nesse caso, aponte para o IP da sua máquina na rede local copiando o `.env.example` para `.env` na raiz do projeto e ajustando a variável:

```
EXPO_PUBLIC_API_URL=http://SEU_IP_NA_REDE:8080
```

Sem backend disponível, a tela de login tem um atalho "Entrar como dev" (`__DEV__`) que não depende da API.

## Outros comandos

```bash
npm run android   # abre em um emulador Android já configurado
npm run ios       # abre em um simulador iOS (somente macOS)
npm run web       # abre uma versão web, útil para depuração rápida
```

## Verificação de tipos

```bash
npm run typecheck   # tsc do app + tsc dos testes
```

## Testes

```bash
npm test
```

Os testes cobrem a camada de sincronização offline (fila, motor, agendador e repositórios) e rodam com o `node:test`, usando o SQLite embutido do Node (`node:sqlite`) no lugar do `expo-sqlite`. Não precisam de emulador nem de backend no ar. É preciso Node 22.13 ou superior.

## Lint e formatação

```bash
npm run lint              # ESLint (eslint-config-expo)
npx prettier --check .    # verifica formatação
npx prettier --write .    # corrige formatação
```

O ESLint e o Prettier já rodam sozinhos no pre-commit do repositório, só nos arquivos alterados (veja o [`CONTRIBUTING.md`](../../CONTRIBUTING.md) na raiz) — os comandos acima são só para checar manualmente antes de commitar.

## Estrutura de pastas

Dentro de `src`:

| Pasta        | Conteúdo                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| `screens`    | Telas do app                                                               |
| `components` | Componentes de UI reutilizáveis                                            |
| `navigation` | Configuração de navegação entre telas                                      |
| `services`   | Cliente de acesso à API do [backend](../backend)                           |
| `storage`    | Armazenamento seguro da sessão (token e usuário)                           |
| `db`         | Migrações e contrato de acesso ao banco local (SQLite)                     |
| `sync`       | Fila de operações, motor, agendador e conexão do modo offline              |
| `repositories` | Acesso das telas aos dados: leem do SQLite e gravam na fila de sincronização |
| `hooks`      | Hooks React customizados                                                   |
| `types`      | Tipos e interfaces TypeScript compartilhados                               |

## Modo offline

O app grava sempre no SQLite primeiro e sincroniza com o backend quando há conexão. A arquitetura completa (fila, idempotência, tratamento de erros, escopo offline e limitações) está na seção [Arquitetura da sincronização offline](../../documentos/02-Especificação%20do%20Projeto.md#arquitetura-da-sincronização-offline) da especificação.
