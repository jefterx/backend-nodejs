import Token from '../src/api/models/Token.js'; // Importando o modelo Token

async function SyncToken() {
    try {
        // Sincronizando o modelo Token
        await Token.sync({force: true}); // Isso irá criar a tabela, se ela não existir

        // Tabela Token criada com sucesso
        console.log("Tabela Token criada com sucesso");
    } catch (error) {
        // Erro ao criar a tabela Token
        console.error("Erro ao criar a tabela Token: ", error);
    }
}

export default SyncToken; // Exportando a função Token
