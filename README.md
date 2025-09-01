# School App

## Theme Update

Light theme remains unchanged; Dark theme now uses a classic dark palette. Navy/yellow colors have been removed from dark mode.

### Theme Tokens

All theme tokens are located in `src/constants/colors.js`. The application uses the following themes:

- `light`: The default light theme (unchanged)
- `darkClassic`: The new classic dark theme with the following tokens:
  - `background` = `#0B0F14` (near-black)
  - `surface` = `#121417`
  - `card` = `#161A20`
  - `border` = `#232A33`
  - `textPrimary` = `#E6E8EB`
  - `textSecondary`=`#AAB2BD`
  - `muted` = `#6B7280`
  - `accent` = `#4F9CF9` (subtle blue)
  - `success` = `#22C55E`
  - `warning` = `#F59E0B`
  - `danger` = `#EF4444`

### How to Use Tokens

Components can access theme tokens using the `useTheme` hook:

```javascript
import { useTheme } from "../state/theme";

function MyComponent() {
  const { theme, isDark } = useTheme();

  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>Hello World</Text>
    </View>
  );
}
```

To tweak the theme, modify the tokens in `src/constants/colors.js`.

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
