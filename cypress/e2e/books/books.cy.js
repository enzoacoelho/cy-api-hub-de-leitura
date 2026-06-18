/// <reference types="cypress"/>
import { faker } from '@faker-js/faker';

import { criarLivro } from '../../support/factory/book.js';
import { cadastrarLivro, alterarLivro, deletarLivro } from '../../support/requests/books.js';

let token;

beforeEach(() => {
    cy.fixture('users').then((usuarios) => {
        cy.gerarToken(usuarios.admin.email, usuarios.admin.password).then(tkn => {
            token = tkn
        });
    });
});

describe('GET - Testes no Catálogo de Livros', () => {

    it('Deve listar livros filtrando por categoria e autor com paginação', () => {
        cy.api({
            method: 'GET',
            url: 'books',
            qs: {
                category: "Ficção",
                author: "Paulo Coelho",
                limit: 10
            }
        }).should(response => {
            expect(response.status).equal(200)
            response.body.books.forEach(livro => {
                expect(livro.category).to.equal("Ficção")
                expect(livro.author).to.equal("Paulo Coelho")
                expect(response.body.books.length).to.be.at.most(10)
            });
        });
    });

    it('Deve buscar por um livro pelo ID e validar todos os campos', () => {
        cy.fixture('books').then((livros) => {
            const livro = livros.harry_potter;

            cy.api({
                method: 'GET',
                url: `books/${livro.id}`
            }).should((response) => {
                expect(response.status).to.eq(200);

                const { book } = response.body;

                expect(book.id).to.eq(livro.id);
                expect(book.title).to.eq(livro.title);
                expect(book.author).to.eq(livro.author);
                expect(book.description).to.eq(livro.description);
                expect(book.category).to.eq(livro.category);
                expect(book.isbn).to.eq(livro.isbn);
                expect(book.editor).to.eq(livro.editor);
                expect(book.language).to.eq(livro.language);
                expect(book.publication_year).to.eq(livro.publication_year);
                expect(book.pages).to.eq(livro.pages);
                expect(book.format).to.eq(livro.format);
                expect(book.total_copies).to.eq(livro.total_copies);
                expect(book.available_copies).to.eq(livro.available_copies);
                expect(book.cover_image).to.eq(livro.cover_image);
                expect(book.created_at).to.eq(livro.created_at);

            });
        });
    });
});

describe('POST - Testes no Catálogo de Livros', () => {

    it('Deve cadastrar um novo livro com sucesso com usuário ADMINISTRADOR', () => {
        const dadosLivro = criarLivro();
        cadastrarLivro(token, dadosLivro).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.message).to.equal("Livro criado com sucesso.");
            expect(response.body.book).to.exist;

            expect(response.body.book.title).to.equal(dadosLivro.title);
            expect(response.body.book.isbn).to.equal(dadosLivro.isbn);
        });

    });

    it('Cenário Negativo - Não deve permitir que usuário PADRÃO cadastre um livro', () => {
        cy.fixture('users').then((usuario) => {
            cy.gerarToken(usuario.padrao.email, usuario.padrao.password).then(tkn => {
                const tokenPadrao = tkn;

                const dadosLivro = criarLivro();
                cadastrarLivro(tokenPadrao, dadosLivro).then(response => {

                    expect(response.status).to.equal(403);
                    expect(response.body.message).to.equal('Acesso negado. Apenas administradores podem realizar esta ação.');

                });

            });
        });
    });

    it('Cenário Negativo - Não deve cadastrar um novo livro com campos obrigatórios em branco', () => {
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
        };

        cadastrarLivro(token, livroComCamposVazios).then(response => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal("\"title\" is not allowed to be empty")
        });
    });

    it('Cenário Negativo - Não deve cadastrar um livro que já existe no catalogo', () => {
        cy.fixture('books').then((livros) => {
            const livroExistente = livros.arte_da_guerra_sem_id;

            //Tenta cadastrar o mesmo livro
            cadastrarLivro(token, livroExistente).then(response => {
                expect(response.status).to.equal(400);
                expect(response.body.message).to.equal("Já existe um livro com este título e autor.");
            });
        });
    });
});

describe('PUT - Testes no Catálogo de Livros', () => {

    it('PUT - Deve atualizar um livro previamente cadastrado - Dinamico', () => {
        const dadosLivro = criarLivro();

        //Cadastra o livro para ter um ID para alterar
        cadastrarLivro(token, dadosLivro).then(resPost => {
            expect(resPost.status).to.equal(201);
            const livroID = resPost.body.book.id;

            // Cria o objeto com os dados alterados (mantendo o resto igual)
            const livroAlterado = {
                ...dadosLivro,
                title: dadosLivro.title + ' Alterado',
                author: dadosLivro.author + ' Alterado',
                description: dadosLivro.description + ' Alterado'

            };

            alterarLivro(token, livroID, livroAlterado).then(resPut => {
                expect(resPut.status).to.equal(200);
                expect(resPut.body.message).to.equal("Livro atualizado com sucesso.");

                // Valida se os campos foram alterados
                expect(resPut.body.bookId).to.equal(livroID);
                expect(resPut.body.updatedFields).to.include('title');
                expect(resPut.body.updatedFields).to.include('author');
                expect(resPut.body.updatedFields).to.include('description');
            });
        });

    });

    it('PUT - Cenário Negativo - Não deve permitir que usuário PADRÃO atualize um livro', () => {

        cy.fixture('users').then((usuarios) => {
            cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tkn => {
                const tokenPadrao = tkn;

                const dadosLivro = criarLivro();
                alterarLivro(tokenPadrao, 1, dadosLivro).then(response => {
                    expect(response.status).to.equal(403);
                    expect(response.body.message).to.equal("Acesso negado. Apenas administradores podem realizar esta ação.");
                    expect(response.body.error).to.equal("ADMIN_REQUIRED");
                });

            });
        });
    });
});

describe('DELETE - Testes no Catálogo de Livros', () => {

    it('DELETE - Deve deletar um livro previamente cadastrado', () => {
        const dadosLivro = criarLivro();

        cadastrarLivro(token, dadosLivro).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.message).to.equal("Livro criado com sucesso.");

            let livroID = response.body.book.id;

            deletarLivro(livroID, token).then(response => {
                expect(response.status).to.equal(200)
                expect(response.body.message).to.equal("Livro deletado com sucesso.")

            });
        });
       
    });


    it('DELETE - Cenario Negativo - Não deve permitir que usuário COMUM delete um livro', () => {
        cy.fixture('users').then((usuarios) => {
            cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tkn => {
                const tokenPadrao = tkn;

                deletarLivro(1, tokenPadrao).then(response => {
                    expect(response.status).to.equal(403);
                    expect(response.body.message).to.equal("Acesso negado. Apenas administradores podem realizar esta ação.");
                    expect(response.body.error).to.equal("ADMIN_REQUIRED");
                });
            });
        });
    });
});




