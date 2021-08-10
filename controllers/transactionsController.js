const Redis = require('redis');
const redisClient = Redis.createClient();

const DEFAULT_EXPIRATION = 60;

let transactions, recentTransactions, statistics;

module.exports.createTransaction = async (req, res) => {
  let { amount, timestamp } = req.body;
  if (!Number(amount)) {
    return res.status(422).json({ success: false, message: "Invalid Amount" })
  }
  if (!Date.parse(timestamp) || Date.now() < Date.parse(timestamp)) {
    return res.status(422).json({ success: false, message: "Invalid Timestamp" });
  }

  if (((Date.now() - Date.parse(timestamp)) / 1000) > DEFAULT_EXPIRATION) {
    // persist to more permanent storage if available
    return res.status(204).json({});
  }
  amount = Number(amount).toFixed(2);

  if (redisClient.exists('transactions')) {
    redisClient.get('transactions', (error, data) => {
      if (!error) {
        transactions = JSON.parse(data ? data : "[]");
        recentTransactions = transactions.filter((trans) => Date.parse(trans.timestamp) > (Date.now() - (1000 * DEFAULT_EXPIRATION)));
        recentTransactions.push({ amount, timestamp });
        const transAmounts = recentTransactions.map(trans => trans.amount)
        statistics = {
          sum: transAmounts.reduce((a, b) => a + b, 0),
          avg: ((transAmounts.reduce((a, b) => a + b, 0)) / transAmounts.length),
          max: Math.max(...transAmounts),
          min: Math.min(...transAmounts),
          count: transAmounts.length,
        }

        redisClient.setex('transactions', DEFAULT_EXPIRATION, JSON.stringify(recentTransactions));
        redisClient.setex('statistics', DEFAULT_EXPIRATION, JSON.stringify(statistics));
        return res.status(200).json({ success: true, message: "New transaction created", data: { amount, timestamp } });
      }
      if (error) {

        return res.status(500).json({ success: false, message: "Server Error", error })
      }
    })
  } else {

    transactions = [];
    transactions.push({ amount, timestamp });
    const transAmounts = transactions.map(trans => trans.amount)
    statistics = {
      sum: transAmounts.reduce((a, b) => a + b, 0),
      avg: ((transAmounts.reduce((a, b) => a + b, 0)) / transAmounts.length),
      max: Math.max(...transAmounts),
      min: Math.min(...transAmounts),
      count: transAmounts.length,
    }

    redisClient.setex('transactions', DEFAULT_EXPIRATION, JSON.stringify(transactions));
    redisClient.setex('statistics', DEFAULT_EXPIRATION, JSON.stringify(statistics));
    return res.status(200).json({ success: true, message: "New transaction created", data: { amount, timestamp } });
  }
}

module.exports.getStatistics = async (req, res) => {
  redisClient.get('transactions', (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, error: err, message: "There was an error" })
    }
    if (!err) {
      transactions = JSON.parse(data ? data : "[]");
      recentTransactions = transactions.filter((trans) => Date.parse(trans.timestamp) > (Date.now() - (1000 * DEFAULT_EXPIRATION)));
      const transAmounts = recentTransactions.map(trans => Number(trans.amount))
      statistics = {
        sum: transAmounts.reduce((a, b) => a + b, 0),
        avg: ((transAmounts.reduce((a, b) => a + b, 0)) / transAmounts.length),
        max: Math.max(...transAmounts),
        min: Math.min(...transAmounts),
        count: transAmounts.length,
      }
      return res.status(200).json({ success: true, statistics, message: "Transaction Statistics" })
    }
  })
}

module.exports.deleteTransactions = async (req, res) => {
  if (redisClient.exists('transactions')) {
    if (redisClient.del('transactions')) {
      return res.status(204).json({});
    } else {
      return res.status(500).json({ message: "There was an error deleting Transactions" })
    }
  } else {
    return res.status(422).json({ message: "No Transactions to delete", success: false })
  }
}