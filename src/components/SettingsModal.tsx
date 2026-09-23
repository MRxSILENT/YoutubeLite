import React from 'react';
import { X, Smartphone, Zap, Moon, Cpu, Check, Trash2, Shield, Headphones } from 'lucide-react';
import { AppSettings, VideoQuality } from '../types/youtube';
import { StorageService } from '../services/storage';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ settings, onUpdateSettings, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const toggle = (key: keyof AppSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleQualityChange = (q: VideoQuality) => {
    const updated = { ...settings, defaultQuality: q };
    onUpdateSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleReset = () => {
    if (confirm('Reset all settings and clear cached data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 select-none">
      <div className="w-full max-w-sm max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col text-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold">Old Phone Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* PWA Install Promo if available */}
          {!isInstalled && (
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-white">Install as Web App</span>
                </div>
                <button
                  onClick={install}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                >
                  Install
                </button>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">
                Adds a standalone launcher icon to your Android home screen.
              </p>
            </div>
          )}

          {/* Low-RAM Mode */}
          <div className="flex items-center justify-between py-1">
            <div className="pr-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Low-RAM Hardware Mode</span>
                <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Disables backdrop blur and CSS animations to prevent frame drops on 512MB-1GB RAM.
              </p>
            </div>
            <button
              onClick={() => toggle('lowRamMode')}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                settings.lowRamMode ? 'bg-red-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.lowRamMode ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Data Saver Mode */}
          <div className="flex items-center justify-between py-1">
            <div className="pr-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Aggressive Data Saver</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Prioritizes 240p/360p to save up to 80% mobile data on metered 2G/3G packages.
              </p>
            </div>
            <button
              onClick={() => toggle('dataSaver')}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                settings.dataSaver ? 'bg-red-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.dataSaver ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* AMOLED Pure Black */}
          <div className="flex items-center justify-between py-1">
            <div className="pr-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>AMOLED Pure Black Theme</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Turns dark grey into true #000000 to shut off OLED pixels and save battery.
              </p>
            </div>
            <button
              onClick={() => toggle('amoledBlack')}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                settings.amoledBlack ? 'bg-red-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.amoledBlack ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Audio-Only by Default */}
          <div className="flex items-center justify-between py-1">
            <div className="pr-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audio Mode by Default</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Always open in lightweight audio visualizer mode without video decoding.
              </p>
            </div>
            <button
              onClick={() => toggle('audioOnlyDefault')}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                settings.audioOnlyDefault ? 'bg-red-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.audioOnlyDefault ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Default Resolution Picker */}
          <div className="pt-2 border-t border-zinc-800">
            <label className="text-xs font-bold text-white block mb-2">
              Default Stream Quality
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['144p', '240p', '360p', '480p', '720p'] as VideoQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                    settings.defaultQuality === q
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-3 border-t border-zinc-800">
            <button
              onClick={handleReset}
              className="w-full py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-zinc-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset App & Clear Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
