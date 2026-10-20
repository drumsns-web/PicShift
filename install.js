let picshiftInstallPrompt = null;
const picshiftInstallButton = document.querySelector('#creative-install');
const picshiftInstallGuide = document.querySelector('#creative-install-guide');

function picshiftIsInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function picshiftUpdateInstallButton() {
  picshiftInstallButton.hidden = picshiftIsInstalled();
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  picshiftInstallPrompt = event;
  picshiftInstallButton.textContent = '↓ アプリをインストール';
});

picshiftInstallButton.addEventListener('click', async () => {
  if (picshiftIsInstalled()) return;
  if (picshiftInstallPrompt) {
    const prompt = picshiftInstallPrompt;
    picshiftInstallPrompt = null;
    await prompt.prompt();
    await prompt.userChoice;
    return;
  }
  picshiftInstallGuide.showModal();
});

window.addEventListener('appinstalled', () => {
  picshiftInstallPrompt = null;
  picshiftUpdateInstallButton();
});

picshiftUpdateInstallButton();
