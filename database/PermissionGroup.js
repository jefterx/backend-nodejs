import PermissionGroup from '../src/api/models/User/Permission/PermissionGroup.js';
import sequelize from '../src/config/database.js';

async function SyncPermissionGroup() {
    try {
        // Sincronizando o modelo PermissionGroup
        await PermissionGroup.sync({force: true}); // Isso irá criar a tabela, se ela não existir

        // Tabela PermissionGroup criada com sucesso
        console.log("Tabela PermissionGroup criada com sucesso");

        // criar um índice GiST com pg_trgm na coluna searchable
        await sequelize.query('CREATE INDEX IF NOT EXISTS permission_groups_search_idx ON "PermissionGroups" USING GIST (searchable gist_trgm_ops);');

    } catch (error) {
        // Erro ao criar a tabela PermissionGroup
        console.error("Erro ao criar a tabela PermissionGroup: ", error);
    }
}

export default SyncPermissionGroup; // Exportando a função PermissionGroup
