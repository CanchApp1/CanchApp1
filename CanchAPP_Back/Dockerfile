# --- ETAPA DE COMPILACIÓN ---
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copiamos el archivo pom.xml y descargamos las dependencias
COPY pom.xml .
RUN mvn dependency:go-offline

# Copiamos el código fuente y generamos el .jar
COPY src ./src
RUN mvn clean package -DskipTests

# --- ETAPA DE EJECUCIÓN ---
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copiamos el .jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]