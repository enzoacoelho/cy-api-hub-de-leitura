/// <reference types="cypress"/>
import { faker } from '@faker-js/faker'
import { createBook } from '../../support/factory/book.js'
import * as booksActions from '../../support/requests/books.js'

let tokenAdmin
let tokenPadrao
let bookId

beforeEach(() => {
    cy.fixture('users').then((usuarios) => {
        cy.gerarToken(usuarios.admin.email, usuarios.admin.password).then(tkn => {
            tokenAdmin = tkn
        })

        cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tkn => {
            tokenPadrao = tkn
        })
    })

    cy.fixture('books').then((book) => {
        bookId = book.dom_casmurro.id

    })
})

describe('POST - Gerenciamento do catálogo de livros (apenas ADMIN) - api/books', () => {

    it('Deve cadastrar um novo livro com sucesso', () => {
        const dadosLivro = createBook()
        cy.registerBook(tokenAdmin, dadosLivro).then(response => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal("Livro criado com sucesso.")
            expect(response.body.book).to.exist

            expect(response.body.book.title).to.equal(dadosLivro.title)
            expect(response.body.book.isbn).to.equal(dadosLivro.isbn)
        })

    })

    it('Não deve permitir que usuário PADRÃO cadastre um livro', () => {      
        const dadosLivro = createBook()
        cy.registerBook(tokenPadrao, dadosLivro).then(response => {
            expect(response.status).to.equal(403)
            expect(response.body.message).to.equal('Acesso negado. Apenas administradores podem realizar esta ação.')
        })       
    })

    it('Não deve cadastrar um novo livro com campos obrigatórios em branco', () => {
        const livroComCamposVazios = {
            title: "",          // Campo que deve causar o erro 400
            author: "",
            description: "descrição do livro",
            category: "",
            isbn: "",
            editor: "Edita XY",
            language: "Português",
            publication_year: 1989,
            pages: "",
            format: "Físico",
            total_copies: 9,
            available_copies: 5
        }

        cy.registerBook(tokenAdmin, livroComCamposVazios).then(response => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal("\"title\" is not allowed to be empty")
        })
    })

    it('Não deve cadastrar um livro que já existe no catálogo', () => {
        cy.fixture('books').then((livros) => {
            const livroExistente = livros.arte_da_guerra_sem_id

            cy.registerBook(tokenAdmin, livroExistente).then(response => {
                expect(response.status).to.equal(400)
                expect(response.body.message).to.equal("Já existe um livro com este título e autor.")
            })
        })
    })
})

describe('PUT - Gerenciamento do catálogo de livros (apenas ADMIN) - api/books/:bookId', () => {
    it('Deve atualizar um livro previamente cadastrado - Dinamico', () => {
        const dadosLivro = createBook()

        //Cadastra o livro para ter um ID para alterar
        cy.registerBook(tokenAdmin, dadosLivro).then(response => {
            const livroID = response.body.book.id

            // Cria o objeto com os dados alterados (mantendo o resto igual)
            const livroAlterado = {
                ...dadosLivro,
                title: dadosLivro.title + ' Alterado',
                author: dadosLivro.author + ' Alterado',
                description: dadosLivro.description + ' Alterado'

            }

            booksActions.update(tokenAdmin, livroID, livroAlterado).then(resPut => {
                expect(resPut.status).to.equal(200)
                expect(resPut.body.message).to.equal("Livro atualizado com sucesso.")

                // Valida se os campos foram alterados
                expect(resPut.body.bookId).to.equal(livroID)
                expect(resPut.body.updatedFields).to.include('title')
                expect(resPut.body.updatedFields).to.include('author')
                expect(resPut.body.updatedFields).to.include('description')
            })
        })
    })

    it('Não deve permitir que usuário PADRÃO atualize um livro', () => {           
        const dadosLivro = createBook()
        booksActions.update(tokenPadrao, bookId, dadosLivro).then(response => {
            expect(response.status).to.equal(403)
            expect(response.body.message).to.equal("Acesso negado. Apenas administradores podem realizar esta ação.")
            expect(response.body.error).to.equal("ADMIN_REQUIRED")
        })       
    })
})

describe('DELETE - Gerenciamento do catálogo de livros (apenas ADMIN) - api/books/:bookId', () => {
    it('DELETE - Deve deletar um livro previamente cadastrado', () => {
        const dadosLivro = createBook()

        cy.registerBook(tokenAdmin, dadosLivro).then(response => {
            const livroID = response.body.book.id

            booksActions.removeById(livroID, tokenAdmin).then(response => {
                expect(response.status).to.equal(200)
                expect(response.body.message).to.equal("Livro deletado com sucesso.")
            })
        })
    })


    it('DELETE - Não deve permitir que usuário COMUM delete um livro', () => {    
        booksActions.removeById(bookId, tokenPadrao).then(response => {
            expect(response.status).to.equal(403)
            expect(response.body.message).to.equal("Acesso negado. Apenas administradores podem realizar esta ação.")
            expect(response.body.error).to.equal("ADMIN_REQUIRED")
        })       
    })
})




