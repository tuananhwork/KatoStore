### KatoStore

KatoStore là ứng dụng mẫu e-commerce gồm 2 phần: client (React + Vite) và server (Node.js + Express + MongoDB). Dự án đã tích hợp upload media qua Cloudinary, RBAC (admin, manager, customer), trang quản trị, và nhiều tính năng quản lý sản phẩm/đơn hàng.

## Yêu cầu hệ thống

- Node.js >= 18
- npm >= 9
- MongoDB đang chạy (local hoặc hosted như MongoDB Atlas)
- Tài khoản Cloudinary

## Cấu trúc thư mục

- `client/`: Frontend (React + Vite)
- `server/`: Backend (Express + Mongoose)

## Cài đặt

1. Cài dependencies

```bash
cd server && npm install
cd ../client && npm install
```

2. Thiết lập biến môi trường

- Server: tạo file `server/.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/katostore
JWT_SECRET=your-very-secure-secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=katostore
CLIENT_ORIGIN=http://localhost:5173
```

- Client: tạo file `client/.env`

```env
VITE_API_BASE=http://localhost:5000
```

3. Chạy dự án (2 terminal riêng)

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Mặc định:

- Server: `http://localhost:5000`
- Client: `http://localhost:5173`

## Dữ liệu mẫu (seed)

Dự án có sẵn dữ liệu sản phẩm mẫu trong `client/src/data/products.json` (dùng cho hiển thị nhanh phía client). Dữ liệu thật được lưu trong MongoDB khi bạn tạo sản phẩm qua trang Admin. Nếu cần script seed server, hãy thêm script phù hợp trong `server/scripts/` rồi chạy theo nhu cầu. Lưu ý seed có thể ghi đè/trùng SKU.

## Đăng nhập và vai trò (Roles)

Ứng dụng hỗ trợ 3 vai trò: `admin`, `manager`, `customer`.

### Quyền hạn theo vai trò

- Admin

  - Quản lý người dùng: xem danh sách, (tùy bạn mở rộng) cập nhật trạng thái/quyền
  - Quản lý sản phẩm: tạo/sửa/xóa, ẩn/hiển thị, upload ảnh/video lên Cloudinary, tự động gợi ý SKU
  - Quản lý đơn hàng: xem tất cả, cập nhật trạng thái
  - Xem dashboard: doanh thu, đơn hàng, khách hàng, top sản phẩm

- Manager

  - Giống admin cho phần đơn hàng và sản phẩm (tùy cấu hình), không có full quyền người dùng như admin
  - Xem dashboard

- Customer
  - Duyệt sản phẩm, tìm kiếm, lọc, phân trang
  - Thêm giỏ hàng, đặt hàng
  - Quản lý hồ sơ cá nhân, upload avatar

Các middleware bảo vệ API

- `server/src/middlewares/auth.js`: xác thực JWT
- `server/src/middlewares/roles.js`: kiểm tra vai trò, ví dụ `requireRole('admin', 'manager')`

Các route quản trị tiêu biểu

- `GET /admin/users` (admin, manager): lấy danh sách người dùng (server/src/routes/admin.routes.js)
- `GET /admin/orders` (admin, manager): danh sách đơn hàng
- `PATCH /admin/orders/:id` (admin, manager): cập nhật trạng thái
- `GET /admin/products` (admin, manager): danh sách sản phẩm cho admin (bao gồm cả đã ẩn)

### Tạo tài khoản và gán vai trò

1. Đăng ký tài khoản qua trang `Auth` (client) hoặc API `POST /auth/register`
2. Mặc định tài khoản mới là `customer`
3. Nâng quyền tài khoản bằng một trong các cách sau:
   - Cách nhanh (dev): vào MongoDB, collection `users`, cập nhật trường `role` thành `admin` hoặc `manager`
   - Hoặc triển khai API/Trang quản trị để thay đổi `role` (nếu chưa có)

Ví dụ cập nhật qua MongoDB shell:

```js
db.users.updateOne({ email: 'admin@example.com' }, { $set: { role: 'admin' } });
```

### Đăng nhập test theo vai trò

- Admin: đăng ký một tài khoản, sau đó đổi `role` sang `admin`, đăng nhập lại
- Manager: tương tự, đổi `role` sang `manager`
- Customer: giữ mặc định

Sau khi đăng nhập:

- Token JWT sẽ lưu ở `localStorage`
- Khi token hết hạn/không hợp lệ, các trang quản trị sẽ bắt 401 và điều hướng về `/auth`

## Upload media (Cloudinary)

- Ảnh/Video được upload qua API backend (`/media/upload`)
- Backend đã hỗ trợ `public_id` tùy biến để đặt tên có cấu trúc: `katostore/{category}/{sku}/{sku}_{idx}`
- Trong `ProductForm.jsx`, khi lưu sản phẩm mới:
  - Tự tính `public_id` dựa trên `category` + `sku`
  - Cho phép upload nhiều ảnh/video, có preview, xóa từng file

Lưu ý: cần cấu hình Cloudinary đúng trong `server/.env`.

## SKU tự động

- Khi chọn `category`, hệ thống gợi ý SKU tiếp theo dựa trên prefix của danh mục và các SKU hiện có
- Hỗ trợ cả danh mục mới (tự sinh prefix theo tên danh mục, bỏ dấu, lấy 3 ký tự chữ-số đầu)

## Phân trang, lọc, sắp xếp (client)

- `Admin/Products.jsx`: tìm kiếm, lọc theo danh mục, sắp xếp theo giá & thời gian tạo, phân trang client-side, đồng bộ query string
- `Admin/Users.jsx`, `Admin/Orders.jsx`: phân trang client-side, có xử lý 401
- `Shop.jsx`: tìm kiếm bỏ dấu (accent-insensitive), lọc danh mục, phân trang
- `components/Pagination.jsx`: component phân trang tái sử dụng

## Chạy kiểm thử nhanh

- Mở `http://localhost:5173`
- Đăng ký 1 customer, duyệt `Shop`, thử tìm kiếm/lọc/phân trang
- Đổi role thành `admin`, đăng nhập lại, vào `Admin`:
  - Tạo sản phẩm mới, upload nhiều ảnh/video, kiểm tra SKU gợi ý và đặt tên public_id trên Cloudinary
  - Vào `Products` thử ẩn/hiện nhanh, tìm/ lọc/ sắp xếp/ phân trang và reload để kiểm tra đồng bộ URL
  - Vào `Orders` cập nhật trạng thái và xem Dashboard doanh thu thay đổi

## Ghi chú bảo mật

- Không commit file `.env`
- Đổi `JWT_SECRET` trước khi deploy
- Cấu hình CORS phù hợp (`CLIENT_ORIGIN`)

## Build & Deploy

- Client

```bash
cd client
npm run build
# output: client/dist/
```

- Server: triển khai Node.js (PM2, Docker, Render, Railway, v.v.) và trỏ `CLIENT_ORIGIN` tới domain client thực tế

## License

MIT

## Author

Chu Bá Tuấn Anh | AnhCBT
0336897858
chubatuananh.work@gmail.com
