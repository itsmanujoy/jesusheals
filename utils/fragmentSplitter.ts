export interface Fragment {
  id: string;
  text: string;
  originalIndex: number;
}

/**
 * Splits a verse into 7-8 fragments with max 2 words per fragment
 */
export function splitVerseIntoFragments(verseText: string): Fragment[] {
  const words = verseText.trim().split(/\s+/);
  const fragments: Fragment[] = [];
  let currentFragment: string[] = [];
  let fragmentIndex = 0;

  for (let i = 0; i < words.length; i++) {
    currentFragment.push(words[i]);

    // Create fragment when we have 2 words or at the end
    if (currentFragment.length === 2 || i === words.length - 1) {
      fragments.push({
        id: `fragment-${fragmentIndex}`,
        text: currentFragment.join(" "),
        originalIndex: fragmentIndex,
      });
      currentFragment = [];
      fragmentIndex++;
    }
  }

  // Ensure we have at least 7 fragments (if verse is too short, split some fragments further)
  while (fragments.length < 7 && fragments.length > 0) {
    // Find the longest fragment and split it
    let longestIndex = 0;
    let longestLength = 0;

    for (let i = 0; i < fragments.length; i++) {
      const wordCount = fragments[i].text.split(/\s+/).length;
      if (wordCount > longestLength) {
        longestLength = wordCount;
        longestIndex = i;
      }
    }

    const longestFragment = fragments[longestIndex];
    const words = longestFragment.text.split(/\s+/);
    
    if (words.length > 1) {
      const mid = Math.ceil(words.length / 2);
      const firstHalf = words.slice(0, mid).join(" ");
      const secondHalf = words.slice(mid).join(" ");

      fragments.splice(longestIndex, 1, 
        {
          id: `fragment-${longestIndex}`,
          text: firstHalf,
          originalIndex: longestIndex,
        },
        {
          id: `fragment-${longestIndex + 0.5}`,
          text: secondHalf,
          originalIndex: longestIndex + 0.5,
        }
      );

      // Re-index all fragments
      fragments.forEach((f, idx) => {
        f.id = `fragment-${idx}`;
        f.originalIndex = idx;
      });
    } else {
      break; // Can't split further
    }
  }

  // Cap at 8 fragments maximum
  if (fragments.length > 8) {
    // Merge some fragments to get back to 8
    while (fragments.length > 8) {
      const last = fragments.pop();
      if (last && fragments.length > 0) {
        const prev = fragments[fragments.length - 1];
        prev.text = prev.text + " " + last.text;
      }
    }
  }

  return fragments;
}

/**
 * Shuffles an array of fragments randomly
 */
export function shuffleFragments(fragments: Fragment[]): Fragment[] {
  const shuffled = [...fragments];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

