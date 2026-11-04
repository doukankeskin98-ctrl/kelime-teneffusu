# 4 Kasım 2026 · Sabit başlangıçtan sekiz yönlü dönüş incelemesi

Rol: `ios_reliability_review`. Taban `0171658` (0.33.0); inceleme sırasında koordinatörün input-gesture ve ilgili test delta'sı da okundu. Kapsam yalnız `input-gesture.ts`, `Board.tsx` ve mevcut Node davranış testleri. Uygulama/test kodu değiştirilmedi; test, tarayıcı veya fiziksel cihaz çalıştırılmadı.

## Somut risk: henüz kabul edilmeyen ters yön görsel çizgiyi ters tarafa geçiriyor

- Kaynak: `lib/game/input-gesture.ts:21,44–45,54–58`; `components/game/Board.tsx:67–72`.
- Tetikleyici: başlangıç `[2,2]`; kabul edilmiş uç `[2,4]`, eksen `[0,1]`; sonraki ham tahta noktası `[3,1]` (Board harness `send` karşılığı `[2.5,.5]`). Yeni sol yönün en yakın hücresi `[2,0]`, merkeze uzaklığı yaklaşık `.707`; hem `.47` move hem `.65` release toleransı bunu reddeder. Mantıksal uç sağda `[2,4]` kalır.
- Buna rağmen `gestureTip`, eski sağ eksene negatif projeksiyon uygulayarak ucu `[2.5,1]` ile başlangıcın soluna çizer. Aynı yerde bırakma eski sağ ucu commit eder. Bu kaynak hesabıyla doğrulanan bir tutarsızlıktır; fiziksel tekrar üretim iddiası değildir.
- En dar öneri: kabul edilmiş ekseni bir doğru değil yönlü ışın olarak kullan; kabul edilmeyen yeni yön sırasında görsel projeksiyonun sıfırın altına geçmesini engelle. Alternatif, ters projeksiyonda son kabul edilen görsel ucu korumaktır. Merkez toleransını gevşetme ve eski mantıksal uçla yeni ekseni ayrı ayrı döndürme.
- Kabul testi: gerçek Board harness'inde yukarıdaki geçerli sağ seçim → merkez toleransı dışındaki sol nokta → flush → up dizisi. Görsel uç sol yönde görünmemeli; release kararı görsel olarak korunan rayla tutarlı olmalı; devam eden move/up ikinci kabul üretmemeli. `gestureTip` için sekiz yönün ters projeksiyonu da küçük bir birim testiyle kapsanabilir.

## Korunması gereken davranış ve mevcut kapsam

- `advanceGesture` merkez denetimi geçmedikçe eski `cell+axis` çiftini birlikte koruyor; bu atomiklik doğru. Uç değişince `Board.advance` hücre önbelleğini yeniliyor. Her ham örnekte yalnız yön hesaplanması, hücre değişmeyen örneklerde path/React/text/titreşim işi geri getirmemeli.
- Başlangıç sabit kalmalı; sekiz rayda saat yönü ve ters yönde dolaşım, arada başlangıca dönmeden bırakma, release-only dönüş, tolerans dışı sektör sınırı, iptal ve legacy touch testleri uygun. Yeni delta bu davranışların büyük bölümünü gerçek Board harness'iyle kapsıyor. Birden fazla pivot aynı rAF öncesinde gerçekleştiğinde son önizleme/çizgi ve kabulün aynı rayı kullanması da anlamlı ek kabul ölçütüdür.
- `commit` önce `clear` yaptığı için erken kabul fiziksel jesti tüketir. Yeni delta yanlış yönden hedefe dönüş, sonrasında sürüklemeyi sürdürme ve tek kabulü kapsıyor. `earlyWordEnd` adayları yeni başlangıç-uç rayından üretir; KALE/KALEM önek belirsizliği başka raydaki kelimelerden etkilenmemeli. Delta, KALE'de bekleme → başka yöne geçme → KALEM'e dönüş senaryosunu içeriyor.
- Başlangıcın içindeki küçük hareketler için mevcut `.5` ilk-temas ve `.47` merkez denetimi korunmuş. Eksen başlangıç hücresinde değişebilse de uç aynı hücre olduğundan yeni harf veya kabul oluşmuyor; kaynakta ayrı bir kesin hata görülmedi. Sektör sınırında titreşim sayacı sıfırlanmamalı; aynı fiziksel jestte tekrar ziyaret edilen hücrelerin sessiz kalması yeni tur testinde denetleniyor.

## Doğrulama sınırı

Bu dar kaynak incelemesinde yukarıdaki ters görsel projeksiyon dışında yeni kesin hata bulunmadı. Test kaynaklarının varlığı test başarısı veya gerçek iPhone'da akıcılık kanıtı değildir. Fiziksel parmak hissi, kare süresi ve hızlı yön değiştirmede oyuncu beklentisi koordinatörün cihaz doğrulamasına aittir.

## Son delta — bulgu kapandı

Koordinatörün son düzeltmesi kaynak/test okunarak doğrulandı: `gestureTip` artık `Math.max(0,low,Math.min(high,step))` ile kabul edilmiş ışının tersine geçmiyor. `tests/board-interactions.test.ts` içindeki `does not paint a rejected opposite ray and commits only the accepted letters` regresyonu, yukarıdaki somut ham nokta üzerinden sağdaki harflerin korunmasını, çizginin başlangıçta kalmasını ve yalnız korunmuş sağ seçimin bırakmada commit edilmesini birlikte denetliyor. Yeni geçerli yön merkez toleransından geçtiğinde `axis+cell` birlikte değişiyor. Bu dar incelemenin kesin açık bulgusu kalmadı; fiziksel cihaz ve test çalıştırma sınırı değişmedi.
