/// <reference types="cypress"/>
import { faker } from '@faker-js/faker'
import * as resAdmin from '../../support/requests/reservations-admin'

let tokenAdmin
let tokenPadrao
let userId

beforeEach(() => {

    cy.createUserAndLogin().then(usuario => {
        tokenPadrao = usuario.token
        userId = usuario.id
        console.log('userid é : ' + userId)
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

describe('GET - Admin Reservas - api/admin/reservations ', () => {
    it('Deve listar todas as reservas', () => {
        resAdmin.getReservations(tokenAdmin).should(response => {
            expect(response.status).equal(200)
            expect(response.body.reservations).be.an('array')
        })
    })

    it('Não deve listar todas reservas sem autorização', () => {
        resAdmin.getReservations(tokenPadrao).should(response => {
            expect(response.status).equal(403)
            expect(response.body.message).equal('Acesso negado. Apenas administradores podem realizar esta ação.')
            expect(response.body.requiredRole).equal('admin')
        })
    })
    
})

describe('GET - Buscar por reservas com filtros - api/admin/reservations/search', () => {
    it('Deve listar reserva por ID do livro e usuário', () => {
        cy.createAndReserveBook(tokenAdmin, tokenPadrao).then(reservation => {
            const bookId = reservation.bookId
            const reservationId = reservation.id

            resAdmin.searchReservation(tokenAdmin, userId, bookId).then(response => {
                expect(response.status).to.eq(200)
                expect(response.body).to.not.be.empty
                expect(response.body.reservations[0].id).to.eq(reservationId)
                expect(response.body.reservations[0].user_id).to.eq(userId)
                expect(response.body.reservations[0].book_id).to.eq(bookId)

            })
        })
    })
})

describe('GET - Estatísticas das reservas - api/admin/reservations/stats', () => {
    it('Deve garantir que o endpoint de estatísticas retorna a estrutura correta', () => {
        resAdmin.getStats(tokenAdmin).then((response) => {
            expect(response.status).to.eq(200)

            expect(response.body).to.have.property('stats')
            const { stats } = response.body

            expect(stats.active).to.be.a('number')
            expect(stats.pickedUp).to.be.a('number')
            expect(stats.returned).to.be.a('number')
            expect(stats.overdue).to.be.a('number')
            expect(stats.active).to.be.at.least(0)
        })
    })
})

describe('PUT - Atualizar status de reservas - api/admin/reservations/:id', () => {
    it('Deve atualizar status de uma reserva com sucesso', () => {
        cy.createAndReserveBook(tokenAdmin, tokenPadrao).then(reservation => {
            const bookId = reservation.bookId
            const reservationId = reservation.id
            const notes = 'Nota de teste'
            const newStatus = 'picked-up'

            resAdmin.alterStatus(reservationId, tokenAdmin, newStatus, notes).then((responsePut) => {
                expect(responsePut.status).to.eq(200)

                expect(responsePut.body.message).to.eq('Status da reserva atualizado com sucesso.')
                expect(responsePut.body.reservationId.toString()).to.eq(reservationId.toString())
                expect(responsePut.body.newStatus).to.eq(newStatus)

                expect(responsePut.body.updatedFields.status).to.eq(newStatus)
                expect(responsePut.body.updatedFields.notes).to.eq(notes)

            })
        })
    })   
    
    it('Não deve atualizar com um status inválido', () => {
        cy.createAndReserveBook(tokenAdmin, tokenPadrao).then(reservation => {
            const bookId = reservation.bookId
            const reservationId = reservation.id
            const notes = 'Nota de teste'
            const newStatus = '43434-up'

            resAdmin.alterStatus(reservationId, tokenAdmin, newStatus, notes).then((responsePut) => {
                expect(responsePut.status).to.eq(400)
                expect(responsePut.body.message).to.eq('Status inválido.')
            })
        })
    }) 

    it('Não deve atualizar com um status vazio', () => {
        cy.createAndReserveBook(tokenAdmin, tokenPadrao).then(reservation => {
            const bookId = reservation.bookId
            const reservationId = reservation.id
            const notes = 'Nota de teste'
            const newStatus = ''

            resAdmin.alterStatus(reservationId, tokenAdmin, newStatus, notes).then((responsePut) => {
                expect(responsePut.status).to.eq(400)
                expect(responsePut.body.message).to.eq('ID da reserva e status são obrigatórios.')               
            })
        })
    })     
}) 












