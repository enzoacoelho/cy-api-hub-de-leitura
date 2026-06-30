import { faker } from '@faker-js/faker'

export const getUsers = (tokenAdmin) => {
    return cy.api({
        method: 'GET',
        url: 'users',
        failOnStatusCode: false,
        headers: { Authorization: tokenAdmin }
    })       
}

export const getUserById = (tokenAdmin, userId) => {
    return cy.api({
        method: 'GET',
        url: `users/${userId}`,
        failOnStatusCode: false,
        headers: { Authorization: tokenAdmin }
    })       
}

export const getUserByName = (tokenAdmin, userName) => {
    return cy.api({
        method: 'GET',
        url: 'users/',
        qs: {
            search: userName
        },
        failOnStatusCode: false,
        headers: { Authorization: tokenAdmin }
    })       
}

export const getUserByEmail = (tokenAdmin, userEmail) => {
    return cy.api({
        method: 'GET',
        url: 'users/',
        qs: {
            search: userEmail
        },
        failOnStatusCode: false,
        headers: { Authorization: tokenAdmin }
    })       
}

export const register = (name, email, password) => {
    return cy.api({
        method: 'POST',
        url: 'users/',
        body: {
            
            "name": name,
            "email": email,
            "password": password

        },
        failOnStatusCode: false,
        headers: { Authorization: tokenAdmin }
    })       
}


export const createAndRegister = () => {
    const userName = faker.person.fullName()
    const userEmail = faker.internet.email()
    const userPass = '1234user'

    return register(userName, userEmail, userPass).then(response => {

        cy.wrap ({
            id: response.body.user.userId,
            name: response.body.user.name,
            email: response.body.user.email,      
            password: userPass       
        })        
    })
}