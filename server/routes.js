import { Router } from 'express';
import { auth } from './middleware/auth.js';
import { changePassword, login } from './controllers/authController.js';
import * as attendance from './controllers/attendanceController.js';
import * as users from './controllers/userController.js';

const r = Router();

r.post('/auth/login', login);
r.put('/auth/password', auth('penggembalaan'), changePassword);

r.post('/attendance', attendance.create); // publik
r.post('/attendance/:id/doa', attendance.addDoa); // publik, lihat addDoa
r.get('/attendance', auth('penggembalaan', 'admin'), attendance.list);
r.get('/attendance/count', auth('penggembalaan', 'admin'), attendance.count);
r.delete('/attendance/:id', auth('penggembalaan', 'admin'), attendance.remove);

r.get('/users', auth('admin'), users.list);
r.post('/users', auth('admin'), users.create);
r.put('/users/:id', auth('admin'), users.update);
r.delete('/users/:id', auth('admin'), users.remove);

export default r;
