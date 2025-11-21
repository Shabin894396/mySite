import { useState } from "react";

export default function ImageGallery({ images }: { images: string[] | null }) {
  const imgs = images && images.length ? images : [];
  const [idx, setIdx] = useState(0);

  if (!imgs.length) {
    return null;
  }

  return (
    <div>
      <div className="mb-4">
        <img src={imgs[idx]} alt={`img-${idx}`} className="w-full h-[420px] object-cover rounded" />
      </div>

      <div className="flex gap-2">
        {imgs.map((src, i) => (
          <img
            key={i}
            src={src}
            onClick={() => setIdx(i)}
            className={`w-20 h-20 object-cover rounded cursor-pointer border ${i === idx ? "ring-2 ring-primary" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
