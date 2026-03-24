# 📦 Quản lý Kho (QLK) - Microservices Architecture

Dự án này là một hệ thống **Quản lý Kho và Bán hàng** được thiết kế theo chuẩn kiến trúc **Microservices** tiên tiến, phân chia rõ ràng các Context nghiệp vụ chuyên biệt thành từng dự án riêng biệt.

## 🏗 Cấu trúc Thư mục

Dự án sử dụng mô hình Monorepo, được chia làm 2 tầng chính: Frontend và Backend.

### 🌐 1. Frontend (`/frontend`)
Sử dụng kiến trúc Micro-frontends/BFF, ứng dụng được chia thành nhiều app riêng biệt tùy theo đối tượng người dùng, giúp tối ưu hiệu năng và phát triển độc lập:
- **`admin-app`**: Ứng dụng dành cho Người quản trị (React/Vite).
- **`seller-app`**: Ứng dụng dành cho Người bán hàng (Next.js).
- **`shipper-app`**: Ứng dụng dành cho Người giao hàng (Next.js).
- **`shop-app`**: Ứng dụng dành riêng cho Khách hàng mua sắm (Next.js).

### ⚙️ 2. Backend (`/backend`)
Được chia nhỏ thành 8 dịch vụ độc lập viết bằng .NET 8, tuân thủ nguyên tắc **Database-per-Service** (Mỗi service tự sở hữu DB riêng):
- **`ApiGateway`**: Cổng giao tiếp API tổng, tiếp nhận mọi request từ Frontend (port `5155`) và định tuyến luồng điều hướng vào các service bên dưới bằng thư viện Ocelot.
- **`AdminService`**, **`CartService`**, **`OrderService`**, **`ProductService`**, **`SellerService`**, **`ShipperService`**, **`UserService`**: Chứa logic xử lý nghiệp vụ cho từng phân hệ riêng biệt (Được đóng gói .NET Web API độc lập).
- **`Shared.Messages`**: Thư viện dùng chung chứa các Event/Message Data Contracts.

🖥 *Lưu ý:* Giao tiếp bất đồng bộ (Asynchronous Messaging) giữa các service (Ví dụ: `OrderService` đặt hàng xong tự gọi xuống giảm tồn kho ở `ProductService`) được thực hiện thông qua Message Broker là **RabbitMQ** cùng thư viện **MassTransit**.

---

## 🚀 Hướng Dẫn Khởi Chạy

### A. Chuẩn bị môi trường nền tảng
Hệ thống yêu cầu bắt buộc phải có Message Queue hỗ trợ phía sau. Hãy đảm bảo chạy lệnh sau tại thư mục gốc của dự án (`d:\3\QLK`) để mở dịch vụ **RabbitMQ**:
```bash
docker compose up -d
```
*(Giao diện quản lý RabbitMQ Management sẽ mở tại `http://localhost:15672/` với tài khoản `guest/guest`)*

### B. Sử dụng các file lệnh Hỗ trợ (.bat)
Để giúp các lập trình viên dễ dàng thao tác với lượng lớn Microservices ở môi trường DEV mà không cần IDE cồng kềnh, dự án có chuẩn bị sẵn các file script tự động trong thư mục `/backend`:

1. **🚀 `run_all.bat` (Khởi chạy đồng loạt Server)**
   - **Tác dụng:** Khởi động đồng loạt tất cả 8 cửa sổ console cho 8 dịch vụ Backend cùng lúc. Tự động gắn tên (Title Name) kèm theo Cổng truy cập (Port) cho từng màn hình CMD đen để dễ quan sát tiến trình log (VD: *ApiGateway (5155)*, *OrderService (5002)*).
   - **Cách dùng:** Double-click trực tiếp file từ Windows File Explorer là xong!

2. **🔨 `build.bat` (Test lỗi biên dịch nháy)**
   - **Tác dụng:** Chạy lại quá trình biên dịch (Compile) cho toàn bộ file Solution (nắm tất cả Backend Project). Kết quả kiểm tra lỗi (Warning, Exceptions...) của trình biên dịch MSBuild được ghi toàn bộ bằng Text cứng thẳng vào file `build.log` chứ cửa sổ không bị trôi đi mất, giúp bạn rà soát lại source code báo lỗi ở file nào, dòng số bao nhiêu để fix.
   - **Cách dùng:** Double click để chạy, sau khi cửa sổ chạy tắt đi thì mở file mới sinh ra `build.log` lên đọc.

3. **⚙️ `setup.bat` (Phục hồi Configuration Hệ thống)**
   - **Tác dụng:** Lệnh cài đặt, phục hồi và liên kết các Project Reference giữa các dự án gốc và dự án chia sẻ `Shared.Messages`.
   - **Cách dùng:** Thường chỉ cấu hình dùng 1 lần để gông các package thư viện NuGet (MassTransit, Identity...) vào code đồng loạt mà không cần phải chạy tay dotnet add cho từng project riêng rẽ. 
