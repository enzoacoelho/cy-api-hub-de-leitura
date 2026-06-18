export const limparCesta = (userID, token, failOnStatusCode='') => {
    const failStatus = failOnStatusCode

    if (failStatus){
        failStatus = true
    }

    return cy.api({
        method: 'DELETE',
        url: `basket/${userID}`,
        headers: { Authorization: token },
        failOnStatusCode: failStatus
    })
}

export const verCesta = (userID, token, failOnStatusCode) => {
    const failStatus = failOnStatusCode

    if (failStatus){
        failStatus = true
    }

    return cy.api({
        method: 'GET',
        url: `basket/${userID}`,
        headers: { Authorization: token },
        failOnStatusCode: failStatus
    })
}

export const adicionarLivroCesta = (userID, bookID, quantity, token, failOnStatusCode) => {
    const failStatus = failOnStatusCode

    if (failStatus){
        failStatus = true
    }

    return cy.api({
        method: 'POST',
        url: 'basket',
        headers: { Authorization: token },
        body: {
            userId: userID,
            bookId: bookID,
            quantity: quantity
        },
        failOnStatusCode: failStatus
    })
}