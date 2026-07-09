// src/services/notificationService.js

// We need an instance of Supabase here, we can import from AuthContext or create a fresh one.
// Let's create a fresh scoped client.
import { createClient } from '@supabase/supabase-js';
const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const notificationService = {
  /**
   * Send a notification through supported channels.
   * Currently supports 'in_app' and 'browser'.
   * @param {Object} params 
   * @param {string} params.userId - The recipient's user ID
   * @param {string} params.type - The type of notification (e.g. 'new_job')
   * @param {string} params.title - The title of the notification
   * @param {string} params.message - The message body
   * @param {string} params.relatedRequestId - Optional UUID of related repair request
   * @param {Array<string>} params.channels - Channels to send through (e.g. ['in_app', 'browser', 'sms'])
   */
  async send({ userId, type, title, message, relatedRequestId = null, channels = ['in_app'] }) {
    
    // 1. In-App Notification (Database)
    if (channels.includes('in_app')) {
      try {
        await supabaseClient.from('notifications').insert([{
          user_id: userId,
          type,
          title,
          message,
          related_request_id: relatedRequestId
        }]);
      } catch (err) {
        console.error("Failed to insert in_app notification", err);
      }
    }

    // 2. Browser Notification
    // Typically browser push is triggered by service worker, but for local MVP we trigger it immediately if requested.
    // However, this `send` method might be called on the *sender's* machine, not the recipient's.
    // So browser notifications for mechanics should be triggered by the mechanic's own subscription to the database.

    // 3. Future Channels (SMS, WhatsApp, Email)
    if (channels.includes('sms')) {
      console.log(`[Future Implementation] Sending SMS to user ${userId}: ${message}`);
    }
    
    if (channels.includes('whatsapp')) {
      console.log(`[Future Implementation] Sending WhatsApp to user ${userId}: ${message}`);
    }
  },

  /**
   * Play a local notification beep using Web Audio API
   */
  playBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1); // Drop to A4
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio beep failed", e);
    }
  },

  /**
   * Request browser notification permissions
   */
  async requestBrowserPermission() {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications.");
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  },

  /**
   * Trigger local browser notification
   */
  showBrowserNotification(title, body) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png'
      });
    }
  }
};
