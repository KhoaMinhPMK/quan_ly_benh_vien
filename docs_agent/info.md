TÀI LIỆU PHÂN TÍCH USE CASE CHI TIẾT
VÀ ĐẶC TẢ UI/UX HOÀN CHỈNH
Nền tảng SaaS quản lý bệnh nhân – phòng – giường – hồ sơ – ra viện
Mục đích	Chuyển brief chức năng thành tài liệu dùng trực tiếp cho UI/UX design, product design và handoff cho dev.
Đầu vào	Brief chức năng hệ thống SaaS y tế nội trú (14 phân hệ, 100 tính năng, 3 giai đoạn).
Đầu ra kỳ vọng	Xác định rõ màn hình, use case, luồng chính/phụ, popup, rule hiển thị, trạng thái, lỗi, dữ liệu cần có và các chức năng trung gian.
Phạm vi	Web responsive + tối ưu mobile cho nghiệp vụ nội trú; có xét đến mở rộng multi-tenant/SaaS về sau.
Cách đọc	Đọc theo 3 lớp: toàn cục → màn hình → từng tính năng. Có thể giao riêng cho designer từng module.
Nguồn chuyển hóa: tài liệu brief đầu vào của dự án. Phiên bản này chủ động đào sâu nghiệp vụ để đủ mức thiết kế UI chi tiết, không chỉ dừng ở danh sách tính năng.
 
1. Mục tiêu của tài liệu
Tài liệu này được tạo để lấp khoảng trống giữa brief chức năng và bản thiết kế UI hoàn chỉnh. Brief đầu vào đã nêu mục tiêu vận hành nội trú, nhóm người dùng, 14 phân hệ và 100 tính năng; tuy nhiên để thiết kế ra giao diện thực tế cần thêm lớp use case, điều kiện thao tác, luật ẩn/hiện, popup trung gian, trạng thái dữ liệu và mối liên hệ giữa các màn hình.
Do đó, tài liệu này biến mỗi nhóm chức năng thành một đặc tả có thể giao trực tiếp cho designer: biết màn nào cần tồn tại, người dùng nào dùng màn đó, trên màn đó phải có thông tin gì, các nút nào được mở hoặc khóa, khi bấm thì cần popup nào, và nếu dữ liệu không hợp lệ thì phản hồi ra sao.
Tài liệu được tối ưu theo hướng thiết kế được UI hoàn chỉnh trước, sau đó mới tách tiếp thành wireframe, design system, task backend/API và test case.
2. Tóm tắt phạm vi nghiệp vụ
Trọng tâm của sản phẩm là quản lý bệnh nhân nội trú gắn với phòng – giường, theo dõi công suất giường theo thời gian thực, hỗ trợ luồng chờ ra viện, rà hồ sơ ra viện và theo dõi dashboard điều hành. Sản phẩm phục vụ nhiều vai trò khác nhau trong bệnh viện/khoa nội trú nên thiết kế phải ưu tiên ngữ cảnh, tốc độ thao tác và phân quyền theo phạm vi dữ liệu.
Thiết kế UI không được xem từng tính năng độc lập. Phần lớn giá trị hệ thống nằm ở việc nối chuỗi các tính năng thành các luồng vận hành hoàn chỉnh: tiếp nhận bệnh nhân → chờ phân giường → nằm điều trị → chuyển phòng/giường nếu cần → vào luồng chờ ra viện → rà hồ sơ → xác nhận hoàn tất → giải phóng giường → cập nhật dashboard/báo cáo.
3. Nhóm người dùng chính và nhu cầu giao diện
Vai trò	Mục tiêu sử dụng	Điểm UI cần ưu tiên
Ban quản lý / Trưởng khoa	Theo dõi công suất giường, dashboard vận hành, cảnh báo và báo cáo điều hành.	Nhìn nhanh tình trạng vận hành, phòng đầy, bệnh nhân chờ ra viện, hồ sơ thiếu.
Bác sĩ	Theo dõi bệnh nhân phụ trách, cập nhật trạng thái điều trị, xác nhận chờ ra viện/ra viện.	Vào thẳng danh sách bệnh nhân phụ trách, trạng thái điều trị, xác nhận bước chờ ra viện.
Điều dưỡng / Y tá	Phân giường, chuyển phòng/giường, cập nhật trạng thái giường, hỗ trợ điều phối nội trú.	Thao tác thật nhanh trên phòng – giường, chuyển/xếp giường, nhìn rõ tình trạng từng giường.
Nhân viên hồ sơ	Rà soát checklist hồ sơ, đánh dấu thiếu/đủ, ghi chú cần bổ sung, theo dõi tiến độ.	Rà checklist nhanh, biết ngay mục nào thiếu, ai cần xử lý tiếp theo.
Tiếp nhận / Hành chính	Tạo hồ sơ ban đầu, nhập dữ liệu nội trú, đưa bệnh nhân vào luồng chờ phân giường.	Tạo hồ sơ gọn, ít lỗi, đưa ca mới vào luồng chờ phân giường.
Quản trị hệ thống	Quản lý người dùng, phân quyền, cấu hình danh mục, cấu hình tenant và bảo mật.	Quản trị cấu hình, danh mục, người dùng, quyền, tenant, cảnh báo.
4. Nguyên tắc UI/UX nền bắt buộc
•	Một hành động nghiệp vụ quan trọng phải có đúng ngữ cảnh. Ví dụ: xếp giường không nên ép người dùng rời màn hình phòng–giường; nên mở drawer/modal ngay trên sơ đồ phòng.
•	Các trạng thái phải hiển thị bằng 3 lớp cùng lúc: text, màu và icon/badge. Không phụ thuộc vào màu sắc đơn thuần.
•	Màn desktop tối ưu cho điều phối tổng thể; màn mobile tối ưu cho tác vụ nhanh tại chỗ như xem giường, chuyển giường, rà hồ sơ, xác nhận checklist.
•	Mọi danh sách quan trọng đều phải có bộ lọc nhanh, ô tìm kiếm và khả năng drill-down sang chi tiết hoặc popup xử lý.
•	Khi có thao tác làm thay đổi công suất giường hoặc trạng thái bệnh nhân, các chỉ số liên quan phải cập nhật tức thời hoặc gần thời gian thực ở các màn khác.
•	UI phải phân biệt rõ thông tin chỉ xem với thông tin có thể sửa; tránh tạo cảm giác mọi thứ đều editable.
5. Kiến trúc thông tin đề xuất
Menu trái cấp 1 nên gồm: Dashboard, Điều phối phòng–giường, Bệnh nhân nội trú, Chờ phân giường, Dự kiến ra viện, Hồ sơ ra viện, Báo cáo, Cấu hình, Quản trị người dùng, Thông báo. Nếu đi theo SaaS hoàn chỉnh thì thêm Tenant và Gói dịch vụ cho admin nền tảng.
Thanh top bar nên chứa: tìm kiếm toàn hệ thống, chọn đơn vị/khoa đang xem, badge thông báo, truy cập hồ sơ cá nhân, và hành động nhanh theo vai trò.
6. Danh mục màn hình đề xuất
Mã màn	Tên màn	Mục đích	Người dùng chính
SCR-01	Đăng nhập	Xác thực tài khoản và điều hướng theo vai trò	Admin, quản lý, bác sĩ, điều dưỡng, hồ sơ
SCR-02	Dashboard điều hành	Tổng quan bệnh nhân, giường, cảnh báo, ra viện	Ban quản lý, trưởng khoa
SCR-03	Bảng điều phối phòng – giường	Xem toàn bộ phòng/giường và thao tác chuyển/xếp	Điều dưỡng, quản lý khoa
SCR-04	Popup/Drawer xếp giường	Chọn giường, kiểm tra xung đột, lưu phân giường	Điều dưỡng
SCR-05	Danh sách bệnh nhân nội trú	Tra cứu và lọc danh sách bệnh nhân đang điều trị	Bác sĩ, điều dưỡng, hành chính
SCR-06	Chi tiết bệnh nhân nội trú	Xem hồ sơ, vị trí giường, trạng thái, ghi chú, lịch sử	Bác sĩ, điều dưỡng, hồ sơ
SCR-07	Tạo hồ sơ nội trú	Nhập thông tin tiếp nhận và tạo bản ghi bệnh nhân	Hành chính, điều dưỡng
SCR-08	Danh sách chờ phân giường	Theo dõi bệnh nhân đã tiếp nhận nhưng chưa có giường	Điều dưỡng, hành chính
SCR-09	Danh sách dự kiến ra viện	Điều phối luồng chờ ra viện theo ngày	Bác sĩ, hồ sơ, quản lý
SCR-10	Popup kiểm tra hồ sơ ra viện	Rà checklist, đánh dấu đủ/thiếu, ghi chú bổ sung	Nhân viên hồ sơ, bác sĩ
SCR-11	Lịch sử phòng – giường	Tra cứu lịch sử sử dụng giường và di chuyển bệnh nhân	Quản lý, điều dưỡng
SCR-12	Quản lý đơn vị – khoa – khu	Khai báo cấu trúc tổ chức, khoa, block, tầng	Quản trị hệ thống
SCR-13	Quản lý phòng – giường – loại phòng	Khai báo phòng, giường, loại phòng, sức chứa, trạng thái	Quản trị hệ thống
SCR-14	Quản lý danh mục trạng thái	Quản lý bộ trạng thái bệnh nhân, giường, hồ sơ	Quản trị hệ thống
SCR-15	Builder checklist / biểu mẫu	Tạo checklist và biểu mẫu nghiệp vụ theo khoa	Quản trị hệ thống, hồ sơ
SCR-16	Quản lý người dùng và phân quyền	Tạo tài khoản, vai trò, phạm vi dữ liệu	Quản trị hệ thống
SCR-17	Trung tâm báo cáo	Xem và xuất báo cáo theo bộ lọc	Quản lý, hồ sơ
SCR-18	Trung tâm thông báo	Danh sách cảnh báo realtime và việc cần xử lý	Tất cả vai trò tùy quyền
SCR-19	Cấu hình tenant / đơn vị	Cấu hình tenant, subdomain, dashboard, checklist riêng	Admin SaaS
SCR-20	Quản lý gói dịch vụ	Khai báo gói, giới hạn tài nguyên, tính năng theo gói	Admin SaaS
SCR-21	Tích hợp HIS/EMR	Khai báo endpoint, mapping dữ liệu, nhật ký đồng bộ	Admin hệ thống
SCR-22	Màn hình thao tác nhanh mobile	Shortcut xếp giường, chuyển giường, rà hồ sơ	Điều dưỡng, bác sĩ, hồ sơ
7. Luồng nghiệp vụ end-to-end cốt lõi
Luồng 1 — Tiếp nhận và phân giường: Tạo hồ sơ nội trú → bệnh nhân vào danh sách chờ phân giường → điều dưỡng mở popup xếp giường → hệ thống kiểm tra xung đột và sức chứa → gắn bệnh nhân vào giường → dashboard cập nhật.
Luồng 2 — Điều trị và điều phối nội trú: Trong quá trình điều trị, bệnh nhân có thể được chuyển giường hoặc chuyển phòng → lịch sử di chuyển được lưu → công suất phòng thay đổi tức thời → các cảnh báo đầy/sắp đầy được tính lại.
Luồng 3 — Chờ ra viện và kiểm tra hồ sơ: Bác sĩ hoặc bộ phận liên quan đánh dấu chờ ra viện → bệnh nhân xuất hiện trong danh sách dự kiến ra viện → nhân viên hồ sơ mở popup rà checklist → đánh dấu đủ/thiếu, ghi chú bổ sung nếu cần.
Luồng 4 — Hoàn tất ra viện: Khi hồ sơ đủ điều kiện, người có quyền xác nhận ra viện → bệnh nhân sang trạng thái đã ra viện → giường được giải phóng → lịch sử ra viện và dashboard cập nhật.
Luồng 5 — Quản trị và mở rộng SaaS: Admin quản trị đơn vị, khoa, phòng, giường, danh mục trạng thái, người dùng, quyền; về sau mở rộng tenant, gói dịch vụ, domain riêng, rule engine và tích hợp HIS/EMR.
8. Bộ trạng thái nghiệp vụ cần thống nhất trước khi design
•	Phòng: Hoạt động / Tạm khóa / Bảo trì / Đầy / Sắp đầy
•	Giường: Trống / Có bệnh nhân / Chờ vệ sinh / Khóa sử dụng / Đang chuyển
•	Bệnh nhân: Chờ tiếp nhận / Chờ phân giường / Đang điều trị / Chờ thủ thuật / Chờ ra viện / Đã ra viện / Chuyển viện
•	Hồ sơ: Chưa kiểm tra / Đang rà soát / Thiếu / Cần bổ sung / Đủ / Đã xác nhận
 
9. Đặc tả chi tiết theo từng tính năng
Cấu trúc mỗi tính năng gồm: mục tiêu use case, vai trò, màn hình liên quan, điều kiện đầu vào, luồng chính, chức năng trung gian, trạng thái/rule UI, ngoại lệ, thành phần UI, dữ liệu hiển thị và gợi ý bố cục. Đây là mức đủ để UI/UX designer dựng wireframe chi tiết và phối hợp tiếp với BA/dev.
M1. Quản lý tổ chức và cấu trúc hệ thống
Nhóm màn hình	Thiết lập tổ chức – khoa – khu – phòng – giường	Vai trò chính	Quản trị hệ thống
Màn hình liên quan	SCR-12 Quản lý đơn vị – khoa – khu, SCR-13 Quản lý phòng – giường – loại phòng	Số tính năng	9
F001. Quản lý đơn vị sử dụng
Mục tiêu use case: Tạo và quản lý từng bệnh viện, cơ sở hoặc đơn vị sử dụng hệ thống.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-12 Quản lý đơn vị – khoa – khu, SCR-13 Quản lý phòng – giường – loại phòng
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục chuẩn quản trị: thanh hành động trên cùng, bảng dữ liệu ở giữa, panel chi tiết hoặc modal cho tạo/sửa; các bộ lọc đặt trên bảng.
Ưu tiên / giai đoạn: Cao / GĐ1
F002. Quản lý khoa/phòng ban
Mục tiêu use case: Khai báo khoa, bộ phận, nhóm điều trị và phân nhóm dữ liệu theo đơn vị vận hành.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-12 Quản lý đơn vị – khoa – khu, SCR-13 Quản lý phòng – giường – loại phòng
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F003. Quản lý khu điều trị
Mục tiêu use case: Khai báo khu, block, tầng hoặc khu nội trú phục vụ điều phối quy mô lớn.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-12 Quản lý đơn vị – khoa – khu, SCR-13 Quản lý phòng – giường – loại phòng
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục chuẩn quản trị: thanh hành động trên cùng, bảng dữ liệu ở giữa, panel chi tiết hoặc modal cho tạo/sửa; các bộ lọc đặt trên bảng.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F004. Quản lý phòng bệnh
Mục tiêu use case: Tạo danh sách phòng bệnh và thông tin cơ bản của từng phòng.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-12 Quản lý đơn vị – khoa – khu, SCR-13 Quản lý phòng – giường – loại phòng
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F005. Quản lý giường bệnh
Mục tiêu use case: Tạo danh sách giường thuộc từng phòng, dùng làm nền cho toàn bộ logic điều phối.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-12 Quản lý đơn vị – khoa – khu, SCR-13 Quản lý phòng – giường – loại phòng
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F006. Gán mã phòng/giường
Mục tiêu use case: Mã hóa phòng và giường theo quy chuẩn để dễ tra cứu, ví dụ P101-G01.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-12 Quản lý đơn vị – khoa – khu, SCR-13 Quản lý phòng – giường – loại phòng
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F007. Phân loại phòng
Mục tiêu use case: Khai báo loại phòng như phòng thường, phòng dịch vụ, cách ly, ICU…
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-12 Quản lý đơn vị – khoa – khu, SCR-13 Quản lý phòng – giường – loại phòng
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Tenant, Gói dịch vụ
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F008. Cấu hình sức chứa phòng
Mục tiêu use case: Xác định số giường tối đa cho từng phòng để phục vụ cảnh báo công suất.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-12 Quản lý đơn vị – khoa – khu, SCR-13 Quản lý phòng – giường – loại phòng
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Cảnh báo có cấp độ màu: thông tin, cần chú ý, khẩn, đã xử lý.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Khoảng thời gian, Khoa
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Cao / GĐ1
F009. Trạng thái phòng
Mục tiêu use case: Quản lý trạng thái hoạt động, tạm khóa hoặc bảo trì của từng phòng.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-12 Quản lý đơn vị – khoa – khu, SCR-13 Quản lý phòng – giường – loại phòng
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Trung bình / GĐ2
 
M2. Quản lý phòng – giường
Nhóm màn hình	Bảng điều phối phòng giường	Vai trò chính	Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan	SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile	Số tính năng	12
F010. Danh sách phòng theo thời gian thực
Mục tiêu use case: Hiển thị từng phòng đang có bao nhiêu giường sử dụng và bao nhiêu giường còn trống.
Vai trò chính: Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F011. Xem trạng thái từng giường
Mục tiêu use case: Thể hiện trạng thái giường: trống, có bệnh nhân, chờ vệ sinh, khóa sử dụng…
Vai trò chính: Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F012. Hiển thị tên bệnh nhân trên từng giường
Mục tiêu use case: Cho biết giường số 1 là ai, giường số 2 là ai ngay trên giao diện.
Vai trò chính: Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F013. Đếm số giường trống theo phòng
Mục tiêu use case: Tự động tính toán số giường còn trống để hỗ trợ điều phối nhanh.
Vai trò chính: Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F014. Cảnh báo phòng đầy
Mục tiêu use case: Hiển thị cảnh báo khi số bệnh nhân đạt tối đa sức chứa của phòng.
Vai trò chính: Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
•	Cảnh báo có cấp độ màu: thông tin, cần chú ý, khẩn, đã xử lý.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Cao / GĐ1
F015. Cảnh báo phòng sắp đầy
Mục tiêu use case: Cảnh báo khi số giường trống thấp hơn ngưỡng cài đặt, ví dụ chỉ còn 1 giường.
Vai trò chính: Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Hệ thống theo dõi các chỉ số ngưỡng hoặc sự kiện phát sinh từ nghiệp vụ nội trú.
•	Khi điều kiện cảnh báo thỏa mãn, hệ thống sinh alert với mức độ ưu tiên và nguồn phát sinh.
•	Cảnh báo được hiển thị tại dashboard, badge thông báo, hàng dữ liệu hoặc màu trạng thái trực tiếp.
•	Người dùng có thể click vào cảnh báo để mở đúng màn xử lý liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Cảnh báo có cấp độ màu: thông tin, cần chú ý, khẩn, đã xử lý.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Khoảng thời gian, Khoa
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F016. Chuyển giường
Mục tiêu use case: Chuyển bệnh nhân sang giường khác trong cùng phòng hoặc cùng khoa.
Vai trò chính: Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng chọn bệnh nhân hoặc giường cần thao tác từ danh sách, card hoặc popup nhanh.
•	Hệ thống hiển thị các vị trí hợp lệ và đồng thời khóa mềm dữ liệu đang được thao tác để tránh xung đột.
•	Người dùng xác nhận vị trí mới hoặc hành động kết thúc chiếm dụng giường.
•	Hệ thống kiểm tra xung đột, cập nhật bệnh nhân, giường, phòng, lịch sử di chuyển và các chỉ số công suất.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Khóa mềm bản ghi trong thời gian thao tác.
•	Kiểm tra xung đột trước khi commit.
•	Sinh bản ghi lịch sử di chuyển.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F017. Chuyển phòng
Mục tiêu use case: Chuyển bệnh nhân từ phòng này sang phòng khác và cập nhật dữ liệu tức thời.
Vai trò chính: Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng chọn bệnh nhân hoặc giường cần thao tác từ danh sách, card hoặc popup nhanh.
•	Hệ thống hiển thị các vị trí hợp lệ và đồng thời khóa mềm dữ liệu đang được thao tác để tránh xung đột.
•	Người dùng xác nhận vị trí mới hoặc hành động kết thúc chiếm dụng giường.
•	Hệ thống kiểm tra xung đột, cập nhật bệnh nhân, giường, phòng, lịch sử di chuyển và các chỉ số công suất.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Khóa mềm bản ghi trong thời gian thao tác.
•	Kiểm tra xung đột trước khi commit.
•	Sinh bản ghi lịch sử di chuyển.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F018. Giải phóng giường
Mục tiêu use case: Khi bệnh nhân ra viện hoặc chuyển viện, giường trở về trạng thái trống.
Vai trò chính: Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng chọn bệnh nhân hoặc giường cần thao tác từ danh sách, card hoặc popup nhanh.
•	Hệ thống hiển thị các vị trí hợp lệ và đồng thời khóa mềm dữ liệu đang được thao tác để tránh xung đột.
•	Người dùng xác nhận vị trí mới hoặc hành động kết thúc chiếm dụng giường.
•	Hệ thống kiểm tra xung đột, cập nhật bệnh nhân, giường, phòng, lịch sử di chuyển và các chỉ số công suất.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Khóa mềm bản ghi trong thời gian thao tác.
•	Kiểm tra xung đột trước khi commit.
•	Sinh bản ghi lịch sử di chuyển.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F019. Lịch sử sử dụng giường
Mục tiêu use case: Tra cứu giường đã từng có bệnh nhân nào sử dụng và trong khoảng thời gian nào.
Vai trò chính: Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F020. Sơ đồ trực quan phòng – giường
Mục tiêu use case: Hiển thị dạng card hoặc sơ đồ để nhìn nhanh công suất từng phòng.
Vai trò chính: Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F021. Tìm kiếm theo phòng/giường/bệnh nhân
Mục tiêu use case: Tra cứu nhanh bệnh nhân đang nằm ở đâu hoặc giường nào đang sử dụng.
Vai trò chính: Điều dưỡng / Y tá, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-11 Lịch sử phòng – giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
 
M3. Xếp giường và điều phối nội trú
Nhóm màn hình	Tiếp nhận và điều phối	Vai trò chính	Điều dưỡng / Y tá, Tiếp nhận / Hành chính, Ban quản lý / Trưởng khoa
Màn hình liên quan	SCR-03 Bảng điều phối phòng – giường, SCR-04 Popup/Drawer xếp giường, SCR-08 Danh sách chờ phân giường, SCR-22 Màn hình thao tác nhanh mobile	Số tính năng	7
F022. Xếp giường thủ công
Mục tiêu use case: Điều dưỡng hoặc người phụ trách tự chọn phòng và giường phù hợp cho bệnh nhân.
Vai trò chính: Điều dưỡng / Y tá, Tiếp nhận / Hành chính, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-04 Popup/Drawer xếp giường, SCR-08 Danh sách chờ phân giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng chọn bệnh nhân hoặc giường cần thao tác từ danh sách, card hoặc popup nhanh.
•	Hệ thống hiển thị các vị trí hợp lệ và đồng thời khóa mềm dữ liệu đang được thao tác để tránh xung đột.
•	Người dùng xác nhận vị trí mới hoặc hành động kết thúc chiếm dụng giường.
•	Hệ thống kiểm tra xung đột, cập nhật bệnh nhân, giường, phòng, lịch sử di chuyển và các chỉ số công suất.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Khóa mềm bản ghi trong thời gian thao tác.
•	Kiểm tra xung đột trước khi commit.
•	Sinh bản ghi lịch sử di chuyển.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F023. Gợi ý giường trống
Mục tiêu use case: Hệ thống lọc ra các giường còn trống để người dùng chọn nhanh.
Vai trò chính: Điều dưỡng / Y tá, Tiếp nhận / Hành chính, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-04 Popup/Drawer xếp giường, SCR-08 Danh sách chờ phân giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F024. Gợi ý theo loại phòng
Mục tiêu use case: Gợi ý dựa trên loại phòng, nhu cầu đặc biệt hoặc chuyên khoa.
Vai trò chính: Điều dưỡng / Y tá, Tiếp nhận / Hành chính, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-04 Popup/Drawer xếp giường, SCR-08 Danh sách chờ phân giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F025. Tự động xếp giường
Mục tiêu use case: Hệ thống tự đề xuất hoặc gán giường phù hợp cho bệnh nhân theo rule.
Vai trò chính: Điều dưỡng / Y tá, Tiếp nhận / Hành chính, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-04 Popup/Drawer xếp giường, SCR-08 Danh sách chờ phân giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng chọn bệnh nhân hoặc giường cần thao tác từ danh sách, card hoặc popup nhanh.
•	Hệ thống hiển thị các vị trí hợp lệ và đồng thời khóa mềm dữ liệu đang được thao tác để tránh xung đột.
•	Người dùng xác nhận vị trí mới hoặc hành động kết thúc chiếm dụng giường.
•	Hệ thống kiểm tra xung đột, cập nhật bệnh nhân, giường, phòng, lịch sử di chuyển và các chỉ số công suất.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Khóa mềm bản ghi trong thời gian thao tác.
•	Kiểm tra xung đột trước khi commit.
•	Sinh bản ghi lịch sử di chuyển.
•	Tổng hợp số liệu theo snapshot hoặc truy vấn tổng hợp.
•	Bộ lọc thời gian/khoa/phòng.
•	Chức năng drill-down từ KPI sang danh sách chi tiết.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F026. Kiểm tra xung đột xếp giường
Mục tiêu use case: Ngăn xếp trùng vào giường đang có người hoặc đang khóa sử dụng.
Vai trò chính: Điều dưỡng / Y tá, Tiếp nhận / Hành chính, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-04 Popup/Drawer xếp giường, SCR-08 Danh sách chờ phân giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng chọn bệnh nhân hoặc giường cần thao tác từ danh sách, card hoặc popup nhanh.
•	Hệ thống hiển thị các vị trí hợp lệ và đồng thời khóa mềm dữ liệu đang được thao tác để tránh xung đột.
•	Người dùng xác nhận vị trí mới hoặc hành động kết thúc chiếm dụng giường.
•	Hệ thống kiểm tra xung đột, cập nhật bệnh nhân, giường, phòng, lịch sử di chuyển và các chỉ số công suất.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Khóa mềm bản ghi trong thời gian thao tác.
•	Kiểm tra xung đột trước khi commit.
•	Sinh bản ghi lịch sử di chuyển.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F027. Danh sách chờ phân giường
Mục tiêu use case: Quản lý bệnh nhân đã tiếp nhận nhưng chưa được phân giường chính thức.
Vai trò chính: Điều dưỡng / Y tá, Tiếp nhận / Hành chính, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-04 Popup/Drawer xếp giường, SCR-08 Danh sách chờ phân giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F028. Quy tắc phân bổ giường
Mục tiêu use case: Cấu hình quy tắc theo giới tính, chuyên khoa, mức độ ưu tiên hoặc tiêu chí riêng.
Vai trò chính: Điều dưỡng / Y tá, Tiếp nhận / Hành chính, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-04 Popup/Drawer xếp giường, SCR-08 Danh sách chờ phân giường, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Thấp / GĐ3
 
M4. Quản lý bệnh nhân nội trú
Nhóm màn hình	Danh sách bệnh nhân và hồ sơ điều trị	Vai trò chính	Bác sĩ, Điều dưỡng / Y tá, Tiếp nhận / Hành chính
Màn hình liên quan	SCR-05 Danh sách bệnh nhân nội trú, SCR-06 Chi tiết bệnh nhân nội trú, SCR-07 Tạo hồ sơ nội trú	Số tính năng	8
F029. Tạo hồ sơ bệnh nhân nội trú
Mục tiêu use case: Khai báo bệnh nhân khi tiếp nhận điều trị nội trú.
Vai trò chính: Bác sĩ, Điều dưỡng / Y tá, Tiếp nhận / Hành chính
Màn hình liên quan: SCR-05 Danh sách bệnh nhân nội trú, SCR-06 Chi tiết bệnh nhân nội trú, SCR-07 Tạo hồ sơ nội trú
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái, Tenant
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Cao / GĐ1
F030. Danh sách bệnh nhân đang điều trị
Mục tiêu use case: Hiển thị toàn bộ bệnh nhân hiện có trong khoa hoặc đơn vị phụ trách.
Vai trò chính: Bác sĩ, Điều dưỡng / Y tá, Tiếp nhận / Hành chính
Màn hình liên quan: SCR-05 Danh sách bệnh nhân nội trú, SCR-06 Chi tiết bệnh nhân nội trú, SCR-07 Tạo hồ sơ nội trú
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Cao / GĐ1
F031. Xem thông tin bệnh nhân
Mục tiêu use case: Hiển thị họ tên, tuổi, mã bệnh nhân, chẩn đoán, bác sĩ phụ trách…
Vai trò chính: Bác sĩ, Điều dưỡng / Y tá, Tiếp nhận / Hành chính
Màn hình liên quan: SCR-05 Danh sách bệnh nhân nội trú, SCR-06 Chi tiết bệnh nhân nội trú, SCR-07 Tạo hồ sơ nội trú
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Cao / GĐ1
F032. Gắn bệnh nhân với phòng/giường
Mục tiêu use case: Liên kết bệnh nhân với vị trí nằm thực tế trong hệ thống.
Vai trò chính: Bác sĩ, Điều dưỡng / Y tá, Tiếp nhận / Hành chính
Màn hình liên quan: SCR-05 Danh sách bệnh nhân nội trú, SCR-06 Chi tiết bệnh nhân nội trú, SCR-07 Tạo hồ sơ nội trú
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F033. Trạng thái điều trị
Mục tiêu use case: Theo dõi trạng thái như đang điều trị, chờ thủ thuật, chờ ra viện, đã ra viện.
Vai trò chính: Bác sĩ, Điều dưỡng / Y tá, Tiếp nhận / Hành chính
Màn hình liên quan: SCR-05 Danh sách bệnh nhân nội trú, SCR-06 Chi tiết bệnh nhân nội trú, SCR-07 Tạo hồ sơ nội trú
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở bản ghi chi tiết hoặc thao tác nhanh ngay tại danh sách.
•	Người dùng chọn trạng thái mới hoặc nút xác nhận bước nghiệp vụ.
•	Hệ thống kiểm tra điều kiện tiên quyết, các trường bắt buộc và quyền thao tác.
•	Nếu hợp lệ, hệ thống cập nhật trạng thái, ghi lịch sử và đồng bộ các chỉ số phụ thuộc.
Chức năng trung gian / logic nền: 
•	Kiểm tra quyền và hợp lệ dữ liệu.
•	Lưu thay đổi và ghi lịch sử thao tác.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Cao / GĐ1
F034. Lịch sử di chuyển nội trú
Mục tiêu use case: Ghi nhận chuyển phòng, chuyển giường và các mốc thay đổi quan trọng.
Vai trò chính: Bác sĩ, Điều dưỡng / Y tá, Tiếp nhận / Hành chính
Màn hình liên quan: SCR-05 Danh sách bệnh nhân nội trú, SCR-06 Chi tiết bệnh nhân nội trú, SCR-07 Tạo hồ sơ nội trú
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng chọn bệnh nhân hoặc giường cần thao tác từ danh sách, card hoặc popup nhanh.
•	Hệ thống hiển thị các vị trí hợp lệ và đồng thời khóa mềm dữ liệu đang được thao tác để tránh xung đột.
•	Người dùng xác nhận vị trí mới hoặc hành động kết thúc chiếm dụng giường.
•	Hệ thống kiểm tra xung đột, cập nhật bệnh nhân, giường, phòng, lịch sử di chuyển và các chỉ số công suất.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Khóa mềm bản ghi trong thời gian thao tác.
•	Kiểm tra xung đột trước khi commit.
•	Sinh bản ghi lịch sử di chuyển.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F035. Tra cứu nhanh
Mục tiêu use case: Tìm kiếm theo tên, mã bệnh nhân, bác sĩ, phòng hoặc ngày nhập viện.
Vai trò chính: Bác sĩ, Điều dưỡng / Y tá, Tiếp nhận / Hành chính
Màn hình liên quan: SCR-05 Danh sách bệnh nhân nội trú, SCR-06 Chi tiết bệnh nhân nội trú, SCR-07 Tạo hồ sơ nội trú
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F036. Ghi chú nội bộ
Mục tiêu use case: Cho phép ghi chú nhanh liên quan đến ca bệnh hoặc xử lý hành chính nội bộ.
Vai trò chính: Bác sĩ, Điều dưỡng / Y tá, Tiếp nhận / Hành chính
Màn hình liên quan: SCR-05 Danh sách bệnh nhân nội trú, SCR-06 Chi tiết bệnh nhân nội trú, SCR-07 Tạo hồ sơ nội trú
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra quyền và hợp lệ dữ liệu.
•	Lưu thay đổi và ghi lịch sử thao tác.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tên, Mã, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Trung bình / GĐ2
 
M5. Danh sách dự kiến ra viện
Nhóm màn hình	Bảng điều phối ra viện	Vai trò chính	Bác sĩ, Nhân viên hồ sơ, Ban quản lý / Trưởng khoa
Màn hình liên quan	SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện	Số tính năng	6
F037. Danh sách bệnh nhân dự kiến ra viện theo ngày
Mục tiêu use case: Hiển thị danh sách bệnh nhân dự kiến ra viện hôm nay hoặc ngày mai.
Vai trò chính: Bác sĩ, Nhân viên hồ sơ, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái, Tenant
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Cao / GĐ1
F038. Đánh dấu chờ ra viện
Mục tiêu use case: Đánh dấu bệnh nhân đang vào luồng xử lý hoàn tất ra viện.
Vai trò chính: Bác sĩ, Nhân viên hồ sơ, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện.
Luồng chính: 
•	Người dùng mở bản ghi chi tiết hoặc thao tác nhanh ngay tại danh sách.
•	Người dùng chọn trạng thái mới hoặc nút xác nhận bước nghiệp vụ.
•	Hệ thống kiểm tra điều kiện tiên quyết, các trường bắt buộc và quyền thao tác.
•	Nếu hợp lệ, hệ thống cập nhật trạng thái, ghi lịch sử và đồng bộ các chỉ số phụ thuộc.
Chức năng trung gian / logic nền: 
•	Kiểm tra quyền và hợp lệ dữ liệu.
•	Lưu thay đổi và ghi lịch sử thao tác.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Cao / GĐ1
F039. Theo dõi tiến độ xử lý ra viện
Mục tiêu use case: Cho biết hồ sơ đã đủ hay còn thiếu bước nào trước khi hoàn tất.
Vai trò chính: Bác sĩ, Nhân viên hồ sơ, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Cao / GĐ1
F040. Xác nhận hoàn tất ra viện
Mục tiêu use case: Cập nhật trạng thái hoàn tất và đồng thời giải phóng giường bệnh.
Vai trò chính: Bác sĩ, Nhân viên hồ sơ, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng chọn bệnh nhân hoặc giường cần thao tác từ danh sách, card hoặc popup nhanh.
•	Hệ thống hiển thị các vị trí hợp lệ và đồng thời khóa mềm dữ liệu đang được thao tác để tránh xung đột.
•	Người dùng xác nhận vị trí mới hoặc hành động kết thúc chiếm dụng giường.
•	Hệ thống kiểm tra xung đột, cập nhật bệnh nhân, giường, phòng, lịch sử di chuyển và các chỉ số công suất.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F041. Lọc danh sách theo bác sĩ/phòng/khoa
Mục tiêu use case: Giúp từng bộ phận chỉ xem các bệnh nhân thuộc phạm vi mình phụ trách.
Vai trò chính: Bác sĩ, Nhân viên hồ sơ, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F042. Lịch sử ra viện
Mục tiêu use case: Tra cứu danh sách bệnh nhân đã ra viện theo ngày hoặc theo giai đoạn.
Vai trò chính: Bác sĩ, Nhân viên hồ sơ, Ban quản lý / Trưởng khoa
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái, Tenant
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Trung bình / GĐ2
 
M6. Kiểm tra hồ sơ ra viện
Nhóm màn hình	Checklist hồ sơ ra viện	Vai trò chính	Nhân viên hồ sơ, Bác sĩ
Màn hình liên quan	SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện	Số tính năng	7
F043. Checklist hồ sơ ra viện
Mục tiêu use case: Thiết lập danh sách các mục bắt buộc cần hoàn thành trước khi ra viện.
Vai trò chính: Nhân viên hồ sơ, Bác sĩ
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Nhóm câu hỏi động, Progress bar hoàn tất, Textarea ghi chú
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái, Tên mẫu/checklist
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Cao / GĐ1
F044. Kiểm tra hồ sơ nhanh
Mục tiêu use case: Mở popup hoặc màn hình chi tiết để rà soát hồ sơ ngay từ danh sách.
Vai trò chính: Nhân viên hồ sơ, Bác sĩ
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Cao / GĐ1
F045. Hiển thị mục còn thiếu
Mục tiêu use case: Hệ thống chỉ rõ phần nào còn thiếu hoặc chưa được xác nhận.
Vai trò chính: Nhân viên hồ sơ, Bác sĩ
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tên, Mã, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Cao / GĐ1
F046. Trạng thái hồ sơ
Mục tiêu use case: Theo dõi trạng thái đủ, thiếu, chờ xác nhận hoặc cần bổ sung.
Vai trò chính: Nhân viên hồ sơ, Bác sĩ
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện.
Luồng chính: 
•	Người dùng mở bản ghi chi tiết hoặc thao tác nhanh ngay tại danh sách.
•	Người dùng chọn trạng thái mới hoặc nút xác nhận bước nghiệp vụ.
•	Hệ thống kiểm tra điều kiện tiên quyết, các trường bắt buộc và quyền thao tác.
•	Nếu hợp lệ, hệ thống cập nhật trạng thái, ghi lịch sử và đồng bộ các chỉ số phụ thuộc.
Chức năng trung gian / logic nền: 
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Cao / GĐ1
F047. Ghi chú phần cần bổ sung
Mục tiêu use case: Người phụ trách ghi rõ nội dung cần bổ sung để bộ phận liên quan xử lý.
Vai trò chính: Nhân viên hồ sơ, Bác sĩ
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra quyền và hợp lệ dữ liệu.
•	Lưu thay đổi và ghi lịch sử thao tác.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tên, Mã, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F048. Lưu lịch sử kiểm tra
Mục tiêu use case: Lưu thông tin ai kiểm tra, thời điểm và kết quả rà soát.
Vai trò chính: Nhân viên hồ sơ, Bác sĩ
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tenant, Gói dịch vụ, Subdomain/Domain, Cấu hình tích hợp, Rule/điều kiện, Trạng thái kết nối
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F049. Chặn xác nhận ra viện khi hồ sơ chưa đủ
Mục tiêu use case: Không cho hoàn tất quy trình ra viện nếu chưa đủ điều kiện bắt buộc.
Vai trò chính: Nhân viên hồ sơ, Bác sĩ
Màn hình liên quan: SCR-09 Danh sách dự kiến ra viện, SCR-10 Popup kiểm tra hồ sơ ra viện
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Bệnh nhân đã có hồ sơ nội trú và đang ở trạng thái điều trị hoặc chờ ra viện.
Luồng chính: 
•	Người dùng mở bản ghi chi tiết hoặc thao tác nhanh ngay tại danh sách.
•	Người dùng chọn trạng thái mới hoặc nút xác nhận bước nghiệp vụ.
•	Hệ thống kiểm tra điều kiện tiên quyết, các trường bắt buộc và quyền thao tác.
•	Nếu hợp lệ, hệ thống cập nhật trạng thái, ghi lịch sử và đồng bộ các chỉ số phụ thuộc.
Chức năng trung gian / logic nền: 
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Trung bình / GĐ2
 
M7. Checklist / biểu mẫu nghiệp vụ
Nhóm màn hình	Builder biểu mẫu và checklist	Vai trò chính	Quản trị hệ thống, Nhân viên hồ sơ
Màn hình liên quan	SCR-15 Builder checklist / biểu mẫu	Số tính năng	5
F050. Tạo checklist nghiệp vụ
Mục tiêu use case: Tạo các biểu mẫu hoặc checklist cho từng quy trình nội bộ.
Vai trò chính: Quản trị hệ thống, Nhân viên hồ sơ
Màn hình liên quan: SCR-15 Builder checklist / biểu mẫu
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Nhóm câu hỏi động, Progress bar hoàn tất, Textarea ghi chú
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tên mẫu/checklist, Khoa áp dụng, Danh sách item, Loại câu hỏi, Bắt buộc, Thứ tự hiển thị, Ghi chú
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F051. Hỗ trợ nhiều kiểu câu hỏi
Mục tiêu use case: Hỗ trợ checkbox, radio, text, ghi chú và các kiểu nhập liệu cơ bản.
Vai trò chính: Quản trị hệ thống, Nhân viên hồ sơ
Màn hình liên quan: SCR-15 Builder checklist / biểu mẫu
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra quyền và hợp lệ dữ liệu.
•	Lưu thay đổi và ghi lịch sử thao tác.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tên, Mã, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F052. Mẫu riêng theo từng khoa
Mục tiêu use case: Mỗi khoa có thể có bộ biểu mẫu hoặc checklist riêng.
Vai trò chính: Quản trị hệ thống, Nhân viên hồ sơ
Màn hình liên quan: SCR-15 Builder checklist / biểu mẫu
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Nhóm câu hỏi động, Progress bar hoàn tất, Textarea ghi chú
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Tên mẫu/checklist, Khoa áp dụng
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F053. Bắt buộc hoàn thành biểu mẫu
Mục tiêu use case: Một số bước chỉ được chuyển tiếp khi đã hoàn tất checklist bắt buộc.
Vai trò chính: Quản trị hệ thống, Nhân viên hồ sơ
Màn hình liên quan: SCR-15 Builder checklist / biểu mẫu
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng chọn bệnh nhân hoặc giường cần thao tác từ danh sách, card hoặc popup nhanh.
•	Hệ thống hiển thị các vị trí hợp lệ và đồng thời khóa mềm dữ liệu đang được thao tác để tránh xung đột.
•	Người dùng xác nhận vị trí mới hoặc hành động kết thúc chiếm dụng giường.
•	Hệ thống kiểm tra xung đột, cập nhật bệnh nhân, giường, phòng, lịch sử di chuyển và các chỉ số công suất.
Chức năng trung gian / logic nền: 
•	Khóa mềm bản ghi trong thời gian thao tác.
•	Kiểm tra xung đột trước khi commit.
•	Sinh bản ghi lịch sử di chuyển.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật, Nhóm câu hỏi động, Progress bar hoàn tất, Textarea ghi chú
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tên mẫu/checklist, Khoa áp dụng, Danh sách item, Loại câu hỏi, Bắt buộc, Thứ tự hiển thị, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Thấp / GĐ3
F054. Lưu và xem lại kết quả biểu mẫu
Mục tiêu use case: Tra cứu nội dung đã nhập hoặc đã xác nhận ở các lần trước.
Vai trò chính: Quản trị hệ thống, Nhân viên hồ sơ
Màn hình liên quan: SCR-15 Builder checklist / biểu mẫu
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật, Nhóm câu hỏi động, Progress bar hoàn tất, Textarea ghi chú
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tên mẫu/checklist, Khoa áp dụng, Danh sách item, Loại câu hỏi, Bắt buộc, Thứ tự hiển thị, Ghi chú
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Trung bình / GĐ2
 
M8. Dashboard, thống kê và cảnh báo
Nhóm màn hình	Dashboard điều hành	Vai trò chính	Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá, Nhân viên hồ sơ
Màn hình liên quan	SCR-02 Dashboard điều hành, SCR-18 Trung tâm thông báo	Số tính năng	9
F055. Tổng số bệnh nhân hiện tại
Mục tiêu use case: Hiển thị số lượng bệnh nhân đang điều trị tại thời điểm hiện tại.
Vai trò chính: Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá, Nhân viên hồ sơ
Màn hình liên quan: SCR-02 Dashboard điều hành, SCR-18 Trung tâm thông báo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Cao / GĐ1
F056. Tổng số giường / giường đang sử dụng
Mục tiêu use case: Theo dõi công suất sử dụng giường toàn khoa hoặc từng khu.
Vai trò chính: Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá, Nhân viên hồ sơ
Màn hình liên quan: SCR-02 Dashboard điều hành, SCR-18 Trung tâm thông báo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Cao / GĐ1
F057. Tỷ lệ lấp đầy theo phòng/khoa
Mục tiêu use case: Cho biết phòng nào đầy, sắp đầy hoặc còn nhiều giường trống.
Vai trò chính: Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá, Nhân viên hồ sơ
Màn hình liên quan: SCR-02 Dashboard điều hành, SCR-18 Trung tâm thông báo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Cao / GĐ1
F058. Số bệnh nhân dự kiến ra viện
Mục tiêu use case: Hỗ trợ dự báo lượng giường trống trong ngày để điều phối.
Vai trò chính: Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá, Nhân viên hồ sơ
Màn hình liên quan: SCR-02 Dashboard điều hành, SCR-18 Trung tâm thông báo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F059. Số hồ sơ ra viện còn thiếu
Mục tiêu use case: Cho biết còn bao nhiêu hồ sơ đang cần bổ sung hoặc xác nhận.
Vai trò chính: Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá, Nhân viên hồ sơ
Màn hình liên quan: SCR-02 Dashboard điều hành, SCR-18 Trung tâm thông báo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở bản ghi chi tiết hoặc thao tác nhanh ngay tại danh sách.
•	Người dùng chọn trạng thái mới hoặc nút xác nhận bước nghiệp vụ.
•	Hệ thống kiểm tra điều kiện tiên quyết, các trường bắt buộc và quyền thao tác.
•	Nếu hợp lệ, hệ thống cập nhật trạng thái, ghi lịch sử và đồng bộ các chỉ số phụ thuộc.
Chức năng trung gian / logic nền: 
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Cao / GĐ1
F060. Biểu đồ xu hướng
Mục tiêu use case: Theo dõi số liệu theo ngày, tuần hoặc tháng dưới dạng biểu đồ trực quan.
Vai trò chính: Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá, Nhân viên hồ sơ
Màn hình liên quan: SCR-02 Dashboard điều hành, SCR-18 Trung tâm thông báo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Tổng hợp số liệu theo snapshot hoặc truy vấn tổng hợp.
•	Bộ lọc thời gian/khoa/phòng.
•	Chức năng drill-down từ KPI sang danh sách chi tiết.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tên, Mã, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F061. Cảnh báo phòng đầy
Mục tiêu use case: Highlight các phòng đã full công suất để tránh điều phối nhầm.
Vai trò chính: Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá, Nhân viên hồ sơ
Màn hình liên quan: SCR-02 Dashboard điều hành, SCR-18 Trung tâm thông báo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Hệ thống theo dõi các chỉ số ngưỡng hoặc sự kiện phát sinh từ nghiệp vụ nội trú.
•	Khi điều kiện cảnh báo thỏa mãn, hệ thống sinh alert với mức độ ưu tiên và nguồn phát sinh.
•	Cảnh báo được hiển thị tại dashboard, badge thông báo, hàng dữ liệu hoặc màu trạng thái trực tiếp.
•	Người dùng có thể click vào cảnh báo để mở đúng màn xử lý liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Cảnh báo có cấp độ màu: thông tin, cần chú ý, khẩn, đã xử lý.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Khoảng thời gian, Khoa
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Cao / GĐ1
F062. Cảnh báo bệnh nhân chưa xếp giường
Mục tiêu use case: Thông báo các trường hợp đã tiếp nhận nhưng chưa được phân giường.
Vai trò chính: Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá, Nhân viên hồ sơ
Màn hình liên quan: SCR-02 Dashboard điều hành, SCR-18 Trung tâm thông báo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Hệ thống theo dõi các chỉ số ngưỡng hoặc sự kiện phát sinh từ nghiệp vụ nội trú.
•	Khi điều kiện cảnh báo thỏa mãn, hệ thống sinh alert với mức độ ưu tiên và nguồn phát sinh.
•	Cảnh báo được hiển thị tại dashboard, badge thông báo, hàng dữ liệu hoặc màu trạng thái trực tiếp.
•	Người dùng có thể click vào cảnh báo để mở đúng màn xử lý liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Khóa mềm bản ghi trong thời gian thao tác.
•	Kiểm tra xung đột trước khi commit.
•	Sinh bản ghi lịch sử di chuyển.
•	Event bus/notification service.
•	Nền xử lý tác vụ hoặc scheduler định kỳ.
•	Luồng đánh dấu đã xem/đã xử lý.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
•	Cảnh báo có cấp độ màu: thông tin, cần chú ý, khẩn, đã xử lý.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật, Badge thông báo, Toast, Notification center, Liên kết tới màn xử lý
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F063. Cảnh báo hồ sơ quá hạn xử lý
Mục tiêu use case: Nhắc các trường hợp hồ sơ hoặc thủ tục đang chậm hơn thời gian quy định.
Vai trò chính: Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá, Nhân viên hồ sơ
Màn hình liên quan: SCR-02 Dashboard điều hành, SCR-18 Trung tâm thông báo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Hệ thống theo dõi các chỉ số ngưỡng hoặc sự kiện phát sinh từ nghiệp vụ nội trú.
•	Khi điều kiện cảnh báo thỏa mãn, hệ thống sinh alert với mức độ ưu tiên và nguồn phát sinh.
•	Cảnh báo được hiển thị tại dashboard, badge thông báo, hàng dữ liệu hoặc màu trạng thái trực tiếp.
•	Người dùng có thể click vào cảnh báo để mở đúng màn xử lý liên quan.
Chức năng trung gian / logic nền: 
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
•	Cảnh báo có cấp độ màu: thông tin, cần chú ý, khẩn, đã xử lý.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái, Khoảng thời gian
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Trung bình / GĐ2
 
M9. Quản trị danh mục và cấu hình
Nhóm màn hình	Cấu hình hệ thống	Vai trò chính	Quản trị hệ thống
Màn hình liên quan	SCR-13 Quản lý phòng – giường – loại phòng, SCR-14 Quản lý danh mục trạng thái, SCR-15 Builder checklist / biểu mẫu, SCR-19 Cấu hình tenant / đơn vị	Số tính năng	6
F064. Quản lý danh mục phòng/loại phòng
Mục tiêu use case: Cập nhật danh mục phòng, khu, loại phòng dùng trong hệ thống.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-13 Quản lý phòng – giường – loại phòng, SCR-14 Quản lý danh mục trạng thái, SCR-15 Builder checklist / biểu mẫu, SCR-19 Cấu hình tenant / đơn vị
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F065. Quản lý danh mục trạng thái
Mục tiêu use case: Khai báo các trạng thái bệnh nhân, giường, hồ sơ và quy trình.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-13 Quản lý phòng – giường – loại phòng, SCR-14 Quản lý danh mục trạng thái, SCR-15 Builder checklist / biểu mẫu, SCR-19 Cấu hình tenant / đơn vị
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F066. Cấu hình ngưỡng cảnh báo
Mục tiêu use case: Thiết lập khi nào hệ thống cảnh báo phòng sắp đầy hoặc quá tải.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-13 Quản lý phòng – giường – loại phòng, SCR-14 Quản lý danh mục trạng thái, SCR-15 Builder checklist / biểu mẫu, SCR-19 Cấu hình tenant / đơn vị
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Cảnh báo có cấp độ màu: thông tin, cần chú ý, khẩn, đã xử lý.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Khoảng thời gian, Khoa
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F067. Cấu hình checklist hồ sơ
Mục tiêu use case: Cho phép tùy biến các mục cần kiểm tra trước khi ra viện.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-13 Quản lý phòng – giường – loại phòng, SCR-14 Quản lý danh mục trạng thái, SCR-15 Builder checklist / biểu mẫu, SCR-19 Cấu hình tenant / đơn vị
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Nhóm câu hỏi động, Progress bar hoàn tất, Textarea ghi chú
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái, Tên mẫu/checklist
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F068. Cấu hình rule xếp giường
Mục tiêu use case: Thiết lập điều kiện dùng cho logic phân phòng/giường tự động.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-13 Quản lý phòng – giường – loại phòng, SCR-14 Quản lý danh mục trạng thái, SCR-15 Builder checklist / biểu mẫu, SCR-19 Cấu hình tenant / đơn vị
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Khóa mềm bản ghi trong thời gian thao tác.
•	Kiểm tra xung đột trước khi commit.
•	Sinh bản ghi lịch sử di chuyển.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Thấp / GĐ3
F069. Quản lý nội dung hiển thị dashboard
Mục tiêu use case: Tùy chọn chỉ số hoặc widget hiển thị cho từng đơn vị sử dụng.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-13 Quản lý phòng – giường – loại phòng, SCR-14 Quản lý danh mục trạng thái, SCR-15 Builder checklist / biểu mẫu, SCR-19 Cấu hình tenant / đơn vị
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Tổng hợp số liệu theo snapshot hoặc truy vấn tổng hợp.
•	Bộ lọc thời gian/khoa/phòng.
•	Chức năng drill-down từ KPI sang danh sách chi tiết.
Trạng thái và rule UI: 
•	Cảnh báo có cấp độ màu: thông tin, cần chú ý, khẩn, đã xử lý.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Khoảng thời gian, Khoa
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Thấp / GĐ3
 
M10. Người dùng, phân quyền và bảo mật
Nhóm màn hình	Xác thực và quản trị người dùng	Vai trò chính	Quản trị hệ thống
Màn hình liên quan	SCR-01 Đăng nhập, SCR-16 Quản lý người dùng và phân quyền	Số tính năng	7
F070. Đăng nhập hệ thống
Mục tiêu use case: Xác thực người dùng bằng tài khoản để truy cập hệ thống.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-01 Đăng nhập, SCR-16 Quản lý người dùng và phân quyền
Điều kiện đầu vào: Chính sách vai trò/quyền đã được xác lập từ phần quản trị.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Xác thực tài khoản, token/session.
•	Phân giải quyền theo vai trò + phạm vi dữ liệu.
•	Ghi nhận nhật ký truy cập và đăng xuất cưỡng bức khi cần.
Trạng thái và rule UI: 
•	Trạng thái tài khoản: hoạt động, khóa tạm thời, ngừng kích hoạt, cần đổi mật khẩu.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
•	Hiển thị lỗi xác thực theo kiểu thân thiện nhưng không lộ thông tin nhạy cảm.
Thành phần UI tối thiểu: Form xác thực, Dropdown vai trò, Tree phạm vi dữ liệu, Bảng phân quyền
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Họ tên, Email/Tên đăng nhập, Vai trò, Khoa/đơn vị phụ trách, Trạng thái tài khoản, Lần đăng nhập gần nhất
Gợi ý bố cục: Bố cục chuẩn quản trị: thanh hành động trên cùng, bảng dữ liệu ở giữa, panel chi tiết hoặc modal cho tạo/sửa; các bộ lọc đặt trên bảng.
Ưu tiên / giai đoạn: Cao / GĐ1
F071. Quản lý tài khoản người dùng
Mục tiêu use case: Tạo, sửa, khóa hoặc ngừng kích hoạt tài khoản.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-01 Đăng nhập, SCR-16 Quản lý người dùng và phân quyền
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Chính sách vai trò/quyền đã được xác lập từ phần quản trị.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Xác thực tài khoản, token/session.
•	Phân giải quyền theo vai trò + phạm vi dữ liệu.
•	Ghi nhận nhật ký truy cập và đăng xuất cưỡng bức khi cần.
Trạng thái và rule UI: 
•	Trạng thái tài khoản: hoạt động, khóa tạm thời, ngừng kích hoạt, cần đổi mật khẩu.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Form xác thực, Dropdown vai trò, Tree phạm vi dữ liệu, Bảng phân quyền
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Họ tên, Email/Tên đăng nhập, Vai trò, Khoa/đơn vị phụ trách, Trạng thái tài khoản, Lần đăng nhập gần nhất
Gợi ý bố cục: Bố cục chuẩn quản trị: thanh hành động trên cùng, bảng dữ liệu ở giữa, panel chi tiết hoặc modal cho tạo/sửa; các bộ lọc đặt trên bảng.
Ưu tiên / giai đoạn: Cao / GĐ1
F072. Phân quyền theo vai trò
Mục tiêu use case: Phân nhóm quyền như admin, quản lý, bác sĩ, điều dưỡng, nhân viên hồ sơ…
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-01 Đăng nhập, SCR-16 Quản lý người dùng và phân quyền
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
•	Xác thực tài khoản, token/session.
•	Phân giải quyền theo vai trò + phạm vi dữ liệu.
•	Ghi nhận nhật ký truy cập và đăng xuất cưỡng bức khi cần.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
•	Trạng thái tài khoản: hoạt động, khóa tạm thời, ngừng kích hoạt, cần đổi mật khẩu.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Form xác thực, Dropdown vai trò, Tree phạm vi dữ liệu, Bảng phân quyền
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái, Email/Tên đăng nhập
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Cao / GĐ1
F073. Phân quyền theo phạm vi dữ liệu
Mục tiêu use case: Người dùng chỉ thấy dữ liệu của khoa, phòng hoặc đơn vị mình phụ trách.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-01 Đăng nhập, SCR-16 Quản lý người dùng và phân quyền
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Chính sách vai trò/quyền đã được xác lập từ phần quản trị.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Xác thực tài khoản, token/session.
•	Phân giải quyền theo vai trò + phạm vi dữ liệu.
•	Ghi nhận nhật ký truy cập và đăng xuất cưỡng bức khi cần.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Trạng thái tài khoản: hoạt động, khóa tạm thời, ngừng kích hoạt, cần đổi mật khẩu.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Form xác thực, Dropdown vai trò, Tree phạm vi dữ liệu, Bảng phân quyền
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Họ tên, Email/Tên đăng nhập
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F074. Đổi mật khẩu / reset mật khẩu
Mục tiêu use case: Hỗ trợ quản lý thông tin đăng nhập cơ bản.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-01 Đăng nhập, SCR-16 Quản lý người dùng và phân quyền
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Chính sách vai trò/quyền đã được xác lập từ phần quản trị.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Xác thực tài khoản, token/session.
•	Phân giải quyền theo vai trò + phạm vi dữ liệu.
•	Ghi nhận nhật ký truy cập và đăng xuất cưỡng bức khi cần.
Trạng thái và rule UI: 
•	Trạng thái tài khoản: hoạt động, khóa tạm thời, ngừng kích hoạt, cần đổi mật khẩu.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
•	Hiển thị lỗi xác thực theo kiểu thân thiện nhưng không lộ thông tin nhạy cảm.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Form xác thực, Dropdown vai trò, Tree phạm vi dữ liệu, Bảng phân quyền
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Họ tên, Email/Tên đăng nhập, Vai trò, Khoa/đơn vị phụ trách, Trạng thái tài khoản, Lần đăng nhập gần nhất
Gợi ý bố cục: Bố cục chuẩn quản trị: thanh hành động trên cùng, bảng dữ liệu ở giữa, panel chi tiết hoặc modal cho tạo/sửa; các bộ lọc đặt trên bảng.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F075. Nhật ký thao tác người dùng
Mục tiêu use case: Lưu vết ai thao tác gì và vào thời điểm nào.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-01 Đăng nhập, SCR-16 Quản lý người dùng và phân quyền
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tenant, Gói dịch vụ, Subdomain/Domain, Cấu hình tích hợp, Rule/điều kiện, Trạng thái kết nối
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F076. Quản lý phiên đăng nhập
Mục tiêu use case: Kiểm soát đăng nhập đồng thời hoặc bảo mật truy cập nâng cao.
Vai trò chính: Quản trị hệ thống
Màn hình liên quan: SCR-01 Đăng nhập, SCR-16 Quản lý người dùng và phân quyền
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Chính sách vai trò/quyền đã được xác lập từ phần quản trị.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Xác thực tài khoản, token/session.
•	Phân giải quyền theo vai trò + phạm vi dữ liệu.
•	Ghi nhận nhật ký truy cập và đăng xuất cưỡng bức khi cần.
Trạng thái và rule UI: 
•	Trạng thái tài khoản: hoạt động, khóa tạm thời, ngừng kích hoạt, cần đổi mật khẩu.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
•	Hiển thị lỗi xác thực theo kiểu thân thiện nhưng không lộ thông tin nhạy cảm.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Form xác thực, Dropdown vai trò, Tree phạm vi dữ liệu, Bảng phân quyền
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Họ tên, Email/Tên đăng nhập, Vai trò, Khoa/đơn vị phụ trách, Trạng thái tài khoản, Lần đăng nhập gần nhất
Gợi ý bố cục: Bố cục chuẩn quản trị: thanh hành động trên cùng, bảng dữ liệu ở giữa, panel chi tiết hoặc modal cho tạo/sửa; các bộ lọc đặt trên bảng.
Ưu tiên / giai đoạn: Thấp / GĐ3
 
M11. Báo cáo
Nhóm màn hình	Trung tâm báo cáo	Vai trò chính	Ban quản lý / Trưởng khoa, Nhân viên hồ sơ
Màn hình liên quan	SCR-17 Trung tâm báo cáo	Số tính năng	5
F077. Báo cáo công suất sử dụng giường
Mục tiêu use case: Thống kê tỷ lệ sử dụng giường theo ngày, tuần hoặc tháng.
Vai trò chính: Ban quản lý / Trưởng khoa, Nhân viên hồ sơ
Màn hình liên quan: SCR-17 Trung tâm báo cáo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Tổng hợp số liệu theo snapshot hoặc truy vấn tổng hợp.
•	Bộ lọc thời gian/khoa/phòng.
•	Chức năng drill-down từ KPI sang danh sách chi tiết.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Khoảng thời gian, Khoa
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F078. Báo cáo bệnh nhân ra viện
Mục tiêu use case: Thống kê số lượng và danh sách bệnh nhân ra viện theo giai đoạn.
Vai trò chính: Ban quản lý / Trưởng khoa, Nhân viên hồ sơ
Màn hình liên quan: SCR-17 Trung tâm báo cáo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Tổng hợp số liệu theo snapshot hoặc truy vấn tổng hợp.
•	Bộ lọc thời gian/khoa/phòng.
•	Chức năng drill-down từ KPI sang danh sách chi tiết.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái, Khoảng thời gian
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F079. Báo cáo hồ sơ thiếu
Mục tiêu use case: Tổng hợp các lỗi hoặc trường hợp hồ sơ chưa hoàn tất.
Vai trò chính: Ban quản lý / Trưởng khoa, Nhân viên hồ sơ
Màn hình liên quan: SCR-17 Trung tâm báo cáo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
•	Tổng hợp số liệu theo snapshot hoặc truy vấn tổng hợp.
•	Bộ lọc thời gian/khoa/phòng.
•	Chức năng drill-down từ KPI sang danh sách chi tiết.
Trạng thái và rule UI: 
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái, Khoảng thời gian
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F080. Xuất Excel/PDF
Mục tiêu use case: Xuất dữ liệu phục vụ lưu trữ, gửi quản lý hoặc báo cáo định kỳ.
Vai trò chính: Ban quản lý / Trưởng khoa, Nhân viên hồ sơ
Màn hình liên quan: SCR-17 Trung tâm báo cáo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Tổng hợp số liệu theo snapshot hoặc truy vấn tổng hợp.
•	Bộ lọc thời gian/khoa/phòng.
•	Chức năng drill-down từ KPI sang danh sách chi tiết.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Khoảng thời gian, Đơn vị, Khoa, Phòng, Chỉ số tổng, Trạng thái cảnh báo, Người phụ trách
Gợi ý bố cục: Bố cục chuẩn quản trị: thanh hành động trên cùng, bảng dữ liệu ở giữa, panel chi tiết hoặc modal cho tạo/sửa; các bộ lọc đặt trên bảng.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F081. Báo cáo theo khoa/phòng/bác sĩ
Mục tiêu use case: Phân tích dữ liệu theo phạm vi phụ trách hoặc tuyến báo cáo.
Vai trò chính: Ban quản lý / Trưởng khoa, Nhân viên hồ sơ
Màn hình liên quan: SCR-17 Trung tâm báo cáo
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Tổng hợp số liệu theo snapshot hoặc truy vấn tổng hợp.
•	Bộ lọc thời gian/khoa/phòng.
•	Chức năng drill-down từ KPI sang danh sách chi tiết.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Khoảng thời gian, Khoa
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Thấp / GĐ3
 
M12. Giao diện, trải nghiệm và vận hành
Nhóm màn hình	Chuẩn UI/UX và thao tác nhanh	Vai trò chính	Tất cả vai trò nội trú
Màn hình liên quan	SCR-03 Bảng điều phối phòng – giường, SCR-05 Danh sách bệnh nhân nội trú, SCR-09 Danh sách dự kiến ra viện, SCR-22 Màn hình thao tác nhanh mobile	Số tính năng	6
F082. Giao diện web responsive
Mục tiêu use case: Sử dụng tốt trên máy tính, tablet và điện thoại.
Vai trò chính: Tất cả vai trò nội trú
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-05 Danh sách bệnh nhân nội trú, SCR-09 Danh sách dự kiến ra viện, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra quyền và hợp lệ dữ liệu.
•	Lưu thay đổi và ghi lịch sử thao tác.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tên, Mã, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Cao / GĐ1
F083. Tối ưu thao tác mobile
Mục tiêu use case: Thiết kế thuận tiện cho điều dưỡng hoặc bác sĩ thao tác nhanh trên điện thoại.
Vai trò chính: Tất cả vai trò nội trú
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-05 Danh sách bệnh nhân nội trú, SCR-09 Danh sách dự kiến ra viện, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra quyền và hợp lệ dữ liệu.
•	Lưu thay đổi và ghi lịch sử thao tác.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tên, Mã, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Cao / GĐ1
F084. Popup thao tác nhanh
Mục tiêu use case: Xem và xử lý thông tin ngay trên cùng màn hình mà không cần chuyển trang nhiều.
Vai trò chính: Tất cả vai trò nội trú
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-05 Danh sách bệnh nhân nội trú, SCR-09 Danh sách dự kiến ra viện, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng chọn bệnh nhân hoặc giường cần thao tác từ danh sách, card hoặc popup nhanh.
•	Hệ thống hiển thị các vị trí hợp lệ và đồng thời khóa mềm dữ liệu đang được thao tác để tránh xung đột.
•	Người dùng xác nhận vị trí mới hoặc hành động kết thúc chiếm dụng giường.
•	Hệ thống kiểm tra xung đột, cập nhật bệnh nhân, giường, phòng, lịch sử di chuyển và các chỉ số công suất.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Khóa mềm bản ghi trong thời gian thao tác.
•	Kiểm tra xung đột trước khi commit.
•	Sinh bản ghi lịch sử di chuyển.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tên, Mã, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F085. Màu sắc trạng thái trực quan
Mục tiêu use case: Dùng màu để phân biệt giường trống, đầy, cảnh báo hoặc hồ sơ thiếu.
Vai trò chính: Tất cả vai trò nội trú
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-05 Danh sách bệnh nhân nội trú, SCR-09 Danh sách dự kiến ra viện, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Hệ thống theo dõi các chỉ số ngưỡng hoặc sự kiện phát sinh từ nghiệp vụ nội trú.
•	Khi điều kiện cảnh báo thỏa mãn, hệ thống sinh alert với mức độ ưu tiên và nguồn phát sinh.
•	Cảnh báo được hiển thị tại dashboard, badge thông báo, hàng dữ liệu hoặc màu trạng thái trực tiếp.
•	Người dùng có thể click vào cảnh báo để mở đúng màn xử lý liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
•	Cảnh báo có cấp độ màu: thông tin, cần chú ý, khẩn, đã xử lý.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F086. Bộ lọc nhanh tại danh sách
Mục tiêu use case: Lọc theo ngày, khoa, phòng, trạng thái và người phụ trách.
Vai trò chính: Tất cả vai trò nội trú
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-05 Danh sách bệnh nhân nội trú, SCR-09 Danh sách dự kiến ra viện, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Cao / GĐ1
F087. Tìm kiếm nhanh toàn hệ thống
Mục tiêu use case: Tra cứu bệnh nhân, phòng, giường và hồ sơ từ một ô tìm kiếm trung tâm.
Vai trò chính: Tất cả vai trò nội trú
Màn hình liên quan: SCR-03 Bảng điều phối phòng – giường, SCR-05 Danh sách bệnh nhân nội trú, SCR-09 Danh sách dự kiến ra viện, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Trung bình / GĐ2
 
M13. SaaS / mở rộng nền tảng
Nhóm màn hình	Quản trị tenant và thương mại hóa	Vai trò chính	Admin SaaS, Quản trị hệ thống
Màn hình liên quan	SCR-19 Cấu hình tenant / đơn vị, SCR-20 Quản lý gói dịch vụ	Số tính năng	5
F088. Quản lý đa đơn vị (multi-tenant)
Mục tiêu use case: Cho phép nhiều đơn vị dùng chung hệ thống nhưng dữ liệu tách biệt.
Vai trò chính: Admin SaaS, Quản trị hệ thống
Màn hình liên quan: SCR-19 Cấu hình tenant / đơn vị, SCR-20 Quản lý gói dịch vụ
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Tenant hoặc đơn vị sử dụng đã được khởi tạo trên hệ thống.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Tenant, Gói dịch vụ
Gợi ý bố cục: Bố cục chuẩn quản trị: thanh hành động trên cùng, bảng dữ liệu ở giữa, panel chi tiết hoặc modal cho tạo/sửa; các bộ lọc đặt trên bảng.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F089. Cấu hình riêng cho từng đơn vị
Mục tiêu use case: Mỗi nơi có thể có danh mục, phòng, checklist và dashboard riêng.
Vai trò chính: Admin SaaS, Quản trị hệ thống
Màn hình liên quan: SCR-19 Cấu hình tenant / đơn vị, SCR-20 Quản lý gói dịch vụ
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
•	Tổng hợp số liệu theo snapshot hoặc truy vấn tổng hợp.
•	Bộ lọc thời gian/khoa/phòng.
•	Chức năng drill-down từ KPI sang danh sách chi tiết.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
•	Cảnh báo có cấp độ màu: thông tin, cần chú ý, khẩn, đã xử lý.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy, Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Nhóm câu hỏi động, Progress bar hoàn tất, Textarea ghi chú
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Tên mẫu/checklist, Khoa áp dụng
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F090. Subdomain hoặc domain riêng
Mục tiêu use case: Mỗi đơn vị có thể dùng subdomain hoặc tên miền riêng khi cần.
Vai trò chính: Admin SaaS, Quản trị hệ thống
Màn hình liên quan: SCR-19 Cấu hình tenant / đơn vị, SCR-20 Quản lý gói dịch vụ
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Tenant hoặc đơn vị sử dụng đã được khởi tạo trên hệ thống.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Tenant, Gói dịch vụ
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Thấp / GĐ3
F091. Quản lý gói dịch vụ
Mục tiêu use case: Phân chia gói Basic, Pro, Enterprise nếu sản phẩm đi theo hướng thương mại.
Vai trò chính: Admin SaaS, Quản trị hệ thống
Màn hình liên quan: SCR-19 Cấu hình tenant / đơn vị, SCR-20 Quản lý gói dịch vụ
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Tenant hoặc đơn vị sử dụng đã được khởi tạo trên hệ thống.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tenant, Gói dịch vụ, Subdomain/Domain, Cấu hình tích hợp, Rule/điều kiện, Trạng thái kết nối
Gợi ý bố cục: Bố cục chuẩn quản trị: thanh hành động trên cùng, bảng dữ liệu ở giữa, panel chi tiết hoặc modal cho tạo/sửa; các bộ lọc đặt trên bảng.
Ưu tiên / giai đoạn: Thấp / GĐ3
F092. Giới hạn tài nguyên theo gói
Mục tiêu use case: Giới hạn số user, số khoa, phòng hoặc tính năng theo từng gói.
Vai trò chính: Admin SaaS, Quản trị hệ thống
Màn hình liên quan: SCR-19 Cấu hình tenant / đơn vị, SCR-20 Quản lý gói dịch vụ
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Tenant hoặc đơn vị sử dụng đã được khởi tạo trên hệ thống.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Tenant, Gói dịch vụ
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Thấp / GĐ3
 
M14. Tích hợp và nâng cao
Nhóm màn hình	Tích hợp hệ thống và tự động hóa	Vai trò chính	Quản trị hệ thống, Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá
Màn hình liên quan	SCR-18 Trung tâm thông báo, SCR-21 Tích hợp HIS/EMR, SCR-22 Màn hình thao tác nhanh mobile	Số tính năng	8
F093. Kết nối HIS/EMR hiện có
Mục tiêu use case: Đồng bộ thông tin bệnh nhân hoặc quy trình với hệ thống sẵn có của khách.
Vai trò chính: Quản trị hệ thống, Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá
Màn hình liên quan: SCR-18 Trung tâm thông báo, SCR-21 Tích hợp HIS/EMR, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái, Tenant
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Thấp / GĐ3
F094. Thông báo realtime
Mục tiêu use case: Cảnh báo khi phòng đầy, có ca mới hoặc hồ sơ thiếu cần xử lý gấp.
Vai trò chính: Quản trị hệ thống, Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá
Màn hình liên quan: SCR-18 Trung tâm thông báo, SCR-21 Tích hợp HIS/EMR, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Hệ thống theo dõi các chỉ số ngưỡng hoặc sự kiện phát sinh từ nghiệp vụ nội trú.
•	Khi điều kiện cảnh báo thỏa mãn, hệ thống sinh alert với mức độ ưu tiên và nguồn phát sinh.
•	Cảnh báo được hiển thị tại dashboard, badge thông báo, hàng dữ liệu hoặc màu trạng thái trực tiếp.
•	Người dùng có thể click vào cảnh báo để mở đúng màn xử lý liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
•	Event bus/notification service.
•	Nền xử lý tác vụ hoặc scheduler định kỳ.
•	Luồng đánh dấu đã xem/đã xử lý.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
•	Cảnh báo có cấp độ màu: thông tin, cần chú ý, khẩn, đã xử lý.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Badge thông báo, Toast, Notification center, Liên kết tới màn xử lý
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Mã bệnh nhân, Họ tên
Gợi ý bố cục: Bố cục ưu tiên dashboard 3 tầng: hàng KPI phía trên, khu vực cảnh báo/tình trạng ở giữa, bảng hoặc biểu đồ drill-down ở dưới.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F095. In danh sách / biên bản
Mục tiêu use case: Hỗ trợ in biểu mẫu, danh sách bệnh nhân hoặc biên bản thao tác.
Vai trò chính: Quản trị hệ thống, Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá
Màn hình liên quan: SCR-18 Trung tâm thông báo, SCR-21 Tích hợp HIS/EMR, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở màn hình danh sách/tổng quan và chọn bộ lọc theo vai trò sử dụng.
•	Hệ thống nạp dữ liệu theo tenant, khoa, phòng, ngày và trạng thái tương ứng.
•	Kết quả hiển thị theo card, bảng hoặc sơ đồ; người dùng có thể tìm kiếm, sắp xếp và drill-down.
•	Khi người dùng chọn một bản ghi, hệ thống mở popup, drawer hoặc trang chi tiết để xem sâu hơn.
Chức năng trung gian / logic nền: 
•	API lấy dữ liệu theo tenant/khoa/phòng.
•	Bộ lọc nhanh, sort và phân trang/infinite scroll.
•	Cache ngắn hạn hoặc polling/realtime để giảm tải khi xem nhiều người dùng.
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
Trạng thái và rule UI: 
•	Bệnh nhân có state machine rõ ràng: chờ phân giường → đang điều trị → chờ ra viện → đã ra viện/chuyển viện.
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Thanh bộ lọc nhanh, Bảng dữ liệu có sort, Ô tìm kiếm, Badge trạng thái, Phân trang hoặc tải thêm, Nhóm câu hỏi động, Progress bar hoàn tất, Textarea ghi chú
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái, Tên mẫu/checklist
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Trung bình / GĐ2
F096. QR tại phòng/giường
Mục tiêu use case: Quét mã để mở nhanh thông tin phòng hoặc giường ngay trên điện thoại.
Vai trò chính: Quản trị hệ thống, Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá
Màn hình liên quan: SCR-18 Trung tâm thông báo, SCR-21 Tích hợp HIS/EMR, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Phòng hiển thị theo màu và badge: hoạt động, tạm khóa, bảo trì, sắp đầy, đầy.
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Tenant, Gói dịch vụ
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Thấp / GĐ3
F097. AI gợi ý xếp giường
Mục tiêu use case: Gợi ý giường phù hợp dựa trên dữ liệu, trạng thái và rule nghiệp vụ.
Vai trò chính: Quản trị hệ thống, Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá
Màn hình liên quan: SCR-18 Trung tâm thông báo, SCR-21 Tích hợp HIS/EMR, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước. Trạng thái phòng/giường đã được đồng bộ đúng thời điểm thao tác.
Luồng chính: 
•	Người dùng chọn bệnh nhân hoặc giường cần thao tác từ danh sách, card hoặc popup nhanh.
•	Hệ thống hiển thị các vị trí hợp lệ và đồng thời khóa mềm dữ liệu đang được thao tác để tránh xung đột.
•	Người dùng xác nhận vị trí mới hoặc hành động kết thúc chiếm dụng giường.
•	Hệ thống kiểm tra xung đột, cập nhật bệnh nhân, giường, phòng, lịch sử di chuyển và các chỉ số công suất.
Chức năng trung gian / logic nền: 
•	Kiểm tra sức chứa phòng và trạng thái giường.
•	Đồng bộ chỉ số trống/đầy/sắp đầy theo thời gian thực.
•	Khóa mềm bản ghi trong thời gian thao tác.
•	Kiểm tra xung đột trước khi commit.
•	Sinh bản ghi lịch sử di chuyển.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Giường hiển thị trạng thái trống/có bệnh nhân/chờ vệ sinh/khóa; chỉ cho click hành động hợp lệ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn lưu nếu vị trí đích đã có người, đang khóa, hoặc vừa bị người khác chiếm dụng.
•	Yêu cầu xác nhận lại nếu dữ liệu đã thay đổi trong lúc người dùng đang mở popup.
Thành phần UI tối thiểu: Card/Sơ đồ trực quan, Legend màu trạng thái, KPI tile, Tooltip giải thích trạng thái, Popup xác nhận, Drawer thao tác nhanh, Checkbox hoặc radio, Nút hành động nổi bật
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã, Tên hiển thị, Đơn vị, Khoa/Khu/Phòng cha, Loại, Sức chứa, Trạng thái, Ghi chú, Tenant, Gói dịch vụ
Gợi ý bố cục: Bố cục nên dùng màn 2 vùng: cột trái là bộ lọc và danh sách/phòng, vùng chính là card hoặc sơ đồ giường; thao tác dùng drawer bên phải để không mất ngữ cảnh.
Ưu tiên / giai đoạn: Thấp / GĐ3
F098. Rule engine nghiệp vụ
Mục tiêu use case: Tự động hóa các bước theo quy tắc vận hành được cấu hình sẵn.
Vai trò chính: Quản trị hệ thống, Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá
Màn hình liên quan: SCR-18 Trung tâm thông báo, SCR-21 Tích hợp HIS/EMR, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng mở màn hình danh sách tương ứng và xem dữ liệu hiện có.
•	Người dùng chọn thao tác tạo mới, chỉnh sửa, khóa, kích hoạt hoặc sao chép cấu hình.
•	Hệ thống mở form dạng modal hoặc trang chi tiết với các trường bắt buộc và hướng dẫn nhập.
•	Người dùng lưu dữ liệu; hệ thống kiểm tra trùng mã, quan hệ cha-con, phạm vi đơn vị và quyền sửa.
•	Hệ thống cập nhật danh sách, ghi audit log và phản ánh dữ liệu mới ở các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Form validation bắt buộc/trùng lặp.
•	Chuẩn hóa mã và tên hiển thị.
•	Audit log cho thao tác tạo/sửa/xóa/khóa.
•	Bảng cấu hình riêng theo đơn vị.
•	Cơ chế mapping dữ liệu/cấu hình rule.
•	Lớp dịch vụ dùng lại cho nhiều tenant.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Chặn trùng mã, trùng tên hiển thị trong cùng phạm vi đơn vị nếu quy định yêu cầu duy nhất.
Thành phần UI tối thiểu: Nút tạo mới, Modal/Form chi tiết, Trường nhập chuẩn hóa, Hành động lưu/hủy
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tenant, Gói dịch vụ, Subdomain/Domain, Cấu hình tích hợp, Rule/điều kiện, Trạng thái kết nối
Gợi ý bố cục: Bố cục chuẩn quản trị: thanh hành động trên cùng, bảng dữ liệu ở giữa, panel chi tiết hoặc modal cho tạo/sửa; các bộ lọc đặt trên bảng.
Ưu tiên / giai đoạn: Thấp / GĐ3
F099. Theo dõi SLA xử lý hồ sơ
Mục tiêu use case: Đo thời gian xử lý từng bước để kiểm soát hiệu quả vận hành.
Vai trò chính: Quản trị hệ thống, Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá
Màn hình liên quan: SCR-18 Trung tâm thông báo, SCR-21 Tích hợp HIS/EMR, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Hệ thống theo dõi các chỉ số ngưỡng hoặc sự kiện phát sinh từ nghiệp vụ nội trú.
•	Khi điều kiện cảnh báo thỏa mãn, hệ thống sinh alert với mức độ ưu tiên và nguồn phát sinh.
•	Cảnh báo được hiển thị tại dashboard, badge thông báo, hàng dữ liệu hoặc màu trạng thái trực tiếp.
•	Người dùng có thể click vào cảnh báo để mở đúng màn xử lý liên quan.
Chức năng trung gian / logic nền: 
•	Tính toán tỷ lệ hoàn tất checklist.
•	Lưu ghi chú bổ sung theo item.
•	Rule chặn bước tiếp theo nếu item bắt buộc chưa đủ.
•	Event bus/notification service.
•	Nền xử lý tác vụ hoặc scheduler định kỳ.
•	Luồng đánh dấu đã xem/đã xử lý.
Trạng thái và rule UI: 
•	Hồ sơ hiển thị đủ/thiếu/chờ xác nhận/cần bổ sung kèm số mục đã hoàn thành trên tổng số mục.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
•	Không cho xác nhận hoàn tất nếu còn mục hồ sơ bắt buộc chưa đủ.
•	Hiển thị rõ danh sách mục thiếu ngay trong popup thay vì báo lỗi chung.
Thành phần UI tối thiểu: Badge thông báo, Toast, Notification center, Liên kết tới màn xử lý
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Mã bệnh nhân, Họ tên, Ngày sinh/tuổi, Giới tính, Chẩn đoán, Bác sĩ phụ trách, Ngày nhập viện, Phòng/Giường, Trạng thái
Gợi ý bố cục: Bố cục nên dùng bảng danh sách + popup chi tiết nhiều bước, trong đó phần checklist nằm bên trái và ghi chú/hành động xác nhận nằm bên phải.
Ưu tiên / giai đoạn: Thấp / GĐ3
F100. Audit nâng cao
Mục tiêu use case: Lưu vết thay đổi dữ liệu chi tiết ở mức nâng cao phục vụ kiểm soát nội bộ.
Vai trò chính: Quản trị hệ thống, Ban quản lý / Trưởng khoa, Điều dưỡng / Y tá
Màn hình liên quan: SCR-18 Trung tâm thông báo, SCR-21 Tích hợp HIS/EMR, SCR-22 Màn hình thao tác nhanh mobile
Điều kiện đầu vào: Người dùng đã đăng nhập và có quyền phù hợp theo vai trò/phạm vi dữ liệu. Dữ liệu đơn vị, khoa, phòng và giường đã được khai báo trước.
Luồng chính: 
•	Người dùng truy cập màn hình tương ứng và thao tác trên dữ liệu theo vai trò.
•	Hệ thống kiểm tra điều kiện hợp lệ, lưu thay đổi và cập nhật các màn hình liên quan.
Chức năng trung gian / logic nền: 
•	Event bus/notification service.
•	Nền xử lý tác vụ hoặc scheduler định kỳ.
•	Luồng đánh dấu đã xem/đã xử lý.
Trạng thái và rule UI: 
•	Nút thao tác chỉ mở khi trạng thái bản ghi cho phép theo quy tắc nghiệp vụ.
Ngoại lệ / cảnh báo cần thể hiện: 
•	Hiển thị empty state rõ ràng khi chưa có dữ liệu hoặc bộ lọc không trả về kết quả.
Thành phần UI tối thiểu: Bảng/chi tiết dữ liệu, Nút thao tác phù hợp ngữ cảnh
Dữ liệu bắt buộc cần hiển thị hoặc nhập: Tên, Mã, Trạng thái, Ghi chú
Gợi ý bố cục: Bố cục nên tối ưu cho quét nhanh: tiêu đề ngữ cảnh, filter bar, nội dung chính, thanh hành động cố định.
Ưu tiên / giai đoạn: Thấp / GĐ3
 
10. Danh sách popup / drawer / micro-flow bắt buộc nên có
•	Popup xếp giường: chọn khoa/phòng/giường, xem trạng thái realtime, kiểm tra xung đột, xác nhận phân giường.
•	Popup chuyển giường: hiển thị vị trí hiện tại, vị trí đích, lý do chuyển, xác nhận cập nhật.
•	Popup chuyển phòng: tương tự chuyển giường nhưng kèm lựa chọn phòng đích và cảnh báo khác khoa/khu nếu có.
•	Popup kiểm tra hồ sơ ra viện: danh sách item checklist, thanh tiến độ, ghi chú thiếu, hành động lưu nháp/đánh dấu đủ.
•	Popup xác nhận ra viện: hiển thị điều kiện cuối cùng, cảnh báo nếu hồ sơ chưa đủ, xác nhận giải phóng giường.
•	Drawer chi tiết bệnh nhân nhanh: mở từ sơ đồ giường hoặc danh sách để xem snapshot và hành động nhanh.
•	Modal tạo/sửa phòng – giường: dùng cho admin để cấu hình nhanh mà không rời danh sách.
•	Modal cảnh báo: click từ dashboard để chuyển sang danh sách đang có vấn đề.
•	Notification center: gom các alert realtime, tình trạng chưa phân giường, hồ sơ quá hạn, phòng đầy.
11. Checklist handoff cho UI/UX designer
•	Mỗi màn phải xác định rõ trạng thái loading / empty / error / success, không chỉ trạng thái có dữ liệu.
•	Mỗi nút nghiệp vụ cần biết ai được thấy nút đó, ở trạng thái nào nút được bấm và khi bấm mở trang hay popup.
•	Phải thống nhất quy tắc màu cho phòng, giường, bệnh nhân, hồ sơ và cảnh báo trước khi design high-fidelity.
•	Cần thiết kế cả desktop và mobile cho các tác vụ quan trọng: điều phối phòng–giường, chi tiết bệnh nhân, kiểm tra hồ sơ ra viện.
•	Mọi badge, tag, KPI phải có định nghĩa dữ liệu phía sau để tránh designer tạo label không đo được bằng backend.
•	Những phần GĐ2/GĐ3 vẫn nên có placeholder trong IA tổng thể để tránh thiết kế lại menu/navigation về sau.
•	Các bảng lớn nên có row action rõ ràng: xem, sửa, khóa, chuyển bước, mở lịch sử, mở popup xử lý.
12. Kết luận sử dụng
Nếu cần triển khai MVP nhanh, nên thiết kế trước các màn: đăng nhập, dashboard cơ bản, bảng điều phối phòng–giường, popup xếp/chuyển giường, danh sách bệnh nhân, chi tiết bệnh nhân, danh sách dự kiến ra viện, popup kiểm tra hồ sơ ra viện, và quản trị người dùng cơ bản.
Nếu ngài muốn đi tiếp, từ tài liệu này có thể tách ra ngay 4 gói tiếp theo: sitemap chi tiết, wireframe low-fidelity, component list/design system, và user flow theo từng vai trò.
