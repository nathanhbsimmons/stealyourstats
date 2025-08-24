import { RealTimeBpmAnalyzer } from 'realtime-bpm-analyzer'

export interface BpmEstimationResult {
  bpm: number
  confidence: number
  duration: number
}

export class BpmEstimator {
  private analyzer: RealTimeBpmAnalyzer
  private audioContext: AudioContext | null = null
  private mediaSource: MediaElementAudioSourceNode | null = null
  private processor: ScriptProcessorNode | null = null
  private isAnalyzing = false

  constructor() {
    this.analyzer = new RealTimeBpmAnalyzer({
      debug: false,
      minValidThreshold: 0.3,
      peakThreshold: 0.9,
      maxPeaks: 30,
      realTimeTrigger: {
        threshold: 0.3,
        debounceTime: 1000,
        minPeaks: 30
      }
    })
  }

  async estimateBpm(audioElement: HTMLAudioElement, durationSeconds: number = 60): Promise<BpmEstimationResult> {
    if (this.isAnalyzing) {
      throw new Error('BPM analysis already in progress')
    }

    this.isAnalyzing = true

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create media source from audio element
      this.mediaSource = this.audioContext.createMediaElementSource(audioElement)
      
      // Create script processor for audio analysis
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)
      
      // Connect audio nodes
      this.mediaSource.connect(this.processor)
      this.processor.connect(this.audioContext.destination)
      
      // Set up audio processing
      const audioData: number[] = []
      let startTime = Date.now()
      
      return new Promise((resolve, reject) => {
        this.processor!.onaudioprocess = (event) => {
          const inputBuffer = event.inputBuffer
          const inputData = inputBuffer.getChannelData(0)
          
          // Convert float32 to int16 for the analyzer
          const int16Data = new Int16Array(inputData.length)
          for (let i = 0; i < inputData.length; i++) {
            int16Data[i] = inputData[i] * 0x7FFF
          }
          
          // Add data to analyzer
          this.analyzer.analyze(int16Data)
          
          // Store audio data for analysis
          audioData.push(...Array.from(inputData))
          
          // Check if we have enough data or time has elapsed
          const elapsed = (Date.now() - startTime) / 1000
          if (elapsed >= durationSeconds || audioData.length >= 44100 * durationSeconds) {
            this.stopAnalysis()
            
            // Get BPM results
            const results = this.analyzer.getValidBpm()
            if (results && results.length > 0) {
              // Sort by confidence and return the best result
              const bestResult = results.sort((a, b) => b.confidence - a.confidence)[0]
              resolve({
                bpm: bestResult.bpm,
                confidence: bestResult.confidence,
                duration: elapsed
              })
            } else {
              reject(new Error('No BPM detected in audio sample'))
            }
          }
        }
        
        // Start playing audio
        audioElement.currentTime = 0
        audioElement.play().catch(reject)
        
        // Set a timeout to stop analysis if it takes too long
        setTimeout(() => {
          if (this.isAnalyzing) {
            this.stopAnalysis()
            reject(new Error('BPM analysis timeout'))
          }
        }, (durationSeconds + 5) * 1000)
      })
      
    } catch (error) {
      this.isAnalyzing = false
      throw error
    }
  }

  private stopAnalysis() {
    this.isAnalyzing = false
    
    if (this.processor) {
      this.processor.disconnect()
      this.processor = null
    }
    
    if (this.mediaSource) {
      this.mediaSource.disconnect()
      this.mediaSource = null
    }
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }

  // Alternative method using a pre-recorded audio buffer
  async estimateBpmFromBuffer(audioBuffer: AudioBuffer): Promise<BpmEstimationResult> {
    try {
      const channelData = audioBuffer.getChannelData(0)
      const int16Data = new Int16Array(channelData.length)
      
      // Convert float32 to int16
      for (let i = 0; i < channelData.length; i++) {
        int16Data[i] = channelData[i] * 0x7FFF
      }
      
      // Analyze the buffer
      this.analyzer.analyze(int16Data)
      
      const results = this.analyzer.getValidBpm()
      if (results && results.length > 0) {
        const bestResult = results.sort((a, b) => b.confidence - a.confidence)[0]
        return {
          bpm: bestResult.bpm,
          confidence: bestResult.confidence,
          duration: audioBuffer.duration
        }
      } else {
        throw new Error('No BPM detected in audio buffer')
      }
    } catch (error) {
      throw new Error(`BPM estimation failed: ${error}`)
    }
  }

  // Utility method to get audio buffer from URL
  async getAudioBufferFromUrl(url: string): Promise<AudioBuffer> {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    return await audioContext.decodeAudioData(arrayBuffer)
  }

  // Clean up resources
  destroy() {
    this.stopAnalysis()
    this.analyzer = null as any
  }
}

// Singleton instance
export const bpmEstimator = new BpmEstimator()
