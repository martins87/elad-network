const createError = require('http-errors');
const express = require('express'); // ok
const path = require('path'); // ok
const cookieParser = require('cookie-parser');
// const logger = require('morgan');
const session = require('express-session'); // ok
const passport = require('passport'); // ok
require('./passport')(passport);
require('dotenv').config();
const expressValidator = require('express-validator');
var bcrypt = require('bcrypt-nodejs');
// const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const uniqid = require('uniqid');
const db = require('./db/dbConnection');

// Property MongoDB model
// const Property = require('./db/models/property')
// const User = require('./db/models/user')

// MySQL database
(async () => {
    // db.connect();
    db.connectWithPool();
})();

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

const renderErrorPage = (error, message) => {
    console.log(`${message}:`, error);
    res.render('error', {title: 'Error', message: `${message}`});
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
}));

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

app.get('/', async (req, res, next) => {
    // Checks if user is logged in
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN')
    } else {
        console.log('User: ', req.session.username)
    }

    try {
        const properties = await db.selectProperties();
        if (properties) {
            console.log('Number of properties: ', properties.length);
        }
        res.render('index', { propertiesList: properties, title: 'Properties' });
    } catch (error) {
        renderErrorPage(error, 'Error fetching properties');
    }

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
});

app.get('/total-properties', async (req, res) => {
    try {
        const properties = await db.selectProperties();
        if (properties) {
            res.status(200).send({
                'Number of properties': properties.length,
                properties: properties
            });
        } else {
            throw new Error('Error fetching properties from database');
        }
    } catch (error) {
        res.status(500).send({
            response: error.message
        });
    }
});

app.get('/reset-properties', async (req, res) => {
    try {
        const properties = await db.deleteProperties();
        if (properties) {
            res.status(200).send({
                'Number of properties': properties.length,
                properties: properties
            });
        } else {
            throw new Error('Error deleting properties');
        }
    } catch (error) {
        res.status(500).send({
            response: error.message
        });
    }
});

app.get('/total-users', async (req, res) => {
    try {
        const users = await db.selectUsers();
        if (users) {
            res.status(200).send({
                'Number of users': users.length,
                users: users
            });
        } else {
            throw new Error('Error fetching users from database');
        }
    } catch (error) {
        res.status(500).send({
            response: error.message
        });
    }
});

app.get('/login', (req, res, next) => {
    res.render('login', { title: 'Login' });
});

app.get('/logout', (req, res, next) => {
    req.session.username = undefined
    res.redirect('/')
});

app.get('/signup', (req, res, next) => {
    res.render('signup', { title: 'Signup' });
});

app.get('/success', (req, res) => {
    res.render('success')
});

app.post('/login', async (req, res) => {
    console.log('Session:');
    console.log(req.session);

    var data = req.body;

    var username = data.uname;
    var password = data.passwd;

    try {
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
                });
            } else {
                console.log('Password ' + password + ' is not valid!')
                res.render('login', {
                    title: 'Login',
                    msg: 'Wrong password'
                });
            }
        } else {
            console.log('User NOT found');
            res.render('login', {
                title: 'Login',
                msg: 'User not found'
            });
        }
    } catch (error) {
        renderErrorPage(error, 'Error on login');
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
});

app.post('/signup', async (req, res) => {
    var data = req.body;

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
        var newUser = {
            id: uniqid(),
            fullname: fullname,
            username: username,
            password: hashPassword(password)
        };
        console.log('New user:', newUser);

        try {
            // MySQL database
            const user = await db.selectUser(username);
            if (user.length > 0) {
                console.log(`User ${user[0].username} already exists`);
    
                res.render('signup', {
                    title: 'Signup',
                    msg: 'Username already taken'
                });
            } else {
                const response = await db.insertUser(newUser);
    
                if (response.length > 0) {
                    console.log('User successfully created');
        
                    res.render('success', { title: 'Successful Login' });
                } else {
                    console.log('There was an error trying to create user');
    
                    res.render('signup', {
                        title: 'Signup',
                        msg: 'There was an error trying to create user'
                    });
                }
            }
        } catch (error) {
            renderErrorPage(error, 'Error on signup');
        }

        // MongoDB database
        // User.findOne({
        //     username: username//,
        //     // password: password
        // }, (error, doc) => {
        //     if (error) {
        //         console.log('There was a problem retrieving the user from database')
        //         console.log(error)
        //     } else {
        //         if (doc) {
        //             console.log('Username already exists')
        //         } else {
        //             // record new user
        //             User.create({
        //                 fullname: fullname,
        //                 username: username,
        //                 password: hashPassword(password)
        //             }, (error, data) => {
        //                 if (error) {
        //                     console.log('There was a problem adding the user to the collection')
        //                     console.log(error)
        //                 } else {
        //                     console.log('Data successfully added to the collection:')
        //                     console.log(data)
        //                     res.render('success', { title: 'Successful Login' });
        //                 }
        //             })
        //         }
        //     }
        // })
    }
});

app.get('/dashboard', (req, res, next) => {
    // Checks if user is logged in. If not, redirects to login page.
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN');
        res.render('login', { title: 'Login' });
    } else {
        console.log('User:', req.session.username)
        res.render('dashboard', {
            title: 'Dashboard',
            user: req.session.username
        });
    }
});

app.get('/properties', async (req, res) => {
    // res.render('properties', {
    //     propertiesList: [],
    //     title: 'Properties',
    //     user: 'mock'
    // });
    // return;

    // Checks if user is logged in. If not, redirects to login page.
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN')
        res.render('login', { title: 'Login' })
    } else {
        console.log('User:', req.session.username);

        try {
            // MySQL database
            const properties = await db.selectProperties();
            console.log('Number of properties: ', properties.length);
    
            res.render('properties', {
                propertiesList: properties,
                title: 'Properties',
                user: req.session.username
            });
        } catch (error) {
            renderErrorPage(error, 'Error listing properties');
        }

        // MongoDB database
        // Property.countDocuments({}, (error, num) => {
        //     if (error) {
        //         console.log('There was a problem retrieving the properties from the database')
        //         console.log(error)
        //     } else {
        //         console.log('Number of properties: ' + num)
        //     }
        // })

        // Property.find({}, (error, properties) => {
        //     if (error) {
        //         console.log('There was a problem retrieving the properties from the database')
        //         console.log(error)
        //     } else {
        //         res.render('properties', {
        //             propertiesList: properties,
        //             title: 'Properties',
        //             user: req.session.username
        //         })
        //     }
        // })
    }
});

app.get('/properties/:id', async (req, res) => {
    // Checks if user is logged in. If not, redirects to login page.
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN');
        res.render('login', { title: 'Login' });
    } else {
        console.log('User:', req.session.username);
        var id = req.params.id;

        try {
            // MySQL database
            const property = await db.selectPropertyById(id);
            
            if (property.length > 0) {
                res.render('property', {
                    propertyName: property[0].name,
                    propertyPrice: property[0].price,
                    propertyAddress: property[0].address,
                    tokenSymbol: property[0].token_symbol,
                    totalSupply: property[0].total_supply,
                    ethPrice: property[0].eth_price,
                    propertyDescription: property[0].description,
                    propertyImage: property[0].image_filename,
                    title: 'Property',
                    user: req.session.username
                });
            }
        } catch (error) {
            renderErrorPage(error, `Error listing property #${id}`);
        }

        // MongoDB database
        // Property.findById(id, (error, foundProperty) => {
        //     if (error) {
        //         console.log("Couldn't find property with that id:")
        //     } else {
        //         // console.log('Property found:')
        //         // console.log(foundProperty)

        //         res.render('property', {
        //             propertyName: foundProperty.propertyName,
        //             propertyPrice: foundProperty.propertyPrice,
        //             propertyAddress: foundProperty.propertyAddress,
        //             tokenSymbol: foundProperty.tokenSymbol,
        //             totalSupply: foundProperty.totalSupply,
        //             ethPrice: foundProperty.ethPrice,
        //             propertyDescription: foundProperty.propertyDescription,
        //             propertyImage: foundProperty.propertyImage,
        //             title: 'Property',
        //             user: req.session.username
        //         })
        //     }
        // })
    }
});

app.get('/create', (req, res, next) => {
    // res.render('create', { title: 'Create Property', user: req.session.username });
    // return;

    // Checks if user is logged in
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN')
        res.render('login', { title: 'Login' })
    } else {
        console.log('User: ', req.session.username)

        // Checks if user has permission to create property page
        if (req.session.username != 'admin') {
            res.render('dashboard', { title: 'Dashboard', user: req.session.username });
        } else {
            res.render('create', { title: 'Create Property', user: req.session.username });
        }
    }
});

app.get('/users', async (req, res) => {
    // Checks if user is logged in
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN')
        res.render('login', { title: 'Login' })
    } else {
        console.log('User: ', req.session.username);

        // Checks if user has access to users page
        if (req.session.username != 'admin') {
            res.render('dashboard', { title: 'Dashboard', user: req.session.username });
        } else {

            try {
                // MySQL database
                const users = await db.selectUsers();
                console.log('Number of users: ', users.length);
    
                if (users.length > 0) {
                    res.render('users', {
                        users: users,
                        title: 'Users',
                        user: req.session.username
                    })
                } else {
                    // renderErrorPage();
                    // let message = 'No users were found';
                    // console.log(`${message}:`, error);
                    // res.render('404', { title: 'No users', message: `${message}.` });
                }
            } catch (error) {
                renderErrorPage(error, 'Error fetching users');
            }

            // MongoDB database
            // User.countDocuments({}, (error, num) => {
            //     if (error) {
            //         console.log('There was a problem retrieving the properties from the database')
            //         console.log(error)
            //     } else {
            //         console.log('Number of users: ' + num)
            //     }
            // })

            // User.find({}, (error, users) => {
            //     if (error) {
            //         console.log('There was a problem retrieving the properties from the database')
            //         console.log(error)
            //     } else {
            //         res.render('users', {
            //             users: users,
            //             title: 'Users',
            //             user: req.session.username
            //         })
            //     }
            // })
        }
    }
});

app.get('/tokens', (req, res, next) => {
    res.render('tokens', { title: 'Property Tokens', user: req.session.username });
    return;

    // Checks if user is logged in
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN');
        res.render('login', { title: 'Login' });
    } else {
        console.log('User: ', req.session.username);
        res.render('tokens', { title: 'Property Tokens', user: req.session.username });
    }
});

app.post('/create-property', async (req, res) => {
    // var data = req.body;
    // var imageFile = req.files.propertyImage;
    // var newProperty = {
    //     id: uniqid(),
    //     name: data.propertyName,
    //     price: data.propertyPrice,
    //     address: data.propertyAddress,
    //     token_symbol: data.tokenSymbol,
    //     total_supply: data.totalSupply,
    //     eth_price: Math.floor(+data.propertyPrice/+data.totalSupply),
    //     description: data.propertyDescription,
    //     image_filename: imageFile.name
    // };

    // console.log('New property:', newProperty);

    // imageFile.mv('public/uploads/' + imageFile.name, (error) => {
    //     if (error) {
    //         console.log('Couldn\'t upload the image file')
    //         console.log(error)
    //     } else {
    //         console.log('Image file successfully uploaded')
    //     }
    // });

    // return;

    // Checks if user is logged in. If not, redirects to login page.
    if (typeof req.session.username === 'undefined') {
        console.log('NOT LOGGED IN');
        res.render('login', { title: 'Login' });
    } else {
        var data = req.body;
        var imageFile = req.files.propertyImage;
        var newProperty = {
            id: uniqid(),
            name: data.propertyName,
            price: data.propertyPrice,
            address: data.propertyAddress,
            token_symbol: data.tokenSymbol,
            total_supply: data.totalSupply,
            eth_price: Math.floor(+data.propertyPrice/+data.totalSupply),
            description: data.propertyDescription,
            image_filename: imageFile.name
        };

        console.log('New property:', newProperty);

        try {
            // MySQL database
            const response = await db.insertProperty(newProperty);
            console.log('Response from dbConnection:', response);
    
            if (response.length > 0) {
                console.log('Property successfully listed');

                imageFile.mv('public/uploads/' + imageFile.name, (error) => {
                    if (error) {
                        console.log('Couldn\'t upload the image file')
                        console.log(error)
                    } else {
                        console.log('Image file successfully uploaded')
                    }
                });
    
                res.redirect('properties');
            } else {
                res.render('create', {
                    title: 'Create property',
                    msg: 'There was an error trying to list a property'
                });
            }
        } catch (error) {
            renderErrorPage(error, 'There was an error trying to list a property');
        }
    
        // MongoDB database
        // Property.create({
        //     propertyName: data.propertyName,
        //     propertyPrice: data.propertyPrice,
        //     propertyAddress: data.propertyAddress,
        //     tokenSymbol: data.tokenSymbol,
        //     totalSupply: data.totalSupply,
        //     ethPrice: data.ethPrice,
        //     propertyDescription: data.propertyDescription,
        //     propertyImage: imageFile.name
        // }, (error, data) => {
        //     if (error) {
        //         console.log('There was a problem adding a document to the collection')
        //         console.log(error)
        //     } else {
        //         console.log('Data successfully added to the collection')
        //         console.log(data)
        //     }
        // })
    
        // res.redirect('properties');
    }
});

app.get('*', (req, res) => {
    res.render('error', { title: 'Page not found', message: 'Oh no! Page not found.' });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});;

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    // res.render('error');
    res.render('error', { title: 'Request error', message: 'Some error ocurred.' });
});

app.listen(port, () => {
    console.log(`ELAD Demo listening on port ${port}`);
});

module.exports = app;