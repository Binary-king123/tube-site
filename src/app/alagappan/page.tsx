"use client";

import { useState } from "react";
import { addVideo } from "./actions";
import { 
  Upload,
  ListOrdered, 
  PlayCircle, 
  Image as ImageIcon, 
  SkipForward, 
  CheckCircle2, 
  Loader2,
  Wand2
} from "lucide-react";

type QueuedVideo = {
  id: string;
  sourceUrl: string;       // The MP4 URL
  thumbnailUrl: string;    // The JPG URL
  suggestedTitle: string;
};

export default function QueueUploaderPage() {
  // Phase state: "input" | "queue" | "done"
  const [phase, setPhase] = useState<"input" | "queue" | "done">("input");
  
  // Raw Input
  const [rawText, setRawText] = useState("");
  
  // Parsed Queue
  const [queue, setQueue] = useState<QueuedVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Form State for current active video
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [generatingThumb, setGeneratingThumb] = useState(false);
  const [message, setMessage] = useState("");

  const parseText = () => {
    setMessage("");
    if (!rawText.trim()) {
      setMessage("❌ Please paste some URLs first.");
      return;
    }

    // Split raw text into tokens
    const lines = rawText.split(/\s+/).filter(Boolean);
    
    // Find MP4s and JPGs
    const mp4s = lines.filter(l => l.toLowerCase().endsWith(".mp4"));
    const jpgs = lines.filter(l => l.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/));

    if (mp4s.length === 0) {
      setMessage("❌ No .mp4 URLs found in the text.");
      return;
    }

    const newQueue: QueuedVideo[] = [];
    
    for (let i = 0; i < mp4s.length; i++) {
        // Try to match the closest JPG based on the filename stem
        const mp4Url = mp4s[i];
        
        // Extract "Sexy-College-Desi-Girl" from "https://.../Sexy-College-Desi-Girl.mp4"
        const stemMatch = mp4Url.match(/\/([^/]+)\.mp4$/i);
        const stem = stemMatch ? stemMatch[1] : `video-${i}`;
        
        // Generate a human readable title
        const suggestedTitle = stem.replace(/[-_]/g, " ");

        // Best effort image matching: 
        // 1. Image with exact same stem 
        // 2. Or just take the image at index i if available
        let assignedJpg = jpgs.find(j => j.includes(stem));
        if (!assignedJpg && jpgs[i]) assignedJpg = jpgs[i];
        if (!assignedJpg) assignedJpg = ""; // Fallback

        newQueue.push({
            id: crypto.randomUUID(),
            sourceUrl: mp4Url,
            thumbnailUrl: assignedJpg,
            suggestedTitle: suggestedTitle
        });
    }

    if (newQueue.length > 0) {
      setQueue(newQueue);
      setCurrentIndex(0);
      populateForm(newQueue[0]);
      setPhase("queue");
    }
  };

  const populateForm = (video: QueuedVideo) => {
      setTitle(video.suggestedTitle);
      
      // Auto-generate slug
      const generatedSlug = video.suggestedTitle
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "-");
      setSlug(generatedSlug);
      
      setCategory("");
      setTags("");
      setMessage("");
  };

  const nextVideo = () => {
      if (currentIndex + 1 < queue.length) {
          const nextIdx = currentIndex + 1;
          setCurrentIndex(nextIdx);
          populateForm(queue[nextIdx]);
      } else {
          setPhase("done");
      }
  };

  const handleSkip = () => {
      nextVideo();
  };

  const handlePublish = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");

      const activeVideo = queue[currentIndex];

      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("embedUrl", activeVideo.sourceUrl);
      formData.append("thumbnail", activeVideo.thumbnailUrl);
      if (category) formData.append("category", category);
      if (tags) formData.append("tags", tags);

      const result = await addVideo(formData);

      if (result.error) {
          setMessage(`❌ Error: ${result.error}`);
          setLoading(false);
      } else {
          setLoading(false);
          nextVideo();
      }
  };

  const handleGenerateThumbnail = async () => {
      const activeVideo = queue[currentIndex];
      if (!activeVideo?.sourceUrl) return;

      setGeneratingThumb(true);
      setMessage("");

      try {
          const res = await fetch("/api/generate-thumbnail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ targetUrl: activeVideo.sourceUrl }),
          });
          const data = await res.json();

          if (data.success && data.thumbnailUrl) {
              // Update the specific item in the queue
              setQueue((prevQueue) => {
                  const newQueue = [...prevQueue];
                  newQueue[currentIndex] = { ...newQueue[currentIndex], thumbnailUrl: data.thumbnailUrl };
                  return newQueue;
              });
              setMessage("✅ Thumbnail generated from video!");
          } else {
              setMessage(`❌ Failed to auto-generate: ${data.error || "Unknown error"}`);
          }
      } catch (error: any) {
          setMessage(`❌ Generation API error: ${error.message}`);
      } finally {
          setGeneratingThumb(false);
      }
  };

  const inputClass = "rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all w-full";
  const labelClass = "text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5";

  return (
    <div className="mx-auto max-w-4xl py-10 pb-20">
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex flex-col gap-2">
              <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                  <ListOrdered className="h-7 w-7 text-primary" />
                  Admin — Queue Uploader
              </h1>
              <p className="text-sm text-gray-500">Paste mixed `.mp4` and `.jpg` URLs. The system will pair them and queue them up for rapid tagging.</p>
          </div>
          <a href="/alagappan/bulk" className="flex items-center justify-center gap-2 rounded-md bg-[#1a1a1a] border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5 transition-colors">
              <Upload className="h-4 w-4 text-primary" />
              Old Bulk CSV
          </a>
      </div>

      {phase === "input" && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col gap-2">
                  <label className={labelClass}>Paste Raw URLs (Videos & Images)</label>
                  <textarea 
                      value={rawText}
                      onChange={e => setRawText(e.target.value)}
                      placeholder={"https://cdn.../video1.mp4\nhttps://cdn.../image1.jpg\n\nhttps://cdn.../video2.mp4"}
                      className="min-h-[300px] resize-y rounded-xl border border-white/10 bg-[#121212] p-5 text-sm font-mono text-gray-300 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent leading-relaxed"
                  />
              </div>

              <div className="flex items-center justify-between">
                  {message ? (
                      <span className="text-sm text-red-400 font-medium">{message}</span>
                  ) : <span />}
                  
                  <button 
                      onClick={parseText}
                      className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20"
                  >
                      <ListOrdered className="h-4 w-4" />
                      Build Processing Queue
                  </button>
              </div>
          </div>
      )}

      {phase === "queue" && queue[currentIndex] && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Progress Bar */}
              <div className="mb-6 flex items-center justify-between bg-[#1a1a1a] p-4 rounded-lg border border-white/10">
                  <span className="text-sm font-bold text-gray-300">
                      Processing Item <span className="text-primary">{currentIndex + 1}</span> of {queue.length}
                  </span>
                  <div className="flex gap-1">
                      {queue.map((_, idx) => (
                          <div key={idx} className={`h-2 w-8 rounded-full ${idx < currentIndex ? 'bg-primary/40' : idx === currentIndex ? 'bg-primary' : 'bg-white/10'}`} />
                      ))}
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* Left Column: Media Preview */}
                  <div className="flex flex-col gap-4 bg-[#141414] p-5 rounded-xl border border-white/10">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-3 flex justify-between items-center">
                          Detected Media
                          <button
                              type="button"
                              onClick={handleGenerateThumbnail}
                              disabled={generatingThumb || !queue[currentIndex].sourceUrl}
                              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white px-2 py-1 rounded text-[10px] transition-colors disabled:opacity-50"
                          >
                              {generatingThumb ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>}
                              GENERATE FROM VIDEO
                          </button>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/40 p-3 rounded-md break-all">
                              <ImageIcon className="h-4 w-4 text-green-400 shrink-0" />
                              {queue[currentIndex].thumbnailUrl || "⚠️ No thumbnail matched"}
                          </div>
                      </div>

                      {queue[currentIndex].thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                              src={queue[currentIndex].thumbnailUrl.startsWith("http") ? `/api/proxy-image?url=${encodeURIComponent(queue[currentIndex].thumbnailUrl)}` : queue[currentIndex].thumbnailUrl} 
                              alt="Detected thumbnail" 
                              className="w-full aspect-video object-cover rounded-lg shadow-lg border border-white/5 bg-black"
                          />
                      ) : (
                          <div className="w-full aspect-video rounded-lg border border-dashed border-white/20 bg-black/50 flex items-center justify-center text-gray-600 text-sm">
                              No image URL provided
                          </div>
                      )}

                      <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/40 p-3 rounded-md break-all mt-2">
                              <PlayCircle className="h-4 w-4 text-blue-400 shrink-0" />
                              {queue[currentIndex].sourceUrl}
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Data Entry */}
                  <div className="bg-[#141414] p-6 rounded-xl border border-primary/20 shadow-xl shadow-primary/5">
                      <form onSubmit={handlePublish} className="flex flex-col gap-5">
                          
                          <div className="flex flex-col gap-1">
                              <label htmlFor="title" className={labelClass}>Generated Title *</label>
                              <input required type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
                          </div>

                          <div className="flex flex-col gap-1">
                              <label htmlFor="slug" className={labelClass}>URL Slug *</label>
                              <input required type="text" id="slug" value={slug} onChange={e => setSlug(e.target.value)} className={inputClass} />
                          </div>

                          <div className="flex flex-col gap-1 mt-2 border-t border-white/5 pt-4">
                              <label htmlFor="category" className={labelClass}>Category (Optional)</label>
                              <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Amateur" className={inputClass} />
                          </div>

                          <div className="flex flex-col gap-1">
                              <label htmlFor="tags" className={labelClass}>Tags (Optional, Comma separated)</label>
                              <input type="text" id="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. desi, amateur, college" className={inputClass} />
                          </div>

                          {message && (
                              <div className="text-sm font-medium text-red-400 bg-red-900/20 p-3 rounded-md">
                                  {message}
                              </div>
                          )}

                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                              <button 
                                  type="button"
                                  onClick={handleSkip}
                                  disabled={loading}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-[#222] text-gray-300 text-sm font-semibold hover:bg-[#333] transition-colors disabled:opacity-50"
                              >
                                  <SkipForward className="w-4 h-4" />
                                  Skip Video
                              </button>
                              
                              <button 
                                  type="submit"
                                  disabled={loading}
                                  className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-primary text-white text-sm font-bold hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                              >
                                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                  {loading ? "Publishing..." : "Publish & Next"}
                              </button>
                          </div>

                      </form>
                  </div>

              </div>
          </div>
      )}

      {phase === "done" && (
          <div className="flex flex-col items-center justify-center text-center gap-4 py-20 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Queue Completed!</h2>
              <p className="text-gray-400 max-w-md">
                  All {queue.length} videos have been successfully processed through the queue.
              </p>
              <button 
                  onClick={() => {
                      setRawText("");
                      setQueue([]);
                      setPhase("input");
                  }}
                  className="mt-6 px-8 py-3 bg-[#1a1a1a] text-white border border-white/10 rounded-md font-semibold hover:bg-white/5 transition-colors"
              >
                  Start New Bulk Queue
              </button>
          </div>
      )}

    </div>
  );
}
