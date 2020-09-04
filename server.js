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

function checkDate(string) {
  var regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!string) {
    string = new Date().toDateString()
  }
  if (!string.match(regex)) return false
}


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
    
    let { userId, username, description, duration, date } = req.body;
    console.log(date)
    let dateObject = date === "" || checkDate(date) === false ? new Date().toDateString() : new Date(date).toDateString()
      
    console.log(dateObject)

    let newSession = new Session({
      
      description: description,
      duration: +duration,
      date: dateObject
    
    })

    
    
    
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
      
       console.log(updatedUser)
        
        res.json(updatedUserObject)
      
      } else {
        res.json( {message: "User ID not found in database. Please create a valid username and try again"})
      }
      
      })
        
       })

       app.get('/api/exercise/log', (req, res) => {
          
          User.findById(req.query.userId, (err, user) => {
            console.log(user)
            if (err) return err;
            if (!err && user !== null) {
              console.log('user found')
             let userResObj = user;
              // userResObj.log.forEach(log => delete log._id)

              if (req.query.limit) {
                userResObj.log = userResObj.log.slice(0, req.query.limit + 1)
                console.log(req.query.limit)
              }
              

              if (req.query.from || req.query.to) {
                let startDate = new Date(0)
                let endDate = new Date();
  
                if (req.query.from) {
                   startDate = new Date(req.query.from)
                 userResObj.log = user.log.filter(log => new Date(log.date) >= new Date(startDate))
                }
              
                if (req.query.to) {
                   endDate = new Date(req.query.to);
                  }

                  startDate.getTime();
                  endDate.getTime();

                  userResObj.log = userResObj.log.filter(log => {
                    let logDate = new Date(log.date)
                    return logDate >= startDate && logDate <= endDate
                  })
              }
                
              // if (req.query.limit) {
              //   userResObj.log = user.log.slice(0, req.query.limit)
              // }

              // if (req.query.from) {
              //   let startDate = req.query.from;
              //  userResObj.log = user.log.filter(log => new Date(log.date) >= new Date(startDate))
              // }
            
              // if (req.query.to) {
              //   let endDate = req.query.to;
              //   userResObj.log = user.log.filter(log => new Date(log.date) <= new Date(endDate))
              // }
            let total = userResObj.log.reduce((total, count) => {
             return total + count.duration;
              
            }, user.log[0].duration)
            console.log("Total mins = " + total)
            userResObj = userResObj.toJSON()
            userResObj._id = user.id;
            userResObj.username = user.username;
            userResObj.count = userResObj.log.length;
            userResObj.totalMins = total;
           
            userResObj.log = userResObj.log;
            console.log(userResObj.log.length)
            res.json(userResObj)
            } 
            if (!err && user === null) {
              res.send("Please choose a valid user ID")
            }
          })
       })




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
