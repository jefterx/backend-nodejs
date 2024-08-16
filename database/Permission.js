import Permission from '../src/api/models/User/Permission/Permission.js';
import sequelize from '../src/config/database.js';

async function SyncPermission() {
    try {
        // Sincronizando o modelo Permission
        await Permission.sync({force: true}); // Isso irá criar a tabela, se ela não existir

        // Tabela Permission criada com sucesso
        console.log("Tabela Permission criada com sucesso");

        // criar um índice GiST com pg_trgm na coluna searchable
        await sequelize.query('CREATE INDEX IF NOT EXISTS permissions_search_idx ON "Permissions" USING GIST (searchable gist_trgm_ops);');

    } catch (error) {
        // Erro ao criar a tabela Permission
        console.error("Erro ao criar a tabela Permission: ", error);
    }
}

export default SyncPermission; // Exportando a função Permission
