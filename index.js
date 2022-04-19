require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const fileUpload = require('express-fileupload');



const app = express();

app.use(express.json());
app.use(cors());
app.use(fileUpload({
    useTempFiles:true,
}));
// Routes
const userRouter = require('./router/userRouter');
const categoryRouter = require('./router/categoryRouter');
const productRouter = require('./router/productRouter');
const uploadRouter = require('./router/upImagesProduct');
const homeRouter = require('./router/homeRouter');
const pageCategoryRouter = require('./router/pageCategoryRouter');
const paymentRouter = require('./router/paymentRouter');

app.use('/',homeRouter);
app.use('/user',userRouter);
app.use('/api',categoryRouter);
app.use('/api',productRouter);
app.use('/api',uploadRouter);
app.use('/api',paymentRouter);

app.use('/page',pageCategoryRouter);



// Connect to MongoDB
const URI = process.env.MONGODB_URL;
const PORT = process.env.PORT || 5000;




mongoose.connect(URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})
    .then(()=>{
        console.log('Connected to DB')
        app.listen(PORT,()=>{console.log(`Server is running PORT: ${PORT}`)});
    })
    .catch(err=>{
        console.log(err)
    })
