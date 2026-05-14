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

describe('GET - Testes de Gestão de Usuários - Listar', () => {

    it('Deve listar usuários com sucesso', () => {
        cy.api({
            method: 'GET',
            url: 'users',
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).equal(200)
            expect(response.body.users).be.an('array')
        });
    });

    it('Deve buscar um usuário por ID', () => {
        cy.api({
            method: 'GET',
            url: 'users/2',
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).equal(200)
            expect(response.body).have.property('id')
            expect(response.body).have.property('name')
            expect(response.body).have.property('email')
        });
    });

    it('Tentar listar como usuário comum (403)', () => {
       cy.fixture('users').then((usuarios) => {
            cy.gerarToken(usuarios.padrao.email, usuarios.padrao.password).then(tkn => {
                tokenComum = tkn;

                cy.api({
                    method: 'GET',
                    url: 'users',
                    headers: { 'Authorization': tokenComum }
                }).should(response => {
                    expect(response.status).equal(403);
                    expect(response.body.message).to.equal("Acesso negado. Apenas administradores podem realizar esta ação.");
                    expect(response.body.error).to.equal("ADMIN_REQUIRED");
                });
            });
        });  
    });

    it('Buscar por nome ou email', () => {
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
            expect(response.status).equal(200);
            const usuarios = response.body.users;
            expect(usuarios.name).equal("Usuário Padrão");

        });
    });
    
});


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
        });
       
    });

    it('Email já existente (400)', () => {
        cy.fixture('users').then((usuarios) => {
            const name = usuarios.padrao.name;
            const email = usuarios.padrao.email;
            const password = usuarios.padrao.password;
            cy.api({
                method: 'POST',
                url: 'users',
                headers: { 'Authorization': token },
                body: {
                    "name": name,
                    "email": email,
                    "password": password
                }
            }).should(response => {
                expect(response.status).equal(400);
                expect(response.body.message).equal("Email já está sendo usado por outro usuário.");
            });
        });
       
    });

    it('Senha muito curta (400)', () => {
        cy.api({
                method: 'POST',
                url: 'users',
                headers: { 'Authorization': token },
                body: {
                    "name": "nome aleatório",
                    "email": "email@hot.com",
                    "password": 12
                }
            }).should(response => {
                expect(response.status).equal(400);
                expect(response.body.message).equal("Senha deve ter pelo menos 6 caracteres.");
            });
       
    });

    it('Email malformado (400)', () => {
       cy.api({
            method: 'POST',
            url: 'users',
            headers: { 'Authorization': token },
            body: {
                "name": "Maria Santos",
                "email": "mariaemail.com",
                "password": "senha123"
            },
            failOnStatusCode: false
        }).should(response => {
            expect(response.status).equal(400);
            expect(response.body.message).equal('Formato de email inválido.');
        });
    });

    it('Nome muito curto (400)', () => {
        cy.api({
            method: 'POST',
            url: 'users',
            headers: { 'Authorization': token },
            body: {
                "name": "M",
                "email": "maria@email.com",
                "password": "senha123444"
            },
            failOnStatusCode: false
        }).should(response => {
            expect(response.status).equal(400);
            expect(response.body.message).equal("Nome deve ter pelo menos 2 caracteres.");
        });
       
    }); 

    it('Campos obrigatórios em branco (400)', () => {
        cy.api({
            method: 'POST',
            url: 'users',
            headers: { 'Authorization': token },
            body: {
                "name": "",
                "email": "",
                "password": ""
            },
            failOnStatusCode: false
        }).should(response => {
            expect(response.status).equal(400);
            expect(response.body.message).equal("Nome, email e senha são obrigatórios.");
        });
       
    }); 
    
});

describe('PUT - Testes de Gestão de Usuários - Atulizar dados de usuário', () => {

    let name = faker.person.fullName()
    let email = faker.internet.email()
    let senha = faker.internet.password()

    cy.cadastrarUsuario(name, email, senha).then(userID => {
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
            expect(response.status).equal(200);
            expect(response.body.message).equal('Usuário atualizado com sucesso.');
        });
    });
    
});

describe('DELETE - Testes de Gestão de Usuários - Remover usuário', () => {

    it('Deve deletar um usuário com sucesso - Dinamico', () => {
    let name = faker.person.fullName()
    let email = faker.internet.email()
    let senha = faker.internet.password()

    cy.cadastrarUsuario(name, email, senha).then(userID => {
        cy.api({
            method: 'DELETE',
            url: 'users/' + userID,
            headers: { 'Authorization': token }                
        }).should(response => {
            expect(response.status).equal(200)
            expect(response.body.message).equal('Usuário removido com sucesso.')
        });
        })
    });
    
});
