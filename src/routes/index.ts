import express from 'express';
import userRoute from './userRouter';
import authRoute from './authRoute';
import adminRoute from './adminRoute';
import creatorRoute from './creatorRoute';
import companyRoute from './companyRoute';
import eventRoute from './eventRoute';
import campaignRoute from './campaignRoute';
import notificationRoute from './notificationRoute';
import draftRoute from './draftRoute';
import taskRoute from './taskRoute';
import submissionRoute from './submissionRoute';
import roleRoute from './roleRoute';
import invoiceRoute from './invoiceRoute';
import threadRoute from './threadRoute';
import kanbanRoute from './kanbanRoute';
import bugRoute from './bugRoute';
import accessRoute from './accessRoute';
import packagesRoute from './packageRoutes';
import socialRoute from './socialRoute';

export const router = express.Router();

router.use('/user', userRoute);
router.use('/auth', authRoute);
router.use('/admin', adminRoute);
router.use('/creator', creatorRoute);
router.use('/company', companyRoute);
router.use('/event', eventRoute);
router.use('/campaign', campaignRoute);
router.use('/notification', notificationRoute);
router.use('/draft', draftRoute);
router.use('/thread', threadRoute);
router.use('/tasks', taskRoute);
router.use('/submission', submissionRoute);
router.use('/role', roleRoute);
router.use('/invoice', invoiceRoute);
router.use('/kanban', kanbanRoute);
router.use('/bug', bugRoute);
router.use('/public', accessRoute);
router.use('/packages', packagesRoute);
router.use('/social', socialRoute);
