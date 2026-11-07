# 0.42.1 — Fiziksel iPhone kurulumunda ayar geri düğmesi

## Kabul (uygulama öncesi)
0.42.0, iPhone 14 Pro Max'a veri silmeden kuruldu; yedi yerel storage girdisi byte/hash olarak aynı kaldı, 14 tamamlanmış bölüm /34 yıldız korundu. Gerçek cihazdaki Diğer ayarlar ekranında ikincil geri düğmesinin açık metni açık zeminle çakıştı. Kapsam yalnız ayarlar ve yardımın ortak ikincil footer düğmelerinde açık zemin/koyu metin eşleşmesini sabitlemek; yeni CSS sistemi, oyun/kayıt değişikliği yok. Aynı footer destek/gizlilikte de okunmalı. Düğme gerçek iPhone'da açılıp geri dönüşle doğrulanacak; zorunlu kontroller ve aynı kaynak/CI korunacak.

## Çalışma kopyası
Önceki geçici checkout'ta .git HEAD/config dosyaları eksik görüldü. Git metadata yeniden oluşturma otomatik incelemede reddedildi; reddedilen dizin değiştirilmedi. Güvenli alternatif: resmî Sites aracıyla ayrı boş klasöre aynı beb71e74 kaynağı açıldı. Veri/kimlik/ilerleme yedekleri yalnız yerelde tutulur.

## Sonuç
827 test, tip/içerik/şema; son kaynakta üretim web,695 Worker,39 dosya/21 sahne native paket ve imzalı Release geçti. Ayar ayrıntısı ile yardımın farklı HTML yapıları fiziksel ekranda kontrol edildi; ortak ikincil düğme kuralı her ikisine uygulandı. iPhone 14 Pro Max üzerinde Ayarlara dön/Kapat metni okunaklı ve geri dönüş çalışır. Son yerinde kurulumda sekiz localStorage girdisi hash olarak aynı; 15 tamamlanmış bölüm/36 yıldız korundu. Önceki aktif oyun sırasındaki ilk karşılaştırmada yalnız elapsed 26s artmıştı; son kurulumun tüm alanları eşit. Kullanıcı el rehberini “Akıcı, çizince hemen kayboluyor” diye doğruladı. Telefon ana ekranda bırakıldı. Uzun FPS/VoiceOver/mağaza kabulü yapılmış sayılmaz. Görseller/yedekler world-review/0.42.1 içinde yerel; kaynakta oyuncu verisi yok.
