const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({ name: 'test', email: 'test@test.com', password: 'testingit' })
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      name: 'test'
    },
    token: user.tokens[0].token
  })

  expect(user.password).not.toBe('testingit')
})

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({ email: userOne.email, password: userOne.password })
    .expect(200);

  const user = await User.findById(response.body.user._id);
  expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async () => {
  await request(app)
    .post('/users/login')
    .send({ email: 'random', password: userOne.password })
    .expect(500);
})

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
})

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
})

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
})

test('Should not delete account for unauthorized user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
})

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/philly.jpg')
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
})

test('Should update user data', async () => {
  await request(app)
    .patch('/users/me/')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ name: 'newName' })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toBe('newName');
})

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me/')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ wrong: 'unable' })
    .expect(400);
})