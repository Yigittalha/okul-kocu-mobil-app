#!/bin/bash

# GitHub otomatik yükleme script'i
echo "🚀 GitHub Otomatik Kod Yükleme Aracı 🚀"

# Config dosyası kontrolü
CONFIG_FILE=".github-config"
if [ -f "$CONFIG_FILE" ]; then
  source "$CONFIG_FILE"
else
  echo "📝 GitHub bilgilerinizi giriniz (bir kere girmeniz yeterli):"
  read -p "GitHub kullanıcı adınız: " GITHUB_USERNAME
  read -p "GitHub e-posta adresiniz: " GITHUB_EMAIL
  read -p "Repository URL (örn: https://github.com/username/repo.git): " REPO_URL
  
  # Config dosyasına kaydet
  echo "GITHUB_USERNAME=\"$GITHUB_USERNAME\"" > "$CONFIG_FILE"
  echo "GITHUB_EMAIL=\"$GITHUB_EMAIL\"" >> "$CONFIG_FILE"
  echo "REPO_URL=\"$REPO_URL\"" >> "$CONFIG_FILE"
  
  echo "✅ Bilgileriniz kaydedildi."
fi

# Git kullanıcı bilgilerini ayarla
git config user.name "$GITHUB_USERNAME"
git config user.email "$GITHUB_EMAIL"

# Git durumunu kontrol et
echo "📊 Repository durumu kontrol ediliyor..."
git status

# Değişiklikleri commit et
echo "📝 Commit mesajı giriniz:"
read COMMIT_MESSAGE

if [ -z "$COMMIT_MESSAGE" ]; then
  COMMIT_MESSAGE="Automatic update $(date)"
fi

echo "➕ Değişiklikler ekleniyor..."
git add .

echo "💾 Commit yapılıyor: \"$COMMIT_MESSAGE\""
git commit -m "$COMMIT_MESSAGE"

# Remote repo kontrolü
if ! git remote | grep -q "origin"; then
  echo "🔗 Remote repository ekleniyor..."
  git remote add origin "$REPO_URL"
fi

# Branch kontrolü
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ -z "$BRANCH" ]; then
  BRANCH="master"
fi

# GitHub'a push
echo "☁️ GitHub'a yükleniyor..."
git push -u origin "$BRANCH"

echo "✅ İşlem tamamlandı! Kodlarınız GitHub'a yüklendi." 