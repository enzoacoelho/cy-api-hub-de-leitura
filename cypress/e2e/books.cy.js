/// <reference types="cypress"/>
import { faker } from '@faker-js/faker';

let token

beforeEach(() => {
    cy.gerarToken('admin@biblioteca.com', 'admin123').then(tkn => {
        token = tkn
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
        cy.api({
            method: 'GET',
            url: 'books/10'

        }).should(response => {
            expect(response.status).equal(200)
            expect(response.body.book.id).equal(10)
            expect(response.body.book.title).equal('Harry Potter e a Pedra Filosofal')
            expect(response.body.book.author).to.include('Rowling')
            expect(response.body.book.editor).equal('Editora Rocco')
            expect(response.body.book.category).equal('Fantasia')
            expect(response.body.book.language).equal('Português')
            expect(response.body.book.publication_year).equal(2008)
            expect(response.body.book.pages).equal(256)
            expect(response.body.book.format).equal('Físico')
            expect(response.body.book.description).to.include('Harry Potter')

        });
    });
});

describe('POST - Testes no Catálogo de Livros', () => {

    it('Deve cadastrar um novo livro com sucesso com usuário ADMINISTRADOR', () => {
        const livroFake = {
            title: faker.lorem.words(3),
            author: faker.person.fullName(),
            description: faker.lorem.paragraph(),
            category: faker.helpers.arrayElement(['Ficção', 'Fantasia', 'Romance', 'Biografia', 'História']),
            isbn: faker.string.numeric(13),
            editor: faker.company.name(),
            language: faker.helpers.arrayElement(['Português', 'Inglês', 'Espanhol']),
            publication_year: faker.date.past(20).getFullYear(),
            pages: 965,
            format: faker.helpers.arrayElement(['Físico', 'Digital']),
            total_copies: 50,
            available_copies: 45
        }
        cy.cadastrarLivro(token,
            livroFake.title,
            livroFake.author,
            livroFake.description,
            livroFake.category,
            livroFake.isbn,
            livroFake.editor,
            livroFake.language,
            livroFake.publication_year,
            livroFake.pages,
            livroFake.format,
            livroFake.total_copies,
            livroFake.available_copies
        ).then(response => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal("Livro criado com sucesso.")
            expect(response.body.book).to.exist
            expect(response.body.book.title).to.equal(livroFake.title);

        });
    });

    it('Cenário Negativo - Não deve permitir que usuário PADRÃO cadastre um livro', () => {
        cy.gerarToken('maria44@email.com', 'senha123').then(tknComum => {
            const livroFake = {
                title: faker.lorem.words(3),
                author: faker.person.fullName(),
                description: faker.lorem.paragraph(),
                category: faker.helpers.arrayElement(['Ficção', 'Fantasia', 'Romance', 'Biografia', 'História']),
                isbn: faker.string.numeric(13),
                editor: faker.company.name(),
                language: faker.helpers.arrayElement(['Português', 'Inglês', 'Espanhol']),
                publication_year: faker.date.past(20).getFullYear(),
                pages: 965,
                format: faker.helpers.arrayElement(['Físico', 'Digital']),
                total_copies: 50,
                available_copies: 45
            }
            cy.cadastrarLivro(tknComum,
                livroFake.title,
                livroFake.author,
                livroFake.description,
                livroFake.category,
                livroFake.isbn,
                livroFake.editor,
                livroFake.language,
                livroFake.publication_year,
                livroFake.pages,
                livroFake.format,
                livroFake.total_copies,
                livroFake.available_copies
            ).then(response => {
                expect(response.status).to.equal(403)
                expect(response.body.message).to.equal('Acesso negado. Apenas administradores podem realizar esta ação.');
            });
        });
    });

    it('Cenário Negativo - Não deve cadastrar um novo livro com campos obrigatórios em branco', () => {
        cy.cadastrarLivro(token, "", "", "descrição do livro", "",
            "", "Edita XY", "Português", 1989, "", "Físico", 9, 5
        ).then(response => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal("\"title\" is not allowed to be empty")
        });
    });

    it('Cenário Negativo - Não deve cadastrar um livro que já existe no catalogo', () => {
        cy.cadastrarLivro(token, "O Cortiço", "Aluísio Azevedo",
            "Romance naturalista que retrata a vida em um cortiço",
            "Literatura Brasileira", "978-85-260-1320-6", "Editora Ática",
            "Português", 1890, 312, "Físico", 4, 4
        ).then(response => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal("Já existe um livro com este título e autor.")
        });
    });
});

describe('PUT - Testes no Catálogo de Livros', () => {

    it('PUT - Deve atualizar um livro previamente cadastrado - Dinamico', () => {
        const livroFake = {
            title: faker.lorem.words(3),
            author: faker.person.fullName(),
            description: faker.lorem.paragraph(),
            category: faker.helpers.arrayElement(['Ficção', 'Fantasia', 'Romance', 'Biografia', 'História']),
            isbn: faker.string.numeric(13),
            editor: faker.company.name(),
            language: faker.helpers.arrayElement(['Português', 'Inglês', 'Espanhol']),
            publication_year: faker.date.past(20).getFullYear(),
            pages: 965,
            format: faker.helpers.arrayElement(['Físico', 'Digital']),
            total_copies: 50,
            available_copies: 45
        }
        cy.cadastrarLivro(token,
            livroFake.title,
            livroFake.author,
            livroFake.description,
            livroFake.category,
            livroFake.isbn,
            livroFake.editor,
            livroFake.language,
            livroFake.publication_year,
            livroFake.pages,
            livroFake.format,
            livroFake.total_copies,
            livroFake.available_copies
        ).then(response => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal("Livro criado com sucesso.")

            let livroID = response.body.book.id;

            cy.alterarLivro(livroID,
                token,
                livroFake.title + ' Alterado',
                livroFake.author + ' Alterado',
                livroFake.description,
                livroFake.category,
                livroFake.isbn,
                livroFake.editor,
                livroFake.language,
                livroFake.publication_year,
                livroFake.pages,
                livroFake.format,
                livroFake.total_copies,
                livroFake.available_copies).then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body.message).to.equal("Livro atualizado com sucesso.")

                });
            });

    });

    it('PUT - Cenário Negativo - Não deve permitir que usuário PADRÃO atualize um livro', () => {

        cy.gerarToken('maria44@email.com', 'senha123').then(tokenComum => {
            const livroFake = {
                title: faker.lorem.words(3),
                author: faker.person.fullName(),
                description: faker.lorem.paragraph(),
                category: faker.helpers.arrayElement(['Ficção', 'Fantasia', 'Romance', 'Biografia', 'História']),
                isbn: faker.string.numeric(13),
                editor: faker.company.name(),
                language: faker.helpers.arrayElement(['Português', 'Inglês', 'Espanhol']),
                publication_year: faker.date.past(20).getFullYear(),
                pages: 965,
                format: faker.helpers.arrayElement(['Físico', 'Digital']),
                total_copies: 50,
                available_copies: 45
            }
            cy.cadastrarLivro(token,
                livroFake.title,
                livroFake.author,
                livroFake.description,
                livroFake.category,
                livroFake.isbn,
                livroFake.editor,
                livroFake.language,
                livroFake.publication_year,
                livroFake.pages,
                livroFake.format,
                livroFake.total_copies,
                livroFake.available_copies
            ).then(response => {
                expect(response.status).to.equal(201)
                expect(response.body.message).to.equal("Livro criado com sucesso.")

                let livroID = response.body.book.id;

                cy.alterarLivro(livroID,
                    tokenComum,
                    livroFake.title + ' Alterado',
                    livroFake.author + ' Alterado',
                    livroFake.description,
                    livroFake.category,
                    livroFake.isbn,
                    livroFake.editor,
                    livroFake.language,
                    livroFake.publication_year,
                    livroFake.pages,
                    livroFake.format,
                    livroFake.total_copies,
                    livroFake.available_copies).then(response => {
                        expect(response.status).to.equal(403)
                        expect(response.body.message).to.equal("Acesso negado. Apenas administradores podem realizar esta ação.")

                    });
            });
        });
    });

    it('DELETE - Deve deletar um livro previamente cadastrado', () => {
        const livroFake = {
            title: faker.lorem.words(3),
            author: faker.person.fullName(),
            description: faker.lorem.paragraph(),
            category: faker.helpers.arrayElement(['Ficção', 'Fantasia', 'Romance', 'Biografia', 'História']),
            isbn: faker.string.numeric(13),
            editor: faker.company.name(),
            language: faker.helpers.arrayElement(['Português', 'Inglês', 'Espanhol']),
            publication_year: faker.date.past(20).getFullYear(),
            pages: 965,
            format: faker.helpers.arrayElement(['Físico', 'Digital']),
            total_copies: 50,
            available_copies: 45
        }
        cy.cadastrarLivro(token,
            livroFake.title,
            livroFake.author,
            livroFake.description,
            livroFake.category,
            livroFake.isbn,
            livroFake.editor,
            livroFake.language,
            livroFake.publication_year,
            livroFake.pages,
            livroFake.format,
            livroFake.total_copies,
            livroFake.available_copies
        ).then(response => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal("Livro criado com sucesso.")

            let livroID = response.body.book.id;

            cy.deletarLivro(livroID, token).then(response => {
                expect(response.status).to.equal(200)
                expect(response.body.message).to.equal("Livro deletado com sucesso.")

            });
        });
    });
});

describe('DELETE - Testes no Catálogo de Livros', () => {

    it('DELETE - Cenario Negativo - Não deve permitir que usuário COMUM delete um livro', () => {
        cy.gerarToken('maria44@email.com', 'senha123').then(tokenComum => {
            const livroFake = {
                title: faker.lorem.words(3),
                author: faker.person.fullName(),
                description: faker.lorem.paragraph(),
                category: faker.helpers.arrayElement(['Ficção', 'Fantasia', 'Romance', 'Biografia', 'História']),
                isbn: faker.string.numeric(13),
                editor: faker.company.name(),
                language: faker.helpers.arrayElement(['Português', 'Inglês', 'Espanhol']),
                publication_year: faker.date.past(20).getFullYear(),
                pages: 965,
                format: faker.helpers.arrayElement(['Físico', 'Digital']),
                total_copies: 50,
                available_copies: 45
            }
            cy.cadastrarLivro(token,
                livroFake.title,
                livroFake.author,
                livroFake.description,
                livroFake.category,
                livroFake.isbn,
                livroFake.editor,
                livroFake.language,
                livroFake.publication_year,
                livroFake.pages,
                livroFake.format,
                livroFake.total_copies,
                livroFake.available_copies
            ).then(response => {
                expect(response.status).to.equal(201)
                expect(response.body.message).to.equal("Livro criado com sucesso.")

                let livroID = response.body.book.id;

                cy.deletarLivro(livroID, tokenComum).then(response => {
                    expect(response.status).to.equal(403)
                    expect(response.body.message).to.equal("Acesso negado. Apenas administradores podem realizar esta ação.")

                });

            });
        });
    });
});




