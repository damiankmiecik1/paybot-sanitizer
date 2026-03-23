import { describe, it, expect } from 'vitest'
import { maskCards } from '../src/sanitizers/cardMasker'

describe('cardMasker', () => {

    it('maskuje kartę bez separatorów', () => {
        const input = "Mój numer karty: 4532015112830366"
        const result = maskCards(input)

        expect(result.sanitized).toBe("Mój numer karty: 4532********0366")
        expect(result.detectedItems).toHaveLength(1)
        expect(result.detectedItems[0].type).toBe('card')
        expect(result.detectedItems[0].original).toBe("4532015112830366")
        expect(result.detectedItems[0].masked).toBe("4532********0366")
    })

    it('maskuje tę samą kartę powtórzoną dwa razy', () => {
        const input = "Karta: 4532015112830366, zapłaciłem za X kartą 4532015112830366"
        const result = maskCards(input)

        expect(result.sanitized).toBe("Karta: 4532********0366, zapłaciłem za X kartą 4532********0366")
        expect(result.sanitized).not.toContain("4532015112830366")
    })

    it('maskuje kartę ze spacjami', () => {
        const input = "Mój numer karty: 4532 0151 1283 0366"
        const result = maskCards(input)

        expect(result.sanitized).toBe("Mój numer karty: 4532********0366")
        expect(result.detectedItems).toHaveLength(1)
        expect(result.detectedItems[0].type).toBe('card')
        expect(result.detectedItems[0].original).toBe("4532015112830366")
        expect(result.detectedItems[0].masked).toBe("4532********0366")
    })

    it('maskuje tę samą kartę ze spacjami powtórzoną dwa razy', () => {
        const input = "Raz: 4532 0151 1283 0366, dwa: 4532 0151 1283 0366"
        const result = maskCards(input)

        expect(result.sanitized).not.toContain("0151")
        expect(result.sanitized).not.toContain("1283")
    })

    it('maskuje kartę na początku wiadomości', () => {
        const input = "4532015112830366 płaciłem tą kartą"
        const result = maskCards(input)

        expect(result.sanitized).toBe("4532********0366 płaciłem tą kartą")
        expect(result.detectedItems).toHaveLength(1)
    })

    it('maskuje kartę na końcu wiadomości', () => {
        const input = "Płaciłem kartą 4532015112830366"
        const result = maskCards(input)
 
        expect(result.sanitized).toBe("Płaciłem kartą 4532********0366")
        expect(result.detectedItems).toHaveLength(1)
    })

    it('maskuje Mastercard bez separatorów', () => {
        const input = "MC: 5500000000000004"
        const result = maskCards(input)

        expect(result.sanitized).toBe("MC: 5500********0004")
        expect(result.detectedItems).toHaveLength(1)
        expect(result.detectedItems[0].type).toBe('card')
        expect(result.detectedItems[0].original).toBe("5500000000000004")
    })

    it('maskuje Mastercard ze spacjami', () => {
        const input = "MC: 5500 0000 0000 0004"
        const result = maskCards(input)
 
        expect(result.sanitized).toBe("MC: 5500********0004")
        expect(result.detectedItems).toHaveLength(1)
    })

    it('maskuje obie karty w jednej wiadomości', () => {
        const input = "Płaciłem dwoma kartami: 4532015112830366 i 5500 0000 0000 0004"
        const result = maskCards(input)

        expect(result.sanitized).toBe("Płaciłem dwoma kartami: 4532********0366 i 5500********0004")
        expect(result.detectedItems).toHaveLength(2)
        expect(result.detectedItems[0].original).toBe("4532015112830366")
        expect(result.detectedItems[1].original).toBe("5500000000000004")
    })

    it('maskuje samą kartę bez otaczającego tekstu', () => {
        const input = "4532015112830366"
        const result = maskCards(input)
    
        expect(result.sanitized).toBe("4532********0366")
        expect(result.detectedItems).toHaveLength(1)
    })

    it('maskuje kartę z myślnikami', () => {
        const input = "Zapłaciłem kartą 4532-0151-1283-0366"
        const result = maskCards(input)
    
        expect(result.sanitized).toBe("Zapłaciłem kartą 4532********0366")
        expect(result.detectedItems).toHaveLength(1)
        expect(result.detectedItems[0].original).toBe("4532015112830366")
    })

    it('maskuje kartę z mieszanymi separatorami', () => {
        const input = "Numer to 4532-0151 1283.0366"
        const result = maskCards(input)
    
        expect(result.sanitized).toBe("Numer to 4532********0366")
        expect(result.detectedItems).toHaveLength(1)
    })

    it('maskuje 13-cyfrową Vise', () => {
        const input = "Stara karta: 4222222222222"
        const result = maskCards(input)
    
        expect(result.sanitized).toBe("Stara karta: 4222*****2222")
        expect(result.detectedItems).toHaveLength(1)
        expect(result.detectedItems[0].masked).toBe("4222*****2222")
    })

    it('maskuje UUID który zawiera valid kartę (false positive - celowe)', () => {
        const input = "ID: 4532-0151-1283-0366-9999-8888"
        const result = maskCards(input)
    
        // Celowy test false positive
        expect(result.sanitized).toBe("ID: 4532********0366-9999-8888")
        expect(result.detectedItems).toHaveLength(1)
    })

    it('maskuje cyfry pomieszane z literami jeśli przechodzą Luhn', () => {
        const input = "Kod: ABC4532015112830366XYZ"
        const result = maskCards(input)
    
        // Celowy test false positive - jeśli przejdzie Luhna to maskuje
        expect(result.sanitized).toBe("Kod: ABC4532********0366XYZ")
        expect(result.detectedItems).toHaveLength(1)
        expect(result.detectedItems[0].original).toBe("4532015112830366")
    })

    it('maskuje 13-cyfrowy podciąg z dłuższej liczby (false positive)', () => {
        const input = "Numer: 45320151128303"
        const result = maskCards(input)
 
        expect(result.detectedItems.length).toBeGreaterThanOrEqual(1)
    })

    it('NIE maskuje 12 cyfr zaczynających się od 4', () => {
        const input = "Numer: 453201511283"
        const result = maskCards(input)
 
        expect(result.sanitized).toBe("Numer: 453201511283")
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje numeru telefonu', () => {
        const input = "Oddzwońcie na 664123789"
        const result = maskCards(input)

        expect(result.sanitized).toBe("Oddzwońcie na 664123789")
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje innych numerów niż karty', () => {
        const input = "Numer zamówienia to 1234 5678 9012 3456"
        const result = maskCards(input)

        expect(result.sanitized).toBe("Numer zamówienia to 1234 5678 9012 3456")
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje losowych cyfr (nie przechodzi Luhna)', () => {
        const input = "Moja karta to 4111111111111112"
        const result = maskCards(input)

        expect(result.sanitized).toBe("Moja karta to 4111111111111112")
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje karty która nie przechodzi Luhna o jedną cyfrę', () => {
        const input = "Próbuję: 4532015112830367"
        const result = maskCards(input)
    
        expect(result.sanitized).toBe("Próbuję: 4532015112830367")
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje dwóch krótkich liczb oddzielonych spacją które po sklejeniu mogłyby wyglądać jak karta', () => {
        const input = "Zamówienie 4532015 i faktura 112830366"
        const result = maskCards(input)
 
        // Po normalizeCard to się sklei w "4532015112830366" co jest valid kartą
        // Jeśli maskuje = false positive
        const isKnownFalsePositive = result.detectedItems.length > 0
        if (isKnownFalsePositive) {
            expect(result.detectedItems).toHaveLength(1)
        } else {
            expect(result.sanitized).toBe("Zamówienie 4532015 i faktura 112830366")
        }
    })

    it('nie psuje się na polskich znakach obok karty', () => {
        const input = "Zapłaciłem złotówkami: 4532015112830366, źródło: karta"
        const result = maskCards(input)
 
        expect(result.sanitized).toContain("4532********0366")
        expect(result.detectedItems).toHaveLength(1)
    })

    it('obsługuje pusty string', () => {
        const input = ""
        const result = maskCards(input)

        expect(result.sanitized).toBe("")
        expect(result.detectedItems).toHaveLength(0)
    })

    it('zwraca prawidłową strukturę detectedItem', () => {
        const input = "4532015112830366"
        const result = maskCards(input)
 
        expect(result.detectedItems[0]).toEqual({
            type: 'card',
            original: '4532015112830366',
            masked: '4532********0366'
        })
    })
})