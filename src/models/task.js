const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
	description: {
		type: String,
		required: true,
		trim: true
	}, 
	completed: {
		type: Boolean,
		default: false
	},
	ownerId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User' //connect to User model through mongoose, since we want each task to have a user id in it
	}
}, {
	timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;