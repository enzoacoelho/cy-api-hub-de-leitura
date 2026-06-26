/// <reference types="cypress"/>
import { faker } from '@faker-js/faker'
import { cadastrarUsuario } from '../../support/requests/users.js'

let tokenAdmin
let tokenPadrao

beforeEach(() => {
    cy.fixture('users').then((usuarios) => {
        cy.gerarToken(usuarios.admin.email, usuarios.admin.password).then(tkn => {
            tokenAdmin = tkn
        })

        cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tkn => {
            tokenPadrao = tkn
        })
    })
})

describe('GET - Testes de Gestão de Usuários - Listar', () => {
   
    })

    it('Buscar por nome', () => {
        cy.api({
            method: 'GET',
            url: 'users',
            headers: { 'Authorization': token },
            qs: {
                page: 1,
                limit: 20,
                search: "Usuário Padrão"
            }
        }).should(response => {
            expect(response.status).equal(200)
            const usuarios = response.body.users
            expect(usuarios[0].name).equal("Usuário Padrão")

        })
    })

})


describe('POST - Testes de Gestão de Usuários - Criar novos usuários', () => {

    it('Criar usuário com dados válidos (sucesso)', () => {

        let email = faker.internet.email()
        let name = faker.person.fullName()
        let senha = faker.internet.password()

        cy.api({
            method: 'POST',
            url: 'users',
            headers: { 'Authorization': token },
            body: {
                "name": name,
                "email": email,
                "password": senha
            }
        }).should(response => {
            expect(response.status).equal(201)
            expect(response.body.message).equal('Usuário criado com sucesso.')
        })

    })

    it('Email já existente (400)', () => {
        cy.fixture('users').then((usuarios) => {
            const name = usuarios.padrao.name
            const email = usuarios.padrao.email
            const password = usuarios.padrao.password
            cy.api({
                method: 'POST',
                url: 'users',
                headers: { 'Authorization': token },
                failOnStatusCode: false,
                body: {
                    "name": name,
                    "email": email,
                    "password": password
                }
            }).should(response => {
                expect(response.status).equal(400)
                expect(response.body.message).equal("Email já está sendo usado por outro usuário.")
            })
        })

    })

    it('Senha muito curta (400)', () => {
        cy.api({
            method: 'POST',
            url: 'users',
            headers: { 'Authorization': token },
            failOnStatusCode: false,
            body: {
                "name": "nome aleatório",
                "email": "email@hot.com",
                "password": "12"
            }
        }).should(response => {
            expect(response.status).equal(400)
            expect(response.body.message).equal("Senha deve ter pelo menos 6 caracteres.")
        })

    })

    it('Email malformado (400)', () => {
        cy.api({
            method: 'POST',
            url: 'users',
            headers: { 'Authorization': token },
            failOnStatusCode: false,
            body: {
                "name": "Maria Santos",
                "email": "mariaemail.com",
                "password": "senha123"
            },
            failOnStatusCode: false
        }).should(response => {
            expect(response.status).equal(400)
            expect(response.body.message).equal('Formato de email inválido.')
        })
    })

    it('Nome muito curto (400)', () => {
        cy.api({
            method: 'POST',
            url: 'users',
            headers: { 'Authorization': token },
            failOnStatusCode: false,
            body: {
                "name": "M",
                "email": "maria@email.com",
                "password": "senha123444"
            },
            failOnStatusCode: false
        }).should(response => {
            expect(response.status).equal(400)
            expect(response.body.message).equal("Nome deve ter pelo menos 2 caracteres.")
        })

    })

    it('Campos obrigatórios em branco (400)', () => {
        cy.api({
            method: 'POST',
            url: 'users',
            headers: { 'Authorization': token },
            failOnStatusCode: false,
            body: {
                "name": "",
                "email": "",
                "password": ""
            },
            failOnStatusCode: false
        }).should(response => {
            expect(response.status).equal(400)
            expect(response.body.message).equal("Nome, email e senha são obrigatórios.")
        })

    })

})

describe('PUT - Testes de Gestão de Usuários - Atulizar dados de usuário', () => {

    it('Atualizar dados de um usuário', () => {
        let name = faker.person.fullName()
        let email = faker.internet.email()
        let senha = faker.internet.password()

        cadastrarUsuario(name, email, senha, token).then(userID => {
            cy.api({
                method: 'PUT',
                url: 'users/' + userID,
                headers: { 'Authorization': token },
                body: {
                    "name": name + ' Alterado',
                    "email": 'alterado' + email,
                    "password": senha
                }
            }).should(response => {
                expect(response.status).equal(200)
                expect(response.body.message).equal('Usuário atualizado com sucesso.')
            })
        })
    })
})

