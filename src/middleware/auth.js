const jwt = require('jsonwebtoken');
const User = require('../models/user');

/*
1. look for header that the user provides (auth token)
2. validates the header 
3. find the associated user
4. if the user can't be found, throw an error
5. let route handler's job easier by adding a new property in req object, the user that's been found and the token authorized 
6. if sth wrong happens, throw an error
*/
const auth = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', ''); 
		const decoded = jwt.verify(token, process.env.JWT_SECRET); 
		const user = await User.findOne({_id:decoded._id, 'tokens.token': token}); 
		if(!user) {throw new Error() }; 
		req.token = token;
		req.user = user; 
		next();
	} catch (e) {
		res.status(401).send({error: 'Please authenticate!'});
	};
};

module.exports = auth;