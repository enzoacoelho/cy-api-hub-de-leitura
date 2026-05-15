export const reservarLivro = (idBook, token) => {
    return cy.api({
        method: 'POST',
        url: 'reservations',
        headers: {
            Authorization: token
        },
        body: {
            bookId: idBook
        }
    })
}

export const cancelarReserva = (reservaID, token) => {
    return cy.api({
        method: 'DELETE',
        url: 'reservations/' + reservaID,
        headers: { Authorization: token },
        failOnStatusCode: false
    })
}

export const alterarReserva = (token, reservaID, novoStatus, notaDinamica) => {
    return cy.api({
        method: 'PUT',
        url: `admin/reservations/${reservaID}`,
        headers: { Authorization: token },
        body: {
            status: novoStatus,
            notes: notaDinamica
        }
    })
}