import { describe, it, expect } from 'vitest'
import { validateMessage } from '../src/validators/messageValidator'

describe('messageValidator', () => {
    
    it('akceptuje normalną wiadomość', () => {
        const result = validateMessage("Witam, mam problem z płatnością")

        expect(result.valid).toBe(true)
        expect(result.reason).toBeUndefined()
    })

    it('akceptuje wiadomość z 1 znakiem', () => {
        const result = validateMessage('a')
 
        expect(result.valid).toBe(true)
    })

    it('akceptuje wiadomość na 1999 znaków', () => {
        const result = validateMessage('a'.repeat(1999))
 
        expect(result.valid).toBe(true)
    })

    it('akceptuje wiadomość na dokładnie 2000 znaków', () => {
        const maxMessage = 'a'.repeat(2000)
        const result = validateMessage(maxMessage)

        expect(result.valid).toBe(true)
    })

    it('akceptuje wiadomość ze znakami specjalnymi', () => {
        const result = validateMessage("Płacę €100 za @produkt #test!")

        expect(result.valid).toBe(true)
    })

    it('akceptuje wiadomość z emoji', () => {
        const result = validateMessage("Świetna obsługa! 👍")

        expect(result.valid).toBe(true)
    })

    it('akceptuje wiadomość wieloliniową', () => {
        const result = validateMessage("Linia 1\nLinia 2\nLinia 3")

        expect(result.valid).toBe(true)
    })

    it('odrzuca pustą wiadomość', () => {
        const result = validateMessage("")

        expect(result.valid).toBe(false)
        expect(result.reason).toBe('Wiadomość nie może być pusta')
    })

    it('odrzuca wiadomość składającą się tylko ze spacji', () => {
        const result = validateMessage("   ")

        expect(result.valid).toBe(false)
        expect(result.reason).toBe('Wiadomość nie może być pusta')
    })

    it('odrzuca wiadomość za długą', () => {
        const longMessage = 'a'.repeat(2001)
        const result = validateMessage(longMessage)

        expect(result.valid).toBe(false)
        expect(result.reason).toBe('Wiadomość za długa (max 2000 znaków)')
    })

    it('nie zwraca reason gdy wiadomość jest prawidłowa', () => {
        const result = validateMessage('Test')
 
        expect(result.valid).toBe(true)
        expect(result.reason).toBeUndefined()
    })

    it('zawsze zwraca reason gdy wiadomość jest pusta', () => {
        const result = validateMessage('')
 
        expect(result.valid).toBe(false)
        expect(result.reason).toBeDefined()
        expect(result.reason).toBeTypeOf('string')
    })

    it('zawsze zwraca reason gdy wiadomość za długa', () => {
        const result = validateMessage('x'.repeat(2001))
 
        expect(result.valid).toBe(false)
        expect(result.reason).toBeDefined()
        expect(result.reason).toBeTypeOf('string')
    })
})