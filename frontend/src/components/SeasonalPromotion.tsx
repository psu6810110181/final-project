// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { ShoppingCart, Star, Sun, Waves, Sparkles, Leaf, Wind, Snowflake, Flower } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { useCart } from '../contexts/CartContext';
// import * as api from '../services/api';
// import type { ProductWithPromo } from '../pages/Home';
// import { seasonalThemes, getSeasonFromPromoTitle } from '../constants/seasonalThemes';

// interface SeasonalPromotionProps {
//   products: ProductWithPromo[];
//   title?: string;
//   season?: string;
// }

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// const getImageUrl = (product: ProductWithPromo) => {
//   try {
//       const rawImages = product.image;
//       let images: string[] = [];
//       if (Array.isArray(rawImages)) {
//           images = rawImages;
//       } else if (typeof rawImages === 'string') {
//           images = rawImages.startsWith('[') ? JSON.parse(rawImages) : [rawImages];
//       }
//       if (images.length > 0) {
//           const img = images[0];
//           if (img.startsWith('http')) return img;
//           return `${API_BASE_URL}/uploads/${img}`;
//       }
//   } catch (e) {
//       console.error("Error parsing image:", e);
//   }
//   return "https://placehold.co/400x300?text=No+Image";
// };

// const SeasonalPromotion: React.FC<SeasonalPromotionProps> = ({ products, title, season }) => {
//   // Determine season from title or props or current season
//   const detectedSeason = season || (title ? getSeasonFromPromoTitle(title) : 'summer');
//   const theme = seasonalThemes[detectedSeason] || seasonalThemes.summer;
  
//   const iconMap = {
//     Sun, Waves, Sparkles, Leaf, Wind, Snowflake, Flower
//   };
//   const [bookmarks, setBookmarks] = useState<string[]>([]);
//   const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
//     days: 0,
//     hours: 0,
//     minutes: 0,
//     seconds: 0
//   });

//   const { addToCart } = useCart();
//   const navigate = useNavigate();

//   // ดึงข้อมูล Bookmark
//   useEffect(() => {
//     const fetchBookmarks = async () => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             try {
//                 const data = await api.getBookmarks();
//                 const bookmarkIds = Array.isArray(data) ? data.map((b: any) => b.productId || b.product?.id || b.id) : (data && Array.isArray(data.data) ? data.data.map((b: any) => b.productId || b.product?.id || b.id) : []);
//                 setBookmarks(bookmarkIds);
//             } catch (error) {
//                 console.error('Failed to load bookmarks', error);
//             }
//         }
//     };

//     fetchBookmarks();

//     // ฟัง Event กรณีมีการกด Bookmark จากหน้าอื่น
//     const handleBookmarkUpdate = () => fetchBookmarks();
//     window.addEventListener('bookmarksUpdated', handleBookmarkUpdate);

//     return () => {
//         window.removeEventListener('bookmarksUpdated', handleBookmarkUpdate);
//     };
//   }, []);

//   // นับเวลาถอยหลัง - ใช้เวลาสิ้นสุดของโปรโมชั่นแรกที่พบ
//   useEffect(() => {
//     const calculateTimeLeft = () => {
//       if (products.length === 0) return;

//       // หาโปรโมชั่นแรกที่มีสินค้า
//       const firstProductWithPromo = products.find(p => p.promo);
//       if (!firstProductWithPromo || !firstProductWithPromo.promo) return;

//       const endTime = new Date(firstProductWithPromo.promo.endDate);
//       const now = new Date();
//       const difference = endTime.getTime() - now.getTime();

//       if (difference > 0) {
//         const days = Math.floor(difference / (1000 * 60 * 60 * 24));
//         const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//         const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
//         const seconds = Math.floor((difference % (1000 * 60)) / 1000);

//         setTimeLeft({ days, hours, minutes, seconds });
//       } else {
//         setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//       }
//     };

//     calculateTimeLeft();
//     const interval = setInterval(calculateTimeLeft, 1000);

//     return () => clearInterval(interval);
//   }, [products]);

//   // จัดการการเพิ่มตะกร้า
//   const handleAddToCart = async (e: React.MouseEvent, product: ProductWithPromo) => {
//     e.preventDefault();
//     const token = localStorage.getItem('token');
//     if (!token) {
//       toast.error('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
//       navigate('/login');
//       return;
//     }
//     await addToCart(product.id, 1); 
//   };

//   // จัดการปุ่มถูกใจ (Bookmark)
//   const toggleBookmark = async (e: React.MouseEvent, productId: string) => {
//     e.preventDefault(); 
//     e.stopPropagation();
    
//     const token = localStorage.getItem('token');
//     if (!token) {
//         toast.error('กรุณาเข้าสู่ระบบเพื่อบันทึกสินค้าที่สนใจ');
//         navigate('/login');
//         return;
//     }

//     try {
//         if (bookmarks.includes(productId)) {
//             await api.removeBookmark(productId);
//             setBookmarks(prev => prev.filter(id => id !== productId));
//             toast.success('ลบออกจากสินค้าที่สนใจแล้ว');
//         } else {
//             await api.addBookmark(productId);
//             setBookmarks(prev => [...prev, productId]);
//             toast.success('เพิ่มลงในสินค้าที่สนใจแล้ว');
//         }
//         window.dispatchEvent(new Event('bookmarksUpdated'));
//     } catch (error) {
//         toast.error('เกิดข้อผิดพลาดในการจัดการสินค้าที่สนใจ');
//     }
//   };

//   const calculateDiscountPrice = (price: string | number, promo: any) => {
//     const p = Number(price);
//     if (promo.discountType === 'PERCENTAGE') return p - (p * (promo.discountValue / 100));
//     return Math.max(0, p - promo.discountValue);
//   };

//   if (products.length === 0) {
//     return null;
//   }

//   return (
//     <div className="relative overflow-hidden rounded-2xl shadow-2xl"
//          style={{
//            background: theme.gradient,
//            backgroundSize: '400% 400%',
//            animation: theme.animation,
//            padding: '24px',
//            margin: '20px 0 40px 0',
//          }}>
      
//       {/* Animated Seasonal Elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {/* Floating Seasonal Icons */}
//         <div className="absolute top-4 right-4 text-white/80 animate-pulse">
//           {theme.iconComponent[0] === 'Sun' && <Sun size={40} className="animate-spin-slow" style={{ animationDuration: '20s' }} />}
//           {theme.iconComponent[0] === 'Leaf' && <Leaf size={40} className="animate-bounce" style={{ animationDuration: '3s' }} />}
//           {theme.iconComponent[0] === 'Snowflake' && <Snowflake size={40} className="animate-spin" style={{ animationDuration: '8s' }} />}
//           {theme.iconComponent[0] === 'Flower' && <Flower size={40} className="animate-pulse" style={{ animationDuration: '2s' }} />}
//         </div>
        
//         {/* Secondary Elements */}
//         <div className="absolute bottom-0 left-0 right-0 flex justify-around opacity-30">
//           {[...Array(6)].map((_, i) => {
//             const IconComponent = iconMap[theme.iconComponent[1] as keyof typeof iconMap];
//             return (
//               <IconComponent 
//                 key={i} 
//                 size={30 + Math.random() * 20} 
//                 className="text-white/60 animate-bounce" 
//                 style={{ 
//                   animationDelay: `${i * 0.5}s`,
//                   animationDuration: '3s',
//                   transform: `translateY(${Math.random() * 10}px)`
//                 }} 
//               />
//             );
//           })}
//         </div>
        
//         {/* Sparkles */}
//         {[...Array(12)].map((_, i) => {
//           const IconComponent = iconMap[theme.iconComponent[2] as keyof typeof iconMap];
//           return (
//             <div
//               key={i}
//               className="absolute animate-pulse"
//               style={{
//                 top: `${Math.random() * 100}%`,
//                 left: `${Math.random() * 100}%`,
//                 animationDelay: `${Math.random() * 5}s`,
//                 animationDuration: '2s'
//               }}
//             >
//               <IconComponent size={15} className="text-white/40 opacity-60" />
//             </div>
//           );
//         })}
//       </div>

//       {/* Header with Seasonal Theme */}
//       <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center mb-8">
//         <div className="mb-4 lg:mb-0">
//           <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3 drop-shadow-lg">
//             <span className="text-4xl animate-bounce" style={{ animationDuration: '2s' }}>{theme.emoji[0]}</span>
//             {title || `โปรโมชัน${theme.nameTh}`}
//             <span className="text-4xl animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>{theme.emoji[1]}</span>
//           </h2>
//           <p className="text-white/90 text-sm lg:text-base font-medium drop-shadow">
//             {theme.description}
//           </p>
//         </div>
        
//         {/* Enhanced Countdown Timer */}
//         <div className="bg-white/25 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/30">
//           <div className="text-white text-sm font-bold mb-2 text-center">⏰ เหลือเวลาอีก</div>
//           <div className="flex gap-2">
//             {timeLeft.days > 0 && (
//               <div className="bg-gradient-to-br from-orange-400 to-pink-400 text-white p-3 rounded-xl min-w-[50px] text-center shadow-lg transform hover:scale-105 transition-transform">
//                 <div className="text-xl font-bold">{timeLeft.days}</div>
//                 <div className="text-xs">วัน</div>
//               </div>
//             )}
//             <div className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white p-3 rounded-xl min-w-[50px] text-center shadow-lg transform hover:scale-105 transition-transform">
//               <div className="text-xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
//               <div className="text-xs">ชม</div>
//             </div>
//             <div className="bg-gradient-to-br from-green-400 to-teal-400 text-white p-3 rounded-xl min-w-[50px] text-center shadow-lg transform hover:scale-105 transition-transform">
//               <div className="text-xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
//               <div className="text-xs">นาที</div>
//             </div>
//             <div className="bg-gradient-to-br from-purple-400 to-indigo-400 text-white p-3 rounded-xl min-w-[50px] text-center shadow-lg transform hover:scale-105 transition-transform">
//               <div className="text-xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
//               <div className="text-xs">วินาที</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Seasonal Promotion Products Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
//         {products.map((product) => {
//           if (!product.promo) return null;

//           const originalPrice = Number(product.price);
//           const discountedPrice = calculateDiscountPrice(product.price, product.promo);

//           return (
//             <Link to={`/product/${product.id}`} key={product.id} className="group relative block text-left">
//                 {/* Enhanced Seasonal-themed Card */}
//                 <div className={`bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 ${theme.cardBorder} h-full flex flex-col relative transform hover:scale-105 hover:rotate-1`}>
                
//                 {/* Seasonal Badge */}
//                 <div className={`absolute top-3 left-3 bg-gradient-to-r ${theme.badgeColors} text-white text-xs font-bold px-3 py-1.5 rounded-full z-20 shadow-lg tracking-wider animate-pulse border-2 border-white/50`}>
//                     {theme.emoji[2]} {product.promo.title.toUpperCase()}
//                 </div>

//                 {/* Bookmark Button */}
//                 <button 
//                     onClick={(e) => toggleBookmark(e, product.id)}
//                     className="absolute top-3 right-3 p-2.5 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 backdrop-blur-sm rounded-full z-20 shadow-lg text-white hover:text-yellow-300 transition-all hover:scale-110 border-2 border-white/50"
//                     title="เพิ่มในสินค้าที่สนใจ"
//                 >
//                     <Star size={18} fill={bookmarks.includes(product.id) ? "#FACC15" : "none"} className={bookmarks.includes(product.id) ? "text-yellow-300 animate-pulse" : ""} />
//                 </button>

//                 {/* Product Image with Seasonal Overlay */}
//                 <div className="h-52 overflow-hidden relative bg-gradient-to-br from-white/20 to-white/10">
//                     <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
//                     {/* Seasonal Overlay Effect */}
//                     <div className={`absolute inset-0 bg-gradient-to-t ${theme.overlayColors} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
//                 </div>

//                 {/* Product Details */}
//                 <div className={`p-5 flex flex-col flex-1 bg-gradient-to-br ${theme.cardBg}`}>
//                     <div className="text-xs text-gray-700 font-bold mb-2 uppercase tracking-wide">{product.category || 'ไม่มีหมวดหมู่'}</div>
//                     <h3 className="font-bold text-gray-800 text-lg mb-2 truncate group-hover:text-orange-600 transition-colors">{product.name}</h3>
//                     <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description || "ไม่มีรายละเอียด"}</p>
                    
//                     <div className="mt-auto flex items-end justify-between">
//                         <div>
//                             <div className="flex items-center gap-2 mb-1">
//                                 <span className="text-gray-500 line-through text-sm">฿{originalPrice.toLocaleString()}</span>
//                                 <span className="text-xs text-red-600 bg-white px-2 py-1 rounded-full font-bold shadow-md border border-red-200">
//                                     🔥 ลด {product.promo.discountType === 'PERCENTAGE' ? `${product.promo.discountValue}%` : `฿${product.promo.discountValue}`}
//                                 </span>
//                             </div>
//                             <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
//                                 ฿{discountedPrice.toLocaleString()}
//                             </div>
//                         </div>

//                         {/* Enhanced Add to Cart Button */}
//                         <button 
//                             onClick={(e) => handleAddToCart(e, product)} 
//                             className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 border-2 border-white/50" 
//                             title="เพิ่มลงตะกร้า"
//                         >
//                             <ShoppingCart size={20} />
//                         </button>
//                     </div>
//                 </div>
//                 </div>
//             </Link>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default SeasonalPromotion;
