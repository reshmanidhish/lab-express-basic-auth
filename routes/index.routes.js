const express = require('express');
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  if(req?.session && req.session.currentUser){
    res.render("auth/profile", {loggedIn: true});
  }
  else {
    res.render("index")
  }
});

module.exports = router;