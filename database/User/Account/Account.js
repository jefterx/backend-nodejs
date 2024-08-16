import bcript from 'bcryptjs';

import Account from '../../../src/api/models/User/Account/Account.js';

async function SyncAccount() {
    try {
        // Sincronizando o modelo Account
        await Account.sync({force: true}); // Isso irá criar a tabela, se ela não existir

        // Tabela Account criada com sucesso
        console.log("Tabela Account criada com sucesso");
    } catch (error) {
        // Erro ao criar a tabela Account
        console.error("Erro ao criar a tabela Account: ", error);
    }
}

export default SyncAccount; // Exportando a função Account
