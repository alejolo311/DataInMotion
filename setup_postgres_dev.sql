CREATE DATABASE data_im_dev_db;
CREATE USER data_im_dev WITH ENCRYPTED PASSWORD 'dim_passwd';
GRANT ALL PRIVILEGES ON DATABASE data_im_dev_db TO data_im_dev;
