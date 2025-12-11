require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
 
const app = express();
 
// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
 
// ===== DATABASE CONNECTION =====
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eduquest';
 
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
 
// ===== SCHEMAS & MODELS =====
 
// Subdocument for questions
const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, default: '' }
  },
  { _id: false }
);
 
// Quest schema
const questSchema = new mongoose.Schema(
  {
    // we keep our own "id" field so frontend doesn't need changes
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, default: 'Easy' },
    xpReward: { type: Number, default: 0 },
    timeLimit: { type: Number, default: null },
    teacherId: { type: String, default: null },
    questions: { type: [questionSchema], default: [] }
  },
  { timestamps: true }
);


 
const Quest = mongoose.model('Quest', questSchema);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
 
    // hashed password
    passwordHash: { type: String, required: true },
 
    role: {
      type: String,
      enum: ['student', 'teacher'],
      required: true
    },
 
    name: { type: String, required: true },
 
    // teacher-only fields
    subjectName: { type: String },
    otpCode: { type: String },
 
    // optional character link
    characterId: { type: String }
  },
  { timestamps: true }
);
 
userSchema.methods.setPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plainPassword, salt);
};
 
userSchema.methods.checkPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};
 
const User = mongoose.model('User', userSchema);

const studentStateSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
 
    // progress per quest: { questId: score }
    progress: {
      type: Map,
      of: Number,
      default: {}
    },
 
    // level & xp
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
 
    // inventory: array of any item objects you already use
    inventory: {
      type: [Object],
      default: []
    },
 
    // achievements: array of objects
    achievements: {
      type: [Object],
      default: []
    },

    // student classes: array of teacher IDs
    studentClasses: {
      type: [String],
      default: [] // Add studentClasses field
    }
  },
  { timestamps: true }
);
 
const StudentState = mongoose.model('StudentState', studentStateSchema);

function generateJwt(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      username: user.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
}
 
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
 
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
 
  const token = authHeader.split(' ')[1];
 
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId, role, username, iat, exp }
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
 
function generateTeacherOtp(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
}

// ===== ROUTES =====

// ===== AUTH ROUTES =====

app.put('/api/users/:id/character', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { characterId } = req.body;
 
    if (!characterId) {
      return res.status(400).json({ message: 'characterId is required' });
    }
 
    // only allow the logged-in user to update their own character
    if (req.user.userId !== id) {
      return res.status(403).json({ message: 'Not allowed' });
    }
 
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { characterId },
      { new: true }
    ).lean();
 
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
 
    const { passwordHash, ...userSafe } = updatedUser;
    res.json(userSafe);
  } catch (err) {
    console.error('Error updating characterId:', err);
    res.status(500).json({ message: 'Failed to update character' });
  }
});
 
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role, name, subjectName } = req.body;
 
    if (!username || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: 'username, email, password, and role are required' });
    }
 
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
 
    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'Username or email already exists' });
    }
 
    const user = new User({
      username,
      email,
      role,
      name: name || username,
      subjectName: role === 'teacher' ? subjectName || 'My Subject' : undefined,
      otpCode: role === 'teacher' ? generateTeacherOtp() : undefined
    });
 
    await user.setPassword(password);
    const saved = await user.save();
 
    const token = generateJwt(saved);
    const { passwordHash, ...userSafe } = saved.toObject();
 
    res.status(201).json({ user: userSafe, token });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Failed to register user' });
  }
});
 
// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { usernameOrEmail, password, role } = req.body;
 
    if (!usernameOrEmail || !password || !role) {
      return res
        .status(400)
        .json({ message: 'username/email, password, and role are required' });
    }
 
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      role
    });
 
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
 
    const valid = await user.checkPassword(password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
 
    const token = generateJwt(user);
    const { passwordHash, ...userSafe } = user.toObject();
 
    res.json({ user: userSafe, token });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Failed to login' });
  }
});

app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
 
    const users = await User.find(filter).select('-passwordHash').lean();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});
 
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    backend: 'EduQuest API',
    time: new Date()
  });
});
 
// Get all quests
app.get('/api/quests', async (req, res) => {
  try {
    const quests = await Quest.find().lean();
    res.json(quests);
  } catch (err) {
    console.error('Error fetching quests:', err);
    res.status(500).json({ message: 'Failed to fetch quests' });
  }
});
 
// Get a single quest by id
app.get('/api/quests/:id', async (req, res) => {
  try {
    const quest = await Quest.findOne({ id: req.params.id }).lean();
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    res.json(quest);
  } catch (err) {
    console.error('Error fetching quest:', err);
    res.status(500).json({ message: 'Failed to fetch quest' });
  }
});
 
// Create a new quest
app.post('/api/quests',authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create quests' });
    }
    const body = req.body;
 
    if (!body.title || !body.description) {
      return res
        .status(400)
        .json({ message: 'title and description are required' });
    }
 
    // generate an id if not provided
    const questId = body.id || `quest_${Date.now()}`;
 
    const newQuest = new Quest({
      id: questId,
      title: body.title,
      description: body.description,
      difficulty: body.difficulty || 'Easy',
      xpReward: body.xpReward || 0,
      timeLimit: body.timeLimit ?? null,
      teacherId: req.user.userId,
      questions: body.questions || []
    });
 
    const savedQuest = await newQuest.save();
    res.status(201).json(savedQuest);
  } catch (err) {
    console.error('Error creating quest:', err);
    res.status(500).json({ message: 'Failed to create quest' });
  }
});
 
// Update an existing quest
app.put('/api/quests/:id',authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can update quests' });
    }
    const questId = req.params.id;
    const updates = req.body;
 
    const updatedQuest = await Quest.findOneAndUpdate(
      { id: questId },
      updates,
      { new: true } // return updated doc
    ).lean();
 
    if (!updatedQuest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
 
    res.json(updatedQuest);
  } catch (err) {
    console.error('Error updating quest:', err);
    res.status(500).json({ message: 'Failed to update quest' });
  }
});
 
// Delete a quest
app.delete('/api/quests/:id',authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can delete quests' });
    }
    const questId = req.params.id;
 
    const result = await Quest.deleteOne({ id: questId });
 
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Quest not found' });
    }
 
    res.json({ message: 'Quest deleted', id: questId });
  } catch (err) {
    console.error('Error deleting quest:', err);
    res.status(500).json({ message: 'Failed to delete quest' });
  }
});

app.get('/api/students/:studentId/state', async (req, res) => {
  try {
    const { studentId } = req.params;
 
    let state = await StudentState.findOne({ studentId }).lean();
 
    // auto-create if not exists
    if (!state) {
      const created = await StudentState.create({ studentId });
      state = created.toObject();
    }
 
    res.json({
      ...state,
      studentClasses: state.studentClasses || [] // Add studentClasses to the response
    });
  } catch (err) {
    console.error('Error fetching student state:', err);
    res.status(500).json({ message: 'Failed to fetch student state' });
  }
});
 
//  full student state (achievements, inventory, progress, level/xp)
app.put('/api/students/:studentId/state', async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      achievements = [],
      inventory = [],
      progress = {},
      level,
      xp,
      studentClasses = []
    } = req.body;
 
    const updateDoc = {
      achievements,
      inventory,
      progress,
      studentClasses
    };
 
    if (typeof level === 'number') updateDoc.level = level;
    if (typeof xp === 'number') updateDoc.xp = xp;
 
    const state = await StudentState.findOneAndUpdate(
      { studentId },
      updateDoc,
      { new: true, upsert: true }
    ).lean();
 
    res.json(state);
  } catch (err) {
    console.error('Error saving student state:', err);
    res.status(500).json({ message: 'Failed to save student state' });
  }
});
 
// Update progress for a quest and adjust level/xp
app.post('/api/students/:studentId/progress', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { questId, score, xpGained } = req.body;
 
    if (!questId || typeof score !== 'number') {
      return res
        .status(400)
        .json({ message: 'questId and numeric score are required' });
    }
 
    let state = await StudentState.findOne({ studentId });
 
    if (!state) {
      state = new StudentState({ studentId });
    }
 
    // update progress map
    state.progress.set(questId, score);
 
    // update xp / level
    const gained = typeof xpGained === 'number' ? xpGained : score * 10;
    state.xp += gained;
 
    const xpForNextLevel = state.level * 100;
    while (state.xp >= xpForNextLevel) {
      state.xp -= xpForNextLevel;
      state.level += 1;
    }
 
    await state.save();
    res.json(state);
  } catch (err) {
    console.error('Error updating student progress:', err);
    res.status(500).json({ message: 'Failed to update progress' });
  }
});




 
// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
 
app.listen(PORT, () => {
  console.log(`EduQuest backend running on http://localhost:${PORT}`);
});