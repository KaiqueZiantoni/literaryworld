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
| Banco de dados | PostgreSQL 16 (Docker) |
| Frontend | React *(em breve)* |
| Infraestrutura | Docker Compose · Maven |
| Versionamento | Git · Conventional Commits |

##  Decisões de segurança

Segurança tratada como requisito de design, não como remendo:

- **Segredos fora do repositório** — credenciais vivem em `.env` (ignorado pelo Git); arquivos versionados referenciam apenas variáveis de ambiente (`${DB_USER}`, `${DB_PASSWORD}`)
- **Schema sob controle explícito** — `ddl-auto=validate`: o Hibernate nunca cria ou altera tabelas; toda mudança de schema será feita via migrations versionadas (Flyway)
- **Ambiente reprodutível e descartável** — banco em container com versão cravada, isolado do sistema
- Próximos passos planejados: separação de credenciais em tabela própria, hash de senha com Argon2id, JWT de vida curta + refresh token com rotação e detecção de reuso, lockout contra força bruta

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
EOF

# 3. Suba o PostgreSQL
docker compose up -d

# 4. Exporte as variáveis e rode o backend
set -a && source .env && set +a
cd backend && ./mvnw spring-boot:run
```

Teste: `curl http://localhost:8080/health` → `{"status":"UP", ...}`

> O banco expõe a porta **5433** no host (evitando conflito com instalações locais do PostgreSQL na 5432).

##  Roadmap

- [x] **Fase 0 — Fundação:** ambiente reprodutível (Docker + PostgreSQL 16), gestão de segredos, repositório com Conventional Commits
- [x] **Fase 1a — Esqueleto do backend:** Spring Boot 4.1 conectado ao banco, health check endpoint
- [ ] **Fase 1b — Autenticação segura:** Flyway, modelagem de usuários com credenciais isoladas, Argon2id, JWT + refresh token rotativo, lockout
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
| Migrations com Flyway | 🔜 |

---

*Projeto em construção ativa — cada fase é concluída com a aplicação funcional de ponta a ponta.*
