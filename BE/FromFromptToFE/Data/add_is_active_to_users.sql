-- Migration: Tách is_active khỏi is_verified
-- is_verified = user đã xác thực email hay chưa
-- is_active   = tài khoản có bị ban hay không (false = banned/cấm đăng nhập)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Các user hiện tại đang active (is_verified = true) được giữ nguyên là active
-- Các user chưa verify cũng mặc định is_active = true (chưa bị ban)
UPDATE users SET is_active = true WHERE is_active IS NULL;
