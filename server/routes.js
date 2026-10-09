import { Router } from 'express';
import { auth } from './middleware/auth.js';
import { login } from './controllers/authController.js';
import * as attendance from './controllers/attendanceController.js';
import * as users from './controllers/userController.js';

const r = Router();

r.post('/auth/login', login);

r.post('/attendance', attendance.create); // publik
r.get('/attendance', auth('pendataan', 'admin'), attendance.list);
r.delete('/attendance/:id', auth('pendataan', 'admin'), attendance.remove);

r.get('/users', auth('admin'), users.list);
r.post('/users', auth('admin'), users.create);
r.put('/users/:id', auth('admin'), users.update);
r.delete('/users/:id', auth('admin'), users.remove);

export default r;
