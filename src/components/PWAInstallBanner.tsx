import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  onDismiss?: () => void;
}

export const PWAInstallBanner: React.FC<Props> = ({ onDismiss }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) setShowGuide(true);
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white px-3 py-2 text-xs flex items-center justify-between shadow-md select-none border-b border-red-500/30">
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          <div className="p-1.5 bg-black/30 rounded-lg flex-shrink-0">
            <Smartphone className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="truncate">
            <span className="font-bold">Install as Android App</span>
            <span className="text-red-100 hidden sm:inline ml-1.5">• Opens full screen, zero browser lag</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1 bg-white text-red-700 font-bold px-3 py-1 rounded-full text-xs shadow hover:bg-red-50 active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={() => {
              setDismissed(true);
              if (onDismiss) onDismiss();
            }}
            className="p-1 text-red-200 hover:text-white transition"
            aria-label="Close install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-red-500" />
                Add to Android Home Screen
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
              Older Android WebViews and browsers (KitKat, Lollipop, Chrome) let you install this web app like a real APK:
            </p>

            <div className="space-y-2.5 text-xs text-zinc-300 bg-black/40 p-3 rounded-xl border border-zinc-800/80 mb-4">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                <span>Tap the <strong>3 dots (⋮)</strong> menu in your browser top right.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
                <span>Tap <strong>Add</strong>. YouTube Lite will launch in full screen with minimal RAM usage!</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-green-400 mb-4 bg-green-950/40 p-2.5 rounded-lg border border-green-800/30">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Saves up to 75% phone RAM compared to official YouTube app.</span>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
