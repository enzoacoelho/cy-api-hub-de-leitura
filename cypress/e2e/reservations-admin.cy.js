/// <reference types="cypress"/>
import { faker } from '@faker-js/faker';

let token;
let tokenPadrao;
let userPadraoID;

beforeEach(() => {
    cy.fixture('users').then((usuarios) => {
        cy.gerarToken(usuarios.admin.email, usuarios.admin.password).then(tkn => {
            token = tkn;
        });

        cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tkn => {
            tokenPadrao = tkn;
            userPadraoID = usuarios.padrao.id;
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
            url: 'admin/reservations',
            headers: { 'Authorization': tokenPadrao },
            failOnStatusCode: false,
        }).should(response => {
            expect(response.status).equal(403)
        });
    });

    it('Listar reserva por ID do livro e usuário', () => {
        cy.limparReservas(tokenPadrao);

        cy.criarLivro().then((livro) => {

            cy.cadastrarLivro(token, livro).then(res => {
                const bookID = res.body.book.id;

                cy.reservarLivro(bookID, tokenPadrao).then(response => {
                    let reservaID = response.body.reservation.id;

                    cy.api({
                        method: 'GET',
                        url: 'admin/reservations/search',
                        headers: { 'Authorization': token },
                        body: {
                            "userId": userPadraoID,
                            "status": "active",
                            "bookId": bookID
                        }
                    }).should(response => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.not.be.empty;
                        expect(response.body.reservations[0].id).to.eq(reservaID);
                        expect(response.body.reservations[0].user_id).to.eq(1);
                        expect(response.body.reservations[0].book_id).to.eq(bookID);
                    
                    });
                });
            });
        });        
                       
    });

    it('Deve garantir que o endpoint de estatísticas retorna a estrutura correta', () => {
        cy.api({
            method: 'GET',
            url: 'admin/reservations/stats',
            headers: { 'Authorization': token }
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

});

describe('PUT - Testes de Reservas de livros', () => {

    it('Deve atualizar status de uma reserva com sucesso', () => {

        cy.limparReservas(tokenPadrao);
        cy.criarLivro().then((livro) => {
            
            cy.cadastrarLivro(token, livro).then(res => {
                const bookID = res.body.book.id;
                
                const txtAleatorio = faker.lorem.words(4);
                const notaDinamica = `Nota de teste: ${txtAleatorio}`;
                const novoStatus = 'picked-up';
        
                cy.reservarLivro(bookID, tokenPadrao).then(res => {
                    let reservaID = res.body.reservation.id;
                        cy.api({
                            method: 'PUT',
                            url: `admin/reservations/${reservaID}`,
                            headers: {'Authorization': token},
                            body: {
                                status: novoStatus,
                                notes: notaDinamica
                            }
                        }).should((responsePut) => {
                            expect(responsePut.status).to.eq(200);
                            expect(responsePut.body.updatedFields.notes).to.eq(notaDinamica);
                        
                        });
                
                    cy.limparReservas(tokenPadrao);
                });
            });

        });    
        
    });

    it('Estender prazo de devolução', () => {
        //limpa e faz uma reserva no usuário padrão para teste
        cy.limparReservas(tokenPadrao);

        cy.criarLivro().then((livro) => {

            cy.cadastrarLivro(token, livro).then(res => {

                const bookID = res.body.book.id;
                const diasParaExtender = 7;

                cy.reservarLivro(bookID, tokenPadrao).then(res => {
                    let idReserva = res.body.reservation.id;

                    const txtAleatorio = faker.lorem.words(4);
                    const notaDinamica = `Nota de teste: ${txtAleatorio}`;
                    const novoStatus = 'picked-up';

                    cy.alterarReserva(token, idReserva, novoStatus, notaDinamica).then(response => {

                        cy.api({
                            method: 'PUT',
                            url: `admin/reservations/${idReserva}/extend`,
                            headers: {'Authorization': token},
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

                        });

                    }); 

                    cy.limparReservas(tokenPadrao);
            
                });         

            });
        });        
    });   
});







