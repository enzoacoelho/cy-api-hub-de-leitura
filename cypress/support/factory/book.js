import { faker } from '@faker-js/faker'

export const criarLivro = () => {

    return {
        title: faker.lorem.words(3),
        author: faker.person.fullName(),
        description: faker.lorem.paragraph(),
        category: faker.helpers.arrayElement(['Ficção', 'Fantasia', 'Romance', 'Biografia', 'História']),
        isbn: faker.string.numeric(13),
        editor: faker.company.name(),
        language: faker.helpers.arrayElement(['Português', 'Inglês', 'Espanhol']),
        publication_year: faker.date.past(20).getFullYear(),
        pages: 965,
        format: faker.helpers.arrayElement(['Físico', 'Digital']),
        total_copies: 50,
        available_copies: 45
    }
}