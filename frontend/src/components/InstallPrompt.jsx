import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => !!localStorage.getItem('vastra_pwa_dismissed')
  );

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (dismissed) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    if (ios) {
      // Show iOS instructions after 3 seconds
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    // Android / Chrome beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setShow(true), 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setShow(false);
    }
    dismiss();
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('vastra_pwa_dismissed', '1');
    setDismissed(true);
  };

  if (!show || dismissed) return null;

  return (
    <div className="install-banner">
      <div style={{ fontSize: 28 }}>🧵</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>Add Vastra to Home Screen</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
          {isIOS
            ? 'Tap Share → "Add to Home Screen"'
            : 'Install for a faster, app-like experience'}
        </div>
      </div>
      {!isIOS && (
        <button
          onClick={handleInstall}
          style={{ background: 'white', color: 'var(--teal-darker)', border: 'none', borderRadius: 20, padding: '7px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}
        >
          Install
        </button>
      )}
      <button
        onClick={dismiss}
        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
      >
        ×
      </button>
    </div>
  );
}
