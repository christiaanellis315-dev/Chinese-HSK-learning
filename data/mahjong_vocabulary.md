# Mahjong Tile Vocabulary — Game Data

**Update — the live app now drills Sichuan (Blood Battle / 血战到底) rules
specifically, not the general/Cantonese 34-type set this file was originally
written against.** Sichuan mahjong is played with no honor tiles at all — no
winds, no dragons, no flowers — so `js/mahjong.js`'s `ALL_TILES` is just the
three suits below, 27 types. The Winds and Dragons sections further down are
kept as reference only (in case a traditional-set variant of the game ever
gets added back), but nothing in them is currently quizzed in-app.

Source: standard 34-tile Mahjong set (三种花色 three suits + 风牌 winds + 三元牌
dragons), the core tile set used in virtually every regional variant. Numbers
1-9 are already covered by the existing Numbers game, so mnemonics below focus
on the suit/honor names themselves rather than re-teaching digits.

**A note on scope:** this covers the standard 34 tile types (136 tiles total
in a full set, 4 copies each). It does NOT include the 8 optional flower tiles
(春夏秋冬梅兰竹菊) since flower tile use varies a lot by regional house rules —
easy to add as a second batch later if your in-laws' games use them.

**Character set:** simplified Chinese, consistent with the rest of the app
(万/发 rather than the traditional 萬/發 sometimes seen on physical tile sets
— if your in-laws' set uses traditional characters, flag it and I'll add a
traditional-character variant).

---

## The Three Suits (三种花色 sān zhǒng huāsè)

- **万** (wàn) — "characters" / "myriad" suit — *Historically means "ten
  thousand" — the suit named after large numbers, printed as a character
  above the number.*
- **条** (tiáo) — "bamboo" / "sticks" suit — *Means "strip" or "stick" —
  visually these tiles show bamboo-stick shapes (except the 1-tile, usually
  a bird/sparrow).*
- **筒** (tǒng) — "dots" / "circles" suit — *Means "tube" or "cylinder" —
  visually these tiles show circular dot patterns.*

### 万 (Characters) tiles
- 一万 (yī wàn) — 1 Characters
- 二万 (èr wàn) — 2 Characters
- 三万 (sān wàn) — 3 Characters
- 四万 (sì wàn) — 4 Characters
- 五万 (wǔ wàn) — 5 Characters
- 六万 (liù wàn) — 6 Characters
- 七万 (qī wàn) — 7 Characters
- 八万 (bā wàn) — 8 Characters
- 九万 (jiǔ wàn) — 9 Characters

### 条 (Bamboo) tiles
- 一条 (yī tiáo) — 1 Bamboo
- 二条 (èr tiáo) — 2 Bamboo
- 三条 (sān tiáo) — 3 Bamboo
- 四条 (sì tiáo) — 4 Bamboo
- 五条 (wǔ tiáo) — 5 Bamboo
- 六条 (liù tiáo) — 6 Bamboo
- 七条 (qī tiáo) — 7 Bamboo
- 八条 (bā tiáo) — 8 Bamboo
- 九条 (jiǔ tiáo) — 9 Bamboo

### 筒 (Dots) tiles
- 一筒 (yī tǒng) — 1 Dot
- 二筒 (èr tǒng) — 2 Dots
- 三筒 (sān tǒng) — 3 Dots
- 四筒 (sì tǒng) — 4 Dots
- 五筒 (wǔ tǒng) — 5 Dots
- 六筒 (liù tǒng) — 6 Dots
- 七筒 (qī tǒng) — 7 Dots
- 八筒 (bā tǒng) — 8 Dots
- 九筒 (jiǔ tǒng) — 9 Dots

---

## Winds (风牌 fēngpái) — *reference only, not used in-app (Sichuan mahjong has no honor tiles)*

- **东风** (dōngfēng) — East Wind — *东(east) + 风(wind).*
- **南风** (nánfēng) — South Wind — *南(south) + 风(wind).*
- **西风** (xīfēng) — West Wind — *西(west) + 风(wind).*
- **北风** (běifēng) — North Wind — *北(north) + 风(wind).*

*(Note: in casual play at the table, these are usually just called 东/南/西/北
without "风" — worth accepting either the short or long form as correct.)*

## Dragons (三元牌 sānyuánpái) — *reference only, not used in-app (Sichuan mahjong has no honor tiles)*

- **红中** (hóngzhōng) — Red Dragon — *红(red) + 中(middle/center) — often
  just called "中" (zhōng) at the table.*
- **发财** (fācái) — Green Dragon — *发(prosper) + 财(wealth) — "to strike
  it rich" — often just called "发" (fā) at the table.*
- **白板** (báibǎn) — White Dragon — *白(white) + 板(board/blank tile) — the
  blank tile — often just called "白" (bái) at the table.*

*(Same note as winds: accept both the full name and the single-character
short form people actually say during play.)*

---

## Suggested answer-matching rules for the game

Since real gameplay uses shortened names (people say "中" not "红中", "东"
not "东风"), the "type the answer" checker should probably accept:
- The full English name ("Red Dragon", "East Wind")
- Common shorthand ("Red", "East")
- The suit+number format for numbered tiles ("2 Bamboo", "two bamboo",
  "2bamboo" etc. — same lenient formatting rule as the Date game)

**Suit-name shorthand (in-app, per user request):** since honor tiles were
dropped for Sichuan rules, the three suit names are now the only "vocabulary"
to get lenient about, and the checker accepts casual abbreviations for two of
them: Characters also accepts "character"/"char"/"chars", Bamboo also accepts
"bam". Dots is left as just "dot"/"dots" — already short enough as-is.
