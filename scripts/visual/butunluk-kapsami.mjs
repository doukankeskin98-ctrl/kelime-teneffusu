// 0.58.3 migrated the settings sheet and the Arena entry. Only topmost,
// identified surfaces qualify. A missing expected route always fails.
const requiredSections = [
  ['Oyun', ['Ses', 'Ses düzeyi']],
  ['Görünüm', ['Erişilebilirlik', 'Tahta ve çizgi renkleri']],
  ['Yardım', ['Nasıl oynanır?', 'Gizlilik ve veriler']],
];

function settingsErrors(screen, row) {
  if (row.context !== screen.context || !row.settings) return ['ayarların açılış bağlamı doğrulanamadı'];
  const {sections, expanded, footer, notice, footerBottom, viewportHeight} = row.settings;
  const failures = [];
  if (!footerBottom || footerBottom > viewportHeight + 1) failures.push('ayar alt çubuğu ekran dışında');
  for (const [i, [title, names]] of requiredSections.entries()) {
    const section = sections[i];
    if (section?.title !== title || section.rows.filter(name => names.includes(name)).join('|') !== names.join('|')) {
      failures.push(title + ' grubunda satır ya da sıra farklı');
    }
  }
  if (screen.expanded && !expanded.includes(screen.expanded)) failures.push(screen.expanded + ' satırı açılmadı');
  if (row.context === 'solo' && (notice !== 'Oyun duraklatıldı. İlerlemen kaydedildi.' || footer.join('|') !== 'Oyuna dön|Ana ekran')) {
    failures.push('tek kişilik oyun durum satırı ya da dönüş düğmeleri hatalı');
  }
  if (row.context === 'home' && (notice || !footer.includes('Yolculuğa dön'))) failures.push('ana ekrandaki dönüş düğmesi ya da durum satırı hatalı');
  return failures;
}

export function releaseAcceptance(screens, views, rows, errors) {
  const failures = [];
  const expected = screens.filter(screen => screen.surface);
  const summaries = [];

  for (const view of views) {
    const viewed = rows.filter(row => row.view === view);
    // A failed navigation in the requested catalogue remains a failure even
    // when that window is scheduled for visual migration in the next release.
    failures.push(...errors.filter(error => error.startsWith(view + ' · ') && error.endsWith(': AÇILAMADI')));
    const scoped = [];
    for (const screen of expected) {
      const label = view + ' · ' + screen.ad;
      const row = viewed.find(item => item.ad === screen.ad);
      if (!row || row.surface !== screen.surface) {
        failures.push(label + ': beklenen pencere açılmadı (' + screen.surface + ')');
      } else if (row.surface === 'settings') {
        failures.push(...settingsErrors(screen,row).map(error => label + ': ' + error));
      }
    }
    const home = viewed.find(row => row.ad === 'Ayarları aç')?.settings;
    const solo = viewed.find(row => row.ad === 'Bölüm 118 › Ayarlar')?.settings;
    if (home && solo && JSON.stringify(home.sections) !== JSON.stringify(solo.sections)) {
      failures.push(view + ': ana ekrandaki ayar satırları oyundaki satırlarla eşleşmedi');
    }
    for (const row of viewed) {
      if (!['settings', 'arena'].includes(row.surface)) continue;
      scoped.push(row);
      const prefix = view + ' · ' + row.ad + ': ';
      failures.push(...errors.filter(error => error.startsWith(prefix)));
      if (!row.dialog || row.heads.length === 0) failures.push(prefix + 'pencere başlığı bulunamadı');
      if (row.toggles.length === 0) failures.push(prefix + 'anahtar bulunamadı');
    }
    const keys = field => new Set(scoped.map(row => row.heads[0]?.[field]).filter(Boolean));
    const switches = scoped.flatMap(row => row.toggles);
    const unique = values => [...new Set(values)];
    const sizes = unique(switches.map(toggle => toggle.w + '×' + toggle.h));
    const on = unique(switches.filter(toggle => toggle.on).map(toggle => toggle.bg));
    const off = unique(switches.filter(toggle => !toggle.on).map(toggle => toggle.bg));
    const report = {view, expected: expected.length, opened: scoped.length, trackSizes: sizes,
      onColors: on, offColors: off, headings: keys('s').size, buttonAppearances:unique(scoped.flatMap(row=>row.buttons)).length, fontsPerScreen: Math.max(0,...scoped.map(row => row.sizes))};
    summaries.push(report);
    if (sizes.length !== 1 || sizes[0] !== '52×32') failures.push(view + ': anahtar 52×32 px olmalı (' + sizes.join(', ') + ')');
    if (on.length !== 1 || off.length !== 1 || on[0] === off[0]) failures.push(view + ': iki anahtar durumu ayrı ve tutarlı birer renkte olmalı');
    if (report.headings !== 1) failures.push(view + ': pencere başlığı türü ' + report.headings);
  }
  return {summaries, errors: failures};
}
