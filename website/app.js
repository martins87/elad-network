const createError = require('http-errors');
const express = require('express'); // ok
const path = require('path'); // ok
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session'); // ok
const passport = require('passport'); // ok
require('./passport')(passport);
require('dotenv').config();
const expressValidator = require('express-validator');
var bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose') // ok
const fileUpload = require('express-fileupload');
const db = require('./db/dbConnection');

// Property MongoDB model
const Property = require('./db/models/property')
const User = require('./db/models/user')

// MySQL database
db.connect();

// MongoDB database
// database name: elad-network
// const dbUrl = process.env.MONGO_DB_URL;
// mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
//     if (!err) {
//         console.log('Successfully connected to elad-network database');
//     } else {
//         console.log('Error in database connection: ' + JSON.stringify(err, undefined, 2));
//     }
// });

const hashPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

const comparePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash)
}

const app = express();
const port = process.env.PORT || 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Handle Sessions
app.use(session({
    // secret: 'secret',
    // saveUninitialized: true,
    // resave: true
    secret: 'thesecret',
    saveUninitialized: true,
    resave: false
}))

// Passport 
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(require('connect-flash')());

app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// routing changes --- beginning 
app.get('/', async (req, res, next) => {

    // Checks if user is logged in
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN YET')
    } else {
        console.log('User: ', req.session.username)
    }

    const properties = await db.selectProperties();
    console.log('Number of properties: ', properties.length);

    res.render('index', { propertiesList: properties, title: 'Properties' });

    // MongoDB database
    // Property.countDocuments({}, (error, num) => {
    //   if(error) {
    //     console.log('There was a problem retrieving the properties from the database')
    //     console.log(error)
    //   } else {
    //     console.log('Number of properties: ' + num)
    //   }
    // });

    // Property.find({}, (error, properties) => {
    //     if(error) {
    //         console.log('There was a problem retrieving the properties from the database')
    //         console.log(error)
    //     } else {
    //         res.render('index', {
    //             propertiesList: properties,
    //             title: 'Properties'
    //         })
    //     }
    // });
})

app.get('/login', (req, res, next) => {
    res.render('login', { title: 'Login' });
})

app.get('/logout', (req, res, next) => {
    req.session.username = undefined
    res.redirect('/')
})

app.get('/signup', (req, res, next) => {
    res.render('signup', { title: 'Signup' })
})

app.get('/success', (req, res) => {
    res.render('success')
})

app.post('/login', async (req, res) => {
    console.log('Session:');
    console.log(req.session);

    var data = req.body;

    var username = data.uname;
    var password = data.passwd;

    // MySQL database
    const user = await db.selectUser(username);
    if (user.length > 0) {
        console.log('User found: ', user[0]);
        if (comparePassword(password, user[0].password)) {
            console.log('Password is valid! Login successful!')
            req.session.username = username
            res.render('dashboard', {
                title: 'Dashboard',
                user: username
            })
        } else {
            console.log('Password ' + password + ' is not valid!')
            res.render('login', {
                title: 'Login',
                msg: 'Wrong password'
            })
        }
    } else {
        console.log('User NOT found');
        res.render('login', {
            title: 'Login',
            msg: 'User not found'
        });
    }

    // MongoDB database
    // User.findOne({
    //     username: username
    // }, (error, doc) => {
    //     if (error) {
    //         console.log('There was an error retrieving user from database')
    //         console.log(error)
    //     } else {
    //         if (doc) {
    //             // user found
    //             console.log('User found: ', doc.username)
    //             if (comparePassword(password, doc.password)) {
    //                 console.log('Password is valid! Login successful!')
    //                 req.session.username = doc.username
    //                 res.render('dashboard', {
    //                     title: 'Dashboard',
    //                     user: username
    //                 })
    //             } else {
    //                 console.log('Password ' + password + ' is not valid!')
    //                 res.render('login', {
    //                     title: 'Login',
    //                     msg: 'Wrong password'
    //                 })
    //             }
    //         } else {
    //             console.log('Document not present in database')
    //             res.render('login', {
    //                 title: 'Login',
    //                 msg: 'User not found'
    //             })
    //         }
    //     }
    // });
})

app.post('/signup', (req, res) => {
    var data = req.body

    var fullname = data.fname
    var username = data.uname
    var password = data.passwd
    var confirmPassword = data.confirmpasswd

    if (password != confirmPassword) {
        console.log('Passwords don\'t match')
        res.render('signup', {
            title: 'Signup',
            msg: 'Passwords don\'t match'
        })
    } else {
        User.findOne({
            username: username//,
            // password: password
        }, (error, doc) => {
            if (error) {
                console.log('There was a problem retrieving the user from database')
                console.log(error)
            } else {
                if (doc) {
                    console.log('Username already exists')
                } else {
                    // record new user
                    User.create({
                        fullname: fullname,
                        username: username,
                        password: hashPassword(password)
                    }, (error, data) => {
                        if (error) {
                            console.log('There was a problem adding the user to the collection')
                            console.log(error)
                        } else {
                            console.log('Data successfully added to the collection:')
                            console.log(data)
                            res.render('success', { title: 'Successful Login' });
                        }
                    })
                }
            }
        })
    }
})

app.get('/dashboard', (req, res, next) => {
    // Checks if user is logged in. If not, redirects to login page.
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN YET')
        res.render('login', { title: 'Login' })
    } else {
        console.log('User:', req.session.username)
        res.render('dashboard', {
            title: 'Dashboard',
            user: req.session.username
        })
    }
})

app.get('/properties', (req, res) => {
    // Checks if user is logged in. If not, redirects to login page.
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN YET')
        res.render('login', { title: 'Login' })
    } else {
        console.log('User:', req.session.username)
        Property.countDocuments({}, (error, num) => {
            if (error) {
                console.log('There was a problem retrieving the properties from the database')
                console.log(error)
            } else {
                console.log('Number of properties: ' + num)
            }
        })

        Property.find({}, (error, properties) => {
            if (error) {
                console.log('There was a problem retrieving the properties from the database')
                console.log(error)
            } else {
                res.render('properties', {
                    propertiesList: properties,
                    title: 'Properties',
                    user: req.session.username
                })
            }
        })
    }
})

app.get('/properties/:id', (req, res) => {
    // Checks if user is logged in. If not, redirects to login page.
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN YET')
        res.render('login', { title: 'Login' })
    } else {
        console.log('User:', req.session.username)
        var id = req.params.id

        Property.findById(id, (error, foundProperty) => {
            if (error) {
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
                    title: 'Property',
                    user: req.session.username
                })
            }
        })
    }
})

app.get('/create', (req, res, next) => {
    // Checks if user is logged in
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN YET')
        res.render('login', { title: 'Login' })
    } else {
        console.log('User: ', req.session.username)

        // Checks if user has access to create property page
        if (req.session.username != 'admin') {
            res.render('dashboard', { title: 'Dashboard', user: req.session.username });
        } else {
            res.render('create', { title: 'Create Property', user: req.session.username });
        }
    }

})

app.get('/users', (req, res) => {
    // Checks if user is logged in
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN YET')
        res.render('login', { title: 'Login' })
    } else {
        console.log('User: ', req.session.username)

        // Checks if user has access to users page
        if (req.session.username != 'admin') {
            res.render('dashboard', { title: 'Dashboard', user: req.session.username });
        } else {
            User.countDocuments({}, (error, num) => {
                if (error) {
                    console.log('There was a problem retrieving the properties from the database')
                    console.log(error)
                } else {
                    console.log('Number of users: ' + num)
                }
            })

            User.find({}, (error, users) => {
                if (error) {
                    console.log('There was a problem retrieving the properties from the database')
                    console.log(error)
                } else {
                    res.render('users', {
                        users: users,
                        title: 'Users',
                        user: req.session.username
                    })
                }
            })
        }
    }
})

app.get('/tokens', (req, res, next) => {
    // Checks if user is logged in
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN YET')
        res.render('login', { title: 'Login' })
    } else {
        console.log('User: ', req.session.username)
        res.render('tokens', { title: 'Property Tokens', user: req.session.username })
    }
})

app.post('/create-property', (req, res) => {
    if (req.session.username) {
        console.log('Achamos a sessão em create-property!')
        console.log(req.session.username)
    }

    var data = req.body

    var imageFile = req.files.propertyImage

    imageFile.mv('public/uploads/' + imageFile.name, (error) => {
        if (error) {
            console.log('Couldn\'t upload the image file')
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
    }, (error, data) => {
        if (error) {
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
    res.render('404', { title: 'Page not found' })
})
// routing changes --- end

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(port, () => {
    console.log(`ELAD Demo listening on port ${port}`);
})

module.exports = app