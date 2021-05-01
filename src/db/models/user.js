// new user file for login purposes

var mongoose = require('mongoose')
// var schema = mongoose.Schema

var userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    }
})

userSchema.methods.hashPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}
  
userSchema.methods.comparePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash)
}

module.exports = mongoose.model('users', userSchema)
