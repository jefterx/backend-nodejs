import cors from 'cors';
import express from 'express';

import contractRouter from './api/routes/Contract/Contract.js';
import loginRouter from './api/routes/Login.js';
import userRouter from './api/routes/User/User.js';

const app = express();

app.use(cors()); // Use o CORS para permitir que o frontend acesse o backend

// Body parser para analisar o corpo da requisição
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use as rotas da API
app.use(loginRouter)
.use('/users', userRouter)
.use('/contracts', contractRouter);

// Você não tem permissão para acessar esta página!
app.get("/", (req, res) => {
  res.send("Você não tem permissão para acessar esta página!");
});

export default app; // Exporte a aplicação Express
