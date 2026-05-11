Cypress.Commands.add('cadastrar', (name, email, senha) => {
    cy.api({
        method: 'POST',
        url: 'users',
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