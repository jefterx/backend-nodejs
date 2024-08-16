import dotenv from 'dotenv'; // Importar dotenv para carregar variáveis ​​de ambiente do arquivo .env
dotenv.config();

import { Sequelize } from 'sequelize'; // Importar Sequelize

// Criar uma instância do Sequelize
const postgres_sequelize = new Sequelize(process.env.POSTGRES_DB_NAME, process.env.POSTGRES_DB_USER, process.env.POSTGRES_DB_PASSWORD, {
    host: process.env.POSTGRES_DB_HOST,
    dialect: 'postgres',
    timezone: 'America/Sao_Paulo',
    dialectOptions: {
        useUTC: false,
        dateStrings: true,
        typeCast: true
    },
    pool: {
        max: 5, // número máximo de conexões no pool
        min: 0, // número mínimo de conexões no pool
        acquire: 30000, // tempo máximo, em milissegundos, que o pool tentará obter a conexão antes de lançar o erro
        idle: 10000 // tempo máximo, em milissegundos, que uma conexão pode ser ociosa antes de ser liberada
    }
});

export default postgres_sequelize; // Exportar instância do Sequelize
