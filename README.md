# 🐾 Sistema de Gestão de Abrigo Felino — ONG Amicats

`CURSO: Análise e Desenvolvimento de Sistemas`

`DISCIPLINA: Projeto: Desenvolvimento de uma Aplicação Distribuída`

`EIXO 5 · SEMESTRE 2026/2`

Sistema de gestão para a **ONG Amicats**, organização de proteção animal que mantém em uma chácara mais de 400 gatos resgatados, distribuídos em oito salas separadas por condição de saúde, faixa etária e gravidade clínica.

Hoje todo o controle clínico da ONG é feito à caneta, em fichas de papel afixadas do lado de fora de cada sala. Esse modelo impede a consulta remota e simultânea, dificulta a comunicação entre os veterinários da escala alternada e não oferece qualquer rastreabilidade de tratamentos anteriores. Como a chácara fica distante da cidade e não possui internet fixa, cada deslocamento desnecessário representa custo de tempo, combustível e atraso no atendimento de animais em risco.

Este projeto substitui o papel por um **prontuário digital acessível pelo celular**, com controle de medicações, alocação por sala e ciclo de adoção, projetado para funcionar mesmo sob conectividade intermitente.

> Desenvolvido como **ação de extensão universitária**, tendo a ONG Amicats como beneficiária direta.

---

## 👥 Integrantes

| Nome | Papel |
|---|---|
| Aliane Elias Amaral | Product Owner — interlocução com a ONG e priorização dos requisitos |
| Déborah de Faria Vilaça | Scrum Master — cronograma e remoção de impedimentos |
| Murilo Silva Rezende | Desenvolvimento Web — painel e telas de consulta |
| Nelson Antônio Sinis Júnior | Full Stack — autenticação, sincronização offline e integração |
| Railan da Silva Leão | Desenvolvimento Back-end — API e banco de dados |
| Wesley da Silva Teixeira | Desenvolvimento Mobile — aplicação e captura de imagens |

## 🧑‍🏫 Orientação

| Nome |
|---|
| *Pedro Alves de Oliveira* |

---

## 🎯 Objetivo

Desenvolver um sistema web e mobile que centralize o prontuário clínico, o controle de medicações e a alocação dos animais por sala, garantindo rastreabilidade, acesso simultâneo e consulta remota em tempo real, com tolerância a conectividade intermitente.

### Problemas que a solução ataca:

| Problema atual | Como o sistema resolve |
|---|---|
| Exames, receitas e anotações se perdem entre papéis avulsos | Prontuário digital vinculado à ficha do gato, com anexos |
| Veterinários da escala alternada não conseguem se comunicar | Histórico cronológico com autoria, data e hora, consultável por qualquer profissional autorizado |
| Não se sabe o que já foi administrado no turno anterior | Marcação de dose aplicada, com responsável e horário |
| A falta de medicamento só é percebida quando ele acaba | Controle de disponibilidade consultável antes da viagem à chácara |
| Cada consulta exige deslocamento até o abrigo | Acesso remoto por celular, de qualquer lugar |
| A internet do abrigo cai constantemente | Salvamento local e sincronização automática ao recuperar a conexão |

---

## 🚀 Funcionalidades principais

- 🔐 **Autenticação e perfis** — Administrador, Médico-Veterinário, Auxiliar e Visualizador, com permissões distintas
- 🐈 **Ficha do felino** — cadastro completo com fotos, status de saúde, sala atual e histórico de transferências
- 🩺 **Prontuário digital** — prescrições, consultas, exames e vacinas em ordem cronológica, com registro de atendimentos em clínicas parceiras
- 💊 **Administração de medicamentos** — dose aplicada com autoria e horário, suspensão com motivo e controle de disponibilidade
- 🏠 **Salas configuráveis** — criação, edição e desativação pela própria interface, sem alteração em código
- 🤝 **Ciclo de adoção** — adoção, termo de responsabilidade, acompanhamento pós-adoção e registro de devoluções
- 📊 **Dashboard e relatórios** — lembretes da semana, totais por sala e exportação em PDF ou Excel
- 📴 **Modo offline** — registro sem conexão, com sincronização automática ou manual

---

## 📄 Documentação

| # | Documento |
|---|---|
| 01 | [Documentação de Contexto](documentos/1-Documentação%20de%20Contexto.md) |
| 02 | [Especificações do Projeto](documentos/2-Especificações%20do%20Projeto.md) |
| 03 | [Projeto de Interface](documentos/3-Projeto%20de%20Interface.md) |
| 04 | [Projeto da Base de Dados](documentos/4-Projeto%20da%20Base%20de%20Dados.md) |
| 05 | [Arquitetura da Solução](documentos/5-Arquitetura%20da%20Solução.md) |
| 06 | [Plano de Testes de Software](documentos/6-Plano%20de%20Testes%20de%20Software.md) |
| 07 | [Registro de Testes de Software](documentos/7-Registro%20de%20Testes%20de%20Software.md) |
| 08 | [Referências](documentos/8-Referências.md) |

📁 Atas de reunião, termos e relatórios de extensão estão na pasta [`/atas`](https://github.com/ICEI-PUC-Minas-PMV-ADS/PMV-ADS-2026-2-E5-PROJ-EMPEXT-T4-G3/tree/feature/doc-especificacoes-do-projeto/atas).

---

## 🗓️ Cronograma

| Etapa | Período | Entregas principais |
|---|---|---|
| Nivelamento | 03/08 a 16/08/2026 | Definição do grupo e do cliente · Ata de Acordo Inicial |
| Etapa 1 — Concepção | 03/08 a 06/09/2026 | Contexto, requisitos, casos de uso, base de dados e Canvas |
| Etapa 2 — Sprint 1 | 07/09 a 20/09/2026 | Protótipo, autenticação e cadastros base |
| Etapa 3 — Sprint 2 | 21/09 a 18/10/2026 | Prontuário, medicações e sincronização offline |
| Etapa 4 — Sprint 3 | 19/10 a 22/11/2026 | Adoção, devolução, dashboard e relatórios |
| Etapa 5 — Entrega | 23/11 a 06/12/2026 | Homologação, implantação, aceite e Mostra de Extensão |

---

## 🛠️ Tecnologias

> 🚧 *Stack em definição — atualizar após a decisão da equipe.*

| Camada | Tecnologia |
|---|---|
| Mobile | React Native 0.86 · Expo 57 · TypeScript |
| Web | Next.js 16 · React 19 · TypeScript |
| Back-end | Java 21 · Spring Boot 4.1 (API REST) |
| Banco de dados | PostgreSQL 16 · Flyway (migrations) |
| Banco local (offline) | SQLite (app mobile) |
| Contêineres | Docker · Docker Compose |
| Armazenamento de imagens | *a definir* |
| Hospedagem | Camada gratuita (restrição orçamentária da ONG) |
| Qualidade de código | ESLint · Prettier · Spotless · Husky + lint-staged |
| Versionamento | Git · GitHub |
| Gestão de tarefas | GitHub Projects |

---

## 📂 Estrutura do repositório

```
├── apresentacao/        # Slides e vídeos das entregas
├── atas/                # Atas dos encontros e termos assinados com o parceiro
├── codigo-fonte/        # Código-fonte da solução
│   ├── backend/         # API REST (Java · Spring Boot)
│   ├── mobile/          # Aplicação mobile (React Native · Expo)
│   └── web/             # Painel web (Next.js)
├── documentos/          # Documentação do projeto
│   └── img/             # Imagens usadas na documentação
├── proex/               # Relatório do APC (extensão)
├── docker-compose.yml   # Sobe banco, backend e web para desenvolvimento
└── README.md
```

---

## ▶️ Como executar

> 🚧 *Instruções a serem preenchidas conforme a implementação avança.*

```bash
# Clonar o repositório
git clone https://github.com/<organizacao>/<repositorio>.git
cd <repositorio>

# Instalar dependências
# ...

# Executar em ambiente de desenvolvimento
# ...
```

---

## 🔒 Privacidade e conformidade

O sistema trata dados pessoais de adotantes, voluntários e profissionais, além de registros clínicos dos animais. O projeto observa:

- **LGPD** — acesso a dados pessoais restrito por perfil, com coleta limitada ao necessário para o processo de adoção e acompanhamento.
- **Resolução CFMV nº 1.321/2020**, alterada pela **Resolução CFMV nº 1.653/2025** — o prontuário registra data, hora, local, procedimentos e identificação do médico-veterinário responsável com CRMV, e é mantido por no mínimo cinco anos.
- **Auditoria** — nenhum registro é excluído fisicamente; correções são feitas por novo lançamento, preservando autor e histórico.

---

## 📜 Licença

*[Definir licença do projeto.]*

---

<p align="center">
Feito com 💚 por estudantes de ADS da PUC Minas, para os gatos da ONG Amicats.
</p>
