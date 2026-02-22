import express from "express";
import { Addclients, getAllClient, updatedClient, deleteClient } from '../controller/clientController.js'
import authMiddleware from "../middleware/auth.js";

const router = express.Router();


router.post('/', authMiddleware(["admin"]), Addclients);

router.get('/', authMiddleware(["admin"]), getAllClient);

router.put('/update/:id', authMiddleware(["admin"]), updatedClient);

router.delete('/delete/:id', authMiddleware(['admin']), deleteClient);

export default router;

