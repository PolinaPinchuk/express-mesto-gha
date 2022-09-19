const Users = require('../models/user');

const ERROR_CODE = 400;
const NOT_FOUND_ERROR = 404;
const DEFAULT_ERROR = 500;

module.exports.getAllUser = (req, res) => {
  Users.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(DEFAULT_ERROR).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.getUserById = (req, res) => {
  Users.findById(req.params.userId)
    .orFail(() => {
      const error = new Error(`Пользователь с таким _id ${req.params.userId} не найден`);
      error.statusCode = NOT_FOUND_ERROR;
      throw error;
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE).send({ message: 'Некорректные данные' });
      } else if (err.statusCode === NOT_FOUND_ERROR) {
        res.status(NOT_FOUND_ERROR).send({ message: err.message });
      } else {
        res.status(DEFAULT_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  Users.create({ name, about, avatar })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE).send({ message: 'Некорректные данные' });
      } else {
        res.status(DEFAULT_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.getUserProfileUpdate = (req, res) => {
  const { name, about } = req.body;
  Users
    .findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    )
    .orFail(() => {
      const error = new Error(`Пользователь с таким _id ${req.user._id} не найден`);
      error.statusCode = NOT_FOUND_ERROR;
      throw error;
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError' || 'ValidationError') {
        res.status(ERROR_CODE).send({ message: 'Некорректные данные' });
      } else if (err.statusCode === NOT_FOUND_ERROR) {
        res.status(NOT_FOUND_ERROR).send({ message: err.message });
      } else {
        res.status(DEFAULT_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.getAvatarUpdate = (req, res) => {
  const { avatar } = req.body;
  Users.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      const error = new Error(`Пользователь с таким _id ${req.user._id} не найден`);
      error.statusCode = NOT_FOUND_ERROR;
      throw error;
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError' || 'ValidationError') {
        res.status(ERROR_CODE).send({ message: 'Некорректные данные' });
      } else if (err.statusCode === NOT_FOUND_ERROR) {
        res.status(NOT_FOUND_ERROR).send({ message: err.message });
      } else {
        res.status(DEFAULT_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};
