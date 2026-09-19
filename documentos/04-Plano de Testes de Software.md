# Planos de Testes de Software

Este plano apresenta os casos de testes utilizados na verificação e validação da aplicação **mobile** (React Native / Expo). Os cenários demonstram os requisitos sendo satisfeitos e o tratamento de erros (robustez da aplicação).

### Tipo de Teste
- **Sucesso**: Tem o objetivo de verificar se as funcionalidades funcionam corretamente.
- **Insucesso**: Tem o objetivo de verificar se o sistema trata erros de maneira correta.

### Convenção de identificação
- Casos de sucesso: **CT-xxx - S** (ou **CT-xxx - Sxx** quando há mais de um sucesso para o mesmo caso de teste).
- Casos de insucesso: **CT-xxx - Ixx**, com sequencial de insucesso por funcionalidade.

### Pré-requisitos gerais
- Backend em execução e aplicativo apontando para ele (variável `EXPO_PUBLIC_API_URL`), conforme o [README do mobile](../codigo-fonte/mobile/README.md).
- Usuários de teste (U1 a U4) preparados conforme o [Roteiro de execução da Etapa 2](#roteiro-de-execução-da-etapa-2), que também define a ordem de execução dos casos.
- O atalho "Entrar como dev", disponível apenas em modo de desenvolvimento, **não** deve ser usado nos testes, pois não passa pela API.

### Resumo dos casos de teste

| Caso de teste | Funcionalidade | Sucesso | Insucesso |
|---|---|---|---|
| CT-001 | Login | S | I01 a I05 |
| CT-002 | Mostrar/ocultar senha | S | - |
| CT-003 | Recuperar senha | S | I01 |
| CT-004 | Aceite de termos de uso | S | I01, I02 |
| CT-005 | Nova senha obrigatória | S | I01 a I05 |
| CT-006 | Fluxo de primeiro acesso | S | - |
| CT-007 | Sessão e logout | S, S02 | I01 |

Requisito coberto: **RF-001** (autenticação, aceite de termos e recuperação de senha). A gestão de usuários pelo Administrador é feita no painel web e não faz parte deste plano mobile.

## ETAPA 2

#### Roteiro de execução da Etapa 2

Este roteiro define como preparar o ambiente e em que **ordem** executar os 22 casos de teste. A ordem importa por dois motivos:

- **O estado do usuário é consumido.** Um usuário criado pelo Administrador nasce com os termos pendentes e com senha temporária. O aceite dos termos e a troca de senha só acontecem uma vez, então os casos de insucesso de cada tela precisam rodar antes do caso de sucesso que muda o estado.
- **O backend limita as requisições sensíveis.** `/auth/login`, `/auth/change-password` e `/auth/forgot-password` aceitam no máximo **5 requisições por minuto por IP**. Acima disso a API responde 429 e o teste falha por um motivo alheio ao caso. Cada bloco abaixo tem no máximo 5 requisições sensíveis, com uma espera de 1 minuto entre os blocos.

##### 1. Preparação do ambiente

1. Na raiz do repositório, subir banco e backend: `docker compose up -d --build`. A API fica em `http://localhost:8080` (Swagger em `/swagger-ui/index.html`).
2. Em `codigo-fonte/mobile`: copiar `.env.example` para `.env`, ajustar `EXPO_PUBLIC_API_URL=http://IP_DA_MAQUINA:8080` (celular físico e computador na mesma rede), rodar `npm install` e `npm start`, e abrir o app no Expo Go.
3. Confirmar que o app abre na tela "Entrar". Não usar o atalho "Entrar como dev" em nenhum caso.
4. *(Opcional)* Para dispensar as esperas entre blocos, definir `RATE_LIMIT_SENSITIVE_CAPACITY=100` no arquivo `.env` da raiz (ignorado pelo git) e recriar o backend com `docker compose up -d backend`. O `docker-compose.yml` repassa essa variável ao container.
5. Ter um token de **Administrador** ativo, com termos aceitos e sem troca de senha pendente. O backend não possui carga inicial de Administrador nas migrations; se a base estiver vazia, inserir o primeiro diretamente no banco. Obter o token com `POST /auth/login` no Swagger e usar o botão *Authorize*.

##### 2. Criação dos usuários de teste

Criar os quatro usuários com `POST /users` no Swagger, usando o token do Administrador. Qualquer `accessType` serve (sugestão: `Assistant`).

| Usuário | E-mail sugerido | Senha inicial | Preparação | Usado em |
|---|---|---|---|---|
| **U1** (novo) | `ct.novo1@amicats.org.br` | `Temp@1234` | Nenhuma: nasce com termos pendentes e senha temporária. | CT-004, CT-005 |
| **U2** (novo) | `ct.novo2@amicats.org.br` | `Temp@1234` | Nenhuma. | CT-007 - I01, CT-006 |
| **U3** (ativo) | `ct.ativo@amicats.org.br` | `Temp@1234` | Levar ao estado ativo pela API: `POST /auth/login` (guardar o token), *Authorize* com esse token, `POST /auth/accept-terms` e `PATCH /auth/change-password` com `currentPassword=Temp@1234` e `newPassword`/`confirmNewPassword=Ativo@1234`. A senha passa a ser `Ativo@1234`. | CT-001, CT-007 |
| **U4** (desativado) | `ct.inativo@amicats.org.br` | `Temp@1234` | Após criar, desativar com `PATCH /users/{id}` usando o token do Administrador. | CT-001 - I04 |

##### 3. Ordem de execução

Legenda de **Req.**: número de requisições sensíveis que o caso envia ao servidor. Se o item 4 da preparação não foi aplicado, respeitar as esperas indicadas.

**Bloco A: sem chamada à API** (validações feitas no próprio aplicativo)

| # | Caso | Usuário | Req. |
|---|---|---|---|
| 1 | CT-002 - S | nenhum | 0 |
| 2 | CT-003 - S | nenhum | 0 |
| 3 | CT-003 - I01 | nenhum | 0 |
| 4 | CT-001 - I01 | nenhum | 0 |
| 5 | CT-001 - I02 | nenhum | 0 |

**Bloco B: login e sessão** (4 requisições)

| # | Caso | Usuário | Req. | Observação |
|---|---|---|---|---|
| 6 | CT-001 - I03 | U3 com senha errada; depois e-mail inexistente | 2 | Duas tentativas no mesmo caso. |
| 7 | CT-001 - I04 | U4 | 1 | |
| 8 | CT-001 - S | U3 (`Ativo@1234`) | 1 | Deixar o app logado na área principal. |
| 9 | CT-007 - S | U3 | 0 | Aproveita a sessão do passo anterior: fechar e reabrir o app. |
| 10 | CT-007 - S02 | U3 | 0 | Tocar em "Sair" e reabrir o app. |
| 11 | CT-001 - I05 | U3 | 0 | Desligar o backend ou a rede antes de tocar em "Entrar". A requisição não chega ao servidor. Religar em seguida. |

⏱ Aguardar 1 minuto.

**Bloco C: termos e nova senha com U1** (4 requisições)

Pré-condição: fazer login com U1 (`Temp@1234`), o que leva à tela de termos (1 requisição).

| # | Caso | Req. | Observação |
|---|---|---|---|
| 12 | CT-004 - I01 | 0 | Não marcar o aceite. |
| 13 | CT-004 - I02 | 0 | Desligar o backend ou a rede, marcar o aceite e tocar em "Continuar". Religar em seguida e permanecer na tela de termos. |
| 14 | CT-004 - S | 0 | Marcar o aceite e continuar. O app abre a tela "Defina sua nova senha". |
| 15 | CT-005 - I01 | 0 | Campos vazios. |
| 16 | CT-005 - I02 | 0 | Nova senha com 6 caracteres. |
| 17 | CT-005 - I03 | 0 | Confirmação diferente. |
| 18 | CT-005 - I04 | 1 | Senha atual incorreta. |
| 19 | CT-005 - I05 | 1 | Nova senha igual à temporária `Temp@1234`. |
| 20 | CT-005 - S | 1 | Nova senha sugerida: `NovaSenha@2026`. Usa a senha temporária correta. |

⏱ Aguardar 1 minuto.

**Bloco D: verificação da nova senha e sessão expirada** (3 requisições)

| # | Caso | Usuário | Req. | Observação |
|---|---|---|---|---|
| 21 | CT-005 - S (complemento) | U1 | 2 | Tocar em "Sair", entrar com `NovaSenha@2026` (deve funcionar), sair e entrar com `Temp@1234` (deve ser rejeitada com "E-mail ou senha incorretos."). |
| 22 | CT-007 - I01 | U2 | 1 | Entrar com U2 (`Temp@1234`) e permanecer na tela de termos. Trocar o valor de `JWT_SECRET` no `.env` da raiz, rodar `docker compose up -d backend` (o token guardado no app deixa de ser válido) e tocar em "Continuar". Reiniciar o backend também zera os contadores do limite de requisições. |

**Bloco E: fluxo completo de primeiro acesso** (2 requisições)

| # | Caso | Usuário | Req. | Observação |
|---|---|---|---|---|
| 23 | CT-006 - S | U2 | 2 | U2 continua com termos pendentes, pois o aceite falhou no passo anterior. Entrar com `Temp@1234`, aceitar os termos, definir a nova senha e navegar pelas abas. |

O passo 21 é apenas um complemento de CT-005 - S, por isso são 23 passos para 22 casos de teste.

##### 4. Registro das evidências

- Gravar a tela do dispositivo em um vídeo por caso, nomeado com o ID (por exemplo `CT-001-I03.mp4`). É aceitável um vídeo contínuo para CT-007 - S e S02, que compartilham a sessão.
- Anexar o vídeo, a data e o resultado no bloco correspondente de [Evidências de Testes Etapa 2](05-%20Evidências%20de%20Testes%20Etapa%202.md). Quem testa deve ser um colega, não o desenvolvedor da funcionalidade.
- Se a API responder 429, o app mostra "Não foi possível completar a solicitação. Tente novamente.", porque o corpo do erro 429 não traz o campo `message`. Nesse caso, aguardar 1 minuto e repetir o caso.

##### 5. Repetir a rodada

Nenhum usuário é excluído fisicamente (RNF-005). Para repetir os testes, criar novos usuários U1, U2, U3 e U4 com outros e-mails (por exemplo `ct.novo1b@amicats.org.br`) e refazer a seção 2.

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - S<br>Login com credenciais válidas</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica se um usuário ativo consegue entrar no aplicativo informando e-mail e senha corretos.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o aplicativo (sem sessão ativa), exibindo a tela "Entrar".<br>
      2. Inserir o e-mail cadastrado.<br>
      3. Inserir a senha correta.<br>
      4. Tocar no botão "Entrar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> e-mail de um usuário ativo, com termos já aceitos e sem troca de senha pendente<br>
      - <strong>Senha:</strong> senha correta desse usuário
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O botão exibe o indicador de carregamento durante o envio e, em seguida, o aplicativo redireciona o usuário para a área principal (abas Início, Gatos, Doses e Busca).</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - I01<br>Login com e-mail em formato inválido</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica a validação do formato do e-mail antes do envio ao servidor.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (o usuário não consegue entrar com e-mail inválido)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o aplicativo (sem sessão ativa), exibindo a tela "Entrar".<br>
      2. Inserir um e-mail em formato inválido.<br>
      3. Inserir qualquer senha.<br>
      4. Tocar no botão "Entrar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> <code>usuario</code> (sem @ e domínio) e também campo vazio<br>
      - <strong>Senha:</strong> qualquer valor
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe "Informe um e-mail válido." abaixo do campo E-mail, destaca o campo em vermelho e não envia a requisição ao servidor.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - I02<br>Login com senha em branco</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica a obrigatoriedade do campo senha.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (o usuário não consegue entrar sem informar a senha)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o aplicativo (sem sessão ativa), exibindo a tela "Entrar".<br>
      2. Inserir um e-mail válido.<br>
      3. Deixar o campo de senha vazio.<br>
      4. Tocar no botão "Entrar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> e-mail em formato válido<br>
      - <strong>Senha:</strong> vazia
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe "Informe sua senha." abaixo do campo Senha e permanece na tela de login.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - I03<br>Login com senha incorreta ou e-mail não cadastrado</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica o tratamento de credenciais rejeitadas pelo servidor (HTTP 401).</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (o usuário não consegue entrar com credenciais inválidas)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o aplicativo (sem sessão ativa), exibindo a tela "Entrar".<br>
      2. Inserir o e-mail de um usuário cadastrado.<br>
      3. Inserir uma senha incorreta.<br>
      4. Tocar no botão "Entrar".<br>
      5. Repetir os passos com um e-mail que não existe na base.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> e-mail cadastrado; depois e-mail inexistente<br>
      - <strong>Senha:</strong> senha incorreta
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>Nas duas tentativas o aplicativo exibe a mensagem "E-mail ou senha incorretos.", mantém o usuário na tela de login e não revela se o e-mail existe.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - I04<br>Login com usuário desativado</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica que um usuário desativado pelo Administrador não consegue acessar o sistema (exclusão lógica, RNF-005).</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (o usuário desativado não consegue entrar); RNF-005</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o aplicativo (sem sessão ativa), exibindo a tela "Entrar".<br>
      2. Inserir o e-mail do usuário desativado.<br>
      3. Inserir a senha correta desse usuário.<br>
      4. Tocar no botão "Entrar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> e-mail de um usuário com situação inativa<br>
      - <strong>Senha:</strong> senha correta desse usuário
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe "E-mail ou senha incorretos." e permanece na tela de login.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - I05<br>Login sem conexão com o servidor</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica o tratamento de falha de rede ou de servidor indisponível durante o login.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (o usuário não consegue entrar sem conexão com a API)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Desligar o backend ou desativar a conexão de rede do dispositivo.<br>
      2. Abrir o aplicativo (sem sessão ativa), exibindo a tela "Entrar".<br>
      3. Inserir e-mail e senha válidos.<br>
      4. Tocar no botão "Entrar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> e-mail de um usuário ativo<br>
      - <strong>Senha:</strong> senha correta desse usuário
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe "Não foi possível conectar ao servidor. Verifique sua conexão.", encerra o indicador de carregamento e mantém o botão "Entrar" disponível para nova tentativa.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-002 - S<br>Mostrar e ocultar a senha digitada</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica se o campo de senha oculta o texto por padrão e permite alternar a visibilidade pelo ícone de olho.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o aplicativo (sem sessão ativa), exibindo a tela "Entrar".<br>
      2. Digitar uma senha no campo "Senha" e observar que os caracteres aparecem mascarados.<br>
      3. Tocar no ícone de olho.<br>
      4. Tocar novamente no ícone.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Senha:</strong> qualquer texto, por exemplo <code>abc12345</code>
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>A senha começa mascarada; após o primeiro toque o texto fica visível e o ícone muda para "olho cortado"; após o segundo toque a senha volta a ficar mascarada.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-003 - S<br>Solicitar senha temporária por e-mail</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica o fluxo da tela "Recuperar senha": acesso a partir do login, validação do e-mail, exibição da confirmação genérica e retorno ao login. Nesta versão a tela apenas valida e confirma o pedido; o envio efetivo do e-mail pelo endpoint <code>/auth/forgot-password</code> ainda não é acionado pelo aplicativo.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o aplicativo (sem sessão ativa), exibindo a tela "Entrar".<br>
      2. Tocar em "Esqueci minha senha".<br>
      3. Inserir um e-mail em formato válido.<br>
      4. Tocar em "Enviar senha temporária".<br>
      5. Alterar o texto do campo e observar a mensagem.<br>
      6. Tocar em "Voltar para o login".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> e-mail em formato válido, por exemplo <code>voce@amicats.org.br</code>
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>Após o envio o aplicativo exibe "Se esse e-mail estiver cadastrado, enviaremos uma senha temporária em instantes." (a mesma mensagem para qualquer e-mail válido); ao editar o campo a confirmação desaparece; "Voltar para o login" retorna à tela "Entrar".</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-003 - I01<br>Recuperar senha com e-mail inválido</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica a validação do e-mail na tela "Recuperar senha".</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (o pedido de recuperação não é aceito com e-mail inválido)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o aplicativo (sem sessão ativa), exibindo a tela "Entrar".<br>
      2. Tocar em "Esqueci minha senha".<br>
      3. Deixar o campo vazio ou inserir um e-mail inválido.<br>
      4. Tocar em "Enviar senha temporária".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> campo vazio; <code>usuario@</code>; <code>usuario@dominio</code>
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe "Informe um e-mail válido." abaixo do campo e não exibe a mensagem de confirmação.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-004 - S<br>Aceitar os termos de uso no primeiro acesso</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica se o usuário que ainda não aceitou os termos consegue registrar o aceite e prosseguir.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (gestão dos aceites de termos); UC-02</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário que ainda não aceitou os termos; o aplicativo exibe a tela "Termos de uso e responsabilidade".<br>
      2. Ler o conteúdo dos termos.<br>
      3. Marcar a caixa "Li e aceito os termos.".<br>
      4. Tocar em "Continuar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário ativo com termos não aceitos
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O botão "Continuar" só é habilitado após marcar a caixa; ao tocar nele o aceite é registrado e o aplicativo avança para a próxima etapa (tela "Defina sua nova senha", se houver troca de senha pendente, ou a área principal).</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-004 - I01<br>Continuar sem aceitar os termos</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica que não é possível prosseguir sem marcar o aceite.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (o usuário não avança sem aceitar os termos)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário que ainda não aceitou os termos; o aplicativo exibe a tela "Termos de uso e responsabilidade".<br>
      2. Não marcar a caixa de aceite.<br>
      3. Tocar em "Continuar".<br>
      4. Marcar e desmarcar a caixa e observar o botão.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário ativo com termos não aceitos
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O botão "Continuar" permanece desabilitado enquanto a caixa estiver desmarcada, o toque não tem efeito e o usuário continua na tela de termos.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-004 - I02<br>Falha ao registrar o aceite dos termos</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica o tratamento de erro quando o servidor não consegue registrar o aceite.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (o aceite não é registrado se a API falhar)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário que ainda não aceitou os termos; o aplicativo exibe a tela "Termos de uso e responsabilidade".<br>
      2. Desligar o backend ou a conexão de rede.<br>
      3. Marcar a caixa "Li e aceito os termos.".<br>
      4. Tocar em "Continuar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário ativo com termos não aceitos
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe uma mensagem de erro ("Não foi possível conectar ao servidor. Verifique sua conexão.") em vermelho, permanece na tela de termos e permite nova tentativa.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-005 - S<br>Definir nova senha no primeiro acesso</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica se o usuário com senha temporária consegue definir uma nova senha e acessar o sistema.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário com troca de senha obrigatória (senha temporária) e termos já aceitos; o aplicativo exibe a tela "Defina sua nova senha".<br>
      2. Inserir a senha temporária em "Senha atual (temporária)".<br>
      3. Inserir a nova senha em "Nova senha".<br>
      4. Repetir a nova senha em "Confirmar nova senha".<br>
      5. Tocar em "Salvar e continuar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário ativo com troca de senha pendente<br>
      - <strong>Senha atual:</strong> senha temporária<br>
      - <strong>Nova senha:</strong> valor com 8 ou mais caracteres, diferente da atual, por exemplo <code>NovaSenha@2026</code><br>
      - <strong>Confirmação:</strong> mesmo valor da nova senha
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>A nova senha é salva e o aplicativo redireciona o usuário para a área principal. Em um novo login, a nova senha é aceita e a temporária é rejeitada.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-005 - I01<br>Nova senha com campos em branco</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica a obrigatoriedade dos três campos da tela de nova senha.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (a troca de senha não é concluída com campos vazios)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário com troca de senha obrigatória (senha temporária) e termos já aceitos; o aplicativo exibe a tela "Defina sua nova senha".<br>
      2. Deixar os três campos vazios.<br>
      3. Tocar em "Salvar e continuar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário ativo com troca de senha pendente<br>
      - <strong>Campos:</strong> todos vazios
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe "Informe sua senha atual.", "Informe a nova senha." e "Confirme a nova senha." abaixo dos respectivos campos e não envia a requisição.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-005 - I02<br>Nova senha com menos de 8 caracteres</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica o tamanho mínimo da nova senha.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (a troca de senha não é concluída com senha curta)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário com troca de senha obrigatória (senha temporária) e termos já aceitos; o aplicativo exibe a tela "Defina sua nova senha".<br>
      2. Preencher a senha atual.<br>
      3. Inserir uma nova senha com menos de 8 caracteres.<br>
      4. Repetir o mesmo valor na confirmação.<br>
      5. Tocar em "Salvar e continuar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário ativo com troca de senha pendente<br>
      - <strong>Nova senha e confirmação:</strong> <code>abc123</code> (6 caracteres)
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe "A nova senha deve ter pelo menos 8 caracteres." abaixo do campo "Nova senha" e permanece na tela.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-005 - I03<br>Confirmação diferente da nova senha</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica que a confirmação precisa coincidir com a nova senha.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (a troca de senha não é concluída com confirmação divergente)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário com troca de senha obrigatória (senha temporária) e termos já aceitos; o aplicativo exibe a tela "Defina sua nova senha".<br>
      2. Preencher a senha atual.<br>
      3. Inserir uma nova senha válida.<br>
      4. Inserir um valor diferente em "Confirmar nova senha".<br>
      5. Tocar em "Salvar e continuar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário ativo com troca de senha pendente<br>
      - <strong>Nova senha:</strong> <code>NovaSenha@2026</code><br>
      - <strong>Confirmação:</strong> <code>NovaSenha@2025</code>
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe "As senhas não coincidem." abaixo do campo de confirmação e não envia a requisição.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-005 - I04<br>Nova senha com senha atual incorreta</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica o tratamento do erro retornado pelo servidor quando a senha temporária informada está errada.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (a troca de senha não é concluída com senha atual incorreta)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário com troca de senha obrigatória (senha temporária) e termos já aceitos; o aplicativo exibe a tela "Defina sua nova senha".<br>
      2. Inserir uma senha atual incorreta.<br>
      3. Inserir nova senha válida e a mesma confirmação.<br>
      4. Tocar em "Salvar e continuar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário ativo com troca de senha pendente<br>
      - <strong>Senha atual:</strong> valor diferente da senha temporária<br>
      - <strong>Nova senha e confirmação:</strong> <code>NovaSenha@2026</code>
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe em vermelho a mensagem retornada pelo servidor ("Senha atual incorreta."), permanece na tela e a senha do usuário não é alterada.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-005 - I05<br>Nova senha igual à senha atual</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica a regra do servidor que exige nova senha diferente da temporária.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (a troca de senha não é concluída se a nova senha for igual à atual)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário com troca de senha obrigatória (senha temporária) e termos já aceitos; o aplicativo exibe a tela "Defina sua nova senha".<br>
      2. Inserir a senha temporária em "Senha atual".<br>
      3. Inserir a mesma senha em "Nova senha" e "Confirmar nova senha".<br>
      4. Tocar em "Salvar e continuar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário ativo com troca de senha pendente<br>
      - <strong>Senha atual, nova senha e confirmação:</strong> mesma senha (com 8 ou mais caracteres)
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe em vermelho a mensagem retornada pelo servidor ("A nova senha deve ser diferente da senha atual.") e permanece na tela.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-006 - S<br>Fluxo completo de primeiro acesso</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica a sequência de telas exigida no primeiro acesso: login, termos de uso, nova senha e área principal, sem que seja possível pular etapas.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail; UC-01, UC-02</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir o aplicativo (sem sessão ativa), exibindo a tela "Entrar".<br>
      2. Entrar com o usuário recém-cadastrado, usando a senha temporária.<br>
      3. Na tela de termos, marcar o aceite e tocar em "Continuar".<br>
      4. Na tela "Defina sua nova senha", preencher os campos e tocar em "Salvar e continuar".<br>
      5. Navegar pelas quatro abas.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário novo, com termos não aceitos e troca de senha pendente<br>
      - <strong>Nova senha:</strong> valor com 8 ou mais caracteres
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe as telas nesta ordem: Termos, Nova senha e área principal. Em nenhuma etapa o usuário acessa a área principal antes de concluir as anteriores; as abas Início, Gatos, Doses e Busca exibem a tela "Em breve".</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-007 - S<br>Manter a sessão ao reabrir o aplicativo</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica se a sessão é restaurada a partir do armazenamento seguro do dispositivo, sem novo login.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Realizar login com sucesso (CT-001 - S).<br>
      2. Fechar completamente o aplicativo.<br>
      3. Abrir o aplicativo novamente.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário ativo, com termos aceitos e sem troca de senha pendente
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>Após um breve indicador de carregamento o aplicativo abre direto na área principal, sem exibir a tela de login.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-007 - S02<br>Encerrar a sessão pelo botão Sair</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica se o usuário consegue sair e se a sessão é removida do dispositivo.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Realizar login com sucesso.<br>
      2. Em qualquer aba, tocar no botão "Sair".<br>
      3. Fechar e reabrir o aplicativo.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário ativo, com termos aceitos e sem troca de senha pendente
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>Ao tocar em "Sair" o aplicativo retorna à tela de login; ao reabrir o aplicativo a tela de login continua sendo exibida (sessão removida).</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-007 - I01<br>Sessão expirada durante o uso</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica se o aplicativo encerra a sessão e volta ao login quando o servidor rejeita o token (HTTP 401) em uma requisição autenticada. O token expira em 1 hora.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste </strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha, gestão dos seus aceites de termos e recuperação de senha por e-mail (a sessão expirada não permite continuar operando)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário que ainda não aceitou os termos e permanecer na tela de termos.<br>
      2. Aguardar a expiração do token (1 hora) ou invalidá-lo no servidor (por exemplo, alterando o segredo JWT do backend).<br>
      3. Marcar o aceite e tocar em "Continuar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail/Senha:</strong> usuário ativo com termos não aceitos
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O servidor responde 401, o aplicativo limpa a sessão armazenada e redireciona o usuário para a tela de login.</td>
  </tr>
</table>

### RF-001 — Autenticação e Recuperação de Senha

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - S<br>Login com credenciais válidas</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um usuário cadastrado e ativo consegue realizar login utilizando e-mail e senha válidos.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Acessar a página de login.<br>
      2. Informar um e-mail cadastrado.<br>
      3. Informar a senha correta.<br>
      4. Clicar no botão "Entrar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> Usuário previamente cadastrado e ativo.<br>
      - <strong>Senha:</strong> Senha válida correspondente ao usuário.
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êito</strong></td>
    <td>O sistema deve autenticar o usuário, gerar um token de acesso e permitir o acesso às funcionalidades correspondentes ao seu perfil.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - I01<br>Login com senha incorreta</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se o sistema impede a autenticação quando um usuário cadastrado informa uma senha incorreta.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Acessar a página de login.<br>
      2. Informar um e-mail cadastrado.<br>
      3. Informar uma senha incorreta.<br>
      4. Clicar no botão "Entrar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> Usuário cadastrado e ativo.<br>
      - <strong>Senha:</strong> Senha diferente da cadastrada.
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema não deve autenticar o usuário nem gerar um token de acesso e deve informar que as credenciais são inválidas.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - I02<br>Login com usuário inexistente</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica o comportamento do sistema quando é informado um e-mail que não pertence a nenhum usuário cadastrado.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Acessar a página de login.<br>
      2. Informar um e-mail não cadastrado.<br>
      3. Informar uma senha.<br>
      4. Clicar no botão "Entrar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> E-mail não cadastrado na base.<br>
      - <strong>Senha:</strong> Qualquer senha válida quanto ao formato.
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve rejeitar a autenticação e apresentar uma mensagem de credenciais inválidas, sem permitir acesso ao sistema.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - I03<br>Login com usuário inativo</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um usuário inativado é impedido de acessar o sistema mesmo utilizando e-mail e senha corretos.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação somente de usuários autorizados.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Possuir um usuário previamente cadastrado e inativado.<br>
      2. Acessar a página de login.<br>
      3. Informar o e-mail do usuário inativo.<br>
      4. Informar a senha correta.<br>
      5. Clicar no botão "Entrar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> Usuário cadastrado e inativo.<br>
      - <strong>Senha:</strong> Senha correta do usuário.
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve impedir a autenticação do usuário inativo e não deve gerar um token de acesso.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - I04<br>Login com e-mail em formato inválido</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se o sistema valida corretamente o formato do e-mail informado durante o login.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Acessar a página de login.<br>
      2. Informar um e-mail em formato inválido.<br>
      3. Informar uma senha.<br>
      4. Tentar realizar o login.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> usuario-email-invalido<br>
      - <strong>Senha:</strong> Senha válida quanto ao formato.
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve impedir o processamento do login e informar que o e-mail possui formato inválido.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - I05<br>Login com campos obrigatórios vazios</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se o sistema impede a autenticação quando os campos obrigatórios do login não são preenchidos.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir autenticação de usuários por login e senha.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Acessar a página de login.<br>
      2. Manter o campo de e-mail e/ou senha vazio.<br>
      3. Clicar no botão "Entrar".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> Vazio.<br>
      - <strong>Senha:</strong> Vazia.
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve impedir o login e indicar que os campos obrigatórios devem ser preenchidos.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-002 - S<br>Solicitação de recuperação de senha</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um usuário cadastrado consegue solicitar a recuperação de sua senha por e-mail.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir recuperação de senha por e-mail.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Acessar a página de login.<br>
      2. Selecionar a opção "Esqueci minha senha".<br>
      3. Informar um e-mail cadastrado.<br>
      4. Solicitar a recuperação da senha.<br>
      5. Verificar o recebimento das instruções de recuperação.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> Usuário previamente cadastrado e ativo.
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve processar a solicitação e disponibilizar ao usuário cadastrado o mecanismo definido para redefinição da senha por e-mail.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-002 - I01<br>Recuperação de senha com e-mail inválido</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica o tratamento de uma solicitação de recuperação de senha utilizando um e-mail em formato inválido.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir recuperação de senha por e-mail.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Acessar a página de login.<br>
      2. Selecionar a opção "Esqueci minha senha".<br>
      3. Informar um e-mail em formato inválido.<br>
      4. Solicitar a recuperação da senha.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>E-mail:</strong> email-invalido
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve rejeitar a solicitação e informar que o endereço de e-mail possui formato inválido.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-003 - S<br>Redefinição de senha pelo Administrador</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um usuário com perfil de Administrador consegue redefinir a senha de outro usuário.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir redefinição de senha pelo Administrador.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Autenticar-se com um usuário Administrador.<br>
      2. Acessar a gestão de usuários.<br>
      3. Localizar o usuário desejado.<br>
      4. Selecionar a opção de redefinição de senha.<br>
      5. Confirmar a operação.<br>
      6. Realizar login utilizando a nova senha.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Administrador:</strong> Usuário ativo com perfil Administrador.<br>
      - <strong>Usuário:</strong> Usuário previamente cadastrado.<br>
      - <strong>Nova senha:</strong> Senha válida conforme as regras do sistema.
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve atualizar a senha do usuário e permitir sua autenticação com a nova credencial, respeitando a regra de alteração obrigatória da senha quando aplicável.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-003 - I01<br>Redefinição de senha sem permissão de Administrador</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um usuário sem perfil de Administrador é impedido de redefinir a senha de outro usuário.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-001: Permitir redefinição de senha somente pelo Administrador.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Autenticar-se com um usuário sem perfil de Administrador.<br>
      2. Tentar acessar a funcionalidade de redefinição de senha de outro usuário.<br>
      3. Tentar executar a operação.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Usuário autenticado:</strong> Usuário com perfil diferente de Administrador.<br>
      - <strong>Usuário alvo:</strong> Usuário previamente cadastrado.
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve impedir a operação e manter a senha do usuário alvo inalterada.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-004 - S<br>Cadastro de usuário com perfil de acesso</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um Administrador consegue cadastrar um novo usuário e atribuir corretamente um dos perfis de acesso disponíveis no sistema.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF de Gestão de Usuários: Permitir ao Administrador cadastrar usuários e definir seu perfil de acesso.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Autenticar-se no sistema com um usuário Administrador.<br>
      2. Acessar a funcionalidade de gestão de usuários.<br>
      3. Selecionar a opção de cadastro de usuário.<br>
      4. Preencher os dados obrigatórios do novo usuário.<br>
      5. Selecionar um perfil de acesso entre Administrator, Veterinarian, Assistant ou Viewer.<br>
      6. Confirmar o cadastro.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Nome:</strong> Rafael Nogueira<br>
      - <strong>E-mail:</strong> rafael@amicats.org.br<br>
      - <strong>Perfil:</strong> Veterinarian<br>
      - <strong>Situação:</strong> Ativo
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve cadastrar o usuário com sucesso, associar o perfil de acesso selecionado e disponibilizá-lo na listagem de usuários.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-005 - I01<br>Cadastro de usuário com e-mail já existente</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se o sistema impede o cadastro de um novo usuário utilizando um endereço de e-mail já associado a outro usuário.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF de Gestão de Usuários: Garantir que cada usuário possua um e-mail único no sistema.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Autenticar-se no sistema com um usuário Administrador.<br>
      2. Acessar a funcionalidade de gestão de usuários.<br>
      3. Selecionar a opção de cadastro de usuário.<br>
      4. Preencher os dados do novo usuário.<br>
      5. Informar um e-mail já cadastrado no sistema.<br>
      6. Selecionar um perfil de acesso.<br>
      7. Tentar confirmar o cadastro.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Nome:</strong> Novo Usuário<br>
      - <strong>E-mail:</strong> E-mail já existente na base de dados<br>
      - <strong>Perfil:</strong> Assistant
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve impedir o cadastro duplicado e informar que o endereço de e-mail já está registrado.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-006 - S<br>Alteração do perfil de acesso de um usuário</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um Administrador consegue alterar o perfil de acesso de um usuário já cadastrado.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF de Gestão de Usuários: Permitir ao Administrador editar os dados e o perfil de acesso dos usuários.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Autenticar-se no sistema com um usuário Administrador.<br>
      2. Acessar a gestão de usuários.<br>
      3. Localizar um usuário cadastrado.<br>
      4. Selecionar a opção de edição.<br>
      5. Alterar o perfil de acesso do usuário.<br>
      6. Salvar as alterações.<br>
      7. Verificar os dados atualizados do usuário.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Perfil atual:</strong> Viewer<br>
      - <strong>Novo perfil:</strong> Assistant
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve salvar a alteração e o usuário deve passar a possuir o novo perfil de acesso definido pelo Administrador.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-007 - S<br>Inativação de usuário</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se um Administrador consegue inativar um usuário e se o usuário inativado perde a possibilidade de autenticação no sistema.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF de Gestão de Usuários: Permitir ao Administrador inativar usuários cadastrados.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Autenticar-se no sistema com um usuário Administrador.<br>
      2. Acessar a gestão de usuários.<br>
      3. Localizar um usuário ativo.<br>
      4. Selecionar a opção de inativação.<br>
      5. Confirmar a operação.<br>
      6. Verificar que o usuário passou para a situação de inativo.<br>
      7. Tentar realizar login utilizando as credenciais do usuário inativado.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Usuário:</strong> Usuário previamente cadastrado e ativo.<br>
      - <strong>Perfil:</strong> Veterinarian, Assistant ou Viewer.<br>
      - <strong>Situação inicial:</strong> Ativo.
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve alterar a situação do usuário para inativo, mantê-lo registrado na base de dados e impedir novas autenticações enquanto permanecer inativo.</td>
  </tr>
</table>

<br>

<table>
  <tr>
    <th colspan="2" width="1000">CT-008 - S<br>Busca e filtragem de usuários por perfil e situação</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Este caso de teste verifica se o Administrador consegue consultar e filtrar os usuários cadastrados de acordo com os critérios disponibilizados pela gestão de usuários.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Railan Leão</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF de Gestão de Usuários: Permitir a consulta, busca e filtragem dos usuários cadastrados.</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Autenticar-se no sistema com um usuário Administrador.<br>
      2. Acessar a gestão de usuários.<br>
      3. Visualizar a listagem de usuários cadastrados.<br>
      4. Informar um termo de busca por nome ou e-mail.<br>
      5. Selecionar um perfil de acesso como filtro.<br>
      6. Selecionar a situação ativo ou inativo.<br>
      7. Executar a consulta.<br>
      8. Verificar os usuários apresentados.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Busca:</strong> Nome ou e-mail de usuário existente.<br>
      - <strong>Perfil:</strong> Administrator, Veterinarian, Assistant ou Viewer.<br>
      - <strong>Situação:</strong> Ativo ou Inativo.
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O sistema deve apresentar somente os usuários que correspondam aos critérios de busca e filtros informados, mantendo corretamente os dados de nome, e-mail, perfil e situação.</td>
  </tr>
</table>

### ETAPA 3
Criar casos de teste da etapa 3

### ETAPA 4
Criar casos de teste da etapa 4
