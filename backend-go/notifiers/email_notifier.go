package notifiers

import (
	"fmt"
	"net/smtp"
)

type EmailNotifier struct {
	SMTPHost string
	SMTPPort string
	Username string
	Password string
	From     string
}

func NewEmailNotifier(host, port, username, password, from string) *EmailNotifier {
	return &EmailNotifier{
		SMTPHost: host,
		SMTPPort: port,
		Username: username,
		Password: password,
		From:     from,
	}
}

func (e *EmailNotifier) Send(to []string, subject, body string) error {
	auth := smtp.PlainAuth("", e.Username, e.Password, e.SMTPHost)

	msg := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=\"UTF-8\"\r\n\r\n%s",
		e.From, to[0], subject, body,
	)

	return smtp.SendMail(
		e.SMTPHost+":"+e.SMTPPort,
		auth,
		e.From,
		to,
		[]byte(msg),
	)
}
