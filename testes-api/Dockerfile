FROM maven:3.9.9-eclipse-temurin-17

WORKDIR /workspace

COPY . .

RUN chmod +x mvnw

CMD ["./mvnw", "-B", "test"]
