const Card = require('../models/card');
const { AccessError } = require('../errors/AccessError');
const { NotFoundError } = require('../errors/NotFoundError');

const ERROR_CODE = 400;
const NOT_FOUND_ERROR = 404;
const DEFAULT_ERROR = 500;

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(() => res.status(DEFAULT_ERROR).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE).send({ message: 'Некорректные данные' });
      } else {
        res.status(DEFAULT_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

// module.exports.deleteCard = (req, res, next) => {
//   Card.deleteOne({ _id: req.params.cardId })
//     .orFail(() => {
//       const error = new Error(`Карточка с таким _id ${req.params.cardId} не найдена`);
//       error.statusCode = NOT_FOUND_ERROR;
//       throw error;
//     })
//     .then((card) => {
//       if (!card.owner.equals(req.user._id)) {
//         return next(new AccessError('Карточка не может быть удалена'));
//       }
//       return card.remove()
//         .then(() => {
//           res.send({ message: 'Карточка удалена' });
//         });
//     })
//     // .then((card) => res.send(card))
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         res.status(ERROR_CODE).send({ message: 'Некорректные данные' });
//       } else if (err.statusCode === NOT_FOUND_ERROR) {
//         res.status(NOT_FOUND_ERROR).send({ message: err.message });
//       } else {
//         res.status(DEFAULT_ERROR).send({ message: 'На сервере произошла ошибка' });
//       }
//     });
// };

module.exports.deleteCard = (req, res, next) => {
  Card.deleteOne({ _id: req.params.cardId })
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

module.exports.likeCard = (req, res) => {
  Card
    .findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(() => {
      const error = new Error(`Карточка с таким _id ${req.params.cardId} не найдена`);
      error.statusCode = NOT_FOUND_ERROR;
      throw error;
    })
    .then((card) => res.send(card))
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

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(() => {
      const error = new Error(`Карточка с таким _id ${req.params.cardId} не найдена`);
      error.statusCode = NOT_FOUND_ERROR;
      throw error;
    })
    .then((card) => res.send(card))
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
