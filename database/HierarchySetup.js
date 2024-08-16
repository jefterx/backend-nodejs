import HierarchySetup from '../src/api/models/Contract/HierarchySetup.js';

async function SyncHierarchySetup() {
    try {
        // Sincronizando o modelo HierarchySetup
        await HierarchySetup.sync({force: true}); // Isso irá criar a tabela, se ela não existir

        // Tabela HierarchySetup criada com sucesso
        console.log("Tabela HierarchySetup criada com sucesso");

    } catch (error) {
        // Erro ao criar a tabela HierarchySetup
        console.error("Erro ao criar a tabela HierarchySetup: ", error);
    }
}

export default SyncHierarchySetup; // Exportando a função HierarchySetup
