import pool from '../config/database.js';

const default_avatar = '../images/anonymous.png';

class UserModel {
    
    // Tạo user mới
    static async create(userData) {
        const { full_name, email, password, date_of_birth = null, phone_number = null, image_url = default_avatar, role = 'customer' } = userData;
        const sql = `INSERT INTO users (full_name, email, password, date_of_birth, phone_number, image_url, role)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await pool.query(sql, [full_name, email, password, date_of_birth, phone_number, image_url, role]);
        return { id: result.insertId, full_name, email, role };
    }

    // Tìm user bằng email
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.query(sql, [email]);
        return rows[0];
    }

    // Tìm user bằng full_name (đặt tên cũ cho tương thích)
    static async findByUsername(full_name) {
        const sql = 'SELECT * FROM users WHERE full_name = ?';
        const [rows] = await pool.query(sql, [full_name]);
        return rows[0];
    }

    // Tìm user bằng ID
    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE user_id = ?';
        const [rows] = await pool.query(sql, [id]);
        return rows[0];
    }

    // Lấy tất cả users
    static async findAll() {
        const sql = 'SELECT user_id, full_name, email, role, date_of_birth, phone_number, image_url FROM users';
        const [rows] = await pool.query(sql);
        return rows;
    }

    // Lấy tất cả customers
    static async findAllCustomers() {
        const sql = 'SELECT user_id, full_name, email, role, date_of_birth, phone_number, image_url FROM users WHERE role = ?';
        const [rows] = await pool.query(sql, ['customer']);
        return rows;
    }

    // Lấy tất cả admins
    static async findAllAdmins() {
        const sql = 'SELECT user_id, full_name, email, role, date_of_birth, phone_number, image_url FROM users WHERE role = ?';
        const [rows] = await pool.query(sql, ['admin']);
        return rows;
    }

    // Cập nhật user (cho admin hoặc tự sửa)
    static async update(id, updateData) {
        const { full_name, email, role, phone_number, date_of_birth } = updateData;
        const sql = `UPDATE users SET full_name = ?, email = ?, role = ?, phone_number = ?, date_of_birth = ? WHERE user_id = ?`;
        const [result] = await pool.query(sql, [full_name, email, role, phone_number, date_of_birth, id]);
        return result.affectedRows > 0;
    }

    // Xóa user
    static async delete(id) {
        const sql = 'DELETE FROM users WHERE user_id = ?';
        const [result] = await pool.query(sql, [id]);
        return result.affectedRows > 0;
    }
}

export default UserModel;