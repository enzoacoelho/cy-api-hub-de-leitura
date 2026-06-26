export const create = (tokenAdmin, livro) => {
    return cy.api({
        method: 'POST',
        url: 'books',
        headers: { Authorization: tokenAdmin },
        failOnStatusCode: false,
        body: livro
    })
}

export const getBooks = () => {
    return cy.api({
        method: 'GET',
        url: `books`
    })
}

export const getBooksById = (bookId) => {
    return cy.api({
        method: 'GET',
        url: `books/${bookId}`,
        failOnStatusCode: false
    })
}

export const getBooksByFilters = (filtro) => {
    return cy.api({
        method: 'GET',
        url: `books`,
        qs: filtro
    })
}

export const getCategories = () => {
    return cy.api({
        method: 'GET',
        url: `books/categories`,
    })
}

export const getAuthors = () => {
    return cy.api({
        method: 'GET',
        url: `books/authors`,
    })
}

export const update = (tokenAdmin, bookId, livro) => {
    return cy.api({
        method: 'PUT',
        url: `books/${bookId}`,
        headers: { Authorization: tokenAdmin },
        failOnStatusCode: false,
        body: livro
    })
}

export const removeById = (bookId, tokenAdmin) => {
    return cy.api({
        method: 'DELETE',
        url: `books/${bookId}`,
        headers: { 'Authorization': tokenAdmin },
        failOnStatusCode: false
    })
}

