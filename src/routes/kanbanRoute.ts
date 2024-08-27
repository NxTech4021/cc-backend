import {
  createColumn,
  createTask,
  deleteColumn,
  editColumn,
  getKanbanBoard,
  moveColumn,
} from '@controllers/kanbanController';
import { isLoggedIn } from '@middlewares/onlyLogin';
import { Router } from 'express';

const router = Router();

router.get('/', isLoggedIn, getKanbanBoard);

router.post('/createColumn', isLoggedIn, createColumn);
router.post('/createTask', isLoggedIn, createTask);

router.patch('/moveColumn', isLoggedIn, moveColumn);
router.patch('/updateColumn', isLoggedIn, editColumn);

router.delete('/deleteColumn', isLoggedIn, deleteColumn);

export default router;
