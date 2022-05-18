const router = require('express').Router();

const homeCtrl = require('../controllers/homeCtrl');


router.get('/',homeCtrl.getHome)

router.post('/',homeCtrl.postDataAccess)

router.get('/analysis',homeCtrl.getDataAccess)


module.exports = router
