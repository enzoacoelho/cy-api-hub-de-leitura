/// <reference types="cypress"/>
import { faker } from '@faker-js/faker'

import * as reservations from '../../support/requests/reservations.js'
import * as basketActions from '../../support/requests/basket.js'
import { createBook } from '../../support/factory/book.js'

let tokenPadrao
let userId
let tokenAdmin

beforeEach(() => {

    cy.createUserAndLogin().then(usuario => {
        tokenPadrao = usuario.token
        userId = usuario.id
    })
    cy.fixture('users').then((usuarios) => {
        cy.gerarToken(usuarios.admin.email, usuarios.admin.password).then(tkn => {
            tokenAdmin = tkn
        })
    })
})

afterEach(() => {
    if (userId) {
        cy.removeUser(tokenAdmin, userId); 
    }
});

describe('GET - Listar reservas de livros - api/reservations ', () => {

    it('Deve listar todas as reservas do usuário', () => {
        cy.createAndReserveBook(tokenAdmin, tokenPadrao).then(reservation => {
            const bookTitle = reservation.bookTitle

            reservations.getReservations(tokenPadrao).then(response => {
                expect(response.status).to.eq(200)
                expect(response.body.reservations).to.be.an('array')

                const { reservations } = response.body
                expect(reservations).to.have.lengthOf.at.least(1)
                expect(reservations[0].title).to.eq(bookTitle)
            })
        })
        
    })

    it('Deve listar reservas do usuário com filtrando por status', () => {
        cy.createAndReserveBook(tokenAdmin, tokenPadrao).then(reservation => {
            const bookTitle = reservation.bookTitle

            const status = 'active'
            reservations.getReservationsByStatus(tokenPadrao, status).then(response => {
                expect(response.status).to.eq(200)
                expect(response.body.filters.status).to.eq(status)
                // Valida se todos os itens retornados possuem o status filtrado
                response.body.reservations.forEach(reserva => {
                    expect(reserva.status).to.eq(status)
                })

                const { reservations } = response.body
                expect(reservations).to.have.lengthOf.at.least(1)
                expect(reservations[0].status).to.eq('active')
                expect(reservations[0].title).to.eq(bookTitle)

            })
        })
    })
})

describe('POST - Reservas de livros - api/reservations', () => {

    it('Deve reservar livro disponível com sucesso', () => {
        cy.createAndRegisterBook(tokenAdmin).then(response => {
            const bookID = response.body.book.id
            const bookTitle = response.body.book.title

            reservations.create(bookID, tokenPadrao).then(postResponse => {
                expect(postResponse.status).to.eq(201)
                expect(postResponse.body.message).to.eq("Reserva criada com sucesso.")

                const reservation = postResponse.body.reservation
                expect(reservation.id).to.be.a('number')
                expect(reservation.bookId).to.eq(bookID)
                expect(reservation.bookTitle).to.eq(bookTitle)
            })
        })
    })

    it('Não deve reservar livro inexistente (404)', () => {
        const idBook = 4556334
        reservations.create(idBook, tokenPadrao).then(response => {
            expect(response.status).to.eq(404)
            expect(response.body.message).to.eq("Livro não encontrado.")
        })
    })

    it('Não deve reservar mesmo livro duas vezes (400)', () => {
        cy.createAndRegisterBook(tokenAdmin).then(response => {
            const bookID = response.body.book.id
            const bookTitle = response.body.book.title

            reservations.create(bookID, tokenPadrao).then(responseSucess => {
                expect(responseSucess.status).to.eq(201)
                expect(responseSucess.body.message).to.eq("Reserva criada com sucesso.")
            })

            reservations.create(bookID, tokenPadrao).then(response => {
                expect(response.status).to.eq(400)
                expect(response.body.message).to.eq("Você já possui uma reserva ativa para este livro.")
            })
        })
    })


    it('Deve fazer reserva com observações', () => {
        cy.createAndRegisterBook(tokenAdmin).then(response => {
            const bookID = response.body.book.id
            const bookTitle = response.body.book.title
            const notes = "Livro necessário para trabalho"

            reservations.createWithNotes(bookID, notes, tokenPadrao).then(responseNotes => {
                expect(responseNotes.status).to.eq(201)
                expect(responseNotes.body.message).to.eq("Reserva criada com sucesso.")

                const reservation = responseNotes.body.reservation
                expect(reservation.id).to.be.a('number')
                expect(reservation.bookId).to.eq(bookID)
                expect(reservation.bookTitle).to.eq(bookTitle)
                expect(reservation.notes).to.eq(notes)
            })
        })
    })
})

describe('POST - Reservas a partir da cesta - api/reservations/from-basket', () => {

    it('Deve reservar da cesta com livros disponíveis com sucesso', () => {
        cy.createAndReserveBook(tokenAdmin, tokenPadrao).then(reservation => {
            const bookId = reservation.bookId
            const bookTitle = reservation.bookTitle

    
            cy.addBookBasket(userId, bookId, tokenPadrao).then(bookBasket => {

                const notes = "Livros para estudo"
                const clearBasket = true

                //fazer reserva a partir do carrinho
                reservations.createFromBasket(tokenPadrao, notes, clearBasket).then((response) => {

                    expect(response.status).equal(201)
                    expect(response.body.reservationsCreated).to.be.an('array')

                    const reservation = response.body.reservationsCreated
                    expect(reservation[0].bookId).equal(bookId)
                    expect(reservation[0].bookTitle).equal(bookTitle)

                    const summary = response.body.summary
                    expect(summary.totalItemsInBasket).equal(summary.successfulReservations)

                    expect(response.body.basketCleared).equal(true)

                    const instructions = response.body.instructions
                    expect(instructions.message).equal("Todas as reservas foram criadas com prazo de 48h para retirada.")

                })
            })    
        })
    })

    it('Não deve fazer reservas da cesta com ela vazia', () => {
        const notes = "Livros para estudo"
        const clearBasket = true

        reservations.createFromBasket(tokenPadrao, notes, clearBasket).then((response) => {
            expect(response.status).to.eq(400)
            expect(response.body.message).to.equal("Carrinho está vazio. Adicione livros antes de criar reservas.")
        })
    })

    it('Deve manter itens no carrinho após reserva (clearBasket=false)', () => {
        cy.createAndRegisterBook(tokenAdmin).then(res => {
            const bookID = res.body.book.id
            const bookTitle = res.body.book.title

            cy.addBookBasket(userId, bookID, tokenPadrao)

            reservations.getReservations(tokenPadrao).then(res => {
                const livrosCesta = res.body.total
                const notes = "Livros para estudo"
                const clearBasket = false

                //fazer reserva a partir do carrinho
                reservations.createFromBasket(tokenPadrao, notes, clearBasket).then((resp) => {
                    expect(resp.status).equal(201)
                    expect(resp.body.reservationsCreated).to.be.an('array')

                    const res = resp.body.reservationsCreated
                    expect(res[0].bookId).equal(bookID)
                    expect(res[0].bookTitle).equal(bookTitle)

                    expect(resp.body.basketCleared).equal(false)

                    const instructions = resp.body.instructions
                    expect(instructions.message).equal("Todas as reservas foram criadas com prazo de 48h para retirada.")

                })

                reservations.getReservations(tokenPadrao).then(reservas => {
                    expect(reservas.body.total).to.equal(livrosCesta)
                })
            })
        })
    })
})

describe('PUT - Atualização de reservas - api/reservations/:id', () => {
    it('Deve cancelar reserva ativa e liberar livro', () => {
        cy.createAndReserveBook(tokenAdmin, tokenPadrao).then(reservation => {
            const reservationId = reservation.id
            const action = 'cancel'

            //cancelar reserva
            reservations.alterAction(reservationId, tokenPadrao, action).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.message).to.equal("Reserva cancelada com sucesso.")
                const bookAvailability = response.body.bookAvailability

                expect(bookAvailability.message).to.equal("O livro foi liberado e está disponível para outros usuários.")
            })
        })
    })
})

describe('DELETE - Remover reservas - api/reservations/:id', () => {
    it('Deve cancelar uma reserva ativa', () => {
        cy.createAndReserveBook(tokenAdmin, tokenPadrao).then(reservation => {
            const reservationId = reservation.id

            //cancelar reserva
            reservations.cancel(reservationId, tokenPadrao).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.message).to.equal("Reserva cancelada com sucesso.")
                const bookAvailability = response.body.bookAvailability

                expect(bookAvailability.message).to.equal("O livro foi liberado e está disponível para outros usuários.")
            })
        })
    })
})




