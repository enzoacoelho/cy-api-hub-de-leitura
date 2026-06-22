export const create = (idBook, token) => {
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

export const createWithNotes = (idBook, notes, token) => {
    return cy.api({
        method: 'POST',
        url: 'reservations',
        headers: {
            Authorization: token
        },
        body: {
            bookId: idBook,
            notes: notes
        }
    })
}

export const getReservations = (token) => {
    return cy.api({
        method: 'GET',
        url: 'reservations',
        headers: { Authorization: token },
        failOnStatusCode: false
    })
}

export const getReservationsByStatus = (token, status) => {
    return cy.api({
        method: 'GET',
        url: 'reservations',
        qs: { status: status },
        headers: { Authorization: token },
        failOnStatusCode: false
    })
}

export const cancel = (reservaID, token) => {
    return cy.api({
        method: 'DELETE',
        url: 'reservations/' + reservaID,
        headers: { Authorization: token },
        failOnStatusCode: false
    })
}

export const alter = (token, reservaID, novoStatus, notaDinamica) => {
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

export const cleanAll = (token) => {
    return cy.api({
        method: 'GET',
        url: 'reservations',
        headers: { Authorization: token },
        qs: { status: "active" },
        failOnStatusCode: false
    }).then((response) => {

        if (response.body.reservations && response.body.reservations.length > 0) {

            const reservas = response.body.reservations

            reservas.forEach((reserva) => {
                cancel(reserva.id, token)
            })

            cy.log(`Limpeza concluída: ${reservas.length} reservas removidas.`)

        } else {

            cy.log('Nenhuma reserva encontrada para limpar.')
        }
    })
}
