# ThemeToggle Bileşeni

Bu bileşen, kullanıcıların aydınlık ve karanlık tema arasında geçiş yapabilmelerini sağlayan bir toggle düğmesidir. Kullanım kolaylığı ve estetik görünüm sağlamak için tasarlanmıştır.

## Nasıl Çalışır

ThemeToggle bileşeni, mevcut tema sistemine entegre olarak çalışır:

1. `useTheme` hook'u aracılığıyla mevcut tema durumunu (isDark) ve tema değiştirme işlevini (toggleTheme) alır.
2. Kullanıcı düğmeye tıkladığında, tema değiştirilir ve UI anında güncellenir.
3. Animasyonlar sayesinde geçiş görsel olarak pürüzsüz olur.

## Özellikler

- **Özelleştirilebilir Boyut**: `size` prop'u ile boyut ayarlanabilir.
- **Erişilebilirlik**: Ekran okuyucular için tam destek.
- **Animasyonlar**: Geçiş, basma ve ölçeklendirme animasyonları.

## Özelleştirme

Temayı özelleştirmek için:

- **Boyut**: `size` prop'unu değiştirerek düğmenin boyutunu ayarlayabilirsiniz.
- **Renkler**: Kod içindeki renk değerlerini güncelleyerek temayı değiştirebilirsiniz.
- **Animasyon Hızı**: `duration` parametresini değiştirerek animasyon süresini ayarlayabilirsiniz.

```jsx
// Örnek kullanım
<ThemeToggle size={50} />
```

## Animasyonları Devre Dışı Bırakma

Test amaçlı olarak animasyonları devre dışı bırakmak isterseniz:

1. `useEffect` içindeki `Animated.timing` yerine doğrudan değer atamak:

```jsx
// Animasyonlu
useEffect(() => {
  Animated.timing(switchAnim, {
    toValue: isDark ? 1 : 0,
    duration: 300,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    useNativeDriver: false,
  }).start();
}, [isDark]);

// Animasyonsuz
useEffect(() => {
  switchAnim.setValue(isDark ? 1 : 0);
}, [isDark]);
```

2. Basma animasyonları için `handlePressIn` ve `handlePressOut` fonksiyonlarını boş fonksiyonlara çevirebilirsiniz:

```jsx
const handlePressIn = () => {};
const handlePressOut = () => {};
```
