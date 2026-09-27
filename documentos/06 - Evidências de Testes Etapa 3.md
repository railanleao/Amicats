# 🔍 Evidências de Testes de Software - Etapa 3

Apresente vídeos do software em funcionamento que comprovam que um determinado teste foi executado.

## Testes por pares
A fim de aumentar a qualidade da aplicação desenvolvida, cada funcionalidade deve ser testada por um colega e os testes devem ser evidenciados. O colega "Tester" deve utilizar o caso de teste criado pelo desenvolvedor responsável pela funcionalidade (desenvolveu a funcionalidade e criou o caso de testes descrito no plano de testes) e caso perceba a necessidade de outros casos de teste, deve acrescentá-los na sessão "Plano de Testes".

### Como preencher
1. O "Tester" executa o caso de teste conforme o passo a passo do [Plano de Testes](04-Plano%20de%20Testes%20de%20Software.md), gravando a tela do dispositivo.
2. Anexa o vídeo na linha "Evidência" (arrastando o arquivo para o editor do GitHub, que gera o link).
3. Preenche o responsável pelo teste, a data e o comentário com o resultado obtido; se o resultado divergir do critério de êxito, registra o desvio no comentário.

> Os blocos abaixo já trazem o critério de êxito de cada caso de teste da Etapa 3 (RF-005 — Gatos). Os campos **Responsável pelo teste**, **Data do teste**, **Comentário** e **Evidência** estão marcados como **Pendente** e devem ser preenchidos pelo colega "Tester" ao executar cada caso.

## 📱 MOBILE - Evidências de Testes - ETAPA 3 (RF-005 — Gatos)

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - S<br>Listagem de gatos com busca e filtros rápidos</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">A lista é carregada com os dados reais de cada gato; a busca filtra a lista após um breve intervalo (debounce) sem precisar de confirmação; cada chip mostra somente os gatos com o status correspondente, e "Todos" volta a exibir a lista completa.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - I01<br>Busca sem correspondência</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe "Nenhum gato encontrado." no lugar da lista, sem erro.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-002 - S<br>Abrir a ficha do gato a partir da listagem</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">A ficha exibe os dados reais do gato selecionado; campos sem valor aparecem como "—"; a seta de voltar retorna para a listagem.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-002 - I01<br>Erro ao carregar a ficha do gato</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe uma mensagem de erro e o botão "Tentar novamente", sem travar a tela.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-003 - S<br>Alterar a foto do gato pela ficha</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">Durante o envio o botão mostra um indicador de carregamento; ao concluir, a nova foto substitui a anterior na ficha.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 - S<br>Editar os dados de um gato existente</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O formulário abre com os dados reais do gato e sem a seção de foto (a foto é alterada pela ficha, não pelo formulário); ao salvar, o aplicativo volta para a ficha, que já exibe o nome e o status atualizados sem precisar de atualização manual.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 - I01<br>Editar gato sem permissão</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O servidor rejeita a alteração (403) e o aplicativo exibe "Você não tem permissão para editar gatos.", mantendo os dados do gato inalterados.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 - I02<br>Editar gato com nome em branco</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe "Informe o nome do gato." abaixo do campo e não envia a requisição.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

## 💻 WEB - Evidências de Testes - ETAPA 3 (RF-005 — Gatos)

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - S<br>Listagem de gatos com busca, filtro por sala/status e paginação</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">A listagem carrega os dados reais; a busca filtra a lista após um breve intervalo; os filtros de sala e status exibem somente os gatos correspondentes; a paginação avança e recua corretamente sem perder o filtro aplicado.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - I01<br>Busca sem correspondência</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema exibe "Nenhum gato encontrado." no lugar dos cards, sem erro.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-002 - S<br>Visualizar a ficha do gato</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">A ficha exibe somente os dados reais do gato (sem campos editáveis), com "—" nos campos sem valor; o breadcrumb retorna à listagem.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-003 - S<br>Cadastro de um novo gato retorna à listagem</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">Após salvar, o sistema retorna para a página "Gatos" (não para o dashboard) e o gato recém-cadastrado aparece na listagem.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 - S<br>Editar os dados de um gato existente</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O formulário abre pré-preenchido; ao salvar, o sistema retorna para a listagem e o card exibe o nome e o selo de status atualizados.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 - S02<br>Alterar e remover a foto do gato durante a edição</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">A foto é enviada e exibida sem precisar clicar em "Salvar alterações"; ao remover, a prévia volta a exibir "Sem foto", também sem precisar salvar o restante do formulário.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 - I01<br>Editar gato sem permissão</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema rejeita a alteração (403) e exibe "Você não tem permissão para editar gatos.", mantendo os dados do gato inalterados.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 - I02<br>Editar gato com sala inexistente</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema exibe "A sala selecionada não existe mais. Escolha outra." e não altera os demais dados do gato.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 - I03<br>Editar gato com nome em branco</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema exibe "Informe o nome do gato." abaixo do campo, destaca o campo e não envia a requisição.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Pendente</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">Pendente</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Pendente</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">Pendente</td>
  </tr>
</table>
