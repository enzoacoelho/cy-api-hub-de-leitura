/// <reference types="cypress"/>
import { faker } from '@faker-js/faker'
import { criarLivro } from '../../support/factory/book.js'
import * as booksActions from '../../support/requests/books.js'

describe('GET - Listar livros - /api/books', () => {
    it('Deve listar livros do catalogo', () => {

        booksActions.getBooks().then(response => {
            expect(response.status).equal(200)
            expect(response.body).to.have.all.keys('books', 'pagination', 'filters')
            expect(response.body.books).to.be.an('array')

            // 2. Valida a paginação de forma dinâmica
            const { pagination } = response.body
            expect(pagination.currentPage).to.equal(1)
            expect(pagination.showing).to.be.at.least(1)

            // 3. Valida a estrutura de APENAS UM livro (o primeiro da lista)
            const firstBook = response.body.books[0]
            expect(firstBook).to.include.all.keys(
                'id', 'title', 'author', 'category', 'isbn',
                'available_copies', 'total_copies', 'created_at'
            )

            // Validações rápidas de tipo no primeiro livro
            expect(firstBook.id).to.be.a('number')
            expect(firstBook.title).to.be.a('string')
        })
    })

    it('Deve listar livros filtrando por categoria e autor com paginação', () => {
        const filtro = {
            category: "Ficção",
            author: "Paulo Coelho",
            limit: 10
        }

        booksActions.getBooksByFilters(filtro).then(response => {
            expect(response.status).equal(200)
            response.body.books.forEach(livro => {
                expect(livro.category).to.equal("Ficção")
                expect(livro.author).to.equal("Paulo Coelho")
                expect(response.body.books.length).to.be.at.most(10)
            })
        })
    })
})

describe('GET - Listar categorias - /api/books/categories', () => {
    it('Deve listar categorias disponíveis', () => {
        booksActions.getCategories().then((response) => {
            expect(response.status).to.equal(200)

            // 1. Valida as chaves principais da resposta
            expect(response.body).to.have.all.keys('categories', 'total')
            expect(response.body.categories).to.be.an('array')

            // 2. Valida se o "total" bate com o tamanho real da lista retornada
            expect(response.body.total).to.equal(response.body.categories.length)

            // 3. Valida a estrutura e lógica do primeiro item da lista
            const firstCategory = response.body.categories[0]
            expect(firstCategory).to.have.all.keys('name', 'bookCount', 'availableBooks')

            // Validações de tipo e lógica (ex: não pode ter livro negativo)
            expect(firstCategory.name).to.be.a('string')
            expect(firstCategory.bookCount).to.be.a('number').and.be.at.least(0)
            expect(firstCategory.availableBooks).to.be.a('number').and.be.at.least(0)
        })
    })

})

describe('GET - Listar autores - /api/books/authors', () => {

    it('Deve listar autores disponíveis', () => {
        booksActions.getAuthors().then((response) => {
            expect(response.status).to.equal(200)

            // 1. Valida as chaves principais da resposta
            expect(response.body).to.have.all.keys('authors', 'total')
            expect(response.body.authors).to.be.an('array')

            // 2. Valida se o total bate com o tamanho do array recebido
            expect(response.body.total).to.equal(response.body.authors.length)

            // 3. Valida a estrutura e os tipos usando o primeiro autor da lista
            const firstAuthor = response.body.authors[0]
            expect(firstAuthor).to.have.all.keys('name', 'bookCount', 'availableBooks')

            expect(firstAuthor.name).to.be.a('string')
            expect(firstAuthor.bookCount).to.be.a('number').and.be.at.least(0)
            expect(firstAuthor.availableBooks).to.be.a('number').and.be.at.least(0)
        })
    })
})

describe('GET - Listar livros pelo ID - /api/books/:id', () => {
    it('Deve buscar por um livro pelo ID e validar todos os campos', () => {
        cy.fixture('books').then((livros) => {
            const livro = livros.harry_potter

            booksActions.getBooksById(livro.id).then((response) => {
                expect(response.status).to.eq(200)

                const { book } = response.body

                expect(book.id).to.eq(livro.id)
                expect(book.title).to.eq(livro.title)
                expect(book.author).to.eq(livro.author)
                expect(book.description).to.eq(livro.description)
                expect(book.category).to.eq(livro.category)
                expect(book.isbn).to.eq(livro.isbn)
                expect(book.editor).to.eq(livro.editor)
                expect(book.language).to.eq(livro.language)
                expect(book.publication_year).to.eq(livro.publication_year)
                expect(book.pages).to.eq(livro.pages)
                expect(book.format).to.eq(livro.format)
                expect(book.total_copies).to.eq(livro.total_copies)
                expect(book.available_copies).to.eq(livro.available_copies)
                expect(book.cover_image).to.eq(livro.cover_image)
                expect(book.created_at).to.eq(livro.created_at)

            })
        })
    })

    it('Não deve buscar livro com ID inexistente ou inválido', () => {
        const randomId = 4544544
        booksActions.getBooksById(randomId, false).then((response) => {
            expect(response.status).to.eq(404)
            expect(response.body.message).to.eq('Livro não encontrado.')

        })
    })
})



