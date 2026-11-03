# Günün Renkleri · bağımsız editoryal inceleme

4 Kasım 2026. Kapsam: `lib/game/everyday-content.ts` içindeki 24 bölüm, 100 hedef kelime ve 16 tanım; eski ana/isteğe bağlı/hikâye kataloglarıyla dar tekrar karşılaştırması. Uygulama kodu değiştirilmedi; yayın yapılmadı.

## Öncelikli bulgular

1. `lib/game/everyday-content.ts:24` — **Başlığı kesinleştir:** “Süt ürünleri” listesinde SÜT de var. Gündelik kullanımda anlaşılır olmakla birlikte, kullanıcının başlık–kelime tam uyumu koşulunda süt ile sütten yapılan ürünleri açıkça kapsayan **“Süt ve süt ürünleri”** daha nettir. Kelimeleri veya tahtayı değiştirmek gerekmez. Kabul: görünür bölüm konusu dört hedefi aynı açıklıkta kapsasın.
2. `lib/game/everyday-content.ts:33` — **Alet ve malzemeyi aynı başlıkta kapsa:** “Ahşap işleme aletleri” altındaki ZIMPARA, diğer dört el aletiyle aynı türde olmayabilen bir sarf malzemesidir. **“Ahşap atölyesi”** bütün hedefleri doğal biçimde kapsar. Kabul: oyuncu yalnız bir nesne türü beklerken farklı türle karşılaşmasın.
3. `lib/game/everyday-content.ts:29` — **Mekânsal çağrışımı doğrudan konuya çevir:** “Resim çantası” altında TUVAL bulunması anlaşılır, fakat çantaya sığma çağrışımı gereksiz. **“Resim gereçleri”** FIRÇA, BOYA, PALET ve TUVAL için daha doğrudan bir konu adıdır. Bu düşük riskli bir metin iyileştirmesidir.

## Kontrol sonucu

Diğer başlıklarda hedef kapsamı açısından açık bir uyumsuzluk saptanmadı. Meyveler, turunçgiller, kurutularak tüketilen meyveler, kuruyemişler, kırmızı meyveler ve meyveyle hazırlanan yiyecek/içecekler aynı rota içinde anlaşılır bir sıra kuruyor. Sebze, baklagil, mutfak gereci, baharat ve çorba grupları net. Dikiş/örgü tanımları yakın nesneleri ayırıyor; SÜZGEÇ ile KEVGİR tanımları kap ve delikli kepçe ayrımı yapıyor. Üflemeli çalgılarda FLÜT, NEY, KAVAL ve KLARNET tanımları birbirini tekrar etmiyor. ŞİŞ, TIĞ, YÜN, ÇİLE tanımları uzun teknik açıklamalara kaçmadan cevabı tarif ediyor.

Node ile normalize edilmiş hedef kümeleri karşılaştırıldı: **24/24 farklı küme, paket içinde 100/100 farklı kelime**. Önceki ana, isteğe bağlı bilmece ve hikâye bölümleriyle birebir aynı hedef kümesi yok; herhangi bir yeni bölümün eski bir bölümle üç veya daha fazla ortak hedefi yok. Bu, bütün sözlükteki kelimelerin ilk kez kullanıldığı anlamına gelmez. Küçük paket içinde aynı hedefin tekrar edilmemesi doğrulandı.

## Düzeltme sonrası dar doğrulama

Koordinatör ilk bulguyu başlığı uzatmadan çözdü: `Süt ürünleri` hedeflerindeki SÜT, AYRAN ile değiştirildi. AYRAN, YOĞURT, PEYNİR ve KAYMAK doğrudan başlığın kapsamındadır. Diğer iki başlık `Resim gereçleri` ve `Ahşap atölyesi` olarak düzeltildi. Üç bulgu da bu kaynakta kapanmıştır.

Yalnız bu değişikliklerden sonra aynı normalleştirilmiş küme karşılaştırması yeniden çalıştırıldı: 24 bölüm / 24 farklı küme / 100 hedef / 100 farklı kelime; eski ana, isteğe bağlı ve hikâye kataloğuyla aynı küme veya üç ve üzeri ortak hedef yine yok. Yeni başlıklar ve değiştirilen tek kelime dışında yeni inceleme kapsamı açılmadı.

## Sınırlar

Bu inceleme Türkçe anlam, başlık kapsamı ve kaynak verisi üzerindedir. Yeni tahtaların çözülebilirliği, gizleme politikası, kayıt/ödül uyumluluğu, fiziksel telefon, ses/haptics ve yayın kapıları koordinatörün ayrı testleridir. Başlangıç bulguları düzeltildi; koşulsuz “kusursuz içerik” veya oyuncu davranışı iddiası yoktur. Yeni harici araştırma veya bağımlılık kullanılmadı.
