module.exports.validateJSON = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(err);
    return res.status(400).json({ success: false, status: 400, message: err.message }); // Bad request
  }
  next();
}

module.exports.endPoints = [
  {
    name: "Home",
    path: "/",
    method: "GET",
    description: "Welcome Route. API Overview",
    data: null,
    sampleResponse: null,
  },
  {
    name: "Create Transaction",
    path: "/transactions",
    method: "POST",
    description: "Create a new Transaction",
    data: {
      fields: [
        {
          name: "amount",
          type: "string",
          description: "Transaction amount - A numerical string of arbitrary length that is parsable as a BigDecimal",
        },
        {
          name: "timestamp",
          type: "dateTime",
          description: "transaction time in the ISO 8601 format YYYY-MM-DDThh:mm:ss.sssZ in the UTC timezone (this is not the current timestamp)"
        }
      ],
      example: {
        "amount": "12.3343",
        "timestamp": "2018-07-17T09:59:51.312Z"
      }
    },
    sampleResponse: null,
  },
  {
    name: "Get Statistics",
    path: "/statistics",
    method: "GET",
    description: "Returns the statistics based on the transactions that happened in the last 60 seconds. It executes in constant time and memory (O(1)).",
    data: null,
    sampleResponse: {
      "sum": "1000.00",
      "avg": "100.53",
      "max": "200000.49",
      "min": "50.23",
      "count": 10
    }
  },
  {
    name: "Delete Transactions",
    path: "/transactions",
    method: "DELETE",
    description: "Delete all transactions",
    data: null,
    sampleResponse: {}
  }
]