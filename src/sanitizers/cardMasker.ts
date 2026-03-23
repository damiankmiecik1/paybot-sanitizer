import { type SanitizerFn, type DetectedItem } from '../types';

// Regex łapiący numery Visa i MasterCard
// Flaga 'g' - globalny search, w wiadomości może być wiele kart
const visaMCRegEx = /(?:4[0-9]{12}(?:[0-9]{3})?)|(?:5[1-5][0-9]{14})/g


// Algorytm Luhna - walidacja numerów kart płatniczych
function luhnCheck(cardNumber: string): boolean {
    const digits = cardNumber.split('').map(d => parseInt(d, 10))
    const reversed = digits.reverse()

    // Co druga cyfra jest podwajana i jeśli wynik > 9, to odejmujemy 9
    const processed = reversed.map((digit, index) => {
        if (index % 2 === 1) {
            let doubled = digit * 2
            if (doubled > 9) {
                doubled = doubled - 9
        }
            return doubled
        } else {
            return digit
        }
    })

    // Suma przetworzonych cyfr musi być podzielna przez 10
    const sum = processed.reduce((acc, digit) => acc + digit, 0)
    return sum % 10 === 0
}

// Maskowanie karty - zostawia pierwsze i ostatnie 4 cyfry, reszta to gwiazdki
function maskCard(cardNumber: string): string {
    const first4 = cardNumber.slice(0, 4)
    const last4 = cardNumber.slice(-4)
    const cardLength = cardNumber.length
    const starCount = cardLength - 8
    const stars = '*'.repeat(starCount)
    const masked = first4 + stars + last4
    return masked
}

// Usuwa białe znaki, myślniki i kropki, by dopasować regex
function normalizeCard(text: string): string {
    return text.replace(/[\s\-\.]/g, '')
}

// Buduje regex, który znajdzie kartę w tekście z separatorami
function createCardPattern(cleanCard: string): RegExp {
    const pattern = cleanCard
        .split('')
        .join('[\\s\\-\\.]*')
        
    return new RegExp(pattern, 'g')
}

// Główna funkcja sanityzująca - przyjmuje interfejs SanitizerFn
const maskCards: SanitizerFn = (text)  => {
    
    // Normalizuje tekst, by regex złapał karty
    const normalized = normalizeCard(text)
    const matches = normalized.match(visaMCRegEx)
    if (matches === null) {
        return {sanitized: text, detectedItems: [] }
    }
    
    let sanitized = text
    const detectedItems: DetectedItem[] = []

    matches.forEach((card) => {

        // Pomija numery, które pasują do Visa/MC, ale nie przechodzą Luhna
        if (!luhnCheck(card)) {
            return
        }

        const masked = maskCard(card)

        // Podmienia w oryginalnym tekście kartę na zamaskowaną
        const pattern = createCardPattern(card)
        sanitized = sanitized.replace(pattern, masked)
        
        detectedItems.push({
            type: 'card',
            original: card,
            masked: masked
        })
    })
    return { sanitized, detectedItems }
}

export { maskCards }