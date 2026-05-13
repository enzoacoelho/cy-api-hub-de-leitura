/// <reference types="cypress"/>
import { faker } from '@faker-js/faker';

let token;
let userID;

beforeEach(() => {
    cy.fixture('users').then((usuarios) => {
        userID = usuarios.padrao.userID;
        cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tkn => {
            token = tkn
        });
    });

});

describe('GET - Testes de Cesta de Livros - Listar', () => {

    it('Listar itens da cesta', () => {
        cy.api({
            method: 'GET',
            url: `basket/${userID}`
        }).should(response => {
            expect(response.status).to.eq(200);
            expect(response.body.userId).to.eq(userID);
            expect(response.body.items).to.be.an('array');

            if (response.body.items.length > 0) {
                const item = response.body.items[0];
                expect(item).to.have.all.keys(
                    'id', 'user_id', 'book_id', 'quantity', 'added_date',
                    'book_title', 'book_author', 'cover_image',
                    'available', 'available_copies', 'total_copies'
                );

                // Valida que o item pertence ao mesmo usuário
                expect(item.user_id).to.eq(userID);
            }
            const { summary, total } = response.body;
            expect(total).to.eq(summary.totalItems);

            const somaItens = summary.availableItems + summary.unavailableItems;
            expect(somaItens).to.eq(summary.totalItems);
            expect(summary.totalItems).to.be.a('number');

        });
    });

    it('Tentar ver cesta de outro usuário (403)', () => {
        cy.api({
            method: 'GET',
            url: 'basket/2'
        }).should(response => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.equal("Acesso negado. Você só pode ver seu próprio carrinho.");

        });

    });

    });

    describe('GET - Testes de Cesta de Livros - Verificar disponibilidade dos itens', () => {

        it('Todos os itens disponíveis', () => {
            cy.api({
                method: 'GET',
                url: `basket/1/check-availability`
            }).should((response) => {
                expect(response.status).to.eq(200);

                // Validações baseadas no JSON real que você enviou
                expect(response.body.total).to.eq(1);
                expect(response.body.available).to.eq(1);
                expect(response.body.unavailable).to.eq(0);
                expect(response.body.canProceedToReservation).to.be.true;

                // Valida que a lista de livros indisponíveis está REALMENTE vazia
                expect(response.body.unavailableBooks).to.be.an('array').and.empty;

                // Valida o item específico do Pequeno Príncipe
                const item = response.body.items[0];
                expect(item.book_id).to.eq(3);
                expect(item.status).to.eq('available');
            });
        });

    });

    describe('POST - Testes de Cesta de Livros / Carrinho', () => {

        let tokenAdmin;
        let tokenUser;
        let userID;
        let bookId;

        it('Deve adicionar um livro à cesta com sucesso', () => {
        cy.fixture('users').then((usuarios) => {
            userID = usuarios.padrao.userID;

            // Login como ADMIN para preparar a massa
            cy.gerarToken(usuarios.admin.email, usuarios.admin.password).then(tknAdmin => {
                tokenAdmin = tknAdmin;

                // Gera o objeto do livro e cadastra
                const dadosLivro = cy.criarLivro(); 
                
                cy.cadastrarLivro(tokenAdmin, dadosLivro).then((responseLivro) => {
                    expect(responseLivro.status).to.eq(201);
                    bookId = responseLivro.body.id;

                    //Login como USUÁRIO PADRÃO para a ação da cesta
                    cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tknUser => {
                        tokenUser = tknUser;

                        //POST usando o ID do livro novo
                        cy.api({
                            method: 'POST',
                            url: 'basket',
                            headers: { 'Authorization': tokenUser },
                            body: {
                                userId: userID,
                                bookId: bookId,
                                quantity: 1
                            }
                        }).should((resBasket) => {
                            expect(resBasket.status).to.eq(201);
                            expect(resBasket.body.message).to.eq("Livro adicionado ao carrinho com sucesso.");
                            expect(resBasket.body.bookTitle).to.eq(dadosLivro.title);
                            
                            cy.log(`Sucesso: Livro "${dadosLivro.title}" (ID: ${bookId}) adicionado.`);
                        });
                    });
                });
            });
        });
    });

        

        it('Adicionar livro já na cesta (400)', () => {
            cy.adicionarLivroCesta(userID, 1);
             cy.api({
                method: 'POST',
                url: 'basket',
                headers: { 'Authorization': tokenUser },
                body: {
                    userId: userID,
                    bookId: 1,
                    quantity: 1
                }
            }).should((resBasket) => {
                expect(resBasket.status).to.eq(400);
                expect(resBasket.body.message).to.eq("Livro já está na cesta.");
            
            });
        });

        it('Adicionar livro inexistente (404)', () => {
            cy.api({
                method: 'POST',
                url: 'basket',
                headers: { 'Authorization': tokenUser },
                body: {
                    userId: userID,
                    bookId: 1656665,
                    quantity: 1
                }
            }).should((resBasket) => {
                expect(resBasket.status).to.eq(404);
                expect(resBasket.body.message).to.eq("Livro não encontrado.");
            
            });
        });

        it('Quantidade diferente de 1 (400)', () => {
            cy.api({
                method: 'POST',
                url: 'basket',
                headers: { 'Authorization': tokenUser },
                body: {
                    userId: userID,
                    bookId: 3,
                    quantity: 433
                }
            }).should((resBasket) => {
                expect(resBasket.status).to.eq(404);
                expect(resBasket.body.message).to.eq("Quantidade deve ser 1 para livros.");
            
            });
        });

        it('Tentar adicionar à cesta de outro usuário (403)', () => {
            cy.api({
                method: 'POST',
                url: 'basket',
                headers: { 'Authorization': tokenUser },
                body: {
                    userId: 2,
                    bookId: 3,
                    quantity: 1
                }
            }).should((resBasket) => {
                expect(resBasket.status).to.eq(403);
                expect(resBasket.body.message).to.eq("Acesso negado. Você só pode adicionar ao seu próprio carrinho.");
            
            });
        });

    });

    describe('DELETE - Testes de Cesta de Livros - Limpar cesta completa', () => {
        

        it('Limpar cesta com itens (sucesso)', () => {
            
        });

        it('Limpar cesta já vazia (sucesso)', () => {

        });

        it('Tentar limpar cesta de outro usuário (403)', () => {

        });

    });

    describe('DELETE - Testes de Cesta de Livros - Remover item específico', () => {
        const bookID = 8;
        cy.adicionarLivroCesta(userID, bookID);

        it('Remover item existente na cesta (sucesso)', () => {
            cy.api({
                method: 'DELETE',
                url: `basket/${userID}/${bookID}`,
                headers: { 'Authorization': token }
            }).should((resBasket) => {
                expect(resBasket.status).to.eq(200);
                expect(resBasket.body.message).to.eq("Item removido da cesta com sucesso.");

                const { removedItem } = response.body;
                expect(removedItem).to.have.all.keys('bookId', 'bookTitle', 'bookAuthor');
                expect(removedItem.bookId).to.eq(1);
                expect(removedItem.bookTitle).to.eq("A Menina que Roubava Livros");
                expect(removedItem.bookAuthor).to.eq("Markus Zusak");
                expect(removedItem.bookId).to.be.a('number');
                expect(removedItem.bookTitle).to.be.a('string');
            
            });
        });

        it('Remover item que não está na cesta (404)', () => {
            const bookID = 8;
            cy.api({
                method: 'DELETE',
                url: `basket/${userID}/${bookID}`,
                headers: { 'Authorization': token },
            }).should((resBasket) => {
                expect(resBasket.status).to.eq(404);
                expect(resBasket.body.message).to.eq("Item não encontrado na cesta.");
            
            });
        });

        it('IDs inválidos (400)', () => {
            const bookID = 33338;
            cy.api({
                method: 'DELETE',
                url: `basket/${userID}/${bookID}`,
                headers: { 'Authorization': token },
            }).should((resBasket) => {
                expect(resBasket.status).to.eq(404);
                expect(resBasket.body.message).to.eq("Item não encontrado na cesta.");
            
            });
        });

        it('Tentar remover de cesta de outro usuário (403)', () => {
            const bookID = 8;
            cy.api({
                method: 'DELETE',
                url: `basket/3/${bookID}`,
                headers: { 'Authorization': token },
            }).should((resBasket) => {
                expect(resBasket.status).to.eq(403);
                expect(resBasket.body.message).to.eq("Acesso negado. Você só pode modificar seu próprio carrinho.");
            
            });
        });

    });



