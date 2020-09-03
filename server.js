require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
var uri = 'mongodb+srv://matt-godfrey:' + process.env.PASS + '@cluster0.4ruse.mongodb.net/Test?retryWrites=true&w=majority'
mongoose.connect(uri || 'mongodb://localhost/stormy-temple-90369', { useNewUrlParser: true, useUnifiedTopology: true });

var User = require('./userModel')
const { response } = require('express')

var Session = require('./sessionModel')
const e = require('express')

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// User.deleteMany({}, (err, doc) => {
//   if (err) {
//     console.log(err)
//   }
//   console.log(doc)
// })




app.post("/api/exercise/new-user", (req, res) => {
  

  User.exists({ username: req.body.username }, (err, doc) => {
    
    if (err) return err;
    
    if (!err && doc === false) {
      
      let newUser = new User({ username: req.body.username })
     
      newUser.save((err, newDoc) => {
        if (err) return err;
        console.log("New user added to Database")
        let newUserObj = {};
        newUserObj.username = newDoc.username;
        newUserObj._id = newDoc._id;
        
        console.log(newDoc)
        res.json(newUserObj)
      })
    
    
    } else {
      res.json({ message: "Username already exists, please enter a new one"})
    }
  })
  })

  app.get('/api/exercise/users', (req, res) => {
      console.log('searching...')
      User.find()
          .exec((err, users) => {
            if (err) return err;
            res.json(users)
          })
      
  })

  app.post('/api/exercise/add',  (req, res) => {
    console.log(req.body)
    // let newSession = new Session({
    //   // _id: id,
    //   description: req.body.description,
    //   duration: parseInt(req.body.duration),
    //   // date: req.body.date
    //   date: req.body.date
    // })

    let dateChecker = /[0-9]/g

    // if (newSession.date === "" || new Date(newSession.date) == "Invalid Date") {
    //   // newSession.date = new Date().toISOString().substring(0, 10)
    //   newSession.date = new Date().toDateString()
    // }
    let { userId, description, duration, date } = req.body;
    let dateObject = date === "" || date === "Invalid Date" ? new Date() : new Date(date)

    

    let newSession = {
      _id: userId,
      description: description,
      duration: +duration,
      date: dateObject.toDateString(),
      username: User.findById(userId, (err, user) => {
        if (err) return err
        return user.username;
      })
    }

    
    
    
    User.findByIdAndUpdate(req.body.userId, { $push: { log: newSession }}, { new: true }, (err, updatedUser) => {
      // console.log(newSession)
      if (err) return err;
      if (!err && updatedUser != null) {
        console.log("Session added to log")
        let updatedUserObject = {};
        updatedUserObject._id = updatedUser.id;
        updatedUserObject.username = updatedUser.username;
        updatedUserObject.date = new Date(newSession.date).toDateString();
        updatedUserObject.duration = newSession.duration;
        updatedUserObject.description = newSession.description;
        
        
        
        
        // updatedUserObject.log = updatedUser.log;
        
        
        console.log(updatedUser)
        
        res.json(updatedUserObject)
      
      } else {
        res.json( {message: "User ID not found in database. Please create a valid username and try again"})
      }
      
      })
        
       })

       app.get('/api/exercise/log/:userId?', (req, res) => {
          
          User.findById(req.params.userId, (err, user) => {
            if (err) return err;
            if (!err && user != null) {
              console.log('user found')
            
            let totalMins = user.log.reduce((acc, val) => {
              return acc.duration + val.duration;
            })
            console.log("Total mins = " + totalMins)
            let userObj = {};
            userObj._id = req.params.id;
            userObj.username = user.username;
            userObj.log = user.log;
            userObj.totalMins = totalMins;
            userObj.count = user.log.length;
            res.json(userObj)
            }
          })
       })




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
