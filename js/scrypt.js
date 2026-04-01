const shareButton = document.querySelector('button[aria-label="Compartilhar"]');

if (shareButton) {
  shareButton.addEventListener("click", () => {
    if (navigator.share) {
      navigator.share({
        title: "Biimax",
        text: "Confira o som do Biimax",
        url: window.location.href
      });
    } else {
      alert("Compartilhamento não suportado neste navegador.");
    }
  });
}