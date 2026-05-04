// lib/utils.js

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('mn-MN');
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('mn-MN');
};

export const getTodayKey = () => {
  return new Date().toISOString().split('T')[0];
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};
