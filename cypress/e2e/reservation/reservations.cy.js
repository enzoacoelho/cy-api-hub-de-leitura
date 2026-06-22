/// <reference types="cypress"/>
import { faker } from '@faker-js/faker'

import * as reservesActions from '../../support/requests/reservations.js'
import * as basketActions from '../../support/requests/basket.js'
import { createBook } from '../../support/factory/book.js'

let tokenPadrao
let userID
let tokenAdmin
let bookId
let bookTitle


beforeEach(() => {
    cy.fixture('users').then((usuarios) => {
        cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tkn => {
            tokenPadrao = tkn
            userID = usuarios.padrao.userID
        })

        cy.gerarToken(usuarios.admin.email, usuarios.admin.password).then(tkn => {
            tokenAdmin = tkn
        })
    })

    reservesActions.cleanAll(tokenPadrao)
})

describe('GET - Listar reservas de livros - api/reservations ', () => {

    it('Deve listar todas as reservas do usuário', () => {
        cy.createAndReserveBook(tokenAdmin, tokenPadrao).then(book => {
            bookTitle = book.title
        })

        reservesActions.getReservations(tokenPadrao).then(response => {
            expect(response.status).to.eq(200)
            expect(response.body.reservations).to.be.an('array')

            const { reservations } = response.body            
            expect(reservations).to.have.lengthOf.at.least(1)           
            expect(reservations[0].title).to.eq(bookTitle)
        })
    })    

    it('Deve listar reservas do usuário com filtrando por status', () => {
        cy.createAndReserveBook(tokenAdmin, tokenPadrao).then(book => {
            bookTitle = book.title

            const status = 'active'
            reservesActions.getReservationsByStatus(tokenPadrao, status).then(response => {
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
        cy.createAndRegisterBook().then(response => {
            bookID = response.body.book.id
            bookTitle = response.body.book.title

            reservesActions.create(bookID, tokenPadrao).then(postResponse => {
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
        reservesActions.create(idBook, tokenPadrao).then(response => {
            expect(response.status).to.eq(404)
            expect(response.body.message).to.eq("Livro não encontrado.")
        })
    })

    it('Não deve reservar mesmo livro duas vezes (400)', () => {
        cy.createAndRegisterBook().then(response => {
            bookID = response.body.book.id
            bookTitle = response.body.book.title

            reservesActions.create(bookID, tokenPadrao).then(responseSucess => {
                expect(responseSucess.status).to.eq(201)
                expect(responseSucess.body.message).to.eq("Reserva criada com sucesso.")
            })

            reservesActions.create(bookID, tokenPadrao).then(response => {
                expect(response.status).to.eq(400)
                expect(response.body.message).to.eq("Você já possui uma reserva ativa para este livro.")
            })
        })       
    })


    it('Deve fazer reserva com observações', () => {
        cy.createAndRegisterBook().then(response => {
            bookID = response.body.book.id
            bookTitle = response.body.book.title
            const notes = "Livro necessário para trabalho"

            reservesActions.createWithNotes(bookId, notes, tokenPadrao).then(responseNotes => {
                expect(responseNotes.status).to.eq(201)
                expect(responseNotes.body.message).to.eq("Reserva criada com sucesso.")

                const reservation = response.body.reservation
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
        //cadastrar um livro
        limparReservas(token)
        limparCesta(token, userID)

        const livro = criarLivro()

        cadastrarLivro(tokenAdmin, livro).then(response => {
            let bookID = response.body.book.id
            let bookTitle = response.body.book.title

            cy.log("ID DO LIVRO: " + bookID)

            //adicionar no carrinho
            adicionarLivroCesta(userID, bookID, token)

            //fazer reserva a partir do carrinho
            cy.api({
                method: 'POST',
                url: 'reservations/from-basket',
                headers: { 'Authorization': token },
                body: {
                    "notes": "Livros para estudo do semestre",
                    "clearBasket": true
                },
            }).then((response) => {
                expect(response.status).equal(201)
                expect(response.body.reservationsCreated).to.be.an('array')

                const res = response.body.reservationsCreated
                cy.log("res: " + res)
                expect(res[0].bookId).equal(bookID)
                expect(res[0].bookTitle).equal(bookTitle)

                const summary = response.body.summary
                expect(summary.totalItemsInBasket).equal(summary.successfulReservations)

                expect(response.body.basketCleared).equal(true)

                const instructions = response.body.instructions
                expect(instructions.message).equal("Todas as reservas foram criadas com prazo de 48h para retirada.")

            })
        })

    })

    it('Não deve fazer reservas da cesta com ela vazia', () => {
        //limpar o carrinho
        limparCesta(token, userID).then(response => {
            expect(response.status).to.eq(200)
        })

        cy.api({
            method: 'POST',
            url: 'reservations/from-basket',
            headers: { 'Authorization': token },
            failOnStatusCode: false,
            body: {
                "notes": "Livros para estudo do semestre",
                "clearBasket": true
            },
        }).then((response) => {
            expect(response.status).to.eq(400)
            expect(response.body.message).to.equal("Carrinho está vazio. Adicione livros antes de criar reservas.")
        })

    })

    it('Deve manter itens no carrinho após reserva (clearBasket=false)', () => {
        limparReservas(token)
        limparCesta(token, userID)

        //cadastrar um livro
        const livro = criarLivro()

        cadastrarLivro(tokenAdmin, livro).then(response => {
            let bookID = response.body.book.id
            let bookTitle = response.body.book.title

            //adicionar no carrinho
            adicionarLivroCesta(userID, bookID, token)

            verCesta(userID, token).then(response => {
                let livrosCesta = response.body.total

                //fazer reserva a partir do carrinho
                cy.api({
                    method: 'POST',
                    url: 'reservations/from-basket',
                    headers: { 'Authorization': token },
                    body: {
                        "notes": "Livros para estudo do semestre",
                        "clearBasket": false
                    },
                }).then((response) => {
                    expect(response.status).equal(201)
                    expect(response.body.reservationsCreated).to.be.an('array')

                    const res = response.body.reservationsCreated
                    expect(res[0].bookId).equal(bookID)
                    expect(res[0].bookTitle).equal(bookTitle)

                    expect(response.body.basketCleared).equal(false)

                    const instructions = response.body.instructions
                    expect(instructions.message).equal("Todas as reservas foram criadas com prazo de 48h para retirada.")

                })

                verCesta(userID, token).then(res => {
                    expect(res.body.total).to.equal(livrosCesta)
                })
            })
        })

    })
})

describe('PUT - Atualização de reservas - api/reservations/:id', () => {

    it('Deve cancelar reserva ativa e liberar livro', () => {
        limparReservas(token)

        //criar livro para evitar conflitos de testes simultaneos
        const livro = criarLivro()

        cadastrarLivro(tokenAdmin, livro).then(response => {
            const bookID = response.body.book.id

            reservarLivro(bookID, token).then(response => {

                let reservaID = response.body.reservation.id

                //cancelar reserva
                cy.api({
                    method: 'PUT',
                    url: `reservations/${reservaID}`,
                    headers: { 'Authorization': token },
                    body: {
                        "action": "cancel"
                    },
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body.message).to.equal("Reserva cancelada com sucesso.")
                    const bookAvailability = response.body.bookAvailability

                    expect(bookAvailability.message).to.equal("O livro foi liberado e está disponível para outros usuários.")
                })
            })
        })

    })

    it('Deve atualizar apenas as observações de uma reserva', () => {
        limparReservas(token)
        const livro = criarLivro()
        const txtAleatorio = faker.lorem.words(5)
        const obsAlterada = "Observações: " + txtAleatorio

        cadastrarLivro(tokenAdmin, livro).then(res => {
            const bookID = res.body.book.id

            reservarLivro(bookID, token).then(response => {
                expect(response.status).to.eq(201)
                let reservaID = response.body.reservation.id

                cy.api({
                    method: 'PUT',
                    url: `reservations/${reservaID}`,
                    headers: { 'Authorization': token },
                    body: {
                        "action": "update_notes",
                        "notes": obsAlterada
                    },
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body.message).to.equal("Observações atualizadas com sucesso.")
                    const reservation = response.body.reservation

                    expect(reservation.newNotes).to.equal(obsAlterada)
                })
            })

            limparReservas(token)


        })
    })
})


describe('DELETE - Remover reservas - api/reservations/:id', () => {

    it('Deve cancelar uma reserva ativa', () => {
        limparReservas(token) //garantir que as reservas sao limpas antes
        const livro = criarLivro()

        cadastrarLivro(tokenAdmin, livro).then(res => {
            const bookID = res.body.book.id

            reservarLivro(bookID, token).then(response => {
                expect(response.status).to.eq(201)
                let reservaID = response.body.reservation.id

                //cancelar reserva
                cy.api({
                    method: 'DELETE',
                    url: `reservations/${reservaID}`,
                    headers: { 'Authorization': token }
                }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body.message).to.equal("Reserva cancelada com sucesso.")
                    const bookAvailability = response.body.bookAvailability

                    expect(bookAvailability.message).to.equal("O livro foi liberado e está disponível para outros usuários.")
                })
            })

        })


    })
})




