export const clear = (userId, tokenPadrao) => {
    return cy.api({
        method: 'DELETE',
        url: `basket/${userId}`,
        headers: { Authorization: tokenPadrao },
        failOnStatusCode: false
    })
}

export const clearById = (userId, bookId, tokenPadrao) => {
    return cy.api({
        method: 'DELETE',
        url: `basket/${userId}/${bookId}`,
        headers: { Authorization: tokenPadrao },
        failOnStatusCode: false
    })
}


export const getBasket = (userId, tokenPadrao) => {
    return cy.api({
        method: 'GET',
        url: `basket/${userId}`,
        headers: { Authorization: tokenPadrao },
        failOnStatusCode: false
    })
}

export const addBooks = (userId, bookId, tokenPadrao, quantity = 1) => {
    return cy.api({
        method: 'POST',
        url: 'basket',
        headers: { Authorization: tokenPadrao },
        body: {
            userId: userId,
            bookId: bookId,
            quantity: quantity
        },
        failOnStatusCode: false
    })
}