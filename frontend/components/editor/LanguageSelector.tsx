'use client';
import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', icon: '🟨', ext: 'js' },
  { id: 'python', label: 'Python', icon: '🐍', ext: 'py' },
  { id: 'cpp', label: 'C++', icon: '⚡', ext: 'cpp' },
  { id: 'java', label: 'Java', icon: '☕', ext: 'java' },
  { id: 'go', label: 'Go', icon: '🐹', ext: 'go' },
  { id: 'rust', label: 'Rust', icon: '🦀', ext: 'rs' },
] as const;

export type LanguageId = typeof LANGUAGES[number]['id'];

export const DEFAULT_CODE: Record<LanguageId, string> = {
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
    }
    return [];
};`,
  python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            comp = target - num
            if comp in seen:
                return [seen[comp], i]
            seen[num] = i
        return []`,
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int,int> mp;
        for (int i = 0; i < nums.size(); i++) {
            int comp = target - nums[i];
            if (mp.count(comp)) return {mp[comp], i};
            mp[nums[i]] = i;
        }
        return {};
    }
};`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) return new int[]{map.get(comp), i};
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
  go: `func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        comp := target - num
        if j, ok := seen[comp]; ok {
            return []int{j, i}
        }
        seen[num] = i
    }
    return nil
}`,
  rust: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut map = std::collections::HashMap::new();
        for (i, &num) in nums.iter().enumerate() {
            let comp = target - num;
            if let Some(&j) = map.get(&comp) {
                return vec![j as i32, i as i32];
            }
            map.insert(num, i);
        }
        vec![]
    }
}`,
};

interface LanguageSelectorProps {
  value: LanguageId;
  onChange: (lang: LanguageId) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.id === value)!;
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/8 transition-all">
        <span>{current.icon}</span>
        <span>{current.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 mt-1 bg-[#1a1a26] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden min-w-[140px]">
            {LANGUAGES.map(l => (
              <button key={l.id} onClick={() => { onChange(l.id); setOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-all">
                <span>{l.icon}</span>
                <span className={l.id === value ? 'text-indigo-300' : 'text-gray-300'}>{l.label}</span>
                {l.id === value && <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
