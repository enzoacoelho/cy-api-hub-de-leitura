export const create = (bookId, tokenPadrao) => {
    return cy.api({
        method: 'POST',
        url: 'reservations',
        failOnStatusCode: false,
        headers: {
            Authorization: tokenPadrao
        },
        body: {
            bookId: bookId
        }
    })
}

export const createWithNotes = (bookId, notes, tokenPadrao) => {
    return cy.api({
        method: 'POST',
        url: 'reservations',
        failOnStatusCode: false,
        headers: {
            Authorization: tokenPadrao
        },
        body: {
            bookId: bookId,
            notes: notes
        }
    })
}

export const createFromBasket = (tokenPadrao, notes, clearBasket) => {
    console.log('entrou no createcombasket')
    return cy.api({
        method: 'POST',
        url: 'reservations/from-basket',
        failOnStatusCode: false,
        headers: { Authorization: tokenPadrao },
        body: {
            notes: notes,
            clearBasket: clearBasket
        },
    })
}

export const getReservations = (tokenPadrao) => {
    return cy.api({
        method: 'GET',
        url: 'reservations',
        headers: { Authorization: tokenPadrao },
        failOnStatusCode: false
    })
}

export const getReservationsByStatus = (tokenPadrao, status) => {
    return cy.api({
        method: 'GET',
        url: 'reservations',
        qs: { status: status },
        headers: { Authorization: tokenPadrao },
        failOnStatusCode: false
    })
}

export const cancel = (reservationId, tokenPadrao) => {
    console.log('chegou no cancel')
    return cy.api({
        method: 'DELETE',
        url: 'reservations/' + reservationId,
        headers: { Authorization: tokenPadrao },
        failOnStatusCode: false
    })
}

export const alterAction = (reservationId, tokenPadrao, action) => {
    return cy.api({
        method: 'PUT',
        url: `reservations/${reservationId}`,
        headers: { 'Authorization': tokenPadrao },
        failOnStatusCode: false,
        body: {
            action: action
        }
    })
}

export const alter = (tokenPadrao, reservationId, newStatus, notes) => {
    return cy.api({
        method: 'PUT',
        url: `admin/reservations/${reservationId}`,
        headers: { Authorization: tokenPadrao },
        failOnStatusCode: false,
        body: {
            status: newStatus,
            notes: notes
        }
    })
}

export const cleanAll = (tokenPadrao) => {
    return cy.api({
        method: 'GET',
        url: 'reservations',
        headers: { Authorization: tokenPadrao },
        qs: { status: "active" },
        failOnStatusCode: false
    }).then((response) => {

        console.log(response)

        if (response.body.reservations && response.body.reservations.length > 0) {
             

            const reservas = response.body.reservations
            console.log(reservas)

            reservas.forEach((reserva) => {
                cancel(reserva.id, tokenPadrao)
            })

            cy.log(`Limpeza concluída: ${reservas.length} reservas removidas.`)

        } else {

            cy.log('Nenhuma reserva encontrada para limpar.')
        }
    })
}
