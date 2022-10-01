const router = require('express').Router();

const {
  getAllUser, getUserById, createUser, getCurrentUser, getUserProfileUpdate, getAvatarUpdate,
} = require('../controllers/users');

router.get('/', getAllUser);
router.get('/:userId', getUserById);
router.get('/me', getCurrentUser);
router.post('/', createUser);
router.patch('/me', getUserProfileUpdate);
router.patch('/me/avatar', getAvatarUpdate);

module.exports = router;
