# Backend

API REST do sistema da ONG Amicats, em Java com Spring Boot. Fonte única de verdade dos dados, consumida pelo [app mobile](../mobile) e pelo [painel web](../web). Veja a arquitetura completa em [`documentos/02-Especificação do Projeto.md`](../../documentos/02-Especificação%20do%20Projeto.md).

## Pré-requisitos

- **Docker** e **Docker Compose** — suficiente para rodar tudo (banco, backend e web) sem instalar mais nada

Só é necessário instalar o restante abaixo se for rodar o backend **fora** do Docker (mais prático no dia a dia de desenvolvimento, com reinício automático a cada alteração):

- **JDK 21** (recomendado: [Eclipse Temurin](https://adoptium.net/pt-BR/temurin/releases/?version=21))

Não é necessário instalar o Maven: o projeto já inclui o Maven Wrapper (`mvnw`).

## Configuração

O backend lê a conexão com o banco por variáveis de ambiente, todas com valor padrão para desenvolvimento local:

| Variável | Padrão |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `amicats` |
| `DB_USER` | `amicats` |
| `DB_PASSWORD` | `amicats` |

Não é preciso configurar nada para rodar localmente com os valores padrão — eles já batem com o `docker-compose.yml` da raiz do repositório.

## Como rodar

**Opção 1 — tudo via Docker Compose** (banco, backend e web juntos). Na raiz do repositório:

```bash
docker compose up -d --build
```

A API sobe em `http://localhost:8080`.

**Opção 2 — backend local, banco no Docker** (útil para desenvolver com reinício automático). Suba só o banco na raiz do repositório:

```bash
docker compose up -d postgres
```

E rode a aplicação a partir de `codigo-fonte/backend`:

```bash
./mvnw spring-boot:run
```

A API também sobe em `http://localhost:8080`.

## Documentação da API (Swagger)

Com o backend rodando, a documentação interativa da API fica disponível em:

http://localhost:8080/swagger-ui/index.html

Se encontra tratado para abertura automática no navegador ao rodar a API, tanto para Windows/Linux/Mac.

## Build e testes

```bash
./mvnw clean package   # gera o jar em target/
./mvnw test             # roda os testes
java -jar target/backend-0.0.1-SNAPSHOT.jar   # roda o jar gerado
```

## Estrutura de pastas

Pacotes dentro de `src/main/java/org/amicats/backend`, organizados por camada:

| Pacote | Conteúdo |
|---|---|
| `config` | Configurações do Spring (CORS, segurança, beans etc.) |
| `controller` | Controllers REST — recebem a requisição e devolvem a resposta |
| `service` | Regras de negócio |
| `repository` | Interfaces Spring Data JPA de acesso ao banco |
| `model` | Entidades JPA (mapeiam as tabelas do [MER](../../documentos/02-Especificação%20do%20Projeto.md#mer-modelo-entidade-relacionamento)) |
| `dto` | Objetos de entrada/saída da API, para não expor as entidades diretamente |
| `exception` | Exceções customizadas e o handler global |

Os pacotes ainda estão vazios (só com um `.gitkeep`) — a estrutura existe para orientar onde cada novo arquivo deve entrar conforme os endpoints forem implementados.

## Lint e formatação

A formatação é feita com [Spotless](https://github.com/diffplug/spotless) + [Google Java Format](https://github.com/google/google-java-format) — sem configuração de estilo própria, evitando debate sobre convenção.

```bash
./mvnw spotless:check   # verifica se há arquivo fora do padrão (falha se houver)
./mvnw spotless:apply   # corrige a formatação automaticamente
```

O `spotless:check` também roda em `./mvnw verify`. E ele já é acionado sozinho no pre-commit do repositório (veja o [`CONTRIBUTING.md`](../../CONTRIBUTING.md) na raiz) — não é preciso rodar manualmente no dia a dia, mas os comandos acima ajudam a corrigir antes de commitar.

## Migrações de banco

O schema é versionado com [Flyway](https://flywaydb.org/). Os scripts ficam em `src/main/resources/db/migration`, seguindo o padrão `V<versão>__descricao.sql` (ex.: `V1__create_user_table.sql`). O Hibernate está configurado com `ddl-auto=validate`: ele nunca altera o schema sozinho, só valida se as entidades batem com o que as migrations criaram.

**Automática:** ao rodar a aplicação (`./mvnw spring-boot:run` ou o jar), o Flyway aplica sozinho, na inicialização, qualquer migration pendente.

**Manual**, sem subir a aplicação inteira (útil para só preparar o banco antes de codar, ou em CI): com o Postgres no ar (`docker compose up -d`), rode a partir de `codigo-fonte/backend`:

```bash
./mvnw flyway:migrate   # aplica as migrations pendentes
./mvnw flyway:info      # lista o status de cada migration
./mvnw flyway:validate  # valida as migrations já aplicadas sem alterar nada
```

Por padrão esses comandos usam `jdbc:postgresql://localhost:5432/amicats` (usuário/senha `amicats`), os mesmos valores do `docker-compose.yml`. Para apontar para outro banco (ex.: outra porta local ou um ambiente remoto), sobrescreva na linha de comando:

```bash
./mvnw flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:55433/amicats -Dflyway.user=amicats -Dflyway.password=amicats
```
