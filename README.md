# 📚 LiteraryWorld

> Rede social para leitores com perfil visual generativo — um "Letterboxd para livros" onde o seu mundo literário ganha forma conforme você lê.

Projeto de portfólio em desenvolvimento, construído com foco em **arquitetura limpa**, **segurança em profundidade** e **boas práticas de engenharia** desde o primeiro commit.

**🏁 Status: backend de produto completo + frontend navegável** — 17 endpoints cobrindo identidade, catálogo, leitura e camada social, com a estante e o Mundo Visual explorável já em React/TypeScript. Em desenvolvimento: maturação para produção.

---

## ✨ O produto

- **Mundo Visual Generativo** — mapa explorável em pixel art: cada gênero lido ergue uma vila com paleta própria, e cada livro concluído vira um marco de cenário do seu gênero ✅
- **Marcador de leitura diário** — progresso registrado dia a dia; o livro "ganha cor" conforme avança ✅
- **Reviews com filtro anti-spoiler** — avaliações de até 1000 caracteres, ofuscadas por padrão quando marcadas como spoiler ✅
- **Algoritmo de credibilidade** — reviews ordenadas pelo peso de leitura do autor nos gêneros do livro ✅
- **Integração Google Books** — busca de obras com resiliência a falhas da fonte ✅
- **Compartilhamento social** — link público do mundo, copiável direto do mapa ✅

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| Backend | Java 21 (Temurin) · Spring Boot 4.1 · Spring Data JPA |
| Segurança | Argon2id (Bouncy Castle) · JWT HS512 (JJWT) · Refresh tokens rotativos |
| Integrações | Google Books API via RestClient |
| Banco de dados | PostgreSQL 16 (Docker) · Flyway (7 migrations versionadas) |
| Frontend | React 19 + TypeScript · Vite · Tailwind 4 · SVG em pixel art |
| Infraestrutura | Docker Compose · Maven |
| Versionamento | Git · Conventional Commits |

## 🔐 Arquitetura de autenticação

Padrão de **dois tokens com responsabilidades opostas**:

| | Access Token | Refresh Token |
|---|---|---|
| Formato | JWT assinado (HS512) | 256 bits aleatórios (SecureRandom) |
| Vida útil | 15 minutos | 30 dias |
| Onde vive | Corpo da resposta (memória do cliente) | Cookie `httpOnly` + `SameSite=Strict`, path restrito |
| Estado no servidor | Stateless | Registrado no banco (apenas SHA-256) |
| Revogável | Não (expira rápido) | Sim, individualmente ou por família |

- **Rotação com detecção de reuso:** refresh token é de uso único; reuso de um token revogado indica duas cópias em circulação (dono + ladrão) e dispara a revogação em cascata da família inteira
- **Lockout contra força bruta:** 5 falhas → conta trancada por 15 minutos, com destravamento automático e resposta indistinguível do erro comum (anti-enumeração)
- **Filtro fail-secure:** toda rota exige `Bearer` token válido; públicas são exceção explícita em whitelist — endpoint novo nasce protegido
- **Senhas:** Argon2id com salt único; política de 12–128 caracteres (NIST: comprimento sobre complexidade; teto anti-DoS)
- **Teto por origem nas rotas caras:** cadastro (Argon2id + DNS), login, refresh e busca têm limite por IP em janela fixa, com `429` e `Retry-After`. O lockout cuida de quem insiste numa conta; o teto pega quem varre muitas
- **E-mail que existe de verdade:** quatro camadas no cadastro, da mais barata para a mais cara — sintaxe estrita (TLD alfabético, sem o permissivo `a@b`), domínio reservado por RFC 2606/6761, lista de caixas descartáveis (com herança para subdomínio) e consulta de MX/A no DNS com cache e orçamento de tempo. Rede instável **aceita** o cadastro em vez de derrubá-lo; só reprova o domínio que o DNS afirma não existir

## 📖 Domínio do produto

- **Acervo compartilhado (cache-aside)** — livros cadastrados uma única vez, com rastreabilidade (`added_by`) e validação em camadas contra dados falsos
- **Gêneros por folksonomia** — catálogo próprio de 15 gêneros; a classificação vem do leitor que cadastra (as categorias da Google Books são inconsistentes demais para alimentar o produto)
- **Estante pessoal** — status `QUERO_LER / LENDO / LIDO / ABANDONADO` com transições automáticas e datas carimbadas
- **Marcador diário** — um registro por livro por dia (releituras atualizam a linha); conclusão **híbrida**: automática ao atingir a última página (com *clamp* de páginas excedentes) ou manual via endpoint dedicado
- **Placar de credibilidade** — `user_genre_stats` atualizado atomicamente na conclusão (materialização incremental), com guarda anti-inflação contra dupla contagem
- **Reviews** — uma por leitor por livro (upsert via PUT), exigindo o livro na estante; flag de spoiler para ofuscação no cliente
- **Mundo Visual (dados)** — endpoint público com densidade por gênero e progresso percentual por livro, calculado no banco

## 🔌 API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/health` | pública | Health check |
| POST | `/auth/register` | pública | Registro |
| POST | `/auth/login` | pública | Login → access token + cookie refresh |
| POST | `/auth/refresh` | cookie | Rotaciona refresh, emite novo access |
| GET | `/users/me` | Bearer | Perfil do autenticado |
| GET | `/users/{username}/world` | **pública** | Mundo Visual (vitrine social) |
| GET | `/catalog/search?q=` | Bearer | Busca na Google Books |
| GET | `/catalog/genres` | Bearer | Catálogo de gêneros |
| POST | `/catalog/books` | Bearer | Cadastra livro (cache-aside + gêneros) |
| POST | `/shelf` | Bearer | Adiciona livro à estante |
| PATCH | `/shelf/{id}/progress` | Bearer | Marcador diário |
| POST | `/shelf/{id}/finish` | Bearer | Conclusão manual |
| GET | `/shelf` | Bearer | Estante com dados dos livros (JOIN, sem N+1) |
| POST | `/shelf/{id}/reopen` | Bearer | Reabre leitura concluída (com decremento do placar) |
| DELETE | `/shelf/{id}` | Bearer | Tira o livro da estante, em cascata |
| PUT | `/books/{bookId}/review` | Bearer | Cria/edita review |
| GET | `/books/{bookId}/review` | Bearer | Reviews ordenadas por credibilidade |

## 🚀 Rodando localmente

**Pré-requisitos:** Java 21 · Docker + Compose · Git · chave da Google Books API (gratuita)

```bash
git clone git@github.com:KaiqueZiantoni/literaryworld.git
cd literaryworld

cat > .env << 'EOF'
DB_USER=literary_app
DB_PASSWORD=gere-uma-senha-forte
JWT_SECRET=gere-com-openssl-rand-hex-44
GOOGLE_BOOKS_API_KEY=sua-chave
EOF

docker compose up -d
set -a && source .env && set +a
cd backend && ./mvnw spring-boot:run
```

> Banco na porta **5433** (evita conflito com Postgres local). As migrations criam o schema e semeiam os 15 gêneros automaticamente.

## 🗺️ Roadmap — **~60%**

- [x] **Fase 0 — Fundação** · [x] **Fase 1 — Identidade e sessões** · [x] **Fase 2 — Catálogo e marcador** · [x] **Fase 3 — Reviews e credibilidade** · [x] **Fase 4 — Dados do Mundo Visual e share**
- [x] **Frontend React/TS** — entrada, estante com marcador diário e Mundo Visual explorável (SVG em pixel art, colisão, viagem rápida entre vilas)
- [ ] **Fase 5 — Maturação:** testes automatizados de integração, recuperação de senha + **verificação de posse do e-mail por link**, HTTPS/hardening, deploy público

## 🧭 Dívidas técnicas conhecidas

Registradas de forma deliberada — projeto maduro não é ter zero dívida, é saber quais são:

- Testes automatizados (cenários já mapeados pelos testes manuais: reuso de token, lockout, IDOR, clamp)
- **Posse do e-mail não é provada.** A validação de cadastro garante que o endereço *pode* existir; só o link de confirmação prova que é de quem se cadastrou. Falta o envio (SMTP) — a coluna `email_verified_at` espera desde a V1
- Recuperação de senha por token de uso único
- Exceções de domínio nomeadas (UUID malformado hoje responde 409 em vez de 400)
- Contador do rate limiting vive na memória: com duas instâncias cada uma conta metade, e aí é hora de Redis
- Hospedagem própria das capas (hoje vêm da Google Books, com degradação para capa tipográfica)
- Circuit breaker na Google Books · UUID v7 · flag de privacidade do Mundo

---

*Backend construído com decisões documentadas, ~20 bugs reais resolvidos por diagnóstico metódico, e segurança testada com ataques simulados (roubo de token, força bruta, IDOR).*
