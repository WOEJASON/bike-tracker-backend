const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config(); // 加载环境变量

const app = express();
app.use(express.json());
app.use(cors());

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
});

const db = admin.firestore();

app.get('/api/data', async (req, res) => {
  try {
    const weeklySnapshot = await db.collection('weekly_data').get();
    const weeklyData = weeklySnapshot.docs.map(doc => ({ weekId: doc.id, ...doc.data() }));

    const bonusSnapshot = await db.collection('attendance_bonus').doc('current').get();
    const bonusData = bonusSnapshot.exists ? { weekId: 'attendanceBonus', value: bonusSnapshot.data().value } : { weekId: 'attendanceBonus', value: 20 };

    const allData = [...weeklyData, bonusData];
    res.json(allData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/save', async (req, res) => {
  try {
    const { weekId, ...data } = req.body;
    if (weekId === 'attendanceBonus') {
      await db.collection('attendance_bonus').doc('current').set({ value: data.value });
    } else {
      await db.collection('weekly_data').doc(weekId).set(data);
    }
    res.json({ message: 'Data saved' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/delete', async (req, res) => {
  try {
    const { weekId } = req.body;
    await db.collection('weekly_data').doc(weekId).delete();
    res.json({ message: 'Week deleted' });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));