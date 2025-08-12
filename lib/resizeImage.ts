// lib/resizeImage.ts

export const resizeImage = (file: File, maxWidth: number = 800): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
          const width = img.width * ratio;
          const height = img.height * ratio;
  
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Không thể vẽ canvas");
  
          ctx.drawImage(img, 0, 0, width, height);
  
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              } else {
                reject("Resize ảnh thất bại");
              }
            },
            file.type,
            1.0 // chất lượng ảnh (0.0 - 1.0), bạn có thể chỉnh nếu muốn
          );
        };
        img.onerror = () => reject("Không thể đọc ảnh");
        img.src = event.target?.result as string;
      };
  
      reader.onerror = () => reject("Không thể đọc file ảnh");
      reader.readAsDataURL(file);
    });
  };
  