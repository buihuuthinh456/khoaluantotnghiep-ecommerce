const router = require('express').Router();
const topicImgCtrl = require('../controllers/topicImgCtrl')

router.route('/topicImg')
    .get(topicImgCtrl.getTopicImg)