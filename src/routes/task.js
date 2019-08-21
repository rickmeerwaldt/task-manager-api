const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth')
const router = express.Router();

router.get('/tasks', auth, async (req, res) => {
  const match = {}
  const sort = {}
  const { completed, limit, skip, sortBy } = req.query;

  if (completed) match.completed = req.query.completed === 'true';

  if (sortBy) {
    const parts = sortBy.split(':');
    sort[parts[0]] = parts[1];
  }

  try {
    console.log(match)
    const tasks = await Task.find({ owner: req.user._id, ...match })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort(sort)
    res.send(tasks)
  } catch (e) {
    res.status(500).send(e);

  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    // const response = await Task.findById(id)
    const task = await Task.findOne({ _id: id, owner: req.user._id })
    if (!task) return res.status(404).send({})
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
})

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  })

  try {
    const response = await task.save()
    res.status(201).send(response)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const toUpdate = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const canBeUpdated = toUpdate.every(value => allowedUpdates.includes(value))
  if (!canBeUpdated) return res.status(400).send('Some of the fields can not be updated. Possible are: description and completed')

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
    if (!task) return res.status(404).send()

    toUpdate.forEach((update) => task[update] = req.body[update]);
    await task.save();
    res.send(task)
  } catch (e) {
    res.status(500).send(e);
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).send();
    return res.send(task);
  } catch (e) {
    return res.status(500)
  }
})

module.exports = router;