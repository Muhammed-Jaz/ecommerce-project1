var db = require('../config/connection')
var collection = require('../config/collections')
const { ObjectID, ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectID
module.exports = {
    // addProduct: (product, callback) => {
    //     product.Price = parseFloat(product.Price)
    //     db.get().collection('product').insertOne(product).then((data) => {

    //         callback(data.ops[0]._id)
    //     })
    addProduct: (product) => {

        return new Promise((resolve, reject) => {

            product.Price = parseInt(product.Price);

            db.get()

                .collection(collection.PRODUCT_COLLECTION)

                .insertOne({

                    Name: product.Name,

                    Description: product.Description,

                    Price: product.Price,

                    categories: product.categories,



                })

                .then((data) => {

                    resolve(data.ops[0]._id);

                });

        });

    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({ _id: ObjectId(prodId) }).then((response) => {

                resolve(response)
            })
        })
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .findOne({ _id: objectId(proId) })
                .then((product) => {
                    resolve(product)
                })
        })
    },
    updateProduct: (proId, proDetails) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        Name: proDetails.Name,
                        Description: proDetails.Description,
                        Price: proDetails.Price,
                        Category: proDetails.Category
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },
    viewOrdersAdmin: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).find().toArray().then((data) => {
                console.log(data);
                resolve(data)
            })
        })
    },
    changeOrderStatus: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(data.user) },
                {
                    $set: {
                        status: data.status
                    }
                })
        })
    },
    viewCategory: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((data) => {
                resolve(data)
            })
        })
    },
    addCategory: (category) => {
        console.log(category);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data) => {
                resolve(data)
            })
        })
    },
    deleteCategory: (category) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).removeOne({ _id: objectId(category.id) }).then(() => {
                resolve()
            })
        })
    },
    findCategory: (category) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find({ 'categories': category }).toArray().then((data) => {
                resolve(data)

            })
        })
    },
    getProductDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(id) }).then((data) => {

                resolve(data)
            })
        })
    },
    getNoProducts: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).estimatedDocumentCount().then((count) => {
                resolve(count)
            })
        })
    },
    getNoOrders: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).estimatedDocumentCount().then((count) => {
                resolve(count)
            })
        })
    },
    getTotalOrders: (date) => {
        return new Promise((resolve, reject) => {
            let startDate = date.startDate;
            let endDate = date.endDate;

            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        date: {
                            $dateToString: { date: "$date", format: '%Y-%m-%d' },
                        },
                        products: 1,
                        amount: 1,
                    },
                },

                {
                    $match: {
                        date: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                    },
                },
                {
                    $group: {
                        _id: date,
                        total_orders: {
                            $sum: 1,
                        },
                        total_amount: {
                            $sum:"$total"
                        },
                        total_products: {
                            $sum: { $size: "$products" },
                        },
                    },
                },
            ])
            
                .toArray().then((response) => {

                    resolve(response[0])
                })
        })
    },
    getFullOrderReports: (date) => {
        /*for custom date - admin daily orders section */
        let startDate = date.startDate;
        let endDate = date.endDate;
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)

                .aggregate([
                    {
                        $project: {
                            date: {
                                $dateToString: { date: "$date", format: "%Y-%m-%d" },
                            },
                            products: 1,
                            amount: 1,
                        },
                    },
                    {
                        $match: {
                            date: {
                                $gte: startDate,
                                $lte: endDate,
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            date: 1,
                            amount: 1,
                        },
                    },
                    {
                        $group: {
                            _id: {
                                date: "$date"
                            },
                            amount: { $sum: { $multiply: ["$amount", 1] } },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $sort: { _id: 1 },
                    },
                ])

                .toArray()
                .then((response) => {
                    resolve(response);
                });
        });
    },

}