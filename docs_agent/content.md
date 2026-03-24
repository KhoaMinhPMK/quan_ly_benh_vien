BRIEF CHỨC NĂNG HỆ THỐNG SAAS Y TẾ NỘI TRÚ
Tài liệu phục vụ trao đổi phạm vi giải pháp | Trang 1
BRIEF CHỨC NĂNG HỆ THỐNG
Nền tảng SaaS quản lý bệnh nhân – phòng – giường – hồ sơ – ra viện
Mô hình triển khai Web-based / SaaS, hỗ trợ dùng trên máy tính và điện thoại
Mục tiêu chính
Quản lý vận hành nội trú, điều phối phòng – giường, kiểm tra hồ sơ ra viện và
theo dõi dashboard điều hành
Phạm vi tài liệu
Tài liệu brief phục vụ trao đổi với khách hàng, chốt sơ bộ tính năng, mức ưu tiên
và giai đoạn triển khai
Tổng phân hệ Tổng tính năng Cách chia giai đoạn
14 100 GĐ1: MVP | GĐ2: Mở rộng vận hành | GĐ3: SaaS hoàn chỉnh
1. Tổng quan giải pháp
Hệ thống được định hướng là một nền tảng web/SaaS hỗ trợ quản lý vận hành nội trú cho bệnh viện, khoa hoặc
phòng điều trị. Trọng tâm của giải pháp là quản lý bệnh nhân nội trú gắn với phòng – giường, kiểm soát công suất
sử dụng giường, hỗ trợ danh sách dự kiến ra viện, kiểm tra hồ sơ trước ra viện và cung cấp dashboard trực quan
cho bộ phận điều hành.
Tài liệu này được xây dựng để phục vụ trao đổi bước đầu với khách hàng, làm cơ sở chốt phạm vi tính năng, xác
định nhóm chức năng ưu tiên và phân chia lộ trình triển khai theo từng giai đoạn.
2. Mục tiêu nghiệp vụ
• Quản lý tập trung thông tin bệnh nhân, phòng, giường và hồ sơ trên một hệ thống duy nhất.
• Giảm sai sót trong xếp giường, điều phối nội trú và rà soát hồ sơ ra viện.
• Tăng hiệu quả phối hợp giữa bác sĩ, điều dưỡng, nhân viên hồ sơ và quản lý khoa.
• Theo dõi công suất giường theo thời gian thực để phục vụ điều hành.
• Tạo nền tảng có thể mở rộng theo mô hình SaaS cho nhiều đơn vị sử dụng.
3. Đối tượng sử dụng
Nhóm người dùng Vai trò chính
Ban quản lý / trưởng khoa Theo dõi dashboard, công suất giường, tình trạng vận hành và báo cáo.
Bác sĩ
Theo dõi bệnh nhân phụ trách, cập nhật trạng thái, kiểm tra hồ sơ và xác
nhận ra viện.
Điều dưỡng / y tá Xếp giường, cập nhật tình trạng phòng – giường và hỗ trợ điều phối nội trú.
Nhân viên hồ sơ
Kiểm tra checklist, theo dõi mục hồ sơ còn thiếu và cập nhật trạng thái xử
lý.
Tiếp nhận / hành chính Tạo hồ sơ nội trú, nhập thông tin ban đầu và hỗ trợ điều phối dữ liệu.
Quản trị hệ thống Quản lý tài khoản, phân quyền, danh mục và cấu hình vận hành hệ thống.
4. Bảng chức năng chi tiết theo phân hệ
Các bảng dưới đây được chia theo từng phân hệ để tiện chốt phạm vi, đánh giá mức ưu tiên và làm cơ sở tách báo
giá theo từng giai đoạn.
BRIEF CHỨC NĂNG HỆ THỐNG SAAS Y TẾ NỘI TRÚ
Tài liệu phục vụ trao đổi phạm vi giải pháp | Trang 2
4.1. Phân hệ quản lý tổ chức và cấu trúc hệ thống
STT Chức năng Mô tả Ưu tiên GĐ
1 Quản lý đơn vị sử dụng
Tạo và quản lý từng bệnh viện, cơ sở hoặc đơn vị sử dụng hệ
thống.
Cao GĐ1
2 Quản lý khoa/phòng ban Khai báo khoa, bộ phận, nhóm điều trị và phân nhóm dữ liệu
theo đơn vị vận hành.
Cao GĐ1
3 Quản lý khu điều trị
Khai báo khu, block, tầng hoặc khu nội trú phục vụ điều phối
quy mô lớn.
Trung
bình
GĐ2
4 Quản lý phòng bệnh
Tạo danh sách phòng bệnh và thông tin cơ bản của từng
phòng.
Cao GĐ1
5 Quản lý giường bệnh
Tạo danh sách giường thuộc từng phòng, dùng làm nền cho
toàn bộ logic điều phối.
Cao GĐ1
6 Gán mã phòng/giường
Mã hóa phòng và giường theo quy chuẩn để dễ tra cứu, ví dụ
P101-G01.
Cao GĐ1
7 Phân loại phòng
Khai báo loại phòng như phòng thường, phòng dịch vụ, cách
ly, ICU…
Trung
bình
GĐ2
8 Cấu hình sức chứa phòng
Xác định số giường tối đa cho từng phòng để phục vụ cảnh
báo công suất.
Cao GĐ1
9 Trạng thái phòng
Quản lý trạng thái hoạt động, tạm khóa hoặc bảo trì của từng
phòng.
Trung
bình
GĐ2
4.2. Phân hệ quản lý phòng – giường
STT Chức năng Mô tả Ưu tiên GĐ
10
Danh sách phòng theo thời gian
thực
Hiển thị từng phòng đang có bao nhiêu giường sử dụng và
bao nhiêu giường còn trống.
Cao GĐ1
11 Xem trạng thái từng giường
Thể hiện trạng thái giường: trống, có bệnh nhân, chờ vệ sinh,
khóa sử dụng…
Cao GĐ1
12
Hiển thị tên bệnh nhân trên từng
giường
Cho biết giường số 1 là ai, giường số 2 là ai ngay trên giao
diện.
Cao GĐ1
13 Đếm số giường trống theo phòng
Tự động tính toán số giường còn trống để hỗ trợ điều phối
nhanh.
Cao GĐ1
14 Cảnh báo phòng đầy
Hiển thị cảnh báo khi số bệnh nhân đạt tối đa sức chứa của
phòng.
Cao GĐ1
15 Cảnh báo phòng sắp đầy
Cảnh báo khi số giường trống thấp hơn ngưỡng cài đặt, ví dụ
chỉ còn 1 giường.
Trung
bình
GĐ2
16 Chuyển giường
Chuyển bệnh nhân sang giường khác trong cùng phòng hoặc
cùng khoa.
Cao GĐ1
17 Chuyển phòng
Chuyển bệnh nhân từ phòng này sang phòng khác và cập
nhật dữ liệu tức thời.
Cao GĐ1
18 Giải phóng giường
Khi bệnh nhân ra viện hoặc chuyển viện, giường trở về trạng
thái trống.
Cao GĐ1
19 Lịch sử sử dụng giường
Tra cứu giường đã từng có bệnh nhân nào sử dụng và trong
khoảng thời gian nào.
Trung
bình
GĐ2
BRIEF CHỨC NĂNG HỆ THỐNG SAAS Y TẾ NỘI TRÚ
Tài liệu phục vụ trao đổi phạm vi giải pháp | Trang 3
STT Chức năng Mô tả Ưu tiên GĐ
20 Sơ đồ trực quan phòng – giường
Hiển thị dạng card hoặc sơ đồ để nhìn nhanh công suất từng
phòng.
Trung
bình
GĐ2
21
Tìm kiếm theo phòng/giường/bệnh
nhân
Tra cứu nhanh bệnh nhân đang nằm ở đâu hoặc giường nào
đang sử dụng.
Cao GĐ1
4.3. Phân hệ xếp giường và điều phối nội trú
STT Chức năng Mô tả Ưu tiên GĐ
22 Xếp giường thủ công
Điều dưỡng hoặc người phụ trách tự chọn phòng và giường
phù hợp cho bệnh nhân.
Cao GĐ1
23 Gợi ý giường trống
Hệ thống lọc ra các giường còn trống để người dùng chọn
nhanh.
Cao GĐ1
24 Gợi ý theo loại phòng
Gợi ý dựa trên loại phòng, nhu cầu đặc biệt hoặc chuyên
khoa.
Trung
bình
GĐ2
25 Tự động xếp giường
Hệ thống tự đề xuất hoặc gán giường phù hợp cho bệnh
nhân theo rule.
Trung
bình
GĐ2
26 Kiểm tra xung đột xếp giường
Ngăn xếp trùng vào giường đang có người hoặc đang khóa sử
dụng.
Cao GĐ1
27 Danh sách chờ phân giường
Quản lý bệnh nhân đã tiếp nhận nhưng chưa được phân
giường chính thức.
Trung
bình
GĐ2
28 Quy tắc phân bổ giường
Cấu hình quy tắc theo giới tính, chuyên khoa, mức độ ưu tiên
hoặc tiêu chí riêng.
Thấp GĐ3
4.4. Phân hệ quản lý bệnh nhân nội trú
STT Chức năng Mô tả Ưu tiên GĐ
29 Tạo hồ sơ bệnh nhân nội trú Khai báo bệnh nhân khi tiếp nhận điều trị nội trú. Cao GĐ1
30 Danh sách bệnh nhân đang điều trị
Hiển thị toàn bộ bệnh nhân hiện có trong khoa hoặc đơn vị
phụ trách.
Cao GĐ1
31 Xem thông tin bệnh nhân
Hiển thị họ tên, tuổi, mã bệnh nhân, chẩn đoán, bác sĩ phụ
trách…
Cao GĐ1
32 Gắn bệnh nhân với phòng/giường Liên kết bệnh nhân với vị trí nằm thực tế trong hệ thống. Cao GĐ1
33 Trạng thái điều trị
Theo dõi trạng thái như đang điều trị, chờ thủ thuật, chờ ra
viện, đã ra viện.
Cao GĐ1
34 Lịch sử di chuyển nội trú
Ghi nhận chuyển phòng, chuyển giường và các mốc thay đổi
quan trọng.
Trung
bình
GĐ2
35 Tra cứu nhanh
Tìm kiếm theo tên, mã bệnh nhân, bác sĩ, phòng hoặc ngày
nhập viện.
Cao GĐ1
36 Ghi chú nội bộ
Cho phép ghi chú nhanh liên quan đến ca bệnh hoặc xử lý
hành chính nội bộ.
Trung
bình
GĐ2
4.5. Phân hệ danh sách dự kiến ra viện
STT Chức năng Mô tả Ưu tiên GĐ
BRIEF CHỨC NĂNG HỆ THỐNG SAAS Y TẾ NỘI TRÚ
Tài liệu phục vụ trao đổi phạm vi giải pháp | Trang 4
STT Chức năng Mô tả Ưu tiên GĐ
37
Danh sách bệnh nhân dự kiến ra
viện theo ngày
Hiển thị danh sách bệnh nhân dự kiến ra viện hôm nay hoặc
ngày mai.
Cao GĐ1
38 Đánh dấu chờ ra viện Đánh dấu bệnh nhân đang vào luồng xử lý hoàn tất ra viện. Cao GĐ1
39 Theo dõi tiến độ xử lý ra viện
Cho biết hồ sơ đã đủ hay còn thiếu bước nào trước khi hoàn
tất.
Cao GĐ1
40 Xác nhận hoàn tất ra viện
Cập nhật trạng thái hoàn tất và đồng thời giải phóng giường
bệnh.
Cao GĐ1
41
Lọc danh sách theo bác
sĩ/phòng/khoa
Giúp từng bộ phận chỉ xem các bệnh nhân thuộc phạm vi
mình phụ trách.
Trung
bình
GĐ2
42 Lịch sử ra viện
Tra cứu danh sách bệnh nhân đã ra viện theo ngày hoặc theo
giai đoạn.
Trung
bình
GĐ2
4.6. Phân hệ kiểm tra hồ sơ ra viện
STT Chức năng Mô tả Ưu tiên GĐ
43 Checklist hồ sơ ra viện
Thiết lập danh sách các mục bắt buộc cần hoàn thành trước
khi ra viện.
Cao GĐ1
44 Kiểm tra hồ sơ nhanh
Mở popup hoặc màn hình chi tiết để rà soát hồ sơ ngay từ
danh sách.
Cao GĐ1
45 Hiển thị mục còn thiếu
Hệ thống chỉ rõ phần nào còn thiếu hoặc chưa được xác
nhận.
Cao GĐ1
46 Trạng thái hồ sơ Theo dõi trạng thái đủ, thiếu, chờ xác nhận hoặc cần bổ sung. Cao GĐ1
47 Ghi chú phần cần bổ sung
Người phụ trách ghi rõ nội dung cần bổ sung để bộ phận liên
quan xử lý.
Trung
bình
GĐ2
48 Lưu lịch sử kiểm tra Lưu thông tin ai kiểm tra, thời điểm và kết quả rà soát.
Trung
bình
GĐ2
49
Chặn xác nhận ra viện khi hồ sơ
chưa đủ
Không cho hoàn tất quy trình ra viện nếu chưa đủ điều kiện
bắt buộc.
Trung
bình
GĐ2
4.7. Phân hệ checklist / biểu mẫu nghiệp vụ
STT Chức năng Mô tả Ưu tiên GĐ
50 Tạo checklist nghiệp vụ Tạo các biểu mẫu hoặc checklist cho từng quy trình nội bộ.
Trung
bình
GĐ2
51 Hỗ trợ nhiều kiểu câu hỏi
Hỗ trợ checkbox, radio, text, ghi chú và các kiểu nhập liệu cơ
bản.
Trung
bình
GĐ2
52 Mẫu riêng theo từng khoa Mỗi khoa có thể có bộ biểu mẫu hoặc checklist riêng.
Trung
bình
GĐ2
53 Bắt buộc hoàn thành biểu mẫu
Một số bước chỉ được chuyển tiếp khi đã hoàn tất checklist
bắt buộc.
Thấp GĐ3
54 Lưu và xem lại kết quả biểu mẫu Tra cứu nội dung đã nhập hoặc đã xác nhận ở các lần trước.
Trung
bình
GĐ2
BRIEF CHỨC NĂNG HỆ THỐNG SAAS Y TẾ NỘI TRÚ
Tài liệu phục vụ trao đổi phạm vi giải pháp | Trang 5
4.8. Phân hệ dashboard, thống kê và cảnh báo
STT Chức năng Mô tả Ưu tiên GĐ
55 Tổng số bệnh nhân hiện tại
Hiển thị số lượng bệnh nhân đang điều trị tại thời điểm hiện
tại.
Cao GĐ1
56
Tổng số giường / giường đang sử
dụng
Theo dõi công suất sử dụng giường toàn khoa hoặc từng khu. Cao GĐ1
57 Tỷ lệ lấp đầy theo phòng/khoa Cho biết phòng nào đầy, sắp đầy hoặc còn nhiều giường
trống.
Cao GĐ1
58 Số bệnh nhân dự kiến ra viện Hỗ trợ dự báo lượng giường trống trong ngày để điều phối. Cao GĐ1
59 Số hồ sơ ra viện còn thiếu
Cho biết còn bao nhiêu hồ sơ đang cần bổ sung hoặc xác
nhận.
Cao GĐ1
60 Biểu đồ xu hướng
Theo dõi số liệu theo ngày, tuần hoặc tháng dưới dạng biểu
đồ trực quan.
Trung
bình
GĐ2
61 Cảnh báo phòng đầy
Highlight các phòng đã full công suất để tránh điều phối
nhầm.
Cao GĐ1
62
Cảnh báo bệnh nhân chưa xếp
giường
Thông báo các trường hợp đã tiếp nhận nhưng chưa được
phân giường.
Trung
bình
GĐ2
63 Cảnh báo hồ sơ quá hạn xử lý
Nhắc các trường hợp hồ sơ hoặc thủ tục đang chậm hơn thời
gian quy định.
Trung
bình
GĐ2
4.9. Phân hệ quản trị danh mục và cấu hình
STT Chức năng Mô tả Ưu tiên GĐ
64
Quản lý danh mục phòng/loại
phòng
Cập nhật danh mục phòng, khu, loại phòng dùng trong hệ
thống.
Cao GĐ1
65 Quản lý danh mục trạng thái
Khai báo các trạng thái bệnh nhân, giường, hồ sơ và quy
trình.
Cao GĐ1
66 Cấu hình ngưỡng cảnh báo
Thiết lập khi nào hệ thống cảnh báo phòng sắp đầy hoặc quá
tải.
Trung
bình
GĐ2
67 Cấu hình checklist hồ sơ Cho phép tùy biến các mục cần kiểm tra trước khi ra viện.
Trung
bình
GĐ2
68 Cấu hình rule xếp giường
Thiết lập điều kiện dùng cho logic phân phòng/giường tự
động.
Thấp GĐ3
69
Quản lý nội dung hiển thị
dashboard
Tùy chọn chỉ số hoặc widget hiển thị cho từng đơn vị sử
dụng.
Thấp GĐ3
4.10. Phân hệ người dùng, phân quyền và bảo mật
STT Chức năng Mô tả Ưu tiên GĐ
70 Đăng nhập hệ thống Xác thực người dùng bằng tài khoản để truy cập hệ thống. Cao GĐ1
71 Quản lý tài khoản người dùng Tạo, sửa, khóa hoặc ngừng kích hoạt tài khoản. Cao GĐ1
72 Phân quyền theo vai trò
Phân nhóm quyền như admin, quản lý, bác sĩ, điều dưỡng,
nhân viên hồ sơ…
Cao GĐ1
73 Phân quyền theo phạm vi dữ liệu
Người dùng chỉ thấy dữ liệu của khoa, phòng hoặc đơn vị
mình phụ trách.
Cao GĐ1
BRIEF CHỨC NĂNG HỆ THỐNG SAAS Y TẾ NỘI TRÚ
Tài liệu phục vụ trao đổi phạm vi giải pháp | Trang 6
STT Chức năng Mô tả Ưu tiên GĐ
74 Đổi mật khẩu / reset mật khẩu Hỗ trợ quản lý thông tin đăng nhập cơ bản.
Trung
bình
GĐ2
75 Nhật ký thao tác người dùng Lưu vết ai thao tác gì và vào thời điểm nào.
Trung
bình
GĐ2
76 Quản lý phiên đăng nhập
Kiểm soát đăng nhập đồng thời hoặc bảo mật truy cập nâng
cao.
Thấp GĐ3
4.11. Phân hệ báo cáo
STT Chức năng Mô tả Ưu tiên GĐ
77 Báo cáo công suất sử dụng giường Thống kê tỷ lệ sử dụng giường theo ngày, tuần hoặc tháng.
Trung
bình
GĐ2
78 Báo cáo bệnh nhân ra viện
Thống kê số lượng và danh sách bệnh nhân ra viện theo giai
đoạn.
Trung
bình
GĐ2
79 Báo cáo hồ sơ thiếu Tổng hợp các lỗi hoặc trường hợp hồ sơ chưa hoàn tất.
Trung
bình
GĐ2
80 Xuất Excel/PDF Xuất dữ liệu phục vụ lưu trữ, gửi quản lý hoặc báo cáo định
kỳ.
Trung
bình
GĐ2
81 Báo cáo theo khoa/phòng/bác sĩ Phân tích dữ liệu theo phạm vi phụ trách hoặc tuyến báo cáo. Thấp GĐ3
4.12. Phân hệ giao diện, trải nghiệm và vận hành
STT Chức năng Mô tả Ưu tiên GĐ
82 Giao diện web responsive Sử dụng tốt trên máy tính, tablet và điện thoại. Cao GĐ1
83 Tối ưu thao tác mobile Thiết kế thuận tiện cho điều dưỡng hoặc bác sĩ thao tác
nhanh trên điện thoại.
Cao GĐ1
84 Popup thao tác nhanh
Xem và xử lý thông tin ngay trên cùng màn hình mà không
cần chuyển trang nhiều.
Cao GĐ1
85 Màu sắc trạng thái trực quan
Dùng màu để phân biệt giường trống, đầy, cảnh báo hoặc hồ
sơ thiếu.
Trung
bình
GĐ2
86 Bộ lọc nhanh tại danh sách Lọc theo ngày, khoa, phòng, trạng thái và người phụ trách. Cao GĐ1
87 Tìm kiếm nhanh toàn hệ thống
Tra cứu bệnh nhân, phòng, giường và hồ sơ từ một ô tìm
kiếm trung tâm.
Trung
bình
GĐ2
4.13. Phân hệ SaaS / mở rộng nền tảng
STT Chức năng Mô tả Ưu tiên GĐ
88 Quản lý đa đơn vị (multi-tenant)
Cho phép nhiều đơn vị dùng chung hệ thống nhưng dữ liệu
tách biệt.
Trung
bình
GĐ2
89 Cấu hình riêng cho từng đơn vị
Mỗi nơi có thể có danh mục, phòng, checklist và dashboard
riêng.
Trung
bình
GĐ2
90 Subdomain hoặc domain riêng
Mỗi đơn vị có thể dùng subdomain hoặc tên miền riêng khi
cần.
Thấp GĐ3
BRIEF CHỨC NĂNG HỆ THỐNG SAAS Y TẾ NỘI TRÚ
Tài liệu phục vụ trao đổi phạm vi giải pháp | Trang 7
STT Chức năng Mô tả Ưu tiên GĐ
91 Quản lý gói dịch vụ
Phân chia gói Basic, Pro, Enterprise nếu sản phẩm đi theo
hướng thương mại.
Thấp GĐ3
92 Giới hạn tài nguyên theo gói
Giới hạn số user, số khoa, phòng hoặc tính năng theo từng
gói.
Thấp GĐ3
4.14. Phân hệ tích hợp và nâng cao
STT Chức năng Mô tả Ưu tiên GĐ
93 Kết nối HIS/EMR hiện có
Đồng bộ thông tin bệnh nhân hoặc quy trình với hệ thống sẵn
có của khách.
Thấp GĐ3
94 Thông báo realtime
Cảnh báo khi phòng đầy, có ca mới hoặc hồ sơ thiếu cần xử lý
gấp.
Trung
bình
GĐ2
95 In danh sách / biên bản
Hỗ trợ in biểu mẫu, danh sách bệnh nhân hoặc biên bản thao
tác.
Trung
bình
GĐ2
96 QR tại phòng/giường
Quét mã để mở nhanh thông tin phòng hoặc giường ngay
trên điện thoại.
Thấp GĐ3
97 AI gợi ý xếp giường
Gợi ý giường phù hợp dựa trên dữ liệu, trạng thái và rule
nghiệp vụ.
Thấp GĐ3
98 Rule engine nghiệp vụ
Tự động hóa các bước theo quy tắc vận hành được cấu hình
sẵn.
Thấp GĐ3
99 Theo dõi SLA xử lý hồ sơ
Đo thời gian xử lý từng bước để kiểm soát hiệu quả vận
hành.
Thấp GĐ3
100 Audit nâng cao
Lưu vết thay đổi dữ liệu chi tiết ở mức nâng cao phục vụ
kiểm soát nội bộ.
Thấp GĐ3
5. Đề xuất phân giai đoạn triển khai
Giai đoạn Nội dung đề xuất
Giai đoạn 1 – MVP / triển khai
nhanh
Quản lý phòng – giường, bệnh nhân nội trú, hiển thị tên bệnh nhân theo giường,
đếm số giường trống, cảnh báo phòng đầy, danh sách dự kiến ra viện, kiểm tra
hồ sơ ra viện, dashboard cơ bản, tài khoản và phân quyền cơ bản, giao diện
responsive trên mobile.
Giai đoạn 2 – Mở rộng vận hành
Dashboard nâng cao, lịch sử sử dụng giường, biểu đồ, checklist/biểu mẫu linh
hoạt, báo cáo xuất file, thông báo realtime, cấu hình ngưỡng cảnh báo, đa đơn vị
cơ bản và các tiện ích hỗ trợ điều phối.
Giai đoạn 3 – SaaS hoàn chỉnh /
thương mại hóa
Tự động xếp giường, rule engine, multi-tenant hoàn chỉnh, domain riêng, gói dịch
vụ, tích hợp HIS/EMR, AI gợi ý điều phối và audit nâng cao.
6. Ghi chú sử dụng tài liệu
Tài liệu này là bản brief chức năng phục vụ giai đoạn trao đổi và chốt phạm vi ban đầu. Trong quá trình triển khai
chính thức, từng chức năng sẽ cần tiếp tục được làm rõ về quy trình nghiệp vụ, quyền hạn người dùng, form dữ
liệu, quy tắc cảnh báo, cấu hình báo cáo và phạm vi tích hợp thực tế.