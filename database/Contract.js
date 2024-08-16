import Contract from '../src/api/models/Contract/Contract.js';
import sequelize from '../src/config/database.js';


async function SyncContract() {
    try {
        // Sincronizando o modelo Contract
        await Contract.sync({force: true}); // Isso irá criar a tabela, se ela não existir

        // Tabela Contract criada com sucesso
        console.log("Tabela Contract criada com sucesso");

        // criar um índice GiST com pg_trgm na coluna searchable
        await sequelize.query('CREATE INDEX IF NOT EXISTS contract_search_idx ON "Contracts" USING GIST (searchable gist_trgm_ops);');

    } catch (error) {
        // Erro ao criar a tabela Contract
        console.error("Erro ao criar a tabela Contract: ", error);
    }
}

export default SyncContract; // Exportando a função Contract
