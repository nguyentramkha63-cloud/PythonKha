
import { ExampleCode } from './types';

export const PYTHON_EXAMPLES: ExampleCode[] = [
  {
    title: "Chào hỏi",
    code: "print('Chào em! Thầy Kha khó tính nhưng em là number one đây!') # In lời chào ra màn hình",
    description: "Lệnh in cơ bản để xuất lời chào."
  },
  {
    title: "Vòng lặp For",
    code: "for i in range(5): # Lặp 5 lần, biến i chạy từ 0 đến 4\n    print(f'Số thứ tự: {i+1}') # In ra số thứ tự (tăng i thêm 1 để bắt đầu từ 1)",
    description: "Sử dụng vòng lặp for để in dãy số."
  },
  {
    title: "Kiểm tra điều kiện",
    code: "diem = 10 # Tạo biến diem và gán giá trị là 10\nif diem >= 8: # Kiểm tra nếu điểm lớn hơn hoặc bằng 8\n    print('Bạn đạt loại Giỏi! Xuất sắc!') # Nếu đúng thì in dòng này\nelse: # Nếu sai (điểm nhỏ hơn 8)\n    print('Cố gắng thêm chút nữa nhé!') # Thì in dòng này",
    description: "Dùng câu lệnh if-else để kiểm tra điều kiện."
  },
  {
    title: "Vòng lặp While",
    code: "dem = 1 # Bắt đầu đếm từ 1\nwhile dem <= 5: # Khi biến dem còn nhỏ hơn hoặc bằng 5 thì tiếp tục lặp\n    print(f'Thầy Kha đếm: {dem}') # In số đang đếm hiện tại\n    dem += 1 # Tăng biến dem lên 1 đơn vị để không bị lặp vô tận\nprint('Hết rồi em ơi!') # Thông báo khi kết thúc vòng lặp",
    description: "Sử dụng vòng lặp while để đếm số cho đến khi điều kiện không còn đúng."
  },
  {
    title: "Xây dựng Hàm (Function)",
    code: "def chao_hoc_sinh(ten): # Định nghĩa hàm tên là chao_hoc_sinh nhận vào biến ten\n    return f'Chào mừng {ten} đến với lớp của thầy Kha!' # Trả về chuỗi lời chào\n\nten_em = 'Linh' # Tạo biến lưu tên học sinh\nthong_bao = chao_hoc_sinh(ten_em) # Gọi hàm và lưu kết quả vào biến thong_bao\nprint(thong_bao) # In kết quả cuối cùng ra màn hình",
    description: "Cách tạo và gọi một hàm (function) trong Python."
  },
  {
    title: "Làm việc với Danh sách (List)",
    code: "# 1. Tạo danh sách ban đầu\ntrai_cay = ['Táo', 'Chuối', 'Cam']\nprint(f'Ban đầu: {trai_cay}')\n\n# 2. Đếm số lượng phần tử\nso_luong = len(trai_cay) # Hàm len() dùng để đếm số phần tử\nprint(f'Danh sách đang có {so_luong} loại quả.')\n\n# 3. Thêm phần tử\ntrai_cay.append('Xoài')           # Thêm vào cuối danh sách\ntrai_cay.insert(0, 'Sầu riêng')   # Thêm vào ĐẦU danh sách (vị trí 0)\ntrai_cay.insert(2, 'Măng cụt')    # Thêm vào GIỮA (vị trí số 2)\nprint(f'Sau khi thêm, có {len(trai_cay)} quả: {trai_cay}')\n\n# 4. Xóa phần tử\ntrai_cay.remove('Chuối')          # Xóa phần tử có giá trị là 'Chuối'\nqua_lay_ra = trai_cay.pop(1)      # Xóa và lấy ra phần tử ở vị trí số 1\ndel trai_cay[0]                  # Xóa hẳn phần tử ở vị trí số 0\nprint(f'Sau khi xóa bớt, còn {len(trai_cay)} quả: {trai_cay}')\n\n# 5. Xóa sạch danh sách\ntrai_cay.clear()                  # Làm trống danh sách\nprint(f'Xóa sạch rồi, còn {len(trai_cay)} quả: {trai_cay}')",
    description: "Hướng dẫn chi tiết: đếm số phần tử bằng len(), thêm vào đầu/giữa, xóa theo tên, xóa theo vị trí và làm sạch danh sách."
  },
  {
    title: "Nhập liệu (Input)",
    code: "ten = input('Em tên là gì? ') # Yêu cầu người dùng nhập tên\ntuoi = int(input('Em bao nhiêu tuổi rồi? ')) # Nhập tuổi và chuyển sang kiểu số nguyên (int)\nprint(f'Chào {ten}, {tuoi} tuổi là lứa tuổi đẹp nhất để học Python đó!') # In lời nhắn",
    description: "Sử dụng lệnh input() để tương tác với người dùng."
  },
  {
    title: "Từ điển (Dictionary)",
    code: "hoc_sinh = { # Tạo từ điển lưu thông tin\n    'ten': 'Minh', # Khóa 'ten' có giá trị 'Minh'\n    'lop': '6A', # Khóa 'lop' có giá trị '6A'\n    'diem': 9.5 # Khóa 'diem' có giá trị 9.5\n}\nprint(f\"Bạn {hoc_sinh['ten']} học lớp {hoc_sinh['lop']} đạt {hoc_sinh['diem']} điểm.\") # Truy xuất dữ liệu theo khóa",
    description: "Lưu trữ thông tin theo cặp khóa (key) và giá trị (value)."
  },
  {
    title: "Làm việc với kiểu file",
    code: "# Mở file để ghi (chế độ 'w' - write)\nwith open('thay_kha.txt', 'w', encoding='utf-8') as f:\n    f.write('Học Python cùng Thầy Kha thật là vui!')\n\n# Mở file để đọc (chế độ 'r' - read)\nwith open('thay_kha.txt', 'r', encoding='utf-8') as f:\n    noi_dung = f.read()\n    print('Thầy đọc được từ file nè:', noi_dung)",
    description: "Hướng dẫn cách ghi và đọc dữ liệu từ tập tin văn bản."
  },
  {
    title: "Kiểm tra Số nguyên tố",
    code: "def kiem_tra_nt(n):\n    if n < 2: return False\n    # Kiểm tra từ 2 đến căn bậc hai của n\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0: return False\n    return True\n\nso = 17\nif kiem_tra_nt(so):\n    print(f'Thầy Kha thấy {so} là số nguyên tố đó!')\nelse:\n    print(f'{so} không phải số nguyên tố đâu em.')",
    description: "Thuật toán cơ bản để kiểm tra một số có phải là số nguyên tố hay không."
  },
  {
    title: "Tính Giai thừa (Đệ quy)",
    code: "def giai_thua(n):\n    if n == 0 or n == 1: # Điều kiện dừng của đệ quy\n        return 1\n    return n * giai_thua(n - 1) # Gọi lại chính nó với n-1\n\nn = 5\nprint(f'Thầy tính giai thừa của {n} là: {giai_thua(n)}')",
    description: "Sử dụng hàm đệ quy (hàm gọi lại chính nó) để tính giai thừa n!."
  },
  {
    title: "Sắp xếp nổi bọt (Bubble Sort)",
    code: "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        # So sánh từng cặp phần tử kề nhau\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j] # Hoán đổi vị trí\n    return arr\n\ndãy = [64, 34, 25, 12, 22, 11, 90]\nprint(f'Dãy sau khi Thầy sắp xếp xong: {bubble_sort(dãy)}')",
    description: "Một thuật toán sắp xếp kinh điển giúp em hiểu về cách tổ chức dữ liệu."
  },
  {
    title: "Thư viện Toán học (Math)",
    code: "import math # Nhập thư viện toán học của Python\n\nban_kinh = 5\ndien_tich = math.pi * (ban_kinh ** 2) # Tính diện tích: Pi * R^2\nprint(f'Diện tích hình tròn bán kính {ban_kinh} là: {dien_tich:.2f}')\nprint(f'Căn bậc hai của 144 là: {math.sqrt(144)}')\nprint(f'Giai thừa của 6 (dùng math) là: {math.factorial(6)}')",
    description: "Cách sử dụng các công cụ toán học mạnh mẽ có sẵn trong thư viện 'math'."
  },
  {
    title: "Xử lý Chuỗi nâng cao",
    code: "cau = 'Học Python cùng Thầy Kha thật là Thú Vị!'\nprint(f'In hoa hết: {cau.upper()}')\nprint(f'In thường hết: {cau.lower()}')\nprint(f'Cắt thành danh sách: {cau.split()}')\nprint(f'Thay thế từ: {cau.replace(\"Thú Vị\", \"Number One\")}')\nprint(f'Kiểm tra bắt đầu bằng \"Học\": {cau.startswith(\"Học\")}')",
    description: "Các phương thức xử lý văn bản (String) cực kỳ hữu dụng trong Python."
  },
  {
    title: "Xử lý lỗi (Try...Except)",
    code: "try:\n    # Thử thực hiện đoạn mã có thể gây lỗi\n    so = int(input('Nhập một số nguyên bất kỳ: '))\n    ket_qua = 100 / so\n    print(f'100 chia cho {so} bằng {ket_qua}')\nexcept ValueError:\n    print('Em ơi, phải nhập số nguyên chứ, đừng nhập chữ!')\nexcept ZeroDivisionError:\n    print('Lỗi chia cho 0 rồi! Máy tính không làm phép tính này được đâu.')\nexcept Exception as e:\n    print(f'Có lỗi lạ rồi em ơi: {e}')",
    description: "Cách bảo vệ chương trình không bị 'sập' khi người dùng nhập sai dữ liệu."
  },
  {
    title: "Lọc số (List Comprehension)",
    code: "ds_so = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n# Cách viết Pythonic để lọc các số chẵn\nso_chan = [x for x in ds_so if x % 2 == 0]\n\n# Cách viết để bình phương các số\nbinh_phuong = [x**2 for x in ds_so]\n\nprint(f'Các số chẵn Thầy lọc được: {so_chan}')\nprint(f'Dãy bình phương: {binh_phuong}')",
    description: "Kỹ thuật viết code ngắn gọn, mạnh mẽ đặc trưng của ngôn ngữ Python."
  },
  {
    title: "Nhập nhiều số trên 1 dòng",
    code: "# Nhập 3 số a, b, c cách nhau bởi dấu cách trên cùng 1 dòng\nprint('Nhập 3 số cách nhau bởi dấu cách:')\na, b, c = map(int, input().split())\n\ntong = a + b + c\nprint(f'Thầy tính tổng của {a}, {b}, {c} là: {tong}')\n\n# Nhập cả một danh sách số trên 1 dòng\nprint('Nhập một dãy số cách nhau bởi dấu cách:')\nds = list(map(int, input().split()))\nprint(f'Dãy em vừa nhập có {len(ds)} phần tử.')",
    description: "Kỹ thuật quan trọng khi đi thi Học sinh giỏi (HSG) để xử lý dữ liệu đầu vào."
  }
];
