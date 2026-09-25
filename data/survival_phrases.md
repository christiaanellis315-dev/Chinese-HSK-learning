# Survival Phrases — Module Data (merged)

Consolidates four source files into the single, growing module the live app reads
(`js/survival-phrases.js`). Supersedes `HSK_Data/survival_phrases.md` and its three
`_batch.md` addenda — those are merged in here now, not kept as separate parallel lists.

Source files merged: `survival_phrases.md` (original, 25), `survival_phrases_hsk1_batch.md`
(22), `survival_phrases_hsk2_batch.md` (22), `survival_phrases_hsk3_batch.md` (19).

## How this merge was done

- **Grouped by real-world scenario**, not by which file a phrase came from — each batch's
  own group titles ("adds to existing group", "new group") were used as a strong hint, but
  a few phrases were re-homed to the group they fit best thematically once all four lists
  were on the table together (e.g. HSK3's "wait for me / I'll be right back / going to the
  restroom" phrases joined HSK1's "Requests & Manners" rather than getting their own group).
- **Two near-duplicate pairs were reconciled by keeping the fuller version**, per the brief:
  - "多少钱？" (original) → replaced by "这个多少钱？" (HSK1 batch) — a direct upgrade of a
    foundational day-one phrase, not new material (though this distinction no longer matters
    for availability now that no survival phrase is gated — see below).
  - "你好吗？" (original) → replaced by "你好吗？我很好，谢谢，你呢？" (HSK1 batch), and moved
    into **Meeting People** (where the HSK1 batch filed it) rather than staying in Small
    Talk.
- **Phrases explicitly flagged "said TO you more than said BY you"** (请喝茶, 你多大了, 你都
  听懂了吗, 不用担心有我呢, 快五年了你几乎没变化) are marked `recognizeOnly` in the data —
  the module should weight these toward recognition practice rather than production.
- **Two phrases were flagged by their source batch as "natural combination, not a verbatim
  textbook line"**: 新年快乐 (新年 + 快乐) and 你最近怎么样 (最近 + 怎么样). Both checked —
  they're standard, idiomatically correct Mandarin (新年快乐 is *the* common Happy New Year
  greeting; 怎么样 asking after someone is completely ordinary) — included normally, just
  noted here for the same transparency the source files asked for.
- One phrase (西瓜不甜不要钱, HSK3 batch) had no pinyin supplied in its source file — added
  here as `Xīguā bù tián bú yào qián` (标 tone sandhi: 不 → bú before the 4th-tone 要).

## Spaced-repetition weighting; no gating

- **"When You're Stuck"** is weighted higher across *every* batch it drew from (original +
  HSK2 + HSK3 additions) — per the source files' own repeated request that this group stay
  the highest priority. In the app this means a shorter effective review interval (see
  `Storage.recordSrsResult`'s `weight` parameter), not just a bigger group.
- **Every HSK1/HSK2/HSK3-sourced phrase is tagged with its book**, but the tag is purely
  informational (which HSK level introduced it) — it plays no role in availability. Every
  phrase, in every group, is browsable, practiceable, and eligible for Review's SRS schedule
  from the moment the app is opened, regardless of book/lesson progress. An earlier revision
  gated book-tagged phrases behind having studied that book at all (plus, briefly, a manual
  "preview locked phrases" toggle to see them early) — both were removed as unwanted
  complexity: this is single always-open pool of phrases, same as the original untagged set
  always was.

## Final merged groups

(34 tiles worth of structure comparison aside — this is just the group list; the actual
phrase data, with pinyin/English/book-tag/weight/recognizeOnly, lives in
`js/survival-phrases.js` as the single source of truth. This file is reference/documentation
only, not loaded by the app.)

1. **Meeting People** — greetings, names, nationality, introductions
2. **When You're Stuck** (weight 3) — the recovery-phrase set
3. **At the Table**
4. **Small Talk / Everyday**
5. **Basic Travel** (incl. shopping/prices)
6. **Age & Family**
7. **Ability**
8. **Time & Date**
9. **Requests & Manners**
10. **On the Phone**
11. **Directions**
12. **New Year** (culturally relevant, HSK2)
