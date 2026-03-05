// src/controllers/userController.js
import UserModel from '../models/userModel.js';
import bcrypt from 'bcrypt';

class UserController {
    // đăng ký user mới
    static async register(req, res) {
        try {
            console.log('=== REGISTER REQUEST ===');
            console.log('Body:', req.body);
            console.log('Body keys:', Object.keys(req.body));
            
            const { full_name, email, password, date_of_birth, phone_number } = req.body;
            console.log('Extracted:', { full_name, email, password, date_of_birth, phone_number });
            console.log('Checks:', { full_name: !!full_name, email: !!email, password: !!password });
            
            if (!full_name || !email || !password) {
                console.log('❌ Missing required fields');
                return res.status(400).json({ message: 'Thiếu thông tin đăng ký' });
            }
            // kiểm tra email
            const byEmail = await UserModel.findByEmail(email);
            if (byEmail) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
            }

            const hashed = await bcrypt.hash(password, 10);
            const newUser = await UserModel.create({
                full_name,
                email,
                password: hashed,
                date_of_birth: date_of_birth || null,
                phone_number: phone_number || null
            });
            console.log('✅ User registered:', newUser);
            return res.status(201).json({ message: 'Đăng ký thành công', user: newUser });
        } catch (error) {
            console.error('❌ Register error:', error);
            return res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký' });
        }
    }

    // login
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu' });
            }
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(400).json({ message: 'Email không đúng' });
            }
            const ok = await bcrypt.compare(password, user.password);
            if (!ok) {
                return res.status(400).json({ message: 'Mật khẩu không đúng' });
            }
            // return basic info (excluding password)
            const payload = {
                id: user.user_id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            };

            // Generate a simple demo token (Base64-URL). Note: For production use JWT instead.
            const tokenPayload = {
                id: payload.id,
                role: payload.role,
                iat: Math.floor(Date.now() / 1000)
            };
            const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');

            return res.json({ message: 'Đăng nhập thành công', user: payload, token });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập' });
        }
    }
}

export default UserController;
