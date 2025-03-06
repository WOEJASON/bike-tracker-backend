const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const weeklySnapshot = await db.collection('weekly_data').get();
    const weeklyData = weeklySnapshot.docs.map(doc => ({ weekId: doc.id, ...doc.data() }));

    const bonusSnapshot = await db.collection('attendance_bonus').doc('current').get();
    const bonusData = bonusSnapshot.exists ? { weekId: 'attendanceBonus', value: bonusSnapshot.data().value } : { weekId: 'attendanceBonus', value: 20 };

    const allData = [...weeklyData, bonusData];
    res.status(200).json(allData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  }
};
