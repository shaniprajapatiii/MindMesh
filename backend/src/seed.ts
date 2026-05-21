import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PROBLEMS = [
  // Arrays
  { title: 'Two Sum', number: 1, platform: 'LeetCode', difficulty: 'Easy', topic: 'Array', tags: ['Array', 'HashMap'], url: 'https://leetcode.com/problems/two-sum/', externalId: '1', acceptance: 49.2 },
  { title: 'Best Time to Buy and Sell Stock', number: 121, platform: 'LeetCode', difficulty: 'Easy', topic: 'Array', tags: ['Array', 'Greedy'], url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', externalId: '121', acceptance: 54.1 },
  { title: 'Contains Duplicate', number: 217, platform: 'LeetCode', difficulty: 'Easy', topic: 'Array', tags: ['Array', 'HashSet'], url: 'https://leetcode.com/problems/contains-duplicate/', externalId: '217', acceptance: 61.5 },
  { title: 'Product of Array Except Self', number: 238, platform: 'LeetCode', difficulty: 'Medium', topic: 'Array', tags: ['Array', 'Prefix Sum'], url: 'https://leetcode.com/problems/product-of-array-except-self/', externalId: '238', acceptance: 65.1 },
  { title: 'Maximum Subarray', number: 53, platform: 'LeetCode', difficulty: 'Medium', topic: 'Array', tags: ['Array', 'DP', 'Kadane'], url: 'https://leetcode.com/problems/maximum-subarray/', externalId: '53', acceptance: 50.3 },
  { title: 'Maximum Product Subarray', number: 152, platform: 'LeetCode', difficulty: 'Medium', topic: 'Array', tags: ['Array', 'DP'], url: 'https://leetcode.com/problems/maximum-product-subarray/', externalId: '152', acceptance: 34.7 },
  { title: 'Find Minimum in Rotated Sorted Array', number: 153, platform: 'LeetCode', difficulty: 'Medium', topic: 'Binary Search', tags: ['Binary Search', 'Array'], url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', externalId: '153', acceptance: 49.2 },
  { title: 'Search in Rotated Sorted Array', number: 33, platform: 'LeetCode', difficulty: 'Medium', topic: 'Binary Search', tags: ['Binary Search', 'Array'], url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', externalId: '33', acceptance: 39.8 },
  { title: '3Sum', number: 15, platform: 'LeetCode', difficulty: 'Medium', topic: 'Two Pointer', tags: ['Two Pointer', 'Array', 'Sorting'], url: 'https://leetcode.com/problems/3sum/', externalId: '15', acceptance: 32.5 },
  { title: 'Container With Most Water', number: 11, platform: 'LeetCode', difficulty: 'Medium', topic: 'Two Pointer', tags: ['Two Pointer', 'Array', 'Greedy'], url: 'https://leetcode.com/problems/container-with-most-water/', externalId: '11', acceptance: 54.8 },

  // Strings
  { title: 'Valid Anagram', number: 242, platform: 'LeetCode', difficulty: 'Easy', topic: 'String', tags: ['String', 'HashMap'], url: 'https://leetcode.com/problems/valid-anagram/', externalId: '242', acceptance: 63.4 },
  { title: 'Valid Parentheses', number: 20, platform: 'LeetCode', difficulty: 'Easy', topic: 'Stack', tags: ['Stack', 'String'], url: 'https://leetcode.com/problems/valid-parentheses/', externalId: '20', acceptance: 40.9 },
  { title: 'Longest Substring Without Repeating Characters', number: 3, platform: 'LeetCode', difficulty: 'Medium', topic: 'Sliding Window', tags: ['Sliding Window', 'String', 'HashMap'], url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', externalId: '3', acceptance: 34.1 },
  { title: 'Longest Repeating Character Replacement', number: 424, platform: 'LeetCode', difficulty: 'Medium', topic: 'Sliding Window', tags: ['Sliding Window', 'String'], url: 'https://leetcode.com/problems/longest-repeating-character-replacement/', externalId: '424', acceptance: 51.8 },
  { title: 'Minimum Window Substring', number: 76, platform: 'LeetCode', difficulty: 'Hard', topic: 'Sliding Window', tags: ['Sliding Window', 'String', 'HashMap'], url: 'https://leetcode.com/problems/minimum-window-substring/', externalId: '76', acceptance: 41.8 },
  { title: 'Group Anagrams', number: 49, platform: 'LeetCode', difficulty: 'Medium', topic: 'String', tags: ['String', 'HashMap', 'Sorting'], url: 'https://leetcode.com/problems/group-anagrams/', externalId: '49', acceptance: 67.2 },

  // Linked Lists
  { title: 'Reverse Linked List', number: 206, platform: 'LeetCode', difficulty: 'Easy', topic: 'Linked List', tags: ['Linked List', 'Recursion'], url: 'https://leetcode.com/problems/reverse-linked-list/', externalId: '206', acceptance: 74.6 },
  { title: 'Linked List Cycle', number: 141, platform: 'LeetCode', difficulty: 'Easy', topic: 'Linked List', tags: ['Linked List', 'Two Pointer', 'Floyd\'s Algorithm'], url: 'https://leetcode.com/problems/linked-list-cycle/', externalId: '141', acceptance: 49.2 },
  { title: 'Merge Two Sorted Lists', number: 21, platform: 'LeetCode', difficulty: 'Easy', topic: 'Linked List', tags: ['Linked List', 'Recursion'], url: 'https://leetcode.com/problems/merge-two-sorted-lists/', externalId: '21', acceptance: 63.4 },
  { title: 'Remove Nth Node From End of List', number: 19, platform: 'LeetCode', difficulty: 'Medium', topic: 'Linked List', tags: ['Linked List', 'Two Pointer'], url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', externalId: '19', acceptance: 42.1 },
  { title: 'Merge K Sorted Lists', number: 23, platform: 'LeetCode', difficulty: 'Hard', topic: 'Linked List', tags: ['Linked List', 'Heap', 'Divide & Conquer'], url: 'https://leetcode.com/problems/merge-k-sorted-lists/', externalId: '23', acceptance: 50.2 },

  // Trees
  { title: 'Maximum Depth of Binary Tree', number: 104, platform: 'LeetCode', difficulty: 'Easy', topic: 'Tree', tags: ['Tree', 'DFS', 'BFS'], url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', externalId: '104', acceptance: 74.2 },
  { title: 'Invert Binary Tree', number: 226, platform: 'LeetCode', difficulty: 'Easy', topic: 'Tree', tags: ['Tree', 'DFS', 'BFS'], url: 'https://leetcode.com/problems/invert-binary-tree/', externalId: '226', acceptance: 76.5 },
  { title: 'Binary Tree Level Order Traversal', number: 102, platform: 'LeetCode', difficulty: 'Medium', topic: 'Tree', tags: ['Tree', 'BFS'], url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', externalId: '102', acceptance: 65.9 },
  { title: 'Validate Binary Search Tree', number: 98, platform: 'LeetCode', difficulty: 'Medium', topic: 'Tree', tags: ['Tree', 'DFS', 'BST'], url: 'https://leetcode.com/problems/validate-binary-search-tree/', externalId: '98', acceptance: 32.4 },
  { title: 'Lowest Common Ancestor of BST', number: 235, platform: 'LeetCode', difficulty: 'Medium', topic: 'Tree', tags: ['Tree', 'BST'], url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', externalId: '235', acceptance: 63.2 },
  { title: 'Binary Tree Maximum Path Sum', number: 124, platform: 'LeetCode', difficulty: 'Hard', topic: 'Tree', tags: ['Tree', 'DFS', 'DP'], url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', externalId: '124', acceptance: 38.9 },
  { title: 'Serialize and Deserialize Binary Tree', number: 297, platform: 'LeetCode', difficulty: 'Hard', topic: 'Tree', tags: ['Tree', 'BFS', 'DFS'], url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', externalId: '297', acceptance: 56.7 },
  { title: 'Kth Smallest Element in BST', number: 230, platform: 'LeetCode', difficulty: 'Medium', topic: 'Tree', tags: ['Tree', 'BST', 'Inorder'], url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', externalId: '230', acceptance: 71.4 },

  // Graphs
  { title: 'Number of Islands', number: 200, platform: 'LeetCode', difficulty: 'Medium', topic: 'Graph', tags: ['Graph', 'DFS', 'BFS', 'Union Find'], url: 'https://leetcode.com/problems/number-of-islands/', externalId: '200', acceptance: 58.1 },
  { title: 'Clone Graph', number: 133, platform: 'LeetCode', difficulty: 'Medium', topic: 'Graph', tags: ['Graph', 'DFS', 'BFS', 'HashMap'], url: 'https://leetcode.com/problems/clone-graph/', externalId: '133', acceptance: 57.2 },
  { title: 'Pacific Atlantic Water Flow', number: 417, platform: 'LeetCode', difficulty: 'Medium', topic: 'Graph', tags: ['Graph', 'DFS', 'BFS'], url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', externalId: '417', acceptance: 54.6 },
  { title: 'Course Schedule', number: 207, platform: 'LeetCode', difficulty: 'Medium', topic: 'Graph', tags: ['Graph', 'Topological Sort', 'Cycle Detection'], url: 'https://leetcode.com/problems/course-schedule/', externalId: '207', acceptance: 46.2 },
  { title: 'Graph Valid Tree', number: 261, platform: 'LeetCode', difficulty: 'Medium', topic: 'Graph', tags: ['Graph', 'Union Find', 'DFS'], url: 'https://leetcode.com/problems/graph-valid-tree/', externalId: '261', acceptance: 47.5, isPremium: true },
  { title: 'Alien Dictionary', number: 269, platform: 'LeetCode', difficulty: 'Hard', topic: 'Graph', tags: ['Graph', 'Topological Sort'], url: 'https://leetcode.com/problems/alien-dictionary/', externalId: '269', acceptance: 34.1, isPremium: true },

  // Dynamic Programming
  { title: 'Climbing Stairs', number: 70, platform: 'LeetCode', difficulty: 'Easy', topic: 'DP', tags: ['DP', 'Fibonacci', 'Memoization'], url: 'https://leetcode.com/problems/climbing-stairs/', externalId: '70', acceptance: 52.7 },
  { title: 'House Robber', number: 198, platform: 'LeetCode', difficulty: 'Medium', topic: 'DP', tags: ['DP', 'Array'], url: 'https://leetcode.com/problems/house-robber/', externalId: '198', acceptance: 50.3 },
  { title: 'House Robber II', number: 213, platform: 'LeetCode', difficulty: 'Medium', topic: 'DP', tags: ['DP', 'Array'], url: 'https://leetcode.com/problems/house-robber-ii/', externalId: '213', acceptance: 41.7 },
  { title: 'Longest Palindromic Substring', number: 5, platform: 'LeetCode', difficulty: 'Medium', topic: 'DP', tags: ['DP', 'String', 'Expand Around Center'], url: 'https://leetcode.com/problems/longest-palindromic-substring/', externalId: '5', acceptance: 33.7 },
  { title: 'Palindromic Substrings', number: 647, platform: 'LeetCode', difficulty: 'Medium', topic: 'DP', tags: ['DP', 'String'], url: 'https://leetcode.com/problems/palindromic-substrings/', externalId: '647', acceptance: 68.0 },
  { title: 'Coin Change', number: 322, platform: 'LeetCode', difficulty: 'Medium', topic: 'DP', tags: ['DP', 'BFS', 'Array'], url: 'https://leetcode.com/problems/coin-change/', externalId: '322', acceptance: 44.3 },
  { title: 'Longest Increasing Subsequence', number: 300, platform: 'LeetCode', difficulty: 'Medium', topic: 'DP', tags: ['DP', 'Binary Search'], url: 'https://leetcode.com/problems/longest-increasing-subsequence/', externalId: '300', acceptance: 54.0 },
  { title: 'Unique Paths', number: 62, platform: 'LeetCode', difficulty: 'Medium', topic: 'DP', tags: ['DP', 'Math', 'Combinatorics'], url: 'https://leetcode.com/problems/unique-paths/', externalId: '62', acceptance: 63.8 },
  { title: 'Jump Game', number: 55, platform: 'LeetCode', difficulty: 'Medium', topic: 'DP', tags: ['DP', 'Greedy', 'Array'], url: 'https://leetcode.com/problems/jump-game/', externalId: '55', acceptance: 38.5 },
  { title: 'Word Break', number: 139, platform: 'LeetCode', difficulty: 'Medium', topic: 'DP', tags: ['DP', 'Trie', 'Memoization'], url: 'https://leetcode.com/problems/word-break/', externalId: '139', acceptance: 45.7 },

  // Heap
  { title: 'Top K Frequent Elements', number: 347, platform: 'LeetCode', difficulty: 'Medium', topic: 'Heap', tags: ['Heap', 'HashMap', 'Bucket Sort'], url: 'https://leetcode.com/problems/top-k-frequent-elements/', externalId: '347', acceptance: 67.4 },
  { title: 'Find Median from Data Stream', number: 295, platform: 'LeetCode', difficulty: 'Hard', topic: 'Heap', tags: ['Heap', 'Design'], url: 'https://leetcode.com/problems/find-median-from-data-stream/', externalId: '295', acceptance: 51.3 },

  // Codeforces problems
  { title: 'Watermelon', platform: 'Codeforces', difficulty: 'Easy', topic: 'Math', tags: ['Math', 'Brute Force'], url: 'https://codeforces.com/problemset/problem/4/A', externalId: '4A', acceptance: 67.2 },
  { title: 'Way Too Long Words', platform: 'Codeforces', difficulty: 'Easy', topic: 'String', tags: ['String'], url: 'https://codeforces.com/problemset/problem/71/A', externalId: '71A', acceptance: 71.3 },
  { title: 'Theatre Square', platform: 'Codeforces', difficulty: 'Easy', topic: 'Math', tags: ['Math'], url: 'https://codeforces.com/problemset/problem/1/A', externalId: '1A', acceptance: 57.8 },
  { title: 'Next Round', platform: 'Codeforces', difficulty: 'Easy', topic: 'Array', tags: ['Array'], url: 'https://codeforces.com/problemset/problem/158/A', externalId: '158A', acceptance: 63.4 },

  // GFG problems
  { title: 'Find the Missing Number', platform: 'GFG', difficulty: 'Easy', topic: 'Array', tags: ['Array', 'Math'], url: 'https://www.geeksforgeeks.org/find-the-missing-number/', externalId: 'gfg-missing-number', acceptance: 72.1 },
  { title: 'Kadane\'s Algorithm', platform: 'GFG', difficulty: 'Medium', topic: 'DP', tags: ['DP', 'Array'], url: 'https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/', externalId: 'gfg-kadane', acceptance: 55.3 },
  { title: 'Detect Loop in Linked List', platform: 'GFG', difficulty: 'Easy', topic: 'Linked List', tags: ['Linked List', 'Floyd\'s Algorithm'], url: 'https://www.geeksforgeeks.org/detect-loop-in-a-linked-list/', externalId: 'gfg-detect-loop', acceptance: 61.7 },
];

const SHEETS = [
  { id: 'striver-az', name: "Striver's A-Z Sheet", author: 'Striver (TakeUForward)', description: 'Complete DSA preparation from basics to advanced', level: 'Comprehensive', url: 'https://takeuforward.org/strivers-a2z-dsa-course', isPublic: true, emoji: '⭐' },
  { id: 'love-babbar', name: 'Love Babbar 450', author: 'Love Babbar', description: '450 most important DSA questions', level: 'Structured', url: 'https://lovebabbar.com/dsa', isPublic: true, emoji: '💪' },
  { id: 'blind-75', name: 'Blind 75', author: 'Curated', description: 'The most important 75 problems for interviews', level: 'Interview Prep', url: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions', isPublic: true, emoji: '🎯' },
  { id: 'neetcode-150', name: 'NeetCode 150', author: 'NeetCode', description: '150 curated problems with video solutions', level: 'Curated', url: 'https://neetcode.io', isPublic: true, emoji: '🚀' },
  { id: 'fraz-300', name: 'Fraz Sheet', author: 'Mohammad Fraz', description: 'Topic-wise 300 problems', level: 'Topic-wise', url: '#', isPublic: true, emoji: '📚' },
  { id: 'striver-sde', name: "Striver's SDE Sheet", author: 'Striver', description: 'SDE interview preparation sheet with 191 problems', level: 'SDE Prep', url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', isPublic: true, emoji: '🏆' },
];

async function seed() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.sheetItem.deleteMany();
  await prisma.dSASheet.deleteMany();
  await prisma.problem.deleteMany();
  console.log('✓ Cleared existing data');

  // Seed problems
  const createdProblems = [];
  for (const problem of PROBLEMS) {
    try {
      const p = await prisma.problem.create({ data: problem as any });
      createdProblems.push(p);
    } catch (e) { /* skip duplicates */ }
  }
  console.log(`✓ Seeded ${createdProblems.length} problems`);

  // Seed sheets
  for (const sheet of SHEETS) {
    try {
      await prisma.dSASheet.create({ data: sheet });
    } catch {}
  }
  console.log(`✓ Seeded ${SHEETS.length} DSA sheets`);

  // Link problems to sheets (Blind 75 - all leetcode problems)
  const lcProblems = createdProblems.filter(p => p.platform === 'LeetCode');
  const blind75Sheet = await prisma.dSASheet.findUnique({ where: { id: 'blind-75' } });
  if (blind75Sheet) {
    for (let i = 0; i < Math.min(lcProblems.length, 50); i++) {
      try {
        await prisma.sheetItem.create({ data: { sheetId: blind75Sheet.id, problemId: lcProblems[i].id, order: i + 1, topic: lcProblems[i].topic } });
      } catch {}
    }
    console.log('✓ Linked problems to Blind 75 sheet');
  }

  // Create demo user
  const existingDemo = await prisma.user.findUnique({ where: { email: 'demo@dsatracker.dev' } });
  if (!existingDemo) {
    const hashedPassword = await bcrypt.hash('demo123456', 12);
    await prisma.user.create({
      data: {
        name: 'Demo User', email: 'demo@dsatracker.dev', username: 'demouser',
        password: hashedPassword, isEmailVerified: true,
        leetcodeId: 'neal_wu', codeforcesId: 'tourist',
        bio: 'Competitive programmer aiming for FAANG!',
        streak: 15, maxStreak: 47, xp: 2500, level: 5,
        leetcodeSolved: 234, leetcodeEasy: 89, leetcodeMedium: 115, leetcodeHard: 30,
        cfRating: 1842, cfRank: 'Expert',
        college: 'IIT Delhi',
      },
    });
    console.log('✓ Created demo user (email: demo@dsatracker.dev, password: demo123456)');
  }

  console.log('🌱 Seed completed successfully!');
}

seed().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
