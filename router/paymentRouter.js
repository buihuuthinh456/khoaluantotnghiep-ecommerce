const router = require('express').Router();
const paymentCtrl = require('../controllers/paymentCtrl')
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

router.route('/payment')
        .get(auth,authAdmin,paymentCtrl.getOrders)
        .put(auth,authAdmin,paymentCtrl.updateStatusTrans)
router.route('/payment/ipn')
        .post(paymentCtrl.createOrder)
router.route('/payment/cash')
        .post(auth,paymentCtrl.createOrderCash)
router.route('/payment/history')
        .get(auth,paymentCtrl.getHistoryPayment)
router.route('/payment/history/user/:id')
        .get(auth,authAdmin,paymentCtrl.getHistoryByUserId)
router.post('/payment/create-payment',auth,paymentCtrl.createPayment)

router.route('/payment/order')
        .put(auth,authAdmin,paymentCtrl.updateOrder)



module.exports = router