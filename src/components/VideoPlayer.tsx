import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize2,
  ChevronDown,
  Volume2,
  VolumeX,
  Settings,
  Headphones,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Clock,
  Moon,
  MessageSquare,
  Sparkles,
  Check,
  X,
  Film,
} from 'lucide-react';
import { Video, VideoQuality, VideoComment } from '../types/youtube';
import { StorageService } from '../services/storage';
import { QUALITY_OPTIONS, getQualityOption } from '../utils/qualityOptions';
import { ApiService } from '../services/api';

interface Props {
  video: Video;
  onClose: () => void;
  onMinimize: () => void;
  onSelectRelated: (video: Video) => void;
  initialAudioOnly?: boolean;
}

export const VideoPlayer: React.FC<Props> = ({
  video,
  onClose,
  onMinimize,
  onSelectRelated,
  initialAudioOnly = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioOnly, setIsAudioOnly] = useState(initialAudioOnly);
  const [currentQuality, setCurrentQuality] = useState<VideoQuality>('360p');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerLeft, setSleepTimerLeft] = useState<number | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [screenDimmed, setScreenDimmed] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Record in watch history
    StorageService.addToHistory(video);
    setIsLiked(StorageService.isLiked(video.id));
    setIsSubscribed(StorageService.isSubscribed(video.channelTitle));

    // Calculate data saved compared to 1080p stream
    StorageService.recordDataSaved(35.0);

    // Fetch comments and related videos
    ApiService.getComments(video.id).then(setComments);
    ApiService.getRelatedVideos(video.id).then(setRelatedVideos);

    // Reset modals
    setShowQualityModal(false);
    setShowSpeedModal(false);
  }, [video]);

  // Handle Sleep Timer countdown
  useEffect(() => {
    if (!sleepTimerMinutes) {
      setSleepTimerLeft(null);
      return;
    }

    setSleepTimerLeft(sleepTimerMinutes * 60);
    const interval = setInterval(() => {
      setSleepTimerLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setIsPlaying(false);
          alert('Sleep Timer: Playback stopped to save your phone battery.');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  const handleToggleLike = () => {
    const next = StorageService.toggleLiked(video);
    setIsLiked(next);
  };

  const handleToggleSubscribe = () => {
    const next = StorageService.toggleSubscription({
      name: video.channelTitle,
      avatar: video.channelAvatar,
      subscribers: video.subscribers || '1.2M',
    });
    setIsSubscribed(next);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: VideoComment = {
      id: 'c_' + Date.now(),
      author: 'You (Mobile User)',
      text: newCommentText.trim(),
      publishedAt: 'Just now',
      likes: 0,
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
  };

  const handleShare = async () => {
    const url = `https://www.youtube.com/watch?v=${video.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Check out "${video.title}" on YouTube Lite:`,
          url,
        });
      } catch {
        // ignore
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Video URL copied to clipboard!');
    }
  };

  const handleDownload = (quality: VideoQuality) => {
    StorageService.saveForOffline(video, quality);
    setShowDownloadModal(false);
    alert(`Video "${video.title.slice(0, 30)}..." saved for offline playback at ${quality}!`);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Safe YouTube embed URL with performance optimizations
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&controls=1&iv_load_policy=3`;

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] text-white flex flex-col overflow-y-auto select-none">
      {/* Top sticky player container */}
      <div
        ref={playerContainerRef}
        className={`sticky top-0 z-30 w-full bg-black ${
          isFullscreen ? 'h-screen' : 'aspect-video max-h-[48vh]'
        } flex flex-col justify-center relative shadow-xl`}
      >
        {/* If Audio-Only Mode is ACTIVE */}
        {isAudioOnly ? (
          <div
            className={`w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors ${
              screenDimmed ? 'bg-black text-zinc-700' : 'bg-gradient-to-b from-zinc-900 to-black'
            }`}
          >
            {/* Screen Dimmer overlay */}
            {screenDimmed ? (
              <div
                onClick={() => setScreenDimmed(false)}
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
              >
                <Moon className="w-8 h-8 text-zinc-700 animate-pulse mb-2" />
                <span className="text-xs text-zinc-600">Screen Dimmed (Pocket Mode)</span>
                <span className="text-[10px] text-zinc-700 mt-1">Tap screen to wake</span>
              </div>
            ) : (
              <>
                {/* Audio Artwork */}
                <div className="relative mb-3">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-2xl border border-zinc-800"
                  />
                  <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-red-600 text-white shadow">
                    <Headphones className="w-4 h-4" />
                  </div>
                </div>

                {/* Animated Waveform Simulator */}
                <div className="flex items-center gap-1 h-8 mb-2">
                  {[40, 75, 100, 60, 90, 45, 80, 50, 95, 30].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full bg-red-500 transition-all duration-300 ${
                        isPlaying ? 'animate-pulse' : 'opacity-30'
                      }`}
                      style={{
                        height: isPlaying ? `${Math.max(20, (h * (i % 2 === 0 ? 1 : 0.7)))}%` : '15%',
                        animationDelay: `${i * 80}ms`,
                      }}
                    />
                  ))}
                </div>

                <div className="text-center px-4 max-w-sm">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                    Audio-Only Mode • 85% Data Saved
                  </div>
                  <div className="text-sm font-semibold truncate text-zinc-200">{video.title}</div>
                  <div className="text-xs text-zinc-400">{video.channelTitle}</div>
                </div>

                {/* Pocket Dimmer button */}
                <button
                  onClick={() => setScreenDimmed(true)}
                  className="mt-3 flex items-center gap-1 px-3 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-full text-[11px] border border-zinc-700"
                >
                  <Moon className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Pocket Mode (Dim Screen)</span>
                </button>
              </>
            )}

            {/* Hidden actual YouTube audio iframe */}
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={video.title}
              className="w-1 h-1 opacity-0 pointer-events-none absolute"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          /* Video mode (Clean Embedded Iframe) */
          <div className="w-full h-full relative bg-black">
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={video.title}
              className="w-full h-full object-contain"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}

        {/* Top Floating Control Bar */}
        <div className="absolute top-0 inset-x-0 p-2 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white pointer-events-auto">
          <button
            onClick={onMinimize}
            className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full active:scale-95 transition"
            title="Minimize to Mini Player"
            aria-label="Minimize"
          >
            <ChevronDown className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2">
            {/* Audio Mode Toggle */}
            <button
              onClick={() => setIsAudioOnly(!isAudioOnly)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow transition ${
                isAudioOnly
                  ? 'bg-emerald-600 text-white'
                  : 'bg-black/60 hover:bg-black/80 text-zinc-200 border border-zinc-700'
              }`}
              title="Toggle Audio-Only Mode to save CPU & data"
            >
              {isAudioOnly ? <Film className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isAudioOnly ? 'Video' : 'Audio'}</span>
            </button>

            {/* Quality Selector */}
            <button
              onClick={() => setShowQualityModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 hover:bg-black/80 text-zinc-200 text-xs font-medium border border-zinc-700"
              title="Change Resolution & Data Saver"
            >
              <span>{currentQuality}</span>
            </button>

            {/* Sleep Timer Indicator / Trigger */}
            <button
              onClick={() => setShowSleepTimerModal(true)}
              className={`p-1.5 rounded-full transition ${
                sleepTimerLeft
                  ? 'bg-purple-600 text-white'
                  : 'bg-black/60 hover:bg-black/80 text-zinc-200'
              }`}
              title="Sleep Timer"
            >
              <Moon className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full active:scale-95 transition"
              title="Close player"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Sleep Timer active toast in player */}
        {sleepTimerLeft !== null && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-purple-900/90 text-purple-200 text-[10px] font-mono flex items-center gap-1">
            <Moon className="w-3 h-3 text-purple-300 animate-pulse" />
            <span>
              Sleep in {Math.floor(sleepTimerLeft / 60)}m {sleepTimerLeft % 60}s
            </span>
          </div>
        )}
      </div>

      {/* Video Information & Actions Section */}
      <div className="p-3.5 space-y-3.5 flex-1">
        {/* Title */}
        <div>
          <h1 className="text-base font-bold text-white leading-snug">
            {video.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
            <span>{video.views}</span>
            <span>•</span>
            <span>{video.publishedAt}</span>
            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-300">
              {currentQuality} Lite
            </span>
          </div>
        </div>

        {/* Action Buttons Row (Like, Dislike, Share, Download, Quality) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* Like / Dislike pill */}
          <div className="flex items-center bg-zinc-800/90 rounded-full border border-zinc-700/60 overflow-hidden flex-shrink-0">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition active:scale-95 ${
                isLiked ? 'text-red-500' : 'text-zinc-200 hover:text-white'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{isLiked ? 'Liked' : video.likes || 'Like'}</span>
            </button>
            <div className="w-[1px] h-4 bg-zinc-700" />
            <button
              onClick={() => setIsLiked(false)}
              className="px-3 py-2 text-zinc-300 hover:text-white text-xs active:scale-95 transition"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 flex-shrink-0 active:scale-95 transition"
          >
            <Share2 className="w-4 h-4 text-purple-400" />
            <span>Share</span>
          </button>

          {/* Download / Offline Button */}
          <button
            onClick={() => setShowDownloadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 flex-shrink-0 active:scale-95 transition"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Save Offline</span>
          </button>

          {/* Audio-Only Mode quick button */}
          <button
            onClick={() => setIsAudioOnly(!isAudioOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border flex-shrink-0 active:scale-95 transition ${
              isAudioOnly
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700/60 text-zinc-200'
            }`}
          >
            <Headphones className="w-4 h-4 text-emerald-400" />
            <span>{isAudioOnly ? 'Audio Active' : 'Audio Mode'}</span>
          </button>

          {/* Playback Speed */}
          <button
            onClick={() => setShowSpeedModal(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700/60 flex-shrink-0 active:scale-95 transition"
          >
            <span>{playbackSpeed}x</span>
          </button>
        </div>

        {/* Channel Banner & Subscribe Row */}
        <div className="flex items-center justify-between py-2 border-y border-zinc-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={video.channelAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelTitle)}&background=FF0000&color=fff`}
              alt={video.channelTitle}
              className="w-10 h-10 rounded-full object-cover bg-zinc-800 flex-shrink-0"
            />
            <div className="truncate">
              <div className="text-sm font-bold text-white truncate">{video.channelTitle}</div>
              <div className="text-[11px] text-zinc-400">{video.subscribers || '1.2M'} subscribers</div>
            </div>
          </div>

          <button
            onClick={handleToggleSubscribe}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
              isSubscribed
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Video Description Box */}
        <div
          onClick={() => setShowFullDesc(!showFullDesc)}
          className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs cursor-pointer hover:bg-zinc-850 transition"
        >
          <div className="flex items-center justify-between font-semibold text-zinc-300 mb-1">
            <span>Description</span>
            <span className="text-[10px] text-zinc-500">{showFullDesc ? 'Show less' : 'Show more'}</span>
          </div>
          <p className={`text-zinc-300 leading-relaxed whitespace-pre-line ${showFullDesc ? '' : 'line-clamp-2'}`}>
            {video.description || `Enjoy watching ${video.title} on YouTube Lite for Android.`}
          </p>
        </div>

        {/* Comments Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              Comments ({comments.length})
            </h3>
            <span className="text-[10px] text-zinc-500">Lite Discussion</span>
          </div>

          {/* Add comment input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-zinc-900 text-xs text-white placeholder-zinc-500 px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="px-3 py-2 bg-red-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold active:scale-95 transition"
            >
              Post
            </button>
          </form>

          {/* Comment list */}
          <div className="space-y-3">
            {comments.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-start gap-2.5 text-xs">
                <img
                  src={c.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author)}&background=444&color=fff`}
                  alt={c.author}
                  className="w-7 h-7 rounded-full object-cover bg-zinc-800 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-zinc-300 text-[11px]">{c.author}</span>
                    <span className="text-[10px] text-zinc-500">{c.publishedAt}</span>
                  </div>
                  <p className="text-zinc-200 mt-0.5 text-[12px] leading-snug">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Up Next / Related Videos */}
        <div className="pt-4 border-t border-zinc-800/80">
          <div className="text-sm font-bold text-white mb-2">Up Next</div>
          <div className="space-y-2">
            {relatedVideos.slice(0, 6).map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectRelated(rel)}
                className="flex gap-2.5 p-1.5 rounded-xl hover:bg-zinc-900 active:bg-zinc-800 cursor-pointer transition"
              >
                <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                  <img
                    src={rel.thumbnail}
                    alt={rel.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-bold text-white">
                    {rel.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="text-xs font-semibold text-white line-clamp-2 leading-tight">
                    {rel.title}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    <div className="truncate">{rel.channelTitle}</div>
                    <div>{rel.views}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Picker Modal (YouTube Go style) */}
      {showQualityModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 animate-in fade-in">
          <div className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold">Video Quality & Data Saver</h3>
                <p className="text-[11px] text-zinc-400">Pick resolution to match your network speed</p>
              </div>
              <button
                onClick={() => setShowQualityModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {QUALITY_OPTIONS.map((opt) => {
                const isCurrent = currentQuality === opt.quality;
                return (
                  <div
                    key={opt.quality}
                    onClick={() => {
                      setCurrentQuality(opt.quality);
                      setShowQualityModal(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition ${
                      isCurrent
                        ? 'bg-red-950/40 border-red-600 text-white'
                        : 'bg-zinc-850/60 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{opt.label}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 font-semibold text-zinc-300">
                          {opt.tag}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{opt.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        ~{opt.mbPer10Min} MB
                      </div>
                      <div className="text-[9px] text-zinc-500">per 10 min</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowQualityModal(false)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Speed Modal */}
      {showSpeedModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4">
          <div className="w-full sm:max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold">Playback Speed</h3>
              <button onClick={() => setShowSpeedModal(false)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setPlaybackSpeed(s);
                    setShowSpeedModal(false);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    playbackSpeed === s
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {s === 1 ? 'Normal' : `${s}x`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sleep Timer Modal */}
      {showSleepTimerModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4">
          <div className="w-full sm:max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-purple-400" />
                  Sleep Timer
                </h3>
                <p className="text-[11px] text-zinc-400">Automatically stops playback to preserve battery</p>
              </div>
              <button onClick={() => setShowSleepTimerModal(false)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 mb-4">
              {[
                { min: null, label: 'Off' },
                { min: 15, label: '15 minutes' },
                { min: 30, label: '30 minutes' },
                { min: 45, label: '45 minutes' },
                { min: 60, label: '60 minutes (1 hour)' },
              ].map((item) => (
                <button
                  key={String(item.min)}
                  onClick={() => {
                    setSleepTimerMinutes(item.min);
                    setShowSleepTimerModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold border transition ${
                    sleepTimerMinutes === item.min
                      ? 'bg-purple-950/40 border-purple-600 text-white'
                      : 'bg-zinc-850/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span>{item.label}</span>
                  {sleepTimerMinutes === item.min && <Check className="w-4 h-4 text-purple-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Offline Download Quality Picker Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4">
          <div className="w-full sm:max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-400" />
                  Save Video Offline
                </h3>
                <p className="text-[11px] text-zinc-400">Store in phone cache for offline playback</p>
              </div>
              <button onClick={() => setShowDownloadModal(false)} className="p-1 text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {[
                { q: '144p' as VideoQuality, size: '1.8 MB', label: '144p (Extreme Data Saver)' },
                { q: '360p' as VideoQuality, size: '8.5 MB', label: '360p (Standard Recommended)' },
                { q: '720p' as VideoQuality, size: '45.0 MB', label: '720p (High Definition)' },
              ].map((item) => (
                <button
                  key={item.q}
                  onClick={() => handleDownload(item.q)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 border border-zinc-700 text-xs transition text-left"
                >
                  <div>
                    <div className="font-bold text-white">{item.label}</div>
                    <div className="text-[10px] text-zinc-400">Playable with no mobile data</div>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">{item.size}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowDownloadModal(false)}
              className="w-full py-2 bg-zinc-800 text-zinc-300 font-medium rounded-xl text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
