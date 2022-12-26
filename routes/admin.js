const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
var userHelpers = require('../helpers/user-helpers');
const multer = require("multer");
const path = require("path")

const credentials = { userName: 'admin@gmail.com', password: '123' }

/* GET users listing. */ 

router.get('/', function (req, res, next) {
  try {
    if (req.session.adminLogged) {
      productHelpers.getAllProducts().then((products) => {
        res.render('admin/all-products', { admin: true, products, updateErr: req.session.updateErr });
        req.session.updateErr = false
      })
    }
    else {
      res.redirect('/admin/admin-login')
    }
  }
  catch (err) {
    res.render('user/404')
  }
});

//==//*================== ADMIN====LOGIN==========================================ADMIN_LOGIN==============
router.get('/admin-login', (req, res) => {
  try {
    if (req.session.adminLogged) {
      res.redirect('/admin')
    } else if (req.session.adminErr) {
      res.render('admin/admin-login', { adminErr: req.session.adminErr })
      req.session.adminErr = false
    }
    else {
      res.render('admin/admin-login')
    }
  }
  catch (err) {
    res.render('user/404')
  }
})

router.post('/admin-login', function (req, res) {
  try {
    console.log(req.body.userName);
    console.log(req.body.password);
    if (req.body.userName == credentials.userName && req.body.password == credentials.password) {
      req.session.adminLogged = true;
      admin = req.session.adminLogged;
      res.redirect('/admin')
    }
    else {
      req.session.adminErr = true
      res.redirect('/admin')
    }
  }
  catch (err) {
    res.render('user/404')
  }
})

/*admin logout*/

router.get('/logout', (req, res) => {
  try {
    req.session.adminlogged = "";
    req.session.admin = "";
    res.redirect('/admin', { admin: true })
  }
  catch (err) {
    res.render('user/404')
  }
});



//mycode

/*router.get('/admin-login',(req,res)=>{
  if(req.session.adminLogged){
    res.redirect('/products')
  }else if(req.session.adminErr){
    res.render('admin/admin-login',{adminErr:req.session.adminErr})
    req.session.adminErr=false
  }else{
    res.render('admin/admin-login')
  } 
})

router.post('/admin-login', function(req, res) {
  console.log(req.body.userName);
  console.log(req.body.password);
  
  if(req.body.userName==credentials.userName && req.body.password==credentials.password)
  { 
    req.session.adminLogged=true;
    admin=req.session.adminLogged;
    res.redirect('/products')
}
else{
  req.session.adminErr=true
  res.redirect('/admin-login')
}
   
})

 

router.get('/logout', (req, res)=>{
  
  req.session.adminLogged=""
  res.redirect('/admin-login')
});

*/

router.get('/products', function (req, res, next) {
  try {
    productHelpers.getAllProducts().then((products) => {
      res.render('admin/all-products', { admin: true, products });
    })
  }
  catch (err) {
    res.render('user/404')
  }
});


router.get('/add-product', function (req, res) {
  try {
    res.render('admin/add-product', { admin: true })
  }
  catch (err) {
    res.render('user/404')
  }
})


//submission
var fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/product-images");
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, Date.now() + "--" + file.originalname);
  },
});



const upload = multer({ storage: fileStorageEngine });

router.post("/add-product", upload.array("Image"), (req, res) => {
  try {
    var filenames = req.files.map(function (file) {
      return file.filename;
    });
    req.body.image = filenames;
    productHelpers.addProduct(req.body).then(() => {
      res.redirect("/admin/add-product");
    });
  }
  catch (err) {
    res.render('user/404')
  }
});



router.get('/delete-product/:id', (req, res) => {
  try {
    let proId = req.params.id;
    productHelpers.deleteProduct(proId).then((response) => {
      res.redirect('/admin/products');
    })
  }
  catch (err) {
    res.render('user/404')
  }
})


router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product', { product, admin: true })
})
try {
  let fileStorageEngines = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/product-images");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "--" + file.originalname);
    },
  });
} catch (err) {
  res.render("user/404");
}


router.post('/edit-product/:id', upload.array("Image"), (req, res) => {
  try {
    var filenames = req.files.map(function (file) {
      return file.filename;
    });
    req.body.image = filenames;
    productHelpers.updateProduct(req.params.id, req.body).then(() => {
      res.redirect('/admin/products')
    })
  }
  catch (err) {
    res.render('user/404')
  }
})


router.get('/all-users', (req, res) => {
  try {
    userHelpers.getAllUsers().then((users) => {
      res.render('admin/all-users', { admin: true, users });
    })
  }
  catch (err) {
    res.render('user/404')
  }
});

router.get('/add-users', (req, res) => {
  try {
    res.render('admin/add-users', { admin: true })
  }
  catch (err) {
    res.render('user/404')
  }
})

router.post('/add-users', (req, res) => {
  try {
    userHelpers.addUsers(req.body, (id) => {
      res.render('admin/add-users', { admin: true })
    })
  }
  catch (err) {
    res.render('user/404')
  }
})


router.get('/delete-users/:id', (req, res) => {
  try {
    let userId = req.params.id;
    userHelpers.deleteUser(userId).then((response) => {
      res.redirect('/admin/all-users');
    })
  }
  catch (err) {
    res.render('user/404')
  }
})


router.get('/edit-users/:id', async (req, res) => {
  try {
    let users = await userHelpers.getUserDetails(req.params.id)
    res.render('admin/edit-users', { users, admin: true })
  }
  catch (err) {
    res.render('user/404')
  }
})

router.post('/edit-users/:id', (req, res) => {
  try {
    userHelpers.updateUser(req.params.id, req.body).then(() => {
      res.redirect('/admin/all-users')
    })
  }
  catch (err) {
    res.render('user/404')
  }
})


router.get("/block/:id", (req, res) => {
  try {
    let usrId = req.params.id;

    userHelpers.blockUser(usrId).then(() => {
      req.session.user = null;
      req.session.loggedIn = null;

      res.redirect("/admin/all-users");
    });
  } catch (err) {
    res.render("user/404");
  }
});

router.get("/unblock/:id", (req, res) => {
  try {
    let usrId = req.params.id;
    userHelpers.unblocklUser(usrId).then(() => {
      res.redirect("/admin/all-users");
    });
  } catch (err) {
    res.render("user/404");
  }
});

router.get('/view-order/:id', async (req, res) => {
  try {
    let order = await userHelpers.getUserOrders(req.params.id)
    let product = await userHelpers.getOrderProducts(req.params.id)
    console.log("reached admin cart")
    res.render('admin/user-order', { order, product })
  }
  catch (err) {
    res.render('user/404')
  }
})

router.get('/all-orders', async (req, res) => {
  try {
    await userHelpers.getAllOrders().then((orders) => {
      res.render('admin/allorders', { admin: true, orders });
    })
  }
  catch (err) {
    res.render('user/404')
  }
});

//status of order ------------------------------------------------------------- 

router.post('/changeStatus/:id', async (req, res) => {
  try {
    await userHelpers
      .updateStatus(req.body.changeStatus, req.params.id)
      .then(() => {
        res.redirect("admin/all-orders");
      });
  } catch (err) {
    res.render("user/404");
  }
});


router.get("/coupon", (req, res) => {
  try {
    productHelpers.getCoupons().then((coupons) => {
      res.render("admin/coupon", { admin: true, coupons });
    })
  } catch (err) {
    res.render("user/404");
  }
});




router.post("/coupon", (req, res) => {

  try {

    req.body.users = [];

    productHelpers.addCoupon(req.body).then((response) => {

      // console.log(response);

      res.redirect("/admin/coupon");
    });

  } catch (err) {

    res.render("user/404");
  }

});




router.get("/sales-report", async (req, res) => {
  try {
    let order = await userHelpers.getAllOrders();
    let usr = await userHelpers.getAllUsers();
    let codTotal = await productHelpers.codTotal();
    console.log(codTotal)
    let rasorpayTotal = await productHelpers.rasorpayTotal();
    console.log(rasorpayTotal)
    res.render("admin/sales", {
      order,
      usr,
      admin: true,
      codTotal,
      rasorpayTotal,
    });
  }
  catch (err) {
    res.render('user/404')
  }
});



router.get("/banner-management", function (req, res, next) {

  try {

    res.render("admin/banner-management", { admin: true });

  } catch (err) {

    res.render("user/404");

  }

});

module.exports = router;   