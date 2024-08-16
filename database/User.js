import bcript from "bcryptjs";

import User from "../src/api/models/User/User.js";
import Account from "../src/api/models/User/Account/Account.js";
import sequelize from "../src/config/database.js";

async function SyncUser() {
  try {    
    // Sincronizando o modelo User
    await User.sync({ force: true }); // Isso irá criar a tabela, se ela não existir

    // Tabela User criada com sucesso
    console.log("Tabela User criada com sucesso");

    // criar um índice GiST com pg_trgm na coluna searchable
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS user_search_idx ON "Users" USING GIST (searchable gist_trgm_ops);'
    );

    // Inserir usuário padrão, usar senha criptografada
    const password = await bcript.hash("12250200", 10);

    const user = await User.create({
      name: "TI 77SEG",
      email: "ti@77seg.io",
      password: password,
      role: "admin",
    });

    console.log("Usuário padrão criado com sucesso");

    // Coletar o ID do usuário
    const userId = user.id;

    // Criar Account de admin
    const account = await Account.create({
      userId: userId,
      role: "admin",
    });

    console.log("Account de admin criado com sucesso");

    // Coletar o ID da Account
    const accountId = account.id;

    // Atualizar o campo account_default do usuário
    await User.update(
      {
        account_default: accountId,
      },
      {
        where: {
          id: userId,
        },
      }
    );

    console.log("Campo account_default atualizado com sucesso");
  } catch (error) {
    // Erro ao criar a tabela User
    console.error("Erro ao criar a tabela User: ", error);
  }
}

export default SyncUser; // Exportando a função User
