require('dotenv').config();
// Connect db
const dbSingleton = require('./untils/db'); // Import MongoDBSingleton

const express = require('express');
const cors = require('cors');
const app = express();
const upload = require('./untils/multer');
const productsRouter = require('./routers/productsRoute');
const authRouter = require('./routers/authRoute');
const userRouter = require('./routers/userRoute');
const ordersRouter = require('./routers/ordersRoute');
const codeRouter = require('./routers/codeRoute');
const tnRouter = require('./routers/tnRoute');
const postRouter = require('./routers/postRoute');
const bankRouter = require('./routers/bankRoute');
const revenueRoutes = require('./routers/revenueRoutes');
const { checkCurrentUser } = require('./middleware/checkCurrentUser'); // Import middleware
// Cors
var corsOptions = {
  origin: [
    `${process.env.REACT_APP_USER_URL}`,
    `${process.env.REACT_APP_ADMIN_URL}`,
    'http://localhost:3000',
    'http://localhost:3006',
  ],
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Not found router
app.use('/', function (req, res, next) {
  console.log('Backend is working!');
});

// Mount the router
app.use('/api/products', upload.array('image'), productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', upload.array('userImage'), userRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/code', codeRouter);
app.use('/api/tn', tnRouter);
app.use('/api/post', upload.array('postImage'), postRouter);
app.use('/api', bankRouter);
app.use('/api/revenue', revenueRoutes);

// Use middleware
app.use(checkCurrentUser);

// Not found router
app.use('*', function (req, res, next) {
//   console.log('not found');
// });

// MongoDB connection
dbSingleton.connect().then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`server running on port ${port}`);
  });
});

// Test route
app.get('/api/test', (req, res) => {
  if (req.user) {
    res.json({ status: 'success', message: 'User is authenticated', user: req.user });
  } else {
    res.json({ status: 'failed', message: 'User is not authenticated' });
  }
});