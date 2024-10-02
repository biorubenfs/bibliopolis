// /* eslint-disable @typescript-eslint/no-floating-promises */

// import { after, before, describe, it } from 'node:test'
// import App from '../app.js'
// import assert from 'node:assert'
// import adminsDao from '../resources/admins/admins.dao.js'
// import config from '../config.js'
// import mongo from '../mongo.js'

// describe('init app', async () => {
//   const app = new App()
//   before(async () => {
//     await app.start()
//   })

//   after(async () => {
//     await app.stop()
//   })

//   it('healthcheck', async () => {
//     const result = await fetch('http://localhost:3000/', {
//       method: 'GET'
//     })

//     assert.strictEqual(result.status, 200)
//   })

//   it('replica set should have been established', async () => {
//     const db = mongo.client.db('admin')
//     const admin = db.admin()
//     const status = await admin.replSetGetStatus()
//     const primary = status.members.filter((m: any) => m.stateStr === 'PRIMARY') as any[]
//     const secondary = status.members.filter((m: any) => m.stateStr === 'SECONDARY') as any[]
//     assert.strictEqual(primary.length, 1)
//     assert.strictEqual(secondary.length, 2)
//   })

//   it('default admins should have been created', async () => {
//     const res = await adminsDao.collection.findOne({ name: config.defaultAdmin.name })

//     assert.notEqual(res, null)
//     assert.equal(res?.name, config.defaultAdmin.name)
//   })
// })
