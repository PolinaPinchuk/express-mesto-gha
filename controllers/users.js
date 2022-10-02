const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/user');
const ConflictErr = require('../errors/ConflictErr');
// const AuthError = require('../errors/AuthError');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestErr = require('../errors/BadRequestErr');
const {
  ok,
  created,
} = require('../constants/statuses');

module.exports.getAllUser = (req, res, next) => {
  Users.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  Users.findById(req.params.userId)
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.status(ok).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestErr('Переданы некорректные данные'));
        return;
      }
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => Users.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(created).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
      email: user.email,
    }))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictErr('Пользователь с таким Email уже существует'));
        return;
      }
      next(err);
    });
};

module.exports.getUserProfileUpdate = (req, res, next) => {
  const { name, about } = req.body;
  Users
    .findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    )
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.status(ok).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestErr('Переданы некорректные данные'));
        return;
      }
      next(err);
    });
};

module.exports.getAvatarUpdate = (req, res, next) => {
  const { avatar } = req.body;
  Users.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.status(ok).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestErr('Переданы некорректные данные'));
        return;
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return Users.findUserByCredentials(email, password)
  //     .then((user) => {
  //       const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
  //       res.send({ token });
  //     })
  //     .catch(() => {
  //       next(new AuthError('Неверный email или пароль'));
  //     });
  // };
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
        })
        .send({
          _id: user._id,
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          email: user.email,
          token,
        })
        .end();
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  Users.findById(req.user._id)
    .then((user) => res.send(user))
    .catch(next);
};
