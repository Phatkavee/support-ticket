# Supabase Storage Setup Guide

## การตั้งค่า Storage Bucket สำหรับ File Attachments

หากคุณต้องการให้ระบบสามารถอัปโหลดไฟล์แนบได้ คุณต้องตั้งค่า Storage bucket ใน Supabase:

### ขั้นตอนการตั้งค่า:

1. เข้าไปที่ Supabase Dashboard
2. เลือกโปรเจค Support Ticket ของคุณ
3. ไปที่เมนู "Storage" ในแถบด้านซ้าย
4. คลิก "Create a new bucket"
5. ตั้งชื่อ bucket เป็น `ticket-attachments`
6. ตั้งค่า:
   - Public bucket: เลือก `true` (เพื่อให้สามารถเข้าถึงไฟล์ได้)
   - File size limit: 10MB (หรือตามต้องการ)
   - Allowed MIME types: `image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv`

### การตั้งค่า Policies (RLS):

```sql
-- Policy สำหรับการอัปโหลดไฟล์
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'ticket-attachments');

-- Policy สำหรับการอ่านไฟล์
CREATE POLICY "Allow public to view files" ON storage.objects
FOR SELECT USING (bucket_id = 'ticket-attachments');

-- Policy สำหรับการลบไฟล์ (สำหรับ admin เท่านั้น)
CREATE POLICY "Allow authenticated users to delete own files" ON storage.objects
FOR DELETE USING (bucket_id = 'ticket-attachments');
```

### หมายเหตุ:

- หากไม่ได้ตั้งค่า Storage bucket, ระบบจะยังคงทำงานได้ แต่จะไม่สามารถอัปโหลดไฟล์ได้
- ไฟล์จะถูกข้ามไปเมื่อไม่สามารถอัปโหลดได้
- Ticket จะยังคงถูกสร้างตามปกติ
- ระบบมี fallback ไปใช้ localStorage เมื่อ database ไม่พร้อมใช้งาน

### การทดสอบ:

1. ลองสร้าง ticket โดยไม่แนบไฟล์ - ควรทำงานปกติ
2. ลองสร้าง ticket พร้อมแนบไฟล์ - หากตั้งค่า Storage แล้วควรอัปโหลดได้
3. ตรวจสอบ Browser Console หากมี error เกี่ยวกับ storage
