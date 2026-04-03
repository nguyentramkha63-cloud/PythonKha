# 🐍 Python cùng Thầy Kha - Học viện Trăn Python

Chào mừng bạn đến với **Học viện Trăn Python của Thầy Kha**! Đây là một ứng dụng học lập trình Python tương tác, vui nhộn và đầy "muối" dành cho các bạn học sinh.

## ✨ Tính năng nổi bật
- **Chạy code Python trực tiếp:** Giả lập thực thi code Python từng dòng một.
- **Thầy Kha AI:** Giải đáp thắc mắc, gợi ý code và đưa ra các thử thách lập trình cực "mặn".
- **Hỗ trợ đa ngôn ngữ:** Tiếng Việt, Tiếng Anh và nhiều ngôn ngữ khác.
- **Thử thách HSG:** Các bài tập ôn luyện Học sinh giỏi Tin học từ các đề thi thực tế.
- **Giao diện thân thiện:** Tích hợp nhân vật Thầy Kha tương tác theo trạng thái của bạn.

## 🚀 Hướng dẫn triển khai (Deployment)

### 1. Đưa code lên GitHub
1. Tạo một Repository mới trên GitHub.
2. Mở terminal tại thư mục dự án và chạy các lệnh sau:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Python cùng Thầy Kha v5.1"
   git branch -M main
   git remote add origin <URL_REPOSITORY_CỦA_BẠN>
   git push -u origin main
   ```

### 2. Triển khai lên Vercel (Miễn phí)
1. Truy cập [Vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
2. Nhấn **"Add New"** -> **"Project"**.
3. Chọn Repository bạn vừa push lên.
4. Vercel sẽ tự động nhận diện đây là dự án **Vite**.
5. Nhấn **"Deploy"**.
6. Sau khi hoàn tất, bạn sẽ có một đường dẫn web công khai!

## 🔑 Cấu hình API Key
Ứng dụng này yêu cầu **Gemini API Key** để hoạt động.
- Người dùng có thể tự dán Key của mình vào phần **"CÀI ĐẶT API"** trong ứng dụng.
- Key này sẽ được lưu an toàn trong `localStorage` của trình duyệt người dùng.
- Bạn không cần phải cấu hình Key trên Vercel nếu muốn người dùng tự sử dụng Key của họ.

## 🛠 Công nghệ sử dụng
- **Frontend:** React 19, TypeScript, Tailwind CSS.
- **AI:** Google Gemini API (@google/genai).
- **Build Tool:** Vite.

---
*Chúc các em học tốt và không bị trăn Python "nuốt chửng" nhé!* - **Thầy Kha** 👨‍🏫🐍
