const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendGoobyeEmail } = require('../emails/account');
const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) return cb(new Error('Please provide a .jpg, .jpeg or .png file'))
    cb(undefined, true);
  }
})

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateToken();
    res.send({ user, token });
  } catch (e) {
    return res.status(500).send(e.message)
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    return res.status(500).send(e.message)
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    return res.status(500).send(e.message)
  }
})

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    const response = await user.save();
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateToken();
    res.status(201).send({ response, token })
  } catch (e) {
    res.status(500).send(e.message)
  }
})


router.patch('/users/me', auth, async (req, res) => {
  const toUpdate = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'age', 'password'];
  const canBeUpdated = toUpdate.every(value => allowedUpdates.includes(value))
  if (!canBeUpdated) return res.status(400).send('Some of the fields can not be updated. Possible are: description and completed')

  try {
    toUpdate.forEach((update) => req.user[update] = req.body[update])
    await req.user.save();
    res.send(req.user)
  } catch (e) {
    res.status(500).send(e);
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    sendGoobyeEmail(req.user.email, req.user.name)
    return res.send(req.user);
  } catch (e) {
    return res.status(500)
  }
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) throw new Error()

    res.set('Content-Type', 'image/png').send(user.avatar)
  } catch (e) {
    res.status(404).send();
  }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = buffer;
  await req.user.save();
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send()
})

module.exports = router;