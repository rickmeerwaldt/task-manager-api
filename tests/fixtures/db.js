const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'userOne',
  email: 'user1@user1.com',
  password: '123456789',
  tokens: [{ token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET) }]
}

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: 'userTwo',
  email: 'user2@user2.com',
  password: '123456789',
  tokens: [{ token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET) }]
}

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'taskOne description',
  owner: userOne._id
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'taskTwo description',
  completed: true,
  owner: userOne._id
}

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'taskThree description',
  completed: true,
  owner: userTwo._id
}

const setupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();

}

module.exports = { userOne, userTwo, taskThree, userOneId, setupDatabase, taskOne }