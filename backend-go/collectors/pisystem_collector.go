package collectors

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type PISystemClient struct {
	BaseURL  string
	Username string
	Password string
	Client   *http.Client
}

type PIDataPoint struct {
	Timestamp time.Time
	Value     float64
	Unit      string
}

func NewPISystemClient(baseURL, username, password string) *PISystemClient {
	return &PISystemClient{
		BaseURL:  baseURL,
		Username: username,
		Password: password,
		Client:   &http.Client{Timeout: 30 * time.Second},
	}
}

func (p *PISystemClient) GetCurrentValue(tag string) (*PIDataPoint, error) {
	url := fmt.Sprintf("%s/piwebapi/datapoints/%s/value", p.BaseURL, tag)

	req, _ := http.NewRequest("GET", url, nil)
	req.SetBasicAuth(p.Username, p.Password)

	resp, err := p.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data struct {
		Value     float64 `json:"Value"`
		Unit      string  `json:"UnitAbbreviation"`
		Timestamp string  `json:"Timestamp"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	t, _ := time.Parse(time.RFC3339, data.Timestamp)
	return &PIDataPoint{
		Timestamp: t,
		Value:     data.Value,
		Unit:      data.Unit,
	}, nil
}
