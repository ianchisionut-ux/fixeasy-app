"use client";

// Redimensioneaza si comprima o imagine in browser, inainte de a o trimite ca base64.
// Evita payload-uri uriase in baza de date pentru poze de profil/galerie.
export function resizeImage(file, maxDimension = 600, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Fișierul trebuie să fie o imagine."));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Imagine invalidă."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Eroare la citirea fișierului."));
    reader.readAsDataURL(file);
  });
}
