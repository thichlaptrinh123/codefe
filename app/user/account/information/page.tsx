'use client';

import React from "react";
// Nếu dùng Font Awesome qua CDN thì không cần import gì thêm
// Nếu dùng package thì cài: npm i @fortawesome/react-fontawesome ...
import Link from "next/link";
import '../../css_user/account.css'; // Import the CSS file for styling
import MaxWidthWrapper from "../../../components/maxWidthWrapper"; // Import the MaxWidthWrapper component
export default function AccountInformationPage() {
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
    <div className="content-accountInformation">
      <div className="address-box-accountInformation">
        <div className="address-header-accountInformation">
          <span className="address-information-accountInformation">
            (Địa chỉ mặc định)
          </span>
          <div className="icons-accountInformation">
            <button title="Chỉnh sửa">✎</button>
            <button title="Xoá">✖</button>
          </div>
        </div>
        <div className="address-info-accountInformation">
          <p>
            <strong>Họ và tên:</strong> Thanh Qui
          </p>
          <p>
            <strong>Số điện thoại:</strong> 03353525020
          </p>
          <p>
            <strong>Địa chỉ:</strong> Chưa có
          </p>
        </div>
      </div>

      <button className="add-address-information-accountInformation text-left">
        <i className="fa-solid fa-plus" /> Thêm địa chỉ
      </button>
    </div>
        </div>
    </>
  );
}