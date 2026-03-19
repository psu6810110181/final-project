import React, { useState, useEffect } from "react";
import api, { 
  createProduct, 
  updateProduct, 
  getAllCategories, 
  getAllRooms, 
  getAllFeatures, 
  getAllColors, 
  getAllMaterials, 
  getAllSizes,
  getAllProducts
} from "../../services/api"; 
import toast from "react-hot-toast"; 
import ProductGeneralInfo from "../../components/Admin/ProductGeneralInfo";
import ProductVariants, { type Variant } from "../../components/Admin/ProductVariants";
import { SearchableSelect } from "../../components/Admin/SearchableDropdown";
import { Search } from "lucide-react"; // ✅ นำเข้า Icon Search

interface ProductFormProps {
  editingProductId: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ editingProductId, onCancel, onSuccess }) => {
  const [localEditingId, setLocalEditingId] = useState<string | null>(editingProductId);
  const [allProductsList, setAllProductsList] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedMainColor, setSelectedMainColor] = useState("");
  const [selectedMainMaterial, setSelectedMainMaterial] = useState("");
  const [selectedMainSize, setSelectedMainSize] = useState("");
  const [mainStock, setMainStock] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(""); 
  const [originalMainImage, setOriginalMainImage] = useState("");
  
  const [variants, setVariants] = useState<Variant[]>([{ color: "", material: "", size: "", price: "", stock: "" }]);

  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);       
  const [featuresList, setFeaturesList] = useState<any[]>([]);
  const [colorsList, setColorsList] = useState<any[]>([]);
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [sizesList, setSizesList] = useState<any[]>([]);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    Promise.all([
      getAllCategories(), getAllRooms(), getAllFeatures(), 
      getAllColors(), getAllMaterials(), getAllSizes(),
      getAllProducts() 
    ])
      .then(([cats, rms, fts, cols, mats, szs, prods]) => {
        setCategoriesList(cats); setRoomsList(rms); setFeaturesList(fts);
        setColorsList(cols); setMaterialsList(mats); setSizesList(szs);
        setAllProductsList(Array.isArray(prods) ? prods : (prods as any).data || []);
      }).catch(console.error);
  }, []);

  useEffect(() => {
    setLocalEditingId(editingProductId);
    if (editingProductId) fetchProductDetails(editingProductId);
    else resetForm();
  }, [editingProductId]);

  const fetchProductDetails = async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`); 
      const pd = response.data;
      
      setName(pd.name || ""); setPrice(String(pd.price || "")); setDescription(pd.description || "");
      setSelectedCategory(pd.category?.split(',')[0] || ""); setSelectedRoom(pd.room?.split(',')[0] || "");
      setSelectedFeatures(pd.features || []);
      setSelectedMainColor(pd.color?.split(',')[0] || ""); setSelectedMainMaterial(pd.material?.split(',')[0] || "");
      setSelectedMainSize(pd.size?.split(',')[0] || ""); setMainStock(String(pd.mainStock || pd.stock || ""));

      let imgStr = pd.image;
      if (typeof imgStr === 'string' && imgStr.startsWith('[')) try { imgStr = JSON.parse(imgStr)[0]; } catch(e){}
      else if (Array.isArray(imgStr)) imgStr = imgStr[0];
      
      setOriginalMainImage(imgStr && !imgStr.startsWith('http') && !imgStr.startsWith('blob:') ? imgStr : "");
      setImageUrl(imgStr?.startsWith('http') ? imgStr : imgStr && !imgStr.startsWith('blob:') ? `${API_BASE_URL}/uploads/${imgStr}` : "");

      if (pd.variants?.length > 0) {
        setVariants(pd.variants.map((v: any) => ({
          color: v.color || "", material: v.material || "", size: v.size || "", price: String(v.price || ""), stock: String(v.stock || ""), 
          imageUrl: v.image?.startsWith('http') || v.image?.startsWith('blob:') ? v.image : `${API_BASE_URL}/uploads/${v.image}`,
          originalImage: v.image?.startsWith('http') || v.image?.startsWith('blob:') ? "" : v.image
        })));
      } else setVariants([{ color: "", material: "", size: "", price: "", stock: "" }]);
    } catch (error) { 
      toast.error("ไม่สามารถโหลดข้อมูลสินค้าเพื่อแก้ไขได้"); 
    }
  };

  const resetForm = () => {
    setName(""); setPrice(""); setDescription(""); setImageUrl(""); setImageFile(null); setOriginalMainImage("");
    setSelectedCategory(""); setSelectedRoom(""); setSelectedFeatures([]); setSelectedMainColor(""); setSelectedMainMaterial(""); setSelectedMainSize("");
    setMainStock("");
    setVariants([{ color: "", material: "", size: "", price: "", stock: "" }]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImageUrl(URL.createObjectURL(file)); }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!name || !price || !selectedCategory) return toast.error("กรุณากรอกชื่อสินค้า, ราคา และเลือกหมวดหมู่");
      
    const formData = new FormData();
    formData.append('name', name); formData.append('price', price); formData.append('category', selectedCategory);
    formData.append('stock', String(parseInt(mainStock) || 0)); formData.append('mainStock', String(parseInt(mainStock) || 0)); 
    if (selectedRoom) formData.append('room', selectedRoom);
    if (description) formData.append('description', description);
    if (selectedMainColor) formData.append('color', selectedMainColor);
    if (selectedMainMaterial) formData.append('material', selectedMainMaterial);
    if (selectedMainSize) formData.append('size', selectedMainSize);

    if (imageFile) formData.append('image', imageFile);
    else if (localEditingId && originalMainImage) formData.append('existingImage', originalMainImage);

    variants.forEach((v, index) => { if (v.imageFile) formData.append(`variantImage_${index}`, v.imageFile); });
    if (selectedFeatures.length > 0) formData.append('features', JSON.stringify(selectedFeatures)); 

    const formattedVariants = variants.filter(v => v.color || v.material || v.size || v.price || v.stock)
      .map(v => {
        const variantData: any = { color: v.color || undefined, material: v.material || undefined, size: v.size || undefined, price: v.price ? parseFloat(v.price) : 0, stock: v.stock ? parseInt(v.stock) : 0 };
        if (!v.imageFile && v.originalImage) variantData.image = v.originalImage;
        return variantData;
      });
    if (formattedVariants.length > 0) formData.append('variants', JSON.stringify(formattedVariants));

    try {
      if (localEditingId) { 
        await updateProduct(localEditingId, formData); 
        toast.success("แก้ไขสินค้าสำเร็จ"); 
      } else { 
        await createProduct(formData); 
        toast.success("บันทึกสินค้าสำเร็จ"); 
      }
      setTimeout(onSuccess, 1500); 
    } catch (error) { 
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล"); 
    }
  };

  return (
    <article style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 0', fontFamily: "'Prompt', sans-serif" }}>
      
      {/* ✅ ส่วน Header และ Dropdown แบบใหม่ที่มี Search */}
      <header style={{ 
        background: '#F8FAFC', padding: '24px 32px', borderRadius: '16px', 
        borderLeft: `8px solid ${localEditingId ? '#148F96' : '#D65A31'}`, 
        marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '16px' 
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>
            {localEditingId ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
          </h2>

          <div style={{ flex: '1', minWidth: '280px', maxWidth: '400px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
              <Search size={14} /> ค้นหาสินค้าเพื่อดึงข้อมูลมาแก้ไข
            </label>
            
            <SearchableSelect 
              value={localEditingId || ""}
              onChange={(val) => {
                setLocalEditingId(val || null);
                if (val) fetchProductDetails(val);
                else resetForm();
              }}
              options={[
                { value: "", label: "-- สร้างสินค้าใหม่ (เคลียร์ฟอร์ม) --" },
                ...allProductsList.map((product) => ({
                  value: product.id,
                  label: `${product.name} (คงเหลือ: ${product.stock})`
                }))
              ]}
              placeholder="ค้นหารายชื่อสินค้า..."
            />
            
          </div>
        </div>
      </header>

      <form onSubmit={handleConfirm}>
        <ProductGeneralInfo 
          name={name} setName={setName} price={price} setPrice={setPrice} description={description} setDescription={setDescription}
          imageUrl={imageUrl} handleImageChange={handleImageChange} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
          selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} selectedMainColor={selectedMainColor} setSelectedMainColor={setSelectedMainColor}
          selectedMainMaterial={selectedMainMaterial} setSelectedMainMaterial={setSelectedMainMaterial} selectedMainSize={selectedMainSize} setSelectedMainSize={setSelectedMainSize}
          mainStock={mainStock} setMainStock={setMainStock} selectedFeatures={selectedFeatures} setSelectedFeatures={setSelectedFeatures}
          categoriesList={categoriesList} roomsList={roomsList} colorsList={colorsList} materialsList={materialsList} sizesList={sizesList} featuresList={featuresList}
        />
        <ProductVariants 
          variants={variants} setVariants={setVariants} colorsList={colorsList} materialsList={materialsList} sizesList={sizesList}
        />
        <footer style={{ display: "flex", justifyContent: "flex-end", gap: "16px", padding: '10px 0 40px 0' }}>
          {localEditingId && (
            <button type="button" onClick={onCancel} style={{ padding: "14px 28px", background: 'white', borderRadius: "10px", border: '1px solid #E5E7EB', cursor: "pointer", fontWeight: 'bold' }}>
              ยกเลิกการแก้ไข
            </button>
          )}
          <button type="submit" style={{ padding: "14px 32px", background: localEditingId ? '#148F96' : '#D65A31', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
            {localEditingId ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่มสินค้า'}
          </button>
        </footer>
      </form>
    </article>
  );
};

export default ProductForm;