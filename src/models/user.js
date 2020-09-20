const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email is invalid');
			}
		}
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 7,
		validate(value) {
			if (value.toLowerCase().includes('password')) {
				throw new Error('Do not include a string of "password" in your password');
			}
		}
	},
	age: {
		type: Number,
		default: 0,
		validate(value) {
			if (value < 0) {
				throw new Error('Age must be a positive number');
			}
		}
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}]
});


/** this methods are available on instances, sometimes called instance method 
*this method adds a new token for each time a user login and save that to the database;
*/
userSchema.methods.getPublicProfile = function() {
	const userObject = this.toObject();
	delete userObject.password;
	delete userObject.tokens;
	return userObject;
};

userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, 'ssssh'); //specify what to include in token
	user.tokens = user.tokens.concat({token});
	await user.save();
	return token;
}; 


/*statics methods are accessible on the model, sometimes called model methods
this method is the verification logic for login
*/
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({email});
	if (!user) {
		throw new Error('Unable to login')
	};
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error('Unable to login')
	};
	return user;
};


// (middleware) hash the password using 8 layers with the help of bcryptjs before saving
userSchema.pre('save', async function (next) {
	const user = this;
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	};
	next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;