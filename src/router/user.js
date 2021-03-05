const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
// const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

const router = new express.Router();

/*
** create a new user (sign up)
** req.body is the requested body that is provided by the client in a http method   
** the userSchema from user.js model is then instantiated
** afterwards, the user is saved, and before saving the pre hook is called to bcript the password
** then the user is given authentication token 
*/
router.post(
	'/users', 
	async (req,res) => {
		const user = new User(req.body); 
		// sendWelcomeEmail(user.email, user.name);
		try {
			await user.save(); 
			const token = await user.generateAuthToken();
			res.status(201).send({user, token});
		} catch(e) {
			res.status(400).send(e);
		};
	}
);

/*
** user login
** email and password must be included in the request body
** if it works, then the token is genereated, else error will be send
*/
router.post(
	'/users/login', 
	async (req,res) => {
		try {
			const user = await User.findByCredentials(req.body.email, req.body.password);
			const token = await user.generateAuthToken();
			res.send({user, token});
		} catch(e) {
			res.status(400).send();
		};
	}
);

/*
** user logout from current session
** filter the user tokens array (req.user.tokens), so that it excludues the token (req.token) from the current session
*/
router.post(
	'/users/logout', 
	auth, 
	async (req, res) => {
		try {
			req.user.tokens = req.user.tokens.filter(item => item.token !== req.token);
			await req.user.save();
			res.send();
		} catch(e) {
			res.status(500).send();
		};
	}
);

// user logout from all session
router.post(
	'/users/logoutAll', 
	auth, 
	async (req, res) => {
		try {
			req.user.tokens = [];
			await req.user.save();
			res.send();
		} catch(e) {
			res.status(500).send();
		};
	}
);

// send the current user's profile 
router.get(
	'/users/me', 
	auth, 
	async (req,res) => {res.send(req.user);}
);

/*
** update a specific user by id
** decide wheater the property is available for update (cannot update a non-existing property)
*/
router.patch(
	'/users/me', 
	auth, 
	async (req,res) => {
		const updates = Object.keys(req.body);
		const allowedUpdates = ['name', 'email', 'password', 'age'];
		const isValidOperation = updates.every( item => allowedUpdates.includes(item) );
		if (!isValidOperation) return res.status(400).send({error: 'Invalid updates!'});
		try {
			updates.forEach( item => req.user[item] = req.body[item] );
			await req.user.save();
			res.send(req.user);
		} catch(e) {
			res.status(400).send(e);
		};
	}
);

// delete a specific user by id
router.delete(
	'/users/me', 
	auth, 
	async (req,res) => {
		try {
			await req.user.remove();
			// sendCancelationEmail(req.user.email, req.user.name);
			res.send(req.user);
		} catch(e) {
			res.status(500).send(e);
		};
	}
);

/*upload avatar
** req.file comes from multer library, it's available when dest option is not used
*/
const upLoad = multer({ 
	limits: {fileSize: 1000000},
	fileFilter(req, file, cb) {
		if ( !file.originalname.match(/\.(jpg|jpeg|png)$/) ) {
			return cb(new Error('Please upload an image with png, jpg, or jpeg file extensions'));
		};
		cb (null, true);
	}
});
router.post(
	'/users/me/avatar', 
	auth,
	upLoad.single('avatar'), 
	async (req, res) => { 
		const buffer = await sharp(req.file.buffer).resize({ width: 300, height: 300 }).png().toBuffer();
		req.user.avatar = buffer;
		// console.log(req.file.buffer);
		// console.log(buffer);
		await req.user.save();
		res.send(); 
	},
	(error, req, res, next) => { res.status(400).send({ error: error.message }) }
);


// delete avatar
router.delete(
	'/users/me/avatar',
	auth,
	async (req, res) => {
		req.user.avatar = undefined;
		await req.user.save();
		res.send();
	}
);

// show avatar 
router.get(
	'/users/:id/avatar',
	async (req, res) => {
		try {
			const user = await User.findById(req.params.id);
			if (!user || !user.avatar) throw new Error();
			res.set('Content-Type', 'image/png');
			res.send(user.avatar);
		} catch(e) {
			res.status(404).send();
		};
	}
);

module.exports = router;