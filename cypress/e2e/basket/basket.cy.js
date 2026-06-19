/// <reference types="cypress"/>
import { faker } from '@faker-js/faker';
import { criarLivro } from '../../support/factory/book.js';
import { cadastrarLivro } from '../../support/requests/books.js';
import { limparCesta, limparCestaById, adicionarLivroCesta, verCesta } from '../../support/requests/basket.js';

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
        adicionarLivroCesta(userID, bookID, tokenPadrao)

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
        adicionarLivroCesta(userID, bookID, tokenPadrao).then(response => {
             //validar
            expect(response.status).to.eq(201);
            expect(response.body.message).to.equal("Livro adicionado ao carrinho com sucesso.");
            expect(response.body.bookTitle).to.equal(bookTitle);
            expect(response.body.bookAuthor).to.equal(bookAuthor);
        })       
    });


    it('Não deve adicionar o livro à cesta duas vezes', () => {
        //adicionar um livro especifico
        adicionarLivroCesta(userID, bookID, tokenPadrao).then(response => {
             //validar
            expect(response.status).to.eq(201);
            expect(response.body.message).to.equal("Livro adicionado ao carrinho com sucesso.");
        })      

        //tentar adicionar novamente o mesmo livro
        adicionarLivroCesta(userID, bookID, tokenPadrao, 1, false).then(response => {
             //validar
            expect(response.status).to.eq(400);
            expect(response.body.message).to.equal("Livro já está no carrinho.");
        })   
    });

    it('Não deve adicionar livro inexistente', () => {
        const idBook = 4522
        adicionarLivroCesta(userID, idBook, tokenPadrao, 1, false).then(response => {
            expect(response.status).to.eq(404);
            expect(response.body.message).to.eq("Livro não encontrado.");
        });
    });

    it('Não deve adicionar mais de um livro à cesta de uma vez', () => {
        const quantidade = 2
        adicionarLivroCesta(userID, bookID, tokenPadrao, quantidade, false).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq("Quantidade deve ser 1 para livros.");

        });
    });

    it('Não deve adicionar à cesta de outro usuário (403)', () => {
        //id diferente do user (1) que ta nesse tokenPadrao
        const randomUserID = 45

        adicionarLivroCesta(randomUserID, bookID, tokenPadrao, 1, false).should((resBasket) => {
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

            limparCesta(userID, tokenPadrao).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.message).to.eq("Carrinho limpo com sucesso.");
                expect(response.body.itemsRemoved).to.eq(response.body.previousItemCount);
            });
        });
    });

    it('Deve limpar cesta já vazia (sucesso)', () => {
        limparCesta(userID, tokenPadrao).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq("Carrinho já estava vazio.");
            expect(response.body.itemsRemoved).to.eq(0);

        });
    });

    it('Não deve limpar cesta de outro usuário (403)', () => {
        const randomUserID = 4 //ID DIFERENTE DO ID DO USUARIO/TOKEN
        limparCesta(4, tokenPadrao, false).then((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.message).to.eq("Acesso negado. Você só pode limpar seu próprio carrinho.");

        });
    });
});

describe('DELETE - Limpar itens especificos da cesta - api/basket/:userId/:bookId', () => {

    it('Deve remover item da cesta com sucesso', () => {
        //criar livro como adm
        const livro = criarLivro();        
        cadastrarLivro(tokenAdmin, livro).then(res => {
            const idBook = res.body.book.id;
            const titleBook = res.body.book.title;

            //adicionar na cesta como usuario comum
            
            adicionarLivroCesta(userID, idBook, tokenPadrao);

            //deletar o item da cesta com sucesso
            limparCestaById(userID, idBook, tokenPadrao).then((response) => {
                //validar
                expect(response.status).to.eq(200);
                expect(response.body.message).to.eq("Item removido do carrinho com sucesso.");

                const { removedItem } = response.body;
                expect(removedItem).to.have.all.keys('bookId', 'bookTitle', 'bookAuthor');
                expect(removedItem.bookId).to.eq(idBook);
                expect(removedItem.bookTitle).to.eq(titleBook);
            });
        });           
    });

    it('Não deve remover item que não está na cesta (404)', () => {
        limparCestaById(userID, bookID, tokenPadrao, false).then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body.message).to.eq("Item não encontrado no carrinho.");

        });
    });

    it('Não deve remover de cesta de outro usuário (403)', () => {
        const randomUserID = 45;

        limparCestaById(randomUserID, bookID, tokenPadrao, false).then((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.message).to.eq("Acesso negado. Você só pode modificar seu próprio carrinho.");

        });
    });
});



