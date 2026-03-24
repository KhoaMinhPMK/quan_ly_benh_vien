90% app “vibe code” trông rẻ tiền — vì sao (và cách sửa)

Bạn có thể nhận ra một app “vibe coded” chỉ trong 3 giây.
Không phải vì code kém.
Mà vì các quyết định thiết kế sai.
Sai font.
Spacing không nhất quán.
Màu sắc không ăn khớp.
Component nhìn giống shadcn… nhưng lại “lệch lệch”.
Những thứ này không mất nhiều thời gian để sửa.
Nhưng bạn phải biết mình đang tìm gì.
1. Logic chọn font (quyết định thay đổi mọi thứ)
Hầu hết app vibe code dùng font mặc định của UI library — thường là Inter.
Không có gì sai với Inter… nhưng khi ai cũng dùng, app của bạn sẽ giống tất cả.
Framework chọn font:
SaaS / công cụ năng suất: Inter hoặc Geist cho UI, không dùng font riêng cho heading (chỉ đổi weight)
App consumer: Plus Jakarta Sans hoặc DM Sans để tạo cảm giác thân thiện
Premium / tài chính / pháp lý: Sora hoặc Neue Haas Grotesk — nghiêm túc và đáng tin hơn
Landing page: có thể dùng display font cho tiêu đề, nhưng không dùng trong app
👉 1 font family, tối đa 2 weight. Kỷ luật chính là thiết kế.
2. Hệ thống spacing — thứ vô hình nhưng cực quan trọng
Nếu app của bạn “có gì đó sai sai” mà không biết tại sao → thường là spacing.
Thiết lập hệ scale:
Base: 4px
Các giá trị hợp lệ: 4, 8, 12, 16, 24, 32, 48, 64
Không dùng số lẻ kiểu 13px, 22px
Áp dụng cho margin, padding, gap một cách nhất quán.
👉 Nếu dùng Tailwind CSS mà spacing vẫn lộn xộn → bạn đang override sai cách.
3. Hệ thống màu (color tokens) — đừng chọn màu từng component
Design system dùng semantic tokens, không phải mỗi chỗ một mã màu.
Bộ tối thiểu:
background (nền trang)
surface (card, panel)
border (viền)
text-primary (nội dung chính)
text-secondary (label, caption)
brand-primary (màu chính)
brand-secondary (hover, action phụ)
destructive (error, delete)
👉 Define trong config, đừng hardcode hex trong component.
4. Dùng shadcn đúng cách
shadcn/ui rất phù hợp cho vibe coder — nhưng hay bị dùng sai.
Không customize từng component riêng lẻ → customize design tokens
Không mix với library khác trong cùng view
Dùng cn() thay vì nối class thủ công
Extend variant, đừng override phá hệ thống
5. 6 quyết định thiết kế tạo khác biệt
Border radius: chọn 1 (8px hoặc 12px), dùng xuyên suốt
Shadow: dùng để thể hiện layer, không phải trang trí
Icon: chỉ dùng 1 bộ (ví dụ Lucide hoặc Heroicons)
Input height: đồng nhất
Hover state: mọi thứ clickable đều có
Focus state: đừng dùng default xanh, hãy custom theo design
Thiết kế không chỉ là thẩm mỹ.
Nó là tín hiệu.
Một app thiết kế tốt → cho thấy bạn quan tâm đến chi tiết.
Và người dùng tin những sản phẩm được làm bởi người có sự quan tâm đó.
👉 Niềm tin đó = chuyển đổi (conversion).