const Card = require('../models/card');
const AccessError = require('../errors/AccessError');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestErr = require('../errors/BadRequestErr');
const {
  ok,
  created,
} = require('../constants/statuses');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((card) => res.send(card))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(created).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestErr('Переданы некорректные данные'));
        return;
      }
      next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById({ _id: req.params.cardId })
    .orFail(() => {
      throw new NotFoundError(`Карточка с таким _id ${req.params.cardId} не найдена`);
    })
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        return next(new AccessError('Карточка не может быть удалена'));
      }
      return card.remove()
        .then(() => {
          res.send({ message: 'Карточка удалена' });
        });
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card
    .findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(() => {
      throw new NotFoundError(`Карточка с таким _id ${req.params.cardId} не найдена`);
    })
    .then((card) => {
      res.status(ok).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestErr('Переданы некорректные данные'));
        return;
      }
      next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(() => {
      throw new NotFoundError(`Карточка с таким _id ${req.params.cardId} не найдена`);
    })
    .then((card) => {
      res.status(ok).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestErr('Переданы некорректные данные'));
        return;
      }
      next(err);
    });
};
