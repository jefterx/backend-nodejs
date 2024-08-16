import { Model, DataTypes } from "sequelize";

import sequelize from "../../../../config/database.js";

class Account extends Model {}

// Inicializar modelo Account
Account.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    hierarchySetupId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "staff", "user"),
      allowNull: false,
    },
    permissionGroupId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Account",
    paranoid: true, // Soft delete
  }
);

export default Account; // Exportar modelo Account
