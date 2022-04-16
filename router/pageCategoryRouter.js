const router = require('express').Router();
const pageCategoryCtrl = require('../controllers/pageCategoryCtrl');


router.route('/:category')
    .get(pageCategoryCtrl.getPageCategory)



module.exports = router