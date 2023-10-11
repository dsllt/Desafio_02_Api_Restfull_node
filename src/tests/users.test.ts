import { execSync } from "child_process"
import { app } from "../app"
import request from 'supertest'
import {afterAll, beforeAll, describe, expect, test} from 'vitest'


describe('User routes', () => {
  beforeAll(async () => {
    await app.ready()
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })
  
  afterAll(async () => {
    await app.close()
  })

  test('the user can create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        "username": "rbt",
        "name": "Roberto",
        "age": 30,
        "weight": 75.4
      })
      .expect(201)
  })
  test('the user can access its data', async () => {
    const username = "rbt";
    await request(app.server)
      .post('/users')
      .send({
        "username": username,
        "name": "Roberto",
        "age": 30,
        "weight": 75.4
      })

    const users = await request(app.server)
    .get('/users')
    .expect(200)

    const id = users.body.users.find((user: any) => user.username === username).id
    
    const getUserResponse = await request(app.server)
      .get(`/users/${id}`)
      .expect(200)
    
    expect(getUserResponse.body.user).toEqual(
      expect.objectContaining({
        username: 'rbt',
        name: "Roberto",
        age: 30,
        weight: 75.4
      })
    )
  })
})