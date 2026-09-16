-- =========================================================
-- Plataforma de Cursos pense.ead — Schema Supabase (Postgres)
-- Rode este arquivo no SQL Editor do seu projeto Supabase.
-- =========================================================

-- Extensão usada para gerar códigos aleatórios de certificado
create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- 1. Perfis (1 linha por usuário autenticado)
-- ---------------------------------------------------------
create table if not exists perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  avatar_url text,
  papel text not null default 'aluno' check (papel in ('aluno', 'instrutor', 'admin')),
  criado_em timestamptz not null default now()
);

-- Cria automaticamente um perfil "aluno" quando alguém se cadastra
create or replace function lidar_novo_usuario()
returns trigger as $$
begin
  insert into perfis (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function lidar_novo_usuario();

-- ---------------------------------------------------------
-- 2. Categorias e cursos
-- ---------------------------------------------------------
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique
);

create table if not exists cursos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid references categorias (id),
  titulo text not null,
  slug text not null unique,
  descricao text,
  capa_url text,
  preco_centavos integer not null default 0, -- 0 = curso gratuito
  status text not null default 'rascunho' check (status in ('rascunho', 'publicado')),
  criado_em timestamptz not null default now()
);

create table if not exists modulos (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references cursos (id) on delete cascade,
  titulo text not null,
  ordem integer not null default 0
);

create table if not exists aulas (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid not null references modulos (id) on delete cascade,
  titulo text not null,
  tipo text not null default 'video' check (tipo in ('video', 'texto', 'quiz')),
  youtube_video_id text, -- preenchido quando tipo = 'video'
  conteudo_texto text,   -- preenchido quando tipo = 'texto'
  duracao_segundos integer,
  ordem integer not null default 0
);

-- ---------------------------------------------------------
-- 3. Matrículas e progresso
-- ---------------------------------------------------------
create table if not exists matriculas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  curso_id uuid not null references cursos (id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente', 'ativa')),
  origem text not null default 'gratuita' check (origem in ('gratuita', 'compra')),
  criado_em timestamptz not null default now(),
  unique (usuario_id, curso_id)
);

create table if not exists progresso_aulas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  aula_id uuid not null references aulas (id) on delete cascade,
  concluida boolean not null default false,
  concluida_em timestamptz,
  unique (usuario_id, aula_id)
);

-- ---------------------------------------------------------
-- 4. Quizzes
-- ---------------------------------------------------------
create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid references modulos (id) on delete cascade,
  titulo text not null,
  nota_minima integer not null default 70 -- percentual para aprovar
);

create table if not exists quiz_perguntas (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes (id) on delete cascade,
  enunciado text not null,
  opcoes jsonb not null,       -- ex: ["Opção A", "Opção B", "Opção C"]
  resposta_correta integer not null, -- índice da opção correta
  ordem integer not null default 0
);

create table if not exists quiz_tentativas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  quiz_id uuid not null references quizzes (id) on delete cascade,
  nota integer not null,
  aprovado boolean not null,
  respostas jsonb not null,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 5. Certificados e pagamentos
-- ---------------------------------------------------------
create table if not exists certificados (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  curso_id uuid not null references cursos (id) on delete cascade,
  codigo_validacao text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10)),
  pdf_url text,
  emitido_em timestamptz not null default now(),
  unique (usuario_id, curso_id)
);

create table if not exists pagamentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  curso_id uuid not null references cursos (id),
  gateway text not null default 'mercado_pago',
  gateway_pagamento_id text,
  valor_centavos integer not null,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado')),
  criado_em timestamptz not null default now()
);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table perfis enable row level security;
alter table cursos enable row level security;
alter table categorias enable row level security;
alter table modulos enable row level security;
alter table aulas enable row level security;
alter table matriculas enable row level security;
alter table progresso_aulas enable row level security;
alter table quizzes enable row level security;
alter table quiz_perguntas enable row level security;
alter table quiz_tentativas enable row level security;
alter table certificados enable row level security;
alter table pagamentos enable row level security;

-- Perfis: cada um vê e edita só o seu
create policy "ver_proprio_perfil" on perfis for select using (auth.uid() = id);
create policy "editar_proprio_perfil" on perfis for update using (auth.uid() = id);

-- Categorias e cursos publicados: leitura pública (é o catálogo/vitrine)
create policy "categorias_publicas" on categorias for select using (true);
create policy "cursos_publicados_publicos" on cursos for select using (status = 'publicado');

-- Módulos: visíveis se o curso é público (metadado, sem o conteúdo da aula)
create policy "modulos_visiveis" on modulos for select using (
  exists (select 1 from cursos c where c.id = modulos.curso_id and c.status = 'publicado')
);

-- Aulas: só quem está matriculado ativamente enxerga o conteúdo (youtube_video_id, texto etc.)
create policy "aulas_para_matriculados" on aulas for select using (
  exists (
    select 1
    from modulos m
    join matriculas mt on mt.curso_id = m.curso_id
    where m.id = aulas.modulo_id
      and mt.usuario_id = auth.uid()
      and mt.status = 'ativa'
  )
);

-- Matrículas: aluno só vê/gerencia as próprias
create policy "ver_proprias_matriculas" on matriculas for select using (auth.uid() = usuario_id);
create policy "criar_propria_matricula" on matriculas for insert with check (auth.uid() = usuario_id);

-- Progresso: aluno só vê/edita o próprio progresso
create policy "ver_proprio_progresso" on progresso_aulas for select using (auth.uid() = usuario_id);
create policy "editar_proprio_progresso" on progresso_aulas for insert with check (auth.uid() = usuario_id);
create policy "atualizar_proprio_progresso" on progresso_aulas for update using (auth.uid() = usuario_id);

-- Quizzes: mesma regra das aulas (só matriculado ativo)
create policy "quizzes_para_matriculados" on quizzes for select using (
  exists (
    select 1 from modulos m
    join matriculas mt on mt.curso_id = m.curso_id
    where m.id = quizzes.modulo_id and mt.usuario_id = auth.uid() and mt.status = 'ativa'
  )
);
create policy "perguntas_para_matriculados" on quiz_perguntas for select using (
  exists (
    select 1 from quizzes q
    join modulos m on m.id = q.modulo_id
    join matriculas mt on mt.curso_id = m.curso_id
    where q.id = quiz_perguntas.quiz_id and mt.usuario_id = auth.uid() and mt.status = 'ativa'
  )
);

-- Tentativas de quiz: aluno só vê/cria as próprias
create policy "ver_proprias_tentativas" on quiz_tentativas for select using (auth.uid() = usuario_id);
create policy "criar_propria_tentativa" on quiz_tentativas for insert with check (auth.uid() = usuario_id);

-- Certificados: aluno vê o próprio; validação pública é feita por uma view/RPC separada (não pela tabela direto)
create policy "ver_proprio_certificado" on certificados for select using (auth.uid() = usuario_id);

-- Pagamentos: aluno só vê os próprios (criação/atualização fica a cargo das Edge Functions, via service role)
create policy "ver_proprios_pagamentos" on pagamentos for select using (auth.uid() = usuario_id);

-- Observação: linhas de "admin"/"instrutor" (cadastrar curso, ativar matrícula manualmente, etc.)
-- usam a service role key dentro de Edge Functions, que ignora RLS — não precisa de policy de insert/update
-- para essas tabelas a partir do navegador.
