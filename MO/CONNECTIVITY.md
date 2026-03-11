# MO – Kết nối backend (tránh "Network request failed")

## Cách 1: Localtunnel (không cần đăng ký)

1. **Chạy backend** (terminal 1): `cd BE/FromFromptToFE` → `dotnet run`.
2. **Chạy tunnel** (terminal 2): `npx localtunnel --port 5274`.
3. Sẽ ra dòng dạng: `your url is: https://xxxx-xx-xx-xx-xx.loca.lt`. Copy **https://...** (bỏ phần `?token=...` nếu có).
4. Trong **MO/src/constants/config.js** đặt: `API_URL_OVERRIDE = "https://xxxx-xx-xx-xx-xx.loca.lt"`.
5. Reload app MO và thử đăng nhập.

(Lần đầu mở URL trên browser có thể bị trang "Click to continue" – app MO gọi API vẫn dùng được.)

## Cách 2: Ngrok (cần đăng ký miễn phí)

1. Đăng ký: https://dashboard.ngrok.com/signup → vào https://dashboard.ngrok.com/get-started/your-authtoken → copy **authtoken**.
2. Cài authtoken (chỉ 1 lần): `npx ngrok config add-authtoken <dán_token_vào_đây>`.
3. Chạy backend: `dotnet run`. Chạy tunnel: `npx ngrok http 5274`.
4. Copy URL **https** (vd: `https://xxxx.ngrok-free.app`) vào **config.js** → `API_URL_OVERRIDE = "https://..."`.
5. Reload app MO.

## 1. Backend phải listen trên mọi interface

- Chạy backend bằng profile **http** (không dùng IIS Express).
- Trong `BE/FromFromptToFE/Properties/launchSettings.json` phải có:
  - `"applicationUrl": "http://0.0.0.0:5274"` (profile http).

```bash
cd BE/FromFromptToFE
dotnet run
# Hoặc trong Visual Studio: chọn profile "http" rồi F5
```

## 2. Cùng mạng (WiFi)

- Điện thoại và máy chạy backend phải **cùng WiFi**.
- Nếu dùng **4G** trên điện thoại → không thể gọi được `http://192.168.x.x:5274` (IP nội bộ).

## 3. Đúng IP máy

- Trên máy chạy backend: `ipconfig` (Windows) hoặc `ifconfig` (Mac/Linux).
- Lấy **IPv4** (vd: 192.168.1.4 hoặc 192.168.100.147).
- Trong `MO/src/constants/config.js` đặt `MACHINE_IP` đúng với IP đó.

## 4. Android Emulator

- Nếu chạy app trên **Android Emulator** (không phải máy thật), trong `config.js` đặt:
  - `USE_EMULATOR = true`
- Khi đó app sẽ gọi `http://10.0.2.2:5274` (localhost của máy host từ trong emulator).

## 5. Firewall (Windows)

- Nếu vẫn lỗi, thử tạm tắt Windows Firewall cho mạng riêng, hoặc thêm rule cho phép **port 5274** (TCP Inbound).

## 6. Kiểm tra nhanh

- Trên **máy chạy backend**, mở browser: `http://192.168.1.4:5274/health` (thay đúng IP).
- Nếu thấy `{"status":"ok"}` → backend đúng; lỗi thường do WiFi / IP / Emulator / Firewall.
