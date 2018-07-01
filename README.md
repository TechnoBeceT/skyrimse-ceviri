# Skyrim SE yerelleştirme düzenlemesi

Projekt slouží pro *re-packaging* původních originálních překladů Skyrim do modifikací vhodných pro Bethesda.net.
Proje, orjinal skyrim çevirilerini yeniden paketlemek ve Bethesda.net'e uygun modifikasyonlar yapmak içindir.

## Klasör dağılımı

 * `script/` - Proje çalışması için NodeJS komut dosyaları
 * `shadow/` - Skyrim SE - ESM Dosyaları(çeviri için kullanılır)
 * `source/` - Kaynak çevirileri (Orijinal Türkçe çevirileri olan Data / Strings klasörü)
 * `target/` - Final değişim yapılmış dosyalar
 * `update/` - Skyrim SE için yeni ve uyarlanmış çeviriler

## Projedeki komut dosyaları

Projedeki scriptler NodeJS betikleridir. Komut dosyasını çalıştırmak için `npm install` kullanarak bağımlılıkları kurmak gerekir.

    node komut script/script_name.js [parametreler]

Varolan komut dosyaları (parametre bilgisi için sadece '--help' ile çalıştırın):

 * `compile.js` - oyuna eklenecek son STRING çeviri dosyasını oluşturacak
 * `modfile.js` - çevirileri ayrı ESP dosyalarına gömer
 * `strings.js` - çevirileri STRINGS dosyasında arama

## SPC ve XB1 ayarları

PC ve XB1'de hedef klasöründe STRINGS dosyası oluşturmak için `node script/compile` komut dosyasını çağırmanız yeterlidir.
Oluşturma Kitinde boş bir değişiklik oluşturmak ve ilgili arabirimde `interface` ve `string` leri klasörlerini sarmak gereklidir.

## PS4 için tek bir esp oluştur

PS4 için, önce "UNACCENT = 1 node script / compile" kullanarak aksatmadan çeviriler oluşturmanız gerekir.
Daha sonra, “node script / modfile”, sıkışmış çevirilerle ayrı değişiklikleri derlemek için kullanılabilir.
Birleştirilmiş eklenti oluşturma [Birleştirme Eklentisi] (http://www.nexusmods.com/skyrim/mods/69905/) yardımcı programı aracılığıyla yapılır.
