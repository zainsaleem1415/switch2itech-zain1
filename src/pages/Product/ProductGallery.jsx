import { useState } from "react";

export function ProductGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <img
          src={images[selectedImage]}
          alt={`Product view ${selectedImage + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`aspect-video overflow-hidden rounded-lg border-2 transition-all ${
              selectedImage === index
                ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "border-border hover:border-primary/50"
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
