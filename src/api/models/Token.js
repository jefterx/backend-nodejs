import { Model, DataTypes } from "sequelize"; // Importar classe Model e DataTypes do Sequelize

import sequelize from "../../config/database.js"; // Importar instância do Sequelize

import User from "./User/User.js"; // Importar modelo User

class Token extends Model {}

// Inicializar modelo Token
Token.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mode: {
      type: DataTypes.ENUM("production", "development"),
      allowNull: false,
    },
    use: {
      type: DataTypes.ENUM("system", "personal"),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize, // Instância do Sequelize
    modelName: "Token", // Nome do modelo
    timestamps: false, // Não adicionar colunas `createdAt` e `updatedAt`
    indexes: [
      {
        unique: false, // Índice não único
        fields: ["userId"], // Adicionar índice para a coluna `userId`
      },
      {
        unique: true, // Índice único
        fields: ["token"], // Adicionar índice para a coluna `token`
      },
    ],
  }
);

User.hasMany(Token, { foreignKey: "userId" }); // Adicionar associação `hasMany` (um-para-muitos) com modelo Token
Token.belongsTo(User, { foreignKey: "userId" }); // Adicionar associação `belongsTo` (muitos-para-um) com modelo User

export default Token; // Exportar modelo Token
