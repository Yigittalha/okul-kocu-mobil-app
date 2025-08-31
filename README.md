# School App

Bu React Native Expo uygulaması öğrenci, öğretmen ve admin modüllerini içeren bir okul yönetim sistemidir.

## Otomatik GitHub Yükleme

Bu proje için otomatik GitHub yükleme özellikleri eklenmiştir. İki farklı yöntemle kullanabilirsiniz:

### 1. Bash Script ile Yükleme (Tavsiye edilen)

Terminal'de aşağıdaki komutu çalıştırın:

```bash
npm run github
```

veya

```bash
./upload.sh
```

İlk çalıştırmada sizden GitHub bilgilerinizi isteyecektir:
- GitHub kullanıcı adınız
- GitHub email adresiniz
- Repository URL'iniz (örn: https://github.com/username/repo.git)

Bu bilgiler `.github-config` dosyasına kaydedilir ve sonraki kullanımlarda otomatik olarak kullanılır.

### 2. Node.js Script ile Yükleme

Alternatif olarak Node.js tabanlı script de kullanabilirsiniz:

```bash
npm run upload
```

veya

```bash
node github-upload.js
```

## Kullanım

1. Değişikliklerinizi yapın
2. `npm run github` komutunu çalıştırın
3. Commit mesajını girin
4. Değişiklikleriniz otomatik olarak GitHub'a yüklenecektir

## Güvenlik

- `.github-config` ve `.github-config.json` dosyaları yerel bilgisayarınızda saklanır
- Hiçbir hassas bilgi GitHub'a yüklenmez
- `.gitignore` dosyasına bu config dosyalarını eklemeyi unutmayın 