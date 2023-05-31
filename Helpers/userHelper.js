const bcrypt = require("bcrypt");
const db = require("../Config/connection");
const collection = require("../Config/collection");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../Config/jwtSecret");
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  doSignup: (details) => {
    return new Promise(async (resolve, reject) => {
      const existingUser = await db
        .get()
        .collection(collection.userCollection)
        .findOne({ email: details.email });

      if (existingUser) {
        console.log("not inserted");
        resolve({ status: false, message: "Email already exists" });
      } else {
        details.password = await bcrypt.hash(details.password, 10);

        db.get()
          .collection(collection.userCollection)
          .insertOne(details)
          .then((data) => {
            console.log("data inserted");
            resolve({ status: true });
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  },

  doLogin: async (userData) => {
    if (!userData.email || !userData.password) {
      return { status: false, message: "Email and password are required" };
    }

    try {
      const user = await db
        .get()
        .collection(collection.userCollection)
        .findOne({ email: userData.email });

      if (user) {
        const match = await bcrypt.compare(userData.password, user.password);

        if (match) {
          return { status: true, user: user };
        } else {
          return { status: false, message: "Invalid password" };
        }
      } else {
        return { status: false, message: "User not found" };
      }
    } catch (error) {
      throw error;
    }
  },

  createArticle: (article, user) => {
    return new Promise((resolve, reject) => {
      article.user = user;
      db.get().collection(collection.articleCollection).insertOne(article).then((data) => {
        console.log("Article inserted");
        resolve({ status: true });
      }).catch((error) => {
        reject(error);
      });
    });
  },

  viewArticle: () => {
    return new Promise((resolve, reject) => {
      let article = db.get().collection(collection.articleCollection).find().toArray();
      resolve(article);
    });
  },

  updateProfile: async (user, details) => {
    try {
      await db.get().collection(collection.userCollection).updateOne(
        { _id: new ObjectId(user) },
        {
          $set: {
            username: details.username,
            age: details.age
          }
        }
      );
    } catch (error) {
      console.log('error');
      throw error;
    }
  }
};
