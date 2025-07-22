'use client';

import Link from "next/link";
// import styles from './page.module.css'; // Sử dụng module CSS
import MaxWidthWrapper from "../../../components/maxWidthWrapper";

export default function AccountInformationPage() {
  return (
    <>
      <div className={styles.breadcrumb}>
        <MaxWidthWrapper>
          <Link href="#">Trang chủ</Link> / <span>Bộ sưu tập</span>
        </MaxWidthWrapper>
      </div>

      <div className={styles.containerAccount}>
        {/* Sidebar */}
        <div className={styles.sidebarAccount}>
          <h3 className={styles.headingDivider}>Tài khoản của bạn</h3>
          <ul className={styles.menuAccount}>
            <li className={styles.menuLeft}><Link href="/account"><i className="fa-regular fa-user" /> Thông tin</Link></li>
            <li className={styles.menuLeft}><Link href="/accountoder"><i className="fas fa-box" /> Lịch sử đơn hàng</Link></li>
            <li className={styles.menuLeft}><Link href="/accountInformation"><i className="fas fa-map-marker-alt" /> Địa chỉ</Link></li>
            <li className={styles.menuLeft}><Link href="/accountchangepassword"><i className="fas fa-lock" /> Đổi mật khẩu</Link></li>
            <li className={styles.menuLeft}><Link href="/logout"><i className="fas fa-right-from-bracket" /> Đăng xuất</Link></li>
          </ul>
        </div>

        {/* Content */}
        <div className={styles.contentAccountInformation}>
          <div className={styles.addressBox}>
            <div className={styles.addressHeader}>
              <span className={styles.addressInfo}>(Địa chỉ mặc định)</span>
              <div className={styles.icons}>
                <button title="Chỉnh sửa">✎</button>
                <button title="Xoá">✖</button>
              </div>
            </div>
            <div>
              <p><strong>Họ và tên:</strong> Thanh Qui</p>
              <p><strong>Số điện thoại:</strong> 03353525020</p>
              <p><strong>Địa chỉ:</strong> Chưa có</p>
            </div>
          </div>
          <button className={styles.addAddress}><i className="fa-solid fa-plus" /> Thêm địa chỉ</button>
        </div>
      </div>
    </>
  );
}
