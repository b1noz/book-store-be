const express = require('express');

const Router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { banking } = require('../controllers/bankController');


Router.post('/banking',verifyToken,banking)

module.exports = Router;