import { Router } from 'express';
import {
  registerUser,
  login,
  displayAll,
  registerCreator,
  verifyAdmin,
  registerSuperAdmin,
  getprofile,
  changePassword,
  logout,
  getCurrentUser,
  checkCreator,
  // updateCreator,
  verifyCreator,
  updateCreator,
  resendVerifyTokenAdmin,
  checkTokenValidity,
  updateProfileCreator,
  registerFinanceUser,
  resendVerificationLinkCreator,
} from '@controllers/authController';

import { validateToken } from '@utils/jwtHelper';

import passport from '../auth/googleAuth';
import { isLoggedIn } from '@middlewares/onlyLogin';

const router = Router();

// router.get('/', isLoggedIn, displayAll);
router.get('/me', getprofile);
router.get('/verifyAdmin', verifyAdmin);
router.get('/checkTokenValidity/:token', checkTokenValidity);
router.get('/currentUser', validateToken, getCurrentUser);
router.get('/checkCreator', validateToken, checkCreator);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: true }), (req, res) => {
  const user = req.user as any;
  if (!user) return res.status(401).json({ message: 'Authentication failed' });

  const session = req.session;
  session.userid = user.id;

  res.redirect(`http://localhost/dashboard`);
});

router.post('/login', login);

router.post('/logout', logout);
router.post('/register', registerUser);
router.post('/resendVerifyToken', resendVerifyTokenAdmin);
router.post('/verifyCreator', verifyCreator);
router.post('/registerCreator', registerCreator);
router.post('/registerSuperAdmin', registerSuperAdmin);
router.post('/registerFinanceUser', registerFinanceUser);
router.post('/resendVerificationLinkCreator', resendVerificationLinkCreator);

router.put('/updateCreator', isLoggedIn, updateCreator);

router.patch('/updateProfileCreator', validateToken, updateProfileCreator);
router.patch('/changePassword', validateToken, changePassword);

export default router;
