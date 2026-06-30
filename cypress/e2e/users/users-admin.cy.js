/// <reference types="cypress"/>

import * as userMgmt from '../../support/requests/users-admin'

let tokenAdmin
let tokenPadrao
let userId
let name
let email

beforeEach(() => {
    cy.createUserAndLogin().then(usuario => {
        tokenPadrao = usuario.token
        userId = usuario.id
        email = usuario.email
        name = usuario.name
    })

    cy.fixture('users').then((usuarios) => {
        cy.gerarToken(usuarios.admin.email, usuarios.admin.password).then(tkn => {
            tokenAdmin = tkn
        })

    })
})

describe('GET - Gestão de Usuários como ADMIN - api/users', () => {

    it('Deve listar usuários com sucesso', () => {
        userMgmt.getUsers(tokenAdmin).then(response => {
            expect(response.status).to.eq(200)

            const body = response.body

            expect(body.users).to.be.an('array')

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

            expect(response.body.id).to.eq(userId)
            expect(response.body.name).to.eq(name)
            expect(response.body.email).to.eq(email)
        })
      
    })

    it('Deve buscar um usuário por nome', () => {        
        userMgmt.getUserByName(tokenAdmin, name).should(response => {
            expect(response.status).equal(200)
            expect(response.body.users).to.be.an('array')

            const users = response.body.users

            expect(users[0]).to.have.property('name')
            expect(users[0]).to.have.property('email')

            expect(users[0].id).to.eq(userId)
            expect(users[0].name).to.eq(name)
            expect(users[0].email).to.eq(email)
        })       
    })

    it('Deve buscar um usuário por email', () => {
        userMgmt.getUserByEmail(tokenAdmin, email).should(response => {
            expect(response.status).equal(200)
            expect(response.body.users).to.be.an('array')

            const users = response.body.users

            expect(users[0]).to.have.property('name')
            expect(users[0]).to.have.property('email')

            expect(users[0].id).to.eq(userId)
            expect(users[0].name).to.eq(name)
            expect(users[0].email).to.eq(email)
        })        
    })
})


describe('DELETE - Gestão de Usuários como ADMIN - api/users/:id', () => {
    it('Deve deletar um usuário com sucesso - Dinamico', () => {
        cy.removeUser(tokenAdmin, userId).then(response => {
            expect(response.status).equal(200)
            expect(response.body.message).equal('Usuário removido com sucesso.')

        })        
    })

    it('Não deve deletar um usuário sem permissão', () => {
        cy.removeUser(tokenPadrao, 1).then(response => {
            expect(response.status).equal(403)
        })
    })

    it('Não deve deletar um usuário com reservas de livros ativa', () => {
        cy.createAndReserveBook(tokenAdmin, tokenPadrao)
        cy.createAndReserveBook(tokenAdmin, tokenPadrao)

        cy.removeUser(tokenAdmin, userId).then(response => {
            expect(response.status).equal(400)
            expect(response.body.message).equal('Não é possível remover usuário com 2 reserva(s) ativa(s).')
            expect(response.body.activeReservations).equal(2)
            expect(response.body.suggestion).equal('Cancele ou complete as reservas antes de remover o usuário.')
        })                   
        
    })
})