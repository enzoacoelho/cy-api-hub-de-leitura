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
       
    });

    it('Buscar por nome ou email', () => {
       cy.api({
            method: 'GET',
            url: 'users',
            headers: { 'Authorization': token },
            qs: {
                page: 1,
                limit: 20,
                search: "Usuário"
            }
        }).should(response => {
            expect(response.status).equal(200)

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
            //headers: { 'Authorization': token }
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
       
    });

    it('Senha muito curta (400)', () => {
       
    });

    it('Email malformado (400)', () => {
       cy.api({
            method: 'POST',
            url: 'users',
            //headers: { 'Authorization': token }
            body: {
                "name": "Maria Santos",
                "email": "mariaemail.com",
                "password": "senha123"
            },
            failOnStatusCode: false
        }).should(response => {
            expect(response.status).equal(400)
            expect(response.body.message).equal('Formato de email inválido.')
        });
    });

    it('Nome muito curto (400)', () => {
       
    }); 

    it('Campos obrigatórios em branco (400)', () => {
       
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
            expect(response.status).equal(200)
            expect(response.body.message).equal('Usuário atualizado com sucesso.')
        });
    });

    it('Atualizar próprios dados (sucesso)', () => {
       
    });

    it('Usuário comum tentar atualizar outro (403)', () => {
       
    });

    it('Email já usado por outro usuário (400)', () => {
       
    });

    it('Nova senha muito curta (400)', () => {
       
    }); 

    it('Formato de email inválido (400)', () => {
       
    }); 

    it('Atualização parcial (só alguns campos)', () => {
       
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

    it('Admin remover usuário sem reservas ativas (sucesso)', () => {
       
    });

    it('Admin tentar remover usuário com reservas ativas (400)', () => {
       
    });

    it('Usuário comum tentar remover (403)', () => {
       
    });

    it('ID inexistente (404)', () => {
       
    });

    it('Verificar limpeza de dados relacionados', () => {
       
    }); 
    
});
