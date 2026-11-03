# Kesintisiz oyun akışı — deneyim son kontrolü

- Tarih: 2026-11-04
- Rol: experience; dar kapsamlı, salt okunur uygulama incelemesi.
- Kapsam: Daha önce bildirilen üç erişim/geri dönüş hatasının düzeltmesi ve ilgili testlerin kaynak kontrolü. Uygulama dosyaları değiştirilmedi.

## Bulgular ve düzeltme kabulü

1. **Ek bölüm kataloglarına erişim.** Önceki akış `PublishedChapters` bileşeninin varsayılan `studio` koleksiyonunu kullanıyor, ilk sunulan tarihli keşif listesini yükleme sonrası değiştirebiliyordu. `components/game/Pages.tsx:28,47` artık koleksiyonu açıkça seçiyor; “Tarihli keşifler” ve “Ek keşifler” düğmeleri iki arşivi de erişilebilir tutuyor. `key` koleksiyon değişiminde liste durumunu ayırıyor, başlangıç verisi yalnız ilgili koleksiyona veriliyor. Kabul: iki kaynak arasında geçiş ve bir bölümden dönüşte ilgili koleksiyona erişim korunmalı. Kaynak düzeltmesi uygun.

2. **Eski yarım hikâyeye devam.** Yeni son-hikâye anahtarı bulunmayan eski kayıt, daha önce henüz başlanmamış ilk hikâyeye yönlenebiliyordu. `components/game/JourneyHome.tsx:22-26` şimdi sırasıyla son seçimi, eski `progress.last` kaydını ve mevcut bitmemiş hikâye kaydını arıyor; ancak bunlar yoksa ilk yeni hikâyeyi seçiyor. Kabul: eski bir yarım hikâye, yeni anahtar olmasa da ana ekrandan kendi kimliğiyle devam etmeli. `tests/word-access.test.ts:336` bu kayıt biçimiyle doğrudan devam davranışını kapsıyor. Kaynak düzeltmesi uygun.

3. **Panel iptalinin ana ekran tercihini değiştirmesi.** Harita veya etkinlik panelini kapatmak daha önce hikâye görünümünü yolculuk görünümüne çevirebiliyordu. `components/game/JourneyHome.tsx:28` yalnız paneli kapatıyor; `:36` üzerindeki açık “Bölüm yolculuğuna dön” eylemi görünümü değiştiriyor. Kabul: panel aç/kapat hikâye ana ekranını korumalı; açık dönüş düğmesi yolculuğu seçmeli. `tests/word-access.test.ts:336-342` iki davranışı ayrı doğruluyor. Kaynak düzeltmesi uygun.

## Ek dar kontrol

`tests/word-access.test.ts:289-299` ortak bölüm seçicide Uzay dünyasının mevcut küresel numaralarını `[1, 2, 3, 5, 9, 10]`, tamamlanmış bölümü tekrar oynama işaretini ve kilitli dünyada oynatma/kapama yapılmamasını kapsıyor. İncelenen düzeltmelerde kalan kesin erişim veya geri dönüş hatası saptanmadı.

## Doğrulama sınırı

Bu kayıt kaynak ve test tanımı incelemesidir; bu uzman turunda testler çalıştırılmadı. Tarayıcı/gerçek cihaz görünümü, dokunma, animasyon akıcılığı ve modal odak davranışı gözlenmedi. Mevcut 144 bölümün kimlik/tahta/ödül eşdeğerliği bu dar incelemede yeniden hesaplanmadı; ilgili otomatik uyumluluk kontrolleri ve yayın doğrulaması koordinatörün kapsamındadır.
