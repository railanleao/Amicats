# Evidências de Testes de Software - Etapa 2
Apresente vídeos do software em funcionamento que comprovam que um determinado teste foi executado.

## Testes por pares
A fim de aumentar a qualidade da aplicação desenvolvida, cada funcionalidade deve ser testada por um colega e os testes devem ser evidenciados. O colega "Tester" deve utilizar o caso de teste criado pelo desenvolvedor responsável pela funcionalidade (desenvolveu a funcionalidade e criou o caso de testes descrito no plano de testes) e caso perceba a necessidade de outros casos de teste, deve acrescentá-los na sessão "Plano de Testes".

### Como preencher
1. O "Tester" executa o caso de teste conforme o passo a passo do [Plano de Testes](04-Plano%20de%20Testes%20de%20Software.md), gravando a tela do dispositivo.
2. Anexa o vídeo na linha "Evidência" (arrastando o arquivo para o editor do GitHub, que gera o link).
3. Preenche o responsável pelo teste, a data e o comentário com o resultado obtido; se o resultado divergir do critério de êxito, registra o desvio no comentário.

### Casos de teste da Etapa 2 (RF-001 - mobile)

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - S<br>Login com credenciais válidas</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O botão exibe o indicador de carregamento durante o envio e, em seguida, o aplicativo redireciona o usuário para a área principal (abas Início, Gatos, Doses e Busca).</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - I01<br>Login com e-mail em formato inválido</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe "Informe um e-mail válido." abaixo do campo E-mail, destaca o campo em vermelho e não envia a requisição ao servidor.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - I02<br>Login com senha em branco</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe "Informe sua senha." abaixo do campo Senha e permanece na tela de login.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - I03<br>Login com senha incorreta ou e-mail não cadastrado</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">Nas duas tentativas o aplicativo exibe a mensagem "E-mail ou senha incorretos.", mantém o usuário na tela de login e não revela se o e-mail existe.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - I04<br>Login com usuário desativado</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe "E-mail ou senha incorretos." e permanece na tela de login.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - I05<br>Login sem conexão com o servidor</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe "Não foi possível conectar ao servidor. Verifique sua conexão.", encerra o indicador de carregamento e mantém o botão "Entrar" disponível para nova tentativa.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-002 - S<br>Mostrar e ocultar a senha digitada</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">A senha começa mascarada; após o primeiro toque o texto fica visível e o ícone muda para "olho cortado"; após o segundo toque a senha volta a ficar mascarada.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-003 - S<br>Solicitar senha temporária por e-mail</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">Após o envio o aplicativo exibe "Se esse e-mail estiver cadastrado, enviaremos uma senha temporária em instantes." (a mesma mensagem para qualquer e-mail válido); ao editar o campo a confirmação desaparece; "Voltar para o login" retorna à tela "Entrar".</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-003 - I01<br>Recuperar senha com e-mail inválido</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe "Informe um e-mail válido." abaixo do campo e não exibe a mensagem de confirmação.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 - S<br>Aceitar os termos de uso no primeiro acesso</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O botão "Continuar" só é habilitado após marcar a caixa; ao tocar nele o aceite é registrado e o aplicativo avança para a próxima etapa (tela "Defina sua nova senha", se houver troca de senha pendente, ou a área principal).</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 - I01<br>Continuar sem aceitar os termos</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O botão "Continuar" permanece desabilitado enquanto a caixa estiver desmarcada, o toque não tem efeito e o usuário continua na tela de termos.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 - I02<br>Falha ao registrar o aceite dos termos</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe uma mensagem de erro ("Não foi possível conectar ao servidor. Verifique sua conexão.") em vermelho, permanece na tela de termos e permite nova tentativa.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-005 - S<br>Definir nova senha no primeiro acesso</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">A nova senha é salva e o aplicativo redireciona o usuário para a área principal. Em um novo login, a nova senha é aceita e a temporária é rejeitada.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-005 - I01<br>Nova senha com campos em branco</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe "Informe sua senha atual.", "Informe a nova senha." e "Confirme a nova senha." abaixo dos respectivos campos e não envia a requisição.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-005 - I02<br>Nova senha com menos de 8 caracteres</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe "A nova senha deve ter pelo menos 8 caracteres." abaixo do campo "Nova senha" e permanece na tela.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-005 - I03<br>Confirmação diferente da nova senha</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe "As senhas não coincidem." abaixo do campo de confirmação e não envia a requisição.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-005 - I04<br>Nova senha com senha atual incorreta</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe em vermelho a mensagem retornada pelo servidor ("Senha atual incorreta."), permanece na tela e a senha do usuário não é alterada.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-005 - I05<br>Nova senha igual à senha atual</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe em vermelho a mensagem retornada pelo servidor ("A nova senha deve ser diferente da senha atual.") e permanece na tela.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-006 - S<br>Fluxo completo de primeiro acesso</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O aplicativo exibe as telas nesta ordem: Termos, Nova senha e área principal. Em nenhuma etapa o usuário acessa a área principal antes de concluir as anteriores; as abas Início, Gatos, Doses e Busca exibem a tela "Em breve".</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-007 - S<br>Manter a sessão ao reabrir o aplicativo</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">Após um breve indicador de carregamento o aplicativo abre direto na área principal, sem exibir a tela de login.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-007 - S02<br>Encerrar a sessão pelo botão Sair</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">Ao tocar em "Sair" o aplicativo retorna à tela de login; ao reabrir o aplicativo a tela de login continua sendo exibida (sessão removida).</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-007 - I01<br>Sessão expirada durante o uso</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O servidor responde 401, o aplicativo limpa a sessão armazenada e redireciona o usuário para a tela de login.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Murilo Silva Rezende</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">A preencher</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">A preencher</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A preencher após a execução do teste (resultado obtido e observações).</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center"><em>Vídeo a anexar após a execução do teste.</em></td>
  </tr>
</table>
