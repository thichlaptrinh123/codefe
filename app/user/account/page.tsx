import Link from "next/link";
import '../css_user/account.css'; // Import the CSS file for styling
import MaxWidthWrapper from "../../components/maxWidthWrapper"; // Import the MaxWidthWrapper component
export default function AccountPage() {
  return (
    <>
     <div className="breadcrumb">
     <MaxWidthWrapper>
    <Link href="#">Trang chủ</Link> / <span>Bộ sưu tập</span>
    </MaxWidthWrapper>
  </div>
    <div className="container-account">
      {/* Sidebar */}
      <div className="sidebar-account">
        <h3 className="heading-divider">Tài khoản của bạn</h3>
        <ul className="menu-account">
          <li className="menu-left">
            <Link href="/account"><i className="fa-regular fa-user"></i> Thông tin</Link>
          </li>
          <li className="menu-left">
            <Link href="/accountoder"><i className="fas fa-box"></i> Lịch sử đơn hàng</Link>
          </li>
          <li className="menu-left">
            <Link href="/accountInformation"><i className="fas fa-map-marker-alt"></i> Địa chỉ</Link>
          </li>
          <li className="menu-left">
            <Link href="/accountchangepassword"><i className="fas fa-lock"></i> Đổi mật khẩu</Link>
          </li>
          <li className="menu-left">
            <Link href="/logout"><i className="fas fa-right-from-bracket"></i> Đăng xuất</Link>
          </li>
        </ul>
      </div>

      {/* Content */}
      <div className="content-account">
        <h2>Thông tin tài khoản</h2>
        <div className="form-group-account">
          <label>Họ và tên</label>
          <input type="text" value="Thanh Qui" />
        </div>
        <div className="form-group-account">
          <label>Email</label>
          <input type="email" placeholder="Nhập email" />
        </div>
        <div className="form-group-account">
          <label>Số điện thoại</label>
          <input type="text" value="03535325020" />
        </div>
        <button className="btn-update-account">Cập nhật</button>
      </div>
    </div>
    </>
  );
}