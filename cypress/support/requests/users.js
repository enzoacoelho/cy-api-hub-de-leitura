export const cadastrarUsuario = (name, email, password, token) => {
    return cy.api({
        method: 'POST',
        url: 'users',
        headers: { Authorization: token },
        body: {
            name,
            email,
            password: password
        }
    }).then((response) => {

        expect(response.status).to.eq(201)

        return response.body.user.id
    })
}