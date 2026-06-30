export const getUserById = (token, userId) => {
    return cy.api({
        method: 'GET',
        url: `users/${userId}`,
        failOnStatusCode: false,
        headers: { Authorization: token }
    })       
}

export const alter = (token, userId, name, email, password) => {
    return cy.api({
        method: 'PUT',
        url: `users/${userId}`,
        failOnStatusCode: false,
        headers: { Authorization: token },
        body: {
                "name": name + ' Alterado',
                "email": 'alterado' + email,
                "password": 'alt' + password
            }
    })       
}



