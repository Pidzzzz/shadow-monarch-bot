const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class StickerMaker {
  static async imageToSticker(imageBuffer, options = {}) {
    try {
      const { width = 512, height = 512, format = 'webp' } = options;
      
      const converted = await sharp(imageBuffer)
        .resize(width, height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .webp({ quality: 100 })
        .toBuffer();

      return converted;
    } catch (err) {
      console.error('Sticker conversion error:', err);
      throw err;
    }
  }

  static async downloadAndConvert(url) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return await this.imageToSticker(Buffer.from(response.data));
    } catch (err) {
      console.error('Download error:', err);
      throw err;
    }
  }
}

module.exports = StickerMaker;
