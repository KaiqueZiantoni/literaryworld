# ── Compilação ────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# As dependências vêm antes do código para virarem uma camada de cache própria:
# mexer no src não obriga a baixar o mundo de novo.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ── Execução ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/target/*.jar app.jar
USER app

# O contêiner gratuito do Render tem 512 MB. MaxRAMPercentage faz a JVM
# enxergar o limite do cgroup em vez do total da máquina, e o coletor serial
# custa menos memória que o G1 em heap pequeno.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
