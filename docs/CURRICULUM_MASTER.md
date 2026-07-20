# QuRoots — Master Curriculum ("Complete Arabic → Quran & Sunnah")

This is the **full-scope** plan: it takes a learner from zero all the way to
producing complete *i'rāb* (grammatical parsing) of any Quranic ayah or hadith.
It **extends** `CURRICULUM.md` — it does not replace it.

- **Part A — Foundation (recognition):** the existing 6-stage / 19-unit
  "Zero to Quran" path in `CURRICULUM.md`. Builds a ~450-word Quranic vocabulary
  and the ability to *label* words and read simple ayat. **Status: Stage 1 built
  (Units 1–3, 12 lessons). Stages 2–6 designed, not yet authored.**
- **Part B — Mastery (complete naḥw & ṣarf):** NEW. Stages 7–14 / Units 20–49.
  Turns recognition into full parsing: the case system, inna & kāna and their
  sisters, the 10 verb forms, derived nouns, every kind of maf'ūl, ḥāl, tamyīz,
  the followers, conditionals, numbers, and full i'rāb. **This is where "every
  single topic" lives.**
- **Part C — Application (Hadith & Quran engine):** NEW. After each mastery
  stage, unlock real ayat + hadith at the learner's level with auto-generated
  parsing/comprehension questions. Daily Ayah / Daily Hadith.
- **Part D — Engagement:** the game layer that keeps people coming back.

**Design principles carry over from `CURRICULUM.md`:** Quran-first vocabulary,
payoff every unit ("Read the Quran" capstone lesson), coverage milestones,
relentless recycling, existing step engine. Part B adds three principles:
1. **Recognition before rule.** Every grammar rule is introduced through words
   the learner already knows from Part A — never abstract paradigms first.
2. **The root engine is the spine of ṣarf.** Every verb/derived-noun lesson
   deep-links to `/roots` and uses the real `forms`/`tenses`/`conjugations` data.
3. **I'rāb is taught as a game, not a table.** New step types (below) let
   learners *tag* case endings and *identify* verb forms interactively.

---

# PART B — COMPLETE NAḤW & ṢARF (the mastery track)

> Prerequisite: Part A Stage 6 complete (learner can label ism/fi'l/harf, read
> Al-Fatiha, knows ~450 words). Part B assumes that vocabulary and recycles it.

## STAGE 7 — I'rāb: The Case System *(the heart of naḥw)*

> After this stage: "I know *why* a word ends in a ḍamma, fatḥa, or kasra — I can
> read the grammatical 'colour' of every word."

### Unit 20: The Four States (al-i'rāb)
- L1 *Words wear endings* — raf' (ُ), naṣb (َ), jarr (ِ), jazm (ْ); the idea that a
  word's ending shows its **job**, not its meaning.
- L2 *Mabnī vs mu'rab* — words that never change (pronouns, most harf, mādī verbs)
  vs words that do (most isms, muḍāri' verbs).
- L3 *The default signs* — ḍamma=raf', fatḥa=naṣb, kasra=jarr, sukūn=jazm; tanwīn
  variants (ٌ ً ٍ).
- L4 *Read the Quran* — colour-tag every ending in Al-Fātiḥa 1–4.

### Unit 21: The Nominative Crew (al-marfū'āt)
- L1 *Mubtada' & khabar* — the two pillars of a nominal sentence are both marfū'.
- L2 *Al-fā'il* — the doer of a verb is marfū': `خَلَقَ اللَّهُ` — why اللَّهُ has ḍamma.
- L3 *Nā'ib al-fā'il* — the stand-in subject of a passive verb (preview of Stage 9).
- L4 *Read the Quran* — spot every marfū' word across 5 short ayat.

### Unit 22: The Accusative Crew — intro (al-manṣūbāt)
- L1 *Al-maf'ūl bihi* — the receiver of the action is manṣūb: `خَلَقَ اللَّهُ السَّمَاوَاتِ`.
- L2 *Object pronouns* — attached-pronoun objects: خَلَقَهُ، أَنزَلْنَاهُ، هَدَانَا.
- L3 *Word order freedom* — because endings mark the job, Arabic can move words;
  fronting the maf'ūl (`إِيَّاكَ نَعْبُدُ`).
- L4 *Read the Quran* — `إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ` fully parsed.

### Unit 23: The Genitive Crew (al-majrūrāt)
- L1 *Jarr by preposition* — every ism after a ḥarf jarr is majrūr (kasra).
- L2 *Jarr by iḍāfa* — the second noun of a possessive is majrūr (`رَبِّ الْعَالَمِينَ`).
- L3 *The followers get dragged* — an adjective/conjunct follows its noun's case.
- L4 *Read the Quran* — trace the kasra through `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ`.

### Unit 24: The Special Signs (sub-signs of i'rāb)
- L1 *The five nouns (al-asmā' al-khamsa)* — أَبُو/أَبَا/أَبِي، أَخُو، ذُو — raf' with wāw,
  naṣb with alif, jarr with yā'.
- L2 *Duals & sound masc. plurals* — raf' with ا/و, naṣb+jarr with ي
  (`مُسْلِمَانِ/مُسْلِمَيْنِ`, `مُؤْمِنُونَ/مُؤْمِنِينَ`).
- L3 *Sound fem. plurals & diptotes* — ـات takes kasra for naṣb; **mamnū' min
  al-ṣarf** (diptotes like أَحْمَد، مَسَاجِد) refuse tanwīn and take fatḥa for jarr.
- L4 *Read the Quran* — `إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ` — special-sign showcase.

**Checkpoint 5 — "First I'rāb":** produce the case + sign of every word in Al-Fātiḥa.
**Coverage note:** now the learner *parses*, not just recognizes.

---

## STAGE 8 — Inna & Kāna and Their Sisters *(the sentence-changers)*

> After this stage: "I know the families of words that flip a sentence's cases."

### Unit 25: كَانَ وَأَخَوَاتُهَا (the incomplete verbs)
- L1 *كَانَ raises & naṣbs* — turns a nominal sentence's khabar manṣūb:
  `كَانَ اللَّهُ غَفُورًا رَحِيمًا` — ism kāna marfū', khabar kāna manṣūb.
- L2 *The sisters of being/becoming* — أَصْبَحَ، أَمْسَىٰ، صَارَ، ظَلَّ، بَاتَ.
- L3 *لَيْسَ (negation)* & the "as long as / still" sisters — مَا زَالَ، مَا دَامَ.
- L4 *Read the Quran* — `وَكَانَ اللَّهُ عَلِيمًا حَكِيمًا` and 4 more كان ayat.

### Unit 26: إِنَّ وَأَخَوَاتُهَا (the emphasizers) — *the mirror of kāna*
- L1 *إِنَّ naṣbs the subject, raf's the predicate* — the exact opposite of kāna:
  `إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ` — ism inna manṣūb, khabar inna marfū'.
- L2 *أَنَّ & the difference* — sentence-opener إِنَّ vs mid-sentence أَنَّ; the masdar
  mu'awwal `أَنَّ + jumla`.
- L3 *كَأَنَّ، لَٰكِنَّ، لَيْتَ، لَعَلَّ* — likeness, but, wishing, hoping/perhaps.
- L4 *Read the Quran* — `إِنَّ مَعَ الْعُسْرِ يُسْرًا`, `إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ`.

### Unit 27: ظَنَّ وَأَخَوَاتُهَا (verbs of the heart — two objects)
- L1 *Verbs that take TWO manṣūb objects* — ظَنَّ، حَسِبَ، وَجَدَ، عَلِمَ، رَأَىٰ (of the heart).
- L2 *Certainty vs doubt sisters* & how the Quran uses them (`أَحَسِبَ النَّاسُ`).
- L3 *Read the Quran* — `لَا تَحْسَبَنَّ الَّذِينَ قُتِلُوا...`.

### Unit 28: كَادَ وَأَخَوَاتُهَا (verbs of nearness/beginning) — *light*
- L1 *أَفْعَال المُقَارَبَة* — كَادَ (almost), عَسَىٰ (perhaps), أَخَذَ/جَعَلَ (began to).
- L2 *Read the Quran* — `يَكَادُ الْبَرْقُ يَخْطَفُ أَبْصَارَهُمْ`.

**Checkpoint 6 — "The Sentence Changers."**

---

## STAGE 9 — The Complete Verb System (ṣarf I) *(powered by the roots engine)*

> After this stage: "I see the form, tense, mood, voice, and root of any verb."
> **Integration:** every lesson deep-links to `/roots/<root>` and uses live
> `forms` + `tenses` + `conjugations` data. This is the app's namesake strength.

### Unit 29: The Ten Forms (al-abwāb / al-awzān)
- L1 *Form I & the root idea* — فَعَلَ; the mīzān ص-ر-ف (measuring words against فعل).
- L2 *Forms II–IV* — فَعَّلَ (intensive/causative), فَاعَلَ (mutual), أَفْعَلَ (causative):
  عَلَّمَ، قَاتَلَ، أَنزَلَ.
- L3 *Forms V–VII* — تَفَعَّلَ، تَفَاعَلَ، اِنْفَعَلَ: تَذَكَّرَ، تَسَاءَلَ، اِنقَلَبَ.
- L4 *Forms VIII, X (& IX)* — اِفْتَعَلَ، اِسْتَفْعَلَ: اِسْتَمَعَ، اِسْتَغْفَرَ.
- L5 *Read the Quran* — identify the form of each verb in `يَسْتَغْفِرُونَ`,
  `أَنزَلْنَا`, `تَتَنَزَّلُ`. **Uses `form_id` step type.**

### Unit 30: The Muḍāri' Moods (the verb's own i'rāb)
- L1 *Marfū' muḍāri'* — the default `يَفْعَلُ` (ḍamma ending), and the نون of
  `يَفْعَلُونَ`.
- L2 *Manṣūb muḍāri'* — after أَنْ، لَنْ، كَيْ، حَتَّىٰ، لِـ: `لَنْ نُؤْمِنَ`, `لِيَعْبُدُوا`.
- L3 *Majzūm muḍāri'* — after لَمْ، لَمَّا، لَا (nahiya), لِـ (amr): `لَمْ يَلِدْ وَلَمْ يُولَدْ`.
- L4 *Read the Quran* — `لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ` (Al-Ikhlāṣ 3–4).

### Unit 31: Weak & Irregular Verbs (al-mu'tall wa akhawātuhu)
- L1 *Mithāl (wāw/yā' first)* — وَجَدَ، يَسِرَ; the dropping wāw in muḍāri'.
- L2 *Ajwaf (hollow)* — قَالَ، كَانَ، خَافَ; the alif↔wāw/yā' shift.
- L3 *Nāqiṣ (defective)* — دَعَا، هَدَىٰ، تَلَا; the disappearing final letter.
- L4 *Muḍā'af & mahmūz* — doubled (رَدَّ، مَدَّ) & hamzated (سَأَلَ، قَرَأَ).
- L5 *Read the Quran* — parse the weak verbs in `وَالضُّحَىٰ ... مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ`.

### Unit 32: Passive Voice (al-mabnī li-l-majhūl) & nā'ib al-fā'il
- L1 *The doer is hidden* — كُتِبَ، خُلِقَ، يُقَالُ; ḍamma-then-kasra pattern of the mādī.
- L2 *The stand-in subject* — nā'ib al-fā'il takes the fā'il's raf' role.
- L3 *Muḍāri' passive* — يُفْعَلُ: `يُنفَخُ فِي الصُّورِ`, `يُبْعَثُونَ`.
- L4 *Read the Quran* — `وَإِذَا الْمَوْءُودَةُ سُئِلَتْ` (At-Takwīr) and passives in Juz 'Amma.

**Checkpoint 7 — "Verb Master."**
**Coverage milestone:** verbs unlocked ≈ jump in comprehension of narrative ayat.

---

## STAGE 10 — Derived Nouns (ṣarf II) *(al-mushtaqqāt)*

> After this stage: "I can trace any noun back to its verb and root, and know
> what kind of meaning its pattern carries."

### Unit 33: al-Maṣdar (the verbal noun)
- L1 *The 'source' of the verb* — عِلْم from عَلِمَ، عِبَادَة from عَبَدَ.
- L2 *Maṣdar patterns per form* — تَفْعِيل، إِفْعَال، اِسْتِفْعَال: تَنزِيل، إِنزَال، اِسْتِغْفَار.
- L3 *al-Maṣdar al-mu'awwal* — `أَنْ + verb` = a maṣdar (`أَن تَصُومُوا خَيْرٌ لَّكُمْ`).
- L4 *Read the Quran* — maṣdar-dense ayat (`وَإِقَامِ الصَّلَاةِ وَإِيتَاءِ الزَّكَاةِ`).

### Unit 34: ism al-Fā'il & ism al-Maf'ūl (doer & receiver nouns)
- L1 *ism al-fā'il* — فَاعِل / مُفْعِل: كَاتِب، مُؤْمِن، مُسْلِم، مُنذِر.
- L2 *ism al-maf'ūl* — مَفْعُول / مُفْعَل: مَكْتُوب، مَخْلُوق، مَرْحُوم.
- L3 *Telling them apart in context* — the Quran's مُؤْمِنُونَ vs the passive مَرْزُوقُونَ.
- L4 *Read the Quran* — `هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ` (Al-Ḥashr 24).

### Unit 35: al-Ṣifa al-Mushabbaha & ism al-Tafḍīl
- L1 *Permanent qualities* — كَرِيم، عَظِيم، حَسَن (ṣifa mushabbaha, unlike temporary ism fā'il).
- L2 *Comparatives & superlatives* — أَفْعَل: أَكْبَر، أَحْسَن، أَعْلَىٰ.
- L3 *`اللَّهُ أَكْبَرُ` grammar* — how tafḍīl works with/without مِنْ and ال.
- L4 *Read the Quran* — `وَرَبُّكَ الْأَكْرَمُ`, `أَحْسَنُ تَقْوِيمٍ`.

### Unit 36: ism al-Zamān / Makān / Āla + al-Nisba
- L1 *Place & time nouns* — مَفْعَل/مَفْعِل: مَسْجِد، مَشْرِق، مَوْعِد.
- L2 *Instrument nouns* — مِفْعَال/مِفْعَل: مِفْتَاح، مِيزَان.
- L3 *al-Nisba (ـِيّ)* — belonging: عَرَبِيّ، أُمِّيّ، مَكِّيّ.
- L4 *Read the Quran* — `قُرْآنًا عَرَبِيًّا`, place-noun ayat.

**Checkpoint 8 — "The Word Genealogist."**

---

## STAGE 11 — The Accusative Family in Full *(advanced naḥw)*

> After this stage: "I recognise every reason a word can be manṣūb."

### Unit 37: The Five Maf'ūls
- L1 *al-Maf'ūl al-muṭlaq* — the cognate/absolute object for emphasis:
  `وَكَلَّمَ اللَّهُ مُوسَىٰ تَكْلِيمًا`.
- L2 *al-Maf'ūl li-ajlih* — the object of purpose: `يَجْعَلُونَ ... حَذَرَ الْمَوْتِ`.
- L3 *al-Maf'ūl fīh (al-ẓarf)* — adverb of time/place: يَوْمَ، حِينَ، عِنْدَ، فَوْقَ.
- L4 *al-Maf'ūl ma'ah* — accompaniment (with wāw al-ma'iyya) — light.
- L5 *Read the Quran* — mixed maf'ūl-spotting across Juz 'Amma.

### Unit 38: al-Ḥāl (the circumstance)
- L1 *"He came running"* — the manṣūb descriptor of a state: `فَادْخُلِي فِي عِبَادِي`… examples.
- L2 *Ḥāl as a sentence* — jumla ḥāliyya introduced by wāw al-ḥāl.
- L3 *Read the Quran* — `ادْخُلُوهَا بِسَلَامٍ آمِنِينَ`, `خَاشِعِينَ`.

### Unit 39: al-Tamyīz (the specifier)
- L1 *Clarifying ambiguity* — `اشْتَعَلَ الرَّأْسُ شَيْبًا`; tamyīz after numbers & measures.
- L2 *Tamyīz vs ḥāl* — telling the two manṣūb "extras" apart.
- L3 *Read the Quran* — `وَفَجَّرْنَا الْأَرْضَ عُيُونًا`, number tamyīz.

### Unit 40: al-Istithnā' & al-Munādā
- L1 *Exception (illā, ghayr, siwā)* — `لَا إِلَٰهَ إِلَّا اللَّهُ` fully parsed; the mustathnā.
- L2 *The vocative (yā)* — munādā cases: `يَا أَيُّهَا الَّذِينَ آمَنُوا`, `رَبَّنَا`, `يَا بُنَيَّ`.
- L3 *Read the Quran* — the shahāda + 5 `يَا أَيُّهَا` openers.

**Checkpoint 9 — "The Accusative Detective."**

---

## STAGE 12 — The Followers & Cohesion (al-tawābi')

> After this stage: "I see how phrases chain — description, joining, emphasis,
> substitution — and how pronouns point back."

### Unit 41: al-Na't (adjective) & al-Tawkīd (emphasis)
- L1 *Four-way agreement* — na't matches its noun in case, number, gender,
  definiteness: `الصِّرَاطَ الْمُسْتَقِيمَ`.
- L2 *Real vs causal na't* (sababī) — light.
- L3 *Tawkīd* — نَفْس، عَيْن، كُلّ، أَجْمَعُونَ: `فَسَجَدَ الْمَلَائِكَةُ كُلُّهُمْ أَجْمَعُونَ`.
- L4 *Read the Quran* — the āya above, fully.

### Unit 42: al-'Aṭf (conjunction) & al-Badal (apposition)
- L1 *'Aṭf revisited as a tābi'* — the conjunct takes the case of what it follows.
- L2 *al-Badal* — substitution: `اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ • صِرَاطَ الَّذِينَ...`.
- L3 *Read the Quran* — Al-Fātiḥa 6–7 as badal.

### Unit 43: Relative Clauses in Depth (al-mawṣūl + ṣila)
- L1 *The connector needs a clause* — الَّذِي/الَّتِي/الَّذِينَ + ṣila + the returning
  pronoun (al-'ā'id): `الَّذِينَ آمَنُوا` (800+×).
- L2 *مَنْ & مَا as relatives* — `لَهُ مَا فِي السَّمَاوَاتِ`.
- L3 *Read the Quran* — `الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ ...` (Al-Baqarah 3) fully.

**Checkpoint 10 — "The Clause Weaver."**

---

## STAGE 13 — Conditionals, Numbers & Rhetoric

> After this stage: "I handle the structures that trip up even intermediate
> students — conditions, counting, oaths, and fronting."

### Unit 44: al-Sharṭ (conditionals)
- L1 *if → then* — إِنْ، إِذَا، مَنْ، مَا + jawāb al-sharṭ; jazm of both verbs with jāzim
  particles: `إِن تَنصُرُوا اللَّهَ يَنصُرْكُمْ`.
- L2 *إِذَا vs إِنْ* — definite vs hypothetical; `إِذَا جَاءَ نَصْرُ اللَّهِ`.
- L3 *Read the Quran* — Sūrat an-Naṣr as a conditional structure.

### Unit 45: al-'Adad wa al-Ma'dūd (numbers & counted)
- L1 *The reverse-agreement rule* — 3–10 disagree in gender with the counted noun.
- L2 *11–99 & the manṣūb tamyīz of number* — `أَحَدَ عَشَرَ كَوْكَبًا`.
- L3 *Read the Quran* — `سَبْعَ سَمَاوَاتٍ`, `أَرْبَعِينَ لَيْلَةً`.

### Unit 46: Oaths, Restriction & Fronting (rhetoric)
- L1 *al-Qasam (the oath)* — wāw/tā'/bā' al-qasam + jawāb al-qasam:
  `وَالْعَصْرِ • إِنَّ الْإِنسَانَ لَفِي خُسْرٍ`.
- L2 *al-Qaṣr (restriction)* — إِنَّمَا and لا...إلا: `إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ`.
- L3 *al-Taqdīm wa al-ta'khīr* — meaning from fronting: `إِيَّاكَ نَعْبُدُ`, `لِلَّهِ مُلْكُ...`.
- L4 *Read the Quran* — Sūrat al-'Aṣr complete, with rhetoric annotations.

### Unit 47: Style & Emphasis — advanced *(light)*
- L1 *Praise & blame* — نِعْمَ، بِئْسَ; the nūn of emphasis (`لَيُسْجَنَنَّ`).
- L2 *Exclamation (ta'ajjub)* — `مَا أَفْعَلَهُ`; ikhtiṣāṣ — light.

**Checkpoint 11 — "The Stylist."**

---

## STAGE 14 — Full I'rāb Mastery *(capstone)*

> After this stage: "Give me any ayah — I'll parse every word."

### Unit 48: The Parse Engine
- L1–L3 *Guided full i'rāb* of increasingly complex ayat, word-by-word, using the
  `irab_tag` + `parse_tree` step types; instant feedback per word.

### Unit 49: Long-Ayah Parsing
- L1 *Āyat al-Kursī — complete i'rāb* (`lesson_type: 'legendary'`).
- L2 *A full rukū'* (e.g. Al-Baqarah 1–5) parsed end-to-end.

### Unit 50: The Grammarian's Ijāzah
- Graded i'rāb exam (free-text, AI-assisted grading — see Part C tooling).
- Passing unlocks a shareable **Ijāzah certificate** card.

**Grand Checkpoint — "The Grammarian's Ijāzah."**

---

# PART C — APPLICATION: HADITH & QURAN ENGINE

> The payoff. Once grammar is in place, the learner spends most of their time in
> **real text**, not exercises. This is also the endless-content engine that
> fixes the retention cliff (learners currently finish all content and stall).

## C1 — The "Living Text" model
- After a learner clears a **mastery stage**, a pool of real ayat/hadith **at their
  grammatical level** unlocks. Level = which structures they've been taught
  (tagged per verse/hadith). No verse is shown before its grammar is learned.
- Each text item becomes a **micro-lesson**: word-by-word tap-to-reveal
  (root, form, i'rāb, translation) + 2–4 auto-generated questions.

## C2 — Data needed
- **Quran:** already have `quran_words` (word-by-word: root, translit, translation),
  `ayahs`, `translations`, `tafsir_entries`. Add a per-word **grammar tag** column
  (case, role, form) — can be backfilled from a morphology source or generated.
- **Hadith (NEW tables):**
  - `hadith_collections` (Nawawi 40, Riyāḍ al-Ṣāliḥīn, the Ṣaḥīḥayn selections…)
  - `hadith` (collection_id, number, arabic, english, grade, topic)
  - `hadith_words` (hadith_id, position, arabic, root_arabic, translit, translation,
    grammar_tag) — mirrors `quran_words` so the same UI + review queue work.
  - Seed script `scripts/populate-hadith.mjs` (start with **al-Arba'īn al-Nawawiyya**
    — 42 hadith, canonical, manageable, high-value).

## C3 — Auto-generated questions (leverage `@anthropic-ai/sdk`, already a dep)
For any tagged ayah/hadith, generate:
- **i'rāb question** — "What is the case of `السَّمَاوَاتِ` here?" (from the tag).
- **role question** — "Find the fā'il / the maf'ūl bihi."
- **form question** — "Which of the 10 forms is `يَسْتَغْفِرُونَ`?" (from `forms` data).
- **root question** — "What root is this from?" (from `quran_words.root_arabic` → `/roots`).
- **translation / cloze** — hide a word, choose/type it.
- **why question** — "Why is `اللَّهَ` manṣūb in `إِنَّ اللَّهَ`?" (multiple choice).
- **free-text i'rāb** graded by Claude with a rubric (used in the Ijāzah exam).
Cache generated questions per verse (`generated_questions` table) so cost is paid once.

## C4 — Daily engagement surfaces
- **Daily Ayah** — one verse, tap-to-parse, 3-question micro-quiz, feeds streak + XP.
- **Daily Hadith** — same, from the current collection.
- **"Parse of the Day"** — a single hard word to i'rāb; global leaderboard of who
  got it fastest.
- All three plug into existing `daily_goals`, `daily_quests`, `userWordReviews`
  (SRS), `gem_transactions`, and the coverage meter.

---

# PART D — ENGAGEMENT (make the site sticky & shareable)

Existing systems to build on: streaks, hearts, gems, daily goals/quests, weekly
leagues, achievements, leaderboards, coverage meter, community chat, digest.

New for the mastery + application scale:
1. **Skill tree, not a list** — a visual naḥw/ṣarf tree (branches: I'rāb, Verbs,
   Nouns, Sentence). Units are nodes with crown levels (schema already supports
   `crown_level`).
2. **Grammar badges** — "Sister of Inna," "Form V Finder," "Passive Spotter,"
   "10-Form Master" (via `achievements` + `unlock_criteria`).
3. **I'rāb Duels** — head-to-head timed parsing vs another learner (uses the
   community layer + leagues).
4. **Story mode** — progress framed as a journey *through* the Quran: finishing a
   stage "opens" a new surah region on a map.
5. **Shareable cards** — coverage %, streak, and the **Ijāzah certificate**
   (drives virality — the "make it famous" lever).
6. **Progress that means something** — replace generic XP copy with
   "structures mastered" and "% of the Quran you can now parse."

---

# NEW STEP TYPES (engine additions for Part B/C)

Current: `teach`, `mcq`, `match`, `fill_blank`, `arrange`, `classify`, `translate`.
Add (all fit the `{ type, content }` JSONB model):
- **`irab_tag`** — learner assigns case (raf'/naṣb/jarr/jazm) to each highlighted word.
- **`role_tag`** — learner labels words with their job (mubtada', fā'il, maf'ūl…).
- **`form_id`** — identify which of the 10 forms a verb is (pulls from `forms`).
- **`root_id`** — identify the root (pulls from `quran_words`/`roots`; deep-links `/roots`).
- **`parse_tree`** — full guided i'rāb of a short ayah, word-by-word.
- **`conjugate`** — produce a conjugation cell (pulls from `tenses.conjugations`).

---

# AUTHORING ROADMAP (priority order)

Rationale: (1) unblock stalled users with more *foundation* content, (2) then the
verb/i'rāb depth they're asking for, (3) then the endless real-text engine.

1. **Finish Part A** — author Stages 2–6 (Units 4–19) lessons into `learning_lessons`
   using the shipped step engine. *Highest urgency: 6 users finished everything.*
2. **Engine: add `form_id`, `root_id`, `irab_tag` step types** — small, high-leverage;
   unlocks the app's roots/forms data inside lessons.
3. **Part B Stage 7 (I'rāb) + Stage 9 (Verbs/10 Forms)** — the two the user named
   most and the app is uniquely good at. Author these next.
4. **Part C scaffolding** — `hadith*` tables + `populate-hadith.mjs` (Nawawi 40) +
   `generated_questions` table + a `/daily` (Ayah + Hadith) surface.
5. **Part B Stages 8, 10–14** — the remaining mastery grammar.
6. **Part D** — skill-tree view, badges, Ijāzah cards, duels.

# COUNTS
- Part A: 6 stages, 19 units, ~90 lessons (12 built).
- Part B: 8 stages (7–14), 31 units (20–50), ~120 lessons.
- Part C: endless (every tagged ayah + hadith becomes practice).
- Vocabulary target grows from ~450 (recognition) toward ~1,000 (mastery),
  still 100% Quran-frequency-ranked.

# HONEST FRAMING (keep in UI copy)
- Coverage = *recognition* of word tokens, never "you understand X% of the Quran."
- I'rāb mastery = ability to *parse*, which is the real, defensible claim and the
  thing no competitor (Duolingo has no Arabic; Bayyinah/Madinah aren't gamified)
  offers. Lead marketing with **"the only app that teaches you to parse the Quran."**
