const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getAllUser, getUserById, createUser, getCurrentUser, getUserProfileUpdate, getAvatarUpdate,
} = require('../controllers/users');

router.get('/', getAllUser);
router.get('/me', getCurrentUser);
router.get(
  '/:userId',
  celebrate({ params: Joi.object().keys({ userId: Joi.string().required().hex().length(24) }) }),
  getUserById,
);
router.post('/', createUser);
router.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      about: Joi.string().min(2).max(30).required(),
    }),
  }),
  getUserProfileUpdate,
);
router.patch(
  '/me/avatar',
  celebrate(
    {
      body: Joi.object().keys({ avatar: Joi.string().required().uri({ scheme: ['http', 'https'] }) }),
    },
  ),
  getAvatarUpdate,
);

module.exports = router;
