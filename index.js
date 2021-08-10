const express = require('express')
const app = express()
const port = 3000

app.use(express.json());

const { validateJSON, endPoints } = require('./middleware/validators');

app.use(validateJSON)

const transactionsController = require('./controllers/transactionsController');

app.get('/', (req, res) => {
  res.status(200).json({ message: "Welcome to the Transaction Statistics API", endPoints })
})

app.post('/transactions', transactionsController.createTransaction)

app.get("/statistics", transactionsController.getStatistics)

app.delete("/transactions", transactionsController.deleteTransactions)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})