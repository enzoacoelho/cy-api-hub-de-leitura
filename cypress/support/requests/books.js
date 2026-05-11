Cypress.Commands.add('cadastrar', (token, title, author, description, category,
    isbn, editor, language, publication_year, pages, format, total_copies, available_copies
) => {
    cy.api({
        method: 'POST',
        url: 'books',
        headers: {'Authorization': token},
        failOnStatusCode: false,
        body: {
            "title": title,
            "author": author,
            "description": description,
            "category": category,
            "isbn": isbn,
            "editor": editor,
            "language": language,
            "publication_year": publication_year,
            "pages": pages,
            "format": format,
            "total_copies": total_copies,
            "available_copies": available_copies
        }
    }).then((response) => {
        return response
    })
});

Cypress.Commands.add('alterar', (livroID, token, title, author, description, category,
    isbn, editor, language, publication_year, pages, format, total_copies, available_copies
) => {
    cy.api({
        method: 'PUT',
        url: 'books/' + livroID,
        headers: {'Authorization': token},
        failOnStatusCode: false,
        body: {
            "title": title,
            "author": author,
            "description": description,
            "category": category,
            "isbn": isbn,
            "editor": editor,
            "language": language,
            "publication_year": publication_year,
            "pages": pages,
            "format": format,
            "total_copies": total_copies,
            "available_copies": available_copies
        }
    }).then((response) => {
        return response
    })
});

Cypress.Commands.add('deletar', (livroID, token) => {
    cy.api({
        method: 'DELETE',
        url: 'books/' + livroID,
        headers: {'Authorization': token},
        failOnStatusCode: false,
    }).then((response) => {
        return response
    })
});