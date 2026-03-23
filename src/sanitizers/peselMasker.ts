import { type SanitizerFn, type DetectedItem } from '../types';

// Regex łapiący 11 cyfr (tyle ile ma PESEL)
const peselRegEx = /\b\d{11}\b/g

// Walidacja czy data urodzenia w PESELu jest poprawna
function isValidBirthDate(pesel: string): boolean {
    const year = parseInt(pesel.slice(0, 2), 10)
    const month = parseInt(pesel.slice(2, 4), 10)
    const day = parseInt(pesel.slice(4, 6), 10)
    
    // Odejmuje 20 od miesiąca dla osób z XXI wieku
    const actualMonth = month > 20 ? month - 20 : month
    
    if (actualMonth < 1 || actualMonth > 12) {
        return false
    }
    
    // Uproszczona walidacja dnia
    if (day < 1 || day > 31) {
        return false
    }
    
    return true
}

// Suma kontrolna PESEL - analogicznie do Luhna, ale inny algorytm
function checkPeselChecksum(pesel: string): boolean {
    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
    const digits = pesel.split('').map(d => parseInt(d, 10))
    
    let sum = 0
    for (let i = 0; i < 10; i++) {
        sum += digits[i] * weights[i]
    }
    
    // Ostatnia cyfra PESEL to cyfra kontrolna
    const checksum = (10 - (sum % 10)) % 10
    
    return checksum === digits[10]
}

// Maskuje PESEL zostawiając datę urodzenia
function maskPeselNumber(pesel: string): string {
    const dateOfBirth = pesel.slice(0, 6)
    const masked = dateOfBirth + '*****'
    return masked
}

// Pełna walidacja PESEL - długość, data urodzenia i suma kontrolna
function validatePesel(pesel: string): boolean {
    if (pesel.length !== 11) {
        return false
    }
    
    if (!isValidBirthDate(pesel)) {
        return false
    }
    
    if (!checkPeselChecksum(pesel)) {
        return false
    }
    
    return true
}

// Główna funkcja sanityzująca - szuka 11 cyfrowych ciągów, waliduje i maskuje
const maskPesel: SanitizerFn = (text) => {
    const matches = text.match(peselRegEx)
    
    if (matches === null) {
        return { sanitized: text, detectedItems: [] }
    }
    
    let sanitized = text
    const detectedItems: DetectedItem[] = []

    matches.forEach((pesel) => {
        if (!validatePesel(pesel)) {
            return
        }

        const masked = maskPeselNumber(pesel)
        sanitized = sanitized.replace(pesel, masked)
        
        detectedItems.push({
            type: 'pesel',
            original: pesel,
            masked: masked
        })
    })
    
    return { sanitized, detectedItems }
}

export { maskPesel }