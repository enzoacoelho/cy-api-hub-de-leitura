/// <reference types="cypress"/>

describe('POST - Testes de Autenticação - Login com ADMIN e Usuário Padrão', () => {

    it('Deve fazer login como ADMIN com sucesso', () => {
        cy.fixture('users').then((usuarios) => {
            const email = usuarios.admin.email
            const password = usuarios.admin.password
            const name = usuarios.admin.name
            cy.api({
                method: 'POST',
                url: 'login',
                body: {
                    "email": email,
                    "password": password
                },
            }).then((response) => {
                expect(response.status).equal(200)
                expect(response.body.name).to.equal(name)
                expect(response.body.isAdmin).to.be(true)
            })
        });
    });

    it('Deve fazer login como usuário padrão com sucesso', () => {
        cy.fixture('users').then((usuarios) => {
            const email = usuarios.padrao.email
            const password = usuarios.padrao.password
            const name = usuarios.padrao.name
            cy.api({
                method: 'POST',
                url: 'login',
                body: {
                    "email": email,
                    "password": password
                },
            }).then((response) => {
                expect(response.status).equal(200)
                expect(response.body.name).to.equal(name)
                expect(response.body.isAdmin).to.be(false)
            })
        });
    });

    it('Email inexistente', () => {        
        cy.api({
            method: 'POST',
            url: 'login',
            body: {
                "email": "usuarioerrado@mail.com",
                "password": "senha123"
            },
        }).then((response) => {
            expect(response.status).equal(401)
            expect(response.body.message).to.equal("Email ou senha incorretos.")
            expect(response.body.error).to.equal("INVALID_CREDENTIALS")
        });        
    });

    it('Senha incorreta', () => {
        cy.fixture('users').then((usuarios) => {
            const email = usuarios.padrao.email
            cy.api({
                method: 'POST',
                url: 'login',
                body: {
                    "email": email,
                    "password": "erro123"
                },
            }).then((response) => {
                expect(response.status).equal(401)
                expect(response.body.message).to.equal("Email ou senha incorretos.")
                expect(response.body.error).to.equal("INVALID_CREDENTIALS")
            })
        });

    });

    it('Campos obrigatórios em branco', () => {
         cy.api({
            method: 'POST',
            url: 'login',
            body: {
                "email": "",
                "password": ""
            },
        }).then((response) => {
            expect(response.status).equal(400)
            expect(response.body.message).to.equal("Email e senha são obrigatórios.")
            expect(response.body.error).to.equal("MISSING_FIELDS")
        });      
    });

});

