# 📚 LiteraryWorld

> Rede social para leitores com perfil visual generativo — um "Letterboxd para livros" onde o seu mundo literário ganha forma conforme você lê.

Projeto de portfólio em desenvolvimento, construído com foco em **arquitetura limpa**, **segurança em profundidade** e **boas práticas de engenharia** desde o primeiro commit.

---

##  A ideia

- **Mundo Visual Generativo** — o perfil é uma vitrine dinâmica construída a partir da densidade de gêneros lidos
- **Marcador de leitura diário** — o livro no seu "Mundo" começa como esboço e ganha cor conforme o progresso avança
- **Reviews com filtro anti-spoiler** — avaliações ofuscadas por padrão quando marcadas como spoiler
- **Algoritmo de credibilidade** — reviews ordenadas pelo peso de leitura do autor naquele gênero
- **Integração com Google Books API** — busca automatizada de dados das obras
- **Compartilhamento social** — template de imagem gerado ao finalizar um livro

##  Stack

| Camada | Tecnologia |
|---|---|
| Backend | Java 21 (Temurin) · Spring Boot 4.1 · Spring Data JPA |
| Segurança | Argon2id (Spring Security Crypto + Bouncy Castle) · Bean Validation |
| Banco de dados | PostgreSQL 16 (Docker) · Flyway (migrations versionadas) |
| Frontend | React *(em breve)* |
| Infraestrutura | Docker Compose · Maven |
| Versionamento | Git · Conventional Commits |

##  Decisões de segurança

Segurança tratada como requisito de design, não como remendo:

- **Credenciais isoladas do perfil público** — `users` e `user_credentials` são tabelas separadas com relação 1:1; as queries de perfil, reviews e rankings nunca tocam a tabela que contém o hash de senha, eliminando por design o vazamento por `SELECT *` descuidado
- **Senhas com Argon2id** — vencedor da Password Hashing Competition, com salt único por usuário e custo de memória configurável; a senha em texto puro nunca toca o disco
- **DTOs contra Mass Assignment** — a API só aceita os campos explicitamente declarados nos records de request; entidades nunca fazem binding direto de JSON
- **Validação severa de inputs** — Bean Validation em todos os campos de entrada, incluindo whitelist de caracteres no username (`[a-zA-Z0-9_]`) e senha de 12 a 128 caracteres (política NIST: comprimento sobre complexidade; teto contra DoS via hashing)
- **Anti-enumeração de contas** — login com e-mail inexistente e senha errada retornam a mesma resposta "credenciais inválidas"
- **Tratamento global de exceções** — respostas de erro estruturadas e semanticamente corretas (400/401/409), sem vazar stack traces ou detalhes internos
- **UUIDs como identificadores públicos** — impossibilita enumeração de recursos via IDs sequenciais
- **Lockout modelado desde o schema** — campos de tentativas falhas e bloqueio temporário já nascem no banco
- **Soft delete** — exclusão lógica via `deleted_at`, preparada para conformidade com LGPD
- **Segredos fora do repositório** — credenciais em `.env` (ignorado pelo Git); arquivos versionados referenciam apenas variáveis de ambiente
- **Schema sob controle explícito** — `ddl-auto=validate`: o Hibernate valida mas nunca altera; toda mudança de schema é uma migration Flyway versionada e auditável
- Próximos passos planejados: JWT de vida curta + refresh token em cookie httpOnly com rotação e detecção de reuso, ativação do lockout, rate limiting

##  API (estado atual)

| Método | Rota | Descrição | Respostas |
|---|---|---|---|
| GET | `/health` | Health check | 200 |
| POST | `/auth/register` | Registro de usuário | 201 · 400 (validação) · 409 (duplicata) |
| POST | `/auth/login` | Autenticação por e-mail e senha | 200 · 400 · 401 |

##  Rodando localmente

**Pré-requisitos:** Java 21 · Docker + Docker Compose · Git

```bash
# 1. Clone o repositório
git clone git@github.com:KaiqueZiantoni/literaryworld.git
cd literaryworld

# 2. Crie o arquivo de segredos (nunca versionado)
cat > .env << 'EOF'
DB_USER=literary_app
DB_PASSWORD=gere-uma-senha-forte-aqui
EOF

# 3. Suba o PostgreSQL
docker compose up -d

# 4. Exporte as variáveis e rode o backend
set -a && source .env && set +a
cd backend && ./mvnw spring-boot:run
```

Teste rápido:

```bash
# Health check
curl http://localhost:8080/health

# Registrar um usuário
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "leitor", "displayName": "Leitor", "email": "leitor@exemplo.com", "password": "uma-senha-bem-longa-123"}'
```

> O banco expõe a porta **5433** no host (evitando conflito com instalações locais do PostgreSQL na 5432). As migrations Flyway criam o schema automaticamente na primeira subida.

## 🗺️ Roadmap

- [x] **Fase 0 — Fundação:** ambiente reprodutível (Docker + PostgreSQL 16), gestão de segredos, repositório com Conventional Commits
- [x] **Fase 1a — Esqueleto do backend:** Spring Boot 4.1 conectado ao banco, health check endpoint
- [x] **Fase 1b — Base de identidade:** Flyway, modelagem de usuários com credenciais isoladas, registro e login com Argon2id, tratamento global de erros
- [ ] **Fase 1c — Sessões seguras:** JWT de vida curta, refresh token em cookie httpOnly com rotação e detecção de reuso, lockout contra força bruta
- [ ] **Fase 2 — Catálogo e marcador:** integração Google Books (com circuit breaker), progresso de leitura diário
- [ ] **Fase 3 — Reviews e credibilidade:** filtro anti-spoiler, ranking por especialidade de leitor
- [ ] **Fase 4 — Mundo visual e social:** perfil generativo (Canvas/SVG), imagem de compartilhamento
- [ ] **Fase 5 — Hardening e lançamento:** testes de segurança, deploy público

## 📈 Histórico de progresso

| Marco | Status |
|---|---|
| PostgreSQL 16 containerizado com volume persistente | ✅ |
| Segredos isolados do versionamento | ✅ |
| Backend Spring Boot 4.1 + Java 21 | ✅ |
| Conexão backend ↔ banco via variáveis de ambiente | ✅ |
| Primeiro endpoint (`GET /health`) | ✅ |
| Migrations com Flyway (V1: users + user_credentials) | ✅ |
| Entidades JPA validadas contra o schema | ✅ |
| Registro de usuário com Argon2id e transação atômica | ✅ |
| Login com verificação de hash e anti-enumeração | ✅ |
| Tratamento global de exceções (400/401/409) | ✅ |
| JWT + refresh token httpOnly | 🔜 |

##  Dívidas técnicas conhecidas

Registradas de forma deliberada — projeto maduro não é ter zero dívida, é saber quais são:

- Migrar exceções genéricas de conflito para exceções de domínio nomeadas (padrão já iniciado com `InvalidCredentialsException`)
- Substituir UUID v4 por UUID v7 (ordenável temporalmente, melhor localidade de índice)
- Alinhar o JDK da IDE ao Java 21 declarado no projeto

---

*Projeto em construção ativa — cada fase é concluída com a aplicação funcional de ponta a ponta.*
