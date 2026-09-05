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

## Outros comandos

```bash
npm run android   # abre em um emulador Android já configurado
npm run ios       # abre em um simulador iOS (somente macOS)
npm run web       # abre uma versão web, útil para depuração rápida
```

## Verificação de tipos

```bash
npx tsc --noEmit
```

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
| `services`   | Cliente de acesso à API do [backend](../backend) e lógica de sincronização |
| `storage`    | Acesso ao banco local (SQLite) usado no modo offline                       |
| `hooks`      | Hooks React customizados                                                   |
| `types`      | Tipos e interfaces TypeScript compartilhados                               |

As pastas ainda estão vazias (só com um `.gitkeep`) — a estrutura existe para orientar onde cada novo arquivo deve entrar conforme as telas forem implementadas.
