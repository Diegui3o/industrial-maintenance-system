package collectors

import (
	"time"

	"github.com/go-ping/ping"
)

type PingResult struct {
	Success bool
	Latency float64 // ms
}

func Ping(ip string, timeout time.Duration) (*PingResult, error) {
	pinger, err := ping.NewPinger(ip)
	if err != nil {
		return nil, err
	}
	pinger.Count = 1
	pinger.Timeout = timeout
	pinger.SetPrivileged(true)

	err = pinger.Run()
	if err != nil {
		return nil, err
	}

	stats := pinger.Statistics()
	return &PingResult{
		Success: stats.PacketsRecv > 0,
		Latency: float64(stats.AvgRtt.Milliseconds()),
	}, nil
}

func PingWithRetries(ip string, timeout time.Duration, retries int) (bool, float64) {
	successCount := 0
	totalLatency := 0.0

	for i := 0; i < retries; i++ {
		result, err := Ping(ip, timeout)
		if err != nil {
			continue
		}
		if result.Success {
			successCount++
			totalLatency += result.Latency
		}
		time.Sleep(1 * time.Second)
	}

	if successCount == 0 {
		return false, 0
	}

	avgLatency := totalLatency / float64(successCount)
	return successCount >= retries/2+1, avgLatency
}
