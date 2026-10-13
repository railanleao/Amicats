
## ETAPA 3

### Pré-requisitos gerais (RF-005 — Gatos) 

- Backend, banco de dados e (para o mobile) o app apontando para a API, conforme os READMEs de cada plataforma.
- Usuários de teste com os quatro perfis de acesso (Administrador, Médico-Veterinário, Auxiliar, Visualizador), com termos aceitos e sem troca de senha pendente.
- Ao menos uma sala ativa e um gato previamente cadastrados, para os casos que dependem de dados existentes (ficha, edição, filtros).
- UC-06 (Gerenciar cadastro do gato) restringe a criação e a edição à Administrador e Médico-Veterinário; a listagem e a ficha são acessíveis a qualquer usuário autenticado.

## 📱 MOBILE - Plano de Testes - ETAPA 3 (RF-004, RF-005, RF-006, RF-007, RF-008, RF-009, RF-010, RF-016)

#### Resumo dos casos de teste

| Caso de teste | Funcionalidade | Sucesso | Insucesso |
|---|---|---|---|
| CT-001 | Listagem de gatos (busca e filtros rápidos) | S | I01 |
| CT-002 | Ficha do gato | S | I01 |
| CT-003 | Foto do gato pela ficha | S | - |
| CT-004 | Edição dos dados do gato | S | I01, I02 |

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - S<br>Listagem de gatos com busca e filtros rápidos</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica se a aba "Gatos" lista os gatos cadastrados e se a busca por nome/microchip e os chips de filtro rápido (Todos, Disponíveis, Em tratamento) restringem corretamente o resultado.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-005: Permitir cadastro completo do gato (...); UC-06</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário autenticado e tocar na aba "Gatos".<br>
      2. Observar a lista de gatos cadastrados, cada um com foto/avatar, nome, sexo, sala e um selo de status.<br>
      3. Digitar no campo de busca o nome (ou parte dele) de um gato cadastrado.<br>
      4. Limpar a busca e tocar no chip "Disponíveis".<br>
      5. Tocar no chip "Em tratamento" e depois voltar para "Todos".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Gatos cadastrados:</strong> pelo menos um gato com status "Disponível para adoção" e outro com "Em tratamento"<br>
      - <strong>Busca:</strong> nome parcial de um gato existente
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>A lista é carregada com os dados reais de cada gato; a busca filtra a lista após um breve intervalo (debounce) sem precisar de confirmação; cada chip mostra somente os gatos com o status correspondente, e "Todos" volta a exibir a lista completa.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-001 - I01<br>Busca sem correspondência</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica a mensagem exibida quando a busca ou o filtro não encontram nenhum gato.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-005: Permitir cadastro completo do gato (...) (a listagem trata corretamente a ausência de resultados)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Na aba "Gatos", digitar no campo de busca um termo que não corresponda a nenhum gato cadastrado.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Busca:</strong> <code>zzzznaoexiste</code>
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe "Nenhum gato encontrado." no lugar da lista, sem erro.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-002 - S<br>Abrir a ficha do gato a partir da listagem</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica se tocar em um gato da listagem abre sua ficha com os dados reais, incluindo as etiquetas de saúde (FIV, FeLV, PIF, castração) quando aplicável.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-005: Permitir cadastro completo do gato (...); UC-06</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Na aba "Gatos", tocar em um gato da listagem.<br>
      2. Conferir nome, sexo, idade estimada, sala, etiquetas de saúde e o cartão com microchip, cor/pelagem, peso e padrinho.<br>
      3. Tocar na seta de voltar.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Gato:</strong> gato cadastrado com data de nascimento, saúde e apadrinhamento preenchidos
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>A ficha exibe os dados reais do gato selecionado; campos sem valor aparecem como "—"; a seta de voltar retorna para a listagem.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-002 - I01<br>Erro ao carregar a ficha do gato</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica o tratamento de erro quando a ficha não pode ser carregada (por exemplo, o gato foi removido ou a conexão falhou).</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-005: Permitir cadastro completo do gato (...) (a ficha trata corretamente a falha ao carregar)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir a ficha de um gato.<br>
      2. Desligar o backend ou a conexão de rede e tocar em "Tentar novamente".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Gato:</strong> qualquer gato cadastrado
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe uma mensagem de erro e o botão "Tentar novamente", sem travar a tela.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-003 - S<br>Alterar a foto do gato pela ficha</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica se é possível tirar uma nova foto ou escolher uma da galeria diretamente na ficha do gato, substituindo a foto de capa.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-005: Permitir cadastro completo do gato, com a captura de foto pela câmera do dispositivo (...); UC-07</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir a ficha de um gato.<br>
      2. Tocar no ícone de câmera sobre a foto de capa.<br>
      3. Escolher "Escolher da galeria" e selecionar uma imagem.<br>
      4. Aguardar o envio.
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Imagem:</strong> arquivo JPG ou PNG válido
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>Durante o envio o botão mostra um indicador de carregamento; ao concluir, a nova foto substitui a anterior na ficha.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-004 - S<br>Editar os dados de um gato existente</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica se um Administrador ou Médico-Veterinário consegue abrir o formulário de edição a partir da ficha, alterar os dados do gato e salvar as alterações.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Sucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-005: Permitir cadastro completo do gato (...); UC-06</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário Administrador ou Médico-Veterinário e abrir a ficha de um gato.<br>
      2. Tocar no ícone de lápis, ao lado do nome.<br>
      3. Conferir que os campos já vêm preenchidos com os dados atuais do gato.<br>
      4. Alterar o nome e a situação clínica.<br>
      5. Tocar em "Salvar alterações".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Gato:</strong> gato previamente cadastrado<br>
      - <strong>Novo nome:</strong> nome diferente do atual<br>
      - <strong>Nova situação clínica:</strong> status diferente do atual
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O formulário abre com os dados reais do gato e sem a seção de foto (a foto é alterada pela ficha, não pelo formulário); ao salvar, o aplicativo volta para a ficha, que já exibe o nome e o status atualizados sem precisar de atualização manual.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-004 - I01<br>Editar gato sem permissão</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica se um usuário sem perfil de Administrador ou Médico-Veterinário é impedido de salvar alterações em um gato.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-005: Permitir cadastro completo do gato (...); UC-06 (edição restrita a Administrador e Médico-Veterinário)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Entrar com um usuário Auxiliar ou Visualizador.<br>
      2. Abrir a ficha de um gato e tocar no ícone de lápis.<br>
      3. Alterar algum campo e tocar em "Salvar alterações".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Usuário:</strong> perfil Auxiliar ou Visualizador
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O servidor rejeita a alteração (403) e o aplicativo exibe "Você não tem permissão para editar gatos.", mantendo os dados do gato inalterados.</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2" width="1000">CT-004 - I02<br>Editar gato com nome em branco</th>
  </tr>
  <tr>
    <td width="150"><strong>Descrição</strong></td>
    <td>Verifica a obrigatoriedade do campo nome ao editar um gato.</td>
  </tr>
  <tr>
    <td><strong>Responsável Caso de Teste</strong></td>
    <td width="430">Murilo Silva Rezende</td>
  </tr>
  <tr>
    <td><strong>Tipo do Teste</strong></td>
    <td width="430">Insucesso</td>
  </tr>
  <tr>
    <td><strong>Requisitos associados</strong></td>
    <td>RF-005: Permitir cadastro completo do gato (...) (o gato não é salvo sem nome)</td>
  </tr>
  <tr>
    <td><strong>Passos</strong></td>
    <td>
      1. Abrir a edição de um gato existente.<br>
      2. Apagar o conteúdo do campo "Nome".<br>
      3. Tocar em "Salvar alterações".
    </td>
  </tr>
  <tr>
    <td><strong>Dados de teste</strong></td>
    <td>
      - <strong>Nome:</strong> vazio
    </td>
  </tr>
  <tr>
    <td><strong>Critérios de êxito</strong></td>
    <td>O aplicativo exibe "Informe o nome do gato." abaixo do campo e não envia a requisição.</td>
  </tr>
</table>

### ETAPA 4
Criar casos de teste da etapa 4
