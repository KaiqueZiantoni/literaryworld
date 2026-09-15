# Publicando o LiteraryWorld

Frontend na **Vercel**, API no **Render**, banco no **Neon**. Tudo em plano
gratuito. Leva cerca de 40 minutos na primeira vez.

## Por que estes três

A Vercel não executa Spring Boot — ela serve o frontend. A API precisa de um
lugar que rode contêiner, e o Render faz isso de graça. O banco fica no Neon
porque **o Postgres gratuito do Render é apagado 30 dias depois de criado**, e
uma vitrine de portfólio não pode quebrar sozinha em um mês.

O preço do plano gratuito do Render é a hibernação: sem tráfego por 15 minutos,
o contêiner desliga. A próxima visita espera a partida da JVM. A interface
avisa isso em texto depois de 3,5 segundos de espera, para a demora parecer o
que é em vez de parecer travamento.

---

## 1. Banco (Neon)

1. Crie uma conta em [neon.tech](https://neon.tech) e um projeto chamado
   `literaryworld`.
2. Copie a *connection string*. Ela vem no formato do driver nativo:

   ```
   postgresql://usuario:senha@ep-algo-123.us-east-2.aws.neon.tech/literaryworld?sslmode=require
   ```

3. **Converta para JDBC**, que é o formato que o Spring espera, separando o
   usuário e a senha:

   | variável | valor |
   |---|---|
   | `DATABASE_URL` | `jdbc:postgresql://ep-algo-123.us-east-2.aws.neon.tech/literaryworld?sslmode=require` |
   | `DB_USER` | `usuario` |
   | `DB_PASSWORD` | `senha` |

   Esquecer o `jdbc:` ou deixar as credenciais dentro da URL é o erro mais comum
   aqui — o Flyway sobe e falha na conexão.

As sete migrations rodam sozinhas na primeira subida e criam o schema com os
15 gêneros semeados.

## 2. API (Render)

1. Em [render.com](https://render.com), **New → Blueprint** e aponte para este
   repositório. Ele lê o `render.yaml` da raiz.
2. O Render vai pedir os valores marcados como `sync: false`:
   - `DATABASE_URL`, `DB_USER`, `DB_PASSWORD` — do passo anterior
   - `GOOGLE_BOOKS_API_KEY` — a sua chave
   - `CORS_ALLOWED_ORIGINS` — deixe `https://*.vercel.app` por enquanto; o
     passo 4 aperta isso
3. O `JWT_SECRET` é gerado pelo próprio Render. Ele é diferente do seu local,
   então as sessões de desenvolvimento não valem em produção — que é o certo.
4. Aguarde o build. A imagem sobe em torno de 260 MB de memória, dentro dos
   512 MB do plano gratuito.
5. Confira: `https://SEU-APP.onrender.com/health` deve responder 200.

## 3. Frontend (Vercel)

1. Em [vercel.com](https://vercel.com), **Add New → Project** e importe o
   repositório.
2. **Root Directory: `frontend`** — sem isso a Vercel tenta compilar a raiz e
   falha.
3. Variável de ambiente:

   | variável | valor |
   |---|---|
   | `VITE_API_URL` | `https://SEU-APP.onrender.com` |

   Sem barra no final.
4. Deploy. O `vercel.json` já cuida do roteamento da SPA, então `/u/alguem`
   abre direto em vez de dar 404.

## 4. Fechando o CORS

Com o domínio da Vercel em mãos, volte ao Render e troque
`CORS_ALLOWED_ORIGINS` pelo endereço exato:

```
https://literaryworld.vercel.app
```

Deixar `https://*.vercel.app` autoriza **qualquer** aplicação hospedada na
Vercel a chamar sua API com credenciais. Para uma vitrine o risco é baixo, e
fechar custa um clique.

Para manter os previews funcionando, liste os dois separados por vírgula:

```
https://literaryworld.vercel.app,https://literaryworld-*-seu-usuario.vercel.app
```

## 5. Primeiro acesso

O banco nasce vazio: sua conta local não existe lá. Cadastre-se de novo, agora
com um e-mail real — em produção `EMAIL_TRUSTED_DOMAINS` fica vazio, então
`@teste.com` é recusado pela checagem de MX no DNS.

---

## O que ainda falta para isto ser "produção"

Registrado aqui de propósito, do mesmo jeito que as dívidas do README:

- **Rate limiting.** Não existe. Um endpoint público de cadastro sem ele aceita
  quantas tentativas alguém quiser disparar. É a primeira coisa a fazer se o
  link circular.
- **Verificação de posse do e-mail.** A validação garante que o endereço pode
  existir; o link de confirmação ainda depende de SMTP.
- **Hibernação.** Resolvida de verdade só com plano pago ou com uma VM sempre
  ligada, como a do Oracle Cloud Always Free.
- **Capas.** Vêm da Google Books. Se eles mudarem a política, o app degrada
  para a capa tipográfica sem quebrar.
