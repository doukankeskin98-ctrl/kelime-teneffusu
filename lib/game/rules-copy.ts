/** Rules shared by help, hints and scene guidance. These describe existing rules. */
export const RULES_COPY={
 masked:'✱ işareti gizli bir harfin yerini tutar. Bazı kelimelerde ilk harf görünür.',
 hidden:'✱ işaretleri gizli harfler. Bölümün konusundan yola çık.',
 initial:'İlk harf açık; ✱ işaretleri kalan harfler.',
 stars:'İpuçsuz 3, bir ipucuyla 2, iki veya üç ipucuyla 1 yıldız. Süre yıldızları etkilemez.',
 totalStars:'Tamamladığın bölümlerdeki en iyi sonuçlarının toplamı. Yıldızlar harcanmaz; tekrar oynarken daha düşük bir sonuç alırsan azalmaz.',
 hint:'İpucu almak istediğin kelimeyi seç.',
} as const;
