import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Brain, Sparkles, TrendingUp, CheckCircle2, Youtube } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import ScriptOrAudioUploader from './ScriptOrAudioUploader';
import VideoUploader from './VideoUploader';
import AdvancedRecapSettings from './AdvancedRecapSettings';
import ProcessingStatus from './ProcessingStatus';
import ResultsSection from './ResultsSection';
import { aiLearningService } from '../services/aiLearningService';
import { supabaseService } from '../lib/supabaseClient';
import type { VideoFile, AudioFile, ScriptFile, ProcessingStatus as ProcessingStatusType, RecapOutput } from '../types';

interface AdvancedHomePageProps {
  apiKey: string;
}

type RecapStep = 'uploadScriptAudio' | 'uploadVideo' | 'configureRecap';

const AdvancedHomePage = ({ apiKey }: AdvancedHomePageProps) => {
  const [step, setStep] = useState<RecapStep>('uploadScriptAudio');

  const [selectedAudioFile, setSelectedAudioFile] = useState<AudioFile | null>(null);
  const [submittedScript, setSubmittedScript] = useState<string | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<VideoFile | null>(null);
  
  const [settings, setSettings] = useState({
    duration: 240, // 4 minutes
    intervalSeconds: 9,
    captureSeconds: 1,
    title: 'Siren (2018) Season 1 Episode 1 TV Show Recap',
    genre: 'scifi',
    description: `recap of Siren (2018) — Season 1, Episode 1: “The Mermaid Discovery”. (Spoilers ahead.)\n\n---\n\nSetting & Key Characters\n\nThe show is set in Bristol Cove, a coastal town with a long history of mermaid legends. \n\nBen Pownall (Alex Roe) and Maddie Bishop (Fola Evans-Akingbola) are marine biologists. \n\nXander McClure (Ian Verdun) is a local fisherman who’s skeptical and haunted by things he’s seen at sea. \n\nRyn (Eline Powell) is the mysterious girl who arrives on shore — later revealed to be a mermaid. \n\nHelen Hawkins (Rena Owen) is a town local with deep knowledge of the mermaid lore. \n\n---\n\nPlot Summary\n\n1. Danger at Sea\n\nThe episode opens in the Bering Strait, where a fishing crew hauls up their nets during a violent storm. \n\nTo their horror, they catch something much larger than fish — a creature that lashes out, mortally wounding one fisherman (Chris). \n\nAs they try to deal with their injured crew member, military SEALs arrive, rope in, and forcibly take away the creature in a large metal container. \n\n2. Bristol Cove’s Turbulent Calm\n\nMeanwhile in Bristol Cove, the townsfolk are preparing for a celebration called Mermaid Days, honoring their history and myths around mermaids. \n\nBen and Maddie meet to discuss the strange incident: the fishermen report something terrifying, but Ben is skeptical. He doesn\'t immediately accept that “mermaids” are real in the way people imagine. \n\nLocal fisherman Xander is also shaken — he wonders if there really is something “predatory” beneath the waves. \n\n3. Ryn’s Arrival\n\nOne night, Ben drives home and nearly hits a young, naked woman walking down the road. He helps her, brings her into his home. \n\nThe girl (Ryn) is disoriented, silent — but clearly not just a human. She sings a haunting, ethereal song (her “siren song”) that deeply unsettles Ben. \n\nBen takes her to Dr. Abbott for help. But when he looks for her later, she’s gone. \n\n4. Revelation & Conflict\n\nThe military’s containment of the creature is confirmed: they have a form in a tank, and high-ranking officers (like Admiral Harrison) are brought in to inspect. \n\nThe creature is mermaid-like in form, but not human — sharp teeth, scaled skin. Her physiology is alien. \n\nBen, stirred by his encounter with Ryn and haunted by the fisherman’s reports, reaches out to Helen Hawkins — someone in town who has long believed in the legends. \n\nIn a climactic scene, Ben dives into the water (following what he saw on cameras) and comes face-to-face with Ryn in her mermaid form. She attacks him underwater, thrashing with strength and ferocity. \n\n5. Aftermath & Questions\n\nRyn escapes back to the sea, leaving Ben shaken and uncertain. \n\nBen and Maddie realize the legends of mermaids might be more than folklore — and that “predatory” mermaids could pose real danger. \n\nHelen reveals she knows more than she’s let on about mermaids in Bristol Cove, suggesting there’s a hidden history and possibly more “siren songs” to come. \n\n---\n\nThemes & Key Observations\n\nLegend vs Reality: Siren immediately blurs the line between myth (mermaids) and a scientifically plausible, predator-like creature.\n\nDanger & Seduction: Ryn’s “siren song” is not just beautiful — it’s dangerous and hypnotic, drawing Ben into her world.\n\nHuman Hubris: The fishermen’s capture of the creature and the military’s involvement suggest humans are not treating these beings with the respect or fear they deserve.\n\nIsolation & Belonging: Ryn clearly doesn’t belong to the human world; her arrival is jarring, and she doesn’t know how to communicate well. Her attack underscores that she is wild, not tame.\n\nHidden Knowledge: Helen represents the town’s deep memory, the old belief-system. Her knowledge suggests that mermaids (or sirens) have been part of Bristol Cove’s identity for generations.\n\n---\n\nMy Take / Summary Thoughts\n\nThe pilot of Siren does an excellent job of launching a dark, mysterious mythology. Rather than go dreamy or romantic with the mermaid trope, it leans into horror and danger. Ryn is not a fairy tale mermaid — she’s a predator, something deeply alien. Ben’s journey from skeptic to believer is compelling, and the show plants a lot of questions: Who is Ryn really? What does she want? Why has she come ashore? And what will the human world do when confronted with her kind?`,
    youtubeChannelId: '',
    enableWebSearch: true,
    enableYoutubeLearning: true
  });
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusType | null>(null);
  const [recapOutput, setRecapOutput] = useState<RecapOutput | null>(null);
  const [learningInsights, setLearningInsights] = useState<string[]>([]);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    aiLearningService.loadLearningData();
  }, []);

  useEffect(() => {
    if (settings.genre) {
      const optimal = aiLearningService.getOptimalSettings(settings.genre);
      if (optimal.clipDuration && optimal.intervalPattern) {
        const insight = `AI ממליץ: מרווח של ${optimal.intervalPattern} שניות לז\'אנר ${settings.genre}`;
        setLearningInsights([insight]);
      }
    }
  }, [settings.genre]);

  const handleScriptOrAudioSelect = (file: AudioFile | ScriptFile) => {
    if (file.type.startsWith('audio')) {
        setSelectedAudioFile(file as AudioFile);
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setSubmittedScript(text);
            setStep('uploadVideo');
        };
        reader.readAsText(file.file);
    }
    setStep('uploadVideo');
  };

  const handleTextSubmit = (text: string) => {
    setSubmittedScript(text);
    setStep('uploadVideo');
  };

  const handleVideoSelect = (file: VideoFile) => {
    setSelectedVideoFile(file);
    setStep('configureRecap');
  };

  const handleCreateRecap = async () => {
    if (!selectedVideoFile || (!submittedScript && !selectedAudioFile)) {
        alert('Please provide a script or audio file, and a video file.');
        return;
    }
    if (!apiKey) {
        alert('Please enter your Gemini AI API key.');
        return;
    }

    setRecapOutput(null);
    setProcessingStatus({ stage: 'loading_engine', progress: 0, message: 'Preparing for advanced recap...' });

    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => { console.log(message); });

    try {
        setProcessingStatus({ stage: 'loading_engine', progress: 10, message: 'Loading advanced media engine...' });

        if (!ffmpeg.loaded) {
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
        }

        let generatedScript = submittedScript || '';

        if (selectedAudioFile) {
            setProcessingStatus({ stage: 'generating_script', progress: 20, message: 'Transcribing audio to script...' });
            // Placeholder for audio transcription
            generatedScript = `(Transcription of ${selectedAudioFile.name})`; 
        }

        if (!generatedScript) {
             generatedScript = await aiLearningService.generateEnhancedScript(settings.description, null, [], apiKey);
        }

        setProcessingStatus({ stage: 'cutting_video', progress: 40, message: 'Processing video...' });

        await ffmpeg.writeFile(selectedVideoFile.name, await fetchFile(selectedVideoFile.file));

        const outputFileName = 'advanced_recap.mp4';
        const selectFilter = `select='lt(mod(t,${settings.intervalSeconds}),${settings.captureSeconds})',setpts=N/FRAME_RATE/TB`;

        await ffmpeg.exec([
            '-i', selectedVideoFile.name,
            '-vf', selectFilter,
            '-an',
            '-t', `${settings.duration}`,
            '-y',
            outputFileName
        ]);

        const data = await ffmpeg.readFile(outputFileName);
        const mediaUrl = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: 'video/mp4' }));

        setRecapOutput({
            videoUrl: mediaUrl,
            script: generatedScript,
        });

        setProcessingStatus({ stage: 'completed', progress: 100, message: 'Advanced recap created successfully!' });

        await ffmpeg.deleteFile(selectedVideoFile.name);
        await ffmpeg.deleteFile(outputFileName);

    } catch (error) {
        console.error("Error during advanced recap creation:", error);
        setProcessingStatus({ stage: 'error', progress: 0, message: 'An unknown error occurred.' });
    }
  };

  const isProcessing = !!(processingStatus && processingStatus.stage !== 'completed' && processingStatus.stage !== 'error');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <section className="py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            יוצר סיכומים חכם עם AI
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            תהליך חדשני ליצירת סיכומים מבוססי AI בשלבים.
          </p>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {step === 'uploadScriptAudio' && (
              <ScriptOrAudioUploader 
                onFileSelect={handleScriptOrAudioSelect}
                onTextSubmit={handleTextSubmit}
                selectedFile={selectedAudioFile}
                onRemoveFile={() => setSelectedAudioFile(null)}
              />
            )}

            {step === 'uploadVideo' && (
              <VideoUploader 
                onVideoSelect={handleVideoSelect} 
                selectedVideo={selectedVideoFile} 
                onRemoveVideo={() => setSelectedVideoFile(null)}
              />
            )}

            {step === 'configureRecap' && (
                <div>
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                        <h4 className="text-lg font-semibold text-white mb-2">הקלט שהוזן:</h4>
                        {submittedScript && <p className="text-gray-300 text-sm">- סקריפט טקסטואלי</p>}
                        {selectedAudioFile && <p className="text-gray-300 text-sm">- קובץ שמע: {selectedAudioFile.name}</p>}
                        {selectedVideoFile && <p className="text-gray-300 text-sm">- קובץ וידאו: {selectedVideoFile.name}</p>}
                    </div>
                    <AdvancedRecapSettings settings={settings} onSettingsChange={setSettings} />
                </div>
            )}
            
            {step === 'configureRecap' && (
                <motion.button
                onClick={handleCreateRecap}
                disabled={!selectedVideoFile || !apiKey || isProcessing}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                    (selectedVideoFile && apiKey && !isProcessing)
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                >
                <Play className="inline-block h-5 w-5 ml-2" />
                {isProcessing ? 'מעבד עם AI...' : 'צור סיכום חכם'}
                </motion.button>
            )}

          </div>

          <div className="space-y-6">
             {processingStatus && <ProcessingStatus status={processingStatus} />}
             {recapOutput && <ResultsSection output={recapOutput} />}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdvancedHomePage;
