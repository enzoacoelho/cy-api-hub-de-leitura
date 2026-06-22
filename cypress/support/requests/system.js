export const checkHealth = () => {
    return cy.api({
        method: 'GET',
        url: 'health'
    })
}

export const checkInfos = () => {
    return cy.api({
        method: 'GET',
        url: 'info',
    })
}

