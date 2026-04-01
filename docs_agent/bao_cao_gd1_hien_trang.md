# Báo cáo đánh giá hiện trạng Giai đoạn 1

Ngày đánh giá: 2026-03-30  
Phạm vi: chỉ tập trung GĐ1 MVP theo brief trong `docs_agent/content.md`

## 1. Mục tiêu báo cáo

Tài liệu này dùng để đối chiếu giữa phạm vi GĐ1 đã chốt trong brief và hiện trạng triển khai của codebase hiện tại. Trọng tâm đánh giá gồm 4 lớp:

1. Mức độ hoàn thiện chức năng GĐ1.
2. Chất lượng UI và khả năng vận hành thực tế ở môi trường nội trú.
3. Các chức năng trung gian còn thiếu khiến MVP chưa thật sự “mượt”.
4. Các điểm cần tối ưu ở backend, dữ liệu, phân quyền, hiệu năng và readiness triển khai.

Đây là báo cáo review hiện trạng, không bao gồm thay đổi code.

## 2. Cách đánh giá

### 2.1. Nguồn đối chiếu

- Brief GĐ1 trong `docs_agent/content.md`.
- Tài liệu tóm tắt kiến trúc và API trong `docs_agent/context_projectt.md`.
- Tài liệu use case/UI chi tiết trong `docs_agent/info.md`.
- Mã nguồn frontend ở `client/src`.
- Mã nguồn backend ở `server/src`.
- Migration SQL ở `server/src/database`.

### 2.2. Phạm vi rà soát thực tế

Đã kiểm tra trực tiếp các nhóm sau:

- Auth, session và route protection.
- Dashboard vận hành.
- Danh sách phòng, chi tiết phòng, sơ đồ giường.
- Xếp giường, chuyển giường, trả giường.
- Danh sách bệnh nhân, drawer chi tiết, cập nhật trạng thái.
- Danh sách dự kiến ra viện, checklist ra viện, xác nhận ra viện.
- Quản lý user, department, checklist, status preview, audit trong khu admin.
- Service backend cho rooms, beds, transfer, patients, dashboard, users.
- Middleware auth, RBAC và một phần schema SQL.

### 2.3. Kết quả xác thực kỹ thuật

- VS Code diagnostics hiện tại: không thấy lỗi compile/lint nổi bật từ tool kiểm tra editor.
- Build bằng Yarn: chưa xác thực được tình trạng compile thực tế vì cả `client` và `server` đều dừng ở lỗi lockfile/workspace của Yarn, chưa đi tới bước build code.
- Test tự động: không tìm thấy file test/spec trong workspace hiện tại.

Kết luận của phần kỹ thuật này là: snapshot hiện tại nhìn qua editor khá sạch, nhưng readiness để build/deploy tự động vẫn chưa được chứng minh vì môi trường Yarn đang chưa ổn định.

## 3. Đánh giá tổng quan

## 3.1. Kết luận ngắn

Hiện trạng dự án đã đi qua phần khó nhất của GĐ1: luồng nghiệp vụ cốt lõi đã hình thành và chạy theo logic tương đối đúng hướng. Bộ khung hiện tại đủ tốt để demo, review nghiệp vụ với khách hàng và thậm chí pilot hẹp trong phạm vi nhỏ nếu chấp nhận giám sát sát sao.

Tuy nhiên, để xem là “chốt xong GĐ1” theo nghĩa có thể vận hành nội trú ổn định thì vẫn còn một số khoảng trống quan trọng:

- Phân quyền theo phạm vi dữ liệu chưa thực sự được thực thi ở backend.
- Một số chức năng GĐ1 mới dừng ở mức có mô hình dữ liệu hoặc API, nhưng chưa đủ mạnh ở lớp UI vận hành.
- Các trạng thái trung gian phục vụ điều dưỡng và điều phối nội trú còn thiếu hoặc chưa đi hết vòng đời.
- Backend còn nợ chuẩn hóa migration, tối ưu query, test tự động và độ sẵn sàng build/deploy.

### 3.2. Đánh giá mức sẵn sàng

- Mức sẵn sàng demo nghiệp vụ: tốt.
- Mức sẵn sàng UAT nội bộ: khá, nhưng cần khóa scope và xử lý các điểm nghẽn vận hành.
- Mức sẵn sàng triển khai thực chiến nhiều khoa/phòng: chưa nên, nếu chưa xử lý phân quyền dữ liệu, build pipeline và các luồng trung gian.

## 4. Đối chiếu GĐ1 theo nhóm chức năng

| Nhóm GĐ1 | Hiện trạng | Đánh giá |
| --- | --- | --- |
| Đăng nhập hệ thống | Có login, restore session, protected route, đổi mật khẩu, khóa user | Đạt |
| Dashboard cơ bản | Có KPI chính, cảnh báo phòng đầy/sắp đầy, chờ xếp giường, occupancy theo phòng | Gần đạt |
| Danh sách phòng theo thời gian thực | Có trang rooms và room detail, nhưng đang dùng polling 30 giây chứ chưa realtime | Gần đạt |
| Xem trạng thái từng giường | Có visual trạng thái giường và panel chi tiết | Đạt |
| Hiển thị bệnh nhân trên giường | Đã có ở room detail | Đạt |
| Đếm giường trống và cảnh báo phòng đầy | Đã có ở dashboard và room list | Đạt |
| Xếp giường thủ công | Có assign modal, backend transaction và conflict check | Đạt |
| Chuyển giường/chuyển phòng | Có transfer modal và backend transfer riêng | Đạt |
| Giải phóng giường | Có release và discharge giải phóng giường | Đạt |
| Tạo hồ sơ bệnh nhân nội trú | Có add patient flow và API create | Đạt |
| Danh sách bệnh nhân đang điều trị | Có patient list, filter, drawer chi tiết | Đạt |
| Gắn bệnh nhân với phòng/giường | Có đầy đủ qua assign/transfer | Đạt |
| Trạng thái điều trị | Có state machine admitted/treating/waiting_discharge/discharged | Đạt |
| Danh sách dự kiến ra viện | Có discharge list và checklist panel | Gần đạt |
| Kiểm tra hồ sơ ra viện | Có checklist, chặn discharge nếu chưa đủ | Đạt |
| Dashboard tổng quan GĐ1 | Có dữ liệu cốt lõi nhưng chưa có lọc theo vai trò/khoa rõ ràng trên UI | Gần đạt |
| Quản lý tài khoản và role | Có user list, create/update/disable/reset password | Đạt |
| Phân quyền theo phạm vi dữ liệu | Có trường `department_id` ở user nhưng enforcement chưa chặt | Chưa đạt |
| Giao diện responsive/mobile | Có layout responsive, bottom nav, mobile cards | Gần đạt |
| Popup thao tác nhanh | Có modal/drawer ở nhiều luồng | Đạt |

## 5. Điểm mạnh hiện tại

### 5.1. Luồng nghiệp vụ cốt lõi đã khép được vòng

Phần mạnh nhất của snapshot hiện tại là chuỗi nghiệp vụ chính đã tương đối đầy đủ:

1. Đăng nhập.
2. Xem tổng quan dashboard.
3. Xem phòng và giường.
4. Xếp bệnh nhân vào giường.
5. Chuyển giường/chuyển phòng.
6. Theo dõi bệnh nhân trong list và drawer.
7. Đánh dấu/chuẩn bị xuất viện.
8. Check checklist.
9. Xác nhận ra viện và giải phóng giường.

Đây là nền rất tốt cho GĐ1 vì đã bám đúng xương sống vận hành nội trú.

### 5.2. Tách module frontend/backend khá rõ

Codebase đã có cấu trúc tương đối dễ mở rộng:

- Frontend chia page, component, context, service.
- Backend chia module `auth`, `rooms`, `beds`, `patients`, `dashboard`, `users`.
- Type dùng chung qua `shared`.

Điểm này có lợi lớn cho các chặng sau vì không bị dồn business logic vào một chỗ.

### 5.3. Backend có tư duy transaction ở các thao tác nhạy cảm

Các thao tác như assign bed, transfer bed, release bed, discharge patient đã có transaction hoặc lock logic tương đối đúng tinh thần nghiệp vụ. Đây là dấu hiệu tốt vì những chỗ này là nơi dễ phát sinh lỗi tranh chấp dữ liệu nhất.

### 5.4. GĐ1 đã có tư duy vận hành mobile chứ không chỉ desktop

Layout đã có bottom nav, room/patient/discharge có mobile cards, sidebar có hành vi mobile riêng. Đây là nền quan trọng vì đối tượng điều dưỡng và bác sĩ thường thao tác nhanh trên thiết bị nhỏ.

### 5.5. Phần admin đã vượt mức “placeholder” ở vài mảng quan trọng

Khu admin hiện không chỉ có user management mà còn có:

- Department management.
- Checklist management.
- Config key/value.
- Audit log.
- Status preview.

Điều này tạo ra độ sẵn sàng tốt hơn cho GĐ1 so với một MVP chỉ có luồng vận hành mà không có lớp cấu hình cơ bản.

## 6. Các khoảng trống chính còn lại trong GĐ1

### 6.1. GĐ1 đã có chức năng lõi, nhưng chưa thật sự “đủ mượt” cho vận hành hàng ngày

Hệ thống hiện tại đủ để xử lý nghiệp vụ chính, nhưng vẫn còn khoảng cách giữa “có chức năng” và “dùng thuận tay trong ca trực”. Những khoảng cách này nằm ở UI flow, trạng thái trung gian và cách dữ liệu được lọc theo ngữ cảnh người dùng.

### 6.2. Phân quyền theo phạm vi dữ liệu là khoảng trống lớn nhất

Brief GĐ1 yêu cầu người dùng chỉ thấy dữ liệu của khoa/phòng/đơn vị mình phụ trách. Hiện tại:

- User đã có `department_id` ở schema và màn user management.
- Route đọc dữ liệu như bệnh nhân/checklist/discharge list chủ yếu chỉ qua `authMiddleware`.
- Query service có hỗ trợ filter `department_id` ở một số nơi, nhưng chưa thấy cơ chế ép lọc theo `req.user` ở middleware/controller.

Điều này có nghĩa là hệ thống đã có role-based access cơ bản, nhưng chưa đạt data-scope access thực thụ. Với môi trường bệnh viện, đây là khoảng trống phải xử lý ngay trong GĐ1, không nên dời sang GĐ2.

### 6.3. Một số khả năng GĐ1 tồn tại ở backend hoặc model, nhưng chưa mạnh ở UI

Các ví dụ điển hình:

- Bed có trạng thái `cleaning` và `locked`, nhưng vòng đời vận hành các trạng thái này chưa được hiện thực mạnh ở UI.
- Backend có create room/create bed, nhưng luồng quản trị màn hình hiện tại thiên về sửa hơn là tạo mới đầy đủ cấu trúc phòng/giường.
- Discharge list backend hỗ trợ lọc ngày, nhưng UI hiện mới thiên về danh sách mặc định, chưa đưa trải nghiệm “hôm nay/ngày mai/chọn ngày” ra rõ ràng.
- Status section trong admin đang ở mức preview trạng thái, chưa phải quản trị danh mục trạng thái đúng nghĩa.

## 7. Đánh giá UI/UX GĐ1

## 7.1. Nhận định chung

UI hiện tại theo hướng thực dụng, khá sạch, có cấu trúc và đã bắt đầu nghĩ theo ngữ cảnh y tế vận hành. Điểm mạnh là không bị quá thiên về dashboard đẹp mà bỏ quên thao tác thực tế. Tuy nhiên, thiết kế vẫn đang nghiêng về “admin app tốt” hơn là “công cụ ca trực tối ưu thao tác”.

Nói ngắn gọn: giao diện đã usable, nhưng chưa đủ sắc và nhất quán để đạt trải nghiệm nội trú cường độ cao.

### 7.2. Những gì đang tốt về UI

- Layout tổng thể rõ ràng, navigation dễ hiểu.
- Có phân lớp dashboard, room, patient, discharge tương đối logic.
- Có drawer/modal cho thao tác nhanh, không bắt người dùng rời context quá nhiều.
- Có mobile layout riêng thay vì chỉ co table.
- Badge trạng thái và summary card đã hỗ trợ nhìn nhanh.

### 7.3. Các điểm UI cần cải thiện ngay trong GĐ1

#### A. Chưa có “màn chờ phân giường” đủ mạnh

Hiện bệnh nhân chưa có giường được nhắc qua alert ở dashboard/patient list và mở assign modal từ đó. Cách này tốt cho demo, nhưng chưa đủ cho vận hành thật.

Cần có một luồng rõ hơn cho điều dưỡng:

- danh sách bệnh nhân chờ xếp giường riêng,
- sắp xếp theo thời gian chờ hoặc mức ưu tiên,
- thao tác gán giường ngay trên cùng ngữ cảnh,
- nhìn được phòng trống phù hợp mà không phải đi vòng qua nhiều màn.

Đây là chức năng trung gian rất quan trọng để GĐ1 bớt “gãy nhịp” trong thực tế.

#### B. Pattern tương tác còn chưa thống nhất hoàn toàn

Hiện có nhiều kiểu thao tác song song:

- modal,
- drawer,
- inline button,
- browser `confirm()` ở user management,
- silent catch không phản hồi rõ ở vài màn.

Cần thống nhất lại:

- confirm nguy hiểm dùng một pattern chung,
- lỗi phải trả về rõ ràng hơn trên UI,
- thao tác thành công/thất bại nên có feedback nhất quán,
- hạn chế dùng native confirm vì làm app mất cảm giác đồng nhất.

#### C. Tối ưu mobile mới ở mức responsive, chưa ở mức thao tác ca trực

Hiện app đã responsive, nhưng tối ưu mobile cho nghiệp vụ nhanh vẫn chưa đủ sâu. Ví dụ:

- filter/search chưa đủ gọn cho một tay thao tác,
- chưa có sticky action cho những tác vụ lặp nhiều,
- chưa có quick segment kiểu “Đang chờ giường”, “Sắp ra viện”, “Phòng đầy”,
- chưa thấy cơ chế giữ bộ lọc thuận tiện theo bối cảnh ca trực.

GĐ1 không cần làm mobile quá phức tạp, nhưng nên đạt mức “mở app là xử lý việc ngay”.

#### D. Nhiều đoạn inline style cho thấy design system chưa thật sự khóa chặt

Trong các page hiện tại còn khá nhiều style inline cho spacing, màu, kích thước, trạng thái. Điều này chưa gây lỗi ngay, nhưng về trung hạn sẽ dẫn đến:

- UI thiếu nhất quán,
- sửa design tốn công,
- khó giữ chất lượng khi thêm màn mới.

Khuyến nghị là gom dần các pattern này về token/class chuẩn trong GĐ1, ít nhất cho alert, stat, modal row, trạng thái quá hạn và action group.

#### E. Thiếu empty/error/retry state chất lượng cao

Nhiều chỗ đang `catch(() => {})` hoặc chỉ hiện toast chung. Điều này làm người dùng khó phân biệt:

- không có dữ liệu,
- lỗi mạng,
- lỗi phân quyền,
- dữ liệu vừa bị người khác đổi,
- thao tác conflict thật sự.

Với môi trường bệnh viện, thông tin lỗi phải ngắn nhưng đủ hành động tiếp theo.

### 7.4. Các cải tiến UI ưu tiên cho GĐ1

#### Ưu tiên rất cao

1. Tạo màn/khối “Chờ phân giường” chuyên dụng.
2. Chuẩn hóa confirm dialog, toast, error state, retry state.
3. Thêm chip lọc nhanh theo ngữ cảnh: chưa có giường, chờ ra viện, quá hạn dự kiến, phòng đầy.
4. Làm rõ trạng thái giường `empty/occupied/cleaning/locked` ở cả thao tác lẫn hiển thị.

#### Ưu tiên cao

1. Persist filter/search lên URL hoặc state ổn định hơn.
2. Tạo action bar mobile rõ hơn cho room/patient/discharge.
3. Đưa lọc ngày vào discharge list.
4. Hiển thị rõ current scope: khoa nào, vai trò nào, đang xem dữ liệu nào.

#### Ưu tiên trung bình

1. Chuẩn hóa spacing và component state để giảm inline style.
2. Tăng tính nhất quán visual giữa admin pages và khối vận hành.
3. Thêm chỉ báo “dữ liệu cập nhật cách đây bao lâu” cho dashboard/room detail.

## 8. Các chức năng trung gian nên bổ sung ngay trong GĐ1

Phần này rất quan trọng. Đây không phải mở rộng sang GĐ2, mà là các mảnh trung gian giúp GĐ1 vận hành trơn tru hơn.

### 8.1. Hàng chờ phân giường có ngữ cảnh

Hiện có dấu hiệu chờ giường nhưng chưa thành luồng riêng. Nên bổ sung:

- danh sách chờ phân giường riêng,
- lọc theo khoa/bác sĩ/thời gian vào chờ,
- gợi ý giường trống phù hợp,
- mở assign nhanh mà không rời khỏi danh sách.

### 8.2. Vòng đời giường sau khi trả giường

Model đã có `cleaning`, nhưng logic release/discharge hiện đang đưa giường về `empty` khá nhanh. Với vận hành thật, nên có ít nhất một trong hai cách:

- `release -> cleaning -> empty`, hoặc
- cấu hình cho phép chọn có qua bước vệ sinh hay không.

Đây là cải tiến nhỏ nhưng giá trị vận hành rất lớn.

### 8.3. Luồng discharge cần rõ vai trò tiếp theo

Checklist hiện chặn discharge đúng hướng, nhưng UX vẫn còn thiên về tick-box hơn là điều phối công việc. Nên thêm tối thiểu:

- hiển thị mục nào đang thiếu,
- bước tiếp theo thuộc ai xử lý,
- nhấn mạnh ca quá hạn hoặc sắp đến giờ ra viện.

Không cần biến thành workflow engine ở GĐ1, nhưng cần rõ ràng hơn cho người dùng.

### 8.4. Bộ lọc ngữ cảnh cho điều dưỡng và bác sĩ

GĐ1 nên có sẵn những lối tắt như:

- bệnh nhân chưa gán giường,
- bệnh nhân dự kiến ra viện hôm nay,
- bệnh nhân quá hạn dự kiến ra viện,
- phòng còn 1 giường,
- phòng đang full.

Những filter này có giá trị vận hành cao hơn rất nhiều so với chỉ có search text.

### 8.5. Ghi nhận lý do cho các thao tác quan trọng

Transfer modal đã có `reason`, đây là hướng đúng. Nên giữ nhất quán cho các thao tác như:

- khóa giường,
- chuyển phòng,
- trả giường bất thường,
- sửa trạng thái bệnh nhân,
- reset mật khẩu người dùng.

Không nhất thiết bắt buộc mọi thao tác, nhưng nên có lý do ở các thay đổi có tính kiểm soát cao.

## 9. Đánh giá backend và các điểm cần tối ưu

## 9.1. Điểm tốt hiện tại

- Có phân module khá rõ.
- Có transaction ở các thao tác giường và ra viện.
- Có state machine cho bệnh nhân.
- Có audit surface và notification/config schema để mở rộng.
- Có index cơ bản ở các bảng chính.

Đây là nền tốt cho GĐ1, không phải một backend chắp vá.

### 9.2. Điểm cần ưu tiên xử lý

#### A. Data scope chưa được enforced đủ chặt

Đây là việc quan trọng nhất ở backend GĐ1.

Hiện `department_id` của user đã tồn tại, nhưng enforcement chưa thấy đi xuyên suốt qua middleware/controller/query. Nếu không xử lý sớm, hệ thống sẽ rơi vào trạng thái:

- đúng role nhưng thấy quá nhiều dữ liệu,
- khó kiểm soát theo khoa,
- có rủi ro lộ dữ liệu nội bộ giữa các bộ phận.

Khuyến nghị:

1. Chuẩn hóa một lớp scope middleware.
2. Với admin: xem toàn bộ.
3. Với doctor/nurse/records/receptionist: tự ép filter theo `department_id` hoặc policy rõ ràng.
4. Không phụ thuộc frontend gửi filter mới áp dụng.

#### B. Query list chưa chuẩn bị cho scale vừa

Hiện nhiều API list đang trả toàn bộ dữ liệu rồi filter/search trực tiếp từ input mỗi lần gõ. Điều này sẽ ổn ở dataset nhỏ nhưng sẽ xuống nhanh khi số lượng bệnh nhân, giường, lịch sử tăng lên.

Các điểm nên tối ưu ngay trong GĐ1:

- pagination cho patients, rooms, users, audit, discharge list,
- debounce tìm kiếm ở frontend,
- server-side filter rõ ràng hơn cho waiting list và discharge list,
- phân tách API “danh sách vận hành” với API “danh sách đầy đủ”.

#### C. Dashboard query có thể sẽ thành điểm nóng

Dashboard service hiện dùng nhiều query đếm và subquery lặp. Với GĐ1 còn nhỏ thì ổn, nhưng khi nhiều khoa/phòng cùng dùng sẽ dễ thành điểm nóng.

Khuyến nghị:

1. Gom một số phép đếm theo `GROUP BY` thay vì nhiều subquery rời.
2. Bổ sung composite index đúng theo pattern truy vấn thật.
3. Nếu pilot bắt đầu nặng, cân nhắc lớp cache ngắn hạn 15-30 giây cho dashboard.

#### D. Thiếu thống nhất migration/schema là rủi ro triển khai cao

Đây là phát hiện kỹ thuật quan trọng:

- migration cũ tạo `patients`, `patient_checklists`, `bed_history`,
- migration refactor sau đó chuyển sang `admissions`, `admission_checklists`, `admission_bed_history`,
- service hiện tại đang dùng mô hình mới.

Điều này không sai về mặt định hướng, nhưng tạo rủi ro rất thực tế:

- môi trường mới chạy sai thứ tự migration sẽ lệch schema,
- dữ liệu seed và code có thể không khớp,
- onboarding môi trường mới dễ thất bại.

Khuyến nghị GĐ1 phải có một baseline schema sạch để dựng môi trường từ đầu mà không cần đoán.

#### E. Build pipeline hiện chưa đáng tin cậy

Cả client và server đều không build được bằng Yarn trong trạng thái workspace hiện tại vì lỗi lockfile/workspace chưa đồng bộ. Dù chưa kết luận đây là lỗi code, đây vẫn là blocker kỹ thuật cho GĐ1 vì:

- CI/CD sẽ không đáng tin,
- khó xác nhận snapshot build được,
- handoff sang máy khác dễ phát sinh lỗi.

Việc này nên được xem là task hạ tầng bắt buộc trước khi chốt GĐ1.

#### F. Thiếu test tự động cho các luồng sống còn

Hiện không thấy test file trong repo. Với hệ thống y tế nội trú, ít nhất GĐ1 nên có smoke test cho:

1. login,
2. assign bed,
3. transfer bed,
4. discharge blocked khi checklist chưa đủ,
5. discharge success giải phóng giường,
6. dashboard stats sau thay đổi trạng thái chính.

Không cần bao phủ cao ngay, nhưng phải có hàng rào tối thiểu cho luồng sống còn.

#### G. Observability và lỗi nghiệp vụ còn hơi mỏng

Frontend hiện có khá nhiều `catch(() => {})` hoặc chỉ toast chung. Điều này dẫn tới:

- support khó chẩn đoán lỗi,
- user không biết bước tiếp theo,
- conflict race condition khó giải thích khi xảy ra.

Khuyến nghị GĐ1 nên chuẩn hóa tối thiểu:

- mã lỗi nghiệp vụ rõ,
- message ngắn gọn nhưng hành động được,
- log đủ cho các thao tác write,
- retry path cho lỗi conflict hoặc network.

### 9.3. Các tối ưu backend ưu tiên theo mức độ

#### Ưu tiên rất cao

1. Enforce data scope theo user/department ở backend.
2. Chuẩn hóa baseline migration/schema.
3. Sửa trạng thái Yarn/lockfile để build được ổn định.
4. Bổ sung smoke test cho luồng lõi.

#### Ưu tiên cao

1. Pagination và debounce search.
2. Tối ưu query dashboard và list lớn.
3. Hoàn thiện audit cho các hành động GĐ1 quan trọng.
4. Chuẩn hóa lỗi conflict và lỗi validation.

#### Ưu tiên trung bình

1. Cache ngắn hạn cho dashboard.
2. Tách query riêng cho waiting queue/discharge queue.
3. Mở rộng kiểm soát session nếu pilot nhiều user đồng thời.

## 10. Những phát hiện cụ thể đáng lưu ý

### 10.1. Tín hiệu rất tốt

- Luồng transfer bed đã có service riêng, không phải thao tác ghép hời hợt ở frontend.
- Discharge có kiểm tra checklist trước khi cho ra viện.
- Auth middleware có kiểm tra user active và refresh role từ DB.
- Admin đã có department/checklist/config/audit thay vì chỉ placeholder.

### 10.2. Tín hiệu cần xử lý sớm

- Toggle checklist hiện chưa thấy RBAC riêng, bất kỳ user đã auth đều có thể chạm nếu có endpoint access.
- Patients/discharge/checklists đang thiên về “ai login cũng xem được” hơn là “ai được phép mới xem đúng phạm vi”.
- Search/filter hiện bị bắn request khá trực tiếp theo từng thay đổi input.
- Nhiều chỗ swallow error, dễ làm người dùng tưởng hệ thống không phản hồi.
- Token đang nằm ở localStorage, chấp nhận được cho GĐ1 pilot nội bộ nhưng chưa phải lựa chọn tốt nếu triển khai rộng.

## 11. Đề xuất backlog hoàn tất GĐ1

## 11.1. Nhóm bắt buộc trước khi chốt GĐ1

1. Khóa data scope theo khoa/phạm vi dữ liệu ở backend.
2. Sửa environment Yarn để build được ổn định ở cả client và server.
3. Chuẩn hóa baseline migration để dựng môi trường mới không bị lệch schema.
4. Bổ sung smoke test cho 4-6 luồng sống còn.

### 11.2. Nhóm nên làm ngay để MVP vận hành mượt hơn

1. Tạo hàng chờ phân giường riêng.
2. Đưa vòng đời giường `cleaning` vào luồng vận hành.
3. Bổ sung filter nhanh theo ngữ cảnh công việc.
4. Làm discharge list có chọn ngày rõ ràng.
5. Chuẩn hóa error/retry/confirm pattern.

### 11.3. Nhóm nâng chất lượng nhưng không chặn pilot hẹp

1. Giảm inline style, gom về design token/component chung.
2. Tối ưu query dashboard/list lớn.
3. Làm rõ chỉ báo dữ liệu realtime/polling.
4. Tăng nhất quán visual giữa vận hành và admin.

## 12. Kết luận cuối cùng

Nếu nhìn đúng bản chất, dự án hiện tại không còn ở mức “mới dựng khung”. GĐ1 đã có một bộ lõi vận hành nội trú tương đối rõ, đủ để trình diễn, kiểm thử nghiệp vụ và tinh chỉnh cùng khách hàng. Đây là điểm tích cực lớn.

Tuy nhiên, để gọi là chốt xong GĐ1 thì hiện tại vẫn còn 3 việc phải xem là bắt buộc:

1. khóa phân quyền theo phạm vi dữ liệu,
2. làm sạch readiness kỹ thuật gồm migration và Yarn build,
3. bù các luồng trung gian cho điều phối nội trú, đặc biệt là hàng chờ phân giường và vòng đời sau trả giường.

Sau khi xử lý 3 nhóm này, hệ thống sẽ từ trạng thái “MVP đã hình thành” chuyển sang “MVP có thể vận hành nội bộ một cách tự tin”.

## 13. Phụ lục nguồn tham chiếu chính

- `docs_agent/content.md`
- `docs_agent/context_projectt.md`
- `docs_agent/info.md`
- `client/src/App.tsx`
- `client/src/pages/Dashboard/DashboardPage.tsx`
- `client/src/pages/Rooms/RoomListPage.tsx`
- `client/src/pages/Rooms/RoomDetailPage.tsx`
- `client/src/pages/Patients/PatientListPage.tsx`
- `client/src/pages/Discharge/DischargeListPage.tsx`
- `client/src/pages/Admin/UserListPage.tsx`
- `client/src/pages/Admin/AdminPage.tsx`
- `client/src/components/AssignBedModal/AssignBedModal.tsx`
- `client/src/components/TransferModal/TransferModal.tsx`
- `client/src/components/PatientDrawer/PatientDrawer.tsx`
- `server/src/app.ts`
- `server/src/middleware/authMiddleware.ts`
- `server/src/middleware/rbac.ts`
- `server/src/modules/beds/beds.controller.ts`
- `server/src/modules/beds/beds.service.ts`
- `server/src/modules/beds/beds.transfer.ts`
- `server/src/modules/patients/patients.routes.ts`
- `server/src/modules/patients/patients.service.ts`
- `server/src/modules/dashboard/dashboard.service.ts`
- `server/src/modules/users/users.routes.ts`
- `server/src/modules/users/users.service.ts`
- `server/src/database/001_create_users.sql`
- `server/src/database/002_create_core_tables.sql`
- `server/src/database/004_add_features.sql`
- `server/src/database/005_refactor_admissions.sql`