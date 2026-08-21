# 📚 LiteraryWorld

> Rede social para leitores com perfil visual generativo — um "Letterboxd para livros" onde o seu mundo literário ganha forma conforme você lê.

Projeto de portfólio em desenvolvimento, construído com foco em **arquitetura limpa**, **segurança em profundidade** e **boas práticas de engenharia** desde o primeiro commit.

---

## ✨ A ideia

- **Mundo Visual Generativo** — o perfil é uma vitrine dinâmica construída a partir da densidade de gêneros lidos
- **Marcador de leitura diário** — o livro no seu "Mundo" começa como esboço e ganha cor conforme o progresso avança
- **Reviews com filtro anti-spoiler** — avaliações ofuscadas por padrão quando marcadas como spoiler
- **Algoritmo de credibilidade** — reviews ordenadas pelo peso de leitura do autor naquele gênero
- **Integração com Google Books API** — busca automatizada de dados das obras
- **Compartilhamento social** — template de imagem gerado ao finalizar um livro

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| Backend | Java 21 (Temurin) · Spring Boot 4.1 · Spring Data JPA |
| Segurança | Argon2id (Bouncy Castle) · JWT HS512 (JJWT) · Refresh tokens rotativos |
| Banco de dados | PostgreSQL 16 (Docker) · Flyway (migrations versionadas) |
| Frontend | React *(em breve)* |
| Infraestrutura | Docker Compose · Maven |
| Versionamento | Git · Conventional Commits |

## 🔐 Arquitetura de autenticação

O sistema usa o padrão de **dois tokens com responsabilidades opostas**:

| | Access Token | Refresh Token |
|---|---|---|
| Formato | JWT assinado (HS512) | 256 bits aleatórios (SecureRandom) |
| Vida útil | 15 minutos | 30 dias |
| Onde vive | Corpo da resposta (memória do cliente) | Cookie `httpOnly` + `SameSite=Strict` com path restrito |
| Estado no servidor | Stateless (só assinatura) | Registrado no banco (apenas o SHA-256) |
| Revogável | Não (expira rápido) | Sim, individualmente ou por família |

**Rotação com detecção de reuso:** cada refresh token é de uso único — ao ser usado, é revogado e substituído por um novo da mesma *família*. Se um token já revogado reaparecer, só há uma explicação: duas cópias em circulação (dono + ladrão). A resposta é a revogação em cascata da família inteira — ambos precisam autenticar de novo, e apenas quem possui a senha real recomeça o ciclo. O roubo se autodetecta e se autolimita.

**Filtro JWT com whitelist:** toda requisição passa por um filtro que exige `Bearer` token válido; rotas públicas são exceção explícita (fail secure) — endpoint novo já nasce protegido. A identidade do usuário vem sempre do token validado, nunca do corpo da requisição.

## 🛡️ Decisões de segurança

- **Credenciais isoladas do perfil público** — tabelas separadas com relação 1:1; queries de perfil nunca tocam a tabela do hash de senha
- **Senhas com Argon2id** — salt único por usuário, custo de memória configurável; a senha em texto puro nunca toca o disco
- **Refresh tokens hasheados (SHA-256)** — o banco nunca armazena o valor real; a busca por hash via índice único elimina timing attacks por design
- **DTOs nas duas direções** — records de request bloqueiam mass assignment; records de response garantem que só sai o que foi declarado
- **Validação severa de inputs** — Bean Validation com whitelist de caracteres no username e senha de 12–128 caracteres (política NIST + teto anti-DoS via hashing)
- **Anti-enumeração de contas** — e-mail inexistente e senha errada retornam a mesma resposta
- **Tratamento global de exceções** — respostas 400/401/409 estruturadas, sem stack traces; exceções de domínio próprias
- **UUIDs como identificadores públicos** — sem enumeração de recursos
- **Semântica transacional deliberada** — registro atômico (tudo-ou-nada); a revogação de família usa `noRollbackFor` para que o alarme de roubo sobreviva à exceção que o comunica
- **Segredos por variável de ambiente** — `.env` fora do Git; chave JWT de 88 bytes em hex
- **Schema sob controle explícito** — `ddl-auto=validate` + migrations Flyway auditáveis

## 🔌 API (estado atual)

| Método | Rota | Auth | Descrição | Respostas |
|---|---|---|---|---|
| GET | `/health` | pública | Health check | 200 |
| POST | `/auth/register` | pública | Registro de usuário | 201 · 400 · 409 |
| POST | `/auth/login` | pública | Login → access token + cookie de refresh | 200 · 400 · 401 |
| POST | `/auth/refresh` | cookie | Rotaciona o refresh e emite novo access token | 200 · 401 |
| GET | `/users/me` | Bearer | Perfil do usuário autenticado | 200 · 401 · 404 |

## 🚀 Rodando localmente

**Pré-requisitos:** Java 21 · Docker + Docker Compose · Git

```bash
# 1. Clone o repositório
git clone git@github.com:KaiqueZiantoni/literaryworld.git
cd literaryworld

# 2. Crie o arquivo de segredos (nunca versionado)
cat > .env << 'EOF'
DB_USER=literary_app
DB_PASSWORD=gere-uma-senha-forte-aqui
JWT_SECRET=gere-com-openssl-rand-hex-44
EOF

# 3. Suba o PostgreSQL
docker compose up -d

# 4. Exporte as variáveis e rode o backend
set -a && source .env && set +a
cd backend && ./mvnw spring-boot:run
```

Teste rápido do ciclo de autenticação:

```bash
# Registrar
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "leitor", "displayName": "Leitor", "email": "leitor@exemplo.com", "password": "uma-senha-bem-longa-123"}'

# Logar (recebe access token + cookie de refresh)
curl -i -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "leitor@exemplo.com", "password": "uma-senha-bem-longa-123"}'

# Usar o access token
curl http://localhost:8080/users/me -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

> O banco expõe a porta **5433** no host (evitando conflito com instalações locais na 5432). As migrations criam o schema automaticamente na primeira subida.

## 🗺️ Roadmap

- [x] **Fase 0 — Fundação:** ambiente reprodutível, gestão de segredos, repositório com Conventional Commits
- [x] **Fase 1a — Esqueleto do backend:** Spring Boot 4.1 conectado ao banco, health check
- [x] **Fase 1b — Base de identidade:** Flyway, credenciais isoladas, registro e login com Argon2id, tratamento global de erros
- [x] **Fase 1c — Sessões seguras:** JWT HS512 de vida curta, filtro com whitelist, refresh token em cookie httpOnly com rotação e detecção de reuso *(pendente: lockout contra força bruta)*
- [ ] **Fase 2 — Catálogo e marcador:** integração Google Books (com circuit breaker), progresso de leitura diário
- [ ] **Fase 3 — Reviews e credibilidade:** filtro anti-spoiler, ranking por especialidade de leitor
- [ ] **Fase 4 — Mundo visual e social:** perfil generativo (Canvas/SVG), imagem de compartilhamento
- [ ] **Fase 5 — Hardening e lançamento:** testes de segurança, deploy público

**Progresso estimado: ~20%** — concentrado deliberadamente na fundação de segurança e identidade que todas as features reutilizarão.

## 📈 Histórico de progresso

| Marco | Status |
|---|---|
| PostgreSQL 16 containerizado com volume persistente | ✅ |
| Backend Spring Boot 4.1 + Java 21 conectado ao banco | ✅ |
| Migrations Flyway (V1 usuários, V2 refresh tokens) | ✅ |
| Registro com Argon2id e transação atômica | ✅ |
| Login com anti-enumeração | ✅ |
| Tratamento global de exceções (400/401/409) | ✅ |
| JWT HS512 com expiração de 15 minutos | ✅ |
| Filtro de autenticação com whitelist (fail secure) | ✅ |
| `GET /users/me` com DTO de perfil público | ✅ |
| Refresh token rotativo em cookie httpOnly | ✅ |
| Detecção de reuso com revogação em cascata | ✅ |
| Lockout contra força bruta | 🔜 |
| Integração Google Books | 🔜 |

## 🧭 Dívidas técnicas conhecidas

Registradas de forma deliberada — projeto maduro não é ter zero dívida, é saber quais são:

- Ativar o lockout de força bruta (campos `failed_attempts`/`locked_until` já modelados desde a V1)
- `Secure=true` no cookie de refresh em produção (exige HTTPS; marcado com TODO no código)
- Migrar exceções genéricas de conflito para exceções de domínio nomeadas (padrão iniciado com `InvalidCredentialsException`)
- Substituir UUID v4 por UUID v7 (ordenável temporalmente, melhor localidade de índice)
- Alinhar o JDK da IDE ao Java 21 declarado no projeto
- Rate limiting nos endpoints de autenticação

---

*Projeto em construção ativa — cada fase é concluída com a aplicação funcional de ponta a ponta.*
