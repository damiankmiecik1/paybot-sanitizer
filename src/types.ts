// Typy danych wrażliwych - karty i PESEL
type SensitiveDataType = 'card' | 'pesel'

// Wykryty obiekt wrażliwy - zawiera oryginalną wartość i zamaskowaną
interface DetectedItem {
    type: SensitiveDataType
    original: string
    masked: string
}

// Discriminated union dla wyniku pipeline
interface PipelineReady {
    status: 'ready'                 // Pole dostępne po sprawdzeniu statusu
    content: string                 // Wiadomość po sanityzacji
    detectedItems: DetectedItem[]   // Tablica tego co zostało zamaskowane
}

interface PipelineRejected {        
    status: 'rejected'              // Pole dostępne po sprawdzeniu statusu
    reason: string                  // Powód odrzucenia
}

type PipelineResult = PipelineReady | PipelineRejected

// Typ funkcji sanityzujących - przyjmuje tekst, zwraca zamieniony + listę tego co znalazł
// Pipeline może trzymać sanitizery w tablicy i iterować po nich
type SanitizerFn = (text: string) => { sanitized: string, detectedItems: DetectedItem[] }

export { type SensitiveDataType, type PipelineResult, type SanitizerFn, type DetectedItem }