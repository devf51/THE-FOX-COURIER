# การใช้งานระบบเสียงไฟล์จริง

## การตั้งค่าที่เพิ่มเข้ามา

### 1. โหลดไฟล์เสียงใน GameScene.js

```javascript
// ใน preload()
this.load.audio('bgm_ambient_horror', 'assets/audio/bgm/ambient_horror.ogg');
this.load.audio('bgm_horror_ambient', 'assets/audio/bgm/horror_ambient.ogg');
this.load.audio('bgm_scary_wind', 'assets/audio/bgm/scary_ambient_wind.ogg');
this.load.audio('bgm_dark_cavern', 'assets/audio/bgm/dark_cavern_ambient.ogg');
```

### 2. ฟังก์ชัน playForestAmbiance()

ฟังก์ชันนี้จะ:
- ✅ สุ่มเลือกเพลงพื้นหลัง 1 เพลงจาก 4 เพลงที่โหลดไว้
- ✅ เล่นเพลงแบบ loop
- ✅ สุ่มเล่น sound effects ทุก 20-40 วินาที

### 3. Sound Effects ที่สุ่มเล่น

1. **เสียงกิ่งไม้หัก** (Twig Snap) - เสียงแหลมสั้นๆ
2. **เสียงกระซิบ** (Creepy Whisper) - เสียงซ้อนทับกัน 3 เสียง
3. **เสียงลมพัด** (Wind Gust) - เสียงลมยาว 3 วินาที  
4. **เสียงเอี๊ยด** (Creak) - เสียงประตูหรือพื้นไม้เอี๊ยด

---

## วิธีเปลี่ยนกลับไปใช้เสียง procedural

ถ้าไม่มีไฟล์เสียง ระบบจะกลับไปใช้ Web Audio API อัตโนมัติ

หรือเปลี่ยนใน GameScene.js:
```javascript
// จาก
this.soundSystem.playForestAmbiance();

// เป็น
this.soundSystem.playBackgroundMusic();
```

---

## ข้อควรรู้

- ไฟล์เสียงต้องอยู่ในโฟลเดอร์ `assets/audio/bgm/` 
- ต้องเป็นไฟล์ .ogg
- ถ้าไม่มีไฟล์จะใช้เสียง procedural แทน (ไม่ error)
- Sound effects ใช้ Web Audio API สร้างเสมอ
