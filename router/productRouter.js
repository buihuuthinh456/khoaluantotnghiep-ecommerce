const router = require('express').Router();
const productCtrl = require('../controllers/productCtrl');

const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');

router.route("/product")
    .get(productCtrl.getProducts)
    .post(auth,authAdmin,productCtrl.createProduct)
router.get("/product/byid",productCtrl.getProductById)

router.route("/product/:id")
    .delete(auth,authAdmin,productCtrl.deleteProduct)
    .put(auth,authAdmin,productCtrl.updateProduct)
    .get(productCtrl.getProduct)
    .post(productCtrl.increaseViews)

router.route("/product/:id/comment")
    .get(productCtrl.getComments)
    .post(auth,productCtrl.createComment)
router.route("/product/:id/comment/:idComment")
    .put(auth,productCtrl.updateComment)
    .delete(auth,productCtrl.deleteComment)

module.exports = router