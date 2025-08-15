# Projects Tasks API

API REST em **Node.js + TypeScript (ESM)** com **Express**, **Sequelize (sequelize-typescript) + MySQL**, **JWT** para autenticação, **Redis** opcional para cache e **integração com GitHub** para vincular os 5 últimos repositórios de um usuário a um projeto.

---

## ✨ Funcionalidades

* Registro e login com **JWT**
* CRUD básico de **Projetos** (mínimo: criar e listar do usuário autenticado)
* Integração **GitHub**:

  * `GET /projects/:id/github/:username` → Busca **5 últimos repositórios públicos** do `:username`, faz **upsert** e vincula ao `projectId`
* **Redis** opcional para cache da chamada do GitHub (TTL 5 min)
* **Logs** de requisições com *morgan* e **handler global de erros** (exibe stack em `NODE_ENV=development`)

---

## 🧱 Stack

* **Node 20** (ESM) + **TypeScript**
* **Express** + **express-async-errors**
* **Sequelize** com **sequelize-typescript** (MySQL)
* **ioredis** (opcional)
* **axios** (GitHub API)
* **jsonwebtoken**, **bcryptjs** (Auth)
* **morgan** (logs HTTP)
* Dev runner: **tsx** (watch)

---

## 📁 Estrutura de Pastas (src/)

```
src/
  config/
    sequelize.ts
  controllers/
    auth.controller.ts
    github.controller.ts
    project.controller.ts
  middlewares/
    auth.ts
  models/
    User.ts
    Project.ts
    Repo.ts
  repositories/
    user.repository.ts
    project.repository.ts
    repo.repository.ts
  routes/
    auth.routes.ts
    projects.routes.ts
    github.routes.ts
  services/
    auth.service.ts
    project.service.ts
    github.service.ts
  app.ts
  server.ts
```

---

## 🔧 Pré‑requisitos

* **Docker** e **Docker Compose** instalados
* Porta **3000** livre no host

---

## ⚙️ Configuração — Variáveis de Ambiente (`.env`)

Crie um `.env` na raiz do projeto:

```env
# App
PORT=3000
NODE_ENV=development

# DB
DB_HOST=db
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=projects_db

# Auth
JWT_SECRET=supersecreto
JWT_EXPIRES_IN=1d

# GitHub (opcional — evita rate limit anônimo)
GITHUB_TOKEN=ghp_xxx

# Redis (opcional)
REDIS_HOST=redis
REDIS_PORT=6379
```

> **Dica:** Em produção, **não** comite `.env` e armazene segredos em um cofre (AWS Secrets Manager, Doppler, etc.).

---

## 🐳 Executando com Docker Compose

Arquivo `docker-compose.yml` esperado (trecho do serviço `api` ajustado para instalar devDeps como `tsx`):

```yaml
version: "3.9"

services:
  db:
    image: mysql:8.0
    container_name: mysql-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: projects_db
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 3s
      retries: 20

  redis:
    image: redis:7-alpine
    container_name: redis-cache
    restart: always
    ports:
      - "6379:6379"

  api:
    image: node:20
    container_name: projects-tasks-api
    working_dir: /usr/src/app
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    env_file:
      - .env
    environment:
      - NODE_ENV=development
    ports:
      - "3000:3000"
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    command: sh -c "npm install --include=dev && npm run dev"

volumes:
  db_data:
```

Subir os serviços:

```bash
docker compose up
# ou em background
# docker compose up -d
```

Ver logs ao vivo:

```bash
docker compose logs -f api
```

> Se aparecer apenas “API running on port 3000”, veja a seção **Logs & Erros** abaixo para habilitar *morgan* e handler global.

---

## 📦 Scripts (package.json)

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch ./src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint . --ext .ts"
  }
}
```

## 🧩 tsconfig.json (sugestão)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

---

## 🔐 Autenticação (JWT)

* Registro: `POST /auth/register` — body `{ name, email, password }`
* Login: `POST /auth/login` — body `{ email, password }` → **retorna `{ token }`**
* Rotas protegidas exigem header: `Authorization: Bearer <TOKEN>`

**Exemplos (cURL):**

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alisson","email":"ali@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ali@example.com","password":"123456"}'
# copie o token do response
```

---

## 📚 Projetos

* **Criar projeto**: `POST /projects` *(JWT)*

  * Body: `{ "name": "Meu Projeto", "description": "Opcional" }`
* **Listar meus projetos**: `GET /projects` *(JWT)*

**Exemplos (cURL):**

```bash
# Criar
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"name":"Meu Projeto","description":"Teste GitHub"}'

# Listar
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/projects
```

> Em Dev, as tabelas são criadas com `sequelize.sync()` no `server.ts`. Para produção, utilize **migrations**.

---

## 🐙 Integração GitHub

**Rota:** `GET /projects/:id/github/:username` *(JWT)*

* Busca os **5 repositórios públicos mais recentes** de `:username`
* Faz **upsert** no MySQL (chave: `htmlUrl`)
* Vincula ao `:id` do projeto do **usuário autenticado**
* Se Redis estiver configurado, usa **cache (TTL \~300s)** por `username`

**Exemplo (cURL):**

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/projects/<PROJECT_ID>/github/<GITHUB_USERNAME>
```

**Respostas típicas:**

* `200 OK` — `{ projectId, repos: [...] }`
* `401 Unauthorized` — token ausente/inválido
* `403 Forbidden` — projeto não pertence ao usuário
* `404 Not Found` — projeto inexistente

> Para evitar **rate limit** da API do GitHub em chamadas anônimas, defina `GITHUB_TOKEN` no `.env`.

---

## 🪵 Logs & Erros (Dev)

Certifique-se de habilitar no `app.ts`:

```ts
import morgan from 'morgan';
app.use(morgan('dev'));

// Handler global
app.use((err: any, _req, res, _next) => {
  console.error('[ERROR]', err?.message, '\n', err?.stack);
  const status = err?.status || 500;
  const body: any = { message: err?.message || 'Internal server error' };
  if (process.env.NODE_ENV === 'development') body.stack = err?.stack;
  res.status(status).json(body);
});
```

Ver logs do container:

```bash
docker compose logs -f api
```

> Quando `NODE_ENV=development`, o JSON de erro inclui `stack`.

---

## 🔒 Boas Práticas de Segurança

* Nunca exponha `JWT_SECRET` em repositório
* Configure CORS, rate limiting e helmet (se necessário)
* Valide entrada (ex.: `zod`/`class-validator`)
* Use HTTPS em produção

---

## 🧪 Testes (sugestões)

* **Unitários:** services (AuthService, GithubService, ProjectService)
* **Integração:** controllers + rotas (supertest)
* **Dublês:** Axios mockado para GitHub, Redis mock

---

## 🛠️ Troubleshooting

**1) `sh: tsx: not found`**

* O container não tem devDependencies. O Compose já roda `npm install --include=dev`. Confirme a linha `command:` no serviço `api`.

**2) `Additional property api is not allowed`**

* `api` está fora de `services:` ou indentação errada. Use o `docker-compose.yml` acima e valide com `docker compose config -q`.

**3) `ERR_UNKNOWN_FILE_EXTENSION ".ts"`**

* Use `tsx` (como no script `dev`) **ou** configure `node --loader ts-node/esm`. Este projeto usa **tsx**.

**4) DB não conecta / `ECONNREFUSED`**

* Aguarde o **healthcheck** do MySQL. O serviço `api` depende de `db:service_healthy`.
* Verifique `DB_HOST=db`, `DB_USER=root`, `DB_PASSWORD=root`.

**5) `401 Invalid token` em rotas protegidas**

* Envie `Authorization: Bearer <TOKEN>` obtido em `/auth/login`.

**6) `403` no GitHub endpoint**

* O `projectId` não pertence ao usuário do token.

**7) `403` da API do GitHub / `rate limit exceeded`**

* Configure `GITHUB_TOKEN` no `.env`.

---

## 📜 Licença

MIT — use e adapte livremente.

---

## ✅ Roadmap (ideias futuras)

* Migrations com Sequelize CLI
* Paginação e filtros em `/projects`
* Validações com `zod` ou `class-validator`
* Documentação OpenAPI (Swagger)
* Rate limiting e Helmet
* Testes (Vitest) + GitHub Actions
