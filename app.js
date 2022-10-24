
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const Razorpay = require('razorpay');

dotenv.config();
let app = express();

const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
});

// Middlewares

app.use(cors());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
)
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
// app.use('/public', express.static('public'));
app.set("views", "views");


// Routes
// app.get('/payments', (req, res) => {
//   res.render('payment', { key: process.env.KEY_ID });
// })

app.get('/', (req, res) => {
  res.render('payment', { key: process.env.KEY_ID });
})

app.post('/api/payment/order', (req, res) => {
  params = req.body;
  instance.orders.create(params).then((data) => {
    res.send({ sub: data, status: 'success' });
  }).catch((error) => {
    res.send({ sub: error, status: 'failed' })
  })
});

app.post('/api/payment/verify', (req, res) => {
  body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

  var expectedSignature = crypto.createHmac('sha256', process.env.key_secret).update(body.toString()).digest('hex');
  var response = { status: 'failure' };
  if (expectedSignature === req.body.razorpay_signature) {
    res.redirect(
      `https://paymentsuccess.netlify.app/`
    );
    response = { status: 'success', message: "Payment has been verified" };
  }
  else {
    response = { status: 'failure', message: "Payment verification failed" };
  }
  res.send(response);
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('App started on server 3000');
})
