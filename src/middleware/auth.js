const jwt =require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', ''); //looking for header that the user provides
		const decoded = jwt.verify(token, 'ssssh'); //validates the header
		const user = await User.findOne({_id:decoded._id, 'tokens.token': token}); //find the associated user
		if(!user) {
			throw new Error()
		};
		req.token = token; // add a property of token to the req object to make further process easier
		req.user = user; //let route handler's job easier by providing the user that's been found by adding a new property in req object
		next();
	} catch (e) {
		res.status(401).send({error: 'Please authenticate!'});
	};
};

module.exports = auth;