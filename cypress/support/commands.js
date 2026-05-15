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

Cypress.Commands.add('gerarToken', (email, password) => {
    cy.api({
        method: 'POST',
        url: 'login',
        body: {
            "email": email,
            "password": password
        },
    }).then((response) => {
        expect(response.status).equal(200)
        return response.body.token
    })
});

Cypress.Commands.add('reservarLivro', (idBook) => {
    cy.api({
        method: 'POST',
        url: 'reservations',
        body: {
            "bookId": idBook
        },
    }).then((response) => {
        expect(response.status).equal(200)
        return response.body.token
    })
});


Cypress.Commands.add('criarLivro', () => {
    const livroFake = {
        title: faker.lorem.words(3),
        author: faker.person.fullName(),
        description: faker.lorem.paragraph(),
        category: faker.helpers.arrayElement(['Ficção', 'Fantasia', 'Romance', 'Biografia', 'História']),
        isbn: faker.string.numeric(13),
        editor: faker.company.name(),
        language: faker.helpers.arrayElement(['Português', 'Inglês', 'Espanhol']),
        publication_year: faker.date.past(20).getFullYear(),
        pages: 965,
        format: faker.helpers.arrayElement(['Físico', 'Digital']),
        total_copies: 50,
        available_copies: 45
    }

    return livroFake;
});

Cypress.Commands.add('cadastrarLivro', (token, livro) => {
    cy.api({
        method: 'POST',
        url: 'books',
        headers: {'Authorization': token},
        failOnStatusCode: false,
        body: livro
    }).then((response) => {
        return response
    })
});

Cypress.Commands.add('atualizarLivro', (token, bookID, livro) => {
    cy.api({
        method: 'PUT',
        url: `books/${bookID}`,
        headers: {'Authorization': token},
        failOnStatusCode: false,
        body: livro
    }).then((response) => {
        return response
    })
});

Cypress.Commands.add('limparCesta', (token, userID) => {
    cy.api({
        method: 'DELETE',
        url: `basket/${userID}`,
        headers: {'Authorization': token}
    }).then((response) => {
        return response
    })
});

Cypress.Commands.add('verCesta', (userID) => {
    cy.api({
        method: 'GET',
        url: `basket/${userID}`,
    }).then((response) => {
        return response
    })
});

Cypress.Commands.add('adicionarLivroCesta', (userID, bookID, token) => {
    cy.api({
        method: 'POST',
        url: 'basket',
        headers: {'Authorization': token},
        body: {
        "userId": userID,
        "bookId": bookID,
        "quantity": 1
        },
    }).then((response) => {
        expect(response.status).equal(201);
    })
});

Cypress.Commands.add('deletarLivro', (livroID, token) => {
    cy.api({
        method: 'DELETE',
        url: 'books/' + livroID,
        headers: {'Authorization': token},
        failOnStatusCode: false,
    }).then((response) => {
        return response
    })
});

Cypress.Commands.add('cancelarReserva', (reservaID, token) => {
    cy.api({
        method: 'DELETE',
        url: 'reservations/' + reservaID,
        headers: {'Authorization': token},
        failOnStatusCode: false,
    }).then((response) => {
        return response
    })
});

Cypress.Commands.add('cadastrarUsuario', (name, email, senha, token) => {
    cy.api({
        method: 'POST',
        url: 'users',
        headers: {'Authorization': token},
        body: {
            "name": name,
            "email": email,
            "password": senha
        }
    }).then((response) => {
        expect(response.status).equal(201)
        return response.body.user.id
    })
});

Cypress.Commands.add('alterarLivro', (token, livroID, livroAlterado) => {
    cy.api({
        method: 'PUT',
        url: 'books/' + livroID,
        headers: {'Authorization': token},
        failOnStatusCode: false,
        body: livroAlterado          
    }).then((response) => {
        return response
    })
});



