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
import * as reserveActions from '../support/requests/reservations';

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

Cypress.Commands.add('registerBook', (token, book) => {
    return cy.api({
        method: 'POST',
        url: 'books',
        headers: { Authorization: token },
        failOnStatusCode: false,
        body: book
    })
})

Cypress.Commands.add('createAndRegisterBook', (token) => {
    const livro = createBook()
    return cy.api({
        method: 'POST',
        url: 'books',
        headers: { Authorization: token },
        failOnStatusCode: false,
        body: livro
    })
})

Cypress.Commands.add('createAndReserveBook', (tokenAdmin, tokenPadrao) => {
    return cy.createAndRegisterBook(tokenAdmin).then(response => {
        const book = response.body.book

        reserveActions.create(book.id, tokenPadrao).then(res => {
            const reservation = res.body.reservation

            cy.wrap({
                id: book.id,
                title: book.title,
                reserveId: reservation.id
            })

        })

    })
})

Cypress.Commands.add('clearBasket', (token, userID) => {
    return cy.api({
        method: 'DELETE',
        url: `basket/${userID}`,
        headers: { Authorization: token },
        failOnStatusCode: false
    })
})

Cypress.Commands.add('addBookBasket', (userID, bookID, token, quantity = 1) => {
    return cy.api({
        method: 'POST',
        url: 'basket',
        headers: { Authorization: token },
        body: {
            userId: userID,
            bookId: bookID,
            quantity: quantity
        },
        failOnStatusCode: false
    })
})













