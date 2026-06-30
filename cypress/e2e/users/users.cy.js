/// <reference types="cypress"/>
import { faker } from '@faker-js/faker'
import * as users from '../../support/requests/users'

let tokenAdmin
let tokenPadrao
let emailPadrao
let namePadrao
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

        emailPadrao = usuarios.padrao.email
        namePadrao = usuarios.padrao.name
    })
})

afterEach(() => {
    if (userId) {
        cy.removeUser(tokenAdmin, userId); 
    }
});

describe('GET - Visualizar o proprio perfil - api/users/:id', () => {

    it('Deve ser possível visualizar dados do proprio perfil', () => {
        users.getUserById(tokenPadrao, userId).then(response => {
            expect(response.status).equal(200)
            expect(response.body).have.property('id')
            expect(response.body).have.property('name')
            expect(response.body).have.property('email')

            expect(response.body.id).to.eq(userId)
            expect(response.body.name).to.eq(name)
            expect(response.body.email).to.eq(email)
        })
    })

    it('Não deve ser possível visualizar dados de outro perfil', () => {        
        users.getUserById(tokenPadrao, 1).then(response => {
            expect(response.status).equal(403)
            expect(response.body.message).equal('Acesso negado. Você só pode ver seu próprio perfil.')

            expect(response.body).not.have.property('id')
            expect(response.body).not.have.property('name')
            expect(response.body).not.have.property('email')
        })        
    })
})

describe('POST - Criação de novo usuário - api/users', () => {

    it('Deve criar usuário com dados válidos (sucesso)', () => {
        const name = faker.person.fullName()
        const email = faker.internet.email()
        const password = '1234user'

        cy.registerUser(name, email, password).then(response => {
            expect(response.status).equal(201)
            expect(response.body.message).equal('Usuário criado com sucesso.')

            expect(response.body.user).to.have.property('id')
            expect(response.body.user.name).equal(name)
            expect(response.body.user.email).equal(email)
            expect(response.body.user.isAdmin).equal(false)

            const id = response.body.user.id
            cy.removeUser(tokenAdmin, id)
        })

    })

    it('Não deve criar usuário com email já existente (400)', () => {
        const email = emailPadrao

        cy.registerUser('teste', email, '123456').then(response => {
            expect(response.status).equal(400)
            expect(response.body.message).equal("Email já está sendo usado por outro usuário.")
        })

    })

    it('Não deve criar usuário com senha muito curta (min 6 caracteres)', () => {
        cy.registerUser('teste', 'teste@teste.com', '123').then(response => {
            expect(response.status).equal(400)
            expect(response.body.message).equal("Senha deve ter pelo menos 6 caracteres.")
        })

    })

    it('Não deve criar usuário com email malformado (400)', () => {
        cy.registerUser('teste', 'email.com', '123456').then(response => {
            expect(response.status).equal(400)
            expect(response.body.message).equal('Formato de email inválido.')
        })
    })

    it('Não deve criar usuário com nome curto (min 2 caracteres)', () => {
        cy.registerUser('a', 'teste@teste.com', '123456').then(response => {
            expect(response.status).equal(400)
            expect(response.body.message).equal("Nome deve ter pelo menos 2 caracteres.")
        })

    })

    it('Não deve criar usuário com campos obrigatórios em branco (400)', () => {
        cy.registerUser('', '', '').then(response => {
            expect(response.status).equal(400)
            expect(response.body.message).equal("Nome, email e senha são obrigatórios.")
        })

    })

})

describe('PUT - Atualizar dados do usuário - api/users/:id', () => {

    it('Atualizar dados de um usuário', () => {
        cy.createUserAndLogin(tokenAdmin).then(user => {
            const id = user.id
            const name = user.name
            const email = user.email
            const password = user.password
            const token = user.token

            users.alter(token, id, name, email, password).then(response => {

                expect(response.status).equal(200)
                expect(response.body.message).equal('Usuário atualizado com sucesso.')

                expect(response.body.user.id).equal(id)
                expect(response.body.user.name).equal(name + ' Alterado')
                expect(response.body.user.email).equal('alterado' + email)

            })

            cy.removeUser(tokenAdmin, id)
        })
    })

    it('Não deve atualizar dados de outro usuário', () => {
        cy.createUserAndLogin(tokenAdmin).then(user => {
            const id = user.id
            const name = user.name
            const email = user.email
            const password = user.password
            const token = user.token

            users.alter(token, 1, name, email, password).then(response => {
                expect(response.status).equal(403)
            })

            cy.removeUser(tokenAdmin, id)
        })
    })

    it('Não deve atualizar o email com um email já existente', () => {
        cy.createUserAndLogin(tokenAdmin).then(user => {
            const id = user.id
            const name = user.name
            const password = user.password
            const token = user.token

            users.alter(token, id, name, emailPadrao, password).then(response => {
                expect(response.status).equal(400)
            })

            cy.removeUser(tokenAdmin, id)
        })
    })

    it('Não deve atualizar com uma senha curta (min 6 caracteres)', () => {
        cy.createUserAndLogin(tokenAdmin).then(user => {
            const id = user.id
            const name = user.name
            const email = user.email
            const password = user.password
            const token = user.token

            users.alter(token, id, name, email, '123').then(response => {
                expect(response.status).equal(400)
            })

            cy.removeUser(tokenAdmin, id)
        })
    })

    it('Não deve atualizar com um email inválido', () => {
        cy.createUserAndLogin(tokenAdmin).then(user => {
            const id = user.id
            const name = user.name
            const password = user.password
            const token = user.token

            users.alter(token, id, 'teste#com', email, '123').then(response => {
                expect(response.status).equal(400)
            })

            cy.removeUser(tokenAdmin, id)
        })
    })

    it('Não deve atualizar com os campos obrigatórios em branco', () => {
        cy.createUserAndLogin(tokenAdmin).then(user => {
            const id = user.id
            const token = user.token

            users.alter(token, id, '', '', '').then(response => {
                expect(response.status).equal(400)
            })

            cy.removeUser(tokenAdmin, id)
        })
    })
})

