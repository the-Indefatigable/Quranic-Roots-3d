# QuRoots Full Arabic Curriculum — "Zero to Quran"

**Goal:** a learner with no Arabic background finishes this path able to parse and
understand real Quranic sentences — not just recognize isolated words.

**Design principles**
1. **Quran-first vocabulary.** Every word taught is a high-frequency Quranic word
   (we have per-word frequency in `quran_words`). No "the office is big" filler.
2. **Payoff every unit.** Each unit ends with a real ayah (or fragment) the learner
   can now fully parse. The final lesson of a unit is always "Read the Quran" —
   applying that unit's grammar to actual scripture.
3. **Coverage milestones.** After each stage we tell the learner what % of Quranic
   words they can now recognize (computable from `quran_words` + `roots.total_freq`).
   This is the single most motivating stat we can show.
4. **Recycle relentlessly.** Vocabulary from earlier units reappears in later
   exercises (the step generator should pull from `vocabulary_bank` of all
   completed units).
5. **Existing engine only.** Every lesson uses the shipped step types:
   `teach`, `mcq`, `match`, `fill_blank`, `arrange`, `classify`, `translate`
   (audio types `listen_identify` / `recite_score` / `pitch_match` stay in Qirat).

**Structure:** 6 stages → 19 units → ~90 lessons (4–6 lessons/unit, 10–16 steps each).
Checkpoint test after each stage (`checkpoint_tests`, `checkpoint_after` flag).

---

## STAGE 1 — The Building Blocks *(exists, needs completion)*

> After this stage: "I can label any Arabic word as ism, fi'l, or harf."

### Unit 1: The 3 Word Types ✅ (shipped — 4 lessons)
Ism / Fi'l / Harf recognition. Keep as-is.

### Unit 2: Boy or Girl? (gender) — unit exists, **no lessons yet**
- L1 *Masculine by default* — isms are masculine unless marked; ة (ta marbuta) as the feminine flag. Vocab: عَبْد، رَجُل، جَنَّة، رَحْمَة
- L2 *The ة detector* — classify drills; hidden feminines that matter in the Quran: أَرْض، شَمْس، نَار، نَفْس (feminine without ة)
- L3 *Gender pairs* — مُؤْمِن/مُؤْمِنَة، مُسْلِم/مُسْلِمَة، صَالِح/صَالِحَة — the Quran's paired forms
- L4 *Read the Quran* — parse gender in real fragments: جَنَّةٌ عَرْضُهَا، النَّارُ، نَفْسٌ

### Unit 3: How Many? (number) — unit exists, **no lessons yet**
- L1 *One, two, many* — singular / dual (انِ-) / plural; Arabic counts differently
- L2 *Sound plurals* — ونَ/ينَ (masc) and ات (fem): مُؤْمِنُونَ، مُؤْمِنَات، صَالِحَات
- L3 *Broken plurals* — the pattern-shift plurals the Quran loves: كِتَاب→كُتُب، رَسُول→رُسُل، عَبْد→عِبَاد
- L4 *Read the Quran* — إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ (Al-Ahzab 35 fragment)

**Checkpoint 1** after Unit 3.
**Coverage milestone:** "You can now classify ~100% of Quranic words by type."

---

## STAGE 2 — The Ism in Action

> After this stage: "I understand definite words, pronouns, pointing words, and possession — the skeleton of most ayat."

### Unit 4: THE Book (definiteness) — `al-`
- L1 *The ال prefix* — كِتَاب vs الْكِتَاب; why الله starts with ال
- L2 *Sun & moon letters* — pronunciation rule (الشَّمْس vs الْقَمَر) taught lightly
- L3 *Tanwin = "a/an"* — كِتَابٌ (a book) vs الْكِتَابُ (the book); the ن sound
- L4 *Read the Quran* — ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ (Al-Baqarah 2)

### Unit 5: Who? Me? You! (pronouns)
- L1 *He, she, they* — هُوَ، هِيَ، هُمْ (Quran's most common: هُوَ appears 481×)
- L2 *I, we, you* — أَنَا، نَحْنُ، أَنْتَ، أَنْتُمْ
- L3 *Attached pronouns 1 (my, your, his)* — ـِي، ـكَ، ـهُ: رَبِّي، رَبُّكَ، رَبُّهُ
- L4 *Attached pronouns 2 (our, their, plural-your)* — ـنَا، ـهُمْ، ـكُمْ: رَبَّنَا، لَهُمْ، عَلَيْكُمْ
- L5 *Read the Quran* — قُلْ هُوَ اللَّهُ أَحَدٌ (Al-Ikhlas 1) fully parsed

### Unit 6: This & That (pointing words)
- L1 *This* — هَٰذَا / هَٰذِهِ (gender ties back to Unit 2)
- L2 *That* — ذَٰلِكَ / تِلْكَ
- L3 *These & those* — هَٰؤُلَاءِ، أُولَٰئِكَ (the Quran's favorite: أُولَٰئِكَ هُمُ الْمُفْلِحُونَ)
- L4 *Read the Quran* — هَٰذَا صِرَاطٌ مُسْتَقِيمٌ

### Unit 7: Belongs To (idafa — possession)
- L1 *Two isms, one meaning* — رَسُولُ اللهِ، كِتَابُ اللهِ (no "of" needed)
- L2 *Idafa chains* — رَبِّ الْعَالَمِينَ، يَوْمِ الدِّينِ، مَالِكِ يَوْمِ الدِّينِ
- L3 *Idafa + pronouns* — combining Unit 5: رَبُّ + كَ = رَبُّكَ
- L4 *Read the Quran* — Al-Fatiha 1–4 (it's almost all idafa!)

### Unit 8: Describing Things (adjectives)
- L1 *Adjective follows the noun* — الْكِتَابُ الْكَرِيمُ; matching in gender
- L2 *Full agreement* — number + definiteness agreement; الصِّرَاطَ الْمُسْتَقِيمَ
- L3 *Allah's Names as adjectives* — الرَّحْمَٰنِ الرَّحِيمِ، الْعَزِيزُ الْحَكِيمُ
- L4 *Read the Quran* — بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ fully parsed

**Checkpoint 2.**
**Coverage milestone:** "Isms + pronouns ≈ 40% of all Quranic words."

---

## STAGE 3 — Connecting Words (the harf toolkit)

> After this stage: "The little words no longer confuse me — I see how ayat are glued together."

### Unit 9: Location Words (prepositions 1)
- L1 *فِي and عَلَىٰ* — in / upon: فِي الْأَرْضِ، عَلَى الْعَرْشِ
- L2 *مِنْ and إِلَىٰ* — from / to: مِنَ النَّاسِ، إِلَى اللهِ (مِنْ = most frequent harf: 3,226×)
- L3 *Prepositions + attached pronouns* — فِيهِ، عَلَيْهِمْ، مِنْهُ، إِلَيْكَ
- L4 *Read the Quran* — An-Nas parsed (it's a preposition showcase)

### Unit 10: With, For, Like (prepositions 2)
- L1 *بِ and لِ* — with-by / for-belonging: بِاللهِ، لِلَّهِ (note the merge)
- L2 *كَ and عَنْ and مَعَ* — like / about / with
- L3 *لَهُ، لَهُمْ، بِهِ* — the fused forms everywhere in the Quran
- L4 *Read the Quran* — لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ

### Unit 11: And, Then, So (connectors)
- L1 *وَ the workhorse* — "and" (appears 9,000+ times); reading long وَ chains
- L2 *فَ and ثُمَّ* — so/then (immediate) vs then (later) — sequencing in stories
- L3 *أَوْ and أَمْ* — or (statement) vs or (question)
- L4 *Read the Quran* — وَالْعَصْرِ إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ (Al-Asr 1–2)

### Unit 12: No, Not, Never (negation) & Questions
- L1 *لَا and مَا* — negating: لَا إِلَٰهَ إِلَّا اللهُ deconstructed
- L2 *إِلَّا* — "except": the la...illa structure of the shahada
- L3 *هَلْ، مَنْ، مَا، أَيْنَ، كَيْفَ، مَتَى* — question words
- L4 *Read the Quran* — هَلْ أَتَاكَ حَدِيثُ الْغَاشِيَةِ + لَا rich fragments

**Checkpoint 3.**
**Coverage milestone:** "Harf + ism mastery ≈ 55–60% of all Quranic words."

---

## STAGE 4 — The Fi'l (verbs, powered by the roots engine)

> After this stage: "I see the root inside every verb and know who did it, and when."
> **Integration:** every verb lesson deep-links to that root's page in /roots.

### Unit 13: It Happened (past tense — he/she/they)
- L1 *The 3-letter DNA* — root system intro: ك-ت-ب → كَتَبَ; connect to /roots explorer
- L2 *He did / she did* — قَالَ (1,618× — THE most common Quranic verb!), قَالَتْ
- L3 *They did* — قَالُوا، كَانُوا; the و + silent alif spelling
- L4 *Star verbs* — كَانَ، جَعَلَ، خَلَقَ، أَنْزَلَ (top-frequency past verbs)
- L5 *Read the Quran* — وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ (Al-Baqarah 30 opening)

### Unit 14: I Did, You Did, We Did (past tense — rest of the family)
- L1 *I and we* — فَعَلْتُ، فَعَلْنَا: خَلَقْنَا، أَنْزَلْنَا (Allah's "We")
- L2 *You (m/f/plural)* — فَعَلْتَ، فَعَلْتِ، فَعَلْتُمْ
- L3 *The full past table* — pattern drill on one root across all persons
- L4 *Read the Quran* — إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ (Al-Qadr 1)

### Unit 15: It's Happening (present tense)
- L1 *The يـ prefix* — يَفْعَلُ: يَعْلَمُ، يَقُولُ، يَعْمَلُونَ
- L2 *The full present prefixes* — أَ، نَـ، تَـ، يَـ mapped to persons
- L3 *Present plural* — يَعْلَمُونَ، تَعْلَمُونَ; the ن ending
- L4 *Negating verbs* — لَا يَعْلَمُونَ، مَا كَانَ، لَمْ + لَنْ (light intro)
- L5 *Read the Quran* — وَاللَّهُ يَعْلَمُ وَأَنْتُمْ لَا تَعْلَمُونَ

### Unit 16: Do It! (commands & the imperative)
- L1 *The command form* — اقْرَأْ (the first revelation!), قُلْ (332×)
- L2 *Common commands* — اعْبُدُوا، اتَّقُوا، آمِنُوا
- L3 *Don't!* — لَا + present: لَا تَخَفْ، لَا تَحْزَنْ
- L4 *Read the Quran* — اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ (Al-Alaq 1)

**Checkpoint 4.**
**Coverage milestone:** "You now recognize ~75% of Quranic words."

---

## STAGE 5 — Building Sentences (grammar becomes meaning)

> After this stage: "I can parse a full ayah: find the subject, the verb, the object, and what's describing what."

### Unit 17: Sentences Without "Is" (jumla ismiyya)
- L1 *Arabic has no "is"* — اللهُ أَكْبَرُ = "Allah [is] greater"; mubtada + khabar
- L2 *Pronoun sentences* — هُوَ الْغَفُورُ الرَّحِيمُ patterns
- L3 *إِنَّ the emphasizer* — إِنَّ اللهَ غَفُورٌ رَحِيمٌ; how إنّ colors the sentence
- L4 *Read the Quran* — إِنَّ اللَّهَ مَعَ الصَّابِرِينَ + Al-Ikhlas complete

### Unit 18: Verb Sentences (jumla fi'liyya)
- L1 *Verb comes first* — VSO order: خَلَقَ اللهُ السَّمَاوَاتِ
- L2 *Finding the doer* — fa'il spotting drills across real ayat
- L3 *The receiver* — maf'ul bihi; attached-pronoun objects: خَلَقَهُ، أَنْزَلْنَاهُ
- L4 *Who's who* — الَّذِي / الَّذِينَ relative clauses (الَّذِينَ آمَنُوا: 800+×)
- L5 *Read the Quran* — الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ (Al-Baqarah 3)

### Unit 19: Read Like a Scholar (capstone — full surahs)
- L1 *Al-Fatiha* — complete word-by-word parse; every word tagged with its grammar
- L2 *Al-Ikhlas + Al-Kawthar + Al-Asr* — full parses
- L3 *An-Nas + Al-Falaq* — the protective surahs, fully understood
- L4 *Ayat al-Kursi (part 1)* — the summit: apply everything
- L5 *Legendary: Ayat al-Kursi (complete)* — `lesson_type: 'legendary'`

**Final Checkpoint — "The Reader's Ijazah"** (celebration + share card).
**Coverage milestone:** "~80% of the Quran's words are now familiar to you."

---

## Implementation notes (for lesson generation)

- **Content format:** `{ steps: [{ type, content }] }` exactly as Unit 1 lessons;
  store as proper JSONB objects. Step mix per lesson: open with 1–2 `teach`,
  then alternate exercise types; end standard lessons with a `translate` or
  `arrange` of a Quranic fragment. 10–16 steps/lesson, `xp_reward` 15
  (20 for "Read the Quran" lessons, 40 for legendary).
- **Vocab discipline:** every new word gets a `vocabulary_bank` row
  (`word_ar`, `transliteration`, `english`, `word_type`, `gender`, `number`,
  `unit_id`, `quranic_ref`, `difficulty`). Target ≤ 8 new words/lesson;
  ~450 words total across the path — chosen by Quranic frequency, which alone
  yields the ~80% token-coverage milestone.
- **Cross-linking:** verb lessons include the root in their teach steps and the
  lesson-complete screen should link to `/roots/<root>` ("Explore this root →").
- **Review queue synergy:** the spaced-repetition system (planned) draws from
  `vocabulary_bank` rows the user has seen — the curriculum feeds it
  automatically via `unit_id`.
- **Sequencing on the path:** units unlock linearly; `checkpoint_after = true`
  on units 3, 8, 12, 16, 19.
- **Authoring order (matches user value):** Units 2–3 first (fills the shipped
  shells — highest urgency since 6 users are stuck), then Stage 2, then
  Stage 4 (verbs = the app's namesake strength), then Stages 3, 5.

## Coverage math (honest version)

"% of Quranic words you recognize" = share of the Quran's ~77,430 word tokens
whose lemma/root the learner has studied. Because frequency is extremely
top-heavy (وَ، اللهُ، مِنْ، فِي، قَالَ...), ~450 well-chosen words reach ~80%
token coverage. This is *recognition* coverage, not full comprehension — the
UI copy should say "words you'll recognize", never "you understand 80% of
the Quran".
