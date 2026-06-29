import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

export function useAgora() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [error, setError] = useState(null);

  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);

  // Initialize Agora Client
  const initClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }
    return clientRef.current;
  }, []);

  const joinChannel = useCallback(async (appId, channelName, token, uid) => {
    try {
      setError(null);
      const client = initClient();

      // Prevent joining if already connected/connecting
      if (client.connectionState === 'CONNECTED' || client.connectionState === 'CONNECTING') {
        console.warn('[Agora Hook] Already connected or connecting. Skipping join call.');
        setIsConnected(true);
        return;
      }

      // Listen for remote users publishing audio
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          user.audioTrack?.play();
          setRemoteUsers((prev) => {
            if (prev.find((u) => u.uid === user.uid)) return prev;
            return [...prev, user];
          });
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'audio') {
          user.audioTrack?.stop();
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        }
      });

      client.on('user-left', (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      // Join the channel
      // Convert uid to number if possible, or pass string/null (Agora supports both depending on server configs)
      const parsedUid = typeof uid === 'string' && !isNaN(uid) ? Number(uid) : uid;
      await client.join(appId, channelName, token, parsedUid || null);

      setIsConnected(true);
      setIsMuted(true); // default to muted for safety
    } catch (err) {
      if (err.code === 'OPERATION_ABORTED' || err.message?.includes('OPERATION_ABORTED') || err.message?.includes('cancel token canceled')) {
        console.warn('[Agora Hook] Connection aborted during join cleanup.');
        return;
      }
      console.error('[Agora Hook] Join Error:', err);
      setError(err.message || 'Failed to join audio channel');
      throw err;
    }
  }, [initClient]);

  const publishAudio = useCallback(async () => {
    try {
      const client = clientRef.current;
      if (!client || !isConnected) return;

      if (!localAudioTrackRef.current) {
        localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
      }

      // Check if already published
      const localTracks = client.localTracks || [];
      if (!localTracks.includes(localAudioTrackRef.current)) {
        await client.publish(localAudioTrackRef.current);
      }

      await localAudioTrackRef.current.setEnabled(true);
      setIsMuted(false);
    } catch (err) {
      console.error('[Agora Hook] Publish Audio Error:', err);
      setError('Could not access microphone');
      throw err;
    }
  }, [isConnected]);

  const muteAudio = useCallback(async (shouldMute) => {
    try {
      if (shouldMute) {
        if (localAudioTrackRef.current) {
          await localAudioTrackRef.current.setEnabled(false);
        }
        setIsMuted(true);
      } else {
        await publishAudio();
      }
    } catch (err) {
      console.error('[Agora Hook] Mute/Unmute Error:', err);
      setError('Mute operation failed');
    }
  }, [publishAudio]);

  const leaveChannel = useCallback(async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }

      const client = clientRef.current;
      if (client) {
        // Unsubscribe all listeners
        client.off('user-published');
        client.off('user-unpublished');
        client.off('user-left');
        
        if (isConnected) {
          await client.leave();
        }
      }
    } catch (err) {
      console.error('[Agora Hook] Leave Error:', err);
    } finally {
      setIsConnected(false);
      setIsMuted(true);
      setRemoteUsers([]);
    }
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveChannel();
    };
  }, [leaveChannel]);

  return {
    isConnected,
    isMuted,
    remoteUsers,
    error,
    joinChannel,
    leaveChannel,
    muteAudio,
  };
}
