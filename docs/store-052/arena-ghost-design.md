# Boş Arena için kayıtlı rakip — uygulama öncesi karar

Mevcut akış:15sn yalnız kalan oyuncuya kuyruktan güvenle ayrılıp Meydan okumaya geçme seçeneği var. “Hiçbir seçenek yok” doğru değil. Yeni tasarım bunu açık ve tek eylemli yapar:

1. İlk10sn: “Oyuncu aranıyor…”; normal canlı eşleşme sürer.
2. Sonra: “Beklerken bir tur?” ve **Kayıtlı rakiple oyna**. Altında tek satır: “Önceden oynanmış gerçek tur · Derece puanı değişmez.” İkincil eylem **Beklemeye devam et**.
3. Dokunulduğunda `leave(waitingOnly)` ile atomik kuyruktan ayrıl. Bu sırada canlı oyuncu katıldıysa ayrılma409 döner; mevcut canlı oda gösterilir. Oyuncuyu son anda terk etme veya iki maçı birden başlatma yok.
4. Açık paylaşımı olan ve kullanıcının engellemediği gerçek kayıt bulunursa **aynı kayıtlı turdaki tahta + aynı hedefler + zaman çizelgesi** kullanılır. “Canlı rakip” denmez, kullanıcı adı veya sonuç uydurulmaz. Boş lobinin henüz tahsis edilmemiş tahtasını başka bir tahtayla gizlice değiştirme yok.
5. Kayıt yoksa “İlk süreyi sen oluştur” açıkça yazılır; yapay bir hayalet üretilmez. İzinsiz özel meydan kaydı veya gerçek oyuncu bilgisi toplanmaz. Ücret/puan/ödül etkisi yok.

Mevcut Challenges ghost timeline görüntüleyicisi kullanılabilir; genel havuz keşfi, açık paylaşım izni ve sunucu geçişi henüz yok. Otomatik10sn sonra başlatma önerisini seçmedim: oyuncu canlı rakip beklerken fark etmeden başka moda girmemeli. Bu tasarım onaylanmadan yeni hayalet havuzu aktive edilmez. Kodlanacak kabul: eşleşme/ayrılma yarışı, olmayan/silinmiş/engellenmiş ghost, eski tur kaydı, iki istemcide aynı tahta, derece ve tekrar engelinin korunması.
