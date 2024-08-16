import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import Token from "../models/Token.js";

dotenv.config();

const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // se não houver token, retorna um erro 401

  Token.findOne({ where: { token: token } })
    .then((authToken) => {
      if (!authToken) return res.sendStatus(403); // se o token não for encontrado no banco de dados, retorna um erro 403

      jwt.verify(token, process.env.JWT_SECRET, (err, tokenData) => {
        if (err) return res.sendStatus(403); // se o token for inválido, retorna um erro 403
        // Validar expiração do token
        if (tokenData.exp < Date.now() / 1000) return res.sendStatus(403);

        req.tokenData = tokenData; // se o token for válido, passa o usuário para a requisição
        next(); // passa para o próximo middleware ou rota
      });
    })
    .catch((err) => {
        return res.sendStatus(403);
    });
};

export default validateToken;
