const { execSync } = require("child_process");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

// GitHub kimlik bilgilerini saklayacak dosya
const configPath = path.join(__dirname, ".github-config.json");

// Readline arayüzü
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Kimlik bilgilerini kaydet veya oku
function setupCredentials() {
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath));
      return config;
    } catch (err) {
      console.log("Hata: Config dosyası okunamadı. Yeniden oluşturuluyor...");
    }
  }

  return new Promise((resolve) => {
    console.log("GitHub bilgilerinizi giriniz:");
    rl.question("GitHub kullanıcı adınız: ", (username) => {
      rl.question("GitHub e-posta adresiniz: ", (email) => {
        rl.question("GitHub access token: ", (token) => {
          const config = { username, email, token };
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          console.log("Bilgileriniz kaydedildi.");
          resolve(config);
        });
      });
    });
  });
}

// Git komutlarını çalıştır
function runGitCommand(command) {
  try {
    return execSync(command, { encoding: "utf8" });
  } catch (error) {
    console.error(`Hata: ${error.message}`);
    return error.message;
  }
}

// GitHub'a yükle
async function uploadToGithub() {
  try {
    const config = await setupCredentials();

    // Git kullanıcı adı ve e-posta ayarla
    runGitCommand(`git config user.name "${config.username}"`);
    runGitCommand(`git config user.email "${config.email}"`);

    // Repository durumunu kontrol et
    console.log("Repository durumu kontrol ediliyor...");
    const status = runGitCommand("git status");
    console.log(status);

    // Değişiklikleri commit'le
    rl.question("Commit mesajı: ", (message) => {
      console.log("Değişiklikler ekleniyor...");
      runGitCommand("git add .");

      console.log("Commit yapılıyor...");
      const commitResult = runGitCommand(
        `git commit -m "${message || "Automatic commit"}"`,
      );
      console.log(commitResult);

      // Remote repo kontrol et
      const remotes = runGitCommand("git remote -v");
      if (!remotes.includes("origin")) {
        rl.question(
          "Remote repository URL (örn: https://github.com/username/repo.git): ",
          (repoUrl) => {
            runGitCommand(`git remote add origin ${repoUrl}`);
            pushToRemote(config);
          },
        );
      } else {
        pushToRemote(config);
      }
    });
  } catch (error) {
    console.error("Hata:", error);
    rl.close();
  }
}

// Remote repository'ye push
function pushToRemote(config) {
  console.log("GitHub'a yükleniyor...");

  // HTTPS için kullanıcı adı ve token ile URL oluştur
  const output = runGitCommand(`git push -u origin master`);
  console.log(output);

  console.log("İşlem tamamlandı!");
  rl.close();
}

// Programı başlat
uploadToGithub();
