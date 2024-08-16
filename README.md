IAM

Grupo de Permissões: name e description

List de Permissões: MultiSelect

Update/Delete: Worker de Logica recursiva que verifica se tem algum grupo ligado ao mesmo id que tem a permission excluída 


PermissionGroup table:
id, userId, name, description, parentId, createdAt, updatedAt

Permission table:
id, permissionGroupId, name, type, description, searchble, createdAt

Todo usuário fora admin precisa ter um permission group vinculado ao mesmo

User table:
permissionGroupId (add)