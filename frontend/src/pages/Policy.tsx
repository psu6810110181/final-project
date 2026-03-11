// frontend/src/pages/Policy.tsx
import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Database, 
  MousePointerClick, 
  Target, 
  Share2, 
  Clock, 
  UserCheck, 
  Lock, 
  Cookie, 
  Mail 
} from 'lucide-react';

// ✅ 1. เพิ่ม Interface กำหนด Type ป้องกัน Error TypeScript
interface PolicyListItem {
  label?: string; // ใส่ ? แปลว่าจะมีหรือไม่มีก็ได้
  text: string;
}

interface PolicySection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  list?: PolicyListItem[]; // รับ Array ของ PolicyListItem (มีหรือไม่มีก็ได้)
}

// ✅ 2. นำ Interface มาครอบตัวแปร policyData
const policyData: PolicySection[] = [
  {
    id: "01",
    title: "บทนำและวัตถุประสงค์",
    icon: <FileText size={28} />,
    description: "นโยบายนี้ใช้บังคับกับผู้ใช้งานเว็บไซต์ ลูกค้าที่สั่งซื้อสินค้า และผู้ที่เข้ามาเยี่ยมชมแพลตฟอร์มอีคอมเมิร์ซของเรา การใช้งานเว็บไซต์ถือว่าคุณรับทราบและตกลงตามแนวทางที่ระบุไว้ในนโยบายนี้",
  },
  {
    id: "02",
    title: "ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม",
    icon: <Database size={28} />,
    description: "ในการให้บริการจำหน่ายและจัดส่งเฟอร์นิเจอร์ เรามีความจำเป็นต้องเก็บรวบรวมข้อมูลส่วนบุคคลของคุณ ได้แก่:",
    list: [
      { label: "ข้อมูลระบุตัวตน", text: "ชื่อ, นามสกุล" },
      { label: "ข้อมูลการติดต่อ", text: "ที่อยู่สำหรับจัดส่งและออกใบกำกับภาษี, เบอร์โทรศัพท์, อีเมล" },
      { label: "ข้อมูลการทำธุรกรรม", text: "ประวัติการสั่งซื้อ (Orders), รายการสินค้าในตะกร้า (Cart), รูปภาพสลิปการโอนเงิน หรือข้อมูลการชำระเงิน" },
      { label: "ข้อมูลทางเทคนิค", text: "IP Address, ประวัติการเข้าชมเว็บไซต์, ข้อมูลการใช้งานผ่านคุกกี้ (Cookies)" },
    ]
  },
  {
    id: "03",
    title: "วิธีการเก็บรวบรวมข้อมูล",
    icon: <MousePointerClick size={28} />,
    description: "เราเก็บรวบรวมข้อมูลส่วนบุคคลของคุณผ่านช่องทางต่างๆ ดังนี้:",
    list: [
      { text: "เมื่อคุณสมัครสมาชิกหรือสร้างบัญชีผู้ใช้บนเว็บไซต์" },
      { text: "เมื่อคุณทำรายการสั่งซื้อสินค้าและชำระเงิน" },
      { text: "เมื่อคุณเขียนรีวิว (Reviews) ให้กับสินค้า" },
      { text: "ผ่านการทำงานของระบบอัตโนมัติ เช่น การใช้คุกกี้เมื่อคุณเข้าชมเว็บไซต์" },
    ]
  },
  {
    id: "04",
    title: "วัตถุประสงค์ในการประมวลผลข้อมูล",
    icon: <Target size={28} />,
    description: "เรานำข้อมูลส่วนบุคคลของคุณไปใช้เพื่อวัตถุประสงค์ดังต่อไปนี้:",
    list: [
      { text: "เพื่อดำเนินการรับคำสั่งซื้อ จัดเตรียม และจัดส่งเฟอร์นิเจอร์ไปยังที่อยู่ของคุณ" },
      { text: "เพื่อยืนยันการชำระเงินและออกหลักฐานทางการเงิน" },
      { text: "เพื่อให้บริการหลังการขาย การรับประกันสินค้า และการตอบข้อซักถาม" },
      { text: "เพื่อวิเคราะห์และพัฒนาประสบการณ์การช้อปปิ้งบนเว็บไซต์ให้ดียิ่งขึ้น" },
    ]
  },
  {
    id: "05",
    title: "การเปิดเผยข้อมูลแก่บุคคลที่สาม",
    icon: <Share2 size={28} />,
    description: "เราอาจมีความจำเป็นต้องเปิดเผยข้อมูลส่วนบุคคลของคุณให้แก่บุคคลที่สามเฉพาะที่เกี่ยวข้องเพื่อดำเนินการตามคำสั่งซื้อให้สมบูรณ์ เช่น:",
    list: [
      { text: "บริษัทผู้ให้บริการขนส่ง (เพื่อจัดส่งเฟอร์นิเจอร์)" },
      { text: "ผู้ให้บริการระบบรับชำระเงิน (Payment Gateway)" },
      { text: "ผู้ให้บริการด้านไอทีและระบบคลาวด์ (เพื่อการจัดเก็บข้อมูลอย่างปลอดภัย)" },
    ]
  },
  {
    id: "06",
    title: "ระยะเวลาในการเก็บรักษาข้อมูล",
    icon: <Clock size={28} />,
    description: "เราจะเก็บรักษาข้อมูลส่วนบุคคลของคุณไว้ตราบเท่าที่จำเป็นเพื่อให้บรรลุวัตถุประสงค์ที่ระบุไว้ในนโยบายนี้ หรือจนกว่าคุณจะขอให้ลบข้อมูลบัญชีผู้ใช้ ทั้งนี้ อาจมีการเก็บรักษาข้อมูลบางส่วนเพิ่มเติมตามที่กฎหมายทางบัญชีหรือภาษีอากรกำหนด",
  },
  {
    id: "07",
    title: "สิทธิของเจ้าของข้อมูล (ตามกฎหมาย PDPA)",
    icon: <UserCheck size={28} />,
    description: "ในฐานะเจ้าของข้อมูล คุณมีสิทธิตามกฎหมาย PDPA ทุกประการ ได้แก่:",
    list: [
      { label: "สิทธิในการเข้าถึง", text: "ขอสำเนาข้อมูลส่วนบุคคลของคุณ" },
      { label: "สิทธิในการแก้ไข", text: "ขอแก้ไขข้อมูลให้ถูกต้องและเป็นปัจจุบัน" },
      { label: "สิทธิในการลบ", text: "ขอให้ลบหรือทำลายข้อมูลเมื่อหมดความจำเป็น (Right to be forgotten)" },
      { label: "สิทธิในการระงับ/คัดค้าน", text: "ขอระงับหรือคัดค้านการประมวลผลข้อมูลบางประเภท" },
      { label: "สิทธิในการถอนความยินยอม", text: "คุณสามารถยกเลิกการรับข่าวสารหรือถอนความยินยอมได้ตลอดเวลา" },
    ]
  },
  {
    id: "08",
    title: "การรักษาความมั่นคงปลอดภัยของข้อมูล",
    icon: <Lock size={28} />,
    description: "เรามีมาตรการรักษาความปลอดภัยทางเทคนิคและการบริหารจัดการที่เหมาะสม เพื่อป้องกันมิให้ข้อมูลส่วนบุคคลของคุณสูญหาย ถูกเข้าถึง แก้ไข หรือเปิดเผยโดยปราศจากอำนาจหรือโดยมิชอบด้วยกฎหมาย",
  },
  {
    id: "09",
    title: "นโยบายการใช้คุกกี้ (Cookies)",
    icon: <Cookie size={28} />,
    description: "เว็บไซต์ของเราใช้คุกกี้เพื่อเพิ่มประสิทธิภาพในการใช้งาน เช่น การจดจำสถานะการเข้าสู่ระบบ การจดจำสินค้าในตะกร้า (Cart) ของคุณ และเพื่อวิเคราะห์พฤติกรรมการเข้าชมเว็บไซต์เพื่อนำไปปรับปรุงบริการ คุณสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธการใช้คุกกี้ได้ แต่บางฟังก์ชันบนเว็บไซต์อาจทำงานได้ไม่สมบูรณ์",
  }
];

const Policy = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFA] font-sans selection:bg-[#148F96] selection:text-white pb-20 overflow-hidden relative">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#148F96]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-orange-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <div className="relative bg-slate-900 pt-32 pb-40 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-[#F8FAFA]"></div>
        
        <div className={`relative z-10 max-w-3xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-6 shadow-2xl border border-white/10 text-[#148F96]">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light max-w-2xl mx-auto">
            เว็บไซต์ <span className="text-white font-bold">HomeAlright</span> ให้ความสำคัญอย่างยิ่งกับการคุ้มครองข้อมูลส่วนบุคคลของคุณ ให้สอดคล้องกับพ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
          </p>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="container mx-auto px-4 max-w-4xl relative z-20 -mt-20">
        <div className="grid gap-6">
          {policyData.map((section, index) => (
            <div 
              key={section.id} 
              className={`bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/40 border border-white hover:border-[#148F96]/30 transition-all duration-500 group
                ${isVisible ? 'animate-in slide-in-from-bottom-10 fade-in fill-mode-both' : 'opacity-0'}
              `}
              style={{ animationDelay: `${index * 100}ms`, animationDuration: '800ms' }}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                
                {/* Number & Icon Indicator */}
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-[#148F96] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#148F96]/30 transition-all duration-500">
                  {section.icon}
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-bold text-[#148F96] tracking-widest uppercase">SECTION {section.id}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-[#148F96] transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-[15px] mb-4">
                    {section.description}
                  </p>

                  {/* Rendering Lists if available */}
                  {section.list && (
                    <ul className="space-y-3 mt-6">
                      {section.list.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[15px] text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#D65A31] flex-shrink-0 shadow-[0_0_8px_rgba(214,90,49,0.8)]" />
                          <span>
                            {/* TypeScript จะไม่ Error ตรงนี้แล้ว เพราะรู้ว่า label อาจจะ undefined ได้ */}
                            {item.label && <strong className="text-slate-800 mr-2">{item.label}:</strong>}
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* --- CONTACT SECTION --- */}
          <div 
            className={`bg-gradient-to-br from-[#148F96] to-[#0f6c72] p-8 md:p-12 rounded-3xl shadow-2xl text-white mt-4 border border-[#148F96]/20 relative overflow-hidden group
              ${isVisible ? 'animate-in zoom-in-95 fade-in fill-mode-both' : 'opacity-0'}
            `}
            style={{ animationDelay: `${policyData.length * 100}ms`, animationDuration: '1000ms' }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full mix-blend-overlay group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-md rounded-2xl mb-6">
                  <Mail size={32} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">การเปลี่ยนแปลงและการติดต่อเรา</h2>
                <p className="text-white/80 leading-relaxed max-w-xl">
                  เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นระยะเพื่อให้สอดคล้องกับการเปลี่ยนแปลงทางกฎหมาย หากคุณมีข้อสงสัยเกี่ยวกับการจัดการข้อมูลส่วนบุคคล สามารถติดต่อผู้ควบคุมข้อมูล (Data Controller) ของเราได้ทันที
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full md:w-auto text-center hover:bg-white/20 transition-colors">
                <span className="block text-white/60 text-sm mb-2 uppercase tracking-wider font-bold">อีเมลติดต่อฝ่ายสนับสนุน</span>
                <a 
                  href="mailto:homealright.official@gmail.com" 
                  className="text-xl font-bold text-white hover:text-orange-300 transition-colors"
                >
                  homealright.official<br/>@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Policy;