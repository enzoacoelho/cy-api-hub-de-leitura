/// <reference types="cypress"/>
import { faker } from '@faker-js/faker';

let token

beforeEach(() => {
  

});

describe('GET - Testes de Cesta de Livros - Listar', () => {

    it('Listar itens da cesta', () => {
       
    });

    it('Ver própria cesta (sucesso)', () => {
       
    });

    it('Tentar ver cesta de outro usuário (403)', () => {
       
    });

    it('Cesta vazia vs com itens', () => {
       
    });

    it('Verificar livros que ficaram indisponíveis', () => {
       
    });

});

describe('GET - Testes de Cesta de Livros - Verificar disponibilidade dos itens', () => {

    it('Todos os itens disponíveis', () => {
       
    });

    it('Alguns itens ficaram indisponíveis', () => {
       
    });

    it('Cesta vazia', () => {
       
    });

});

describe('POST - Testes de Cesta de Livros / Carrinho', () => {

    it('Adicionar livro disponível (sucesso)', () => {
       
    });

    it('Adicionar livro já na cesta (400)', () => {
       
    });

    it('Adicionar livro esgotado (400)', () => {
       
    });

    it('Adicionar livro inexistente (404)', () => {
       
    });

    it('Quantidade diferente de 1 (400)', () => {
       
    });

    it('Tentar adicionar à cesta de outro usuário (403)', () => {
       
    });

});

describe('DELETE - Testes de Cesta de Livros - Limpar cesta completa', () => {

    it('Limpar cesta com itens (sucesso)', () => {
       
    });

    it('Limpar cesta já vazia (sucesso)', () => {
       
    });

    it('Tentar limpar cesta de outro usuário (403)', () => {
       
    });

});

describe('DELETE - Testes de Cesta de Livros - Remover item específico', () => {

    it('Remover item existente na cesta (sucesso)', () => {
       
    });

    it('Remover item que não está na cesta (404)', () => {
       
    });

    it('IDs inválidos (400)', () => {
       
    });

    it('Tentar remover de cesta de outro usuário (403)', () => {
       
    });

});



