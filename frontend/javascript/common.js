
export const getToken = (req, res) => {
    return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
}

export const ADMIN_API_BASE = 'http://localhost:5001/api/admin';
export const API_BASE = 'http://localhost:5001/api';

