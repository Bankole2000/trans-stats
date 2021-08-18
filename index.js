const express = require('express')
const app = express()
const port = 3000
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const Redis = require('redis');
const redisClient = Redis.createClient();

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  store: new RedisStore({
    client: redisClient,
  }),
  max: 120,
  message:
    "Too many accounts created from this IP, please try again after a minute"
});

app.use(express.json());

const { validateJSON, endPoints } = require('./middleware/validators');

app.use(validateJSON)

const transactionsController = require('./controllers/transactionsController');

app.get('/', (req, res) => {
  res.status(200).json({ message: "Welcome to the Transaction Statistics API", endPoints })
})

app.post('/transactions', apiLimiter, transactionsController.createTransaction)

app.get("/statistics", transactionsController.getStatistics)

app.delete("/transactions", transactionsController.deleteTransactions)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})