/// <reference types="cypress"/>

describe('GET - Testes de monitoramento da saúde do sistema', () => {

    it('Verificar status do servidor', () => {
        cy.api({
            method: 'GET',
            url: 'health'
        }).then((response) => {
            expect(response.status).equal(200)
            expect(response.body.status).to.equal("ok")
        });

    });

    it('Verificar conexão com banco de dados e serviços disponíveis', () => {
        cy.api({
            method: 'GET',
            url: 'health'
        }).then((response) => {
            expect(response.status).equal(200)
            expect(response.body.services.database).to.equal("connected")
            expect(response.body.services.auth).to.equal("working")
            expect(response.body.services.swagger).to.equal("active")
        });

    });

    it('Verificar versão da API', () => {
        cy.api({
            method: 'GET',
            url: 'health'
        }).then((response) => {
            expect(response.status).equal(200)
            expect(response.body.version).to.equal("1.0.0")
        });

    });

});

describe('GET - Informações gerais', () => {
    it('Retornar informações gerais sobre a API e endpoints disponíveis', () => {
        cy.api({
            method: 'GET',
            url: 'info'
        }).then((response) => {
            expect(response.status).equal(200)
            expect(response.body.name).to.equal("Hub de Leitura API")
            expect(response.body.description).to.equal("Sistema de biblioteca para aprendizado de QA")
        });

    });

});

