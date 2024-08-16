import { Model, DataTypes } from "sequelize"; // Importar classe Model e DataTypes do Sequelize

import sequelize from "../../../config/database.js"; // Importar instância do Sequelize

class Contract extends Model {}

// Inicializar modelo Contract
Contract.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    searchable: {
      type: DataTypes.TEXT,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize, // Instância do Sequelize
    modelName: "Contract", // Nome do modelo
    paranoid: true, // Soft delete
    indexes: [
      {
        using: "BTREE",
        fields: ["name"], // Adicionar índice para a coluna `name`
      },
    ],
  }
);

// função trigger para atualizar searchable sempre que um novo contrato for criado
Contract.addHook("beforeSave", (contract) => {
  contract.searchable = `${contract.name} ${contract.description}`;
});

// função trigger para atualizar searchable sempre que name, description forem modificados
Contract.addHook("beforeUpdate", (contract) => {
  contract.searchable = `${contract.name} ${contract.description}`;
});

export default Contract; // Exportar modelo Contract
