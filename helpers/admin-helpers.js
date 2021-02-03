var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID
const { response } = require('express')


module.exports = {
    viewUser: () => {
        return new Promise(async (resolve, reject) => {
            let allUsers = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .find()
                .toArray();
            resolve(allUsers)

        })
    },
    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).removeOne({ _id: objectId(userId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION)
                .findOne({ _id: objectId(userId) })
                .then((user) => {
                   
                    resolve(user)

                })
        })

    },
    updateUser:(userId,userDetails)=>{
        console.log(userId,userDetails);
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
            {
                $set:{
                    Name:userDetails.Name,
                    Email:userDetails.Email

                }
            }).then((user)=>{
                resolve()
            })
        })
    },
    addUser: (user, callback) => {
        console.log(user);
        db.get()
          .collection("user")
          .insertOne(user)
          .then((data) => {
            // console.log(data.ops[0]._id);
            return callback(data.ops[0]._id);
          });
      
       
            
           
           
    },
    editCategory:(category,catDetails)=>{
        console.log(catId,catDetails);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({category:category},
            {
                $set:{
                Name:catDetails.Name
                }
            }).then((category)=>{
                resolve(category)   
            })
        })
        
    },
    getCategoryDetails:(catId)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)}).then((category)=>{
                
                resolve(category)
            })
        })
    },
    getNoUsers:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).estimatedDocumentCount().then((count)=>{
                resolve(count)
            })
        })
    }

    
}