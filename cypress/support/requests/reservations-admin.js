export const getReservations = (tokenAdmin) => {
    return cy.api({
        method: 'GET',
        url: 'admin/reservations',
        headers: { Authorization: tokenAdmin },
        failOnStatusCode: false
    })
}

export const searchReservation = (tokenAdmin, userId, bookId) => {
    return cy.api({
        method: 'GET',
        url: 'admin/reservations/search',
        headers: { Authorization: tokenAdmin },
        failOnStatusCode: false,
        body: {
            "userId": userId,
            "status": "active",
            "bookId": bookId
        }
    })
}

export const getStats = (tokenAdmin) => {
    return cy.api({
        method: 'GET',
        url: 'admin/reservations/stats',
        headers: { Authorization: tokenAdmin },
        failOnStatusCode: false
    })
}

export const alterStatus = (reservationId, tokenAdmin, newStatus, notes) => {
    return cy.api({
        method: 'PUT',
         url: `admin/reservations/${reservationId}`,
        headers: { 'Authorization': tokenAdmin },
        failOnStatusCode: false,
        body: {
            status: newStatus,
            notes: notes
        }
    })
}

export const extendReturnDate = (tokenAdmin, reservationId, extendDays) => {
    return cy.api({
        method: 'PUT',
        url: `admin/reservations/${reservationId}/extend`,
        headers: { 'Authorization': tokenAdmin },
        failOnStatusCode: false,
        body: {
            days: extendDays
        }
    })
}


