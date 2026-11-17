
FROM gcc:latest

WORKDIR /app

COPY backend/main.c .

RUN gcc -std=c99 main.c -o parking

CMD ["./parking"]
