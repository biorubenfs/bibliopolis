import App from './app.js'

try {
  await new App().start()
} catch (error) {
  console.log(error)
}
