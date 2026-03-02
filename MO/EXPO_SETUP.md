## 🔧 Mobile (Expo Go) - API Configuration

### ⚠️ IMPORTANT: Cấu hình IP Address

Khi chạy trên **real device** (điện thoại thật), bạn PHẢI cập nhật IP address của máy dev.

### 📝 Bước 1: Lấy IP Address của Máy Dev

**Windows:**
```cmd
ipconfig
```
Tìm dòng `IPv4 Address: 192.168.x.x`

**Mac/Linux:**
```bash
ifconfig
# hoặc
hostname -I
```

### 🔄 Bước 2: Cập nhật IP trong Config

Mở file: `src/constants/config.js`

```javascript
const MACHINE_IP = "192.168.1.100"; // 👈 Thay bằng IP của bạn
```

Ví dụ:
```javascript
const MACHINE_IP = "192.168.0.150"; // IP được lấy từ ipconfig
export const USE_EMULATOR = false; // Real device
```

### 🧪 Bước 3: Kiểm tra Server API

Đảm bảo backend server đang chạy:
```
dotnet run
```

Kiểm tra kết nối:
- **Windows:** `ping 192.168.1.100` (từ mobile hoặc máy khác)
- **Trình duyệt:** Vào `http://192.168.1.100:5274` (nên trả về CORS error nhưng response từ server)

### 📱 Bước 4: Chạy Expo Go trên Mobile

```bash
npm start
# Hoặc
expo start
```

Quét QR code từ Expo Go app.

### ⚙️ Cấu hình cho Android Emulator

Nếu bạn dùng **Android Emulator** thay vì real device:

```javascript
export const USE_EMULATOR = true; // Sẽ dùng 10.0.2.2:5274
```

### 🐛 Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|----------|
| `Request timeout` | IP address sai hoặc server không chạy | Kiểm tra IP và server API |
| `Connection refused` | Server không chạy | `dotnet run` ở backend |
| `Cannot reach host` | Firewall chặn | Cho phép port 5274 trong firewall |
| `Network not reachable` | Mobile chưa kết nối WiFi | Kết nối WiFi cùng network với máy dev |

### ✅ Console Log

Khi request được gửi, bạn sẽ thấy log:
```
[LOGIN] Connecting to: http://192.168.1.100:5274/auth/login
```

Nếu có lỗi:
```
[LOGIN ERROR] Request timeout. Check if API server is running and IP is correct.
```

---

**💡 Tip:** Đặt `MACHINE_IP` thành IP tĩnh của máy dev để tránh thay đổi liên tục.
