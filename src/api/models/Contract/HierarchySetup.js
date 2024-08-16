import { Model, DataTypes } from "sequelize";

import sequelize from "../../../config/database.js";

import Contract from "./Contract.js";

class HierarchySetup extends Model {}

HierarchySetup.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    contractId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Contracts",
        key: "id",
      },
    },
    level: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "HierarchySetup",
    indexes: [
      {
        unique: false, // Índice não único
        fields: ["contractId"], // Adicionar índice para a coluna `contractId`
      }
    ],
  }
);

Contract.hasMany(HierarchySetup, {
  foreignKey: "contractId",
}); // Adicionar associação `hasMany` (um-para-muitos) com modelo HierarchySetup

HierarchySetup.belongsTo(Contract, {
  foreignKey: "contractId",
}); // Adicionar associação `belongsTo` (muitos-para-um) com modelo Contract

export default HierarchySetup;
