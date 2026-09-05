# Contribuindo

## Lint e formatação automática (pre-commit)

O repositório usa um único [Husky](https://typicode.github.io/husky/) na raiz para gerenciar o git hook de `pre-commit`, compartilhado pelos três projetos em `codigo-fonte/`. O Husky não é específico de Node — ele só registra um script que roda em qualquer commit, então o mesmo hook também dispara a formatação do Java: não existe (nem é necessário) um "Husky para Java" à parte.

No pre-commit, o [lint-staged](https://github.com/lint-staged/lint-staged) roda, **só nos arquivos alterados no commit**:

| Arquivos | O que roda |
|---|---|
| `codigo-fonte/web/**/*.{js,jsx,ts,tsx}` | ESLint (`--fix`) + Prettier |
| `codigo-fonte/mobile/**/*.{js,jsx,ts,tsx}` | ESLint (`--fix`) + Prettier |
| `codigo-fonte/{web,mobile}/**/*.{json,css,md}` | Prettier |
| `codigo-fonte/backend/**/*.java` | [Spotless](https://github.com/diffplug/spotless) (`spotless:apply`, formata o módulo inteiro) |

Se algum arquivo não puder ser corrigido automaticamente (ex.: erro de ESLint que não é auto-fixável), o commit é bloqueado até o problema ser corrigido.

## Configuração inicial

Rode uma vez, na raiz do repositório, após clonar:

```bash
npm install
```

Isso instala o Husky/lint-staged/Prettier (dependências da raiz) e registra o hook automaticamente (script `prepare`). Nada disso interfere nas dependências de `codigo-fonte/web` e `codigo-fonte/mobile`, que continuam instaladas separadamente dentro de cada projeto (`npm install` em cada um).

Para o Java, é preciso ter um **JDK 21** instalado (veja o [README do backend](codigo-fonte/backend/README.md)) — é ele quem roda o Spotless via Maven Wrapper.

## Pulando o hook

Em um caso excepcional (ex.: commit de emergência), o hook pode ser pulado com:

```bash
git commit --no-verify
```

Use com moderação — o CI ainda pode reprovar código mal formatado.
