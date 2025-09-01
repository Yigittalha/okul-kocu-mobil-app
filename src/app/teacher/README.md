# Yoklama Ekranları

Bu klasörde öğretmenlerin yoklama işlemlerini yürütmeleri için gerekli ekranlar bulunmaktadır.

## AttendanceStart

`AttendanceStart.js` ekranı, yoklama almaya başlamak için gerekli olan sınıf ve tarih seçiminin yapıldığı ilk ekrandır.

### Özellikler

- **Sınıf Seçimi**: Backend'den çekilen sınıf listesinden bir sınıf seçilir
- **Tarih Seçimi**: Varsayılan olarak güncel tarihi gösterir, değiştirilebilir
- **Onaylama**: Seçilen sınıf ve tarihe göre yoklama alma işlemi başlatılır

### API Entegrasyonu

- API: `https://c802f00043e4.ngrok-free.app/api/student/classall`
- İstek türü: POST
- Parametre yok
- Dönüş formatı:
  ```json
  [
    { "SinifKodu": "0001", "SinifAdi": "5-A", "Derslik": "0001", "Devre": "5" },
    { "SinifKodu": "0002", "SinifAdi": "5-B", "Derslik": "0002", "Devre": "5" },
    { "SinifKodu": "0003", "SinifAdi": "5-C", "Derslik": "0003", "Devre": "5" }
  ]
  ```

### Tarih Formatı

Tarih, `YYYY-MM-DD` formatında saklanır ve gösterilir.

Örnek: `2025-09-01`

Bu format, backend API ile uyumlu olması için tercih edilmiştir.

### Özelleştirmeler

- **Varsayılan tarihi değiştirmek** için, `AttendanceStart.js` dosyasında `const [selectedDate, setSelectedDate] = useState(new Date());` satırını değiştirebilirsiniz.

- **Tarih formatını değiştirmek** için, `formatDateYYYYMMDD` fonksiyonunu güncelleyebilirsiniz:

```js
const formatDateYYYYMMDD = (date) => {
  // Burada farklı bir format kullanabilirsiniz
};
```

### Navigasyon

Bu ekran, hem admin hem de öğretmen menülerinde "✅ Yoklama" seçeneği ile erişilebilir. Veli menüsünde bu seçenek bulunmamaktadır.
