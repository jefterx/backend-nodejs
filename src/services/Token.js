import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import Token from "../api/models/Token.js";

dotenv.config();

// Importe o modelo Token
const verifyToken = async (userId, mode, use) => {
  try {
    // Busque o token pelo id do usuário
    const token = await Token.findOne({
      where: { userId, mode, use },
      order: [["createdAt", "DESC"]], // Obtenha o token mais recente
    });

    if (!token) {
      // Token não encontrado
      return null;
    } else {
      // Verifique se o token expirou
      const isExpired = new Date(token.expiresAt) < new Date();

      if (isExpired) {
        // Token expirado
        return null;
      } else {
        // Token válido
        return { token: token.token, expiresAt: new Date(token.expiresAt) };
      }
    }
  } catch (error) {
    // Erro ao verificar o token
    throw new Error("Erro ao verificar o token", error);
  }
};

const generateToken = async (user, mode, use) => {
  try {
    // Gerar um token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        account: user.account_default,
        hierarchy: user.hierarchy,
        mode: mode,
        use: use,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );
    
    // Calcular o tempo de expiração e salvar no banco de dados
    const expiresAt = new Date(new Date().getTime() + 3 * 60 * 60 * 1000); // 3 horas a partir de agora

    // Salvar o token no banco de dados
    await Token.create({
      userId: user.id,
      token: token,
      mode: mode,
      use: use,
      expiresAt: expiresAt,
    });

    return { token, expiresAt };
  } catch (error) {
    // Erro ao gerar o token
    throw new Error("Erro ao gerar o token", error);
  }
};

export { verifyToken, generateToken };
