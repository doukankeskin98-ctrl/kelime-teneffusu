export const GAME_UPDATES=[
 {version:'0.7.1',date:'22 Ekim 2026',title:'Hatıranı bölüm sonunda gör',items:[
  {where:'Bölüm sonucu',detail:'Tarihli bir keşfi bitirince damganın durumunu hemen gör. İki bölüm tamamlandıysa aynı tarihin hatırası gösterilir; tekrar oyununda yeni bir ödül eklenmez.'},
  {where:'Diğer keşfi aç',detail:'Çiftin bir bölümü kaldıysa sonuçta adını görüp doğrudan açabilirsin. İpucu veya süre şartı yok; istediğin zaman ara verebilirsin.'},
  {where:'Geçmiş keşifler ve bağlantı',detail:'Arşivdeki eski tarihlerde de çalışır. Diğer bölümün kaydı bilinmiyorsa bu açıkça belirtilir; kayıt yeniden kontrol edilebilir.'},
 ]},
 {version:'0.7.0',date:'22 Ekim 2026',title:'İki keşif, kalıcı bir hatıra',items:[
  {where:'İki yeni bölüm',detail:'Bir avuç melodi ile kolay bir başlangıç yap; Robot atölyesi ile teknoloji dünyasına geç. İki bölümde de çapraz kelimeler var.'},
  {where:'Keşif damgaları',detail:'Aynı tarihin iki bölümünü de tamamlayınca o tarihin damgası açılır. İpucu veya süre şartı yok; arşivden istediğin zaman tamamlayabilirsin.'},
  {where:'Tarihli bölüm arşivi',detail:'Her çiftin ilerlemesi ve kazandığın damga birlikte görünür. Önceki tamamlamalar da geçerli; Damganı gör ile kalıcı hatıranı açabilirsin.'},
 ]},
 {version:'0.6.1',date:'21 Ekim 2026',title:'Keşiflerin kaldığı yerden devam ediyor',items:[
  {where:'Ana sayfa ve bölüm arşivi',detail:'Yarım kalan bölümde bulunan kelime sayısını ve Kaldığın yerden düğmesini gör. Tamamlanan bölümde kazandığın yıldızlar ve en iyi süren görünür.'},
  {where:'Bir daha keşfet',detail:'Tamamladığın bölümden doğrudan yeni bir tur aç. Önceki en iyi sonucun korunur; yeni tur onu gerçekten geçerse güncellenir.'},
  {where:'Bağlantı ve kayıt bilgisi',detail:'Kayıt yüklenirken veya bağlantı yokken durum açıkça gösterilir. İlerleme bilgisi alınamazsa yeniden kontrol edebilirsin.'},
 ]},
 {version:'0.6.0',date:'21 Ekim 2026',title:'Ana sayfada iki yeni keşif',items:[
  {where:'Ana sayfa',detail:'Ormanın minik komşuları ve Merak laboratuvarı için doğrudan oynanabilen iki yeni kart.'},
  {where:'Kalıcı bölüm arşivi',detail:'Yeni eklenen bölümler burada kalır. Ara verip dönebilir, aynı tahtayı yeniden oynayabilirsin.'},
  {where:'Neler değişti?',detail:'Sürüm notları artık bu pencerede okunur. Ayrı bir dosya açmana gerek yok.'},
 ]},
 {version:'0.5.1',date:'21 Ekim 2026',title:'Küçük kullanım ve kayıt düzeltmeleri',items:[
  {where:'Kelime tahtası',detail:'Seçimin ilk ve son harfinde halka, seçilen harf sayısı ve daha okunaklı yardımcı yazılar.'},
  {where:'Bölüm sonu',detail:'Süre, bulunan kelime ve kullanılan ipucu özeti. Önceki en iyi sonuç gerçekten geçilirse kişisel rekor bildirimi.'},
  {where:'Ana sayfa ve kayıtlar',detail:'Tamamlanmış bir bölümü yarım kalmış gibi önermeme, cihazda hemen kayıt ve bağlantıdan sonra güvenli eşitleme.'},
 ]},
] as const;
