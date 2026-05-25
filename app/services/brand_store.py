"""Persist brand_rules text to disk so it survives server restarts."""

import os
from app.config import PROJECTS_DIR

BRAND_FILE = os.path.join(PROJECTS_DIR, "_brand_rules.txt")

DEFAULT_BRAND_RULES = """\
Vodafone Türkiye — 5G Cihaz Kampanyası Ekranı

═══════════════════════════════════════════════════
MARKA KİMLİĞİ
═══════════════════════════════════════════════════
• Sektör: Telekominikasyon ve dijital servisler
• Kampanya odağı: 5G uyumlu akıllı telefon satışı ve taksitli cihaz kampanyası
• Ton: Premium, teknolojik, güvenilir, yenilikçi, fırsat odaklı
• Hedef kitle: Mevcut Vodafone aboneleri ve yeni hat alacak kullanıcılar

═══════════════════════════════════════════════════
RENK PALETİ (STRICT — sadece bunları kullan)
═══════════════════════════════════════════════════
• bg:      #FFFFFF — ana arka plan
• surface: #F4F4F4 — kart yüzeyi, input alanı arka planı
• accent:  #E60000 — CTA butonları, fiyat vurgusu, aktif ikonlar, badge
• fg:      #1A1A1A — başlık ve birincil metin rengi
• fg3:     #666666 — açıklama, eski fiyat, ikincil metin
• Koyu kırmızı: #BE0000 — hover/pressed state, gradient bitiş
• 5G Badge: #E60000 arka plan, #FFFFFF metin, corner:20
• Başarı yeşili: #00B012 — stok durumu, onay, "5G Aktif" rozeti
• Uyarı sarısı: #FFBA00 — son gün bildirimi, sınırlı stok uyarısı

═══════════════════════════════════════════════════
TİPOGRAFİ
═══════════════════════════════════════════════════
• h1 (Hero başlık): bold, 26sp, #FFFFFF (hero overlay üzerinde) veya #1A1A1A
• h2 (Bölüm başlığı): bold, 18sp, #1A1A1A
• h3 (Kart başlığı / cihaz adı): bold, 15sp, #1A1A1A
• body (açıklama): normal, 14sp, #666666
• caption (teknik özellik, etiket): normal, 12sp, #666666
• Fiyat büyük: bold, 22sp, #E60000
• Fiyat küçük (taksit): bold, 14sp, #E60000
• Eski fiyat: normal, 14sp, #999999, üstü çizili (textDecoration: "line-through")

═══════════════════════════════════════════════════
KAMPANYA TASARIM KURALLARI
═══════════════════════════════════════════════════
• Header: Vodafone logosu (sol) + "5G Cihazlar" başlığı, sağda bildirim ve sepet ikonları
• Hero Banner: Gradient overlay (#E60000cc → #00000066), cihaz görseli, kampanya sloganı
  - Slogan örneği: "5G Hızıyla Tanışın", "Yeni Nesil Hız, Uygun Taksitlerle"
  - CTA: "Hemen Keşfet" veya "Fırsatları Gör" — beyaz metin, kırmızı buton
• Filtre Strip (yatay scroll): "Tümü", "Samsung", "iPhone", "Xiaomi", "Oppo" chip'leri
  - Aktif chip: bg:#E60000, color:#FFF | Pasif chip: bg:#F4F4F4, color:#666

• CİHAZ KARTI YAPISI (her kart):
  1. Badge (sol üst overlay): "5G" veya "%25 İndirim" veya "Yeni" — bg:#E60000, color:#FFF, corner:12
  2. Cihaz görseli: ürün fotoğrafı, temiz arka plan, h:180, contentScale:"fit"
  3. Cihaz adı: h3, bold, #1A1A1A (örn. "Samsung Galaxy S25 Ultra")
  4. Kısa özellik: caption, #666 (örn. "256GB · Titanium Siyah")
  5. Eski fiyat (varsa): üstü çizili, #999 (örn. "64.999 TL")
  6. Kampanya fiyatı: h3, bold, #E60000 (örn. "₺54.999")
  7. Taksit bilgisi: caption, #E60000 (örn. "₺2.291/ay × 24 taksit")
  8. CTA butonu: "Sepete Ekle" veya "İncele" — bg:#E60000, color:#FFF, corner:8

• AVANTAJ BANNER'I (kartların arasında):
  - "Eski cihazını getir, yenisini al!" veya "Vodafone'a geç, ekstra 5.000 TL indirim kazan"
  - Gradient arka plan (#E60000 → #BE0000), beyaz metin, ikon + CTA

• BottomBar: items: home, phone_android (5G Cihazlar, aktif), local_offer (Kampanyalar), person (Hesabım)
  - Aktif ikon: #E60000, diğerleri: #666666

═══════════════════════════════════════════════════
GÖRSEL KALİTESİ
═══════════════════════════════════════════════════
• Cihaz görselleri: ürün odaklı, temiz/beyaz arka plan, stüdyo ışığı
  - Image URL keyword: {device_name}_smartphone,product_shot,studio_lighting,white_background
• Hero görseli: 5G teknoloji temalı, parlak, dinamik
  - Image URL keyword: 5g_technology,smartphone_premium,futuristic_glow,red_accent
• contentScale: ürün kartlarında "fit", hero'da "crop"
• Tüm Image'larda fillMaxWidth:"true"

═══════════════════════════════════════════════════
TEKNİK KURALLAR
═══════════════════════════════════════════════════
• Birincil buton: backgroundColor:#E60000, color:#FFFFFF, corner:8, padding:"13,32,13,32"
• İkincil buton: backgroundColor:#F4F4F4, color:#1A1A1A, corner:8
• Kart: backgroundColor:#FFFFFF, elevation:2, corner:12
• Badge overlay: position via Box z-stack, corner:12, padding:"4,10,4,10"
• Tüm fiyatlar ₺ (TL) formatında, gerçekçi Türkiye fiyatlarıyla
• Minimum dokunma alanı: 48dp
• Boşluklar tutarlı: section gap 20dp, card gap 12dp, iç padding 12-16dp
"""


def load() -> str:
    try:
        with open(BRAND_FILE, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return DEFAULT_BRAND_RULES


def save(text: str) -> None:
    with open(BRAND_FILE, "w", encoding="utf-8") as f:
        f.write(text)
