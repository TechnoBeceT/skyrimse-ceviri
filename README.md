# Skyrim SE yerelleştirme düzenlemesi

 Skyrim SE çevirisinin, Bethesda.net'e yüklenebilecek konsol dostu moda dönüştürme projesi.

## Klasör dağılımı

 * `script/` - Proje çalışması için NodeJS komut dosyaları
 * `shadow/` - Skyrim SE - ESM Dosyaları(çeviri için kullanılır)
 * `source/` - Kaynak çevirileri (Orijinal Türkçe çevirileri olan Data / Strings klasörü)
 * `target/` - Final değişim yapılmış dosyalar
 * `update/` - Skyrim SE için yeni ve uyarlanmış çeviriler

## Projedeki komut dosyaları

Projedeki scriptler NodeJS betikleridir. Komut dosyasını çalıştırmak için `npm install` kullanarak bağımlılıkları kurmak gerekir.

    node script/komut_adı.js [parametreler]

Varolan komut dosyaları (parametre bilgisi için sadece '--help' ile çalıştırın):

 * `compile.js` - Oyun için son çeviri STRINGS dosyaları oluşturur (Xbox için uygun)
 * `modfile.js` - ESP osyalarına derlenmiş çevirileri gömer (PS4 için uygun)
 * `strings.js` - Strings dosyaları ile işlem yapmak için.

## SPC ve XB1 ayarları

XB1 uyumlu stringsleri `target` klasörüne oluşturmak için node script/compile komutunu çalıştırın. Sonrasında Creation Kit üzerinden boş bir değişiklik yapıp, strings ve interface klasörünü ba2 arşivi olarak oluşturun.
## PS4 için tek bir esp oluştur

PS4 çeviri dizeleri `node script/compile` ile etkinleştirilen UNACCENT = 1 opsiyonunu açarak transliterasyon ile derlenmelidir.
`node script/modfile` komutunu kullanarak, eklentilere göre çevirileri ayrı esp dosyalarına gömün. Daha sonrasında [Merge Plugin](http://www.nexusmods.com/skyrim/mods/69905/) kullanarak tek bir mod dosyası oluşturun.
 
