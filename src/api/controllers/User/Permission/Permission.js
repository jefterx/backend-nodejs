import Joi from "joi";
import { Op } from "sequelize";

import PermissionGroup from "../../../models/User/Permission/PermissionGroup.js";
import Permission from "../../../models/User/Permission/Permission.js";

export const createPermission = async (req, res) => {
  try {
    // Obter o ID do Permission Group
    const { permissionGroupId } = req.params;

    // Definir o esquema de validação para permissionGroupId
    const idSchema = Joi.string().guid({ version: "uuidv4" });

    // Validar o permissionGroupId
    const { error: idError } = idSchema.validate(permissionGroupId);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (idError) {
      return res
        .status(400)
        .json({
          message: "Id do Grupo de Permissão inválido",
          error: idError.details,
        });
    }

    // Definir o esquema de validação
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      description: Joi.string(),
      type: Joi.string().valid("read", "write", "delete").required(),
    });

    // Validar os parâmetros de consulta
    const { error, value } = schema.validate(req.body);

    // Se houver um erro de validação, enviar uma resposta com o erro
    if (error) {
      return res
        .status(400)
        .json({ message: "Dados de entrada inválidos", error: error.details });
    }

    // Obter o usuário autenticado do corpo da solicitação
    const tokenData = req.tokenData;

    // Verificar se o grupo de permissões pertence ao usuário autenticado
    const permissionGroup = await PermissionGroup.findOne({
      where: {
        id: permissionGroupId,
        userId: tokenData.userId,
      },
    });

    // Se o grupo de permissões não for encontrado, enviar uma resposta com o erro
    if (!permissionGroup) {
      return res
        .status(404)
        .json({ message: "Grupo de permissões não encontrado" });
    }

    // Criar uma nova permissão
    const permission = await Permission.create({
      ...value,
      permissionGroupId,
    });

    return res.status(201).json({
      message: "Permissão criada com sucesso!",
      permission,
    });
  } catch (error) {
    // Erro interno do servidor
    return res.status(500).json({ message: "Erro interno do servidor", error });
  }
};
