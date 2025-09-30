import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { race, gender, count = 1 } = req.body;

  // Простой генератор имен
  const firstNames = {
    male: ['Аратион', 'Элрион', 'Илдион', 'Оротир', 'Уримир'],
    female: ['Алиана', 'Элвиэль', 'Илэна', 'Ороэль', 'Уриэль'],
    any: ['Аратион', 'Элрион', 'Илдион', 'Оротир', 'Уримир', 'Алиана', 'Элвиэль', 'Илэна', 'Ороэль', 'Уриэль']
  };

  const lastNames = ['Звездный', 'Лунный', 'Солнечный', 'Ветреный', 'Огненный'];

  const names = [];
  for (let i = 0; i < count; i++) {
    const genderKey = gender || 'any';
    const firstName = firstNames[genderKey][Math.floor(Math.random() * firstNames[genderKey].length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    names.push(`${firstName} ${lastName}`);
  }

  res.json({ names });
}
