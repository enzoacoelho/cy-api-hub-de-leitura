/// <reference types="cypress"/>
import { faker } from '@faker-js/faker';

let token

beforeEach(() => {

    cy.fixture('users').then((usuarios) => {
        cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tkn => {
            token = tkn;
            userID = usuarios.padrao.userID;
        });
    });

    cy.
});

describe('GET - Testes de Reservas de livros - Listar ', () => {

    it('Listar todas as reservas do usuário', () => {
        cy.api({
            method: 'GET',
            url: 'reservations'
        }).should(response => {
            expect(response.status).equal(200);
            expect(response.body.reservations).to.be.an('array');
            expect(response.body.reservations).to.have.length.of.at.least(1);
        });

    });

    it('Deve impedir de listar todas reservas sem autorização', () => {
        cy.api({
            method: 'GET',
            url: 'reservations'
        }).should(response => {
            expect(response.status).equal(403);
            expect(response.body.message).to.equal("Acesso negado. Apenas administradores podem realizar esta ação.")
            expect(response.body.error).to.equal("ADMIN_REQUIRED")
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
        cy.fixture('books').then((livro) => {
            const bookID = livro.metamorfose.id;
            const bookTitle = livro.metamorfose.title;

            cy.api({
                method: 'POST',
                url: 'reservations',
                headers: { 'Authorization': token },
                body: {
                    "bookId": bookID
                },
            }).should(response => {
                expect(response.status).to.eq(200);
                expect(response.body.message).to.eq("Reserva criada com sucesso.");
                expect(response.body.reservation).to.be.an('array');

                const res = response.body.reservation;
                expect(res.id).to.be.a('number');
                expect(res.bookId).to.eq(bookID);
                expect(res.bookTitle).to.eq(bookTitle);

                const reservaID = res.id;
                cy.cancelarReserva(reservaID, token);

            });
        });
    });

    it('Reservar livro inexistente (404)', () => {
        cy.api({
            method: 'POST',
            url: 'reservations',
            headers: { 'Authorization': token },
            body: {
                "bookId": 56566
            },
        }).should(response => {
            expect(response.status).to.eq(404);
            expect(response.body.message).to.eq("Livro não encontrado.");

        });
    });

    it('Reservar mesmo livro duas vezes (400)', () => {
        cy.api({
            method: 'POST',
            url: 'reservations',
            headers: { 'Authorization': token },
            body: {
                "bookId": 17
            },
        }).should(response => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq("Reserva criada com sucesso.");
            expect(response.body.reservation).to.be.an('array');
            const res = response.body.reservation;
            const reservaID = res.id;

        });

        cy.api({
            method: 'POST',
            url: 'reservations',
            headers: { 'Authorization': token },
            body: {
                "bookId": 17
            },
        }).should(response => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq("Você já possui uma reserva ativa para este livro.");

        });
        cy.cancelarReserva(reservaID, token);
    });


    it('Reserva com observações', () => {
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
                expect(response.status).to.eq(200);
                expect(response.body.message).to.eq("Reserva criada com sucesso.");
                expect(response.body.reservation).to.be.an('array');

                const res = response.body.reservation;
                expect(res.id).to.be.a('number');
                expect(res.bookId).to.eq(bookID);
                expect(res.bookTitle).to.eq(bookTitle);

                expect(res.notes).to.eq(note);

                const reservaID = res.id;
                cy.cancelarReserva(reservaID, token);

            });
        });
    });
});

describe('POST - Testes de Reservas de livros - Criar novas reservas a partir do carrinho', () => {

    it('Carrinho com livros disponíveis (sucesso)', () => {
        //cadastrar um livro
        const livro = cy.criarLivro();
        cy.cadastrarLivro(token, livro).then(response => {
            let bookID = response.body.book.id;
            let bookTitle = response.body.book.title;

            //adicionar no carrinho
            cy.adicionarLivroCesta(userID, bookID);

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
                expect(response.status).equal(200);
                expect(response.body.message).equal("1 reservas criadas com sucesso a partir do carrinho.");
                expect(response.body.reservationsCreated).to.be.an('array');

                const res = response.body.reservationsCreated;
                expect(res.bookId).equal(bookID);
                expect(res.bookTitle).equal(bookTitle);

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
        cy.limparCesta(token, userID).then(response => {

            expect(response.status).to.eq(200);
            expect(response.body.message).to.equal("Cesta limpa com sucesso.");

        });
        cy.api({
            method: 'POST',
            url: 'reservations/from-basket',
            headers: { 'Authorization': token },
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
        //cadastrar um livro
        const livro = cy.criarLivro();
        cy.cadastrarLivro(token, livro).then(response => {
            let bookID = response.body.book.id;
            let bookTitle = response.body.book.title;

            //adicionar no carrinho
            cy.adicionarLivroCesta(userID, bookID);
            cy.verCesta(userID).then(response => {
                livrosCesta = response.body.total;

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
                    expect(response.status).equal(200);
                    expect(response.body.message).equal("1 reservas criadas com sucesso a partir do carrinho.");
                    expect(response.body.reservationsCreated).to.be.an('array');

                    const res = response.body.reservationsCreated;
                    expect(res.bookId).equal(bookID);
                    expect(res.bookTitle).equal(bookTitle);

                    expect(response.body.basketCleared).equal(false);

                    const instructions = response.body.instructions;
                    expect(instructions.message).equal("Todas as reservas foram criadas com prazo de 48h para retirada.");

                });

                cy.verCesta(userID).then(res => {
                    expect(res.body.total).to.equal(livrosCesta);
                });

            });

        });
    });
});

describe('PUT - Testes de Reservas de livros - Atualizar reservas', () => {

    it('Deve cancelar reserva ativa (liberar o livro)', () => {
        //fazer reserva do livro
        const bookID = 17;
        cy.reservarLivro(bookID).then(response => {
            expect(response.status).to.eq(200);
        });
        //cancelar reserva
        cy.api({
            method: 'PUT',
            url: `reservations/${bookID}`,
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

    it('Deve atualizar apenas as observações de uma reserva', () => {

        const bookID = 17;
        cy.reservarLivro(bookID).then(response => {
            expect(response.status).to.eq(200);
        });
        //cancelar reserva
        cy.api({
            method: 'PUT',
            url: `reservations/${bookID}`,
            headers: { 'Authorization': token },
            body: {
                "action": "update_notes",
                "notes": "Observações atualizadas sobre a reserva"
            },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.equal("Observações atualizadas com sucesso.");
            const reservation = response.body.reservation;

            expect(reservation.newNotes).to.equal("Observações atualizadas sobre a reserva");
        });
    });
});


describe('DELETE - Testes de Reservas de livros', () => {

    it('Deve cancela uma reserva ativa do usuário', () => {
        //fazer reserva do livro
        const bookID = 17;
        cy.reservarLivro(bookID).then(response => {
            expect(response.status).to.eq(200);
        });
        //cancelar reserva
        cy.api({
            method: 'DELETE',
            url: `reservations/${bookID}`,
            headers: { 'Authorization': token }
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.equal("Reserva cancelada com sucesso.");
            const bookAvailability = response.body.bookAvailability;

            expect(bookAvailability.message).to.equal("O livro foi liberado e está disponível para outros usuários.");
        });

    });
});




