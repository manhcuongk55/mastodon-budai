# 🪷 MAKAI — Mạng xã hội của sự thật

> *Cứ cười thật là ok được ở lại mạng xã hội này*

MAKAI là mạng xã hội P2P nơi con người chân trọng nhau qua sự thật. Không login, không signup — chỉ cần một nụ cười thật.

## 🌍 Triết lý

- 🕊️ **Hoà bình** — Thế giới cần hoà bình
- 💛 **Yêu thương** — Mọi người yêu thương nhau
- 🤝 **Không phân biệt** — Tất cả đều bình đẳng
- 🦅 **Tự do** — Tự do cả trong suy nghĩ
- 😊 **Sự thật** — Cười thật, nói thật, sống thật

## 📱 MAKAI hoạt động thế nào?

```
📸 Cười → Chụp ảnh → Nhập tên → ĐĂNG → Vào MAKAI!
```

1. **Vào MAKAI** — Camera bật, cười và chụp
2. **Tự đặt tên** — Không lấy gì từ máy người dùng
3. **Xác minh P2P** — 2 người thật xác nhận bạn cười thật
4. **3 trang:** 🛡️ Safe · ✅ Trust · ❌ Fake
5. **3 nút mỗi bài:** Trust · Fake · Safe
6. **Bài đăng vĩnh viễn** — Sự thật không bao giờ bị xoá

## 🤖 Cùng phát triển MAKAI với AI + Antigravity

### Bước 1: Clone repo

```bash
git clone https://github.com/manhcuongk55/mastodon-budai.git
cd mastodon-budai
```

### Bước 2: Cài Antigravity

Antigravity là AI coding assistant của Google DeepMind. Cài trong VS Code:

1. Cài [VS Code](https://code.visualstudio.com/)
2. Mở Extensions → Tìm "Antigravity" → Install
3. Mở project `mastodon-budai` trong VS Code

### Bước 3: Nói chuyện với AI

Mở Antigravity chat và bảo AI những gì bạn muốn. Ví dụ:

```
"Thêm nút Love cho mỗi bài đăng"
"Thêm dark mode cho trang Safe"
"Tạo trang leaderboard người Trust nhiều nhất"
"Thêm chức năng chia sẻ bài đăng"
```

AI sẽ hiểu code và tự sửa cho bạn!

### Bước 4: Chạy thử

```bash
# Cài dependencies
bundle install
yarn install

# Thiết lập database
bin/rails db:setup

# Chạy server
bin/dev
```

Mở `http://localhost:3000` → Được redirect tới trang Smile Verify!

### Bước 5: Push lên GitHub

```bash
git add -A
git commit --no-verify -m "🪷 Mô tả thay đổi của bạn"
git push
```

## 🏗️ Cấu trúc dự án

| Thư mục / File | Mô tả |
|---|---|
| `public/smile-verify/index.html` | Trang chụp ảnh cười |
| `public/smile-verify/style.css` | CSS cho trang smile |
| `public/smile-verify/story.html` | Câu chuyện MAKAI |
| `app/javascript/mastodon/components/status_action_bar/` | Nút Trust · Fake · Safe |
| `app/javascript/mastodon/features/navigation_panel/` | 3 tab: Safe · Trust · Fake |
| `config/routes.rb` | Route redirect → smile-verify |

## 💡 Ý tưởng cần phát triển

- [ ] **Smile AI** — AI nhận diện nụ cười thật / giả
- [ ] **Trust Score** — Điểm tin cậy của mỗi người dùng
- [ ] **Safe Zone** — Vùng an toàn cho nội dung được xác minh
- [ ] **Love Button** — Nút yêu thương bên cạnh Trust/Fake/Safe
- [ ] **Leaderboard** — Người được Trust nhiều nhất
- [ ] **Multi-language** — Hỗ trợ nhiều ngôn ngữ
- [ ] **Mobile App** — Ứng dụng iOS/Android
- [ ] **P2P Full** — Hoàn toàn phi tập trung

## 🙏 Lời cảm ơn

- Cảm ơn **Google** đã tạo ra Antigravity
- Cảm ơn **Luffy** — đã dạy tôi chân trọng những người ở lại
- Cảm ơn những người đã có duyên
- Cảm ơn **bạn** — người đang đọc những dòng này

> *"Muốn an toàn thì tâm phải tĩnh và hòa nhập được cộng đồng"*

> *"Tạo được 1 sản phẩm có giá trị cho cộng đồng là cách hòa nhập cộng đồng tốt nhất"*

---

🪷 **MAKAI** — cho những người Smile Budai

*Hoà bình · Yêu thương · Không phân biệt · Tự do*
