# 🔍 Evidências de Testes de Software - Etapa 2

Apresente vídeos do software em funcionamento que comprovam que um determinado teste foi executado.

## Testes por pares
A fim de aumentar a qualidade da aplicação desenvolvida, cada funcionalidade deve ser testada por um colega e os testes devem ser evidenciados. O colega "Tester" deve utilizar o caso de teste criado pelo desenvolvedor responsável pela funcionalidade (desenvolveu a funcionalidade e criou o caso de testes descrito no plano de testes) e caso perceba a necessidade de outros casos de teste, deve acrescentá-los na sessão "Plano de Testes".

### Como preencher
1. O "Tester" executa o caso de teste conforme o passo a passo do [Plano de Testes](04-Plano%20de%20Testes%20de%20Software.md), gravando a tela do dispositivo.
2. Anexa o vídeo na linha "Evidência" (arrastando o arquivo para o editor do GitHub, que gera o link).
3. Preenche o responsável pelo teste, a data e o comentário com o resultado obtido; se o resultado divergir do critério de êxito, registra o desvio no comentário.

## 📱 MOBILE - Evidências de Testes - ETAPA 2 (RF-001)

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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Login realizado com um usuário ativo, com termos já aceitos e sem troca de senha pendente. O botão exibiu o indicador de carregamento durante o envio e o aplicativo redirecionou para a área principal, com as abas Início, Gatos, Doses e Busca. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/8f2436ec-a19a-4904-a5a1-9fd8b6039f56

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com o e-mail "usuario" (sem @ e domínio) e também com o campo vazio, o aplicativo exibiu "Informe um e-mail válido." abaixo do campo E-mail, destacou o campo em vermelho e não enviou a requisição ao servidor. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/551e3454-ac70-488c-97d1-4326eeeb1d60

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com um e-mail válido e o campo de senha vazio, o aplicativo exibiu "Informe sua senha." abaixo do campo Senha e permaneceu na tela de login. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/6dfb857d-ca65-4888-98ff-b35967c70b86

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Nas duas tentativas (senha incorreta para um e-mail cadastrado e, depois, e-mail inexistente) o aplicativo exibiu "E-mail ou senha incorretos.", manteve o usuário na tela de login e não revelou se o e-mail existe. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/4bb2e94f-bcbc-4ef0-98aa-26a503489acc

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com o e-mail de um usuário desativado e a senha correta, o aplicativo exibiu "E-mail ou senha incorretos." e permaneceu na tela de login. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/72130a2e-4534-4028-ab93-fd8421d592b0

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com o backend desligado, ao tocar em "Entrar" o aplicativo exibiu "Não foi possível conectar ao servidor. Verifique sua conexão.", encerrou o indicador de carregamento e manteve o botão "Entrar" disponível para nova tentativa. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/7384eadf-fdfe-4a39-9ff6-fc532842407c

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A senha digitada começou mascarada. Após o primeiro toque no ícone de olho o texto ficou visível e o ícone mudou para "olho cortado"; após o segundo toque a senha voltou a ficar mascarada. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/a70c4d7c-535e-46b9-be15-86dc64d5ed9a

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A partir de "Esqueci minha senha", com um e-mail em formato válido, o aplicativo exibiu a mensagem genérica de confirmação ("Se esse e-mail estiver cadastrado, enviaremos uma senha temporária em instantes."). Ao editar o campo a confirmação desapareceu e "Voltar para o login" retornou à tela "Entrar". Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/7a53bd7d-b18c-41bb-a9c6-c8502a55c6d1

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com o campo vazio e com e-mails inválidos (usuario@ e usuario@dominio), o aplicativo exibiu "Informe um e-mail válido." abaixo do campo e não exibiu a mensagem de confirmação. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/d5711cc1-5864-4ff3-b6a5-9627b3292c78

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com um usuário que ainda não havia aceitado os termos, o botão "Continuar" só foi habilitado após marcar a caixa "Li e aceito os termos.". Ao tocar nele o aceite foi registrado e o aplicativo avançou para a próxima etapa. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/9377f824-5d33-4c55-a446-e6cd0817a013

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com a caixa desmarcada, o botão "Continuar" permaneceu desabilitado, o toque não teve efeito e o usuário continuou na tela de termos. Ao marcar e desmarcar a caixa, o botão alternou entre habilitado e desabilitado. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/beb15b45-fe59-4dca-bf1b-4ed58a13f054

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com o backend desligado, ao marcar a caixa e tocar em "Continuar" o aplicativo exibiu em vermelho "Não foi possível conectar ao servidor. Verifique sua conexão.", permaneceu na tela de termos e permitiu nova tentativa. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/57f83124-66c9-402c-a034-9af5f08209f7

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com a senha temporária como senha atual e uma nova senha válida (com confirmação igual), a nova senha foi salva e o aplicativo redirecionou o usuário para a área principal. Em um novo login, a nova senha foi aceita e a senha temporária foi rejeitada. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/d15dbc1f-5c0d-43d1-85a5-93529bafe9fc

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com os três campos vazios, o aplicativo exibiu "Informe sua senha atual.", "Informe a nova senha." e "Confirme a nova senha." abaixo dos respectivos campos e não enviou a requisição. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/0c1f8622-e585-48e5-8c46-e90f4787a4fe

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com nova senha e confirmação "abc123" (6 caracteres), o aplicativo exibiu "A nova senha deve ter pelo menos 8 caracteres." abaixo do campo "Nova senha" e permaneceu na tela. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/f01095e0-041c-4d66-bba1-a8996dcc5f44

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com nova senha "NovaSenha@2026" e confirmação "NovaSenha@2025", o aplicativo exibiu "As senhas não coincidem." abaixo do campo de confirmação e não enviou a requisição. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/54050c42-05cc-4932-b9b5-c00c3e2164f4

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com uma senha atual diferente da temporária e uma nova senha válida, o aplicativo exibiu em vermelho a mensagem retornada pelo servidor ("Senha atual incorreta."), permaneceu na tela e a senha do usuário não foi alterada. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/6317daf4-0f4f-4469-9b1b-81c2f8a9055b

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com a senha temporária repetida em "Nova senha" e "Confirmar nova senha", o aplicativo exibiu em vermelho a mensagem retornada pelo servidor ("A nova senha deve ser diferente da senha atual.") e permaneceu na tela. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/9b05903a-1dcd-4e7e-afa8-59c7a8c3e3c1

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com um usuário novo (termos não aceitos e senha temporária), o aplicativo exibiu as telas na ordem Termos, Nova senha e área principal, sem permitir acesso à área principal antes de concluir as etapas anteriores. As abas Início, Gatos, Doses e Busca exibiram a tela "Em breve". Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/d6f4b3e5-ebee-404b-90a0-b8fa74de5778

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Após o login com sucesso, o aplicativo foi fechado completamente e aberto novamente. Após um breve indicador de carregamento ele abriu direto na área principal, sem exibir a tela de login. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/e319b203-4466-475f-86e6-234e4e6c6cf2

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Ao tocar em "Sair" o aplicativo retornou à tela de login. Ao fechar e reabrir o aplicativo, a tela de login continuou sendo exibida, confirmando que a sessão foi removida. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/5f072d97-dc39-49d2-9883-c592fb51a84e

</td>
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
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com o usuário na tela de termos, o segredo JWT do backend foi alterado e o backend reiniciado, invalidando o token guardado no aplicativo. Ao marcar o aceite e tocar em "Continuar", o servidor respondeu 401, o aplicativo limpou a sessão armazenada e redirecionou o usuário para a tela de login. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

https://github.com/user-attachments/assets/4e6da5f2-18ae-4cfd-a367-f6ecbcc25f52

</td>
  </tr>
</table>

## 💻 WEB - Evidências de Testes - ETAPA 2 (RF-001)


<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - S<br>Login com credenciais válidas</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve autenticar o usuário, gerar um token de acesso e permitir o acesso às funcionalidades correspondentes ao seu perfil.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com o e-mail e a senha de um usuário cadastrado e ativo, o sistema autenticou o usuário, gerou o token de acesso e permitiu o acesso às funcionalidades correspondentes ao seu perfil. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-001-S: arraste web-caso-teste-CT-001-S.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-001 - S](gravacoes-testes-etapa-2/web/web-caso-teste-CT-001-S.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - I01<br>Login com senha incorreta</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema não deve autenticar o usuário nem gerar um token de acesso e deve informar que as credenciais são inválidas.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com o e-mail de um usuário cadastrado e ativo e uma senha diferente da cadastrada, o sistema não autenticou o usuário, não gerou token de acesso e informou que as credenciais são inválidas. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-001-I01: arraste web-caso-teste-CT-001-I01.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-001 - I01](gravacoes-testes-etapa-2/web/web-caso-teste-CT-001-I01.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - I02<br>Login com usuário inexistente</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve rejeitar a autenticação e apresentar uma mensagem de credenciais inválidas, sem permitir acesso ao sistema.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com um e-mail não cadastrado na base, o sistema rejeitou a autenticação e apresentou a mensagem de credenciais inválidas, sem permitir acesso ao sistema. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-001-I02: arraste web-caso-teste-CT-001-I02.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-001 - I02](gravacoes-testes-etapa-2/web/web-caso-teste-CT-001-I02.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - I03<br>Login com usuário inativo</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve impedir a autenticação do usuário inativo e não deve gerar um token de acesso.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com o e-mail e a senha corretos de um usuário inativo, o sistema impediu a autenticação e não gerou token de acesso. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-001-I03: arraste web-caso-teste-CT-001-I03.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-001 - I03](gravacoes-testes-etapa-2/web/web-caso-teste-CT-001-I03.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - I04<br>Login com e-mail em formato inválido</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve impedir o processamento do login e informar que o e-mail possui formato inválido.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com um e-mail em formato inválido, o sistema impediu o processamento do login e informou que o e-mail possui formato inválido. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-001-I04: arraste web-caso-teste-CT-001-I04.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-001 - I04](gravacoes-testes-etapa-2/web/web-caso-teste-CT-001-I04.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-001 - I05<br>Login com campos obrigatórios vazios</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve impedir o login e indicar que os campos obrigatórios devem ser preenchidos.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com os campos de e-mail e senha vazios, o sistema impediu o login e indicou que os campos obrigatórios devem ser preenchidos. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-001-I05: arraste web-caso-teste-CT-001-I05.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-001 - I05](gravacoes-testes-etapa-2/web/web-caso-teste-CT-001-I05.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-002 - S<br>Solicitação de recuperação de senha</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve processar a solicitação e disponibilizar ao usuário cadastrado o mecanismo definido para redefinição da senha por e-mail.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">A partir de "Esqueci minha senha", com o e-mail de um usuário cadastrado e ativo, o sistema processou a solicitação e disponibilizou ao usuário o mecanismo de redefinição da senha por e-mail. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-002-S: arraste web-caso-teste-CT-002-S.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-002 - S](gravacoes-testes-etapa-2/web/web-caso-teste-CT-002-S.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-002 - I01<br>Recuperação de senha com e-mail inválido</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve rejeitar a solicitação e informar que o endereço de e-mail possui formato inválido.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com um e-mail em formato inválido na recuperação de senha, o sistema rejeitou a solicitação e informou que o endereço de e-mail possui formato inválido. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-002-I01: arraste web-caso-teste-CT-002-I01.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-002 - I01](gravacoes-testes-etapa-2/web/web-caso-teste-CT-002-I01.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-003 - S<br>Redefinição de senha pelo Administrador</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve atualizar a senha do usuário e permitir sua autenticação com a nova credencial, respeitando a regra de alteração obrigatória da senha quando aplicável.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com um usuário Administrador autenticado, a senha de outro usuário foi redefinida pela gestão de usuários. O sistema atualizou a senha e permitiu a autenticação do usuário com a nova credencial, respeitando a regra de alteração obrigatória da senha quando aplicável. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-003-S: arraste web-caso-teste-CT-003-S.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-003 - S](gravacoes-testes-etapa-2/web/web-caso-teste-CT-003-S.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-003 - I01<br>Redefinição de senha sem permissão de Administrador</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve impedir a operação e manter a senha do usuário alvo inalterada.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com um usuário de perfil diferente de Administrador autenticado, o sistema impediu a redefinição da senha de outro usuário e manteve a senha do usuário alvo inalterada. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-003-I01: arraste web-caso-teste-CT-003-I01.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-003 - I01](gravacoes-testes-etapa-2/web/web-caso-teste-CT-003-I01.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-004 - S<br>Cadastro de usuário com perfil de acesso</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve cadastrar o usuário com sucesso, associar o perfil de acesso selecionado e disponibilizá-lo na listagem de usuários.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com um usuário Administrador autenticado, o cadastro de um novo usuário foi concluído com sucesso. O sistema associou o perfil de acesso selecionado e disponibilizou o usuário na listagem de usuários. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-004-S: arraste web-caso-teste-CT-004-S.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-004 - S](gravacoes-testes-etapa-2/web/web-caso-teste-CT-004-S.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-005 - I01<br>Cadastro de usuário com e-mail já existente</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve impedir o cadastro duplicado e informar que o endereço de e-mail já está registrado.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Ao tentar cadastrar um novo usuário com um e-mail já existente na base, o sistema impediu o cadastro duplicado e informou que o endereço de e-mail já está registrado. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-005-I01: arraste web-caso-teste-CT-005-I01.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-005 - I01](gravacoes-testes-etapa-2/web/web-caso-teste-CT-005-I01.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-006 - S<br>Alteração do perfil de acesso de um usuário</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve salvar a alteração e o usuário deve passar a possuir o novo perfil de acesso definido pelo Administrador.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">O perfil de acesso de um usuário cadastrado foi alterado de Viewer para Assistant por um Administrador. O sistema salvou a alteração e, ao verificar os dados do usuário, o novo perfil de acesso estava aplicado. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-006-S: arraste web-caso-teste-CT-006-S.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-006 - S](gravacoes-testes-etapa-2/web/web-caso-teste-CT-006-S.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-007 - S<br>Inativação de usuário</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve alterar a situação do usuário para inativo, mantê-lo registrado na base de dados e impedir novas autenticações enquanto permanecer inativo.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Um Administrador inativou um usuário ativo. O sistema alterou a situação do usuário para inativo, manteve o registro na listagem e impediu a autenticação do usuário inativado ao tentar realizar login. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-007-S: arraste web-caso-teste-CT-007-S.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-007 - S](gravacoes-testes-etapa-2/web/web-caso-teste-CT-007-S.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-008 - S<br>Busca e filtragem de usuários por perfil e situação</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve apresentar somente os usuários que correspondam aos critérios de busca e filtros informados, mantendo corretamente os dados de nome, e-mail, perfil e situação.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Com a busca por nome ou e-mail e os filtros de perfil de acesso e situação aplicados, o sistema apresentou somente os usuários que correspondem aos critérios informados, mantendo corretos os dados de nome, e-mail, perfil e situação. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-008-S: arraste web-caso-teste-CT-008-S.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-008 - S](gravacoes-testes-etapa-2/web/web-caso-teste-CT-008-S.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-009 - S<br>Reativação de usuário</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve alterar a situação do usuário para ativo, manter os dados do cadastro e permitir novas autenticações com as credenciais do usuário reativado.</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Um Administrador reativou um usuário inativo. O sistema alterou a situação do usuário para ativo, manteve os dados do cadastro e permitiu a autenticação com as credenciais do usuário reativado. Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-009-S: arraste web-caso-teste-CT-009-S.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-009 - S](gravacoes-testes-etapa-2/web/web-caso-teste-CT-009-S.mp4)

</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="6" width="1000">CT-010 - S<br>Alteração e remoção da foto de um usuário</th>
  </tr>
  <tr>
    <td width="170"><strong>Critérios de êxito</strong></td>
    <td colspan="5">O sistema deve salvar e exibir a foto informada, substituí-la pela nova imagem ao ser alterada e, ao remover a foto, apagá-la do cadastro do usuário, que passa a ser exibido sem foto (imagem padrão).</td>
  </tr>
  <tr>
    <td><strong>Responsável pela funcionalidade</strong></td>
    <td width="430">Railan Leão</td>
    <td><strong>Responsável pelo teste</strong></td>
    <td width="430">Aliane Amaral</td>
    <td width="100"><strong>Data do teste</strong></td>
    <td width="150">20/09/2026</td>
  </tr>
  <tr>
    <td width="170"><strong>Comentário</strong></td>
    <td colspan="5">Um Administrador definiu uma foto para o usuário, substituiu-a por uma segunda imagem e depois removeu a foto. O sistema salvou e exibiu a foto informada, substituiu-a pela nova imagem e, ao remover, apagou a foto do cadastro, e o usuário passou a ser exibido sem foto (imagem padrão). Resultado conforme o critério de êxito.</td>
  </tr>
  <tr>
    <td colspan="6" align="center"><strong>Evidência</strong></td>
  </tr>
  <tr>
    <td colspan="6" align="center">

<!-- VIDEO CT-010-S: arraste web-caso-teste-CT-010-S.mp4 na linha em branco abaixo -->



Local do Vídeo no Repositório para Download: [Vídeo - CT-010 - S](gravacoes-testes-etapa-2/web/web-caso-teste-CT-010-S.mp4)

</td>
  </tr>
</table>
