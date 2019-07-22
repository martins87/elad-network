var createError = require('http-errors')
const express = require('express') // ok
const path = require('path') // ok
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const bodyParser = require('body-parser') // ok
var favicon = require('serve-favicon')
var session = require('express-session') // ok
var passport = require('passport') // ok
require('./passport')(passport)
var expressValidator = require('express-validator')
var LocalStrategy = require('passport-local').Strategy
var flash = require('connect-flash')
// var bcrypt = require('bcryptjs')
var bcrypt = require('bcrypt-nodejs')
// var mongo = require('mongodb')
const mongoose = require('mongoose') // ok
const fileUpload = require('express-fileupload')

// Property MongoDB model
const Property = require('./models/property')
const User = require('./models/user')

// database name: elad-network
// mongoose.connect('mongodb://admin:admin123@ds237267.mlab.com:37267/elad-network', {
mongoose.connect('mongodb://localhost:27017/elad-network', {
  useNewUrlParser: true
}, function(error) {
  if(error) {
    console.log('There was an error connecting to the database')
    console.log(error)
  } else {
    console.log('We are connected to the database!')
  }
})

function hashPassword(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: true}));

app.use(fileUpload())

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Handle Sessions
app.use(session({
  // secret: 'secret',
  // saveUninitialized: true,
  // resave: true
  secret: 'thesecret',
  saveUninitialized: false,
  resave: false
}))

// Passport 
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// routing changes --- beginning 
app.get('/', function(req, res, next) {
  Property.countDocuments({}, (error, num) => {
    if(error) {
      console.log('There was a problem retrieving the properties from the database')
      console.log(error)
    } else {
      console.log('Number of properties: ' + num)
    }
  })

  Property.find({}, function(error, properties) {
      if(error) {
          console.log('There was a problem retrieving the properties from the database')
          console.log(error)
      } else {
          res.render('index', {
              propertiesList: properties,
              title: 'Properties'
          })
      }
  })
  // res.render('index', {title:'Dashboard'})
})

app.get('/login', function(req, res, next) {
  res.render('login', {title:'Login'});
})

app.get('/signup', function(req, res, next) {
  res.render('signup', {title:'Signup'})
})

app.post('/teste', (req, res) => {
  var data = req.body
  
  var username = data.uname
  var password = data.passwd
  
  User.findOne({
    username: username,
    password: password
  }, function(error, doc) {
    if(error) {
      console.log('There was a problem retrieving the user from database')
      console.log(error)
  } else {
      if(doc) {
        console.log('Username already exists')
      } else {
        // record new user
        console.log('New user: ' + username)
        User.create({
          username: username,
          password: hashPassword(password)
        }, function(error, data) {
          if(error) {
              console.log('There was a problem adding the user to the collection')
              console.log(error)
          } else {
              console.log('Data successfully added to the collection')
              console.log(data)
          }
        })
      }
    }
  })

  res.send('Sucesso')
})

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/dashboard'
}), function(req, res) {
  res.send('hey')
})

app.get('/dashboard', function(req, res, next) {
  res.render('dashboard', {title:'Dashboard'});
})

app.get('/properties', function(req, res) {
  Property.countDocuments({}, (error, num) => {
    if(error) {
      console.log('There was a problem retrieving the properties from the database')
      console.log(error)
    } else {
      console.log('Number of properties: ' + num)
    }
  })

  Property.find({}, function(error, properties) {
      if(error) {
          console.log('There was a problem retrieving the properties from the database')
          console.log(error)
      } else {
          res.render('properties', {
              propertiesList: properties,
              title: 'Properties'
          })
      }
  })
})

app.get('/properties/:id', function(req, res) {
  var id = req.params.id

  Property.findById(id, function(error, foundProperty) {
    if(error) {
      console.log("Couldn't find property with that id:")
    } else {
      // console.log('Property found:')
      // console.log(foundProperty)

      res.render('property', {
        propertyName: foundProperty.propertyName,
        propertyPrice: foundProperty.propertyPrice,
        propertyAddress: foundProperty.propertyAddress,
        tokenSymbol: foundProperty.tokenSymbol,
        totalSupply: foundProperty.totalSupply,
        ethPrice: foundProperty.ethPrice,
        propertyDescription: foundProperty.propertyDescription,
        propertyImage: foundProperty.propertyImage,
        title: 'Property'
      })
    }
  })
})

app.get('/create', function(req, res, next) {
  res.render('create', { title:'Create Property' });
})

app.get('/manage', function(req, res, next) {
  res.render('manage', {title:'Manage Properties'});
})

app.get('/tokens', function(req, res, next) {
  res.render('tokens', {title:'Property Tokens'})
})

app.get('/blank', function(req, res, next) {
  res.render('blank', {title:'Blank page'})
})

app.post('/create-property', (req, res) => {
  var data = req.body

  var imageFile = req.files.propertyImage

  imageFile.mv('public/uploads/' + imageFile.name, function(error) {
    if(error) {
      console.log('Couldn\'t upload the image file' )
      console.log(error)
    } else {
      console.log('Image file successfully uploaded')
    }
  })

  Property.create({
      propertyName: data.propertyName,
      propertyPrice: data.propertyPrice,
      propertyAddress: data.propertyAddress,
      tokenSymbol: data.tokenSymbol,
      totalSupply: data.totalSupply,
      ethPrice: data.ethPrice,
      propertyDescription: data.propertyDescription,
      propertyImage: imageFile.name
  }, function(error, data) {
      if(error) {
          console.log('There was a problem adding a document to the collection')
          console.log(error)
      } else {
          console.log('Data successfully added to the collection')
          console.log(data)
      }
  })

  res.redirect('properties')
})

app.get('*', (req, res) => {
  res.render('404', {title:'Page not found'})
})
// routing changes --- end

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
})

module.exports = app