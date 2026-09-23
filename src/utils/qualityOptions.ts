import { QualityOption, VideoQuality } from '../types/youtube';

export const QUALITY_OPTIONS: QualityOption[] = [
  {
    quality: '144p',
    label: '144p',
    description: 'Ultra Data Saver (2G / Weak Signal)',
    mbPer10Min: 1.5,
    tag: 'Lowest Data',
  },
  {
    quality: '240p',
    label: '240p',
    description: 'Low Data (Smooth on 3G)',
    mbPer10Min: 3.8,
    tag: 'Fast Load',
  },
  {
    quality: '360p',
    label: '360p',
    description: 'Standard Mobile (Optimal for Old Phones)',
    mbPer10Min: 8.5,
    tag: 'Recommended',
  },
  {
    quality: '480p',
    label: '480p',
    description: 'Clear Definition (4G / Strong Wi-Fi)',
    mbPer10Min: 18.2,
    tag: 'Clear',
  },
  {
    quality: '720p',
    label: '720p',
    description: 'HD High Def (Needs fast CPU & Wi-Fi)',
    mbPer10Min: 45.0,
    tag: 'HD',
  },
];

export function getQualityOption(quality: VideoQuality): QualityOption {
  return QUALITY_OPTIONS.find((q) => q.quality === quality) || QUALITY_OPTIONS[2];
}
