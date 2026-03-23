interface ValidationResult {
    valid: boolean
    reason?: string
}

// Walidacja wiadomości przed pipeline
function validateMessage(text: string): ValidationResult {
    // trim() usuwa białe znaki, aby taką wiadomość traktować jako pustą
    if (text.trim() === '') {
        return { valid: false, reason: 'Wiadomość nie może być pusta' }
    }
    
    if (text.length > 2000) {
        return { valid: false, reason: 'Wiadomość za długa (max 2000 znaków)' }
    }
    
    return { valid: true }
}

export { validateMessage, type ValidationResult }