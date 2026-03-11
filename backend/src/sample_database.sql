use book_store;

-- 1. Thêm dữ liệu vào bảng users (3 admin + 25 customer)
INSERT INTO users (full_name, date_of_birth, email, phone_number, password, image_url, role) VALUES
-- Admin (3 người) - IDs: 1-3
('Admin Nguyễn Văn A', '1985-01-15', 'admin1@gmail.com', '0901111111', 'admin123', 'images/pages/anonymous.png', 'admin'),
('Admin Trần Thị B', '1988-03-20', 'admin2@gmail.com', '0902222222', 'admin123', 'images/pages/anonymous.png', 'admin'),
('Admin Lê Văn C', '1990-07-10', 'admin3@gmail.com', '0903333333', 'admin123', 'images/pages/anonymous.png', 'admin'),

-- Customer (25 người) - IDs: 4-28
-- Khách không đặt đơn hàng (3 người) - IDs: 4,5,6
('Phạm Thị D', '1995-05-12', 'phamthid@gmail.com', '0914444444', 'password123', 'images/pages/anonymous.png', 'customer'),
('Hoàng Văn E', '1992-08-25', 'hoangvane@gmail.com', '0915555555', 'password123', 'images/pages/anonymous.png', 'customer'),
('Ngô Thị F', '1998-11-30', 'ngothif@gmail.com', '0916666666', 'password123', 'images/pages/anonymous.png', 'customer'),

-- Khách đặt 26 đơn hàng (1 người) - ID: 7
('Trương Văn G', '1987-04-18', 'truongvang@gmail.com', '0917777777', 'password123', 'images/pages/anonymous.png', 'customer'),

-- Khách đặt 8-13 đơn hàng (5 người) - IDs: 8-12
('Lý Thị H', '1991-09-22', 'lythih@gmail.com', '0918888888', 'password123', 'images/pages/anonymous.png', 'customer'),
('Vương Văn I', '1989-12-03', 'vuongvani@gmail.com', '0919999999', 'password123', 'images/pages/anonymous.png', 'customer'),
('Đặng Thị K', '1993-06-17', 'dangthik@gmail.com', '0921111111', 'password123', 'images/pages/anonymous.png', 'customer'),
('Bùi Văn L', '1986-02-28', 'buivanl@gmail.com', '0922222222', 'password123', 'images/pages/anonymous.png', 'customer'),
('Đỗ Thị M', '1994-10-09', 'dothim@gmail.com', '0923333333', 'password123', 'images/pages/anonymous.png', 'customer'),

-- Khách còn lại (12 người) - IDs: 13-28
('Hồ Văn N', '1990-03-15', 'hovann@gmail.com', '0924444444', 'password123', 'images/pages/anonymous.png', 'customer'),
('Mai Thị O', '1988-07-21', 'maithio@gmail.com', '0925555555', 'password123', 'images/pages/anonymous.png', 'customer'),
('Tô Văn P', '1996-01-30', 'tovanp@gmail.com', '0926666666', 'password123', 'images/pages/anonymous.png', 'customer'),
('Lâm Thị Q', '1984-11-11', 'lamthiq@gmail.com', '0927777777', 'password123', 'images/pages/anonymous.png', 'customer'),
('Trịnh Văn R', '1997-04-05', 'trinhvanr@gmail.com', '0928888888', 'password123', 'images/pages/anonymous.png', 'customer'),
('Dương Thị S', '1983-08-19', 'duongthis@gmail.com', '0929999999', 'password123', 'images/pages/anonymous.png', 'customer'),
('Đinh Văn T', '1999-12-25', 'dinhvant@gmail.com', '0931111111', 'password123', 'images/pages/anonymous.png', 'customer'),
('Phan Thị U', '1982-05-08', 'phanthiu@gmail.com', '0932222222', 'password123', 'images/pages/anonymous.png', 'customer'),
('Vũ Văn V', '1995-09-14', 'vuvanv@gmail.com', '0933333333', 'password123', 'images/pages/anonymous.png', 'customer'),
('Lưu Thị X', '1987-02-20', 'luuthix@gmail.com', '0934444444', 'password123', 'images/pages/anonymous.png', 'customer'),
('Châu Văn Y', '1992-06-06', 'chauvany@gmail.com', '0935555555', 'password123', 'images/pages/anonymous.png', 'customer'),
('Tạ Thị Z', '1985-10-10', 'tathiz@gmail.com', '0936666666', 'password123', 'images/pages/anonymous.png', 'customer'),
('Thạch Văn A1', '1991-03-03', 'thachvana1@gmail.com', '0937777777', 'password123', 'images/pages/anonymous.png', 'customer'),
('Kim Thị B1', '1989-07-07', 'kimthib1@gmail.com', '0938888888', 'password123', 'images/pages/anonymous.png', 'customer'),
('Huỳnh Văn C1', '1994-11-11', 'huynhvanc1@gmail.com', '0939999999', 'password123', 'images/pages/anonymous.png', 'customer'),
('Lý Thị D1', '1986-04-04', 'lythid1@gmail.com', '0941111111', 'password123', 'images/pages/anonymous.png', 'customer');

-- 2. Thêm dữ liệu vào bảng categories (11 thể loại)
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
('Truyện ngắn'),
('Giáo khoa - Tham khảo');

-- 3. Thêm dữ liệu vào bảng books (30 sách)
INSERT INTO books (book_name, author_name, price, description, publish_date, image_url) VALUES
-- IDs: 1-30
('Số đỏ', 'Vũ Trọng Phụng', 85000, 'Tác phẩm trào phúng xuất sắc nhất của văn học Việt Nam hiện đại, phơi bày bộ mặt thật của xã hội thượng lưu thành thị những năm 1930 với những mưu mô, toan tính và trào lộng đầy châm biếm.', '2018-02-15', 'images/books/1.png'),
('Nhà giả kim', 'Paulo Coelho', 79000, 'Câu chuyện ngụ ngôn đầy cảm hứng về hành trình tìm kiếm kho báu của chàng chăn cừu Santiago, mang đến bài học sâu sắc về ước mơ, số phận và tiếng gọi từ trái tim.', '2020-05-20', 'images/books/2.png'),
('Tôi thấy hoa vàng trên cỏ xanh', 'Nguyễn Nhật Ánh', 95000, 'Truyện dài đẹp và lãng mạn về tuổi thơ nghèo ở làng quê Việt Nam, với những câu chuyện cảm động về tình anh em, tình bạn và những rung động đầu đời trong sáng.', '2019-08-10', 'images/books/3.png'),
('Đắc nhân tâm', 'Dale Carnegie', 89000, 'Cuốn sách kinh điển về nghệ thuật ứng xử và giao tiếp, cung cấp những nguyên tắc vàng để thấu hiểu, tạo thiện cảm và gây ảnh hưởng đến mọi người xung quanh.', '2021-03-15', 'images/books/4.png'),
('Hành trình về phương Đông', 'Baird T. Spalding', 120000, 'Ghi chép hành trình tâm linh kỳ thú của một đoàn khoa học gia phương Tây đến Ấn Độ, khám phá những bí ẩn về triết học, yoga và trí tuệ cổ xưa phương Đông.', '2020-11-20', 'images/books/5.png'),
('Chiến tranh và hòa bình', 'Lev Tolstoy', 250000, 'Bộ tiểu thuyết sử thi vĩ đại của văn học Nga, tái hiện sống động cuộc chiến tranh Napoléon qua số phận của năm gia đình quý tộc với những triết lý sâu sắc về lịch sử và nhân sinh.', '2017-09-10', 'images/books/6.png'),
('Đời thay đổi khi chúng ta thay đổi', 'Andrew Matthews', 68000, 'Cuốn sách kỹ năng sống đầy hài hước và thông thái, giúp bạn nhìn nhận vấn đề theo cách tích cực và thay đổi cuộc đời bằng chính suy nghĩ và thái độ sống.', '2022-01-05', 'images/books/7.png'),
('Harry Potter và Hòn đá phù thủy', 'J.K. Rowling', 150000, 'Phần đầu tiên của series Harry Potter nổi tiếng thế giới, kể về cậu bé phù thủy Harry Potter bước vào thế giới phép thuật đầy kỳ diệu tại trường Hogwarts.', '2019-12-01', 'images/books/8.png'),
('Lược sử thời gian', 'Stephen Hawking', 180000, 'Kiệt tác khoa học phổ thông của thiên tài vật lý Stephen Hawking, giải thích những khái niệm phức tạp về vũ trụ, lỗ đen và thời gian một cách dễ hiểu.', '2020-07-15', 'images/books/9.png'),
('Tuổi thơ dữ dội', 'Phùng Quán', 130000, 'Hồi ký chân thực và xúc động về những thiếu niên trong chiến tranh, với những mất mát, hy sinh nhưng vẫn ngời sáng tinh thần yêu nước và khát vọng sống.', '2018-04-20', 'images/books/10.png'),
('Không gia đình', 'Hector Malot', 110000, 'Tiểu thuyết Pháp nổi tiếng kể về cuộc đời phiêu bạt của cậu bé Remy không nơi nương tựa, những thử thách và cuối cùng là hành trình tìm lại gia đình.', '2019-06-10', 'images/books/11.png'),
('Nghĩ giàu làm giàu', 'Napoleon Hill', 140000, 'Cuốn sách kinh điển về làm giàu dựa trên 20 năm nghiên cứu của tác giả, tiết lộ bí mật thành công của hơn 500 triệu phú và những nguyên tắc vàng để đạt được giàu có.', '2021-09-15', 'images/books/12.png'),
('Hoàng tử bé', 'Antoine de Saint-Exupéry', 65000, 'Tác phẩm văn học kinh điển thế giới kể về cuộc gặp gỡ giữa một phi công và hoàng tử bé đến từ tiểu tinh cầu xa xôi, với những bài học sâu sắc về tình yêu và cuộc sống.', '2020-02-20', 'images/books/13.png'),
('Mắt biếc', 'Nguyễn Nhật Ánh', 90000, 'Truyện tình lãng mạn và đầy day dứt về mối tình đơn phương của Ngạn dành cho Hà Lan, với những kỷ niệm tuổi thơ trong sáng và nỗi buồn khi trưởng thành.', '2019-11-11', 'images/books/14.png'),
('Trăm năm cô đơn', 'Gabriel García Márquez', 210000, 'Kiệt tác văn học hiện thực huyền ảo kể về số phận của bảy thế hệ dòng họ Buendía ở thị trấn Macondo, với những bi kịch và nỗi cô đơn không thể thoát khỏi.', '2018-08-08', 'images/books/15.png'),
('Sherlock Holmes', 'Arthur Conan Doyle', 280000, 'Tuyển tập truyện trinh thám kinh điển về thám tử tài ba Sherlock Holmes và trợ thủ đắc lực Watson, với những vụ án ly kỳ và lối suy luận logic sắc bén.', '2020-03-03', 'images/books/16.png'),
('Đại gia Gatsby', 'F. Scott Fitzgerald', 125000, 'Tiểu thuyết kinh điển của văn học Mỹ thời kỳ Jazz, khắc họa giấc mơ Mỹ và sự suy đồi đạo đức qua câu chuyện tình yêu bi kịch của Gatsby.', '2019-07-07', 'images/books/17.png'),
('Tam thể', 'Lưu Từ Hân', 220000, 'Bộ tiểu thuyết khoa học viễn tưởng đạt giải Hugo, kể về cuộc tiếp xúc đầu tiên của nhân loại với nền văn minh ngoài hành tinh Tam Thể và những hệ lụy không ngờ.', '2021-01-01', 'images/books/18.png'),
('Bố già', 'Mario Puzo', 190000, 'Tiểu thuyết tội phạm kinh điển về gia đình mafia Corleone, với những cuộc chiến quyền lực, tình gia tộc và những màn trả thù đẫm máu đầy kịch tính.', '2018-10-10', 'images/books/19.png'),
('Cà phê cùng Tony', 'Tony Buổi Sáng', 105000, 'Tập tản văn dí dỏm và sâu sắc về cuộc sống, công việc và những câu chuyện thường ngày qua lăng kính hài hước và giàu trải nghiệm của tác giả Tony Buổi Sáng.', '2020-12-12', 'images/books/20.png'),
('Cho tôi xin một vé đi tuổi thơ', 'Nguyễn Nhật Ánh', 72000, 'Truyện dài đầy sáng tạo kể về thế giới nội tâm phong phú của trẻ thơ, với những ước mơ và khát khao thoát khỏi khuôn khổ người lớn để sống đúng với tuổi mình.', '2019-09-09', 'images/books/21.png'),
('Fahrenheit 451', 'Ray Bradbury', 118000, 'Tiểu thuyết phản địa đàng kinh điển về xã hội tương lai nơi sách bị đốt cháy và lính cứu hỏa là những người thiêu hủy tri thức, ca ngợi sức mạnh của văn hóa đọc.', '2021-04-04', 'images/books/22.png'),
('1984', 'George Orwell', 155000, 'Tiểu thuyết chính luận kinh điển cảnh báo về chế độ toàn trị, nơi "Đảng" kiểm soát mọi suy nghĩ và hành động, với những khái niệm như "Anh lớn đang theo dõi bạn".', '2017-12-12', 'images/books/23.png'),
('Thép đã tôi thế đấy', 'Nikolai Ostrovsky', 98000, 'Tiểu thuyết tự truyện đầy cảm hứng về chàng thanh niên Pavel Korchagin, kiên cường vượt qua bệnh tật và nghịch cảnh để cống hiến cho cách mạng và lý tưởng cao đẹp.', '2018-06-06', 'images/books/24.png'),
('Hai số phận', 'Jeffrey Archer', 240000, 'Tiểu thuyết gia đình đồ sộ kể về cuộc đời đối lập của hai chàng trai sinh ra cùng ngày tháng năm, một giàu một nghèo, với những thăng trầm và âm mưu xuyên suốt.', '2019-03-03', 'images/books/25.png'),
('Mùa hè không tên', 'Nguyễn Nhật Ánh', 88000, 'Truyện dài về tuổi học trò với những rung động đầu đời trong sáng, những kỷ niệm mùa hè đáng nhớ và tình bạn đẹp dưới mái trường làng quê yên bình.', '2020-05-05', 'images/books/26.png'),
('Vũ trụ trong lòng bàn tay', 'Christophe Galfard', 165000, 'Cuốn sách khoa học phổ thông đưa độc giả vào hành trình khám phá vũ trụ từ những hạt nguyên tử nhỏ bé đến các thiên hà xa xôi, giải thích vật lý hiện đại dễ hiểu.', '2021-08-08', 'images/books/27.png'),
('Sức mạnh của thói quen', 'Charles Duhigg', 135000, 'Cuốn sách tâm lý học ứng dụng phân tích cơ chế hình thành thói quen và cách thay đổi chúng, giúp bạn cải thiện cuộc sống, công việc và đạt được thành công.', '2020-10-10', 'images/books/28.png'),
('Giáo trình kinh tế vi mô', 'Đại học Kinh tế', 180000, 'Sách giáo khoa kinh tế căn bản dành cho sinh viên đại học, trình bày các nguyên lý cung cầu, hành vi người tiêu dùng, doanh nghiệp và cơ chế thị trường.', '2021-02-02', 'images/books/29.png'),
('Toán cao cấp tập 1', 'Nguyễn Đình Trí', 195000, 'Giáo trình toán học dành cho sinh viên các trường đại học kỹ thuật, bao gồm các chương về giải tích, đại số tuyến tính và phương trình vi phân cơ bản.', '2020-09-09', 'images/books/30.png');

-- 4. Thêm dữ liệu vào bảng bookcategories (liên kết sách với thể loại)
INSERT INTO bookcategories (book_id, category_id) VALUES
-- Số đỏ: Văn học Việt Nam, Truyện ngắn, Tiểu thuyết
(1, 1), (1, 10), (1, 9),
-- Nhà giả kim: Văn học nước ngoài, Tiểu thuyết, Kỹ năng sống
(2, 2), (2, 9), (2, 4),
-- Tôi thấy hoa vàng: Văn học Việt Nam, Thiếu nhi, Tiểu thuyết
(3, 1), (3, 6), (3, 9),
-- Đắc nhân tâm: Kinh tế, Kỹ năng sống, Tâm lý
(4, 3), (4, 4), (4, 8),
-- Hành trình: Kỹ năng sống, Khoa học, Tâm lý
(5, 4), (5, 5), (5, 8),
-- Chiến tranh và hòa bình: Văn học nước ngoài, Lịch sử, Tiểu thuyết
(6, 2), (6, 7), (6, 9),
-- Đời thay đổi: Kỹ năng sống, Tâm lý
(7, 4), (7, 8),
-- Harry Potter: Văn học nước ngoài, Thiếu nhi, Tiểu thuyết
(8, 2), (8, 6), (8, 9),
-- Lược sử thời gian: Khoa học
(9, 5),
-- Tuổi thơ dữ dội: Văn học Việt Nam, Lịch sử
(10, 1), (10, 7),
-- Không gia đình: Văn học nước ngoài, Thiếu nhi, Tiểu thuyết
(11, 2), (11, 6), (11, 9),
-- Nghĩ giàu làm giàu: Kinh tế, Kỹ năng sống
(12, 3), (12, 4),
-- Hoàng tử bé: Văn học nước ngoài, Thiếu nhi, Tiểu thuyết
(13, 2), (13, 6), (13, 9),
-- Mắt biếc: Văn học Việt Nam, Tiểu thuyết
(14, 1), (14, 9),
-- Trăm năm cô đơn: Văn học nước ngoài, Tiểu thuyết
(15, 2), (15, 9),
-- Sherlock Holmes: Văn học nước ngoài, Tiểu thuyết, Truyện ngắn
(16, 2), (16, 9), (16, 10),
-- Đại gia Gatsby: Văn học nước ngoài, Tiểu thuyết
(17, 2), (17, 9),
-- Tam thể: Khoa học, Tiểu thuyết
(18, 5), (18, 9),
-- Bố già: Văn học nước ngoài, Tiểu thuyết
(19, 2), (19, 9),
-- Cà phê cùng Tony: Kỹ năng sống, Tâm lý, Văn học Việt Nam
(20, 4), (20, 8), (20, 1),
-- Cho tôi xin một vé: Văn học Việt Nam, Thiếu nhi, Tiểu thuyết
(21, 1), (21, 6), (21, 9),
-- Fahrenheit 451: Văn học nước ngoài, Tiểu thuyết
(22, 2), (22, 9),
-- 1984: Văn học nước ngoài, Tiểu thuyết
(23, 2), (23, 9),
-- Thép đã tôi: Văn học nước ngoài, Tiểu thuyết
(24, 2), (24, 9),
-- Hai số phận: Văn học nước ngoài, Tiểu thuyết
(25, 2), (25, 9),
-- Mùa hè không tên: Văn học Việt Nam, Thiếu nhi, Tiểu thuyết
(26, 1), (26, 6), (26, 9),
-- Vũ trụ trong lòng bàn tay: Khoa học
(27, 5),
-- Sức mạnh của thói quen: Kỹ năng sống, Tâm lý
(28, 4), (28, 8),
-- Giáo trình kinh tế vi mô: Giáo khoa, Kinh tế
(29, 11), (29, 3),
-- Toán cao cấp: Giáo khoa, Khoa học
(30, 11), (30, 5);

-- 5. Thêm dữ liệu vào bảng cartitems (giỏ hàng - khoảng 1 nửa khách hàng có giỏ hàng)
-- IDs khách hàng từ 4-28, chọn ngẫu nhiên khoảng 12-13 khách
INSERT INTO cartitems (user_id, book_id, quantity) VALUES
-- Khách ID 4 (không đặt hàng) có giỏ hàng
(4, 1, 1), (4, 5, 2), (4, 8, 1),
-- Khách ID 5 (không đặt hàng) có giỏ hàng
(5, 3, 2), (5, 7, 1), (5, 12, 1),
-- Khách ID 6 (không đặt hàng) có giỏ hàng
(6, 10, 1), (6, 15, 1),
-- Khách ID 7 (đặt 26 đơn) có giỏ hàng
(7, 2, 1), (7, 4, 1), (7, 9, 1), (7, 13, 2),
-- Khách ID 8 (đặt 8-13 đơn) có giỏ hàng
(8, 1, 2), (8, 6, 1), (8, 11, 1),
-- Khách ID 9 (đặt 8-13 đơn) có giỏ hàng
(9, 3, 1), (9, 8, 2), (9, 14, 1),
-- Khách ID 10 (đặt 8-13 đơn) có giỏ hàng
(10, 5, 1), (10, 12, 1), (10, 17, 1),
-- Khách ID 13 (còn lại) có giỏ hàng
(13, 7, 2), (13, 16, 1),
-- Khách ID 14 (còn lại) có giỏ hàng
(14, 2, 1), (14, 9, 1), (14, 18, 1),
-- Khách ID 15 (còn lại) có giỏ hàng
(15, 4, 1), (15, 10, 1), (15, 19, 1),
-- Khách ID 16 (còn lại) có giỏ hàng
(16, 1, 1), (16, 6, 1), (16, 20, 2),
-- Khách ID 17 (còn lại) có giỏ hàng
(17, 3, 1), (17, 8, 1), (17, 21, 1),
-- Khách ID 18 (còn lại) có giỏ hàng
(18, 5, 2), (18, 13, 1);


-- 6. Thêm dữ liệu vào bảng orders (đơn hàng)
-- Tạo orders cho từng nhóm khách hàng với các trạng thái: delivered, shipped, cancelled

-- Khách ID 7 (đặt 26 đơn hàng) - Tạo 26 đơn hàng
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(7, 350000, 'delivered', '123 Đường A, Quận 1, TP.HCM', '2023-01-05 08:30:00'),
(7, 420000, 'delivered', '123 Đường A, Quận 1, TP.HCM', '2023-01-15 10:15:00'),
(7, 280000, 'delivered', '123 Đường A, Quận 1, TP.HCM', '2023-01-25 14:20:00'),
(7, 510000, 'delivered', '123 Đường A, Quận 1, TP.HCM', '2023-02-03 09:45:00'),
(7, 195000, 'delivered', '123 Đường A, Quận 1, TP.HCM', '2023-02-12 11:30:00'),
(7, 430000, 'delivered', '123 Đường A, Quận 1, TP.HCM', '2023-02-20 15:10:00'),
(7, 375000, 'delivered', '123 Đường A, Quận 1, TP.HCM', '2023-03-02 08:45:00'),
(7, 290000, 'delivered', '123 Đường A, Quận 1, TP.HCM', '2023-03-10 13:20:00'),
(7, 465000, 'shipped', '123 Đường A, Quận 1, TP.HCM', '2023-03-18 10:30:00'),
(7, 380000, 'shipped', '123 Đường A, Quận 1, TP.HCM', '2023-03-25 16:15:00'),
(7, 315000, 'shipped', '123 Đường A, Quận 1, TP.HCM', '2023-04-02 09:00:00'),
(7, 445000, 'shipped', '123 Đường A, Quận 1, TP.HCM', '2023-04-10 14:30:00'),
(7, 360000, 'shipped', '123 Đường A, Quận 1, TP.HCM', '2023-04-18 11:45:00'),
(7, 275000, 'cancelled', '123 Đường A, Quận 1, TP.HCM', '2023-04-25 15:20:00'),
(7, 490000, 'cancelled', '123 Đường A, Quận 1, TP.HCM', '2023-05-03 08:15:00'),
(7, 405000, 'cancelled', '123 Đường A, Quận 1, TP.HCM', '2023-05-10 12:40:00'),
(7, 335000, 'shipped', '123 Đường A, Quận 1, TP.HCM', '2023-05-18 09:30:00'),
(7, 470000, 'shipped', '123 Đường A, Quận 1, TP.HCM', '2023-05-25 16:50:00'),
(7, 385000, 'shipped', '123 Đường A, Quận 1, TP.HCM', '2023-06-02 10:10:00'),
(7, 425000, 'shipped', '123 Đường A, Quận 1, TP.HCM', '2023-06-10 14:25:00'),
(7, 355000, 'delivered', '123 Đường A, Quận 1, TP.HCM', '2023-06-18 08:35:00'),
(7, 450000, 'delivered', '123 Đường A, Quận 1, TP.HCM', '2023-06-25 13:15:00'),
(7, 370000, 'delivered', '123 Đường A, Quận 1, TP.HCM', '2023-07-03 11:00:00'),
(7, 415000, 'cancelled', '123 Đường A, Quận 1, TP.HCM', '2023-07-10 15:40:00'),
(7, 305000, 'cancelled', '123 Đường A, Quận 1, TP.HCM', '2023-07-18 09:55:00'),
(7, 435000, 'cancelled', '123 Đường A, Quận 1, TP.HCM', '2023-07-25 14:05:00');

-- Khách ID 8-12 (5 khách đặt 8-13 đơn) - Mỗi khách 10 đơn
-- Khách ID 8
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(8, 320000, 'delivered', '456 Đường B, Quận 2, TP.HCM', '2023-02-10 09:20:00'),
(8, 280000, 'delivered', '456 Đường B, Quận 2, TP.HCM', '2023-02-20 11:30:00'),
(8, 410000, 'delivered', '456 Đường B, Quận 2, TP.HCM', '2023-03-05 14:15:00'),
(8, 365000, 'delivered', '456 Đường B, Quận 2, TP.HCM', '2023-03-15 10:40:00'),
(8, 295000, 'shipped', '456 Đường B, Quận 2, TP.HCM', '2023-03-25 16:25:00'),
(8, 385000, 'shipped', '456 Đường B, Quận 2, TP.HCM', '2023-04-08 08:50:00'),
(8, 340000, 'shipped', '456 Đường B, Quận 2, TP.HCM', '2023-04-18 13:10:00'),
(8, 400000, 'cancelled', '456 Đường B, Quận 2, TP.HCM', '2023-05-02 15:35:00'),
(8, 375000, 'cancelled', '456 Đường B, Quận 2, TP.HCM', '2023-05-15 09:45:00'),
(8, 330000, 'shipped', '456 Đường B, Quận 2, TP.HCM', '2023-05-28 12:20:00');

-- Khách ID 9
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(9, 290000, 'delivered', '789 Đường C, Quận 3, TP.HCM', '2023-01-15 10:30:00'),
(9, 350000, 'delivered', '789 Đường C, Quận 3, TP.HCM', '2023-02-01 14:45:00'),
(9, 420000, 'delivered', '789 Đường C, Quận 3, TP.HCM', '2023-02-18 09:15:00'),
(9, 380000, 'delivered', '789 Đường C, Quận 3, TP.HCM', '2023-03-07 16:30:00'),
(9, 315000, 'shipped', '789 Đường C, Quận 3, TP.HCM', '2023-03-22 11:20:00'),
(9, 395000, 'shipped', '789 Đường C, Quận 3, TP.HCM', '2023-04-10 08:40:00'),
(9, 360000, 'cancelled', '789 Đường C, Quận 3, TP.HCM', '2023-04-25 14:55:00'),
(9, 405000, 'cancelled', '789 Đường C, Quận 3, TP.HCM', '2023-05-12 10:05:00'),
(9, 335000, 'shipped', '789 Đường C, Quận 3, TP.HCM', '2023-05-28 15:30:00'),
(9, 370000, 'shipped', '789 Đường C, Quận 3, TP.HCM', '2023-06-15 09:50:00');

-- Khách ID 10
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(10, 410000, 'delivered', '101 Đường D, Quận 4, TP.HCM', '2023-01-20 08:15:00'),
(10, 365000, 'delivered', '101 Đường D, Quận 4, TP.HCM', '2023-02-08 12:30:00'),
(10, 430000, 'delivered', '101 Đường D, Quận 4, TP.HCM', '2023-02-25 16:45:00'),
(10, 390000, 'delivered', '101 Đường D, Quận 4, TP.HCM', '2023-03-12 10:20:00'),
(10, 345000, 'shipped', '101 Đường D, Quận 4, TP.HCM', '2023-03-28 14:35:00'),
(10, 415000, 'shipped', '101 Đường D, Quận 4, TP.HCM', '2023-04-15 09:00:00'),
(10, 375000, 'cancelled', '101 Đường D, Quận 4, TP.HCM', '2023-05-02 13:25:00'),
(10, 400000, 'cancelled', '101 Đường D, Quận 4, TP.HCM', '2023-05-18 17:40:00'),
(10, 355000, 'shipped', '101 Đường D, Quận 4, TP.HCM', '2023-06-05 08:55:00'),
(10, 385000, 'shipped', '101 Đường D, Quận 4, TP.HCM', '2023-06-20 12:10:00');

-- Khách ID 11
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(11, 305000, 'delivered', '202 Đường E, Quận 5, TP.HCM', '2023-02-05 11:00:00'),
(11, 370000, 'delivered', '202 Đường E, Quận 5, TP.HCM', '2023-02-22 15:20:00'),
(11, 425000, 'delivered', '202 Đường E, Quận 5, TP.HCM', '2023-03-10 09:35:00'),
(11, 380000, 'delivered', '202 Đường E, Quận 5, TP.HCM', '2023-03-25 13:50:00'),
(11, 335000, 'shipped', '202 Đường E, Quận 5, TP.HCM', '2023-04-08 08:05:00'),
(11, 405000, 'shipped', '202 Đường E, Quận 5, TP.HCM', '2023-04-22 16:30:00'),
(11, 360000, 'cancelled', '202 Đường E, Quận 5, TP.HCM', '2023-05-07 10:45:00'),
(11, 390000, 'cancelled', '202 Đường E, Quận 5, TP.HCM', '2023-05-20 14:15:00'),
(11, 350000, 'shipped', '202 Đường E, Quận 5, TP.HCM', '2023-06-08 09:30:00'),
(11, 380000, 'shipped', '202 Đường E, Quận 5, TP.HCM', '2023-06-22 11:55:00');

-- Khách ID 12
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(12, 395000, 'delivered', '303 Đường F, Quận 6, TP.HCM', '2023-01-10 14:00:00'),
(12, 345000, 'delivered', '303 Đường F, Quận 6, TP.HCM', '2023-01-28 10:25:00'),
(12, 415000, 'delivered', '303 Đường F, Quận 6, TP.HCM', '2023-02-15 16:40:00'),
(12, 375000, 'delivered', '303 Đường F, Quận 6, TP.HCM', '2023-03-05 08:55:00'),
(12, 330000, 'shipped', '303 Đường F, Quận 6, TP.HCM', '2023-03-20 13:10:00'),
(12, 400000, 'shipped', '303 Đường F, Quận 6, TP.HCM', '2023-04-08 17:25:00'),
(12, 360000, 'cancelled', '303 Đường F, Quận 6, TP.HCM', '2023-04-22 09:40:00'),
(12, 390000, 'cancelled', '303 Đường F, Quận 6, TP.HCM', '2023-05-10 12:15:00'),
(12, 350000, 'shipped', '303 Đường F, Quận 6, TP.HCM', '2023-05-25 15:30:00'),
(12, 385000, 'shipped', '303 Đường F, Quận 6, TP.HCM', '2023-06-12 10:45:00');

-- Khách còn lại (IDs 13-28) - Mỗi khách 2-4 đơn
-- Khách 13
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(13, 280000, 'delivered', '404 Đường G, Quận 7, TP.HCM', '2023-02-18 09:30:00'),
(13, 360000, 'delivered', '404 Đường G, Quận 7, TP.HCM', '2023-03-22 14:45:00'),
(13, 310000, 'shipped', '404 Đường G, Quận 7, TP.HCM', '2023-04-15 11:20:00');

-- Khách 14
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(14, 340000, 'delivered', '505 Đường H, Quận 8, TP.HCM', '2023-03-10 10:15:00'),
(14, 295000, 'shipped', '505 Đường H, Quận 8, TP.HCM', '2023-04-05 16:30:00');

-- Khách 15
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(15, 420000, 'delivered', '606 Đường I, Quận 9, TP.HCM', '2023-01-25 13:00:00'),
(15, 380000, 'delivered', '606 Đường I, Quận 9, TP.HCM', '2023-02-28 08:40:00'),
(15, 405000, 'shipped', '606 Đường I, Quận 9, TP.HCM', '2023-03-30 15:55:00'),
(15, 350000, 'cancelled', '606 Đường I, Quận 9, TP.HCM', '2023-05-10 10:20:00');

-- Khách 16
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(16, 375000, 'delivered', '707 Đường K, Quận 10, TP.HCM', '2023-02-14 11:45:00'),
(16, 330000, 'shipped', '707 Đường K, Quận 10, TP.HCM', '2023-03-18 09:10:00');

-- Khách 17
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(17, 450000, 'delivered', '808 Đường L, Quận 11, TP.HCM', '2023-03-05 14:30:00'),
(17, 385000, 'shipped', '808 Đường L, Quận 11, TP.HCM', '2023-04-12 08:55:00'),
(17, 400000, 'cancelled', '808 Đường L, Quận 11, TP.HCM', '2023-05-20 16:15:00');

-- Khách 18
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(18, 310000, 'delivered', '909 Đường M, Quận 12, TP.HCM', '2023-04-08 10:40:00'),
(18, 365000, 'shipped', '909 Đường M, Quận 12, TP.HCM', '2023-05-15 13:25:00');

-- Khách 19
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(19, 395000, 'delivered', '1010 Đường N, Quận Bình Thạnh, TP.HCM', '2023-02-20 09:00:00'),
(19, 340000, 'delivered', '1010 Đường N, Quận Bình Thạnh, TP.HCM', '2023-03-25 15:35:00'),
(19, 375000, 'shipped', '1010 Đường N, Quận Bình Thạnh, TP.HCM', '2023-04-28 11:50:00');

-- Khách 20
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(20, 285000, 'delivered', '1111 Đường O, Quận Tân Bình, TP.HCM', '2023-03-15 12:20:00'),
(20, 420000, 'shipped', '1111 Đường O, Quận Tân Bình, TP.HCM', '2023-04-20 09:45:00');

-- Khách 21
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(21, 360000, 'delivered', '1212 Đường P, Quận Tân Phú, TP.HCM', '2023-01-30 16:10:00'),
(21, 305000, 'delivered', '1212 Đường P, Quận Tân Phú, TP.HCM', '2023-03-08 10:30:00'),
(21, 385000, 'cancelled', '1212 Đường P, Quận Tân Phú, TP.HCM', '2023-05-05 14:55:00');

-- Khách 22
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(22, 345000, 'delivered', '1313 Đường Q, Quận Phú Nhuận, TP.HCM', '2023-04-12 08:20:00'),
(22, 395000, 'shipped', '1313 Đường Q, Quận Phú Nhuận, TP.HCM', '2023-05-18 15:40:00');

-- Khách 23
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(23, 370000, 'delivered', '1414 Đường R, Quận Gò Vấp, TP.HCM', '2023-02-25 11:15:00'),
(23, 330000, 'delivered', '1414 Đường R, Quận Gò Vấp, TP.HCM', '2023-03-28 09:50:00'),
(23, 405000, 'shipped', '1414 Đường R, Quận Gò Vấp, TP.HCM', '2023-05-08 14:25:00');

-- Khách 24
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(24, 290000, 'delivered', '1515 Đường S, Quận Thủ Đức, TP.HCM', '2023-03-20 13:35:00'),
(24, 380000, 'cancelled', '1515 Đường S, Quận Thủ Đức, TP.HCM', '2023-04-25 10:05:00');

-- Khách 25
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(25, 415000, 'delivered', '1616 Đường T, Quận Bình Tân, TP.HCM', '2023-04-05 15:15:00'),
(25, 355000, 'shipped', '1616 Đường T, Quận Bình Tân, TP.HCM', '2023-05-12 08:30:00'),
(25, 390000, 'cancelled', '1616 Đường T, Quận Bình Tân, TP.HCM', '2023-06-18 12:45:00');

-- Khách 26
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(26, 325000, 'delivered', '1717 Đường U, Quận 1, TP.HCM', '2023-05-08 10:50:00'),
(26, 370000, 'shipped', '1717 Đường U, Quận 1, TP.HCM', '2023-06-15 16:20:00');

-- Khách 27
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(27, 400000, 'delivered', '1818 Đường V, Quận 3, TP.HCM', '2023-04-18 09:25:00'),
(27, 345000, 'shipped', '1818 Đường V, Quận 3, TP.HCM', '2023-05-22 14:40:00'),
(27, 380000, 'cancelled', '1818 Đường V, Quận 3, TP.HCM', '2023-06-25 11:10:00');

-- Khách 28
INSERT INTO orders (user_id, total_amount, status, delivery_address, created_at) VALUES
(28, 360000, 'delivered', '1919 Đường X, Quận 5, TP.HCM', '2023-05-15 08:35:00'),
(28, 420000, 'cancelled', '1919 Đường X, Quận 5, TP.HCM', '2023-06-10 15:55:00');

-- 7. Thêm dữ liệu vào bảng orderdetails (chi tiết đơn hàng)
-- Tạo orderdetails cho tất cả đơn hàng
-- Mỗi đơn hàng sẽ có 2-3 sản phẩm

-- Tạo orderdetails cho từng order
DELIMITER $$
CREATE PROCEDURE GenerateOrderDetails()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE max_order_id INT;
    DECLARE book_count INT;
    DECLARE j INT;
    DECLARE random_book_id INT;
    DECLARE random_quantity INT;
    DECLARE book_price INT;
    
    -- Lấy số lượng orders tối đa
    SELECT MAX(order_id) INTO max_order_id FROM orders;
    
    -- Vòng lặp qua từng order
    WHILE i <= max_order_id DO
        -- Random số lượng sách trong đơn (2-3 sản phẩm)
        SET book_count = FLOOR(2 + (RAND() * 2));
        SET j = 1;
        
        -- Thêm chi tiết sách cho đơn hàng
        WHILE j <= book_count DO
            -- Random book_id từ 1-30
            SET random_book_id = FLOOR(1 + (RAND() * 30));
            
            -- Random số lượng (1-3 cuốn)
            SET random_quantity = FLOOR(1 + (RAND() * 3));
            
            -- Lấy giá sách
            SELECT price INTO book_price FROM books WHERE book_id = random_book_id;
            
            -- Thêm vào orderdetails
            INSERT INTO orderdetails (order_id, book_id, price, quantity) 
            VALUES (i, random_book_id, book_price, random_quantity);
            
            SET j = j + 1;
        END WHILE;
        
        SET i = i + 1;
    END WHILE;
END$$
DELIMITER ;

-- Gọi procedure để tạo orderdetails
CALL GenerateOrderDetails();

-- Xóa procedure sau khi dùng
DROP PROCEDURE GenerateOrderDetails;

-- Kiểm tra tổng quan dữ liệu
SELECT 'Data insertion completed successfully!' AS Message;

-- Xem thống kê trạng thái đơn hàng
SELECT 
    status,
    COUNT(*) AS so_luong,
    CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2), '%') AS ti_le
FROM orders
GROUP BY status
ORDER BY so_luong DESC;