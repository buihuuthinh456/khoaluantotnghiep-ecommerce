
const router = require('express').Router();
const userCtrl = require('../controllers/userCtrl');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin')

router.post('/register',userCtrl.register);
router.post('/login',userCtrl.login);
router.route('/password')
        .put(auth,userCtrl.changePassword)
        .post(userCtrl.requestResetPassword)
router.route('/resetPassword')
        .post(userCtrl.confirmResetPassword)


router.route('/cart')
        .post(auth,userCtrl.newCart)
        .put(auth,userCtrl.addProductIntoCart)
        .delete(auth,userCtrl.deleteProductInCart)
router.get('/infor',auth,userCtrl.getUser);
router.get('/',auth,authAdmin,userCtrl.getAllUser);

module.exports = router