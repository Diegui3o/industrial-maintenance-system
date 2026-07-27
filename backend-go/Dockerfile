FROM golang:latest AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o mantenimiento ./cmd/main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates-bundle

WORKDIR /app

COPY --from=builder /app/mantenimiento .

# Puerto
EXPOSE 1883

# Ejecutar
CMD ["./mantenimiento"]