/// <reference types="cypress"/>
import { faker } from '@faker-js/faker';

let token

beforeEach(() => {
  

});

describe('GET - Testes de Gestão de Usuários - Listar', () => {

    it('Listar como admin (sucesso)', () => {
       
    });

    it('Tentar listar como usuário comum (403)', () => {
       
    });

    it('Paginação com diferentes limites', () => {
       
    });

    it('Buscar por nome ou email', () => {
       
    });

    it('Verificar estatísticas de reservas', () => {
       
    }); 
    
});

describe('GET - Testes de Gestão de Usuários - Ver perfil de usuário', () => {

    it('Ver próprio perfil (sucesso)', () => {
       
    });

    it('Admin ver perfil de qualquer usuário (sucesso)', () => {
       
    });

    it('Usuário comum tentar ver perfil de outro (403)', () => {
       
    });

    it('ID de usuário inexistente (404)', () => {
       
    });

    it('Verificar estatísticas incluídas', () => {
       
    }); 
    
});

describe('POST - Testes de Gestão de Usuários - Criar novos usuários', () => {

    it('Criar usuário com dados válidos (sucesso)', () => {
       
    });

    it('Email já existente (400)', () => {
       
    });

    it('Senha muito curta (400)', () => {
       
    });

    it('Email malformado (400)', () => {
       
    });

    it('Nome muito curto (400)', () => {
       
    }); 

    it('Campos obrigatórios em branco (400)', () => {
       
    }); 
    
});

describe('PUT - Testes de Gestão de Usuários - Atulizar dados de usuário', () => {

    it('Atualizar próprios dados (sucesso)', () => {
       
    });

    it('Admin atualizar dados de qualquer usuário (sucesso)', () => {
       
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

describe('PUT - Testes de Gestão de Usuários - Remover usuário', () => {

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
