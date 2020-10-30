const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();


// create a specific taks with body content that we've found after the authentication works
router.post(
	'/tasks', 
	auth, 
	async (req,res) => {
		const task = new Task({
			...req.body,
			ownerId: req.user._id
		});
		try {
			await task.save();
			res.status(201).send(task);
		} catch(e) {
			res.status(400).send(e);
		};
	}
);

/*
** find all task for a specific user after filtering using query string. The following are queries we can use:
	^ GET /tasks?completed=true 
	^ GET /task?limit=10&skip=20
	^ GET /task?sortBy=createdAt:desc or /task?sortBy=createdAt:asc, we can use _ instead of : after createdAtf
** Here we use populate, since we our user documents  don't have task document in it.
	^ populate() lets you reference documents in other collections.
	^ Population is the process of automatically replacing the specified paths in the document with document(s) from other collection(s). 
	^ We may populate a single document, multiple documents, a plain object, multiple plain objects, or all objects returned from a query.
** Inside the populate method, we specify the path and the filter we use
*/
router.get(
	'/tasks', 
	auth, 
	async (req,res) => {
		const match = {};
		const sort = {};
		if (req.query.completed) match.completed = req.query.completed === 'true';
		if (req.query.sortBy) {
			const part = req.query.sortBy.split(':') ;
			sort[part[0]] = part[1] === 'desc' ? -1 : 1;
		};
		try {
			await req.user.populate({
				path: 'tasks',
				match,
				options: {
					limit: parseInt(req.query.limit),
					skip: parseInt(req.query.skip),
					sort
				}
			}).execPopulate();
			res.send(req.user.tasks);
			res.send(tasks);
		} catch(e) {
			res.status(500).send();
		};
	}
);

// find a specific task by id
router.get(
	'/tasks/:id', 
	auth, 
	async (req,res) => {
		const _id = req.params.id;
		try {
			const task = await Task.findOne({_id, ownerId: req.user._id});
		 	if(!task) return res.status(404).send();
		 	res.send(task);
		} catch(e) {
			res.status(500).send();
		};
	}
);

// update a specific task by id
router.patch(
	'/tasks/:id', 
	auth, 
	async (req,res) => {
		// check for valid update property
		const updates = Object.keys(req.body);
		const allowedUpdates = ['description', 'completed'];
		const isValidOperation = updates.every( item => allowedUpdates.includes(item) );
		if (!isValidOperation) return res.status(404).send({error: 'Invalid updates!'});
		try {
			const task = await Task.findOne({_id: req.params.id, ownerId: req.user._id});
			if (!task) return res.status(404).send();
			updates.forEach( item => task[item] = req.body[item] );
			await task.save();
			res.send(task);
		} catch(e) {
			res.status(400).send(e);
		};
	}
);

// delete a specific task by id
router.delete(
	'/tasks/:id', 
	auth, 
	async (req,res) => {
		try {
			const delTask = await Task.findOneAndDelete({_id: req.params.id, ownerId: req.user._id});
			if (!delTask) return res.status(404).send();
			res.send(delTask);
		} catch(e) {
			res.status(500).send(e);
		};
	}
);

module.exports = router;