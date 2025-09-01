export const MENU_SCHEMA = {
  admin: [
    {
      key: "genel",
      title: "Genel",
      icon: "🏠",
      items: [
        { key: "dashboard", label: "Ana Sayfa", route: "AdminDashboard" },
      ],
    },
    {
      key: "yonetim",
      title: "Yönetim",
      icon: "⚙️",
      items: [
        { key: "ogretmenler", label: "Öğretmenler", route: "TeachersList" },
        { key: "ogrenciler", label: "Öğrenciler", route: "StudentsList" },
        {
          key: "kullanicilar",
          label: "Kullanıcı Yönetimi",
          route: "AdminDashboard",
        },
        { key: "okullar", label: "Okul Yönetimi", route: "AdminDashboard" },
      ],
    },
    {
      key: "islemler",
      title: "İşlemler",
      icon: "📋",
      items: [
        { key: "yoklama", label: "Yoklama", route: "AttendanceStart" },
        { key: "raporlar", label: "Raporlar", route: "AdminDashboard" },
      ],
    },
  ],

  teacher: [
    {
      key: "genel",
      title: "Genel",
      icon: "🏠",
      items: [{ key: "profil", label: "Profil", route: "TeacherDashboard" }],
    },
    {
      key: "dersler",
      title: "Dersler",
      icon: "📚",
      items: [
        {
          key: "ders-programi",
          label: "Ders Programı",
          route: "TeacherSchedule",
        },
        { key: "derslerim", label: "Derslerim", route: "TeacherDashboard" },
      ],
    },
    {
      key: "ogrenci",
      title: "Öğrenci",
      icon: "👨‍🎓",
      items: [
        { key: "ogretmenler", label: "Öğretmenler", route: "TeachersList" },
        { key: "ogrenciler", label: "Öğrenciler", route: "StudentsList" },
      ],
    },
    {
      key: "islemler",
      title: "İşlemler",
      icon: "📋",
      items: [
        { key: "yoklama", label: "Yoklama", route: "AttendanceStart" },
        {
          key: "odev-ver",
          label: "Verdiğim Ödevler",
          route: "HomeworksGivenList",
        },
        { key: "sinavlarim", label: "Sınavlarım", route: "ExamsList" },
      ],
    },
    {
      key: "iletisim",
      title: "İletişim",
      icon: "💬",
      items: [
        { key: "mesajlar", label: "Mesajlar", route: "TeacherDashboard" },
      ],
    },
  ],

  parent: [
    {
      key: "genel",
      title: "Genel",
      icon: "🏠",
      items: [
        {
          key: "ogrenci-bilgileri",
          label: "Öğrenci Bilgileri",
          route: "ParentDashboard",
        },
      ],
    },
    {
      key: "akademik",
      title: "Akademik",
      icon: "📚",
      items: [
        { key: "odevlerim", label: "Ödevlerim", route: "StudentHomeworkList" },
        {
          key: "devamsizlik",
          label: "Devamsızlık Geçmişi",
          route: "StudentAbsences",
        },
      ],
    },
    {
      key: "iletisim",
      title: "İletişim",
      icon: "💬",
      items: [{ key: "mesajlar", label: "Mesajlar", route: "ParentDashboard" }],
    },
  ],
};
