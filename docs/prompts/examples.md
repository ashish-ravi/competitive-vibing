# Evaluation Examples (Few-Shot Reference)

These examples define the expected evaluation quality and tone. Use them as a reference when testing the system prompt or when the AI produces unexpected output.

---

## Example 1 — Correct Explanation

**Problem:** Two Sum (Easy)
> Given an array of integers and a target, return indices of two numbers that add up to the target.

**User Explanation:**
> I'd use a hash map. As I iterate through the array, for each number I check if the complement (target minus current number) is already in the map. If it is, I return the current index and the stored index. If not, I store the current number with its index. This way I only need one pass.

**Expected Evaluation:**
```json
{
  "verdict": "correct",
  "score": 92,
  "correctness": {
    "score": 38,
    "explanation": "The approach is correct. Using a hash map to track complements in a single pass correctly solves the problem for all valid inputs."
  },
  "edge_cases": {
    "score": 26,
    "missed": ["What if the same element can be used twice?"],
    "explanation": "Handles the main cases well. The solution implicitly handles duplicates with different values, but doesn't mention whether using the same index twice is allowed."
  },
  "complexity": {
    "score": 18,
    "time": "O(n)",
    "space": "O(n)",
    "explanation": "Single pass with hash map — time and space are both O(n). Well-optimized."
  },
  "clarity": {
    "score": 10
  },
  "commentary": "Excellent explanation — you clearly articulated the key insight of storing complements as you go, which is exactly what makes this approach O(n). For interview polish, mention that the problem guarantees exactly one solution, so you don't need to handle the no-answer case."
}
```

---

## Example 2 — Partial Explanation

**Problem:** Valid Parentheses (Easy)
> Given a string of brackets, return true if every open bracket has a matching close bracket in the correct order.

**User Explanation:**
> I'd count the open and close brackets. If they're equal at the end, it's valid.

**Expected Evaluation:**
```json
{
  "verdict": "partial",
  "score": 48,
  "correctness": {
    "score": 18,
    "explanation": "Counting brackets is necessary but not sufficient. This approach would incorrectly accept '])[(' because counts match but order is wrong."
  },
  "edge_cases": {
    "score": 12,
    "missed": ["Mismatched types: '([)]' has equal counts but is invalid", "Closing before opening: '][' has equal counts but is invalid", "Mixed bracket types: '{[}]'"],
    "explanation": "The approach only considers quantity, missing all ordering and type-matching edge cases."
  },
  "complexity": {
    "score": 12,
    "time": "O(n)",
    "space": "O(1)",
    "explanation": "A counting approach would be O(n) time and O(1) space — but the correct stack-based solution is O(n) time and O(n) space."
  },
  "clarity": {
    "score": 6
  },
  "commentary": "You've identified that balance matters, which is a good starting point. The key insight you're missing is that order matters too — a stack is the right structure here, because it lets you verify that each closing bracket matches the most recent unmatched opening bracket."
}
```

---

## Example 3 — Incorrect Explanation

**Problem:** Maximum Subarray (Medium)
> Find the contiguous subarray with the largest sum.

**User Explanation:**
> I'd try all possible subarrays, compute their sums, and return the maximum.

**Expected Evaluation:**
```json
{
  "verdict": "incorrect",
  "score": 35,
  "correctness": {
    "score": 30,
    "explanation": "The brute-force approach would produce correct results for small inputs, but TLEs at O(n²) or O(n³) for the given constraints (up to 10^5 elements)."
  },
  "edge_cases": {
    "score": 8,
    "missed": ["All negative numbers (the subarray must be non-empty, so you can't return 0)", "Single element array"],
    "explanation": "The approach doesn't clarify how to handle all-negative arrays — should it return the least negative number or 0?"
  },
  "complexity": {
    "score": 5,
    "time": "O(n²)",
    "space": "O(1)",
    "explanation": "Trying all subarrays is O(n²) with the optimized approach or O(n³) if sums are recomputed. The expected solution is O(n) using Kadane's algorithm."
  },
  "clarity": {
    "score": 8
  },
  "commentary": "Your instinct to brute-force first is reasonable for building intuition. For this problem, the key insight is that you can decide at each position whether to extend the current subarray or start a new one — this leads to the O(n) Kadane's algorithm. Try thinking about what information you actually need to carry from one position to the next."
}
```

---

## Tone Anti-Examples

These are evaluations that would be **rejected** — do not produce output like this:

### Too Harsh
> "Your approach is completely wrong and shows a fundamental misunderstanding of the problem."

### Too Vague
> "Good try! Consider edge cases and complexity."

### Reveals the Solution
> "You should use Kadane's algorithm: keep a running max and reset when negative."
*(This gives away the algorithm name and mechanism — only hint at the direction)*

### Makes Up Edge Cases
> "You didn't handle the case where the array contains NaN values."
*(NaN is not in the constraints — don't invent edge cases)*
