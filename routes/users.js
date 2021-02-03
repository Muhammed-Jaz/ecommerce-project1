var express = require('express');
var router = express.Router();
var request = require('request');
const adminHelpers = require('../helpers/admin-helpers');
// var base64ToImage = require("base64-to-image");
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()

  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  
  var cat = await productHelpers.viewCategory()
  console.log(cat);
  productHelpers.getAllProducts().then((products) => {

    res.render('users/view-products', { products, cat, user, cartCount });
  })
});
router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {

    res.render('users/login', { "loginErr": req.session.userLoginErr })
    req.session.userLoginErr = false
  }

})

router.get('/signup', (req, res) => {
  res.render('users/signup')
})
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {

    req.session.user = response
    req.session.userLoggedIn = true
    res.redirect('/login')
  })
})
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {

      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    } else {
      req.session.userLoginErr = "Invaid Username or Password"
      res.redirect("/login")
    }
  })

})
router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})
router.get('/cart', verifyLogin, async (req, res) => {
  var cat = await productHelpers.viewCategory()
  let products = await userHelpers.getCartProducts(req.session.user._id)
  console.log(products);
  let totalValue = 0
  if (products.length > 0) {
    totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  }



  res.render('users/cart', { products, user: req.session.user, totalValue,cat })
})
router.get('/add-to-cart/:id', (req, res) => {
  console.log("api call");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })

})
router.post('/change-product-quantity', (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user._id)
    console.log(response.total)
    res.json({response:response})
  })
})
router.post('/remove-product', (req, res, next) => {
  console.log(req.body);
  userHelpers.removeProduct(req.body).then((response) => {
    res.json(response)
  }
  )
})
router.get('/place-order', verifyLogin, async (req, res) => {
  var cat = await productHelpers.viewCategory()
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('users/place-order', { total, user: req.session.user,cat })
})
router.post('/place-order', async (req, res) => {

  console.log("asfddghfjk", req.body);
  // console.log('heyyyy' + req.body.form);
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)

      })

    }

  })
})
router.get('/order-success', async(req, res) => {
  var cat = await productHelpers.viewCategory()
  res.render('users/order-success', { user: req.session.user ,cat})
})
router.get('/orders', async (req, res) => {
  var cat = await productHelpers.viewCategory()
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('users/orders', { user: req.session.user, orders,cat })
})
router.get('/view-order-products/:id', async (req, res) => {
  var cat = await productHelpers.viewCategory()
  let products = await userHelpers.getOrderProducts(req.params.id)
  console.log(products);
  res.render('users/view-order-products', { user: req.session.user, products ,cat})
})
router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    res.json({ status: false, errMsg: '' })
  })
})
router.get('/filter/:name', async (req, res) => {
  var cat = await productHelpers.viewCategory()

  productHelpers.findCategory(req.params.name).then((products) => {
    res.render('users/view-category', { users: true, products, cat, user: req.session.user })

  })
})
router.get('/profile', (req, res) => {
  userHelpers.getUserDetails(req.session.user._id).then((users) => {
    res.render('users/profile', { user: req.session.user, users })
  })
})
router.get('/view-product/:id', async (req, res) => {
  console.log(req.params.id);
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  var cat = await productHelpers.viewCategory()
  productHelpers.getProductDetails(req.params.id).then((products) => {
    console.log(products);
    res.render('users/product-view', { user: req.session.user, products, cartCount,cat })
  })
})
// router.get('/mobile',(req,res)=>{
//   res.render('users/mobile')
// })
router.post("/ajax/isMobile", (req, res) => {
  userHelpers.checkMobile(req.body.mobile).then((response) => {
    res.json(response);
  });
});

router.post("/callOtp", (req, res) => {
  console.log(req.body.mobile);
  let user_phone = req.body.mobile;
  var options = {
    method: "POST",
    url: "https://d7networks.com/api/verifier/send",
    headers: {
      Authorization: "Token 811f83b904ce2c954538d89c4f96723cd0a42c0b",
    },
    formData: {
      mobile: "91" + user_phone,
      sender_id: "SMSINFO",
      message: "Your otp code is {code}",
      expiry: "9000",
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    let body = JSON.parse(response.body);
    let otp_id = body.otp_id;
    res.json({ otp_id: otp_id, user_phone: user_phone });
  });
});

router.get("/otpVerification", (req, res) => {
  res.render("users/mobile");
});

router.post("/verifyOtp", (req, res) => {
  console.log(req.body);
  var options = {
    method: "POST",
    url: "https://d7networks.com/api/verifier/verify",
    headers: {
      Authorization: "Token 811f83b904ce2c954538d89c4f96723cd0a42c0b",
    },
    formData: {
      otp_id: req.body.otp_id,
      otp_code: req.body.otp_code,
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    let body = JSON.parse(response.body);

    if (body.status === "success") {
      userHelpers
        .getOneUserWithNumber(req.body.user_phone)
        .then((user) => {
          req.session.user = user
          req.session.userLoggedIn = true
          res.json({ status: "success" });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.json({ status: "failed", err: body.error });
    }
  });
});

module.exports = router;
