export const getUsers = (tokenAdmin) => {
    return cy.api({
        method: 'GET',
        url: 'users',
        failOnStatusCode: false,
        headers: { Authorization: tokenAdmin }
    })       
}

export const getUserById = (tokenAdmin, userId) => {
    return cy.api({
        method: 'GET',
        url: `users/${userId}`,
        failOnStatusCode: false,
        headers: { Authorization: tokenAdmin }
    })       
}