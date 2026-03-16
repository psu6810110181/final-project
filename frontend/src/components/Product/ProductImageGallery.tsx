// frontend/src/components/Product/ProductImageGallery.tsx
import React from 'react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  selectedImageIndex: number;
  handleImageInteract: (index: number) => void;
  getImageUrl: (img: string) => string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images, productName, selectedImageIndex, handleImageInteract, getImageUrl
}) => {
  return (
    <div className="flex gap-4 h-[400px] md:h-[450px]">
      {/* Thumbnails */}
      <div className="flex flex-col gap-3 w-20 overflow-y-auto no-scrollbar">
        {images.map((img, index) => (
          <button 
            key={index}
            onClick={() => handleImageInteract(index)}
            onMouseEnter={() => handleImageInteract(index)}
            className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 
              ${selectedImageIndex === index ? 'border-[#D65A31] shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <img src={getImageUrl(img)} alt={`preview-${index}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      
      {/* Main Image Zoom */}
      <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative cursor-zoom-in group">
        <img 
          src={getImageUrl(images[selectedImageIndex])} 
          alt={productName} 
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-[2]" 
          onMouseMove={(e) => {
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
          }}
        />
      </div>
    </div>
  );
};

export default ProductImageGallery;