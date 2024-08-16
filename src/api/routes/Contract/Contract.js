import express from "express";
const router = express.Router();

// Importe o controller contractController
import * as contractController from "../../controllers/Contract/Contract.js";
import validateToken from "../../middlewares/ValidateToken.js";

import hierarchySetupRouter from "./HierarchySetup.js";

// Definição das Rotas
router.post("/", validateToken, contractController.createContract);
router.get("/", validateToken, contractController.getContracts);

// Routes Hierarchy Setup
router.use("/hierarchy-setup", hierarchySetupRouter);

router.get("/:id", validateToken, contractController.getContract);
router.put("/:id", validateToken, contractController.updateContract);
router.delete("/:id", validateToken, contractController.deleteContract);
router.post("/undelete/:id", validateToken, contractController.undeleteContract);

export default router;
