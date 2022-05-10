const router = require('express').Router();
const topicImgCtrl = require('../controllers/topicImgCtrl')
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

router.route('/topic-img')
    .get(topicImgCtrl.getTopicImgs)
    .post(auth,authAdmin,topicImgCtrl.postTopicImg)
    .delete(auth,authAdmin,topicImgCtrl.deleteTopicImg)

module.exports = router