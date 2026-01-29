# Cấu Trúc Thư Mục Src - React Native Project

Đây là cấu trúc thư mục chuẩn cho project React Native mobile app.

## 📁 Cấu Trúc Thư Mục

```
src/
├── assets/              # Tài nguyên tĩnh
│   ├── images/         # Hình ảnh, icons
│   └── fonts/          # Font chữ tùy chỉnh
│
├── components/          # Các component tái sử dụng
│   └── ...             # Button, Input, Card, etc.
│
├── constants/           # Các hằng số, cấu hình
│   └── ...             # colors.js, config.js, etc.
│
├── context/             # React Context cho state management
│   └── ...             # AuthContext, ThemeContext, etc.
│
├── hooks/               # Custom React Hooks
│   └── ...             # useAuth, useFetch, etc.
│
├── navigation/          # Cấu hình navigation/routing
│   └── ...             # AppNavigator, StackNavigator, etc.
│
├── screens/             # Các màn hình của app
│   └── ...             # HomeScreen, LoginScreen, etc.
│
├── services/            # API calls, external services
│   └── ...             # api.js, authService.js, etc.
│
├── styles/              # Global styles, themes
│   └── ...             # globalStyles.js, theme.js, etc.
│
└── utils/               # Utility functions, helpers
    └── ...             # validation.js, formatters.js, etc.
```

## 📝 Mô Tả Chi Tiết

### `assets/`
Chứa tất cả tài nguyên tĩnh như hình ảnh, icons, fonts.
- `images/`: Logo, background, icons
- `fonts/`: Custom fonts (.ttf, .otf)

### `components/`
Các component UI có thể tái sử dụng trong nhiều màn hình.
Ví dụ: Button, Input, Card, Modal, Header, etc.

### `constants/`
Các giá trị hằng số, cấu hình app.
Ví dụ: màu sắc, API endpoints, app config, etc.

### `context/`
React Context API để quản lý state toàn cục.
Ví dụ: AuthContext, UserContext, ThemeContext, etc.

### `hooks/`
Custom React Hooks để tái sử dụng logic.
Ví dụ: useAuth, useFetch, useDebounce, etc.

### `navigation/`
Cấu hình điều hướng giữa các màn hình (React Navigation).
Ví dụ: AppNavigator, StackNavigator, TabNavigator, etc.

### `screens/`
Các màn hình chính của ứng dụng.
Ví dụ: HomeScreen, LoginScreen, ProfileScreen, etc.

### `services/`
Xử lý API calls, kết nối với backend và external services.
Ví dụ: api.js, authService.js, storageService.js, etc.

### `styles/`
Global styles, theme configuration, style utilities.
Ví dụ: globalStyles.js, colors.js, typography.js, etc.

### `utils/`
Các hàm tiện ích, helper functions.
Ví dụ: validation.js, formatters.js, dateUtils.js, etc.

## 🚀 Sử Dụng

Khi phát triển tính năng mới:
1. Tạo screen mới trong `screens/`
2. Tạo components cần thiết trong `components/`
3. Thêm navigation route trong `navigation/`
4. Tạo service cho API calls trong `services/`
5. Sử dụng hooks và context khi cần thiết

## 📌 Best Practices

- Giữ components nhỏ và tập trung vào một nhiệm vụ
- Tái sử dụng components và hooks khi có thể
- Tách biệt business logic khỏi UI components
- Sử dụng constants thay vì hardcode values
- Đặt tên file và folder rõ ràng, dễ hiểu
