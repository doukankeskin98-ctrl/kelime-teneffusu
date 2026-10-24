# Oyun stüdyosu ajan düzeni

Kullanıcının `Agent-dosyaları v1(1).zip` içindeki hedef, odaklı yetenek, döngü ve ortak günlük yaklaşımı mevcut oyun deposuna uyarlanmıştır. Şablonun genel README/CLAUDE dosyaları oyunun dosyalarının üzerine kopyalanmadı. Claude Code, VSCode, yeni eklenti veya ücretli altyapı gerekmez.

Koordinatör → görev dağıtımı → iki bağımsız inceleme → ortak günlük → kabul ölçütü → tek kod değişikliği sahibi → test/CI → yayın. Uzmanlar birbirlerinin çalışma alanını düzenlemez. `RUNBOOK.md` dosyaları role ait proje kontrol listeleridir; sisteme kurulmuş ayrı ChatGPT becerileri değildir.

- Başlangıç: kök `AGENTS.md`, kayıt defteri ve öncelikler.
- Referans: `knowledge/` altında kullanıcıdan ve mevcut kaynaklardan doğrulanan strateji, görsel kimlik ve hedef oyuncu bağlamı. Ürün etkisi gözlemlenmediyse varsayım olarak kalır.
- Ortak hafıza: `journal/entries/` altında benzersiz tarihli bulgular; güncel durumun tek sahibi `orchestrator/PRIORITIES.md`. Kaynak testleri ve yayın metadata'sı belge iddialarından önce gelir.
- Rol hafızası: `agents/*/MEMORY.md`; tek gözlem ortak günlükte kalır, kanıtlı tekrar yoksa hafıza boş bırakılır.
- Çıktı: çalışan oyun, test kanıtı ve uygulama içi kısa sürüm notu. Sadece belge üretmek ürün geliştirmesi sayılmaz.

Mevcut bağlı görev her çalıştığında bu döngüyü yürütür; bu dosyalar kendiliğinden süreç başlatmaz. İki uzmana ancak bağımsız somut iş varsa başvurulur. Haftalık değerlendirme için ilk uygun mevcut çalışmada son yedi günün sonuçları okunur, gerçek sayılar ve sınırlar günlüğe yazılır; yeni otomasyon açılmaz.

Kapsam yalnız `doukankeskin98-ctrl/kelime-teneffusu` ve Site `appgprj_6ad7c9366ae88191a67ce62cdf26ab43`. Sites uygulama/paketleme yönergesi ve kullanıcının mevcut yayın yetkisi korunur. Başka projeye ait durdurma veya geliştirme görevleri bu kapsamı değiştirmez.
