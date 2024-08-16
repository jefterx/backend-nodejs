import express from "express";
const router = express.Router();

import * as permissionController from "../../../controllers/User/Permission/Permission.js";
import validateToken from "../../../middlewares/ValidateToken.js";

router.post("/:permissionGroupId", validateToken, permissionController.createPermission);

export default router;
