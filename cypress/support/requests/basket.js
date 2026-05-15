export const limparCesta = (token, userID) => {
    return cy.api({
        method: 'DELETE',
        url: `basket/${userID}`,
        headers: { Authorization: token }
    })
}

export const verCesta = (userID, token) => {
    return cy.api({
        method: 'GET',
        url: `basket/${userID}`,
        headers: { Authorization: token }
    })
}

export const adicionarLivroCesta = (userID, bookID, token) => {
    return cy.api({
        method: 'POST',
        url: 'basket',
        headers: { Authorization: token },
        body: {
            userId: userID,
            bookId: bookID,
            quantity: 1
        }
    })
}