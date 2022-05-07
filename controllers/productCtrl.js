const Products = require('../models/productModel');
const Comments = require('../models/commentModel');
const Users = require('../models/userModel');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
})



class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
        this.queryArray = []
    }
    filtering(){
        const queryObj = {...this.queryString} //queryString = req.query
        console.log(queryObj['name'])
        let queryArray = []
        for(let item of Object.keys(queryObj)){
            let String= '';
            switch (item) {
                case 'page' || 'limit':
                    String = item + '=' + queryObj[item]
                    queryArray.push(String)
                    break;
                case 'name':
                    for(let keyOfItem of Object.keys(queryObj[item])){
                        String = `${item}[${keyOfItem}]=${queryObj[item][keyOfItem]}`
                        queryArray.push(String)
                    }
                    break;
                default:
                    break;
            }
        }
        this.queryArray = queryArray
        const excludedFields = ['page','sort','limit']
        excludedFields.forEach(el=>delete(queryObj[el]))

        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match =>{return '$' + match}) 

        //    gte = greater than or equal
        //    lte = lesser than or equal
        //    lt = lesser than
        //    gt = greater than

        let queryObject = JSON.parse(queryStr)
        for(let key in queryObject){
            if(key === 'name'){
                for(let keyItem in queryObject[key]){
                    let regex = new RegExp(queryObject[key][keyItem],"i")
                    queryObject[key][keyItem] = regex
                    // console.log('regex',queryObject[key][keyItem])
                }
            }
        }
        // console.log(queryObject)
        
        

        this.query.find(queryObject)
        console.log(this.query.find(queryObject))
        // this.queryString = queryObj.
        return this
    }
    sorting(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        }else{
            this.query = this.query.sort('-createdAt')
        }

        return this;

    }
    paginating(){
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 12
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit)
        return this;

    }
}


const productCtrl = {
    getProducts: async(req,res)=>{
        try {
            // return res.status(200).json(products)
            const {limit,page} = req.query 
            const features = new APIfeatures(Products.find(),req.query)
            .filtering()
            const featureHavePaginate = new APIfeatures(Products.find(),req.query)
            .filtering().sorting().paginating()
            // const products = await featureHavePaginate.query
            // const totalProduct = await features.query
            const result = await Promise.all([featureHavePaginate.query,features.query])
            console.log("Query String",features.queryArray)
            let url_query='';
            features.queryArray.forEach((item)=>{
                if(url_query.length!==0){
                    url_query = url_query + '&' + item
                }else{
                    url_query = url_query + item
                }
            })
            console.log(url_query)
            const products = result[0]
            if(products.length < limit){
                const totalPage = Number(page)
                return res.status(200).json({
                    status: 'success',
                    result: products.length,
                    products: products,
                    totalPage,
                    url_query
                })
            }
            else{
                const totalProduct = result[1]
                const totalPageFloat = totalProduct.length/products.length
                let totalPage = Math.floor(totalPageFloat)
                let float = totalPageFloat - totalPage
                if(float>0){
                    totalPage = totalPage + 1;
                } 
                return res.status(200).json({
                    status: 'success',
                    result: products.length,
                    products: products,
                    totalPage,
                    url_query
                })
            }
            
           
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    getProduct: async(req,res)=>{
        try {
            const productId = req.params.id;
            const product = await Products.findById(productId)

            if(!product) return res.status(400).json({msg:"Product doesn't exist"})
            res.status(200).json(product)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    getProductById: async(req,res)=>{
        try {
            const productId = req.body.id;
            const product = await Products.findById(productId)
            if(!product) return res.status(400).json({msg:"Product doesn't exist"})
            res.status(200).json(product)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    createProduct:async(req,res)=>{
        try {
            const {productId,name,images,category,price,description,quantity} = req.body
            
            const product = await Products.findOne({productId})

            if(product) return res.status(400).json({msg:"Product already exists"})

            if(!images) return res.status(400).json({msg:"No images upload"})

            const newProduct = new Products({
                productId,name,images:images,category,price,description,quantity
            })

            await newProduct.save()

            return res.status(200).json({msg:"Create successfully a product"})



        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    deleteProduct:async(req,res)=>{
       try {
            const productId = req.params.id;
            const product = await Products.findOne({_id:productId})
            const urlImages = product.images[0].public_id
            
            cloudinary.uploader.destroy(urlImages,async(err,result)=>{
                if(err) throw err
                
                console.log(result)
            })

            await Products.deleteOne({_id:productId})

            return res.status(200).json({msg:"Delete successfully this product"})
       } catch (err) {
           return res.status(500).json({msg:err.message})
       }
    },
    updateProduct:async(req,res)=>{
        try {
            const productId = req.params.id;
            const {name,description,price,quantity,category,images} = req.body;
            if(!images) return res.status(400).json({msg:"No images upload"})

            await Products.findOneAndUpdate({_id:productId},{
                name,description,images:images,price,quantity,category
            })

            return res.status(200).json({msg:"Product update successfully"})


        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    getComments:async(req,res)=>{
        try {
            const productId = req.params.id;
            const comments = await Comments.find({productId:productId})

            return res.status(200).json(comments)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    createComment:async(req,res)=>{
        try {
            const productId = req.params.id;
            const {content} = req.body;
            const {id:userId} = req.user;

            const user = await Users.findById(userId).select("-password");
            const username = user.name
            const newComment = new Comments({
                productId,userId,content,username
            })
            const newComments = await newComment.save()
            return res.status(200).json(newComments)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    updateComment:async(req,res)=>{
        try {
            const productId = req.params.id;
            const commentId = req.params.idComment;
            const {userId,content}=req.body;
            if(content.length===0) return res.status(400).json({msg:"Comment is empty?"})
               
            await Comments.findByIdAndUpdate({_id:commentId,userId:userId},{
                productId,userId,content
            })

            return res.status(400).json({msg:"Comment is updated"});
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    deleteComment:async(req,res)=>{
        try {
            const commentId = req.params.idComment;
            const {userId}=req.body;
        
            await Comments.findByIdAndDelete({_id:commentId,userId:userId})
            return res.status(200).json({msg:"Comment is deleted"})
 
            
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },

    increaseViews:async(req,res)=>{
        try {
            const productId = req.params.id;
            const product = await Products.findById(productId)
            const {views,...info} = product._doc;

           
            const updateProduct = new Products({
                ...info, views: views + 1
            })
            // await updateProduct.save()
            const newProduct = await Products.findByIdAndUpdate({_id:productId},updateProduct,{new:true});
            return res.status(200).json(newProduct)
        } catch (err) {
            return res.status(500).json({msg:err.message})
        }
    },
    updateVotes: async(req,res)=>{
        try {
            const productId = req.params.id;
            const {id:userId} = req.user;
            const score = req.body.score;
            const user = await Users.findById(userId).select("-password");
            const {name:username} = user;
            const productRaw = await Products.findById(productId)
            if(!productRaw.votes){
                var {votes:votesInfo,...info} = await Products.findByIdAndUpdate(productId,{
                    votes:[]
                },{new:true})
            }
            else{
                var {votes:votesInfo,...info} = productRaw;
            }
            // console.log(productRaw)
            // console.log(votesInfo)
            const userVoted = votesInfo.findIndex((item)=>item.userId === userId)
            if(userVoted!==-1){
                votesInfo[userVoted] = {username,userId,score}
                const votesNew = [...votesInfo]
                const newProduct = await Products.findByIdAndUpdate(productId,{
                    votes:votesNew
                },{new:true})
                return res.status(200).json({msg:"Bạn đã re-vote thành công ! Cảm ơn bạn đã tham gia đánh giá"})
            }else{
                const votesNew = [...votesInfo,{username,userId,score}]
                const newProduct = await Products.findByIdAndUpdate(productId,{
                    votes:votesNew
                },{new:true})
                return res.status(200).json({msg:"Bạn đã vote thành công ! Cảm ơn bạn đã tham gia đánh giá"})
            }
        } catch (error) {
            res.status(500).json({msg:error.message})
        }
    },
}
module.exports = productCtrl;