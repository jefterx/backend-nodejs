import { Model, DataTypes } from "sequelize";

import sequelize from "../../../../config/database.js";

class PermissionGroup extends Model {}

// Inicializar modelo PermissionGroup
PermissionGroup.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Accounts",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "PermissionGroups",
        key: "id",
      },
    },
    searchable: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "PermissionGroup",
    indexes: [
      {
        unique: false, // Índice não único
        fields: ["accountId"], // Adicionar índice para a coluna `accountId`
      },
      {
        using: "BTREE",
        fields: ["name"], // Adicionar índice para a coluna `name`
      },
      {
        unique: false, // Índice não único
        fields: ["parentId"], // Adicionar índice para a coluna `parentId`
      },
    ],
  }
);

// função trigger para atualizar searchable sempre que um novo contrato for criado
PermissionGroup.addHook("beforeSave", (permissionGroup) => {
  permissionGroup.searchable = `${permissionGroup.name} ${permissionGroup.description}`;
});

// função trigger para atualizar searchable sempre que name, description forem modificados
PermissionGroup.addHook("beforeUpdate", (permissionGroup) => {
  permissionGroup.searchable = `${permissionGroup.name} ${permissionGroup.description}`;
});

PermissionGroup.hasMany(PermissionGroup, {
  foreignKey: "parentId",
}); // Adicionar associação `hasMany` (um-para-muitos) com modelo PermissionGroup

export default PermissionGroup; // Exportar modelo PermissionGroup
