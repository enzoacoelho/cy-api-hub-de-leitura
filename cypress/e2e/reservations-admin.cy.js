/// <reference types="cypress"/>
import { faker } from '@faker-js/faker';

let token

beforeEach(() => {
    cy.fixture('users').then((usuarios) => {
        cy.gerarToken(usuarios.admin.email, usuarios.admin.password).then(tkn => {
            token = tkn
        });
    });
});

describe('GET - Testes de Reservas de livros - Listar ', () => {

    it('Listar todas as reservas', () => {
        cy.api({
            method: 'GET',
            url: 'admin/reservations',
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).equal(200)
            expect(response.body.reservations).be.an('array')
        });
    });

    it('Deve impedir de listar todas reservas sem autorização', () => {
        cy.api({
            method: 'GET',
            url: 'admin/reservations'
        }).should(response => {
            expect(response.status).equal(401)
        });
    });

    it('Listar reserva por ID', () => {
        const reservationId = 1;
        cy.api({
            method: 'GET',
            url: `admin/reservations/${reservationId}`,
        }).should(response => {
            expect(response.status).to.eq(200);
            expect(response.body).to.not.be.empty;

            expect(response.body).to.have.property('id', reservationId);
            expect(response.body).to.have.property('user_id');
            expect(response.body).to.have.property('title');
            expect(response.body).to.have.property('status');

            expect(response.body.title).to.be.a('string');
            expect(response.body.user_id).to.be.a('number');
        });
    });

    it('Deve garantir que o endpoint de estatísticas retorna a estrutura correta', () => {
        cy.api({
            method: 'GET',
            url: 'admin/reservations/stats'
        }).should((response) => {
            expect(response.status).to.eq(200);

            expect(response.body).to.have.property('stats');
            const { stats } = response.body;

            expect(stats.active).to.be.a('number');
            expect(stats.pickedUp).to.be.a('number');
            expect(stats.returned).to.be.a('number');
            expect(stats.overdue).to.be.a('number');
            expect(stats.active).to.be.at.least(0);
        });
    });

    it('Buscar reservas com filtros de status e livro', () => {
        const pStatus = 'picked-up';
        const pBookId = 1;

        cy.api({
            method: 'GET',
            url: 'admin/reservations/search', // Rota extraída da imagem image_1fe4d4.png
            qs: {
                status: pStatus,
                bookId: pBookId,
                limit: 10
            }
        }).should((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.reservations).to.be.an('array');

            response.body.reservations.forEach((reserva) => {
                expect(reserva.status).to.eq(pStatus);
                expect(reserva.book_id).to.eq(pBookId);
            });

            if (response.body.reservations.length > 0) {
                const primeiraReserva = response.body.reservations[0];
                expect(primeiraReserva).to.have.property('user_name');
                expect(primeiraReserva).to.have.property('title');
            }
        });
    });

});

describe('PUT - Testes de Reservas de livros', () => {

    it('Deve atualizar status de uma reserva com sucesso', () => {
        const numeroAleatorio = Math.floor(Math.random() * 10000);
        const notaDinamica = `Nota de teste ID: ${numeroAleatorio}`;
        const novoStatus = 'picked-up';

        //Busca uma reserva existente
        cy.api({
            method: 'GET',
            url: '/api/admin/reservations/search',
            qs: { limit: 1 }
        }).then((responseBusca) => {
            const idDinamico = responseBusca.body.reservations[0].id;

            cy.api({
                method: 'PUT',
                url: `/api/admin/reservations/${idDinamico}`,
                body: {
                    status: novoStatus,
                    notes: notaDinamica
                }
            }).should((responsePut) => {
                expect(responsePut.status).to.eq(200);
                expect(responsePut.body.updatedFields.notes).to.eq(notaDinamica);

                cy.log(`Testado com a nota: ${notaDinamica}`);
            });
        });
    });

    it('Estender prazo de devolução', () => {
        const diasParaExtender = 7;

        //Busca uma reserva para obter um ID válido
        cy.api({
            method: 'GET',
            url: '/api/admin/reservations/search',
            qs: { limit: 1 }
        }).then((responseBusca) => {
            const idReserva = responseBusca.body.reservations[0].id;

            cy.api({
                method: 'PUT',
                url: `/api/admin/reservations/${idReserva}/extend`,
                body: {
                    days: diasParaExtender
                }
            }).should((responsePut) => {
                expect(responsePut.status).to.eq(200);
                expect(responsePut.body.message).to.eq(`Prazo estendido por ${diasParaExtender} dia(s) com sucesso.`);

                //Cálculo e Comparação de Datas
                const dataAnterior = new Date(responsePut.body.previousDeadline);
                const dataNova = new Date(responsePut.body.newDeadline);

                // Calcula a diferença em milissegundos e converte para dias
                const diferencaEmMs = dataNova.getTime() - dataAnterior.getTime();
                const diferencaEmDias = Math.round(diferencaEmMs / (1000 * 60 * 60 * 24));

                // Valida se a diferença é exatamente o que enviamos no body
                expect(diferencaEmDias).to.eq(diasParaExtender);

                //Validação do campo dayExtended
                expect(responsePut.body.daysExtended).to.eq(diasParaExtender);

                cy.log(`Data antiga: ${responsePut.body.previousDeadline}`);
                cy.log(`Data nova: ${responsePut.body.newDeadline}`);
            });
        });
    });
});







