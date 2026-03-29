import { Platform } from 'react-native';
import { 
    AudioModule, 
    RecordingPresets, 
    createAudioPlayer, 
    setAudioModeAsync, 
    requestRecordingPermissionsAsync,
    type AudioPlayer,
    type AudioRecorder
} from 'expo-audio';

class AudioService {
    private recorder: AudioRecorder | null = null;
    private player: AudioPlayer | null = null;
    private isRecording: boolean = false;

    async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await requestRecordingPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Microphone permission not granted');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting mic permissions:', error);
            return false;
        }
    }

    async startRecording(): Promise<boolean> {
        try {
            if (this.isRecording) return false;

            // Configure global audio mode for recording
            await setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
                interruptionMode: 'duckOthers',
            });

            // Create recorder using AudioModule.AudioRecorder class
            // Note: In SDK 55, AudioModule provides the class constructor
            this.recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
            
            // Prepare and record
            await this.recorder.prepareToRecordAsync();
            this.recorder.record();
            
            this.isRecording = true;
            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.isRecording = false;
            return false;
        }
    }

    async stopRecording(): Promise<string | null> {
        try {
            if (!this.recorder || !this.isRecording) return null;

            this.isRecording = false;
            await this.recorder.stop();
            const uri = this.recorder.uri;
            
            // Clean up recorder
            this.recorder = null;
            
            // Restore audio mode (disable recording)
            await setAudioModeAsync({
                allowsRecording: false,
                playsInSilentMode: true,
            });

            return uri;
        } catch (error) {
            console.error('Failed to stop recording:', error);
            this.isRecording = false;
            return null;
        }
    }

    async cancelRecording(): Promise<void> {
        try {
            if (!this.recorder) return;

            this.isRecording = false;
            await this.recorder.stop();
            this.recorder = null;

            await setAudioModeAsync({
                allowsRecording: false,
                playsInSilentMode: true,
            });
        } catch (error) {
            console.error('Failed to cancel recording:', error);
        }
    }

    async transcribeAudio(uri: string): Promise<string> {
        console.log('Transcribing audio from:', uri);
        // This would typically involve a call to a whisper service / backend
        return 'I feel a bit overwhelmed today.';
    }

    async playRecording(uri: string): Promise<void> {
        console.log('Playing recording from:', uri);
        try {
            // Create a player instance using correctly exported factory
            if (this.player) {
                this.player.remove();
            }
            
            this.player = createAudioPlayer(uri);
            this.player.play();
        } catch (error) {
            console.error('Failed to play recording:', error);
        }
    }
}

export default new AudioService();
