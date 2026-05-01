import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Info } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Don't show immediately, wait for user to click "Download" in header
      // or show after some time
    };

    const triggerHandler = () => {
      if (deferredPrompt) {
        handleInstallClick();
      } else {
        setShowInstructions(true);
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('trigger-pwa-install', triggerHandler);

    // Smart Detection for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Auto show if it's the first time and not installed
    const hasDismissed = localStorage.getItem('pwa_dismissed');
    if (!hasDismissed && !isStandalone) {
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('trigger-pwa-install', triggerHandler);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstructions(true);
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', position: 'relative', overflow: 'hidden' }}>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: 'rgba(15, 61, 62, 0.1)', 
            color: 'var(--primary)', 
            borderRadius: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Smartphone size={32} />
          </div>
          <h2 className="urdu-text" style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>ایپ ڈاؤن لوڈ کریں</h2>
          <p style={{ color: 'var(--text-muted)' }}>Download Apna Madrasa App</p>
        </div>

        {isIOS || showInstructions ? (
          <div style={{ backgroundColor: 'var(--secondary)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <p className="urdu-text" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '0.5rem' }}>
                  انسٹال کرنے کے لیے براؤزر کے <b>Share</b> بٹن پر کلک کریں اور پھر <b>Add to Home Screen</b> منتخب کریں۔
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  To install, click the browser's <b>Share</b> button and select <b>Add to Home Screen</b>.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <p className="urdu-text" style={{ marginBottom: '1rem' }}>بہترین تجربے کے لیے ایپ انسٹال کریں۔</p>
            <button 
              onClick={handleInstallClick}
              className="btn btn-primary urdu-text"
              style={{ width: '100%' }}
            >
              <Download size={20} /> ابھی انسٹال کریں (Install Now)
            </button>
          </div>
        )}

        <button 
          onClick={dismiss}
          className="btn btn-secondary urdu-text"
          style={{ width: '100%', border: 'none' }}
        >
          بعد میں (Later)
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
