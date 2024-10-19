import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import filterRoutes from './routes/filterRoutes.js';
import bodyParser from 'body-parser';
import validateFilters from './middleware/validateFilters.js';
import { rateLimitMiddleware } from './middleware/index.js';
import { initializeSocket } from './socket.js';

dotenv.config();
console.log('Ortam değişkenleri yüklendi.');

const app = express();
console.log('Express uygulaması oluşturuldu.');

const server = http.createServer(app);
console.log('HTTP sunucusu oluşturuldu.');

const io = initializeSocket(server);
console.log('Socket.io başlatıldı.');

app.use(helmet());
console.log('Helmet middleware\'i eklendi.');

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    exposedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
console.log('CORS ayarları yapıldı.');

app.use(morgan('dev'));
app.use(express.json());
app.use(rateLimitMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
console.log('Diğer middleware\'ler eklendi.');

app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
}, express.static('uploads'));
console.log('Statik dosya servisi ayarlandı.');

connectDB();

app.get('/', (req, res) => {
    console.log('Root path çağrıldı.');
    res.send('API çalışıyor!');
});

app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/filter', validateFilters, filterRoutes);
console.log('Tüm rotalar eklendi.');

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
    console.error('Hata yakalandı:', err.stack);
    res.status(500).send('Bir şeyler yanlış gitti!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
    console.log(`Socket.io aynı portta (${PORT}) dinliyor.`);
});