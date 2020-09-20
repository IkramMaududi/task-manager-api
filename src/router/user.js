const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router();

// create a new user (sign up)
router.post('/users', async (req,res) => {
	// req.body is the requested body that is provided by the client in a http method   
	const user = new User(req.body); // the userSchema from user.js model is instantiated here
	try {
		await user.save(); // save with 8 layer hash using bcriptjs
		const token = await user.generateAuthToken();
		res.status(201).send({user, token});
	} catch(e) {
		res.status(400).send(e);
	};
});

// user login
router.post('/users/login', async (req,res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();
		res.send({user: user.getPublicProfile(), token});
	} catch(e) {
		res.status(400).send();
	}
});

// user logout from current session
router.post('/users/logout', auth, async (req, res) => {
	try {
		// filter the user tokens array (req.user.tokens), so that it excludues the token (req.token) from the current session
		req.user.tokens = req.user.tokens.filter(item => item.token !== req.token);
		await req.user.save();
		res.send();
	} catch(e) {
		res.status(500).send();
	}
});

// user logout from all session
router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send();
	} catch(e) {
		res.status(500).send();
	}
});

// send the current user's profile 
router.get('/users/me', auth, async (req,res) => {
	res.send(req.user);
});

// find a specific user by id
router.get('/users/:id', async (req,res) => {
	// req.params is an object of 'id' property and 'its value'
	const _id = req.params.id; 
	try {
		const user = await User.findById(_id);
	 	if(!user){
	 		return res.status(404).send()
	 	};		
		res.send(user);
	} catch(e) {
		res.status(500).send();
	};
});

// update a specific user by id
router.patch('/users/:id', async (req,res) => {
	// decide wheater the property name is available for update (cannot update a non-existing property)
	const updates = Object.keys(req.body);
	const allowedUpdates = ['name', 'email', 'password', 'age'];
	const isValidOperation = updates.every( item => allowedUpdates.includes(item) );
	if (!isValidOperation) {
		return res.status(400).send({error: 'Invalid updates!'})
	};

	try {
		/* Parameter used in findByIdAndUpdate:
		1.id ---- req.params.id (a specific valid id)
		2.update ---- req.body (requested sent body)
		3.options --- create a new user (with different id) and validate it
		const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});*/

		const user = await User.findById(req.params.id);
		updates.forEach( item => user[item] = req.body[item] );
		await user.save();

		// case 1: no user to update with that specific id
		if (!user) {
			return res.status(404).send()
		};

		// case 2: user update went well
		res.send(user);

	} catch(e) {
		// case 3: update went wrong (server issue or validation issue), for this case we focus on the validation issue
		res.status(400).send(e)
	};
});

// delete a specific user by id
router.delete('/users/:id', async (req,res) => {
	try {
		const delUser = await User.findByIdAndDelete(req.params.id);
		if (!delUser) {
			return res.status(404).send()
		};
		res.send(delUser);
	} catch(e) {
		res.status(500).send(e);
	}
});

module.exports = router;