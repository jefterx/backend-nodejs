import { Model, DataTypes } from "sequelize"; // Importar classe Model e DataTypes do Sequelize

import sequelize from "../../../config/database.js"; // Importar instância do Sequelize

class User extends Model {}

// Inicializar modelo User
User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_default: {
      type: DataTypes.UUID,
      allowNull: true,
      unique: true,
      references: {
        model: "Accounts",
        key: "id",
      },
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
    modelName: "User", // Nome do modelo
    paranoid: true, // Soft delete
    indexes: [
      {
        using: "BTREE",
        fields: ["email"], // Adicionar índice para a coluna `email`
      }
    ],
  }
);

// função trigger para atualizar searchable sempre que um novo usuário for criado
User.addHook("beforeSave", (user) => {
  user.searchable = `${user.name} ${user.email}`;
});

// função trigger para atualizar searchable sempre que name, email, ou role forem modificados
User.addHook("beforeUpdate", (user) => {
  user.searchable = `${user.name} ${user.email}`;
});

export default User; // Exportar modelo User
