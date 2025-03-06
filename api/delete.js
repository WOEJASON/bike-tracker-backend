const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  // 手动添加 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { weekId, ...data } = req.body;
    if (!weekId) {
      return res.status(400).json({ error: 'Missing weekId' });
    }
    if (weekId === 'attendanceBonus') {
      await db.collection('attendance_bonus').doc('current').set({ value: data.value });
    } else {
      await db.collection('weekly_data').doc(weekId).set(data);
    }
    res.status(200).json({ message: 'Data saved' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: error.message });
  }
};
