    'use client';

import Link from "next/link";
// import '../../css_user/account.css'; // Import the CSS file for styling
import MaxWidthWrapper from "../../../components/maxWidthWrapper"; 
export default function ChangePasswordPage() {
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
    <Link href="/account">
      <i className="fa-regular fa-user" /> Thông tin
    </Link>
  </li>
  <li className="menu-left">
    <Link href="/accountoder">
      <i className="fas fa-box" /> Lịch sử đơn hàng
    </Link>
  </li>
  <li className="menu-left">
    <Link href="/accountInformation">
      <i className="fas fa-map-marker-alt" /> Địa chỉ
    </Link>
  </li>
  <li className="menu-left">
    <Link href="/accountchangepassword">
      <i className="fas fa-lock" /> Đổi mật khẩu
    </Link>
  </li>
  <li className="menu-left">
    <Link href="/logout">
      <i className="fas fa-right-from-bracket" /> Đăng xuất
    </Link>
  </li>
</ul>
        </div>

        {/* Form đổi mật khẩu */}
        <form className="form-changepassword">
          <h2 className="form-title-changepassword text-left">Đổi mật khẩu</h2>

          <div>
            <label className="label-changepassword">Nhập mật khẩu cũ</label>
            <input
              className="input-changepassword"
              type="password"
              placeholder="Nhập mật khẩu cũ"
            />
          </div>

          <div>
            <label className="label-changepassword">Nhập mật khẩu mới</label>
            <input
              className="input-changepassword"
              type="password"
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div>
            <label className="label-changepassword">Xác nhận mật khẩu mới</label>
            <input
              className="input-changepassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          <div className="form-buttons-changepassword">
            <button type="button" className="cancel-changepassword">
              Huỷ
            </button>
            <button type="submit" className="save-changepassword">
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </>
  );
}