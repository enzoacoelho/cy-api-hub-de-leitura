/// <reference types="cypress"/>

import { checkHealth, checkInfos } from '../../support/requests/system'

describe('GET - Testes de monitoramento da saúde do sistema - /api/health', () => {

    it('Verificar status do servidor, conexao com banco e serviços disponíveis', () => {
        checkHealth().then((response) => {
            expect(response.status).equal(200)
            expect(response.body.services.database).to.equal("connected")
            expect(response.body.services.auth).to.equal("working")
            expect(response.body.services.swagger).to.equal("active")
            expect(response.body.version).to.equal("1.0.0")
        })
    })
})

describe('GET - Informações gerais da API - /api/info', () => {
    it('Retornar informações gerais sobre a API e endpoints disponíveis', () => {
        checkInfos().then((response) => {
            expect(response.status).equal(200)

            expect(response.body.name).equal("Hub de Leitura API")
            expect(response.body.description).to.equal("Sistema de biblioteca para aprendizado de QA")
        })
    })
})

