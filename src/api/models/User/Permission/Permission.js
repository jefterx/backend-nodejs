import { Model, DataTypes } from "sequelize";

import sequelize from "../../../../config/database.js";

import PermissionGroup from "./PermissionGroup.js";

class Permission extends Model {}

Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    permissionGroupId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "PermissionGroups",
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    searchable: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "Permission",
    indexes: [
      {
        unique: false, // Índice não único
        fields: ["permissionGroupId"], // Adicionar índice para a coluna `permissionGroupId`
      },
      {
        using: "BTREE",
        fields: ["name"], // Adicionar índice para a coluna `name`
      },
    ],
  }
);

// função trigger para atualizar searchable sempre que um novo contrato for criado
Permission.addHook("beforeSave", (permission) => {
  permission.searchable = `${permission.name} ${permission.description} ${permission.type}`;
});

// função trigger para atualizar searchable sempre que name, description forem modificados
Permission.addHook("beforeUpdate", (permission) => {
  permission.searchable = `${permission.name} ${permission.description} ${permission.type}`;
});

Permission.belongsTo(PermissionGroup, {
  foreignKey: "permissionGroupId",
}); // Adicionar associação `belongsTo` (muitos-para-um) com modelo PermissionGroup

PermissionGroup.hasMany(Permission, {
  foreignKey: "permissionGroupId",
}); // Adicionar associação `hasMany` (um-para-muitos) com modelo Permission

export default Permission; // Exportar modelo Permission
