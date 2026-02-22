import express from 'express';
import { Addproject, getAllProjects, getProjectById, updateProject, deleteProject } from '../controller/projectController.js';

const router = express.Router();

router.post('/create', Addproject);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.put('/update/:id', updateProject);
router.delete('/delete/:id', deleteProject);

export default router;
