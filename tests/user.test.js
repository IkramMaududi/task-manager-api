const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user');

/*
** Create a user manually
** Each time the test runs, deletes all inside the database and recreate it
 */
const userOneId = new mongoose.Types.ObjectId();
const userOne = {
	_id: userOneId,
	name: 'Max',
	email: 'max@hotmail.com',
	password: '443fwhoo',
	tokens: [{ token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET) }]	
};
beforeEach( async () => {
	await User.deleteMany();
	await new User(userOne).save();
});


// sign-up 
test('Should sign up a new user',
	async () => {
		const response = await request(app).post('/users').send({
			name: 'Kohaku',
			email: 'kohaku@naraku.com',
			password: 'kohaku1234%',
		}).expect(201);

		// assert that the database was changed correctly
		const user = await User.findById(response.body.user._id);
		expect(user).not.toBeNull();

		// assertion about the response
		expect(response.body).toMatchObject({
			user: {
				name: 'Kohaku',
				email: 'kohaku@naraku.com',
			},
			token: user.tokens[0].token
		});
		expect(user.password).not.toBe('kohaku1234%');
	}
);

// log-in (success & fail)
test('Should login an existing user', 
	async () => {
		const { name, email, password } = userOne;
		const response = await request(app).post('/users/login').send({
			name,
			email,
			password
		}).expect(200);

		// fetch user from the database
		const user = await User.findById(response.body.user._id);
		expect(user).not.toBeNull();

		// assert that token in response match the 2nd token
		expect(response.body.token).toMatch( user.tokens[1].token );
	}
);
test('Should not login a non-existing user', 
	async () => {
		const { name, email, password } = userOne;
		await request(app).post('/users/login').send({
			name,
			email,
			password: 'afraa4444'
		}).expect(400);
	}
);

// read profile
test('Should get profile for a user',
	async () => {
		await request(app).get('/users/me')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
			.send()
			.expect(200);
	}
);

// delete user (success & fail)
test('Shuld delete account',
	async () => {
		const response = await request(app).delete('/users/me')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
			.send()
			.expect(200);

		// fetch user from database & expect it to be null
		const user = await User.findById(userOne._id);
		expect(user).toBeNull();
	}
);
test('Should not delete account for unauthorized user',
	async () => {
		await request(app).delete('/users/me')
			.send()
			.expect(401);
	}
);