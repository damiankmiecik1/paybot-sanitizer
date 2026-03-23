import { describe, it, expect } from 'vitest'
import { processPipeline } from '../src/pipeline'

describe('pipeline', () => {

    it('przetwarza wiadomość z kartą i PESEL', () => {
        const input = "Płacę kartą 4532015112830366, PESEL: 92010512341"
        const result = processPipeline(input)
    
        expect(result.status).toBe('ready')
        if (result.status === 'ready') {
            expect(result.content).toBe("Płacę kartą 4532********0366, PESEL: 920105*****")
            expect(result.detectedItems).toHaveLength(2)
            expect(result.detectedItems[0].type).toBe('card')
            expect(result.detectedItems[1].type).toBe('pesel')
        }
    })

    it('odrzuca pustą wiadomość', () => {
        const input = ""
        const result = processPipeline(input)

        expect(result.status).toBe('rejected')
        if (result.status === 'rejected') {
            expect(result.reason).toBe('Wiadomość nie może być pusta')
        }
    })

    it('przetwarza wiadomość na dokładnie 2000 znaków z kartą', () => {
        const padding = 'a'.repeat(1977)
        const input = padding + "Karta: 4532015112830366"

        expect(input.length).toBe(2000)
        
        const result = processPipeline(input)
        expect(result.status).toBe('ready')
        if (result.status === 'ready') {
            expect(result.detectedItems).toHaveLength(1)
            expect(result.detectedItems[0].type).toBe('card')
        }
    })

    it('odrzuca wiadomość za długą', () => {
        const input = 'a'.repeat(2001)
        const result = processPipeline(input)

        expect(result.status).toBe('rejected')
        if (result.status === 'rejected') {
            expect(result.reason).toBe('Wiadomość za długa (max 2000 znaków)')
        }
    })

    it('przetwarza wiadomość tylko z kartą', () => {
        const input = "Płacę kartą 4532015112830366"
        const result = processPipeline(input)

        expect(result.status).toBe('ready')
        if (result.status === 'ready') {
            expect(result.content).toBe("Płacę kartą 4532********0366")
            expect(result.detectedItems).toHaveLength(1)
            expect(result.detectedItems[0].type).toBe('card')
        }
    })

    it('przetwarza wiadomość tylko z PESEL', () => {
        const input = "Mój PESEL to 92010512341"
        const result = processPipeline(input)
    
        expect(result.status).toBe('ready')
        if (result.status === 'ready') {
            expect(result.content).toBe("Mój PESEL to 920105*****")
            expect(result.detectedItems).toHaveLength(1)
            expect(result.detectedItems[0].type).toBe('pesel')
        }
    })

    it('przetwarza wiadomość bez danych wrażliwych', () => {
        const input = "Witam, mam problem z płatnością"
        const result = processPipeline(input)

        expect(result.status).toBe('ready')
        if (result.status === 'ready') {
            expect(result.content).toBe("Witam, mam problem z płatnością")
            expect(result.detectedItems).toHaveLength(0)
        }
    })

    it('maskuje wiele kart i PESEL w jednej wiadomości', () => {
        const input = "Karty: 4532015112830366, 5500000000000004, PESEL: 92010512341, 02210512346"
        const result = processPipeline(input)
    
        expect(result.status).toBe('ready')
        if (result.status === 'ready') {
            expect(result.detectedItems).toHaveLength(4)
            expect(result.detectedItems.filter(item => item.type === 'card')).toHaveLength(2)
            expect(result.detectedItems.filter(item => item.type === 'pesel')).toHaveLength(2)
        }
    })

    it('używa type narrowing dla discriminated union', () => {
        const input = ""
        const result = processPipeline(input)

        if (result.status === 'rejected') {
            expect(result.reason).toBeDefined()
            expect(result.content).toBeUndefined()
        }
    })

    it('przetwarza wiadomość z dużą ilością znaków w mniej niż 50ms', () => {
        const input = "1234567890123456 ".repeat(100)
        const start = performance.now()
        processPipeline(input)
        const duration = performance.now() - start
        
        expect(duration).toBeLessThan(50)
    })
})