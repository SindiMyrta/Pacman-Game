const STORAGE_KEY = "pacman-arcade-high-scores";

export function getHighScores() {
  try {
    const scores = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(scores) ? scores : [];
  } catch {
    return [];
  }
}

export function getBestScore() {
  return getHighScores()[0]?.score || 0;
}

export function saveScore(score) {
  if (!Number.isFinite(score) || score <= 0) return getHighScores();

  const scores = getHighScores();
  scores.push({ score, date: new Date().toLocaleDateString() });
  scores.sort((a, b) => b.score - a.score);
  const topFive = scores.slice(0, 5);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topFive));
  } catch (error) {
    console.warn("Could not save the high score:", error);
  }
  return topFive;
}
