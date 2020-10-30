const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

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
	}],
	avatar: {
		type: Buffer
	}
}, {
	timestamps: true
});

/*
** create a virtual field (tasks), a field that is not stored in the database, called tasks to the userSchema model
** localField is where the local data is stored
** the foreignField is the name on the ref, so the ownerId field is on the Task model
*/
userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'ownerId'
});

/*
** instance method - we add our own instance method which is available to document
** the 1st line : 
	we use built in method - Document.prototype.toJSON()
	here we omit few thing before we send back the user document
		^ the password because we want to hide private data 
		^ all the tokens generated because it isn't really needed
		^ the profile picture because the binary form of it is so large
	this happens automatically without we calling it :
		^ res.send(Object) will automatically do JSON.stringify(Object) behind the scene
		^ Object.toJSON() will be called beforehand, and this can be from express or mongoose, but for this case it is from mongoose
** the 2nd line: add a method to add a new token each time a user login and save that to the database;
*/
userSchema.methods.toJSON = function() {
	const userObject = this.toObject();
	delete userObject.password;
	delete userObject.tokens;
	delete userObject.avatar;
	return userObject;
};
userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET); //specify what to include in token
	user.tokens = user.tokens.concat({token});
	await user.save();
	return token;
}; 


/*
** statics methods - we add our own static method which is available to the model
** this method is the verification logic for login
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


/*
** this is mongoose middleware - it uses schema.prototype.pre() and its function is to define a pre hook to the document
** the 1st line: hash the password using 8 layers with the help of bcryptjs before saving it to the database
** the 2nd line: delete all tasks related to a certain user when that user is deleted from the database
*/
userSchema.pre('save', async function (next) {
	const user = this;
	if (user.isModified('password')) { //isModified('password') will be true when the user is first created, and when the password is updated later
		user.password = await bcrypt.hash(user.password, 8);
	};
	next();
});
userSchema.pre('remove', async function (next) {
	const user = this;
	await Task.deleteMany({ ownerId: user._id });
	next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;