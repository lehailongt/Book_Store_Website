import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import bookRouter from './routes/bookRouter.js';
import userRouter from './routes/userRouter.js';
import adminRouter from './routes/adminRouter.js';
import cartRouter from './routes/cartRouter.js';
import orderRouter from './routes/orderRouter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Book Management API',
            version: '1.0.0',
            description: 'API quản lý hệ thống sách',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Bearer token for admin endpoints',
                },
            },
        },
    },
    apis: [
        './src/routes/userRouter.js',
        './src/routes/bookRouter.js',
        './src/routes/cartRouter.js',
        './src/routes/orderRouter.js',
        './src/routes/adminRouter.js',
        './src/routes/adminMetricRouter.js',
        './src/routes/adminUserRouter.js',
        './src/routes/adminBookRouter.js',
        './src/routes/adminCategoryRouter.js',
        './src/routes/adminOrderRouter.js',
    ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());

// Setup multer for file uploads to frontend/images/books/
const uploadDir = path.join(__dirname, '../../frontend/images/books');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-temp${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
        }
    }
});

app.locals.upload = upload;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Serve static files from frontend images directory
app.use('/images', express.static(path.join(__dirname, '../../frontend/images')));

app.use('/api/admin', adminRouter);
app.use('/api/books', bookRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api', userRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Book Management API. Go to /api-docs for documentation.');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
});
