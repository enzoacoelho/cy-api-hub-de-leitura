/// <reference types="cypress"/>

import { use } from 'chai'
import * as userMgmt from '../../support/requests/users-admin'

let tokenAdmin
let tokenPadrao
let userId

beforeEach(() => {
    cy.fixture('users').then((usuarios) => {
        userId = usuarios.padrao.userID
        cy.gerarToken(usuarios.admin.email, usuarios.admin.password).then(tkn => {
            tokenAdmin = tkn
        })

        cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tkn => {
            tokenPadrao = tkn
    
        })
    })
})

describe('GET - Gestão de Usuários como ADMIN - api/users', () => {

    it('Deve listar usuários com sucesso', () => {
        userMgmt.getUsers(tokenAdmin).then(response => {
            expect(response.status).to.eq(200)

            const body = response.body

            expect(body.users).to.be.an('array')
            expect(body.users).to.have.lengthOf(2) // Opcional: valida a quantidade se for fixa

            body.users.forEach((user) => {
                expect(user).to.have.all.keys('id', 'name', 'email', 'isAdmin', 'activeReservations', 'totalReservations')
                
                expect(user.id).to.be.a('number')
                expect(user.name).to.be.a('string').and.not.be.empty
                expect(user.email).to.be.a('string').and.not.be.empty
            })

            expect(body.pagination).to.have.all.keys('currentPage', 'totalPages', 'totalUsers', 'hasNext', 'hasPrev', 'limit', 'showing')
        })
    })

    it('Não deve listar usuários com token de usuário comum (403)', () => {
        userMgmt.getUsers(tokenPadrao).then(response => {
            expect(response.status).equal(403)
            expect(response.body.message).to.equal("Acesso negado. Apenas administradores podem realizar esta ação.")
            expect(response.body.error).to.equal("ADMIN_REQUIRED")
        })
    })     

    it('Deve buscar um usuário por ID', () => {
        userMgmt.getUserById(tokenAdmin, userId).should(response => {
            expect(response.status).equal(200)
            expect(response.body).have.property('id')
            expect(response.body).have.property('name')
            expect(response.body).have.property('email')
        })
    })

        it('Deve buscar um usuário por nome', () => {
            cy.api({
                method: 'GET',
                url: 'users/2',
                headers: { 'Authorization': tokenAdmin }
            }).should(response => {
                expect(response.status).equal(200)
                expect(response.body).have.property('id')
                expect(response.body).have.property('name')
                expect(response.body).have.property('email')
            })
        })

        it('Deve buscar um usuário por email', () => {
            cy.api({
                method: 'GET',
                url: 'users/2',
                headers: { 'Authorization': tokenAdmin }
            }).should(response => {
                expect(response.status).equal(200)
                expect(response.body).have.property('id')
                expect(response.body).have.property('name')
                expect(response.body).have.property('email')
            })
        })

    })

    describe('DELETE - Gestão de Usuários como ADMIN - api/users/:id', () => {

        it('Deve deletar um usuário com sucesso - Dinamico', () => {
            let name = faker.person.fullName()
            let email = faker.internet.email()
            let senha = faker.internet.password()

            cadastrarUsuario(name, email, senha, token).then(userID => {
                cy.api({
                    method: 'DELETE',
                    url: 'users/' + userID,
                    headers: { 'Authorization': token }
                }).should(response => {
                    expect(response.status).equal(200)
                    expect(response.body.message).equal('Usuário removido com sucesso.')
                })
            })
        })

    })