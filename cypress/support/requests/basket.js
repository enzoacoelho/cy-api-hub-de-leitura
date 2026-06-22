export const clear = (userID, token) => {
    return cy.api({
        method: 'DELETE',
        url: `basket/${userID}`,
        headers: { Authorization: token },
        failOnStatusCode: false
    })
}

export const clearById = (userID, bookID, token) => {
    return cy.api({
        method: 'DELETE',
        url: `basket/${userID}/${bookID}`,
        headers: { Authorization: token },
        failOnStatusCode: false
    })
}


export const getBasket = (userID, token) => {
    return cy.api({
        method: 'GET',
        url: `basket/${userID}`,
        headers: { Authorization: token },
        failOnStatusCode: false
    })
}

export const addBooks = (userID, bookID, token, quantity = 1) => {
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
}