/// <reference types="cypress"/>
import { faker } from '@faker-js/faker';

import { reservarLivro } from '../../support/requests/reservations.js';
import { criarLivro } from '../../support/factory/book.js';
import { cadastrarLivro } from '../../support/requests/books.js';
import { limparCesta, verCesta, adicionarLivroCesta } from '../../support/requests/basket.js';
import { limparReservas } from '../../support/workflows/cleanReservations.js';

let token;
let userID;
let tokenAdmin;

beforeEach(() => {

    cy.fixture('users').then((usuarios) => {
        cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tkn => {
            token = tkn;
            userID = usuarios.padrao.userID;
        });

        cy.gerarToken(usuarios.admin.email, usuarios.admin.password).then(tkn => {
            tokenAdmin = tkn;
        });
    });
});

describe('GET - Testes de Reservas de livros - Listar ', () => {

    it('Listar todas as reservas do usuário', () => {
        cy.api({
            method: 'GET',
            url: 'reservations',
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).equal(200);
            expect(response.body.reservations).to.be.an('array');
            expect(response.body.reservations).to.have.length.of.at.least(1);
        });
    });

    it('Deve impedir de listar todas reservas sem autorização', () => {
        cy.api({
            method: 'GET',
            url: 'reservations',
            failOnStatusCode: false
        }).should(response => {
            expect(response.status).equal(401);
            expect(response.body.message).to.equal("Token de acesso necessário");
        });
    });

    it('Listar com filtro por status específico', () => {
        const statusFiltro = 'active';
        cy.api({
            method: 'GET',
            url: 'reservations',
            qs: { status: statusFiltro }, // Query params conforme image_1c3e53.png
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).to.eq(200);
            expect(response.body.filters.status).to.eq(statusFiltro);
            // Valida se todos os itens retornados possuem o status filtrado
            response.body.reservations.forEach(reserva => {
                expect(reserva.status).to.eq(statusFiltro);
            });
        });
    });

    it('Listar com paginação com diferentes limites', () => {
        const limite = 5;
        cy.api({
            method: 'GET',
            url: 'reservations',
            qs: { limit: limite, offset: 0 },
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).to.eq(200);
            expect(response.body.pagination.limit).to.eq(limite);
            expect(response.body.reservations).to.have.length.of.at.most(limite);
        });
    });

    it('Verificar estatísticas incluídas', () => {
        cy.api({
            method: 'GET',
            url: 'reservations',
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).to.eq(200);
            expect(response.body.statistics).to.exist;
            // Valida se as chaves de estatísticas estão presentes conforme image_1c3e72.png
            expect(response.body.statistics).to.have.all.keys(
                'active', 'pickedUp', 'returned', 'cancelled', 'overdue', 'expired'
            );
        });
    });

    it('Status calculado (overdue, expired)', () => {
        cy.api({
            method: 'GET',
            url: 'reservations',
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).to.eq(200);
            response.body.reservations.forEach(reserva => {
                // Valida se o campo calculated_status existe (Regra de negócio da image_1c3e53.png)
                expect(reserva).to.have.property('calculated_status');
                expect(['active', 'picked-up', 'overdue', 'expired', 'returned', 'cancelled'])
                    .to.include(reserva.calculated_status);
            });
        });
    });

    it('Horas restantes para vencimentos', () => {
        cy.api({
            method: 'GET',
            url: 'reservations',
            qs: { status: 'active' },
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).to.eq(200);
            if (response.body.reservations.length > 0) {
                const reservaAtiva = response.body.reservations[0];
                // Para reservas ativas, hours_remaining deve ser um número ou null (se expirado)
                expect(reservaAtiva).to.have.property('hours_remaining');
                if (reservaAtiva.hours_remaining !== null) {
                    expect(reservaAtiva.hours_remaining).to.be.a('number');
                }
            }
        });
    });

});

describe('POST - Testes de Reservas de livros - Criar novas reservas', () => {

    it('Reservar livro disponível (sucesso)', () => {
        const livro = criarLivro();

        cadastrarLivro(tokenAdmin, livro).then(response => {

            const bookID = response.body.book.id;
            const bookTitle = response.body.book.title;
            cy.log("ID: " + bookID);
            cy.log("bookTitle: " + bookTitle);

            limparReservas(token);

            cy.api({
                method: 'POST',
                url: 'reservations',
                headers: { 'Authorization': token },
                body: {
                    "bookId": bookID
                },
            }).should(response => {
                expect(response.status).to.eq(201);
                expect(response.body.message).to.eq("Reserva criada com sucesso.");

                const res = response.body.reservation;
                expect(res.id).to.be.a('number');
                expect(res.bookId).to.eq(bookID);
                expect(res.bookTitle).to.eq(bookTitle);

            });
        });


    });

    it('Reservar livro inexistente (404)', () => {
        cy.api({
            method: 'POST',
            url: 'reservations',
            headers: { 'Authorization': token },
            failOnStatusCode: false,
            body: {
                "bookId": 56566
            },
        }).should(response => {
            expect(response.status).to.eq(404);
            expect(response.body.message).to.eq("Livro não encontrado.");

        });
    });

    it('Reservar mesmo livro duas vezes (400)', () => {
        limparReservas(token);
        const livro = criarLivro();

        cadastrarLivro(tokenAdmin, livro).then(res => {
            let bookID = res.body.book.id;
            let bookTitle = res.body.book.title;

            cy.api({
                method: 'POST',
                url: 'reservations',
                headers: { 'Authorization': token },
                failOnStatusCode: false,
                body: {
                    "bookId": bookID
                },
            }).should(response => {
                expect(response.status).to.eq(201);
                expect(response.body.message).to.eq("Reserva criada com sucesso.");
            });

            cy.api({
                method: 'POST',
                url: 'reservations',
                headers: { 'Authorization': token },
                failOnStatusCode: false,
                body: {
                    "bookId": bookID
                },
            }).should(response => {
                expect(response.status).to.eq(400);
                expect(response.body.message).to.eq("Você já possui uma reserva ativa para este livro.");

            });

        });

        limparReservas(token);
    });


    it('Reserva com observações', () => {
        limparReservas(token);

        cy.fixture('books').then((livro) => {
            const bookID = livro.metamorfose.id;
            const bookTitle = livro.metamorfose.title;
            const note = "Livro necessário para trabalho";

            cy.api({
                method: 'POST',
                url: 'reservations',
                headers: { 'Authorization': token },
                body: {
                    "bookId": bookID,
                    "notes": note
                },
            }).should(response => {
                expect(response.status).to.eq(201);
                expect(response.body.message).to.eq("Reserva criada com sucesso.");

                const res = response.body.reservation;
                expect(res.id).to.be.a('number');
                expect(res.bookId).to.eq(bookID);
                expect(res.bookTitle).to.eq(bookTitle);

                expect(res.notes).to.eq(note);
            });

            limparReservas(token);
        });
    });
});

describe('POST - Testes de Reservas de livros - Criar novas reservas a partir do carrinho', () => {

    it('Carrinho com livros disponíveis (sucesso)', () => {
        //cadastrar um livro
        limparReservas(token);
        limparCesta(token, userID);

        const livro = criarLivro();

        cadastrarLivro(tokenAdmin, livro).then(response => {
            let bookID = response.body.book.id;
            let bookTitle = response.body.book.title;

            cy.log("ID DO LIVRO: " + bookID);

            //adicionar no carrinho
            adicionarLivroCesta(userID, bookID, token);

            //fazer reserva a partir do carrinho
            cy.api({
                method: 'POST',
                url: 'reservations/from-basket',
                headers: { 'Authorization': token },
                body: {
                    "notes": "Livros para estudo do semestre",
                    "clearBasket": true
                },
            }).then((response) => {
                expect(response.status).equal(201);
                expect(response.body.reservationsCreated).to.be.an('array');

                const res = response.body.reservationsCreated;
                cy.log("res: " + res);
                expect(res[0].bookId).equal(bookID);
                expect(res[0].bookTitle).equal(bookTitle);

                const summary = response.body.summary;
                expect(summary.totalItemsInBasket).equal(summary.successfulReservations);

                expect(response.body.basketCleared).equal(true);

                const instructions = response.body.instructions;
                expect(instructions.message).equal("Todas as reservas foram criadas com prazo de 48h para retirada.");

            });
        });

    });

    it('Carrinho vazio (400)', () => {
        //limpar o carrinho
        limparCesta(token, userID).then(response => {
            expect(response.status).to.eq(200);
        });

        cy.api({
            method: 'POST',
            url: 'reservations/from-basket',
            headers: { 'Authorization': token },
            failOnStatusCode: false,
            body: {
                "notes": "Livros para estudo do semestre",
                "clearBasket": true
            },
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.equal("Carrinho está vazio. Adicione livros antes de criar reservas.");
        });

    });

    it('Manter itens no carrinho (clearBasket=false)', () => {
        limparReservas(token);
        limparCesta(token, userID);

        //cadastrar um livro
        const livro = criarLivro();

        cadastrarLivro(tokenAdmin, livro).then(response => {
            let bookID = response.body.book.id;
            let bookTitle = response.body.book.title;

            //adicionar no carrinho
            adicionarLivroCesta(userID, bookID, token);

            verCesta(userID, token).then(response => {
                let livrosCesta = response.body.total;

                //fazer reserva a partir do carrinho
                cy.api({
                    method: 'POST',
                    url: 'reservations/from-basket',
                    headers: { 'Authorization': token },
                    body: {
                        "notes": "Livros para estudo do semestre",
                        "clearBasket": false
                    },
                }).then((response) => {
                    expect(response.status).equal(201);
                    expect(response.body.reservationsCreated).to.be.an('array');

                    const res = response.body.reservationsCreated;
                    expect(res[0].bookId).equal(bookID);
                    expect(res[0].bookTitle).equal(bookTitle);

                    expect(response.body.basketCleared).equal(false);

                    const instructions = response.body.instructions;
                    expect(instructions.message).equal("Todas as reservas foram criadas com prazo de 48h para retirada.");

                });

                verCesta(userID, token).then(res => {
                    expect(res.body.total).to.equal(livrosCesta);
                });
            });
        });

    });
});

describe('PUT - Testes de Reservas de livros - Atualizar reservas', () => {

    it('Deve cancelar reserva ativa (liberar o livro)', () => {
        limparReservas(token);

        //criar livro para evitar conflitos de testes simultaneos
        const livro = criarLivro();

        cadastrarLivro(tokenAdmin, livro).then(response => {
            const bookID = response.body.book.id;

            reservarLivro(bookID, token).then(response => {

                let reservaID = response.body.reservation.id

                //cancelar reserva
                cy.api({
                    method: 'PUT',
                    url: `reservations/${reservaID}`,
                    headers: { 'Authorization': token },
                    body: {
                        "action": "cancel"
                    },
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.message).to.equal("Reserva cancelada com sucesso.");
                    const bookAvailability = response.body.bookAvailability;

                    expect(bookAvailability.message).to.equal("O livro foi liberado e está disponível para outros usuários.");
                });
            });
        });

    });

    it('Deve atualizar apenas as observações de uma reserva', () => {
        limparReservas(token);
        const livro = criarLivro();
        const txtAleatorio = faker.lorem.words(5);
        const obsAlterada = "Observações: " + txtAleatorio;

        cadastrarLivro(tokenAdmin, livro).then(res => {
            const bookID = res.body.book.id;

            reservarLivro(bookID, token).then(response => {
                expect(response.status).to.eq(201);
                let reservaID = response.body.reservation.id;

                cy.api({
                    method: 'PUT',
                    url: `reservations/${reservaID}`,
                    headers: { 'Authorization': token },
                    body: {
                        "action": "update_notes",
                        "notes": obsAlterada
                    },
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.message).to.equal("Observações atualizadas com sucesso.");
                    const reservation = response.body.reservation;

                    expect(reservation.newNotes).to.equal(obsAlterada);
                });
            });

            limparReservas(token);


        });
    });
});


describe('DELETE - Testes de Reservas de livros', () => {

    it('Deve cancela uma reserva ativa do usuário', () => {
        limparReservas(token); //garantir que as reservas sao limpas antes
        const livro = criarLivro();

        cadastrarLivro(tokenAdmin, livro).then(res => {
            const bookID = res.body.book.id;

            reservarLivro(bookID, token).then(response => {
                expect(response.status).to.eq(201);
                let reservaID = response.body.reservation.id;

                //cancelar reserva
                cy.api({
                    method: 'DELETE',
                    url: `reservations/${reservaID}`,
                    headers: { 'Authorization': token }
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.message).to.equal("Reserva cancelada com sucesso.");
                    const bookAvailability = response.body.bookAvailability;

                    expect(bookAvailability.message).to.equal("O livro foi liberado e está disponível para outros usuários.");
                });
            });

        });      
        

    });
});




