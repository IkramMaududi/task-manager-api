const express = require('express');
const Task = require('../models/task');
const router = new express.Router();


// create a specific taks with body content
router.post('/tasks', async (req,res) => {
	const task = new Task(req.body);
	try {
		await task.save();
		res.status(201).send(task);
	} catch(e) {
		res.status(400).send(e);
	};
});

// find all tasks
router.get('/tasks', async (req,res) => {
	try {
		const tasks = await Task.find({});
		res.send(tasks);
	} catch(e) {
		res.status(500).send();
	};
});

// find a specific task by id
router.get('/tasks/:id', async (req,res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findById(_id);
	 	if(!task) {
	 		return res.status(404).send()
	 	};
	 	res.send(task);
	} catch(e) {
		res.status(500).send();
	};

});

// update a specific task by id
router.patch('/tasks/:id', async (req,res) => {
	// check for valid update property
	const updates = Object.keys(req.body);
	const allowedUpdates = ['description', 'completed'];
	const isValidOperation = updates.every( item => allowedUpdates.includes(item) );
	if (!isValidOperation) {
		return res.status(404).send({error: 'Invalid updates!'})
	};

	try {
		// create the function to find the user by id		
		const task = await Task.findByIdAndUpdate(
			req.params.id,
			req.body,
			{new: true, runValidators: true}
			);

		// case 1: no task with that id found 
		if (!task) {
			return res.status(404).send()
		};

		//case 2: task update went well
		res.send(task);
	} catch(e) {
		// case 3: update went wrong (validation issue)
		res.status(400).send(e);
	}
});

// delete a specific task by id
router.delete('/tasks/:id', async (req,res) => {
	try {
		const delTask = await Task.findByIdAndDelete(req.params.id);
		if (!delTask) {
			return res.status(404).send()
		};
		res.send(delTask);
	} catch(e) {
		res.status(500).send(e);
	}
});


module.exports = router;