import App from './app.js'
import config from './config.js'

try {
  await new App(config.port).start()
} catch (error) {
  console.log(error)
}
