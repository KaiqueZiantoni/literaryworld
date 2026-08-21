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
| Integrações | Google Books API via RestClient (com contrato de resiliência) |
| Banco de dados | PostgreSQL 16 (Docker) · Flyway (5 migrations versionadas) |
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

**Rotação com detecção de reuso:** cada refresh token é de uso único — ao ser usado, é revogado e substituído por um novo da mesma *família*. Se um token já revogado reaparecer, há duas cópias em circulação (dono + ladrão): a família inteira é revogada em cascata e apenas quem possui a senha real recomeça o ciclo. O roubo se autodetecta e se autolimita.

**Lockout contra força bruta:** 5 falhas de senha trancam a conta por 15 minutos, com destravamento automático por tempo. A conta trancada responde o mesmo erro genérico de sempre — nenhuma informação vaza para o atacante.

**Filtro JWT com whitelist (fail secure):** toda requisição exige `Bearer` token válido; rotas públicas são exceção explícita — endpoint novo já nasce protegido. A identidade vem sempre do token validado, nunca do corpo da requisição.

## 📖 Funcionalidades do produto (estado atual)

- **Busca de livros** — integração com a Google Books API, com saneamento defensivo dos dados (campos ausentes, valores inválidos) e resposta 503 quando a fonte externa falha — a indisponibilidade da Google nunca derruba o sistema
- **Acervo compartilhado (cache-aside)** — livros escolhidos pelos usuários são cadastrados uma única vez, com rastreabilidade de quem adicionou (`added_by`) e validação severa em camadas contra dados falsos
- **Estante pessoal** — cada usuário organiza suas leituras por status (`QUERO_LER`, `LENDO`, `LIDO`, `ABANDONADO`), com transições automáticas (primeiro progresso promove QUERO_LER → LENDO e carimba a data de início)
- **Marcador de leitura diário** — registro de progresso com a regra de um log por dia (releituras no mesmo dia atualizam a linha existente), base das futuras estatísticas e do Mundo Visual

## 🛡️ Decisões de segurança

- **Credenciais isoladas do perfil público** — tabelas separadas 1:1; queries de perfil nunca tocam o hash de senha
- **Senhas com Argon2id** — salt único, custo de memória configurável; senha em texto puro nunca toca o disco
- **Refresh tokens hasheados (SHA-256)** — busca por hash via índice único elimina timing attacks por design
- **Proteção anti-IDOR nas consultas** — recursos pessoais são buscados sempre por `id + userId` do token: o registro de outro usuário simplesmente "não existe" para quem pergunta
- **DTOs nas duas direções** — records de request bloqueiam mass assignment; records de response garantem que só sai o que foi declarado
- **Validação severa de inputs** — Bean Validation em toda entrada, incluindo whitelists de caracteres, faixas numéricas sãs e URLs de capa restritas a `http(s)` (bloqueio de XSS via atributo)
- **Enums como whitelist de domínio** — status de leitura inválidos são rejeitados na desserialização, antes de qualquer lógica
- **Anti-enumeração de contas** — e-mail inexistente, senha errada e conta trancada retornam a mesma resposta
- **Tratamento global de exceções** — respostas 400/401/404/409/503 estruturadas, sem stack traces
- **UUIDs como identificadores públicos** — sem enumeração de recursos
- **Semântica transacional deliberada** — `noRollbackFor` garante que registros de segurança (falhas de login, revogação de família) sobrevivem às exceções que os comunicam
- **Segredos por variável de ambiente** — `.env` fora do Git (banco, chave JWT, chave da Google)
- **Schema sob controle explícito** — `ddl-auto=validate` + migrations Flyway auditáveis

## 🔌 API (estado atual)

| Método | Rota | Auth | Descrição | Respostas |
|---|---|---|---|---|
| GET | `/health` | pública | Health check | 200 |
| POST | `/auth/register` | pública | Registro de usuário | 201 · 400 · 409 |
| POST | `/auth/login` | pública | Login → access token + cookie de refresh | 200 · 400 · 401 |
| POST | `/auth/refresh` | cookie | Rotaciona o refresh e emite novo access token | 200 · 401 |
| GET | `/users/me` | Bearer | Perfil do usuário autenticado | 200 · 401 · 404 |
| GET | `/catalog/search?q=` | Bearer | Busca livros na Google Books | 200 · 400 · 503 |
| POST | `/catalog/books` | Bearer | Cadastra livro no acervo (cache-aside) | 201 · 400 |
| POST | `/shelf` | Bearer | Adiciona livro à estante pessoal | 201 · 400 · 404 |
| PATCH | `/shelf/{id}/progress` | Bearer | Atualiza o marcador de leitura diário | 200 · 400 · 404 |
| GET | `/shelf` | Bearer | Lista a estante do usuário | 200 |

## 🚀 Rodando localmente

**Pré-requisitos:** Java 21 · Docker + Docker Compose · Git · Chave da Google Books API ([console.cloud.google.com](https://console.cloud.google.com), gratuita)

```bash
# 1. Clone o repositório
git clone git@github.com:KaiqueZiantoni/literaryworld.git
cd literaryworld

# 2. Crie o arquivo de segredos (nunca versionado)
cat > .env << 'EOF'
DB_USER=literary_app
DB_PASSWORD=gere-uma-senha-forte-aqui
JWT_SECRET=gere-com-openssl-rand-hex-44
GOOGLE_BOOKS_API_KEY=sua-chave-do-google-cloud
EOF

# 3. Suba o PostgreSQL
docker compose up -d

# 4. Exporte as variáveis e rode o backend
set -a && source .env && set +a
cd backend && ./mvnw spring-boot:run
```

> O banco expõe a porta **5433** no host (evitando conflito com instalações locais na 5432). As 5 migrations criam o schema e semeiam o catálogo de 15 gêneros automaticamente.

## 🗺️ Roadmap e progresso

**Progresso estimado: ~35%**

- [x] **Fase 0 — Fundação** *(100%)*: ambiente reprodutível, gestão de segredos, Conventional Commits
- [x] **Fase 1 — Identidade e sessões seguras** *(100%)*: registro e login com Argon2id, JWT HS512, filtro fail-secure, refresh token rotativo com detecção de reuso, lockout contra força bruta
- [x] **Fase 2 — Catálogo e marcador** *(~90%)*: busca resiliente na Google Books, acervo com cache-aside e rastreabilidade, estante pessoal, marcador diário com regra de um log por dia *(pendente: conclusão automática ao atingir a última página, estatísticas de leitura)*
- [ ] **Fase 3 — Reviews e credibilidade**: filtro anti-spoiler, ranking por especialidade de leitor
- [ ] **Fase 4 — Mundo visual e social**: perfil generativo (Canvas/SVG), imagem de compartilhamento
- [ ] **Fase 5 — Hardening e lançamento**: HTTPS, testes de segurança, deploy público
- [ ] **Frontend React**: toda a interface

## 📈 Marcos concluídos

| Marco | Status |
|---|---|
| PostgreSQL 16 containerizado · segredos fora do Git | ✅ |
| Backend Spring Boot 4.1 + Java 21 · 5 migrations Flyway | ✅ |
| Registro (Argon2id) · Login (anti-enumeração) · Lockout | ✅ |
| JWT HS512 · Filtro fail-secure · `GET /users/me` | ✅ |
| Refresh token rotativo · detecção de reuso em cascata | ✅ |
| Busca Google Books com resiliência (503, saneamento) | ✅ |
| Acervo cache-aside com `added_by` e validação em camadas | ✅ |
| Estante pessoal com enum de status e anti-IDOR | ✅ |
| Marcador diário (um log por dia, releitura atualiza) | ✅ |
| Conclusão automática de leitura · estatísticas | 🔜 |
| Reviews com anti-spoiler | 🔜 |

## 🧭 Dívidas técnicas conhecidas

Registradas de forma deliberada — projeto maduro não é ter zero dívida, é saber quais são:

- Conclusão automática da leitura ao atingir a página final (`finish()` já existe na entidade)
- Validação do progresso contra o total de páginas do livro
- `Secure=true` no cookie de refresh em produção (exige HTTPS; TODO no código)
- Circuit breaker na integração Google Books (hoje: contrato Optional + 503)
- Exceções de domínio nomeadas para conflitos (padrão iniciado com `InvalidCredentialsException`)
- UUID v7 no lugar do v4 · JDK da IDE alinhado ao 21 · Rate limiting nos endpoints públicos
- Endpoint `GET /shelf` sem dados do livro (título/capa) — exigirá join ou resposta composta

---

*Projeto em construção ativa — cada fase é concluída com a aplicação funcional de ponta a ponta.*
