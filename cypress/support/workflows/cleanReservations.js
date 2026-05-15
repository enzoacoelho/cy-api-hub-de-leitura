import { cancelarReserva } from '../requests/reservations'

export const limparReservas = (token) => {
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
                cancelarReserva(reserva.id, token)
            })

            cy.log(`Limpeza concluída: ${reservas.length} reservas removidas.`)

        } else {

            cy.log('Nenhuma reserva encontrada para limpar.')
        }
    })
}