# Plataforma de Cursos — `app/`

Este diretório é a plataforma de aulas do pense.ead (área logada), separada do site institucional na raiz do repositório. Veja o plano técnico completo em `../docs/plano-tecnico-plataforma-cursos.md`.

## Como rodar localmente

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No SQL Editor do projeto, rode o conteúdo de `schema.sql`.
3. Copie `js/config.example.js` para `js/config.js` e preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` (em Project Settings → API). Adicione `app/js/config.js` ao `.gitignore` do repositório.
4. Abra `pages/login.html` com um servidor local (ex: extensão "Live Server" do VS Code, ou `npx serve`) — não abra o arquivo direto pelo `file://`, porque os módulos ES (`import`) exigem um servidor HTTP.
5. Cadastre um curso de teste direto pelo Supabase Studio (tabelas `categorias`, `cursos`, `modulos`, `aulas`) até o painel admin existir (fase 4 do roadmap).

## Estrutura

```
app/
├── schema.sql                 # tabelas + RLS do Supabase
├── js/
│   ├── config.example.js      # copie para config.js e preencha
│   ├── supabaseClient.js      # cliente único do Supabase
│   ├── auth-guard.js          # protege páginas e expõe o usuário logado
│   └── api/
│       ├── cursos.js          # acesso a dados de cursos/módulos/aulas
│       └── progresso.js       # marcar/consultar progresso do aluno
├── css/
│   └── app.css                # estilo mínimo, sem framework
└── pages/
    ├── login.html
    ├── cadastro.html
    ├── dashboard.html          # "meus cursos" com barra de progresso
    ├── curso.html              # módulos/aulas do curso (ou matrícula)
    └── aula.html               # player do YouTube + progresso automático
```

## O que falta (próximas fases — ver o plano técnico)

- Quizzes e certificado automático (Edge Function + página pública de validação)
- Checkout Mercado Pago + webhook de liberação de acesso para cursos pagos
- Painel admin para cadastrar cursos/módulos/aulas sem usar o Supabase Studio
