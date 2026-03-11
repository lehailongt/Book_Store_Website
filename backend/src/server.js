import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bookRouter from './routes/bookRouter.js';
import userRouter from './routes/userRouter.js';
import adminRouter from './routes/adminRouter.js';
import cartRouter from './routes/cartRouter.js';
import orderRouter from './routes/orderRouter.js';
import UserModel from './models/userModel.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());

app.use('/api/books', bookRouter);
app.use('/api/admin', adminRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api', userRouter);

app.use('/', (req, res) => {
    res.send('Welcome to the Book Management API');
});

// // create tables if they don't exist
// (async () => {
//     try {
//         await UserModel.createTable();
//         console.log('User table is ready');
//     } catch (err) {
//         console.error('Error creating table', err);
//     }
// })();

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});