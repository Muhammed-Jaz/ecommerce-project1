var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var base64ToImage = require("base64-to-image");
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
const adminHelpers = require('../helpers/admin-helpers')


const adminUser = "jaz@123";
const adminPassword = "a";

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
  res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
  res.setHeader("Expires", "0"); // Proxies.
  if (req.session.loggedAdmin) {
    productHelpers.getAllProducts().then((products) => {
      res.redirect("/admin/view-products");
    });
  } else {
    res.redirect("/admin/adminlogin");
  }
});
router.get('/view-products', function (req, res, next) {
  if (req.session.loggedAdmin){
  productHelpers.getAllProducts().then((products) => {
    console.log("keeri");
    res.render('admin/view-products', { admin: true, products });
  })
}
// res.redirect('/admin/adminlogin')
});
router.get('/add-product', (req, res) => {
  productHelpers.viewCategory().then((categories) => {
    console.log(categories);

    res.render('admin/add-product', { categories, admin: true })
  })
})

router.post("/add-product", function (req, res, next) {


  productHelpers.addProduct(req.body).then((id) => {

    var base64Str = req.body.croppedImg;

    var path = "./public/product-images/";

    var optionalObj = { fileName: id, type: "jpg" };

    base64ToImage(base64Str, path, optionalObj);

    res.redirect("/admin/view-products");

  });

});
router.get('/delete-product', (req, res) => {
  let proId = req.query.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/view-products')
  })
})
router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product', { product, admin: true })

})
router.post('/edit-product/:id', (req, res) => {
  let id = req.params.id

  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin/view-products')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})
router.get("/adminlogin", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
  res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
  res.setHeader("Expires", "0"); // Proxies.
  if (req.session.loggedAdmin) {
    res.redirect("/admin/view-products");
  } else {
    res.render("admin/adminlogin",{admin:true});
  }
});
router.post("/adminlogin", (req, res) => {
  console.log(req.body);
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
  res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
  res.setHeader("Expires", "0"); // Proxies.
  if (req.body.email == adminUser && req.body.password == adminPassword) {
    req.session.loggedAdmin = true;
    res.redirect("/admin");

    // if (req.session.loggedAdmin) {
      // productHelpers.getAllProducts().then((products) => {
        // console.log("working");
      // });
    // } else {
      // res.redirect("/admin/adminLogin");
    // }
  } else {

    res.redirect("/admin/adminlogin");
  }
});
router.get('/adminlogout', (req, res) => {
  req.session.loggedAdmin = null;
  console.log('jaz');
  res.redirect('/admin')
})

router.get("/view-users", (req, res) => {
  if (req.session.loggedAdmin){
  adminHelpers.viewUser().then((users) => {

    res.render('admin/view-users', { users, admin: true })

  })
}
res.redirect("/admin/adminlogin")
})
router.get('/delete-user', (req, res) => {
  let userId = req.query.id

  adminHelpers.deleteUser(userId).then((response) => {
    res.redirect('/admin/view-users')
  })
})
router.get('/edit-user/:id', async (req, res) => {
  let user = await adminHelpers.getUserDetails(req.params.id)
  console.log(user);
  res.render('admin/edit-user', { user, admin: true })

})
router.post('/edit-user/:id', async (req, res) => {
  console.log("hiii", req.params.id);
  // let id= req.params.id

  adminHelpers.updateUser(req.params.id, req.body).then(() => {
    res.redirect('/admin/view-users')
  })
})
router.get('/add-users', (req, res) => {
  res.render('admin/add-users', { admin: true })
})


router.post("/add-users", (req, res) => {
  adminHelpers.addUser(req.body, response => {
    // if (response.status) {
    //   req.session.signupsuc = true;
    //   req.session.signupsuc = "signup successfully";
    //   // res.redirect("/admin/view-users/");
    //   res.send("success");
    // } else {
    //   // console.log("not working");
    //   res.send("already-exist");
    // }

    res.redirect('/admin/view-users')
  })
});
router.get('/view-orders', (req, res) => {
  if (req.session.loggedAdmin){
  productHelpers.viewOrdersAdmin().then((response) => {
    
    res.render('admin/view-orders', { response, admin: true })
  })
}
res.render("admin/adminlogin",{admin:true})
})
router.post('/change-product-status', (req, res) => {
  console.log(req.body);
  productHelpers.changeOrderStatus(req.body).then(() => {
    resolve()
  })
  product
})
router.get('/view-category', (req, res) => {
  if(req.session.loggedAdmin){
    console.log("jasbdhbsjh");
  productHelpers.viewCategory().then((response) => {
    res.render('admin/view-category', { admin: true, response })
  })
}
res.redirect('/admin/adminlogin')
})
router.get('/add-category', (req, res) => {
  res.render('admin/add-category', { admin: true })
})
router.post('/add-category', (req, res) => {

  productHelpers.addCategory(req.body).then((response) => {
    res.redirect('/admin/view-category')
  })
})
router.get('/delete-category/:id/:category', (req, res) => {
  productHelpers.deleteCategory(req.params).then(() => {
    res.redirect('/admin/view-category',)
  })
})
router.get('/edit-category/:id', async (req, res) => {
  let category = await adminHelpers.getCategoryDetails(req.params.id, req.body)
  console.log(req.params.id, req.body);
  res.render('admin/edit-category', { admin: true, name: category.Name, id: category._id })
})
router.post('/edit-category/:id', (req, res) => {
  adminHelpers.editCategory(req.params.id, req.body).then(() => {
    res.redirect('/admin/view-category')
  })
})
router.get('/view-report', async (req, res) => {
  if(req.session.loggedAdmin){
  let userNo = await adminHelpers.getNoUsers();
  let proNo = await productHelpers.getNoProducts()
  let orderNo = await productHelpers.getNoOrders()

  res.render('admin/report', { admin: true, userNo, proNo, orderNo })
}
res.render("admin/adminlogin",{admin:true})

})


router.get('/salesReport', (req, res) => {

  res.render('admin/sales-report', { admin: true })
})

router.post('/ajax/reports', async (req, res) => {
  let fullOrder = await productHelpers.getFullOrderReports(req.body)
  productHelpers.getTotalOrders(req.body).then((reports) => {
    console.log(reports);
    res.json({ reports: reports, fullOrder: fullOrder })
  })

})
router.get('/admin-dash', (req, res) => {
  if (req.session.loggedAdmin) {
    
    res.render('admin/admin-dash', { admin: true })
  } 
  res.render("admin/adminlogin",{admin:true})
})









module.exports = router;
