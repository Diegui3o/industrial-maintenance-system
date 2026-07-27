package engine

type ConditionEvaluator struct{}

func (e *ConditionEvaluator) Evaluate(umbralMin, umbralMax *float64, valor float64) (string, bool) {
	if umbralMin != nil && valor < *umbralMin {
		return "bajo", true
	}
	if umbralMax != nil && valor > *umbralMax {
		return "alto", true
	}
	return "normal", false
}

func (e *ConditionEvaluator) EvaluatePingState(failedAttempts, maxRetries int, equipoID int) (string, bool) {
	if failedAttempts == 0 {
		return "activo", false
	}
	if failedAttempts < maxRetries {
		return "inestable", false
	}
	return "inactivo", true
}
