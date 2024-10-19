import { Server } from 'socket.io';

let io; // Önce 'io' değişkenini tanımlıyoruz

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:5173'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('[Socket] Yeni bir kullanıcı bağlandı:', socket.id);

        // Doktor odasına katılma
        socket.on('joinDoctorRoom', (doctorId) => {
            socket.join(`doctor_${doctorId}`);
            console.log(`[Socket] ${socket.id} doctor_${doctorId} odasına katıldı`);
        });

        // Belirli bir tarihi izleme
        socket.on('watchDate', ({ doctorId, date }) => {
            socket.join(`doctor_${doctorId}_date_${date}`);
            console.log(`[Socket] ${socket.id} doctor_${doctorId}_date_${date} odasına katıldı`);
        });

        // İzlemeyi bırakma
        socket.on('unwatchDate', ({ doctorId, date }) => {
            socket.leave(`doctor_${doctorId}_date_${date}`);
            console.log(`[Socket] ${socket.id} doctor_${doctorId}_date_${date} odasından ayrıldı`);
        });

        // Doktor odasından ayrılma
        socket.on('leaveDoctorRoom', (doctorId) => {
            socket.leave(`doctor_${doctorId}`);
            console.log(`[Socket] ${socket.id} doctor_${doctorId} odasından ayrıldı`);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Bir kullanıcı bağlantıyı kesti:', socket.id);
        });
    });

    return io;
};

export { io }; // 'io' artık tanımlandığı için export edilebilir
