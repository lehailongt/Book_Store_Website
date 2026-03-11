DROP SCHEMA IF EXISTS book_store;

CREATE DATABASE IF NOT EXISTS book_store;
USE book_store;

-- Bảng users
CREATE TABLE users (
    user_id 		INT AUTO_INCREMENT PRIMARY KEY,
    full_name 		VARCHAR(50) NOT NULL,
    date_of_birth 	DATE,
    email 			VARCHAR(100) UNIQUE NOT NULL,
    phone_number 	VARCHAR(20),
    password 		VARCHAR(200) NOT NULL,
    image_url 		VARCHAR(255),
    role ENUM('admin', 'customer') DEFAULT 'customer'
);

-- Bảng categories
CREATE TABLE categories (
    category_id 	INT AUTO_INCREMENT PRIMARY KEY,
    category_name 	VARCHAR(50) NOT NULL UNIQUE
);

-- Bảng books
CREATE TABLE books (
    book_id 		INT AUTO_INCREMENT PRIMARY KEY,
    book_name 		VARCHAR(50) NOT NULL,
    author_name 	VARCHAR(50) NOT NULL,
    price 			DECIMAL(10,2) NOT NULL CHECK (price > 0),
    description 	TEXT,
    publish_date 	DATE,
    image_url 		VARCHAR(255)
);

-- Bảng bookcategories (quan hệ nhiều-nhiều giữa books và categories)
CREATE TABLE bookcategories (
    book_id 		INT,
    category_id 	INT,
    PRIMARY KEY (book_id, category_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- Bảng cartitems
CREATE TABLE cartitems (
    cart_item_id 	INT AUTO_INCREMENT PRIMARY KEY,
    user_id 		INT NOT NULL,
    book_id 		INT NOT NULL,
    quantity 		INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_book (user_id, book_id)
);

-- Bảng orders
CREATE TABLE orders (
    order_id 			INT AUTO_INCREMENT PRIMARY KEY,
    user_id 			INT NOT NULL,
    total_amount 		DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status 				ENUM('shipped', 'delivered', 'cancelled') DEFAULT 'shipped',
    delivery_address 	VARCHAR(100) NOT NULL,
    created_at 			TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- Bảng orderdetails
CREATE TABLE orderdetails (
    order_detail_id 	INT AUTO_INCREMENT PRIMARY KEY,
    order_id 			INT NOT NULL,
    book_id 			INT NOT NULL,
    price 				DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    quantity			INT NOT NULL CHECK (quantity > 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE RESTRICT
);
