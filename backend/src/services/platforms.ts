import axios from 'axios';

export async function fetchLeetCodeStats(username: string) {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats { acSubmissionNum { difficulty count } }
        profile { ranking }
        userCalendar { activeYears submissionCalendar }
      }
    }
  `;
  const { data } = await axios.post(
    'https://leetcode.com/graphql',
    { query, variables: { username } },
    { headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' }, timeout: 10000 }
  );
  const stats = data?.data?.matchedUser?.submitStats?.acSubmissionNum || [];
  return {
    solved: stats.find((s: any) => s.difficulty === 'All')?.count || 0,
    easy: stats.find((s: any) => s.difficulty === 'Easy')?.count || 0,
    medium: stats.find((s: any) => s.difficulty === 'Medium')?.count || 0,
    hard: stats.find((s: any) => s.difficulty === 'Hard')?.count || 0,
    ranking: data?.data?.matchedUser?.profile?.ranking || 0,
  };
}

export async function fetchCodeforcesStats(handle: string) {
  const [userRes, subRes] = await Promise.all([
    axios.get(`https://codeforces.com/api/user.info?handles=${handle}`, { timeout: 8000 }),
    axios.get(`https://codeforces.com/api/user.status?handle=${handle}&count=1000`, { timeout: 8000 }),
  ]);
  const user = userRes.data?.result?.[0];
  if (!user) throw new Error('Codeforces user not found');
  const solved = new Set<string>();
  (subRes.data?.result || []).forEach((s: any) => {
    if (s.verdict === 'OK') solved.add(`${s.problem.contestId}-${s.problem.index}`);
  });
  return { rating: user.rating || 0, maxRating: user.maxRating || 0, rank: user.rank || '', solved: solved.size };
}

export async function fetchCodeChefStats(username: string) {
  try {
    const { data } = await axios.get(`https://www.codechef.com/users/${username}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 8000,
    });
    const ratingMatch = data.match(/class="rating-number">(\d+)</) || data.match(/"currentRating":(\d+)/);
    const starsMatch = data.match(/(\d+)\s*★/) || data.match(/"userRating":"(\d+\*?)"/);
    const rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;
    const stars = starsMatch ? parseInt(starsMatch[1]) : 0;
    return { rating, stars };
  } catch {
    throw new Error('Failed to fetch CodeChef stats');
  }
}

export async function fetchGFGStats(username: string) {
  try {
    const { data } = await axios.get(`https://auth.geeksforgeeks.org/user/${username}/practice/`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000,
    });
    const scoreMatch = data.match(/(?:score|coding score)[^>]*>[\s]*([0-9,]+)/i);
    const solvedMatch = data.match(/(\d+)\s*(?:problems?\s*solved|total\s*submissions)/i);
    return {
      score: scoreMatch ? parseInt(scoreMatch[1].replace(/,/g, '')) : 0,
      solved: solvedMatch ? parseInt(solvedMatch[1]) : 0,
    };
  } catch {
    throw new Error('Failed to fetch GFG stats');
  }
}
