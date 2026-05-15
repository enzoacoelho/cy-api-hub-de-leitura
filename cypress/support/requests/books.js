export const cadastrarLivro = (token, livro) => {
    return cy.api({
        method: 'POST',
        url: 'books',
        headers: { Authorization: token },
        failOnStatusCode: false,
        body: livro
    })
}

export const alterarLivro = (token, bookID, livro) => {
    return cy.api({
        method: 'PUT',
        url: `books/${bookID}`,
        headers: { Authorization: token },
        failOnStatusCode: false,
        body: livro
    })
}

export const deletarLivro = (livroID, token) => {

    return cy.api({
        method: 'DELETE',
        url: 'books/' + livroID,
        headers: {'Authorization': token},
        failOnStatusCode: false,
    }).then((response) => {
        return response
    })
}

