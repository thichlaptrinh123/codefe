// "use client";

// import React from "react";
// import Swal from "sweetalert2";

// interface TopbarProps {
//   onToggleSidebar: () => void;
// }

// export default function Topbar({ onToggleSidebar }: TopbarProps) {
//   const handleLogoutClick = () => {
//     Swal.fire({
//       title: "Bạn chắc chắn muốn đăng xuất?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Đăng xuất",
//       cancelButtonText: "Hủy",
//       confirmButtonColor: "#960130",
//       cancelButtonColor: "#ccc",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         console.log("Đăng xuất thành công!");
//       }
//     });
//   };

//   return (
//     <header className="flex items-center justify-between px-4 py-3 bg-primary text-white shadow md:pl-6">
//       <button
//         className="lg:hidden"
//         onClick={onToggleSidebar}
//         aria-label="Toggle sidebar"
//       >
//         <i className="bx bx-menu text-2xl"></i>
//       </button>

//       <h1 className="text-lg font-semibold font-roboto">Trang quản trị</h1>

//       <div className="flex items-center space-x-4">
//         <button
//           onClick={handleLogoutClick}
//           className="flex items-center gap-2 transition hover:opacity-80"
//         >
//           <i className="bx bx-log-out text-xl"></i>
//           <span className="hidden sm:inline">Đăng xuất</span>
//         </button>
//       </div>
//     </header>
//   );
// }
"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUsername(user.username || "Người dùng");
      } catch {
        setUsername("Người dùng");
      }
    }
  }, []);

  const handleLogoutClick = () => {
    Swal.fire({
      title: "Bạn chắc chắn muốn đăng xuất?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#960130",
      cancelButtonColor: "#ccc",
    }).then((result) => {
      if (result.isConfirmed) {
        // Xóa token và user
        document.cookie =
          "token=; path=/; max-age=0; Secure; SameSite=Strict"; // Xóa cookie
        localStorage.removeItem("user");

        Swal.fire("Đã đăng xuất!", "", "success").then(() => {
          window.location.href = "/user/login"; // ✅ đường dẫn tuyệt đối
        });        
      }
    });
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-primary text-white shadow md:pl-6">
      <button
        className="lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <i className="bx bx-menu text-2xl"></i>
      </button>

      <h1 className="text-lg font-semibold font-roboto">Trang quản trị</h1>

      <div className="flex items-center space-x-4">
      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
          <i className="bx bx-user text-sx"></i>
          <span className="font-medium">{username}</span>
        </div>

        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-2 transition hover:opacity-80"
        >
          <i className="bx bx-log-out text-xl"></i>
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}