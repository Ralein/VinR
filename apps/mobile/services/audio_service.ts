import { Platform, NativeModules } from 'react-native';

class AudioService {
    private recording: any = null;
    private isRecording: boolean = false;
    private AudioModule: any = null;

    private async getAudio(): Promise<any> {
        if (this.AudioModule) return this.AudioModule;
        
        try {
            // In Expo SDK 55, modules are more robust and may not always appear in NativeModules
            const { Audio } = await import('expo-av');
            this.AudioModule = Audio;
            return Audio;
        } catch (e) {
            console.warn('Audio not available in this environment');
            return null;
        }
    }

    async requestPermissions(): Promise<boolean> {
        try {
            const Audio = await this.getAudio();
            if (!Audio) return false;

            const { status } = await Audio.requestPermissionsAsync();
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
            const Audio = await this.getAudio();
            if (!Audio || this.isRecording) return false;

            // Prepare audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                staysActiveInBackground: false,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            
            this.recording = recording;
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
            const Audio = await this.getAudio();
            if (!Audio || !this.recording) return null;

            this.isRecording = false;
            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();
            this.recording = null;
            
            // Restore audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
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
            if (!this.recording) return;

            this.isRecording = false;
            await this.recording.stopAndUnloadAsync();
            this.recording = null;
        } catch (error) {
            console.error('Failed to cancel recording:', error);
        }
    }

    async transcribeAudio(uri: string): Promise<string> {
        console.log('Transcribing audio from:', uri);
        // Mock transcription for now
        return 'I feel a bit overwhelmed today.';
    }

    async playRecording(uri: string): Promise<void> {
        console.log('Playing recording from:', uri);
        const Audio = await this.getAudio();
        if (!Audio) return;
        
        const { sound } = await Audio.Sound.createAsync({ uri });
        await sound.playAsync();
    }
}

export default new AudioService();
