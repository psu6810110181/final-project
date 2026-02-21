// frontend/src/pages/Policy.tsx
import React from 'react';

const Policy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-gray-800">
      <h1 className="text-3xl font-bold text-center mb-8 text-[#148F96]">นโยบายความเป็นส่วนตัว</h1>
      
      <div className="space-y-8 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 leading-relaxed">
        
        <p className="text-lg">
          เว็บไซต์ <span className="font-semibold text-[#148F96]">HomeAlright</span> ให้ความสำคัญอย่างยิ่งกับการคุ้มครองข้อมูลส่วนบุคคลของคุณ นโยบายความเป็นส่วนตัวฉบับนี้จัดทำขึ้นเพื่ออธิบายถึงวิธีการที่เรารวบรวม ใช้ เปิดเผย และปกป้องข้อมูลของคุณให้สอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
        </p>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b pb-2">1. บทนำและวัตถุประสงค์</h2>
          <p className="text-gray-700">
            นโยบายนี้ใช้บังคับกับผู้ใช้งานเว็บไซต์ ลูกค้าที่สั่งซื้อสินค้า และผู้ที่เข้ามาเยี่ยมชมแพลตฟอร์มอีคอมเมิร์ซของเรา การใช้งานเว็บไซต์ถือว่าคุณรับทราบและตกลงตามแนวทางที่ระบุไว้ในนโยบายนี้
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b pb-2">2. ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม</h2>
          <p className="text-gray-700 mb-3">ในการให้บริการจำหน่ายและจัดส่งเฟอร์นิเจอร์ เรามีความจำเป็นต้องเก็บรวบรวมข้อมูลส่วนบุคคลของคุณ ได้แก่:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong className="font-medium text-gray-900">ข้อมูลระบุตัวตน:</strong> ชื่อ, นามสกุล</li>
            <li><strong className="font-medium text-gray-900">ข้อมูลการติดต่อ:</strong> ที่อยู่สำหรับจัดส่งและออกใบกำกับภาษี, เบอร์โทรศัพท์, อีเมล</li>
            <li><strong className="font-medium text-gray-900">ข้อมูลการทำธุรกรรม:</strong> ประวัติการสั่งซื้อ (Orders), รายการสินค้าในตะกร้า (Cart), รูปภาพสลิปการโอนเงิน หรือข้อมูลการชำระเงิน</li>
            <li><strong className="font-medium text-gray-900">ข้อมูลทางเทคนิค:</strong> IP Address, ประวัติการเข้าชมเว็บไซต์, ข้อมูลการใช้งานผ่านคุกกี้ (Cookies)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b pb-2">3. วิธีการเก็บรวบรวมข้อมูล</h2>
          <p className="text-gray-700 mb-3">เราเก็บรวบรวมข้อมูลส่วนบุคคลของคุณผ่านช่องทางต่างๆ ดังนี้:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>เมื่อคุณสมัครสมาชิกหรือสร้างบัญชีผู้ใช้บนเว็บไซต์</li>
            <li>เมื่อคุณทำรายการสั่งซื้อสินค้าและชำระเงิน</li>
            <li>เมื่อคุณเขียนรีวิว (Reviews) ให้กับสินค้า</li>
            <li>ผ่านการทำงานของระบบอัตโนมัติ เช่น การใช้คุกกี้เมื่อคุณเข้าชมเว็บไซต์</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b pb-2">4. วัตถุประสงค์ในการประมวลผลข้อมูล</h2>
          <p className="text-gray-700 mb-3">เรานำข้อมูลส่วนบุคคลของคุณไปใช้เพื่อวัตถุประสงค์ดังต่อไปนี้:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>เพื่อดำเนินการรับคำสั่งซื้อ จัดเตรียม และจัดส่งเฟอร์นิเจอร์ไปยังที่อยู่ของคุณ</li>
            <li>เพื่อยืนยันการชำระเงินและออกหลักฐานทางการเงิน</li>
            <li>เพื่อให้บริการหลังการขาย การรับประกันสินค้า และการตอบข้อซักถาม</li>
            <li>เพื่อวิเคราะห์และพัฒนาประสบการณ์การช้อปปิ้งบนเว็บไซต์ให้ดียิ่งขึ้น</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b pb-2">5. การเปิดเผยข้อมูลแก่บุคคลที่สาม</h2>
          <p className="text-gray-700 mb-3">เราอาจมีความจำเป็นต้องเปิดเผยข้อมูลส่วนบุคคลของคุณให้แก่บุคคลที่สามเฉพาะที่เกี่ยวข้องเพื่อดำเนินการตามคำสั่งซื้อให้สมบูรณ์ เช่น:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>บริษัทผู้ให้บริการขนส่ง (เพื่อจัดส่งเฟอร์นิเจอร์)</li>
            <li>ผู้ให้บริการระบบรับชำระเงิน (Payment Gateway)</li>
            <li>ผู้ให้บริการด้านไอทีและระบบคลาวด์ (เพื่อการจัดเก็บข้อมูลอย่างปลอดภัย)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b pb-2">6. ระยะเวลาในการเก็บรักษาข้อมูล</h2>
          <p className="text-gray-700">
            เราจะเก็บรักษาข้อมูลส่วนบุคคลของคุณไว้ตราบเท่าที่จำเป็นเพื่อให้บรรลุวัตถุประสงค์ที่ระบุไว้ในนโยบายนี้ หรือจนกว่าคุณจะขอให้ลบข้อมูลบัญชีผู้ใช้ ทั้งนี้ อาจมีการเก็บรักษาข้อมูลบางส่วนเพิ่มเติมตามที่กฎหมายทางบัญชีหรือภาษีอากรกำหนด
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b pb-2">7. สิทธิของเจ้าของข้อมูล (ตามกฎหมาย PDPA)</h2>
          <p className="text-gray-700 mb-3">ในฐานะเจ้าของข้อมูล คุณมีสิทธิตามกฎหมาย PDPA ทุกประการ ได้แก่:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong className="font-medium text-gray-900">สิทธิในการเข้าถึง:</strong> ขอสำเนาข้อมูลส่วนบุคคลของคุณ</li>
            <li><strong className="font-medium text-gray-900">สิทธิในการแก้ไข:</strong> ขอแก้ไขข้อมูลให้ถูกต้องและเป็นปัจจุบัน</li>
            <li><strong className="font-medium text-gray-900">สิทธิในการลบ (Right to be forgotten):</strong> ขอให้ลบหรือทำลายข้อมูลเมื่อหมดความจำเป็น</li>
            <li><strong className="font-medium text-gray-900">สิทธิในการระงับ/คัดค้าน:</strong> ขอระงับหรือคัดค้านการประมวลผลข้อมูลบางประเภท</li>
            <li><strong className="font-medium text-gray-900">สิทธิในการถอนความยินยอม:</strong> คุณสามารถยกเลิกการรับข่าวสารหรือถอนความยินยอมได้ตลอดเวลา</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b pb-2">8. การรักษาความมั่นคงปลอดภัยของข้อมูล</h2>
          <p className="text-gray-700">
            เรามีมาตรการรักษาความปลอดภัยทางเทคนิคและการบริหารจัดการที่เหมาะสม เพื่อป้องกันมิให้ข้อมูลส่วนบุคคลของคุณสูญหาย ถูกเข้าถึง แก้ไข หรือเปิดเผยโดยปราศจากอำนาจหรือโดยมิชอบด้วยกฎหมาย
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b pb-2">9. นโยบายการใช้คุกกี้ (Cookies)</h2>
          <p className="text-gray-700">
            เว็บไซต์ของเราใช้คุกกี้เพื่อเพิ่มประสิทธิภาพในการใช้งาน เช่น การจดจำสถานะการเข้าสู่ระบบ การจดจำสินค้าในตะกร้า (Cart) ของคุณ และเพื่อวิเคราะห์พฤติกรรมการเข้าชมเว็บไซต์เพื่อนำไปปรับปรุงบริการ คุณสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธการใช้คุกกี้ได้ แต่บางฟังก์ชันบนเว็บไซต์อาจทำงานได้ไม่สมบูรณ์
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-gray-900 border-b pb-2">10. การเปลี่ยนแปลงนโยบายและการติดต่อเรา</h2>
          <p className="text-gray-700 mb-4">
            เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นระยะเพื่อให้สอดคล้องกับการเปลี่ยนแปลงทางกฎหมาย หากคุณมีข้อสงสัยเกี่ยวกับการจัดการข้อมูลส่วนบุคคล หรือต้องการใช้สิทธิตามข้อ 7. สามารถติดต่อผู้ควบคุมข้อมูล (Data Controller) ของเราได้ที่:
          </p>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg inline-block">
            <p className="text-gray-800 font-medium flex items-center gap-2">
              <span>📧 อีเมล:</span> 
              <a href="mailto:homealright@gmail.com" className="text-[#148F96] hover:text-[#0f6c72] hover:underline transition-colors">
                homealright@gmail.com
              </a>
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Policy;