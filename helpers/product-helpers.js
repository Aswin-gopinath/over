const db=require('../config/connection');
const collection=require('../config/collections');
const { response } = require('express');
var objectId=require('mongodb').ObjectId;

module.exports={

    addProduct:(product)=>{
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
                resolve()
            })
        })   
    },

    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products) 
        });
    },
    getMobiles:()=>{
        return new Promise(async(resolve,reject)=>{
            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({category:"Mobile"}).toArray()
            resolve(products) 
        });
    },
    getWatches:()=>{
        return new Promise(async(resolve,reject)=>{
            console.log("reached wactehs helpers")
            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({category:"Watch"}).toArray()
            resolve(products) 
        });
    },
    getEarphones:()=>{
        return new Promise(async(resolve,reject)=>{
            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({category:"Earphones"}).toArray()
            resolve(products) 
        });
    },

    deleteProduct:(proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },

    updateProduct:(proId,productDetails)=>{
        return new Promise(async(resolve,reject)=>{
            let image=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
            console.log(productDetails)
            if(productDetails.image.length==0){
                productDetails.image=image.image
            }

            db.get().collection(collection.PRODUCT_COLLECTION).findOneAndUpdate({_id:objectId(proId)},{
                $set:{
                        name:productDetails.name,
                        description:productDetails.description,
                        price:productDetails.price,
                        rating:productDetails.rating,
                        img:productDetails.img,
                        stock:productDetails.stock
                }  
            } ).then((response)=>{
                resolve(response)
        })
        }) 
    },

    productView:(proId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
        
        },
        getCoupons: ()=>{
            return new Promise((resolve, reject)=>{
                db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((response)=>{
                    resolve(response)
                })
            })
        },
        addCoupon:(coupon) =>{
            return new Promise(async (resolve, reject) => {
                coupon.discount = parseInt(coupon.discount)
                db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((response) => {
                    resolve(response)
                })
            })
        },

        codTotal: () => {
            return new Promise(async (resolve, reject) => {
                var codtotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
 
                    {
                        $match:{ paymentMethod: "cod" }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: {$toInt:'$totalAmount'} },
                        }
                    },	
                ]).toArray()
                
                resolve(codtotal[0])
            })
        },

        rasorpayTotal: () => {
            return new Promise(async (resolve, reject) => {
                var rasorpayTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { paymentMethod: "online" }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: {$toInt:'$totalAmount'} },
                        }
                    },
                ]).toArray()
                
                resolve(rasorpayTotal[0])
            })
        },

        deleteWishlistProduct:(wishId,item)=>{
            console.log("entered prodct helpers")
            return new Promise(async(resolve,reject)=>{
                await db.get().collection(collection.WISHLIST).
                updateOne({_id:objectId(wishId)},{$pull :{product:{item:objectId(item)}}}).then((response)=>{
                    resolve(response)
                })
            })
        },

}