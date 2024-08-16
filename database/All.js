import sequelize from '../src/config/database.js';
import SyncContract from './Contract.js';
import SyncToken from './Token.js';
import SyncUser from './User.js';
import SyncHierarchySetup from './HierarchySetup.js';
import SyncPermissionGroup from './PermissionGroup.js';
import SyncPermission from './Permission.js';
import SyncAccount from './User/Account/Account.js';

// Função principal
async function main() {
    try {
        // instalar extensões que potencializam o uso desses índices, como a pg_trgm para trigramas
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

        // sincronizar Account
        await SyncAccount();
        
        // sincronizar User
        await SyncUser();

        // sincronizar Token
        await SyncToken();

        // sincronizar Contract
        await SyncContract();

        // sincronizar HierarchySetup
        await SyncHierarchySetup();

        // sincronizar PermissionGroup
        await SyncPermissionGroup();

        // sincronizar Permission
        await SyncPermission();

        // Sincronização concluída
        console.log("Sincronização concluída");
    } catch (error) {
        // Erro durante a sincronização
        console.error("Erro durante a sincronização: ", error);
    }
}

main(); // Chamar a função principal