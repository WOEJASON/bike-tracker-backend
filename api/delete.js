const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  try {
    const { weekId } = req.body;
    if (!weekId) {
      return res.status(400).json({ error: 'Missing weekId' });
    }
    await db.collection('weekly_data').doc(weekId).delete();
    res.status(200).json({ message: 'Week deleted' });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ error: error.message });
  }
};