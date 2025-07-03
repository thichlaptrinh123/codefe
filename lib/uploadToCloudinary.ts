import Swal from "sweetalert2";

export const uploadToCloudinary = (
  file: File,
  onProgress: (percent: number) => void,
  timeoutMs = 10000 // ⏱ giới hạn thời gian upload: 10 giây
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "aura_unsigned");
    formData.append("folder", "aura_shop");

    const timeoutId = setTimeout(() => {
      xhr.abort(); // ⛔ huỷ upload
      Swal.fire({
        title: "Tải ảnh quá lâu",
        text: `"${file.name}" tải quá lâu. Bạn muốn thử lại không?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Thử lại",
        cancelButtonText: "Bỏ qua",
      }).then((result) => {
        if (result.isConfirmed) {
          // 👇 Thử lại upload (gọi lại chính hàm này)
          uploadToCloudinary(file, onProgress, timeoutMs)
            .then(resolve)
            .catch(reject);
        } else {
          reject("Bạn đã huỷ tải ảnh");
        }
      });
    }, timeoutMs); // ⏱ thời gian đợi upload (ms)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      clearTimeout(timeoutId); // ✅ xoá timeout nếu xong
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && res.secure_url) {
          resolve(res.secure_url);
        } else {
          reject(res.error?.message || "Upload thất bại");
        }
      } catch (err) {
        reject("Lỗi phân tích phản hồi từ Cloudinary");
      }
    };

    xhr.onerror = () => {
      clearTimeout(timeoutId);
      reject("❌ Lỗi mạng khi upload ảnh");
    };

    xhr.open("POST", "https://api.cloudinary.com/v1_1/dsuwxxq7f/image/upload", true);
    xhr.send(formData);
  });
};
