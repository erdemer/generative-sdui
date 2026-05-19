"""Persist brand_rules text to disk so it survives server restarts."""

import os
from app.config import PROJECTS_DIR

BRAND_FILE = os.path.join(PROJECTS_DIR, "_brand_rules.txt")

DEFAULT_BRAND_RULES = """\
Vodafone Türkiye marka kimliğine uygun tasarım üret.

MARKA:
• Sektör: Telekominikasyon ve dijital servisler
• Ton: Güvenilir, dinamik, yenilikçi, sıcak, erişilebilir

RENKLER (MUTLAKA kullan):
• Birincil kırmızı: #E60000 — tüm CTA butonları, aktif ikonlar, fiyatlar, vurgu
• Koyu kırmızı: #BE0000 — hover/aktif durumlar
• Beyaz: #FFFFFF — arka plan, kart yüzeyi
• Açık gri: #F4F4F4 — ikincil yüzey, input arka planı
• Koyu metin: #1A1A1A — başlıklar ve birincil metin
• İkincil metin: #666666 — açıklama ve yardımcı metin
• Aktif yeşil: #00B012 — hat durumu, başarı mesajı
• Uyarı sarısı: #FFBA00 — bildirim, dikkat gerektiren alan

TİPOGRAFİ:
• Başlıklar: bold, koyu (#1A1A1A)
• Buton metni: bold, beyaz (#FFFFFF)
• Açıklamalar: regular, gri (#666666)
• Fiyat/vurgu: bold, kırmızı (#E60000)

TASARIM KURALLARI:
• Birincil buton: backgroundColor:#E60000, color:#FFFFFF, corner:8
• Kart: beyaz arka plan, hafif gölge (elevation:2), corner:12
• Header ikonu ve marka adı: #E60000
• Alt gezinme çubuğu aktif ikonu: #E60000
• Hero görsel: güçlü, gerçekçi, Türkiye bağlamına uygun
• Boşluklar: geniş, temiz; minimum 48dp dokunma alanı
• Görseller: contentScale:"crop", yüksek kalite
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
