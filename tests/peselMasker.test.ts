import { describe, it, expect } from 'vitest'
import { maskPesel } from '../src/sanitizers/peselMasker'

describe('peselMasker', () => {
    
    it('maskuje valid PESEL', () => {
        const input = "Mój PESEL to 92010512341"
        const result = maskPesel(input)
    
        expect(result.sanitized).toBe("Mój PESEL to 920105*****")
        expect(result.detectedItems).toHaveLength(1)
        expect(result.detectedItems[0].type).toBe('pesel')
        expect(result.detectedItems[0].original).toBe('92010512341')
        expect(result.detectedItems[0].masked).toBe('920105*****')
    })

    it('maskuje PESEL na początku wiadomości', () => {
        const input = "92010512341 to mój PESEL"
        const result = maskPesel(input)
 
        expect(result.sanitized).toBe("920105***** to mój PESEL")
        expect(result.detectedItems).toHaveLength(1)
    })

    it('maskuje PESEL na końcu wiadomości', () => {
        const input = "Mój PESEL to 92010512341"
        const result = maskPesel(input)
 
        expect(result.sanitized).toBe("Mój PESEL to 920105*****")
        expect(result.detectedItems).toHaveLength(1)
    })

    it('maskuje dwa PESEL w jednej wiadomości', () => {
        const input = "PESEL 1: 92010512341, PESEL 2: 02210512346"
        const result = maskPesel(input)
    
        expect(result.sanitized).toBe("PESEL 1: 920105*****, PESEL 2: 022105*****")
        expect(result.detectedItems).toHaveLength(2)
    })

    it('maskuje ten sam PESEL powtórzony dwa razy', () => {
        const input = "PESEL: 92010512341, zapłaciłem a mój pesel to 92010512341"
        const result = maskPesel(input)

        expect(result.sanitized).toBe("PESEL: 920105*****, zapłaciłem a mój pesel to 920105*****")
        expect(result.sanitized).not.toContain("92010512341")
    })

    it('maskuje sam PESEL bez innego tekstu', () => {
        const input = "92010512341"
        const result = maskPesel(input)
 
        expect(result.sanitized).toBe("920105*****")
        expect(result.detectedItems).toHaveLength(1)
    })

    it('maskuje PESEL z XXI wieku (miesiąc+20)', () => {
        const input = "PESEL XXI w: 02210512346"
        const result = maskPesel(input)
    
        expect(result.sanitized).toBe("PESEL XXI w: 022105*****")
        expect(result.detectedItems).toHaveLength(1)
    })

    it('maskuje PESEL z dniem = 1', () => {
        const input = "PESEL: 90010100009"
        const result = maskPesel(input)
    
        expect(result.detectedItems).toHaveLength(1)
        expect(result.sanitized).toContain("900101*****")
    })

    it('maskuje PESEL z dniem = 31', () => {
        const input = "PESEL: 92013100000"
        const result = maskPesel(input)
    
        expect(result.detectedItems).toHaveLength(1)
        expect(result.sanitized).toContain("920131*****")
    })

    it('maskuje PESEL z miesiącem = 12', () => {
        const input = "PESEL: 92120100007"
        const result = maskPesel(input)
    
        expect(result.detectedItems).toHaveLength(1)
        expect(result.sanitized).toContain("921201*****")
    })

    it('maskuje PESEL z miesiącem = 21 (styczeń XXI w.)', () => {
        const input = "PESEL: 02210100008"
        const result = maskPesel(input)
    
        expect(result.detectedItems).toHaveLength(1)
        expect(result.sanitized).toContain("022101*****")
    })

    it('maskuje PESEL z miesiącem = 32 (grudzień XXI w.)', () => {
        const input = "PESEL: 02320100002"
        const result = maskPesel(input)
    
        expect(result.detectedItems).toHaveLength(1)
        expect(result.sanitized).toContain("023201*****")
    })

    it('NIE maskuje PESEL z błędną sumą kontrolną', () => {
        const input = "Nieprawidłowy: 92010512346"
        const result = maskPesel(input)

        expect(result.sanitized).toBe("Nieprawidłowy: 92010512346")
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje PESEL z dniem = 0', () => {
        const input = "Błędny: 92010012345"
        const result = maskPesel(input)
 
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje PESEL z dniem = 32', () => {
        const input = "Błędny: 92013212345"
        const result = maskPesel(input)
 
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje PESEL z miesiącem = 0', () => {
        const input = "Błędny: 92000112345"
        const result = maskPesel(input)
 
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje PESEL z miesiącem = 13', () => {
        const input = "Błędny: 92130112345"
        const result = maskPesel(input)
 
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje PESEL z miesiącem = 20 (XXI wiek, miesiąc 0 po odjęciu)', () => {
        const input = "Błędny: 02200112345"
        const result = maskPesel(input)
 
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje PESEL z miesiącem = 33 (poza zakresem)', () => {
        const input = "Błędny: 02330112345"
        const result = maskPesel(input)

        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje numeru telefonu (11 cyfr ale nie PESEL)', () => {
        const input = "Telefon: 48123456789"
        const result = maskPesel(input)

        expect(result.sanitized).toBe("Telefon: 48123456789")
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje numeru telefonu z prefiksem +48', () => {
        const input = "Telefon: +48123456789"
        const result = maskPesel(input)
 
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje NIP (10 cyfr)', () => {
        const input = "NIP: 1234567890"
        const result = maskPesel(input)

        expect(result.sanitized).toBe("NIP: 1234567890")
        expect(result.detectedItems).toHaveLength(0)
    })

    it('NIE maskuje 11 cyfr które nie są oddzielone (część UUID)', () => {
        const input = "UUID: 12345678901234567890"
        const result = maskPesel(input)

        expect(result.sanitized).toBe("UUID: 12345678901234567890")
        expect(result.detectedItems).toHaveLength(0)
    })

    it('obsługuje pusty string', () => {
        const input = ""
        const result = maskPesel(input)

        expect(result.sanitized).toBe("")
        expect(result.detectedItems).toHaveLength(0)
    })

    it('zwraca oryginalny tekst gdy brak PESEL', () => {
        const input = "Zwykła wiadomość bez numerów"
        const result = maskPesel(input)

        expect(result.sanitized).toBe("Zwykła wiadomość bez numerów")
        expect(result.detectedItems).toHaveLength(0)
    })

    it('zwraca prawidłową strukturę detectedItem', () => {
        const input = "PESEL: 92010512341"
        const result = maskPesel(input)
 
        expect(result.detectedItems[0]).toEqual({
            type: 'pesel',
            original: '92010512341',
            masked: '920105*****'
        })
    })

    it('nie psuje się na polskich znakach obok PESEL', () => {
        const input = "Właściciel: PESEL 92010512341, źródło: dowód"
        const result = maskPesel(input)
 
        expect(result.sanitized).not.toContain("92010512341")
        expect(result.detectedItems).toHaveLength(1)
    })
})