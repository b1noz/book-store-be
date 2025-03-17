const { AbstractMiddleware, UserDecorator } = require('./userDecorator');

class BaseMiddleware extends AbstractMiddleware {
  async handle(req, res, next) {
    next();
  }
}

const baseMiddleware = new BaseMiddleware();
const userDecorator = new UserDecorator(baseMiddleware);

exports.checkCurrentUser = userDecorator.handle.bind(userDecorator);