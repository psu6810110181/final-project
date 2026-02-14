import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">รายละเอียดสินค้า {id}</h1>
      {/* Product Info */}
    </div>
  );
};

export default ProductDetail;