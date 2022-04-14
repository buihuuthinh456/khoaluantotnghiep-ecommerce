const router = require('express').Router();

const homeCtrl = require('../controllers/homeCtrl');

router.get('/',homeCtrl.getHome)


module.exports = router
