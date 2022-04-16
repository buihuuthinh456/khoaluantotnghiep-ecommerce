const Products = require('../models/productModel');

class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }
    filtering(){
        const queryObj = {...this.queryString} //queryString = req.query

        const excludedFields = ['page','sort','limit']
        excludedFields.forEach(el=>delete(queryObj[el]))

        let queryStr = JSON.stringify(queryObj)

        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match)

        //    gte = greater than or equal
        //    lte = lesser than or equal
        //    lt = lesser than
        //    gt = greater than

        this.query.find(JSON.parse(queryStr))

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
        const limit = this.queryString.limit * 1 || 10
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}


const pageCategoryCtrl = {
    getPageCategory: async(req,res)=>{
        try {
            const category = req.params.category
            const {limit,page} = req.query 
            const features = new APIfeatures(Products.find({category:category}),req.query)
            .filtering()
            const featureHavePaginate = new APIfeatures(Products.find({category:category}),req.query)
            .filtering().sorting().paginating()
            // const products = await featureHavePaginate.query
            // const totalProduct = await features.query
            const result = await Promise.all([featureHavePaginate.query,features.query])
            const products = result[0]
            if(products.length < limit){
                const totalPage = Number(page)
                return res.status(200).json({
                    status: 'success',
                    result: products.length,
                    products: products,
                    totalPage
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
                    totalPage
                })
            }
        } catch (error) {
            return res.status(500).json({msg:error.message})
        }
    }
}

module.exports =  pageCategoryCtrl