const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
require('dotenv').config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

const db = admin.firestore();
const storage = admin.storage().bucket();

module.exports = (req, res) => {
  cors(req, res, async () => {
    try {
      const { weekId, imageData } = req.body;
      if (!weekId || !imageData) {
        return res.status(400).json({ error: 'Missing weekId or imageData' });
      }

      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `images/${weekId}.jpg`;
      const file = storage.file(fileName);

      await file.save(buffer, {
        metadata: { contentType: 'image/jpeg' },
        public: true,
      });

      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491',
      });

      await db.collection('weekly_data').doc(weekId).update({ imageUrl: url });

      res.status(200).json({ message: 'Image uploaded', imageUrl: url });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: error.message });
    }
  });
};
