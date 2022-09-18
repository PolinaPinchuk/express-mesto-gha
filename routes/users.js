const router = require('express').Router();

const {
  getAllUser, getUserById, createUser, getUserProfileUpdate, getAvatarUpdate,
} = require('../controllers/users');

router.get('/', getAllUser);
router.get('/:userId', getUserById);
router.post('/', createUser);
router.patch('/me', getUserProfileUpdate);
router.patch('/me/avatar', getAvatarUpdate);

module.exports = router;
