const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class Downloader {
  static async downloadTikTok(url) {
    try {
      const response = await axios.post('https://api.tikmate.online/api/download', 
        { url },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.data?.success && response.data?.data?.video) {
        return {
          success: true,
          video: response.data.data.video,
          title: response.data.data.title || 'TikTok Video'
        };
      }
      throw new Error('Failed to fetch TikTok');
    } catch (err) {
      console.error('TikTok download error:', err);
      return { success: false, error: err.message };
    }
  }

  static async downloadYouTube(url) {
    try {
      const ytdl = require('@distube/ytdl-core');
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { quality: '18' });
      
      return {
        success: true,
        url: format.url,
        title: info.videoDetails.title,
        duration: info.videoDetails.lengthSeconds
      };
    } catch (err) {
      console.error('YouTube download error:', err);
      return { success: false, error: err.message };
    }
  }

  static async downloadInstagram(url) {
    try {
      const response = await axios.post('https://api.instagram.com/download',
        { url },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.data?.success) {
        return {
          success: true,
          media: response.data.data.media,
          title: response.data.data.caption || 'Instagram Post'
        };
      }
      throw new Error('Failed to fetch Instagram');
    } catch (err) {
      console.error('Instagram download error:', err);
      return { success: false, error: err.message };
    }
  }

  static async getYouTubeAudio(url) {
    try {
      const ytdl = require('@distube/ytdl-core');
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
      
      return {
        success: true,
        url: format.url,
        title: info.videoDetails.title,
        author: info.videoDetails.author.name
      };
    } catch (err) {
      console.error('YouTube audio download error:', err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = Downloader;
