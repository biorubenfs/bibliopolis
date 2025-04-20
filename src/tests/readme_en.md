# 🧪 Test Architecture with In-Memory MongoDB

This project uses [`mongodb-memory-server`](https://github.com/nodkz/mongodb-memory-server) to run integration tests against an in-memory MongoDB instance. This allows testing without needing to spin up a real MongoDB server and improves environment isolation.

---

## 🔍 Justification

### Why isn’t it enough to just call `mongo.start()` in the global setup?

When using Vitest (or similar frameworks) with `globalSetup`, that code runs in a **separate process** from the one that will run the tests. This means:

- Even if you import the `mongo` singleton in `global-setup.ts` and call `mongo.start()`, **that instance lives in a process that terminates** once the global setup ends.
- Later, when tests begin, Vitest runs each test (or group of tests) in a new **independent process**. In this new process, even if you import the same `mongo` module, it’s a **new instance of the singleton** (because it’s evaluated from scratch).

> 💡 In Node.js, singletons are **not shared** across processes. Every `import` in a new process creates its own version of the module.

So, if shared state isn’t managed properly, you’ll encounter errors like:

```
TypeError: Cannot read properties of undefined (reading 'db')
```

This happens because the connection created during `mongo.start()` in `global-setup` no longer exists when the tests run.

---

## 🧠 What’s the solution and how does it work?

We split the responsibility into two phases:

### 1. `global-setup.ts` (one-time phase before tests run)
- Starts **a single instance** of `mongodb-memory-server`.
- Connects for the first time using a singleton `Mongo` instance.
- Saves the temporary database URI to a `.test-mongo-uri` file.
- Boots the application server so real endpoints can be tested.

When this phase ends, the process exits. However, the `mongodb-memory-server` keeps running in the background.

### 2. `setup-tests.ts` (per Vitest worker, runs once per test process)
- Reads the URI from the `.test-mongo-uri` file.
- Reuses the URI to connect to the Mongo instance created earlier via `mongo.start()`.
- This avoids spinning up a new Mongo instance for every test file.

This way:
- We reuse the **same in-memory database instance**.
- But each test process has its **own MongoClient connection** pointing to the same URI.
- We avoid launching multiple `mongodb-memory-server` instances, which is slow.

---

> **IMPORTANT NOTE**: Each process (global setup, Vitest workers) has its own instance of the `Mongo` singleton, because Node.js doesn’t share memory between processes. That’s why it’s essential to: Save the URI to a file and Reuse it in each test worker.

## 🗂️ Visual Summary

```text
Process 1: global-setup.ts
├── Imports `mongo` (instance A of the singleton)
├── Executes `mongo.start()`:
│   ├── Starts `mongodb-memory-server`
│   └── Connects with `mongoClient` to the generated URI
├── Saves the URI to `.test-mongo-uri`
└── Process ends (connection closes,
    but `mongodb-memory-server` stays alive)

↓ Process terminates

Process 2: setup-tests.ts (one per Vitest worker)
├── Imports `mongo` (new instance B of the singleton)
├── Reads the saved URI
├── Calls `mongo.setUri(uri)`
├── Calls `mongo.start()`:
│   └── Reuses URI to connect to `mongodb-memory-server`
└── Tests can run real queries
```

## Running Tests Sequentially

By default, most test runners execute tests in parallel. This is a great idea for unit tests since it reduces test execution time. However, when testing a REST API with an in-memory database, this approach can cause many issues. For example, if each test suite spins up its own application instance and in-memory database, and the tests from each suite run in parallel, that means multiple instances of `mongodb-memory-server` (mms) are running at the same time in memory — which introduces significant load. On GitHub Actions, I've encountered issues like this:

```
Starting the MongoMemoryServer Instance failed, enable debug log for more information. Error: UnableToUnlockLockfileError: Cannot unlock file "/home/runner/.cache/mongodb-binaries/7.0.11.lock", because it is not locked by this process
```

This seems to happen because each mms instance tries to use the same cache file, leading to conflicts and ultimately causing tests to fail without any apparent reason.

To solve this issue, in addition to what was described earlier (starting only one mms instance), the tests are executed **sequentially**, and the in-memory database is purged before and after each test suite using `beforeAll` and `afterAll`.

To ensure the tests run sequentially, it was necessary to adjust the `package.json` script by adding the `--pool=forks` flag, and to update the Vitest configuration as follows:

```js
poolOptions: {
  forks: {
    singleFork: true,
  },
},
```

There may be other ways to run tests sequentially. I found this method [here](https://adequatica.medium.com/api-testing-with-vitest-391697942527).