const bcrypt = require('bcryptjs');
const saltRounds = 10;

const express = require('express');
const router = express.Router();

const User = require('../models/User.model');
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard');

/* GET Signup page */
router.get("/signup", isLoggedOut, (req, res, next) => {
  console.log('req.session', req.session)
  if(req?.session?.currentUser){
    res.render('auth/signup', {loggedIn: true})
  }
  else{
    res.render('auth/signup')
  }
    
});

router.post("/signup", (req, res, next) => {
    console.log('req.body', req.body)
    const { username, email, password } = req.body;

    bcrypt
    .genSalt(saltRounds)
    .then(salt => bcrypt.hash(password, salt))
    .then(hashedPassword => {
      return User.create({
        // username: username
        username,
        email,
        // passwordHash => this is the key from the User model
        //     ^
        //     |            |--> this is placeholder (how we named returning value from the previous method (.hash()))
        passwordHash: hashedPassword
      });
    })
    .then(userFromDB => {

      const {username, email} = userFromDB;
      
      req.session.currentUser = {username, email}
      console.log('Newly created user is: ', userFromDB);
      res.redirect(`/auth/profile`)
    })
    .catch(error => next(error));

});

router.get('/login', isLoggedOut, (req, res) =>{ 
    console.log('Testing');
  if(req?.session && req?.session?.currentUser){
    res.render('auth/login', {loggedIn: true})
  }
  else{
    res.render('auth/login')
  }
})

router.post('/login', (req, res) => {
  const {username, password} = req.body;

  if(!username || !password){
  // if (username === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both, username and password to login.'
    });
    return;
  }

  User.findOne({ username })
    .then(user => {
      console.log('password', password)
      console.log('user', user)
      console.log('user.passwordHash', user.passwordHash)
      if (!user) { // if user not found in the Db
        res.render('auth/login', { errorMessage: 'Username is not registered. Try with other username.' });
        return;
      } else if (bcrypt.compareSync(password, user.passwordHash)) { // if entered password matches user password
        const { username, email } = user;
        req.session.currentUser = { username, email }; // add property currentUser to my session
        user.loggedIn = true;
        res.render('auth/profile', user );
      } else { // if entered password doesnt match user.password
        res.render('auth/login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(error => console.log(error));
})

router.get("/profile", isLoggedIn, (req, res, next) => {
  // Session is configured ---> req.session
  // Use session to persist user loggedIn state ---> req.session.currentUser
   
    if(req.session.currentUser){
       User.findOne({ username: req.session.currentUser.username })
        .then(foundUser => {
            console.log('foundUser', foundUser)
            foundUser.loggedIn = true; // adding a property loggedIn and setting it to true
            res.render('auth/profile', foundUser)
        })
        .catch(err => console.log(err))
    }
    else{
      res.render('auth/profile')
    }
});

router.post('/logout', isLoggedIn, (req,res) =>{
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/');
  });
})

module.exports = router;