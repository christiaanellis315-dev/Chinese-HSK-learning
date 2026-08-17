// Pinyin reference data, extracted verbatim from hsk1_pinyin_reference.html
// Each entry: pinyin (with tone mark), hanzi, meaning, optional "note" (rare final flag), optional "lesson" tag
const TONES = {
  "1st tone — high & flat": {
    shape: "ˉ", desc: "Hold it high and level, like humming one steady note — no rise, no dip.",
    words: [
      {h:"妈", p:"mā", e:"mom", tag:"L6"},
      {h:"三", p:"sān", e:"three", tag:"numbers"},
      {h:"八", p:"bā", e:"eight", tag:"numbers"},
      {h:"天", p:"tiān", e:"day/sky", tag:"L7"},
      {h:"高", p:"gāo", e:"tall/high", tag:"L15"},
      {h:"说", p:"shuō", e:"to speak", tag:"L6"}
    ]
  },
  "2nd tone — rising": {
    shape: "ˊ", desc: "Starts mid, shoots up — like asking \"what?!\" in disbelief.",
    words: [
      {h:"学", p:"xué", e:"study", tag:"L7"},
      {h:"朋", p:"péng", e:"friend (from 朋友)", tag:"L4"},
      {h:"谁", p:"shéi", e:"who", tag:"L4"},
      {h:"十", p:"shí", e:"ten", tag:"numbers"},
      {h:"来", p:"lái", e:"to come", tag:"L12"},
      {h:"读", p:"dú", e:"to read", tag:"L6"}
    ]
  },
  "3rd tone — dip then rise": {
    shape: "ˇ", desc: "Drop low, then curl back up — like a slow, doubtful \"hmmm...\"",
    words: [
      {h:"你", p:"nǐ", e:"you", tag:"L1"},
      {h:"好", p:"hǎo", e:"good", tag:"L1"},
      {h:"九", p:"jiǔ", e:"nine", tag:"numbers"},
      {h:"我", p:"wǒ", e:"I / me", tag:"L3"},
      {h:"北", p:"běi", e:"north (from 北京)", tag:"L11"},
      {h:"写", p:"xiě", e:"to write", tag:"L6"}
    ]
  },
  "4th tone — sharp fall": {
    shape: "ˋ", desc: "Start high, drop fast — like snapping out a firm \"NO.\"",
    words: [
      {h:"是", p:"shì", e:"to be", tag:"L3"},
      {h:"大", p:"dà", e:"big / old", tag:"L5"},
      {h:"号", p:"hào", e:"date", tag:"L7"},
      {h:"去", p:"qù", e:"to go", tag:"L7"},
      {h:"汉", p:"hàn", e:"Han (from 汉语)", tag:"L4"},
      {h:"爱", p:"ài", e:"to love", tag:"L12"}
    ]
  },
  "Neutral tone — light & quick": {
    shape: "·", desc: "No real pitch at all — just a soft, unstressed beat tacked onto the syllable before it.",
    words: [
      {h:"吗", p:"ma", e:"question particle", tag:"L3"},
      {h:"的", p:"de", e:"possessive particle", tag:"L4"},
      {h:"了", p:"le", e:"change particle", tag:"L5"},
      {h:"呢", p:"ne", e:"question particle", tag:"L4"},
      {h:"么", p:"me", e:"(from 什么)", tag:"L3"},
      {h:"们", p:"men", e:"plural suffix", tag:"L11"}
    ]
  }
};

const INITIALS = [
  {h:"八", p:"bā", i:"b", e:"eight", tag:"numbers"},
  {h:"朋", p:"péng", i:"p", e:"friend", tag:"L4"},
  {h:"妈", p:"mā", i:"m", e:"mom", tag:"L6"},
  {h:"飞", p:"fēi", i:"f", e:"to fly", tag:"L15"},
  {h:"大", p:"dà", i:"d", e:"big", tag:"L5"},
  {h:"天", p:"tiān", i:"t", e:"day/sky", tag:"L7"},
  {h:"你", p:"nǐ", i:"n", e:"you", tag:"L1"},
  {h:"老", p:"lǎo", i:"l", e:"old (from 老师)", tag:"L3"},
  {h:"国", p:"guó", i:"g", e:"country", tag:"L4"},
  {h:"看", p:"kàn", i:"k", e:"to look", tag:"L7"},
  {h:"好", p:"hǎo", i:"h", e:"good", tag:"L1"},
  {h:"叫", p:"jiào", i:"j", e:"to be called", tag:"L3"},
  {h:"请", p:"qǐng", i:"q", e:"please", tag:"L7"},
  {h:"谢", p:"xiè", i:"x", e:"thanks", tag:"L2"},
  {h:"中", p:"zhōng", i:"zh", e:"middle (from 中国)", tag:"L3"},
  {h:"吃", p:"chī", i:"ch", e:"to eat", tag:"L8"},
  {h:"是", p:"shì", i:"sh", e:"to be", tag:"L3"},
  {h:"人", p:"rén", i:"r", e:"person", tag:"L3"},
  {h:"再", p:"zài", i:"z", e:"again (from 再见)", tag:"L2"},
  {h:"菜", p:"cài", i:"c", e:"dish", tag:"L6"},
  {h:"三", p:"sān", i:"s", e:"three", tag:"numbers"},
  {h:"一", p:"yī", i:"y", e:"one", tag:"numbers"},
  {h:"我", p:"wǒ", i:"w", e:"I / me", tag:"L3"}
];

const FINALS = {
  "a — group": [
    {h:"妈", p:"mā", e:"mom", tag:"L6"},
    {h:"太", p:"tài", e:"too / extremely (ai)", tag:"L12"},
    {h:"好", p:"hǎo", e:"good (ao)", tag:"L1"},
    {h:"三", p:"sān", e:"three (an)", tag:"numbers"},
    {h:"上", p:"shàng", e:"on / above (ang)", tag:"L10"}
  ],
  "e — group": [
    {h:"车", p:"chē", e:"car (e)", tag:"L14"},
    {h:"谁", p:"shéi", e:"who (ei)", tag:"L4"},
    {h:"很", p:"hěn", e:"very (en)", tag:"L6"},
    {h:"冷", p:"lěng", e:"cold (eng)", tag:"L12"}
  ],
  "o / ou / ong — group": [
    {h:"做", p:"zuò", e:"to make — closest plain-o example (o)", tag:"L6"},
    {h:"都", p:"dōu", e:"all / both (ou)", tag:"L14"},
    {h:"中", p:"zhōng", e:"middle (ong)", tag:"L4"}
  ],
  "i — group": [
    {h:"你", p:"nǐ", e:"you (i)", tag:"L1"},
    {h:"家", p:"jiā", e:"family / home (ia)", tag:"L5"},
    {h:"谢", p:"xiè", e:"thanks (ie)", tag:"L2"},
    {h:"叫", p:"jiào", e:"to be called (iao)", tag:"L3"},
    {h:"六", p:"liù", e:"six (iu)", tag:"numbers"},
    {h:"天", p:"tiān", e:"day/sky (ian)", tag:"L7"},
    {h:"您", p:"nín", e:"you, polite (in)", tag:"L1"},
    {h:"想", p:"xiǎng", e:"would like to (iang)", tag:"L8"},
    {h:"请", p:"qǐng", e:"please (ing)", tag:"L7"},
    {h:"熊", p:"xióng", e:"bear — rare final, standalone reference (iong)", tag:"ref"}
  ],
  "u — group": [
    {h:"五", p:"wǔ", e:"five (u)", tag:"numbers"},
    {h:"花", p:"huā", e:"flower — standalone reference (ua)", tag:"ref"},
    {h:"说", p:"shuō", e:"to speak (uo)", tag:"L6"},
    {h:"块", p:"kuài", e:"currency unit (uai)", tag:"L8"},
    {h:"会", p:"huì", e:"can / to be able to (ui)", tag:"L6"},
    {h:"短", p:"duǎn", e:"short — standalone reference (uan)", tag:"ref"},
    {h:"春", p:"chūn", e:"spring — standalone reference (un)", tag:"ref"},
    {h:"床", p:"chuáng", e:"bed — standalone reference (uang)", tag:"ref"},
    {h:"翁", p:"wēng", e:"old man — rare final, standalone (ueng)", tag:"ref"}
  ],
  "ü — group (written u after j/q/x/y)": [
    {h:"去", p:"qù", e:"to go (ü)", tag:"L7"},
    {h:"学", p:"xué", e:"to study (üe)", tag:"L7"},
    {h:"元", p:"yuán", e:"currency unit — standalone reference (üan)", tag:"ref"},
    {h:"云", p:"yún", e:"cloud — standalone reference (ün)", tag:"ref"}
  ],
  "er — standalone": [
    {h:"儿", p:"ér", e:"child / son suffix (from 儿子)", tag:"L9"}
  ]
};
