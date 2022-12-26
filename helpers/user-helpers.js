const db = require('../config/connection');
const collection = require('../config/collections')
const bcrypt = require('bcrypt');
const { response } = require('express');
const { CART_COLLECTION } = require('../config/collections');
const collections = require('../config/collections');
var objectId = require('mongodb').ObjectId;
require('dotenv').config()
let SERVICE_ID= process.env.SERVICE_ID
let ACCOUNT_SID = process.env.ACCOUNT_SID 
let AUTH_TOKEN = process.env.AUTH_TOKEN
const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN)
const Razorpay=require('razorpay')
let instance = new Razorpay({ key_id: 'rzp_test_6A230dvVXNYFZ2', key_secret: 'fM2B1YTJJ3WpvER01Cg0eSwS' });

module.exports = {
     
    doSignup: (userData) => {
        console.log(userData.mobile);
        return new Promise(async (resolve, reject) => {
            let response = {};
            let phone = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({mobile: userData.mobile });

            if (phone) {
                console.log("same phone no");
                response.status = true;
                resolve(response);
            } else {
                console.log("no same");
                userData.Password = await bcrypt.hash(userData.Password, 10);
                userData.action = true;
                console.log("here56")
                client.verify
                    .services(SERVICE_ID)
                    .verifications.create({
                        to: `+91${userData.mobile}`,
                        //to: '+918921653181',
                        channel: "sms",
                    })
                    .then((verification) => console.log(verification.status))
                    .catch((e) => {
                        console.log("here is the error in otp senting block", e);
                    });
                console.log("no same email");
                resolve({ status: false, userData });
            }
        });
    },

    signupOtp: (userData, userDetails) => {
        console.log(userDetails, "user details is here");
        return new Promise((resolve, reject) => {
            
            userData.otp=userData.otp+""

            let response = {}; 
           
            client.verify
                .services(SERVICE_ID)
                .verificationChecks.create({
                    to: `+91${userDetails.mobile}`,
                    code: userData.otp
                })
                .then((verification_check) => {
                   
                    if (verification_check.status == "approved") {
                        db.get()
                            .collection(collection.USER_COLLECTION)
                            .insertOne(userDetails)
                            .then((data) => {
                                resolve(userDetails);
                            });
                    } else {
                        response.err = "otp is invalid";
                        console.log(response);
                        resolve(response);
                    }
                })
                .catch((e) => {
                    console.log("here is the error", e);
                });
        });
    },


    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            let users = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (users) {
                bcrypt.compare(userData.Password, users.Password).then((status) => {
                    if (status) {
                        console.log("Login success")
                        response.users = users;
                        response.status = true;
                        resolve(response)
                    }
                    else { console.log("Login failed") }
                    resolve({ status: false })
                })

            }
            else {
                console.log("No user ")
                resolve({ status: false })
            }
        })
    },

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        }
        )
    },

    addUsers: (userData, callback) => {

        db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
            callback(data.insertedId)
        })

    },

    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(userId) }).then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },

    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((users) => {
                resolve(users)
            })
        })
    },

    updateUser: (userId, userDetails) => {
        return new Promise(async(resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).
                updateOne({ _id: objectId(userId) }, {
                    $set: {
                        name: userDetails.name,
                        fname:userDetails.fname,
                        email: userDetails.email,
                        mobile: userDetails.mobile,
                        // Password:await bcrypt.hash(userDetails.Password, 10)
                        //rating:productDetails.rating
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },

    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ users: objectId(userId) })
            if (userCart) {
                let proExist = userCart.product.findIndex(product => product.item == proId)
                
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ users: objectId(userId), 'product.item': objectId(proId) },
                        {
                            $inc: { 'product.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                }
                else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ users: objectId(userId) },
                        {
                            $push: {
                                product: proObj
                            }
                        }).then((response) => {
                            resolve()
                        })
                }
            }
            else {
                let cartObj = {
                    users: objectId(userId),
                    product: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve();
                })
            }
        })
    },
 
    removeProduct:(ids,idp)=>{
        return new Promise((resolve,reject)=>{
        
            db.get().collection(collections.CART_COLLECTION).
            deleteOne({_id:objectId(ids)},{$pull: {idp}}).then((response) => {
                 
                resolve(response) 
            })
        })
         
    },    
 

    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { users: objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'productd'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        productd: {
                            $arrayElemAt: ['$productd', 0]
                        }
                    }
                }


            ]).toArray();
            resolve(cartItems);
        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ users: objectId(userId) })
            if (cart) {
                count = cart.product.length
            }
            resolve(count)
        })

    },

    changeProductCount: (details) => 
    {
        details.count=parseInt(details.count);
        details.quantity=parseInt(details.quantity);

        return new Promise((resolve, reject) => {
            if(details.count==-1 && details.quantity==1)
            {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                    {
                        $pull:{product:{item:objectId(details.product)}} 
                    }
                ).then((response) => { 
                    resolve({removeProduct: true })
                })
            }
            else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({_id:objectId(details.cart),'product.item': objectId(details.product) },
                        {
                            $inc:{'product.$.quantity': details.count}  
                        }).then((respose) => { 
                            resolve({status:true})
                        })
            }
        })
    },

    getTotalAmount:(userId)=>{
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { users: objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'productd'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        productd: {
                            $arrayElemAt: ['$productd', 0]
                        }
                    }
                }, 
                {
                    $group:  
                    {
                        _id:null,
                        total:{$sum:{$multiply:
                            [{ $toInt: "$quantity" },{$toInt: '$productd.price'}]
                        }}  
                    }
                }
            ]).toArray()
            if (total.length == 0) {
                
                total.push({ total: 0 });
              
                let nullTotal = total[0].total;
                response.status=false
                response.cartTotal=cartTotal;
              
                resolve(response);
            } else {
                console.log("total is not null");
                let cartTotal = total[0].total;
                response.status=true
                response.cartTotal=cartTotal
              
                resolve(response);

            }
        })       
    },

    getCartProductList:(userId)=>{
        return new Promise(async (resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({users:objectId(userId)})
            resolve(cart.product) 
        })

    },

    placeOrder:(order,product,total)=>{
        
        return new Promise((resolve,reject)=>{
             
            let status=order['payment-method']==='cod'?'placed':'pending';
            let date = new Date();
           
            let orderObj={
                deliveryDetails:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode,
                    
                },
                userId:objectId(order.userId),
                paymentMethod:order['payment-method'],
                product:product,
                totalAmount:total,
                date:date.toLocaleString (),  
                status:status,
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({users:objectId(order.userId)})
                resolve(response.insertedId)
            })
        })
    },

    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
        console.log(userId);
        let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
       
            resolve(orders)
        })
    },

    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {_id: objectId(orderId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'productd'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        productd: {
                            $arrayElemAt: ['$productd', 0]
                        }
                    }
                }

            ]).toArray()
            resolve(orderItems)
        })
    },

    generateRazorpay:(orderId,total)=>
    {
        return new Promise((resolve,reject)=>
        {
            // to multiply amount *100
            var options={
                amount: total,
                currency: "INR",
                receipt: ""+orderId
            };
                instance.orders.create(options,function(err,order){
                    if(err){
                        console.log(err)
                    }
                    else{
                        resolve(order)
                    }
                }
                )
        })
    },
    
    addToWishlist:(proId,userId)=>{
        let proObj = {
            item: objectId(proId),
            
        }
        return new Promise(async (resolve, reject) => {
            // let userWishlist = await db.get().collection(collection.WISHLIST).findOne({ users: objectId(userId) })
            // if (userWishlist) {
            //     let proExist = userWishlist.product.findIndex(product => product.item == proId)
            //     console.log(proExist)
            //     if (proExist) {
            //         db.get().collection(collection.WISHLIST).updateOne({ users: objectId(userId), 'product.item': objectId(proId) }).then(() => 
            //         {
            //                 resolve()
            //         })
            //     }
            //     else {
            //         db.get().collection(collection.WISHLIST).updateOne({ users: objectId(userId) },
            //             {

            //             }).then((response) => {
            //                 resolve()
            //             })
            //     }
            // }
            // else {
                let wishObj = {
                    users: objectId(userId),
                    product: [proObj]
                }
                db.get().collection(collection.WISHLIST).insertOne(wishObj).then((response) => {
                    resolve();
                })
            // }
        })
    },

    deleteCartProduct: (cartId, item) => {
        return new Promise(async (resolve, rejcet) => {
          await db
            .get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { _id: objectId(cartId) },
              { $pull: { product: { item: objectId(item) } } }
            )
            .then((response) => {
              resolve(response);
            });
        });
      },

    getWishlistProducts:(userId)=>{
        return new Promise(async (resolve, reject) => {
            let wishItems = await db.get().collection(collection.WISHLIST).aggregate([
                {
                    $match: { users: objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'productd'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        productd: {
                            $arrayElemAt: ['$productd', 0]
                        }
                    }
                }


            ]).toArray()
            if(wishItems!=""){
                console.log("here")
                resolve(wishItems)  
            }  
            else{}
        })

    },

    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders)
        }
        )
    },

    updateStatus: (changeStatus, orderId) => {
        return new Promise(async (resolve, reject) => {
            if (changeStatus == 'cancelled') {
                await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {

                    $set: {
                        status: changeStatus,
                        cancelStatus: true


                    }
                })

            }
            else {
                await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {

                    $set: {
                        status: changeStatus
                    }
                })
            }
        }).then((response) => {
            resolve(response)
        })
        
    },


    checkCoupon: (coupon, total, userId) => {
       
        return new Promise(async (resolve, reject) => {
            let responses = {};
            await db.get()
                .collection(collection.COUPON_COLLECTION)
                .findOne({ couponname: coupon.coupon })
                .then(async (response) => {
                   
                    if (response) {
                        if (response.users.includes(userId)) {
                            responses.status = false;
                            resolve(responses);
                           
                        } else {
                            
                            let discountAmount = (total * response.discount) / 100;
                            await db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                            {$set:{coupon: coupon.coupon,coupOffer:discountAmount}}
                            ).then(()=>{
                                
                                let discountAmount = (total * response.discount) / 100;
                                responses.totalAmount = total - discountAmount;
                                response.Actual = total;
                                responses.status = true;
                                resolve(responses);
                                
                            })
                            
                        }
                    } else {
                        responses.status = false;
                        resolve(responses);
                    }
                });
        });
    },

    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require("crypto");
            let hmac = crypto.createHmac("sha256", "fM2B1YTJJ3WpvER01Cg0eSwS");

            hmac.update(
                details["payment[razorpay_order_id]"] +
                "|" +
                details["payment[razorpay_payment_id]"]
            );
            hmac = hmac.digest("hex");
            if (hmac == details["payment[razorpay_signature]"]) {
                console.log("kkkkk");
                resolve();
            } else {
                reject();
            }
        });
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne(
                    { _id: objectId(orderId) },
                    {
                        $set: {
                            status: "placed",
                        },
                    }
                )
                .then(() => {
                    resolve();
                });
        });
    },
    

    blockUser: (usrId, usrDetail) => {

        return new Promise((resolve, reject) => {


            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(usrId, usrDetail) },

                {
                    $set: {

                        status: false
                    }
                })

            resolve()

        })

    },

    unblocklUser: (usrId, usrDetail) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(usrId, usrDetail) },
                {
                    $set: {
                        status: true
                    }
                }
            )

            resolve()
        })

    },
    
    updatePassword: (password, uid) => {
        return new Promise(async (resolve, reject) => {
            await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ _id: objectId(uid) })
                .then((response) => {
                   
                    bcrypt
                        .compare(password.currentpassword, response.Password)
                        .then(async (status) => {
                            
                            if (status) {
                               
                                password.newpassword = await bcrypt.hash(
                                    password.newpassword,
                                    10
                                );
                               
                                await db
                                    .get()
                                    .collection(collection.USER_COLLECTION)
                                    .updateOne(
                                        { _id: objectId(uid) },
                                        {
                                            $set: {
                                                Password: password.newpassword,
                                            },
                                        }
                                    );
                                resolve(status);
                            } else {
                                console.log("going back to route");
                                resolve(status);
                            }
                        });
                });
        });
    },

    userAddress:(data)=>{
        return new Promise(async (resolve, reject) => 
        {
            db.get()
                .collection(collection.ADDRESS_COLLECTION)
                .insertOne(data)
                .then((response) => {
                    resolve();
                    console.log(response);
                });
        });
    },

    userEditAddress:(data,userId)=>{
        // let userObj = 
        // {
        //     user: objectId(userId),
        //     address:data.address,
        //     city:data.city,
        //     state:data.state,
        //     pincode:data.pincode,
        //     mobile:data.mobile
        // }

        return new Promise(async (resolve, reject) => 
        {
            db.get()
                .collection(collection.ADDRESS_COLLECTION)
                .findOneAndUpdate({userId:(userId)},{
                    $set:{
                        address:data.address,
                        city:data.city,
                        state:data.state,
                        pincode:data.pincode,
                        mobile:data.mobile
                    }  
                } )
                
                .then((response) => {
                    console.log("edit address reached")
                    resolve();
                   
                });
        });

    },

    getAddress:(userId)=>{
        return new Promise(async (resolve, reject) => {
             await db
                .get()
                .collection(collection.ADDRESS_COLLECTION).findOne({userId:(userId) }).then((savedAddress) => {
                    resolve(savedAddress)
                })
               
        });
    }
}