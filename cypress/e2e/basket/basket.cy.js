/// <reference types="cypress"/>
import { faker } from '@faker-js/faker';
import { criarLivro } from '../../support/factory/book.js';
import { cadastrarLivro } from '../../support/requests/books.js';
import { limparCesta, adicionarLivroCesta, verCesta } from '../../support/requests/basket.js';

let tokenPadrao;
let tokenAdmin;
let userID;
let bookID;
let bookTitle;
let bookAuthor;

beforeEach(() => {
    cy.fixture('users').then((usuarios) => {
        userID = usuarios.padrao.userID;

        cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tkn => {
            tokenPadrao = tkn
        });

        cy.gerarToken(usuarios.admin.email, usuarios.admin.password).then(tkn => {
            tokenAdmin = tkn
        });
    });   

    cy.fixture('books').then((book) => {
        bookID = book.dom_casmurro.id;
        bookTitle = book.dom_casmurro.title;
        bookAuthor = book.dom_casmurro.author;
    });  

    limparCesta(userID, tokenPadrao)
});

describe('GET - Consultas e listagens - api/basket/:userID', () => {

    it('Deve listar itens da cesta', () => {
        //adicionar um livro na cesta
        const quantidade = 1
        adicionarLivroCesta(userID, bookID, quantidade, tokenPadrao)

        //validação de satus 
        verCesta(userID, tokenPadrao).then(response => {
            expect(response.status).to.eq(200);
      
            //validação se retornou lista
            expect(response.body.items).to.be.an('array');          
            const item = response.body.items[0];
            expect(item).to.have.all.keys(
                'id', 'user_id', 'book_id', 'quantity', 'added_date',
                'book_title', 'book_author', 'cover_image',
                'available', 'available_copies', 'total_copies'
            );

            // validação dos dados do livro na cesta
            expect(item.user_id).to.eq(userID);
            expect(item.book_id).to.eq(bookID);
            expect(item.quantity).to.eq(1);
            expect(item.book_title).to.eq(bookTitle);
            expect(item.book_author).to.eq(bookAuthor);
         
            const { summary, total } = response.body;
            expect(total).to.eq(summary.totalItems);

            const somaItens = summary.availableItems + summary.unavailableItems;
            expect(somaItens).to.eq(summary.totalItems);
            expect(summary.totalItems).to.be.a('number');

        });
    });

    it('Não deve conseguir ver cesta de outro usuário (403)', () => {
        const randomUserID = 455
        verCesta(randomUserID, tokenPadrao, false).then(response => {
            expect(response.status).to.eq(403);
            expect(response.body.message).to.equal("Acesso negado. Você só pode ver seu próprio carrinho.");

        });
    });
});

describe('POST - Ações na cesta - api/basket', () => {

    it('Deve adicionar um livro à cesta com sucesso', () => {
        //adicionar um livro especifico
        const quantidade = 1
        adicionarLivroCesta(userID, bookID, quantidade, tokenPadrao).then(response => {
             //validar
            expect(response.status).to.eq(201);
            expect(response.body.message).to.equal("Livro adicionado ao carrinho com sucesso.");
            expect(response.body.bookTitle).to.equal(bookTitle);
            expect(response.body.bookAuthor).to.equal(bookAuthor);
        })       
    });


    it('Não deve adicionar o livro à cesta duas vezes', () => {
        //adicionar um livro especifico
        const quantidade = 1
        adicionarLivroCesta(userID, bookID, quantidade, tokenPadrao).then(response => {
             //validar
            expect(response.status).to.eq(201);
            expect(response.body.message).to.equal("Livro adicionado ao carrinho com sucesso.");
        })      

        //tentar adicionar novamente o mesmo livro
        adicionarLivroCesta(userID, bookID, quantidade, tokenPadrao, false).then(response => {
             //validar
            expect(response.status).to.eq(400);
            expect(response.body.message).to.equal("Livro já está no carrinho.");
        })   
    });

    it('Não deve adicionar livro inexistente', () => {
        const idBook = 4522
        adicionarLivroCesta(userID, idBook, quantidade, tokenPadrao, false).then(response => {
            expect(response.status).to.eq(404);
            expect(response.body.message).to.eq("Livro não encontrado.");
        });
    });

    it('Não deve adicionar mais de um livro à cesta de uma vez', () => {
        const quantidade = 2
        adicionarLivroCesta(userID, bookID, quantidade, tokenPadrao, false).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq("Quantidade deve ser 1 para livros.");

        });
    });

    it('Não deve adicionar à cesta de outro usuário (403)', () => {
        //id diferente do user (1) que ta nesse tokenPadrao
        const randomUserID = 45
        const quantidade = 1

        adicionarLivroCesta(randomUserID, bookID, quantidade, tokenPadrao, false).should((resBasket) => {
            expect(resBasket.status).to.eq(403);
            expect(resBasket.body.message).to.eq("Acesso negado. Você só pode adicionar ao seu próprio carrinho.");

        });
    });
});

describe('DELETE - Limpar cesta completa - api/basket/:userId', () => {

    it('Deve limpar cesta completa com sucesso (com varios itens)', () => {
        const livro = criarLivro();
        cadastrarLivro(tokenAdmin, livro).then(res => {
            const idBookCreated = res.body.book.id;
            adicionarLivroCesta(userID, idBookCreated, tokenPadrao);
            adicionarLivroCesta(userID, bookID, tokenPadrao);

            limparCesta(userID, token).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.message).to.eq("Carrinho limpo com sucesso.");
                expect(response.body.itemsRemoved).to.eq(resBasket.body.previousItemCount);
            });
        });
    });

    it('Limpar cesta já vazia (sucesso)', () => {
        limparCesta(userID, token).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq("Carrinho já estava vazio.");
            expect(response.body.itemsRemoved).to.eq(0);

        });
    });

    it('Tentar limpar cesta de outro usuário (403)', () => {
        cy.api({
            method: 'DELETE',
            url: 'basket/4',
            headers: { 'Authorization': token },
            failOnStatusCode: false
        }).should((resBasket) => {
            expect(resBasket.status).to.eq(403);
            expect(resBasket.body.message).to.eq("Acesso negado. Você só pode limpar seu próprio carrinho.");

        });
    });
});

describe('DELETE - Testes de Cesta de Livros - Remover item específico', () => {

    it('Remover item existente na cesta (sucesso)', () => {
        const livro = criarLivro();
        cadastrarLivro(tokenAdmin, livro).then(res => {
            const bookID = res.body.book.id;
            const bookTitle = res.body.book.title;
            adicionarLivroCesta(userID, bookID, token);

            cy.api({
                method: 'DELETE',
                url: `basket/${userID}/${bookID}`,
                headers: { 'Authorization': token }
            }).should((resBasket) => {
                expect(resBasket.status).to.eq(200);
                expect(resBasket.body.message).to.eq("Item removido do carrinho com sucesso.");

                const { removedItem } = resBasket.body;
                expect(removedItem).to.have.all.keys('bookId', 'bookTitle', 'bookAuthor');
                expect(removedItem.bookId).to.eq(bookID);
                expect(removedItem.bookTitle).to.eq(bookTitle);             

            });
        });         
    });

    it('Remover item que não está na cesta (404)', () => {
        const bookID = 8;
        cy.api({
            method: 'DELETE',
            url: `basket/${userID}/${bookID}`,
            headers: { 'Authorization': token },
            failOnStatusCode: false
        }).should((resBasket) => {
            expect(resBasket.status).to.eq(404);
            expect(resBasket.body.message).to.eq("Item não encontrado no carrinho.");

        });
    });

    it('IDs inválidos (400)', () => {
        const bookID = 33338;
        cy.api({
            method: 'DELETE',
            url: `basket/${userID}/${bookID}`,
            headers: { 'Authorization': token },
            failOnStatusCode: false
        }).should((resBasket) => {
            expect(resBasket.status).to.eq(404);
            expect(resBasket.body.message).to.eq("Item não encontrado no carrinho.");

        });
    });

    it('Tentar remover de cesta de outro usuário (403)', () => {
        const bookID = 8;
        cy.api({
            method: 'DELETE',
            url: `basket/3/${bookID}`,
            headers: { 'Authorization': token },
            failOnStatusCode: false
        }).should((resBasket) => {
            expect(resBasket.status).to.eq(403);
            expect(resBasket.body.message).to.eq("Acesso negado. Você só pode modificar seu próprio carrinho.");

        });
    });
});



