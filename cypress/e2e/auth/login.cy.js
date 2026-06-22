/// <reference types="cypress"/>

describe('POST - api/login', () => {
    it('Deve fazer login como ADMIN com sucesso', () => {
        cy.fixture('users').then((usuarios) => {
            const email = usuarios.admin.email
            const password = usuarios.admin.password
            const name = usuarios.admin.name

            cy.login(email, password, true).then((response) => {
                expect(response.status).equal(200)
                expect(response.body.name).to.equal(name)
                expect(response.body.isAdmin).to.be.true
            })
        })
    })

    it('Deve fazer login como usuário padrão com sucesso', () => {
        cy.fixture('users').then((usuarios) => {
            const email = usuarios.padrao.email
            const password = usuarios.padrao.password
            const name = usuarios.padrao.name

            cy.login(email, password, true).then((response) => {
                expect(response.status).equal(200)
                expect(response.body.name).to.equal(name)
                expect(response.body.isAdmin).to.be.false
            })
        })
    })

    it('Não deve fazer login com email inexistente', () => {
        const email = "usuarioerrado@mail.com"
        const password = "senha123"
      
        cy.login(email, password, false).then((response) => {
            expect(response.status).equal(401)
            expect(response.body.message).to.equal("Email ou senha incorretos.")
            expect(response.body.error).to.equal("INVALID_CREDENTIALS")
        })
    })

    it('Não deve fazer login com senha incorreta', () => {
        cy.fixture('users').then((usuarios) => {
            const email = usuarios.padrao.email
            const password = "123erro"

            cy.login(email, password, false).then((response) => {
                expect(response.status).equal(401)
                expect(response.body.message).to.equal("Email ou senha incorretos.")
                expect(response.body.error).to.equal("INVALID_CREDENTIALS")
            })
        })
    })

    it('Não deve fazer login sem preencher campos obrigatórios', () => {        
        cy.login("", "", false).then((response) => {
            expect(response.status).equal(400)
            expect(response.body.message).to.equal("Email e senha são obrigatórios.")
            expect(response.body.error).to.equal("MISSING_FIELDS")
        })
    })
})

