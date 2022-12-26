const { response } = require('express');
var express = require('express');
const { USER_COLLECTION } = require('../config/collections');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers');



const verifyLogin = (req, res, next) => {
  if (req.session.users) {
    next()
  }
  else {
    res.redirect('/login')
  }
}

// USER HOME PAGE -----------------------------------------------------------------
router.get('/', async function (req, res, next) {
  try {
    let cartCount = null;
    if (req.session.users) {
      cartCount = await userHelpers.getCartCount(req.session.users._id)
    }

    productHelpers.getAllProducts().then((products) => {

      res.render('user/view-products', { products, users: req.session.users, cartCount });
    })
  }
  catch (err) {
    res.render('user/404')
  }
});

//RETREIVING USER LOGIN -----------------------------------------------------------------

router.post('/login', (req, res) => { 
  try {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.userloggedIn = true;
        req.session.users = response.users;
        res.redirect('/')
      }
      else {
        req.session.loginErr = true;
        res.redirect('/login')
      }
    })
  }
  catch (err) {
    res.render('user/404')
  }
})


//USER LOGIN ----------------------------------------------------------------

router.get('/login', function (req, res, next) {
  try {
    if (req.session.userloggedIn) {
      res.redirect('/')
    }
    res.render('user/login', { "loginErr": req.session.loginErr })
    req.session.loginErr = false;
  }
  catch (err) {
    res.render('user/404')
  }
});


// USER SIGNUP --------------------------------------------------------------------

router.get('/signup', function (req, res, next) {
  try {
    if (req.session.userloggedIn) {

      res.redirect('/')
    }
    res.render('user/Signup', { emailErr: req.session.emailErr });
  }
  catch (err) {
    res.render('user/404')
  }
});


//RETRIEVING SIGNUP ---------------------------------------------------------------
let users;
router.post('/signup', (req, res) => {
  try {
    userHelpers.doSignup(req.body).then((response) => {
      if (response.userExist) {
        req.session.emailExist = true;
        req.session.emailErr = true
        res.redirect('/signup');
      }
      else {
        users = response.userData;
        res.render('user/otp-verify')
      }
    })
  }
  catch (err) {
    res.render('user/404')
  }
});



router.post("/otp-verify", async (req, res) => {
  try {
    userHelpers.signupOtp(req.body, users).then((response) => {
      req.session.loggedIn = true;
      req.session.users = response;
      if (response.err) {
        res.redirect("/signup")
      }
      else {
        res.redirect("/");
      }
    });
  }
  catch (err) {
    res.render("user/404");
  }
});


//USER LOGOUT ----------------------------------------------------------------

router.get('/logout', (req, res) => {
  try {
    req.session.userloggedIn = ""
    req.session.users = ""
    res.redirect('/')
  }
  catch (err) {
    res.render('user/404')
  }
});


router.get('/cart', verifyLogin, async (req, res) => {
  try {
    let products = await userHelpers.getCartProducts(req.session.users._id)
    let total = 0;
    let users = req.session.users._id;
    if (products.length != 0) {
      let total = await userHelpers.getTotalAmount(req.session.users._id)
      total = total.cartTotal
      cartCount = await userHelpers.getCartCount(req.session.users._id);
      res.render('user/cart', { products, total, users, cartCount });
    }
    else {
      res.render('user/cartempty', { users })
    }
  }
  catch (error) {
    res.render('user/404')
  }
})


router.get('/cat-mobile', async (req, res) => {
  try {
    let cartCount = null;
    if (req.session.users) {
      cartCount = await userHelpers.getCartCount(req.session.users._id)
    }
    productHelpers.getMobiles().then((products) => {
      res.render('user/cat-mob', { products, users: req.session.users, cartCount });
    })
  }
  catch (err) {
    res.render('user/404')
  }
})


router.get('/cat-watches', async (req, res) => {
  try {
    let cartCount = null;
    if (req.session.users) {
      cartCount = await userHelpers.getCartCount(req.session.users._id)
    }
    productHelpers.getWatches().then((products) => {
      console.log("reaches watches cat")
      res.render('user/cat-wat', { products, users: req.session.users, cartCount });
    })
  }
  catch (err) {
    res.render('user/404')
  }
})


router.get('/cat-earphones', async (req, res) => {
  try {
    let cartCount = null;
    if (req.session.users) {
      cartCount = await userHelpers.getCartCount(req.session.users._id)
    }
    productHelpers.getEarphones().then((products) => {
      res.render('user/cat-ear', { products, users: req.session.users, cartCount });
    })
  }
  catch (err) {
    res.render('user/404')
  }
})
//Add to cart------------------------------------------------------------------

router.get('/add-to-cart/:id', verifyLogin, (req, res) => {
  try {
    userHelpers.addToCart(req.params.id, req.session.users._id).then(() => {
      res.json({ status: true })
    })
  }
  catch (error) {
    res.render('user/404')
  }
})


// router.get('/removeProduct', verifyLogin, async (req, res) => {
//   let ids = req.query.ids;
//   let idp = req.query.idp;
//   //let idp=req.query.idp;

//   await userHelpers.removeProduct(ids, idp).then((response) => {
//     res.redirect('/cart');
//   })
// })


router.post('/change-product-quantity', (req, res, next) => {
  try {
    userHelpers.changeProductCount(req.body).then(async (response) => {
      response.total = await userHelpers.getTotalAmount(req.body.users)
      res.json(response)

    })
  }
  catch (error) {
    res.render('user/404')
  }
})


router.post("/remove-item", verifyLogin, async (req, res) => {
  try {
    let cartId = req.body.cartId;
    let item = req.body.proId;
    await userHelpers.deleteCartProduct(cartId, item).then((response) => {
      res.json({ response });
    });
  }
  catch (error) {
    res.render('user/404')
  }
});

//router.get('/remove-product/:id',(req,res)=>{
//console.log("api call");
//userHelpers.removeProduct(req.params.id,req.session.users._id).then(()=>{
//res.redirect('/')
//  res.json({status:true})  
//})
//})


router.get('/product-view/:id', verifyLogin, async (req, res) => {
  try {
    let product = await productHelpers.productView(req.params.id);
    res.render("user/single-product", { product, users: req.session.users });
  }
  catch (error) {
    res.render('user/404')
  }
})


router.get('/place-order', verifyLogin, async (req, res) => {
  try {
    let total = await userHelpers.getTotalAmount(req.session.users._id)
    let products = await userHelpers.getCartProducts(req.session.users._id)
    if (total.status) {
      if (req.session.Total) {
        total = Math.round(req.session.Total);
      }
      total = total.cartTotal
      res.render("user/place-order", { users: req.session.users, total, products })
    }
    else {
      if (req.session.Total) {
        total = Math.round(req.session.Total);
      }

      total = total.nullTotal
      res.render("user/place-order", { users: req.session.users, total, products })
    }
  }
  catch (error) {
    res.render('user/404')
  }
})



router.post('/place-order', async (req, res) => {
  try {
    let product = await userHelpers.getCartProductList(req.body.userId)
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
    if (totalPrice.status) {
    }
    if (req.session.Total) {
      totalPrice = Math.round(req.session.Total);
    }
    else {
      totalPrice = Math.round(totalPrice.cartTotal);
    }
    userHelpers.placeOrder(req.body, product, totalPrice).then((orderId) => {
      if (req.body['payment-method'] == 'cod') {
        if (req.session.Total) {
          req.session.Total = null
        }
        res.json({ codSuccess: true });
      }
      else {
        console.log("place order post razoryPay")
        userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
          // response.razorpay = true;
          response.razorpay = true;
          res.json(response)
        })
      }
    })
  }
  catch (error) {
    res.render('user/404')
  }
})


router.get('/order-success', verifyLogin, (req, res) => {
  try {
    res.render('user/order-success', { users: req.session.users })
  }
  catch (error) {
    res.render('user/404')
  }

})


router.get('/orders', verifyLogin, async (req, res) => {
  try {
    let orders = await userHelpers.getUserOrders(req.session.users._id)
    cartCount = await userHelpers.getCartCount(req.session.users._id)
    res.render('user/orders', { users: req.session.users, orders, cartCount })
  }
  catch (error) {
    res.render('user/404')
  }
})


router.get('/view-order-products/:id', verifyLogin, async (req, res) => {
  try {
    let product = await userHelpers.getOrderProducts(req.params.id)
    res.render('user/view-order-products', { users: req.session.users, product })
  }
  catch (error) {
    res.render('user/404')
  }
})


router.post('/verify-payment', (req, res) => {
  try {
    console.log("verify payment post reached 1")
    userHelpers
      .verifyPayment(req.body)
      .then(() => {
        userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
          console.log("verify payment post reached 2")
          res.json({ status: true });
        });
      })
      .catch((err) => {
        res.json({ status: false, errMsg: "" });
      });
  }
  catch (err) {
    res.render("user/404");
  }
})


router.get('/wishlist', verifyLogin, async (req, res) => {
  try {
    let products = await userHelpers.getWishlistProducts(req.session.users._id)
    cartCount = await userHelpers.getCartCount(req.session.users._id)
    let users = req.session.users._id;
    res.render("user/wishlist", { products, users, cartCount })
  }
  catch (error) {
    res.render('user/404')
  }
})


router.get('/add-to-wishlist/:id', verifyLogin, (req, res) => {
  try {
    userHelpers.addToWishlist(req.params.id, req.session.users._id).then(() => {
      res.redirect('/')
      // res.json({ status: true})
    })
  }
  catch (error) {
    res.render('user/404')
  }
})

router.get('/profile', verifyLogin, async (req, res) => {
  try {
    userId = req.session.users._id;
    let users = await userHelpers.getUserDetails(userId)
    let savedAddress = await userHelpers.getAddress(userId)
    console.log(savedAddress)
    res.render('user/profile', { users, savedAddress })
  }
  catch (error) {
    res.render('user/404')
  }
})


router.get('/edit-profile', verifyLogin, async (req, res) => {
  let users = await userHelpers.getUserDetails(req.session.users._id)
  res.render('user/edit-profile', { users })
})


router.post('/edit-profile', (req, res) => {
  console.log(req.body)
  userHelpers.updateUser(req.session.users._id, req.body).then(() => {
    res.redirect('/profile')
  })
})


router.get('/edit-u-password', verifyLogin, (req, res) => {
  users = req.session.users._id
  res.render('user/edit-pass', { users })
})

let passwordchange = true;
router.post("/updatePassword", verifyLogin, async (req, res) => {
  console.log('edit pass 0')
  try {
    await userHelpers
      .updatePassword(req.body, req.session.users._id)
      .then((passwordchange1) => {
        console.log("edit pass1")
        if (passwordchange1) {
          console.log("edit pass 2")
          res.redirect("/edit-profile");
        } else {

          console.log("edit pass 3")
          passwordchange = passwordchange1;
          res.redirect("/edit-profile");
        }
      });
  }
  catch (err) {
    res.render("user/404");
  }
});


router.get('/edit-u-address', verifyLogin, (req, res) => {
  users = req.session.users._id
  res.render('user/edit-address', { users })
})


router.post('/useraddress', async (req, res) => {
  userHelpers.userAddress(req.body).then(() => {
    res.redirect("/profile")
  })
})

router.post('/usereditaddress', async (req, res) => {
  userHelpers.userEditAddress(req.body, req.session.users._id).then(() => {
    res.redirect("/profile")
  })
})



router.get("/edit-user-address", verifyLogin, async (req, res) => {
  users = req.session.users._id;
  let savedAddress = await userHelpers.getAddress(userId)
  res.render('user/orgedit-address', { users, savedAddress })
})




router.post('/removeWishProduct', async (req, res) => {
  try {
    let wishId = req.body.wishId;
    let item = req.body.proId;
    console.log("remove wishlist post")
    await productHelpers.deleteWishlistProduct(wishId, item).then((response) => {
      res.json({ response })
    })
  }
  catch (error) {
    res.render('user/404')
  }
})



router.post("/check-coupon", verifyLogin, async (req, res) => {
  try {
    let total = await userHelpers.getTotalAmount(req.session.users._id)
    userHelpers.checkCoupon(req.body, total.cartTotal, req.session.users._id).then((response) => {
      if (response.status) {
        req.session.Total = response.totalAmount
        Math.round(response.totalAmount)
        response.totalAmount = Math.round(response.totalAmount);
        response.discount = total.cartTotal - response.totalAmount

        response.actual = total.cartTotal
        res.json(response)
      }
      else {
        res.redirect('/place-order')
      }
    });
  }
  catch (err) {
    res.render("user/404");
  }
});

router.get("/cancelOrder/:id", (req, res) => {
  try {

    res.redirect("/order");
  } catch (err) {
    res.render("user/404");
  }
});


router.get('/404', (req, res) => {
  res.render('user/404')
})


module.exports = router; 
