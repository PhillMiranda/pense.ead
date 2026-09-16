# Plataforma de Cursos pense.ead — Plano Técnico

Documento de referência para a construção da plataforma de aulas (estilo Moodle) da pense.ead. Cobre decisões de stack, modelo de dados, estrutura de páginas, fluxo do aluno e um roadmap de fases. Serve como guia enquanto o código é construído — atualize este arquivo conforme decisões mudarem.

## 1. Decisões de stack

| Camada | Escolha | Por quê |
|---|---|---|
| Frontend | HTML + CSS + JS puro (ES Modules), sem jQuery/Materialize | Mesma stack usada nos outros projetos (Pense Salão, iOficinas, Juninho Autocenter); ES Modules já são compatíveis com o formato usado por bundlers do React/Vite, o que facilita migrar página por página no futuro sem reescrever tudo de uma vez |
| Backend | Supabase (Postgres + Auth + Row Level Security + Edge Functions + Storage) | Já é usado no projeto Quiz (Supabase + Deno Edge Functions); evita manter servidor próprio; RLS resolve o controle de acesso a conteúdo pago direto no banco |
| Vídeo | YouTube (vídeos não listados) embutidos via YouTube IFrame Player API | Zero custo de armazenamento/streaming; a IFrame API permite detectar quando o aluno termina o vídeo para marcar a aula como concluída automaticamente |
| Pagamento | Mercado Pago (Checkout Pro), com webhook em Supabase Edge Function | Meio de pagamento mais comum para o público brasileiro (Pix + cartão); o webhook libera o acesso automaticamente na tabela de matrículas |
| Certificado | Gerado em Edge Function (lib de PDF) ao concluir o curso, salvo no Supabase Storage | Não depende de servidor próprio; o aluno baixa o PDF e existe uma página pública de validação por código |

Migração futura para TypeScript/Node/React: como o frontend já nasce em ES Modules e o backend já é Supabase (que tem SDK oficial para Node/React), a migração pode ser feita **tela por tela** — reescrever `aula.html` em React, por exemplo, sem precisar tocar no restante, porque a lógica de acesso a dados já fica isolada em `app/js/api/*.js`.

## 2. Onde isso mora: site institucional vs. plataforma do aluno

O site atual (`index.html`, `pages/cursos.html`) é a vitrine institucional: público, focado em SEO e conversão (conhecer a empresa, ver os cursos, contratar o serviço de desenvolvimento). A plataforma de aulas é uma aplicação autenticada (login, progresso, conteúdo protegido) — são responsabilidades diferentes e merecem viver separadas.

Recomendação: manter os dois dentro do mesmo repositório por enquanto (mais simples de gerenciar sendo vocês dois), mas em uma pasta própria `app/`, como se fosse um projeto à parte — com seu próprio `README.md`, seu próprio JS e sem depender do CSS/JS do site institucional. Isso deixa a porta aberta para, quando fizer sentido, extrair `app/` para um repositório e subdomínio próprios (ex: `app.penseead.com.br`), sem quebrar nada do site atual.

O link `/login` e `/cadastro` que já existem no menu do `index.html` passam a apontar para as páginas dentro de `app/pages/`.

## 3. Modelo de dados (Supabase / Postgres)

Nomeação das tabelas em português, seguindo o padrão já usado no projeto (`cursoDestaque.js`, `listaCursos.js`, `depoimentos.js`). Ver `app/schema.sql` para o SQL completo com as políticas de RLS.

- **perfis** — 1 linha por usuário autenticado (nome, avatar, papel: `aluno` / `admin` / `instrutor`)
- **categorias** — Desenvolvimento Profissional, Programação, Combos Promocionais (já existem no `cursos.html` atual)
- **cursos** — título, slug, descrição, capa, categoria, preço, status (`rascunho` / `publicado`)
- **modulos** — pertence a um curso, tem ordem
- **aulas** — pertence a um módulo; tipo `video` / `texto` / `quiz`; para vídeo guarda o `youtube_video_id`; tem ordem
- **matriculas** — vínculo aluno↔curso, com status (`pendente` / `ativa`) e origem (`gratuita` / `compra`)
- **progresso_aulas** — 1 linha por aluno+aula, com `concluida` e `concluida_em`
- **quizzes** e **quiz_perguntas** — perguntas de múltipla escolha por módulo/curso
- **quiz_tentativas** — respostas do aluno, nota, aprovado/reprovado
- **certificados** — emitido ao concluir o curso, com `codigo_validacao` público e link do PDF
- **pagamentos** — registro de cada cobrança (gateway, id externo, valor, status)

Regra de acesso central (via RLS): o conteúdo de uma aula (o `youtube_video_id`, por exemplo) só é visível para o aluno se existir uma linha em `matriculas` com status `ativa` para aquele curso — isso é o que impede alguém de "pular" o pagamento e assistir direto pela API do Supabase.

## 4. Estrutura de páginas da plataforma (`app/pages/`)

- `login.html`, `cadastro.html` — autenticação (Supabase Auth, e-mail/senha)
- `dashboard.html` — "meus cursos", com barra de progresso de cada um
- `curso.html?slug=...` — se matriculado: lista de módulos/aulas com status; se não matriculado: prévia + botão de matrícula/compra
- `aula.html?id=...` — player (iframe do YouTube) + conteúdo da aula + botão "próxima aula"; marca progresso automaticamente
- `quiz.html?id=...` — perguntas do módulo/curso
- `certificado.html?id=...` — visualização/download do certificado
- `admin/` — CRUD de cursos, módulos, aulas e visão dos alunos matriculados (fase 4, ver roadmap)

## 5. Fluxo do aluno

1. Visita o catálogo público (site institucional) e escolhe um curso
2. Cria conta ou faz login
3. Curso gratuito → matrícula imediata; curso pago → checkout Mercado Pago → webhook confirma pagamento → matrícula é ativada
4. No dashboard, entra no curso → vê os módulos/aulas → assiste ao vídeo
5. Ao terminar o vídeo (evento `ended` da YouTube IFrame API) ou ao clicar em "marcar como concluída", o progresso é salvo
6. Ao terminar as aulas de um módulo com quiz, o aluno faz o quiz; nota mínima define aprovação
7. Ao concluir 100% do curso, o certificado é gerado automaticamente e aparece no dashboard, com código de validação público

## 6. Vídeos no YouTube na prática

Os vídeos ficam como **não listados** no canal (não aparecem em busca/canal, só quem tem o link/ID acessa) — suficiente para não gastar com servidor de vídeo, sem deixar o conteúdo pago totalmente público. Na página `aula.html`, o player é criado via **YouTube IFrame Player API** (não um `<iframe src="...">` simples), porque isso permite escutar o evento `onStateChange` e detectar quando o vídeo chega ao fim, disparando a marcação automática de "aula concluída" — é a peça que faz a plataforma se comportar como um Moodle de verdade e não só uma lista de links de vídeo.

## 7. Pagamento e liberação de acesso

Fluxo: o front-end chama uma Edge Function (`criar-pagamento`) que cria a preferência de pagamento no Mercado Pago e redireciona o aluno para o checkout. O Mercado Pago notifica outra Edge Function (`webhook-pagamento`) quando o pagamento é aprovado; essa função grava o pagamento na tabela `pagamentos` e ativa a `matricula` correspondente. O front nunca decide sozinho se o acesso deve ser liberado — isso evita fraude (usuário forjar no navegador que "pagou").

## 8. Certificados

Ao detectar que todas as aulas de um curso estão com `concluida = true` (pode ser um trigger no banco ou uma verificação no momento em que a última aula é marcada), uma Edge Function gera o PDF do certificado, salva no Storage e grava uma linha em `certificados` com um `codigo_validacao` (ex: `PENSE-2026-A1B2C3`). Uma página pública `certificado-validar.html?codigo=...` permite que qualquer pessoa (ex: um recrutador) confira a autenticidade.

## 9. Painel do professor/admin

Fica para a Fase 4 do roadmap abaixo. Na prática, nas primeiras turmas, cadastrar cursos/módulos/aulas direto pelo **Supabase Studio** (a interface administrativa que já vem com o Supabase) é suficiente e evita gastar tempo construindo uma tela de admin antes de validar se o curso vende. Um painel próprio só compensa quando o cadastro de conteúdo virar rotina.

## 10. Roadmap sugerido

Mesmo com as quatro frentes (catálogo/vídeo, quiz/certificado, pagamento, admin) sendo todas prioridade, faz sentido construir em camadas — cada fase já é utilizável sozinha:

1. **Fase 1 — Núcleo**: autenticação, matrícula gratuita, catálogo dentro do app, player de vídeo com progresso. Já dá para rodar uma turma piloto gratuita.
2. **Fase 2 — Avaliação**: quizzes por módulo, certificado automático com página de validação.
3. **Fase 3 — Monetização**: checkout Mercado Pago, webhook, liberação automática de acesso pago.
4. **Fase 4 — Operação**: painel admin (cadastro de cursos/módulos/aulas fora do Supabase Studio), relatórios de alunos.

## 11. O que já foi criado nesta etapa

Dentro de `app/`, como ponto de partida:

- `schema.sql` — todas as tabelas do item 3, já com as políticas de RLS descritas
- `js/supabaseClient.js` — inicialização do client do Supabase
- `js/auth-guard.js` — trava páginas que exigem login e expõe o usuário atual
- `js/api/cursos.js` e `js/api/progresso.js` — funções de acesso a dados (buscar cursos matriculados, marcar aula como concluída, etc.)
- `pages/login.html`, `pages/cadastro.html`, `pages/dashboard.html`, `pages/curso.html`, `pages/aula.html` — esqueleto de tela, já ligados às funções acima, prontos para receber estilo/conteúdo

Os pagamentos, quizzes/certificados (Edge Functions) e o painel admin ficam para as próximas etapas, seguindo o roadmap acima.
