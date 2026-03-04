use book_store;

-- 1. Thêm dữ liệu vào bảng users
INSERT INTO users (full_name, date_of_birth, email, phone_number, password, image_url, role) VALUES
('Nguyễn Văn An', '1990-05-15', 'nguyenvanan@gmail.com', '0905123456', 'password123', 'https://example.com/images/user1.jpg', 'customer'),
('Trần Thị Bình', '1985-08-20', 'tranthibinh@gmail.com', '0918123456', 'password123', 'https://example.com/images/user2.jpg', 'customer'),
('Lê Hoàng Cường', '1992-03-10', 'lehoangcuong@gmail.com', '0933123456', 'password123', 'https://example.com/images/user3.jpg', 'customer'),
('Phạm Minh Đức', '1988-11-25', 'phamminhduc@gmail.com', '0977123456', 'password123', 'https://example.com/images/user4.jpg', 'customer'),
('Admin', '1980-01-01', 'admin@gmail.com', '0900000000', 'admin123', 'https://example.com/images/admin.jpg', 'admin');

-- 2. Thêm dữ liệu vào bảng categories
INSERT INTO categories (category_name) VALUES
('Văn học Việt Nam'),
('Văn học nước ngoài'),
('Kinh tế - Kinh doanh'),
('Kỹ năng sống'),
('Khoa học - Công nghệ'),
('Thiếu nhi'),
('Lịch sử'),
('Tâm lý học'),
('Tiểu thuyết'),
('Truyện ngắn');

-- 3. Thêm dữ liệu vào bảng books
INSERT INTO books (book_name, author_name, price, description, publish_date, image_url) VALUES
('Số đỏ', 'Vũ Trọng Phụng', 85000, 'Tác phẩm kinh điển của văn học Việt Nam', '2018-02-15', 'https://example.com/images/sodo.jpg'),
('Nhà giả kim', 'Paulo Coelho', 79000, 'Tiểu thuyết nổi tiếng thế giới', '2020-05-20', 'https://example.com/images/nhagiakim.jpg'),
('Tôi thấy hoa vàng trên cỏ xanh', 'Nguyễn Nhật Ánh', 95000, 'Truyện dài về tuổi thơ', '2019-08-10', 'https://example.com/images/toithayhoavang.jpg'),
('Đắc nhân tâm', 'Dale Carnegie', 89000, 'Nghệ thuật ứng xử và giao tiếp', '2021-03-15', 'https://example.com/images/dacnhantam.jpg'),
('Hành trình về phương Đông', 'Baird T. Spalding', 120000, 'Triết học phương Đông', '2020-11-20', 'https://example.com/images/hanhtrinh.jpg'),
('Chiến tranh và hòa bình', 'Lev Tolstoy', 250000, 'Tiểu thuyết lịch sử Nga', '2017-09-10', 'https://example.com/images/chientranh.jpg'),
('Đời thay đổi khi chúng ta thay đổi', 'Andrew Matthews', 68000, 'Kỹ năng phát triển bản thân', '2022-01-05', 'https://example.com/images/doithaydoi.jpg'),
('Harry Potter và Hòn đá phù thủy', 'J.K. Rowling', 150000, 'Phần đầu tiên của series Harry Potter', '2019-12-01', 'https://example.com/images/harrypotter.jpg'),
('Lược sử thời gian', 'Stephen Hawking', 180000, 'Khoa học vũ trụ', '2020-07-15', 'https://example.com/images/luocsuthoigian.jpg'),
('Tuổi thơ dữ dội', 'Phùng Quán', 130000, 'Hồi ký chiến tranh', '2018-04-20', 'https://example.com/images/tuoithodudoi.jpg'),
('Không gia đình', 'Hector Malot', 110000, 'Tiểu thuyết Pháp', '2019-06-10', 'https://example.com/images/khonggiadinh.jpg'),
('Nghĩ giàu làm giàu', 'Napoleon Hill', 140000, 'Sách kinh doanh', '2021-09-15', 'https://example.com/images/nghighiau.jpg');

-- 4. Thêm dữ liệu vào bảng bookcategories (liên kết sách với thể loại)
INSERT INTO bookcategories (book_id, category_id) VALUES
(1, 1), (1, 10),  -- Số đỏ: Văn học Việt Nam, Truyện ngắn
(2, 2), (2, 9),   -- Nhà giả kim: Văn học nước ngoài, Tiểu thuyết
(3, 1), (3, 6), (3, 9),  -- Tôi thấy hoa vàng: Văn học Việt Nam, Thiếu nhi, Tiểu thuyết
(4, 3), (4, 4),   -- Đắc nhân tâm: Kinh tế, Kỹ năng sống
(5, 4), (5, 5), (5, 8),  -- Hành trình: Kỹ năng sống, Khoa học, Tâm lý
(6, 2), (6, 7), (6, 9),  -- Chiến tranh và hòa bình: Văn học nước ngoài, Lịch sử, Tiểu thuyết
(7, 4), (7, 8),   -- Đời thay đổi: Kỹ năng sống, Tâm lý
(8, 2), (8, 6), (8, 9),  -- Harry Potter: Văn học nước ngoài, Thiếu nhi, Tiểu thuyết
(9, 5),           -- Lược sử thời gian: Khoa học
(10, 1), (10, 7), -- Tuổi thơ dữ dội: Văn học Việt Nam, Lịch sử
(11, 2), (11, 6), -- Không gia đình: Văn học nước ngoài, Thiếu nhi
(12, 3), (12, 4); -- Nghĩ giàu làm giàu: Kinh tế, Kỹ năng sống

-- 5. Thêm dữ liệu vào bảng cartitems (giỏ hàng)
INSERT INTO cartitems (user_id, book_id, quantity) VALUES
(1, 2, 1),  -- User 1 thêm sách Nhà giả kim vào giỏ
(1, 4, 2),  -- User 1 thêm 2 cuốn Đắc nhân tâm
(2, 1, 1),  -- User 2 thêm Số đỏ
(2, 8, 1),  -- User 2 thêm Harry Potter
(2, 12, 1), -- User 2 thêm Nghĩ giàu làm giàu
(3, 3, 2),  -- User 3 thêm 2 cuốn Tôi thấy hoa vàng
(4, 5, 1),  -- User 4 thêm Hành trình về phương Đông
(4, 9, 1);  -- User 4 thêm Lược sử thời gian

-- 6. Thêm dữ liệu vào bảng orders (đơn hàng)
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(1, 247000, 'delivered', '123 Nguyễn Trãi, Quận 1, TP.HCM', '2024-02-15 10:30:00'),
(1, 164000, 'pending', '123 Nguyễn Trãi, Quận 1, TP.HCM', '2024-03-20 14:45:00'),
(2, 314000, 'shipped', '456 Lê Lợi, Quận 3, TP.HCM', '2024-03-18 09:15:00'),
(3, 190000, 'delivered', '789 Cách Mạng Tháng 8, Quận 10, TP.HCM', '2024-02-28 16:20:00'),
(4, 180000, 'cancelled', '321 Hoàng Văn Thụ, Quận Tân Bình, TP.HCM', '2024-03-10 11:00:00'),
(5, 315000, 'delivered', '999 Võ Văn Tần, Quận 3, TP.HCM', '2024-03-05 08:30:00');

-- 7. Thêm dữ liệu vào bảng orderdetails (chi tiết đơn hàng)
INSERT INTO orderdetails (order_id, book_id, price, quantity) VALUES
-- Đơn hàng 1 của user 1
(1, 2, 79000, 1),  -- Nhà giả kim
(1, 4, 89000, 1),  -- Đắc nhân tâm
(1, 3, 79000, 1),  -- Tôi thấy hoa vàng (giá cũ hơn?)

-- Đơn hàng 2 của user 1
(2, 8, 150000, 1), -- Harry Potter
(2, 7, 68000, 1),  -- Đời thay đổi

-- Đơn hàng 3 của user 2
(3, 1, 85000, 2),  -- 2 cuốn Số đỏ
(3, 12, 144000, 1), -- Nghĩ giàu làm giàu (giá thực tế 140k + 4k? Có thể do thuế/phí)

-- Đơn hàng 4 của user 3
(4, 3, 95000, 2),  -- 2 cuốn Tôi thấy hoa vàng

-- Đơn hàng 5 của user 4 (đã hủy)
(5, 9, 180000, 1), -- Lược sử thời gian

-- Đơn hàng 6 của admin
(6, 5, 120000, 1), -- Hành trình về phương Đông
(6, 11, 110000, 1), -- Không gia đình
(6, 2, 79000, 1);  -- Nhà giả kim