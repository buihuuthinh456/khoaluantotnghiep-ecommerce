const router = require('express').Router();
const paymentCtrl = require('../controllers/paymentCtrl')
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

router.route('/payment/ipn')
    .get(auth,paymentCtrl.getOrders)
    .post(paymentCtrl.createOrder)
router.post('/payment/create-payment',paymentCtrl.createPayment)



module.exports = router