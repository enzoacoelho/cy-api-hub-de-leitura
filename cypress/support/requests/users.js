export const cadastrarUsuario = (name, email, senha, token) => {
    return cy.api({
        method: 'POST',
        url: 'users',
        headers: { Authorization: token },
        body: {
            name,
            email,
            password: senha
        }
    }).then((response) => {

        expect(response.status).to.eq(201)

        return response.body.user.id
    })
}