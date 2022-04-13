
const router = require('express').Router();
const userCtrl = require('../controllers/userCtrl');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin')

router.post('/register',userCtrl.register);
router.post('/login',userCtrl.login);
router.get('/infor',auth,userCtrl.getUser);
router.get('/',auth,authAdmin,userCtrl.getAllUser);

module.exports = router