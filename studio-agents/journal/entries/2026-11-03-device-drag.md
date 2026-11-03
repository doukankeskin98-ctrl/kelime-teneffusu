# Fiziksel iPhone: kelime çizerken takılma

## Kabul ve karar

Kullanıcı 0.30.2 üzerinde titreşimin çalıştığını doğruladı; takılmanın kutlamada değil harfler üzerinde parmakla kelime çizerken olduğunu belirtti. Bağımsız salt okunur inceleme canlı önizlemenin stage dışındaki textContent/hidden değişimlerinin her harfte MutationObserver → bütün çerçeve ölçümü zincirini tetiklediğini doğruladı. Bu gereksiz iş kaynakta kanıtlıdır; takılmanın tek nedeni veya ölçülmüş FPS sonucu olduğu iddia edilmez.

Seçilen dar çözüm: ResizeObserver varken salt seçim önizlemesinin DOM değişimlerini yerleşim mutasyonundan ayırmak ve aynı metin/görünürlük değerlerini tekrar yazmamak. Gerçek boyut değişimi, hesap/bağlantı bildirimi ve eski ResizeObserver olmayan tarayıcıların yeniden ölçümü korunur. Board hit alanı, yön kilidi, erken kelime kabulü, ses/titreşim ve kayıt mantığı değişmez.

Kabul: sabit boyutlu önizlemede tekrarlayan harf değişimleri yeni ölçüm planlamaz; gerçek başlık/hedef boyutu ve yapısal değişimler ölçülür; legacy fallback çalışır. Hedefli testler, proje kapıları, imzalı cihaz güncellemesi ve kullanıcının aynı hareketi tekrar denemesi gerekir.

## Sonuç

112 hedefli test ve 627 toplam test / 131 grup geçti. Gerçek önizleme boyut değişimi, yapısal uyarı, cleanup ve ResizeObserver olmayan fallback; aynı önizleme metni/görünürlüğünü 60 kez yinelemede sıfır ek DOM yazması regresyonlarla doğrulandı. Tip, içerik, web/mobil paket, mobile:check, 628 Worker HTTP ve imzalı Xcode cihaz derlemesi geçti. Dar bağımsız kaynak incelemesinde engel görülmedi.

0.30.3 (5) mevcut uygulama silinmeden iPhone 14 Pro Max / iOS 27.2 üzerine kuruldu ve açıldı. Güncelleme sonrası 4 tamamlanmış bölüm / 12 yıldız görüntülendi; haptics tercihi ve kayıt şeması değişmedi. Kullanıcıdan aynı hareketi titreşim açıkken tekrar denemesi istendi. Bu kayıt anında akıcılık geri bildirimi bekleniyor; FPS ölçülmedi ve takılmanın tamamen giderildiği iddia edilmiyor. 0.30.2'de kullanıcı titreşimi doğrulamıştı.

GitHub/Sites kaynak eşitliği, CI/yayın sonucu ve sonraki kullanıcı cevabı depo dışındaki sürüm makbuzuna yazılır. Fiziksel cihaz testi için Apple takım bilgisi yalnız derleme argümanı olarak kullanıldı; sertifika/özel anahtar kaynakta yok.

## Eşzamanlı bakımın korunması

Bu çalışma sırasında main/Sites 65 üzerine yayımlanan 0.30.2 Hızlı Tur tek-geçiş düzeltmesi, güncelleme metni, regresyon testi ve günlüğü son kaynaktan alındı. Çakışmalar iki değişiklik korunarak birleştirildi. Son birleşik native paket 0.30.3 (6) olarak yeniden doğrulanır; önceki (5) gözlemi birleşik paket kabulü yerine geçmez.

Birleşik kaynakta 628 test / 131 grup, tip, içerik ve mobile:sync/check tekrar geçti. Dar birleşim incelemesinde Sprint.tsx HEAD ile aynı ve yeni çift-geçiş regresyonu korunmuş; çatışma belirteci yok. Paket ve iki Xcode yapılandırması 0.30.3 (6).

Birleşik web üretim paketi, 628 Worker HTTP ve imzalı Xcode cihaz derlemesi de geçti. Son (6) paketinin fiziksel kurulum sonucu ve son görüntü depo dışındaki yayın makbuzunda izlenir.
