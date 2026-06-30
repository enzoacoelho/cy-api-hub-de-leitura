// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import { faker } from '@faker-js/faker';
import { createBook } from '../support/factory/book';
import * as reservations from '../support/requests/reservations';
import * as userMgmt from '../support/requests/users-admin';

Cypress.Commands.add('gerarToken', (email, password) => {
    return cy.api({
        method: 'POST',
        url: 'login',
        body: { email, password }
    }).then((response) => {

        expect(response.status).to.eq(200)

        return response.body.token
    })
})

Cypress.Commands.add('login', (email, password, failOnStatusCode) => {
    return cy.api({
        method: 'POST',
        url: 'login',
        body: {
            "email": email,
            "password": password
        },
        failOnStatusCode: failOnStatusCode
    })
})

Cypress.Commands.add('registerBook', (tokenAdmin, book) => {
    return cy.api({
        method: 'POST',
        url: 'books',
        headers: { Authorization: tokenAdmin },
        failOnStatusCode: false,
        body: book
    })
})

Cypress.Commands.add('createAndRegisterBook', (tokenAdmin) => {
    const livro = createBook()
    return cy.api({
        method: 'POST',
        url: 'books',
        headers: { Authorization: tokenAdmin },
        failOnStatusCode: false,
        body: livro
    })
})

Cypress.Commands.add('createAndReserveBook', (tokenAdmin, tokenPadrao) => {
    return cy.createAndRegisterBook(tokenAdmin).then(response => {
        const book = response.body.book

        reservations.create(book.id, tokenPadrao).then(res => {
            const reservation = res.body.reservation

            cy.wrap({
                bookId: book.id,
                bookTitle: book.title,
                id: reservation.id
            })
        })
    })
})

Cypress.Commands.add('clearBasket', (tokenPadrao, userID) => {
    return cy.api({
        method: 'DELETE',
        url: `basket/${userID}`,
        headers: { Authorization: tokenPadrao },
        failOnStatusCode: false
    })
})

Cypress.Commands.add('addBookBasket', (userID, bookID, tokenPadrao) => {
    return cy.api({
        method: 'POST',
        url: 'basket',
        headers: { Authorization: tokenPadrao },
        body: {
            userId: userID,
            bookId: bookID,
            quantity: 1
        },
        failOnStatusCode: false
    })
})

Cypress.Commands.add('clearReservation', (tokenPadrao) => {
    return cy.api({
        method: 'GET',
        url: 'reservations',
        qs: { status: "active" },
        headers: { Authorization: tokenPadrao },
        failOnStatusCode: false
    }).then((response) => {

        if (response.body.reservations && response.body.reservations.length > 0) {

            const reservas = response.body.reservations

            reservas.forEach((reserva) => {
                cancel(reserva.id, token)
            })

            cy.log(`Limpeza concluída: ${reservas.length} reservas removidas.`)

        } else {

            cy.log('Nenhuma reserva encontrada para limpar.')
        }
    })
})

Cypress.Commands.add('registerUser', (name, email, password) => {
    return cy.api({
        method: 'POST',
        url: 'users',
        failOnStatusCode: false,
        body: {
            "name": name,
            "email": email,
            "password": password
        }
    })
})


Cypress.Commands.add('createUserAndLogin', (tokenAdmin) => {
    const userName = faker.person.fullName()
    const userEmail = faker.internet.email()
    const userPass = '1234user'

    cy.api({
        method: 'POST',
        url: 'users/',
        body: {
            
            "name": userName,
            "email": userEmail,
            "password": userPass

        },
        failOnStatusCode: false,
    }).then(response => {

        const UserId = response.body.user.id

        return cy.gerarToken(userEmail, userPass).then(tkn => {
            cy.wrap({
                token: tkn,
                id: UserId,
                name: userName,
                email: userEmail

            })
        })
    })

})

Cypress.Commands.add('removeUser', (tokenAdmin, id) => {
     return cy.api({
        method: 'DELETE',
        url: `users/${id}`,      
        failOnStatusCode: false,
        headers: { Authorization: tokenAdmin }
    })

})














