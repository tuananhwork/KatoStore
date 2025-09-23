const jwt = require('jsonwebtoken');

// In-memory subscribers: userId -> Set(res)
const userIdToStreams = new Map();

function addSubscriber(userId, res) {
  if (!userIdToStreams.has(userId)) {
    userIdToStreams.set(userId, new Set());
  }
  userIdToStreams.get(userId).add(res);
}

function removeSubscriber(userId, res) {
  const set = userIdToStreams.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) userIdToStreams.delete(userId);
}

function publishToUser(userId, payload) {
  const set = userIdToStreams.get(String(userId));
  if (!set || set.size === 0) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of set) {
    try {
      res.write(data);
    } catch {
      // ignore broken pipe
    }
  }
}

function publishToManyUserIds(userIds, payload) {
  (userIds || []).forEach((uid) => publishToUser(String(uid), payload));
}

function verifyTokenFromQuery(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  addSubscriber,
  removeSubscriber,
  publishToUser,
  publishToManyUserIds,
  verifyTokenFromQuery,
};
