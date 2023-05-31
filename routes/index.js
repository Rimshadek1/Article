var express = require("express");
var router = express.Router();
var userHelper = require("../Helpers/userHelper");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwtSecret = require("../Config/jwtSecret");
const authMiddleware = require("../Config/middleware");

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.use(express.json());

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("signup");
});

router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("index");
  } else {
    res.render("login", {
      loginErr: req.session.LogginErr,
    });
    req.session.LogginErr = false;
  }
});

router.get("/index", (req, res) => {
  let user = req.session.user;
  res.render("index", { user });
});

router.post("/submit", (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      res.redirect("index");
    } else {
      res.send(
        '<script>alert("Email already exists"); window.location.href="/";</script>'
      );
    }
  });
});

router.post("/login", (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      const token = jwt.sign({ userId: response.user._id }, jwtSecret, {
        expiresIn: "1h",
      });
      res.cookie("token", token); // Store the token in a cookie (optional)
      res.redirect("/index");
    } else {
      req.session.LogginErr = "Invalid Username or Password";
      res.send(
        '<script>alert("User not found"); window.location.href="/login";</script>'
      );
    }
  });
});

router.get("/article", (req, res) => {
  res.render("article");
});

router.post("/createArticle", verifyLogin, authMiddleware, (req, res) => {
  let user = req.session.user;
  userHelper.createArticle(req.body, user.username).then((response) => {
    if (response.status) {
      res.redirect('index');
    }
  }).catch((error) => {
    console.error(error);
    res.status(500).send('Internal Server Error');
  });
});

router.get('/viewArticle', ((req, res) => {
  userHelper.viewArticle().then((response) => {
    res.send(response);
  });
}));

router.post('/updateProfile/:id', async (req, res) => {
  try {
    await userHelper.updateProfile(req.session.user._id, req.body);
    res.redirect('/index');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
