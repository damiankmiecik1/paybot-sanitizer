import { type PipelineResult, type DetectedItem } from './types'
import { validateMessage } from './validators/messageValidator'
import { maskCards } from './sanitizers/cardMasker'
import { maskPesel } from './sanitizers/peselMasker'

// Główna funkcja modułu - przepuszcza wiadomość przez walidację i sanityhzację
// Zwraca discriminated union: albo 'ready' z oczyszczoną treścią, albo 'rejected' z powodem
function processPipeline(text: string): PipelineResult {
    // Walidacja - czyh wiadomość nadaje się do przetworzenia
    const validation = validateMessage(text)
    
    if (!validation.valid) {
        return { 
            status: 'rejected', 
            reason: validation.reason || 'Nieprawidłowa wiadomość' 
        }
    }
    
    // Sanityzacja - tablica funkcji, które po kolei przetwarzają tekst
    const sanitizers = [maskCards, maskPesel]
    
    let sanitized = text
    const allDetectedItems: DetectedItem[] = []
    
    // Każdy sanitizer dostaje tekst po poprzednim
    for (const sanitizer of sanitizers) {
        const result = sanitizer(sanitized)
        sanitized = result.sanitized
        allDetectedItems.push(...result.detectedItems)
    }
    
    return { 
        status: 'ready', 
        content: sanitized, 
        detectedItems: allDetectedItems 
    }
}

export { processPipeline }