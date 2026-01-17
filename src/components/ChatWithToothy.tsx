import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Volume2,
  Loader2,
  Sparkles,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import toothyMascot from "@/assets/toothy-mascot.png";

interface ChatWithToothyProps {
  isOpen: boolean;
  onClose: () => void;
}

// Audio utilities
class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = this.createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer.slice(0) as ArrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error("Error playing audio:", error);
      this.playNext();
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    
    return wavArray;
  }

  clear() {
    this.queue = [];
    this.isPlaying = false;
  }
}

// Audio recording utilities
const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

const ChatWithToothy = ({ isOpen, onClose }: ChatWithToothyProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [agentResponse, setAgentResponse] = useState("");
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionCreatedRef = useRef(false);

  const cleanup = useCallback(() => {
    console.log("Cleaning up...");
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioQueueRef.current) {
      audioQueueRef.current.clear();
    }
    
    sessionCreatedRef.current = false;
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
    return cleanup;
  }, [isOpen, cleanup]);

  const startConversation = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setTranscript("");
    setAgentResponse("");

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      // Create audio context for playback
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);

      // Connect to our edge function WebSocket
      const wsUrl = `wss://xaqfvjcmtbhdnaasqbyd.functions.supabase.co/openai-realtime`;
      console.log("Connecting to WebSocket:", wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setIsConnecting(false);
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received:", data.type);

          switch (data.type) {
            case "session.created":
              console.log("Session created, sending configuration...");
              sessionCreatedRef.current = true;
              
              // Send session update with Toothy's personality
              ws.send(JSON.stringify({
                type: "session.update",
                session: {
                  modalities: ["text", "audio"],
                  instructions: `You are Toothy, a friendly and enthusiastic tooth mascot who loves helping children learn about dental health! You speak in a cheerful, kid-friendly way and make dental care fun and exciting.

Your personality:
- Super friendly and encouraging
- Use simple words that kids can understand
- Make brushing and flossing sound like an adventure
- Give lots of praise and positive reinforcement
- Answer questions about teeth, brushing, flossing, and healthy foods
- Use fun metaphors like "sugar bugs" for bacteria and "tooth heroes" for kids who brush well
- Keep responses short and engaging (2-3 sentences max)
- Sometimes use sound effects like "whoooosh!" or "sparkle sparkle!"

Remember: You're talking to children ages 3-9, so be gentle, patient, and super encouraging!`,
                  voice: "shimmer",
                  input_audio_format: "pcm16",
                  output_audio_format: "pcm16",
                  input_audio_transcription: {
                    model: "whisper-1"
                  },
                  turn_detection: {
                    type: "server_vad",
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 1000
                  },
                  temperature: 0.8,
                  max_response_output_tokens: 150
                }
              }));
              
              // Start recording after session is configured
              startRecording();
              break;

            case "session.updated":
              console.log("Session updated successfully");
              break;

            case "response.audio.delta":
              if (data.delta) {
                setIsSpeaking(true);
                const binaryString = atob(data.delta);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                await audioQueueRef.current?.addToQueue(bytes);
              }
              break;

            case "response.audio.done":
              setIsSpeaking(false);
              break;

            case "response.audio_transcript.delta":
              if (data.delta) {
                setAgentResponse(prev => prev + data.delta);
              }
              break;

            case "response.audio_transcript.done":
              break;

            case "conversation.item.input_audio_transcription.completed":
              if (data.transcript) {
                setTranscript(data.transcript);
              }
              break;

            case "input_audio_buffer.speech_started":
              setIsListening(true);
              setAgentResponse("");
              break;

            case "input_audio_buffer.speech_stopped":
              setIsListening(false);
              break;

            case "error":
              console.error("OpenAI error:", data.error);
              toast.error("Oops! Toothy had a hiccup. Try again!");
              break;
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("Connection error. Please try again.");
        cleanup();
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        cleanup();
      };

    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Could not access microphone. Please allow microphone access.");
      cleanup();
    }
  }, [isConnecting, isConnected, cleanup]);

  const startRecording = useCallback(() => {
    if (!streamRef.current || !audioContextRef.current || !wsRef.current) return;

    console.log("Starting audio recording...");
    
    const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
    const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      if (wsRef.current?.readyState === WebSocket.OPEN && sessionCreatedRef.current) {
        const inputData = e.inputBuffer.getChannelData(0);
        const encoded = encodeAudioForAPI(new Float32Array(inputData));
        wsRef.current.send(JSON.stringify({
          type: "input_audio_buffer.append",
          audio: encoded
        }));
      }
    };

    source.connect(processor);
    processor.connect(audioContextRef.current.destination);
    
    sourceRef.current = source;
    processorRef.current = processor;
  }, []);

  const endConversation = useCallback(() => {
    cleanup();
    toast.success("Great chatting with you! See you next time! 🦷");
  }, [cleanup]);

  const handleClose = useCallback(() => {
    cleanup();
    onClose();
  }, [cleanup, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-gradient-to-b from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-display">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span>💬 Chat with Toothy!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Toothy Avatar */}
          <div className="flex justify-center">
            <motion.div
              animate={isSpeaking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ repeat: isSpeaking ? Infinity : 0, duration: 0.5 }}
              className="relative"
            >
              <img 
                src={toothyMascot} 
                alt="Toothy" 
                className="w-32 h-32 object-contain"
              />
              {isSpeaking && (
                <div className="absolute -top-2 -right-2">
                  <Volume2 className="w-6 h-6 text-blue-500 animate-pulse" />
                </div>
              )}
              {isListening && (
                <div className="absolute -top-2 -right-2">
                  <Mic className="w-6 h-6 text-green-500 animate-pulse" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Status */}
          <div className="text-center">
            <AnimatePresence mode="wait">
              {isConnecting ? (
                <motion.div
                  key="connecting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 text-muted-foreground"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Toothy is waking up...</span>
                </motion.div>
              ) : isConnected ? (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">
                      {isSpeaking ? "Toothy is talking..." : isListening ? "Toothy is listening..." : "Say something to Toothy!"}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="disconnected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-muted-foreground"
                >
                  <p>Press the button to start talking with Toothy!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Transcript Display */}
          {(transcript || agentResponse) && (
            <div className="space-y-3">
              {transcript && (
                <div className="bg-blue-100 dark:bg-blue-900/50 rounded-xl p-3">
                  <p className="text-sm text-muted-foreground mb-1">You said:</p>
                  <p className="text-foreground">{transcript}</p>
                </div>
              )}
              {agentResponse && (
                <div className="bg-cyan-100 dark:bg-cyan-900/50 rounded-xl p-3">
                  <p className="text-sm text-muted-foreground mb-1">Toothy says:</p>
                  <p className="text-foreground">{agentResponse}</p>
                </div>
              )}
            </div>
          )}

          {/* Control Button */}
          <div className="flex justify-center">
            {!isConnected ? (
              <Button
                size="lg"
                onClick={startConversation}
                disabled={isConnecting}
                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-6 text-lg rounded-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="w-6 h-6" />
                    Talk to Toothy!
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                onClick={endConversation}
                className="gap-2 px-8 py-6 text-lg rounded-full"
              >
                <PhoneOff className="w-6 h-6" />
                End Chat
              </Button>
            )}
          </div>

          {/* Tips */}
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              🎤 <strong>Tip:</strong> Ask Toothy about brushing, flossing, healthy snacks, or anything about your teeth!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatWithToothy;
