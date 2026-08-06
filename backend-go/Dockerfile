FROM golang:latest AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o mantenimiento ./cmd/main.go

FROM alpine:latest
WORKDIR /app

RUN sed -i 's/https:/http:/g' /etc/apk/repositories && \
    apk update --no-cache && \
    apk add --no-cache ca-certificates && \
    update-ca-certificates && \
    # Volvemos a poner los repositorios seguros
    sed -i 's/http:/https:/g' /etc/apk/repositories

COPY --from=builder /app/mantenimiento .
EXPOSE 1883
CMD ["./mantenimiento"]