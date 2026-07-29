// Daily Verbs — the highest-frequency verbs of everyday speech.
// Deliberately practical: past + present form, transliteration, and one or two
// real example sentences. No roots or morphology — just verbs you can use today.
//
// This is a curated starter set; the structure scales to 500–1000. To add more,
// append entries in the same shape.

export interface VerbExample {
  ar: string;
  en: string;
}

export interface DailyVerb {
  en: string;        // English gloss, e.g. "to love"
  ar: string;        // past tense (base form), e.g. "أَحَبَّ"
  present: string;   // present tense, e.g. "يُحِبّ"
  translit: string;  // "aḥabba · yuḥibb"
  cat: string;       // loose category for browsing
  examples: VerbExample[];
}

export const VERB_CATEGORIES = [
  'Everyday', 'Speaking', 'Movement', 'Feelings', 'Mind', 'Work & Money', 'Home', 'Food', 'Body', 'People', 'Faith', 'Nature', 'Action',
] as const;

export const dailyVerbs: DailyVerb[] = [
  // ── Everyday ──────────────────────────────────────────────
  { en: 'to go', ar: 'ذَهَبَ', present: 'يَذْهَب', translit: 'dhahaba · yadhhab', cat: 'Movement', examples: [{ ar: 'أَذْهَبُ إِلى العَمَلِ كُلَّ صَباح.', en: 'I go to work every morning.' }] },
  { en: 'to come', ar: 'جاءَ', present: 'يَجيء', translit: 'jāʾa · yajīʾ', cat: 'Movement', examples: [{ ar: 'تَعالَ إِلى هُنا.', en: 'Come here.' }, { ar: 'جاءَ صَديقي أَمْس.', en: 'My friend came yesterday.' }] },
  { en: 'to eat', ar: 'أَكَلَ', present: 'يَأْكُل', translit: 'akala · yaʾkul', cat: 'Everyday', examples: [{ ar: 'آكُلُ الفَطورَ في السّابِعة.', en: 'I eat breakfast at seven.' }] },
  { en: 'to drink', ar: 'شَرِبَ', present: 'يَشْرَب', translit: 'shariba · yashrab', cat: 'Everyday', examples: [{ ar: 'أَشْرَبُ الماءَ كَثيرًا.', en: 'I drink a lot of water.' }] },
  { en: 'to sleep', ar: 'نامَ', present: 'يَنام', translit: 'nāma · yanām', cat: 'Everyday', examples: [{ ar: 'أَنامُ مُبَكِّرًا في اللَّيْل.', en: 'I sleep early at night.' }] },
  { en: 'to wake up', ar: 'اِسْتَيْقَظَ', present: 'يَسْتَيْقِظ', translit: 'istayqaẓa · yastayqiẓ', cat: 'Everyday', examples: [{ ar: 'أَسْتَيْقِظُ عِنْدَ الفَجْر.', en: 'I wake up at dawn.' }] },
  { en: 'to wear', ar: 'لَبِسَ', present: 'يَلْبَس', translit: 'labisa · yalbas', cat: 'Everyday', examples: [{ ar: 'لَبِسْتُ مِعْطَفًا لِأَنَّ الجَوَّ بارِد.', en: 'I wore a coat because it is cold.' }] },
  { en: 'to buy', ar: 'اِشْتَرى', present: 'يَشْتَري', translit: 'ishtarā · yashtarī', cat: 'Work & Money', examples: [{ ar: 'اِشْتَرَيْتُ خُبْزًا مِنَ السّوق.', en: 'I bought bread from the market.' }] },
  { en: 'to sell', ar: 'باعَ', present: 'يَبيع', translit: 'bāʿa · yabīʿ', cat: 'Work & Money', examples: [{ ar: 'باعَ سَيّارَتَهُ القَديمة.', en: 'He sold his old car.' }] },
  { en: 'to pay', ar: 'دَفَعَ', present: 'يَدْفَع', translit: 'dafaʿa · yadfaʿ', cat: 'Work & Money', examples: [{ ar: 'دَفَعْتُ الحِسابَ في المَطْعَم.', en: 'I paid the bill at the restaurant.' }] },

  // ── Speaking / communication ──────────────────────────────
  { en: 'to say', ar: 'قالَ', present: 'يَقول', translit: 'qāla · yaqūl', cat: 'Speaking', examples: [{ ar: 'ماذا قُلْتَ لَه؟', en: 'What did you say to him?' }] },
  { en: 'to speak', ar: 'تَكَلَّمَ', present: 'يَتَكَلَّم', translit: 'takallama · yatakallam', cat: 'Speaking', examples: [{ ar: 'أَتَكَلَّمُ العَرَبِيّةَ قَليلًا.', en: 'I speak a little Arabic.' }] },
  { en: 'to ask', ar: 'سَأَلَ', present: 'يَسْأَل', translit: 'saʾala · yasʾal', cat: 'Speaking', examples: [{ ar: 'سَأَلْتُ المُعَلِّمَ سُؤالًا.', en: 'I asked the teacher a question.' }] },
  { en: 'to answer', ar: 'أَجابَ', present: 'يُجيب', translit: 'ajāba · yujīb', cat: 'Speaking', examples: [{ ar: 'أَجابَ عَنِ السُّؤالِ بِسُرْعة.', en: 'He answered the question quickly.' }] },
  { en: 'to talk / to converse', ar: 'تَحَدَّثَ', present: 'يَتَحَدَّث', translit: 'taḥaddatha · yataḥaddath', cat: 'Speaking', examples: [{ ar: 'تَحَدَّثْنا طَويلًا عَنِ السَّفَر.', en: 'We talked for a long time about travel.' }] },
  { en: 'to call (phone)', ar: 'اِتَّصَلَ', present: 'يَتَّصِل', translit: 'ittaṣala · yattaṣil', cat: 'Speaking', examples: [{ ar: 'اِتَّصَلْتُ بِأُمّي مَساءً.', en: 'I called my mother in the evening.' }] },
  { en: 'to thank', ar: 'شَكَرَ', present: 'يَشْكُر', translit: 'shakara · yashkur', cat: 'Speaking', examples: [{ ar: 'أَشْكُرُكَ على مُساعَدَتِك.', en: 'Thank you for your help.' }] },
  { en: 'to apologize', ar: 'اِعْتَذَرَ', present: 'يَعْتَذِر', translit: 'iʿtadhara · yaʿtadhir', cat: 'Speaking', examples: [{ ar: 'أَعْتَذِرُ عَنِ التَّأْخير.', en: 'I apologize for being late.' }] },
  { en: 'to promise', ar: 'وَعَدَ', present: 'يَعِد', translit: 'waʿada · yaʿid', cat: 'Speaking', examples: [{ ar: 'وَعَدْتُهُ بِأَنْ أُساعِدَه.', en: 'I promised him that I would help.' }] },
  { en: 'to explain', ar: 'شَرَحَ', present: 'يَشْرَح', translit: 'sharaḥa · yashraḥ', cat: 'Speaking', examples: [{ ar: 'شَرَحَ الأُسْتاذُ الدَّرْس.', en: 'The teacher explained the lesson.' }] },

  // ── Mind / thinking ───────────────────────────────────────
  { en: 'to know', ar: 'عَرَفَ', present: 'يَعْرِف', translit: 'ʿarafa · yaʿrif', cat: 'Mind', examples: [{ ar: 'أَعْرِفُ الجَوابَ الصَّحيح.', en: 'I know the right answer.' }] },
  { en: 'to think', ar: 'فَكَّرَ', present: 'يُفَكِّر', translit: 'fakkara · yufakkir', cat: 'Mind', examples: [{ ar: 'أُفَكِّرُ في المُسْتَقْبَل.', en: 'I think about the future.' }] },
  { en: 'to understand', ar: 'فَهِمَ', present: 'يَفْهَم', translit: 'fahima · yafham', cat: 'Mind', examples: [{ ar: 'هَلْ فَهِمْتَ الفِكْرة؟', en: 'Did you understand the idea?' }] },
  { en: 'to remember', ar: 'تَذَكَّرَ', present: 'يَتَذَكَّر', translit: 'tadhakkara · yatadhakkar', cat: 'Mind', examples: [{ ar: 'أَتَذَكَّرُ ذلِكَ اليَوْمَ جَيِّدًا.', en: 'I remember that day well.' }] },
  { en: 'to forget', ar: 'نَسِيَ', present: 'يَنْسى', translit: 'nasiya · yansā', cat: 'Mind', examples: [{ ar: 'نَسيتُ اسْمَه.', en: 'I forgot his name.' }] },
  { en: 'to learn', ar: 'تَعَلَّمَ', present: 'يَتَعَلَّم', translit: 'taʿallama · yataʿallam', cat: 'Mind', examples: [{ ar: 'أَتَعَلَّمُ العَرَبِيّةَ كُلَّ يَوْم.', en: 'I learn Arabic every day.' }] },
  { en: 'to study', ar: 'دَرَسَ', present: 'يَدْرُس', translit: 'darasa · yadrus', cat: 'Mind', examples: [{ ar: 'دَرَسْتُ لِلِامْتِحان.', en: 'I studied for the exam.' }] },
  { en: 'to teach', ar: 'عَلَّمَ', present: 'يُعَلِّم', translit: 'ʿallama · yuʿallim', cat: 'Mind', examples: [{ ar: 'يُعَلِّمُنا الأُسْتاذُ الحِساب.', en: 'The teacher teaches us math.' }] },
  { en: 'to read', ar: 'قَرَأَ', present: 'يَقْرَأ', translit: 'qaraʾa · yaqraʾ', cat: 'Mind', examples: [{ ar: 'أَقْرَأُ كِتابًا كُلَّ أُسْبوع.', en: 'I read a book every week.' }] },
  { en: 'to write', ar: 'كَتَبَ', present: 'يَكْتُب', translit: 'kataba · yaktub', cat: 'Mind', examples: [{ ar: 'أَكْتُبُ رِسالةً لِصَديقي.', en: 'I write a letter to my friend.' }] },
  { en: 'to believe', ar: 'صَدَّقَ', present: 'يُصَدِّق', translit: 'ṣaddaqa · yuṣaddiq', cat: 'Mind', examples: [{ ar: 'لا أُصَدِّقُ هذا الخَبَر.', en: "I don't believe this news." }] },

  // ── Perception ────────────────────────────────────────────
  { en: 'to see', ar: 'رَأى', present: 'يَرى', translit: 'raʾā · yarā', cat: 'Everyday', examples: [{ ar: 'رَأَيْتُ القَمَرَ لَيْلًا.', en: 'I saw the moon at night.' }] },
  { en: 'to hear', ar: 'سَمِعَ', present: 'يَسْمَع', translit: 'samiʿa · yasmaʿ', cat: 'Everyday', examples: [{ ar: 'سَمِعْتُ صَوْتًا غَريبًا.', en: 'I heard a strange sound.' }] },
  { en: 'to look / to watch', ar: 'نَظَرَ', present: 'يَنْظُر', translit: 'naẓara · yanẓur', cat: 'Everyday', examples: [{ ar: 'نَظَرْتُ إِلى السَّماء.', en: 'I looked at the sky.' }] },
  { en: 'to feel', ar: 'شَعَرَ', present: 'يَشْعُر', translit: 'shaʿara · yashʿur', cat: 'Feelings', examples: [{ ar: 'أَشْعُرُ بِالتَّعَبِ اليَوْم.', en: 'I feel tired today.' }] },

  // ── Feelings ──────────────────────────────────────────────
  { en: 'to love', ar: 'أَحَبَّ', present: 'يُحِبّ', translit: 'aḥabba · yuḥibb', cat: 'Feelings', examples: [{ ar: 'أُحِبُّ عائِلَتي كَثيرًا.', en: 'I love my family very much.' }] },
  { en: 'to hate', ar: 'كَرِهَ', present: 'يَكْرَه', translit: 'kariha · yakrah', cat: 'Feelings', examples: [{ ar: 'أَكْرَهُ الكَذِب.', en: 'I hate lying.' }] },
  { en: 'to like / to be pleased by', ar: 'أَعْجَبَ', present: 'يُعْجِب', translit: 'aʿjaba · yuʿjib', cat: 'Feelings', examples: [{ ar: 'يُعْجِبُني هذا الكِتاب.', en: 'I like this book.' }] },
  { en: 'to want', ar: 'أَرادَ', present: 'يُريد', translit: 'arāda · yurīd', cat: 'Feelings', examples: [{ ar: 'أُريدُ أَنْ أَتَعَلَّمَ العَرَبِيّة.', en: 'I want to learn Arabic.' }] },
  { en: 'to hope / to wish', ar: 'تَمَنّى', present: 'يَتَمَنّى', translit: 'tamannā · yatamannā', cat: 'Feelings', examples: [{ ar: 'أَتَمَنّى لَكَ النَّجاح.', en: 'I wish you success.' }] },
  { en: 'to fear', ar: 'خافَ', present: 'يَخاف', translit: 'khāfa · yakhāf', cat: 'Feelings', examples: [{ ar: 'أَخافُ مِنَ الظَّلام.', en: 'I am afraid of the dark.' }] },
  { en: 'to laugh', ar: 'ضَحِكَ', present: 'يَضْحَك', translit: 'ḍaḥika · yaḍḥak', cat: 'Feelings', examples: [{ ar: 'ضَحِكْنا كَثيرًا مَعًا.', en: 'We laughed a lot together.' }] },
  { en: 'to cry', ar: 'بَكى', present: 'يَبْكي', translit: 'bakā · yabkī', cat: 'Feelings', examples: [{ ar: 'بَكَتِ الطِّفْلةُ مِنَ الجوع.', en: 'The child cried from hunger.' }] },

  // ── Movement ──────────────────────────────────────────────
  { en: 'to walk', ar: 'مَشى', present: 'يَمْشي', translit: 'mashā · yamshī', cat: 'Movement', examples: [{ ar: 'أَمْشي في الحَديقةِ صَباحًا.', en: 'I walk in the park in the morning.' }] },
  { en: 'to run', ar: 'رَكَضَ', present: 'يَرْكُض', translit: 'rakaḍa · yarkuḍ', cat: 'Movement', examples: [{ ar: 'رَكَضَ الوَلَدُ بِسُرْعة.', en: 'The boy ran quickly.' }] },
  { en: 'to sit', ar: 'جَلَسَ', present: 'يَجْلِس', translit: 'jalasa · yajlis', cat: 'Movement', examples: [{ ar: 'اِجْلِسْ هُنا مِنْ فَضْلِك.', en: 'Please sit here.' }] },
  { en: 'to stand', ar: 'وَقَفَ', present: 'يَقِف', translit: 'waqafa · yaqif', cat: 'Movement', examples: [{ ar: 'وَقَفَ الرَّجُلُ عِنْدَ الباب.', en: 'The man stood at the door.' }] },
  { en: 'to enter', ar: 'دَخَلَ', present: 'يَدْخُل', translit: 'dakhala · yadkhul', cat: 'Movement', examples: [{ ar: 'دَخَلَ الغُرْفةَ بِهُدوء.', en: 'He entered the room quietly.' }] },
  { en: 'to leave / to depart', ar: 'غادَرَ', present: 'يُغادِر', translit: 'ghādara · yughādir', cat: 'Movement', examples: [{ ar: 'غادَرْتُ البَيْتَ مُبَكِّرًا.', en: 'I left the house early.' }] },
  { en: 'to return', ar: 'رَجَعَ', present: 'يَرْجِع', translit: 'rajaʿa · yarjiʿ', cat: 'Movement', examples: [{ ar: 'رَجَعْتُ مِنَ العَمَلِ مُتْعَبًا.', en: 'I returned from work tired.' }] },
  { en: 'to arrive', ar: 'وَصَلَ', present: 'يَصِل', translit: 'waṣala · yaṣil', cat: 'Movement', examples: [{ ar: 'وَصَلَ القِطارُ في مَوْعِدِه.', en: 'The train arrived on time.' }] },
  { en: 'to travel', ar: 'سافَرَ', present: 'يُسافِر', translit: 'sāfara · yusāfir', cat: 'Movement', examples: [{ ar: 'سافَرْتُ إِلى مِصْرَ العامَ الماضي.', en: 'I traveled to Egypt last year.' }] },
  { en: 'to drive', ar: 'قادَ', present: 'يَقود', translit: 'qāda · yaqūd', cat: 'Movement', examples: [{ ar: 'أَقودُ السَّيّارةَ بِحَذَر.', en: 'I drive the car carefully.' }] },
  { en: 'to fly', ar: 'طارَ', present: 'يَطير', translit: 'ṭāra · yaṭīr', cat: 'Movement', examples: [{ ar: 'طارَ الطائِرُ عالِيًا.', en: 'The bird flew high.' }] },
  { en: 'to swim', ar: 'سَبَحَ', present: 'يَسْبَح', translit: 'sabaḥa · yasbaḥ', cat: 'Movement', examples: [{ ar: 'سَبَحْنا في البَحْر.', en: 'We swam in the sea.' }] },
  { en: 'to jump', ar: 'قَفَزَ', present: 'يَقْفِز', translit: 'qafaza · yaqfiz', cat: 'Movement', examples: [{ ar: 'قَفَزَ فَوْقَ الحائِط.', en: 'He jumped over the wall.' }] },

  // ── Action / doing ────────────────────────────────────────
  { en: 'to do / to make', ar: 'فَعَلَ', present: 'يَفْعَل', translit: 'faʿala · yafʿal', cat: 'Action', examples: [{ ar: 'ماذا تَفْعَلُ الآن؟', en: 'What are you doing now?' }] },
  { en: 'to make / to manufacture', ar: 'صَنَعَ', present: 'يَصْنَع', translit: 'ṣanaʿa · yaṣnaʿ', cat: 'Action', examples: [{ ar: 'صَنَعْتُ كَعْكةً لِلضُّيوف.', en: 'I made a cake for the guests.' }] },
  { en: 'to work', ar: 'عَمِلَ', present: 'يَعْمَل', translit: 'ʿamila · yaʿmal', cat: 'Work & Money', examples: [{ ar: 'أَعْمَلُ في شَرِكةٍ كَبيرة.', en: 'I work at a big company.' }] },
  { en: 'to use', ar: 'اِسْتَخْدَمَ', present: 'يَسْتَخْدِم', translit: 'istakhdama · yastakhdim', cat: 'Action', examples: [{ ar: 'أَسْتَخْدِمُ الهاتِفَ لِلعَمَل.', en: 'I use the phone for work.' }] },
  { en: 'to open', ar: 'فَتَحَ', present: 'يَفْتَح', translit: 'fataḥa · yaftaḥ', cat: 'Action', examples: [{ ar: 'اِفْتَحِ البابَ رَجاءً.', en: 'Please open the door.' }] },
  { en: 'to close', ar: 'أَغْلَقَ', present: 'يُغْلِق', translit: 'aghlaqa · yughliq', cat: 'Action', examples: [{ ar: 'أَغْلَقْتُ النافِذةَ بِسَبَبِ البَرْد.', en: 'I closed the window because of the cold.' }] },
  { en: 'to give', ar: 'أَعْطى', present: 'يُعْطي', translit: 'aʿṭā · yuʿṭī', cat: 'Action', examples: [{ ar: 'أَعْطِني الكِتابَ مِنْ فَضْلِك.', en: 'Give me the book please.' }] },
  { en: 'to take', ar: 'أَخَذَ', present: 'يَأْخُذ', translit: 'akhadha · yaʾkhudh', cat: 'Action', examples: [{ ar: 'خُذْ هذا مَعَك.', en: 'Take this with you.' }] },
  { en: 'to put', ar: 'وَضَعَ', present: 'يَضَع', translit: 'waḍaʿa · yaḍaʿ', cat: 'Action', examples: [{ ar: 'وَضَعْتُ الكِتابَ على الطاوِلة.', en: 'I put the book on the table.' }] },
  { en: 'to carry', ar: 'حَمَلَ', present: 'يَحْمِل', translit: 'ḥamala · yaḥmil', cat: 'Action', examples: [{ ar: 'حَمَلَ الحَقيبةَ الثَّقيلة.', en: 'He carried the heavy bag.' }] },
  { en: 'to bring', ar: 'أَحْضَرَ', present: 'يُحْضِر', translit: 'aḥḍara · yuḥḍir', cat: 'Action', examples: [{ ar: 'أَحْضِرِ الماءَ مِنَ المَطْبَخ.', en: 'Bring the water from the kitchen.' }] },
  { en: 'to send', ar: 'أَرْسَلَ', present: 'يُرْسِل', translit: 'arsala · yursil', cat: 'Action', examples: [{ ar: 'أَرْسَلْتُ رِسالةً إِلَيْه.', en: 'I sent a message to him.' }] },
  { en: 'to receive', ar: 'اِسْتَلَمَ', present: 'يَسْتَلِم', translit: 'istalama · yastalim', cat: 'Action', examples: [{ ar: 'اِسْتَلَمْتُ الطَّرْدَ اليَوْم.', en: 'I received the package today.' }] },
  { en: 'to find', ar: 'وَجَدَ', present: 'يَجِد', translit: 'wajada · yajid', cat: 'Action', examples: [{ ar: 'وَجَدْتُ مِفْتاحي أَخيرًا.', en: 'I finally found my key.' }] },
  { en: 'to show', ar: 'أَرى', present: 'يُري', translit: 'arā · yurī', cat: 'Action', examples: [{ ar: 'أَراني الطَّريقَ إِلى المَحَطّة.', en: 'He showed me the way to the station.' }] },
  { en: 'to build', ar: 'بَنى', present: 'يَبْني', translit: 'banā · yabnī', cat: 'Action', examples: [{ ar: 'بَنَوْا بَيْتًا جَديدًا.', en: 'They built a new house.' }] },
  { en: 'to break', ar: 'كَسَرَ', present: 'يَكْسِر', translit: 'kasara · yaksir', cat: 'Action', examples: [{ ar: 'كَسَرْتُ الكوبَ بِالخَطَأ.', en: 'I broke the cup by accident.' }] },
  { en: 'to fix / to repair', ar: 'أَصْلَحَ', present: 'يُصْلِح', translit: 'aṣlaḥa · yuṣliḥ', cat: 'Action', examples: [{ ar: 'أَصْلَحَ السَّيّارةَ بِنَفْسِه.', en: 'He fixed the car himself.' }] },
  { en: 'to cut', ar: 'قَطَعَ', present: 'يَقْطَع', translit: 'qaṭaʿa · yaqṭaʿ', cat: 'Action', examples: [{ ar: 'قَطَعْتُ الوَرَقةَ إِلى نِصْفَيْن.', en: 'I cut the paper in half.' }] },
  { en: 'to throw', ar: 'رَمى', present: 'يَرْمي', translit: 'ramā · yarmī', cat: 'Action', examples: [{ ar: 'رَمى الكُرةَ بَعيدًا.', en: 'He threw the ball far.' }] },
  { en: 'to catch / to hold', ar: 'أَمْسَكَ', present: 'يُمْسِك', translit: 'amsaka · yumsik', cat: 'Action', examples: [{ ar: 'أَمْسَكْتُ الكُرةَ بِيَدَيّ.', en: 'I caught the ball with my hands.' }] },
  { en: 'to pull', ar: 'سَحَبَ', present: 'يَسْحَب', translit: 'saḥaba · yasḥab', cat: 'Action', examples: [{ ar: 'سَحَبَ الحَبْلَ بِقُوّة.', en: 'He pulled the rope hard.' }] },
  { en: 'to push', ar: 'دَفَعَ', present: 'يَدْفَع', translit: 'dafaʿa · yadfaʿ', cat: 'Action', examples: [{ ar: 'دَفَعَ البابَ فَانْفَتَح.', en: 'He pushed the door and it opened.' }] },

  // ── Home / daily ──────────────────────────────────────────
  { en: 'to cook', ar: 'طَبَخَ', present: 'يَطْبُخ', translit: 'ṭabakha · yaṭbukh', cat: 'Home', examples: [{ ar: 'طَبَخَتْ أُمّي الأَرُزَّ لِلعَشاء.', en: 'My mother cooked rice for dinner.' }] },
  { en: 'to clean', ar: 'نَظَّفَ', present: 'يُنَظِّف', translit: 'naẓẓafa · yunaẓẓif', cat: 'Home', examples: [{ ar: 'نَظَّفْتُ الغُرْفةَ صَباحًا.', en: 'I cleaned the room in the morning.' }] },
  { en: 'to wash', ar: 'غَسَلَ', present: 'يَغْسِل', translit: 'ghasala · yaghsil', cat: 'Home', examples: [{ ar: 'غَسَلْتُ يَدَيَّ قَبْلَ الأَكْل.', en: 'I washed my hands before eating.' }] },
  { en: 'to play', ar: 'لَعِبَ', present: 'يَلْعَب', translit: 'laʿiba · yalʿab', cat: 'Home', examples: [{ ar: 'يَلْعَبُ الأَطْفالُ في الحَديقة.', en: 'The children play in the park.' }] },
  { en: 'to live / to reside', ar: 'عاشَ', present: 'يَعيش', translit: 'ʿāsha · yaʿīsh', cat: 'Home', examples: [{ ar: 'أَعيشُ في المَدينةِ مُنْذُ سَنَوات.', en: 'I have lived in the city for years.' }] },

  // ── People / relationships ────────────────────────────────
  { en: 'to help', ar: 'ساعَدَ', present: 'يُساعِد', translit: 'sāʿada · yusāʿid', cat: 'People', examples: [{ ar: 'ساعِدْني رَجاءً.', en: 'Help me please.' }] },
  { en: 'to meet', ar: 'قابَلَ', present: 'يُقابِل', translit: 'qābala · yuqābil', cat: 'People', examples: [{ ar: 'قابَلْتُ صَديقي في السّوق.', en: 'I met my friend at the market.' }] },
  { en: 'to visit', ar: 'زارَ', present: 'يَزور', translit: 'zāra · yazūr', cat: 'People', examples: [{ ar: 'زُرْتُ جَدّي يَوْمَ الجُمُعة.', en: 'I visited my grandfather on Friday.' }] },
  { en: 'to serve', ar: 'خَدَمَ', present: 'يَخْدُم', translit: 'khadama · yakhdum', cat: 'People', examples: [{ ar: 'خَدَمَ النّاسَ طَوالَ حَياتِه.', en: 'He served people all his life.' }] },
  { en: 'to follow', ar: 'تَبِعَ', present: 'يَتْبَع', translit: 'tabiʿa · yatbaʿ', cat: 'People', examples: [{ ar: 'اِتْبَعْني إِلى الداخِل.', en: 'Follow me inside.' }] },
  { en: 'to lead', ar: 'قادَ', present: 'يَقود', translit: 'qāda · yaqūd', cat: 'People', examples: [{ ar: 'قادَ الفَريقَ إِلى الفَوْز.', en: 'He led the team to victory.' }] },
  { en: 'to allow / to permit', ar: 'سَمَحَ', present: 'يَسْمَح', translit: 'samaḥa · yasmaḥ', cat: 'People', examples: [{ ar: 'اِسْمَحْ لي أَنْ أَدْخُل.', en: 'Allow me to enter.' }] },
  { en: 'to prevent', ar: 'مَنَعَ', present: 'يَمْنَع', translit: 'manaʿa · yamnaʿ', cat: 'People', examples: [{ ar: 'مَنَعَهُ المَطَرُ مِنَ الخُروج.', en: 'The rain prevented him from going out.' }] },
  { en: 'to obey', ar: 'أَطاعَ', present: 'يُطيع', translit: 'aṭāʿa · yuṭīʿ', cat: 'People', examples: [{ ar: 'أَطاعَ والِدَيْهِ دائِمًا.', en: 'He always obeyed his parents.' }] },

  // ── Decisions / agreement ─────────────────────────────────
  { en: 'to accept', ar: 'قَبِلَ', present: 'يَقْبَل', translit: 'qabila · yaqbal', cat: 'People', examples: [{ ar: 'قَبِلْتُ الدَّعْوةَ بِسُرور.', en: 'I accepted the invitation gladly.' }] },
  { en: 'to refuse', ar: 'رَفَضَ', present: 'يَرْفُض', translit: 'rafaḍa · yarfuḍ', cat: 'People', examples: [{ ar: 'رَفَضَ العَرْضَ بِأَدَب.', en: 'He politely refused the offer.' }] },
  { en: 'to approve (of)', ar: 'وافَقَ', present: 'يُوافِق', translit: 'wāfaqa · yuwāfiq', cat: 'People', examples: [{ ar: 'وافَقْتُ على الخُطّة.', en: 'I approved of the plan.' }] },
  { en: 'to agree', ar: 'اِتَّفَقَ', present: 'يَتَّفِق', translit: 'ittafaqa · yattafiq', cat: 'People', examples: [{ ar: 'اِتَّفَقْنا على المَوْعِد.', en: 'We agreed on the time.' }] },
  { en: 'to choose', ar: 'اِخْتارَ', present: 'يَخْتار', translit: 'ikhtāra · yakhtār', cat: 'Mind', examples: [{ ar: 'اِخْتَرْتُ اللَّوْنَ الأَزْرَق.', en: 'I chose the blue color.' }] },
  { en: 'to decide', ar: 'قَرَّرَ', present: 'يُقَرِّر', translit: 'qarrara · yuqarrir', cat: 'Mind', examples: [{ ar: 'قَرَّرْتُ أَنْ أُسافِر.', en: 'I decided to travel.' }] },
  { en: 'to change', ar: 'غَيَّرَ', present: 'يُغَيِّر', translit: 'ghayyara · yughayyir', cat: 'Action', examples: [{ ar: 'غَيَّرْتُ رَأْيي في اللَّحْظةِ الأَخيرة.', en: 'I changed my mind at the last moment.' }] },
  { en: 'to need', ar: 'اِحْتاجَ', present: 'يَحْتاج', translit: 'iḥtāja · yaḥtāj', cat: 'Everyday', examples: [{ ar: 'أَحْتاجُ إِلى راحةٍ قَصيرة.', en: 'I need a short rest.' }] },

  // ── Process / states ──────────────────────────────────────
  { en: 'to begin / to start', ar: 'بَدَأَ', present: 'يَبْدَأ', translit: 'badaʾa · yabdaʾ', cat: 'Action', examples: [{ ar: 'بَدَأَ الدَّرْسُ في التاسِعة.', en: 'The lesson began at nine.' }] },
  { en: 'to finish', ar: 'أَنْهى', present: 'يُنْهي', translit: 'anhā · yunhī', cat: 'Action', examples: [{ ar: 'أَنْهَيْتُ عَمَلي مُبَكِّرًا.', en: 'I finished my work early.' }] },
  { en: 'to stop', ar: 'تَوَقَّفَ', present: 'يَتَوَقَّف', translit: 'tawaqqafa · yatawaqqaf', cat: 'Action', examples: [{ ar: 'تَوَقَّفَتِ السَّيّارةُ فَجْأة.', en: 'The car stopped suddenly.' }] },
  { en: 'to continue', ar: 'اِسْتَمَرَّ', present: 'يَسْتَمِرّ', translit: 'istamarra · yastamirr', cat: 'Action', examples: [{ ar: 'اِسْتَمَرَّ المَطَرُ طَوالَ اللَّيْل.', en: 'The rain continued all night.' }] },
  { en: 'to try', ar: 'حاوَلَ', present: 'يُحاوِل', translit: 'ḥāwala · yuḥāwil', cat: 'Action', examples: [{ ar: 'سَأُحاوِلُ مَرّةً أُخْرى.', en: 'I will try again.' }] },
  { en: 'to wait', ar: 'اِنْتَظَرَ', present: 'يَنْتَظِر', translit: 'intaẓara · yantaẓir', cat: 'Everyday', examples: [{ ar: 'اِنْتَظِرْني قَليلًا.', en: 'Wait for me a little.' }] },
  { en: 'to happen', ar: 'حَدَثَ', present: 'يَحْدُث', translit: 'ḥadatha · yaḥduth', cat: 'Everyday', examples: [{ ar: 'ماذا حَدَثَ هُنا؟', en: 'What happened here?' }] },
  { en: 'to become', ar: 'أَصْبَحَ', present: 'يُصْبِح', translit: 'aṣbaḥa · yuṣbiḥ', cat: 'Everyday', examples: [{ ar: 'أَصْبَحَ طَبيبًا ماهِرًا.', en: 'He became a skilled doctor.' }] },
  { en: 'to seem / to appear', ar: 'بَدا', present: 'يَبْدو', translit: 'badā · yabdū', cat: 'Everyday', examples: [{ ar: 'يَبْدو سَعيدًا اليَوْم.', en: 'He seems happy today.' }] },
  { en: 'to increase', ar: 'زادَ', present: 'يَزيد', translit: 'zāda · yazīd', cat: 'Work & Money', examples: [{ ar: 'زادَ السِّعْرُ هذا الشَّهْر.', en: 'The price increased this month.' }] },
  { en: 'to decrease', ar: 'نَقَصَ', present: 'يَنْقُص', translit: 'naqaṣa · yanquṣ', cat: 'Work & Money', examples: [{ ar: 'نَقَصَ الوَزْنُ قَليلًا.', en: 'The weight decreased a little.' }] },
  { en: 'to grow', ar: 'نَما', present: 'يَنْمو', translit: 'namā · yanmū', cat: 'Everyday', examples: [{ ar: 'نَمَتِ الشَّجَرةُ بِسُرْعة.', en: 'The tree grew quickly.' }] },

  // ── Achievement / conflict ────────────────────────────────
  { en: 'to win', ar: 'فازَ', present: 'يَفوز', translit: 'fāza · yafūz', cat: 'Action', examples: [{ ar: 'فازَ الفَريقُ بِالمُباراة.', en: 'The team won the match.' }] },
  { en: 'to lose (a game / money)', ar: 'خَسِرَ', present: 'يَخْسَر', translit: 'khasira · yakhsar', cat: 'Action', examples: [{ ar: 'خَسِرْنا المُباراةَ بِفارِقٍ صَغير.', en: 'We lost the match by a small margin.' }] },
  { en: 'to conquer / to subdue', ar: 'قَهَرَ', present: 'يَقْهَر', translit: 'qahara · yaqhar', cat: 'Action', examples: [{ ar: 'قَهَرَ الجَيْشُ عَدُوَّه.', en: 'The army conquered its enemy.' }] },
  { en: 'to overcome', ar: 'تَغَلَّبَ (على)', present: 'يَتَغَلَّب', translit: 'taghallaba ʿalā · yataghallab', cat: 'Action', examples: [{ ar: 'تَغَلَّبَ على خَوْفِه.', en: 'He overcame his fear.' }] },
  { en: 'to fight', ar: 'قاتَلَ', present: 'يُقاتِل', translit: 'qātala · yuqātil', cat: 'Action', examples: [{ ar: 'قاتَلَ بِشَجاعةٍ كَبيرة.', en: 'He fought with great courage.' }] },
  { en: 'to protect', ar: 'حَمى', present: 'يَحْمي', translit: 'ḥamā · yaḥmī', cat: 'Action', examples: [{ ar: 'يَحْمي الأَبُ عائِلَتَه.', en: 'The father protects his family.' }] },
  { en: 'to save / to rescue', ar: 'أَنْقَذَ', present: 'يُنْقِذ', translit: 'anqadha · yunqidh', cat: 'Action', examples: [{ ar: 'أَنْقَذَ الطِّفْلَ مِنَ الماء.', en: 'He saved the child from the water.' }] },

  // ── Faith / worship ───────────────────────────────────────
  { en: 'to pray', ar: 'صَلّى', present: 'يُصَلّي', translit: 'ṣallā · yuṣallī', cat: 'Faith', examples: [{ ar: 'أُصَلّي الفَجْرَ في المَسْجِد.', en: 'I pray Fajr at the mosque.' }] },
  { en: 'to fast', ar: 'صامَ', present: 'يَصوم', translit: 'ṣāma · yaṣūm', cat: 'Faith', examples: [{ ar: 'نَصومُ شَهْرَ رَمَضان.', en: 'We fast the month of Ramadan.' }] },
  { en: 'to worship', ar: 'عَبَدَ', present: 'يَعْبُد', translit: 'ʿabada · yaʿbud', cat: 'Faith', examples: [{ ar: 'نَعْبُدُ اللهَ وَحْدَه.', en: 'We worship God alone.' }] },
  { en: 'to forgive', ar: 'غَفَرَ', present: 'يَغْفِر', translit: 'ghafara · yaghfir', cat: 'Faith', examples: [{ ar: 'نَرْجو أَنْ يَغْفِرَ اللهُ لَنا.', en: 'We hope that God forgives us.' }] },
  { en: 'to remember / to mention (God)', ar: 'ذَكَرَ', present: 'يَذْكُر', translit: 'dhakara · yadhkur', cat: 'Faith', examples: [{ ar: 'نَذْكُرُ اللهَ في كُلِّ وَقْت.', en: 'We remember God at all times.' }] },

  // ════════════════════════════════════════════════════════
  //  Batch 2 — more everyday verbs
  // ════════════════════════════════════════════════════════

  // ── Food & cooking ────────────────────────────────────────
  { en: 'to prepare', ar: 'حَضَّرَ', present: 'يُحَضِّر', translit: 'ḥaḍḍara · yuḥaḍḍir', cat: 'Food', examples: [{ ar: 'حَضَّرْتُ العَشاءَ لِلعائِلة.', en: 'I prepared dinner for the family.' }] },
  { en: 'to boil', ar: 'غَلى', present: 'يَغْلي', translit: 'ghalā · yaghlī', cat: 'Food', examples: [{ ar: 'غَلَتِ المِياهُ بِسُرْعة.', en: 'The water boiled quickly.' }] },
  { en: 'to fry', ar: 'قَلى', present: 'يَقْلي', translit: 'qalā · yaqlī', cat: 'Food', examples: [{ ar: 'قَلَتْ أُمّي البَيْض.', en: 'My mother fried the eggs.' }] },
  { en: 'to bake', ar: 'خَبَزَ', present: 'يَخْبِز', translit: 'khabaza · yakhbiz', cat: 'Food', examples: [{ ar: 'خَبَزَ الخَبّازُ الخُبْزَ طازِجًا.', en: 'The baker baked the bread fresh.' }] },
  { en: 'to taste', ar: 'ذاقَ', present: 'يَذوق', translit: 'dhāqa · yadhūq', cat: 'Food', examples: [{ ar: 'ذُقْتُ الحَساءَ فَأَعْجَبَني.', en: 'I tasted the soup and liked it.' }] },
  { en: 'to mix', ar: 'خَلَطَ', present: 'يَخْلِط', translit: 'khalaṭa · yakhliṭ', cat: 'Food', examples: [{ ar: 'خَلَطْتُ السُّكَّرَ بِالحَليب.', en: 'I mixed the sugar with the milk.' }] },
  { en: 'to add', ar: 'أَضافَ', present: 'يُضيف', translit: 'aḍāfa · yuḍīf', cat: 'Food', examples: [{ ar: 'أَضِفْ قَليلًا مِنَ المِلْح.', en: 'Add a little salt.' }] },
  { en: 'to pour', ar: 'سَكَبَ', present: 'يَسْكُب', translit: 'sakaba · yaskub', cat: 'Home', examples: [{ ar: 'سَكَبْتُ الماءَ في الكوب.', en: 'I poured the water into the glass.' }] },
  { en: 'to fill', ar: 'مَلَأَ', present: 'يَمْلَأ', translit: 'malaʾa · yamlaʾ', cat: 'Everyday', examples: [{ ar: 'مَلَأْتُ الكوبَ بِالعَصير.', en: 'I filled the glass with juice.' }] },
  { en: 'to feed', ar: 'أَطْعَمَ', present: 'يُطْعِم', translit: 'aṭʿama · yuṭʿim', cat: 'Home', examples: [{ ar: 'أَطْعَمْتُ القِطَّةَ صَباحًا.', en: 'I fed the cat in the morning.' }] },

  // ── Body & health ─────────────────────────────────────────
  { en: 'to breathe', ar: 'تَنَفَّسَ', present: 'يَتَنَفَّس', translit: 'tanaffasa · yatanaffas', cat: 'Body', examples: [{ ar: 'تَنَفَّسْتُ الهَواءَ النَّقِيّ.', en: 'I breathed the fresh air.' }] },
  { en: 'to smell', ar: 'شَمَّ', present: 'يَشُمّ', translit: 'shamma · yashumm', cat: 'Body', examples: [{ ar: 'شَمَمْتُ رائِحةَ الوَرْد.', en: 'I smelled the scent of roses.' }] },
  { en: 'to touch', ar: 'لَمَسَ', present: 'يَلْمِس', translit: 'lamasa · yalmis', cat: 'Body', examples: [{ ar: 'لا تَلْمِسِ النارَ.', en: "Don't touch the fire." }] },
  { en: 'to be tired', ar: 'تَعِبَ', present: 'يَتْعَب', translit: 'taʿiba · yatʿab', cat: 'Body', examples: [{ ar: 'تَعِبْتُ مِنَ العَمَلِ الطَّويل.', en: 'I got tired from the long work.' }] },
  { en: 'to be hungry', ar: 'جاعَ', present: 'يَجوع', translit: 'jāʿa · yajūʿ', cat: 'Body', examples: [{ ar: 'جِعْتُ بَعْدَ الرِّياضة.', en: 'I got hungry after exercise.' }] },
  { en: 'to be thirsty', ar: 'عَطِشَ', present: 'يَعْطَش', translit: 'ʿaṭisha · yaʿṭash', cat: 'Body', examples: [{ ar: 'عَطِشْتُ في الحَرِّ الشَّديد.', en: 'I got thirsty in the intense heat.' }] },
  { en: 'to heal / to cure', ar: 'شَفى', present: 'يَشْفي', translit: 'shafā · yashfī', cat: 'Body', examples: [{ ar: 'شَفى اللهُ المَريض.', en: 'God healed the sick person.' }] },
  { en: 'to treat (medically)', ar: 'عالَجَ', present: 'يُعالِج', translit: 'ʿālaja · yuʿālij', cat: 'Body', examples: [{ ar: 'عالَجَ الطَّبيبُ المَريض.', en: 'The doctor treated the patient.' }] },
  { en: 'to suffer', ar: 'عانى', present: 'يُعاني', translit: 'ʿānā · yuʿānī', cat: 'Feelings', examples: [{ ar: 'عانى مِنَ المَرَضِ طَويلًا.', en: 'He suffered from illness for a long time.' }] },
  { en: 'to grow up', ar: 'كَبِرَ', present: 'يَكْبَر', translit: 'kabira · yakbar', cat: 'People', examples: [{ ar: 'كَبِرَ الأَطْفالُ بِسُرْعة.', en: 'The children grew up quickly.' }] },

  // ── Feelings & states ─────────────────────────────────────
  { en: 'to be happy', ar: 'فَرِحَ', present: 'يَفْرَح', translit: 'fariḥa · yafraḥ', cat: 'Feelings', examples: [{ ar: 'فَرِحْتُ بِنَجاحِك.', en: 'I was happy at your success.' }] },
  { en: 'to be sad', ar: 'حَزِنَ', present: 'يَحْزَن', translit: 'ḥazina · yaḥzan', cat: 'Feelings', examples: [{ ar: 'حَزِنَ لِفِراقِ صَديقِه.', en: 'He was sad at parting from his friend.' }] },
  { en: 'to be angry', ar: 'غَضِبَ', present: 'يَغْضَب', translit: 'ghaḍiba · yaghḍab', cat: 'Feelings', examples: [{ ar: 'غَضِبَ المُديرُ مِنَ التَّأْخير.', en: 'The manager got angry at the delay.' }] },
  { en: 'to worry', ar: 'قَلِقَ', present: 'يَقْلَق', translit: 'qaliqa · yaqlaq', cat: 'Feelings', examples: [{ ar: 'لا تَقْلَقْ، كُلُّ شَيْءٍ بِخَيْر.', en: "Don't worry, everything is fine." }] },
  { en: 'to enjoy', ar: 'اِسْتَمْتَعَ', present: 'يَسْتَمْتِع', translit: 'istamtaʿa · yastamtiʿ', cat: 'Feelings', examples: [{ ar: 'اِسْتَمْتَعْنا بِالرِّحْلة.', en: 'We enjoyed the trip.' }] },
  { en: 'to smile', ar: 'اِبْتَسَمَ', present: 'يَبْتَسِم', translit: 'ibtasama · yabtasim', cat: 'Feelings', examples: [{ ar: 'اِبْتَسَمَتْ لي بِلُطْف.', en: 'She smiled at me kindly.' }] },
  { en: 'to expect', ar: 'تَوَقَّعَ', present: 'يَتَوَقَّع', translit: 'tawaqqaʿa · yatawaqqaʿ', cat: 'Mind', examples: [{ ar: 'تَوَقَّعْتُ نَتيجةً أَفْضَل.', en: 'I expected a better result.' }] },
  { en: 'to regret', ar: 'نَدِمَ', present: 'يَنْدَم', translit: 'nadima · yandam', cat: 'Feelings', examples: [{ ar: 'نَدِمَ على كَلامِه.', en: 'He regretted his words.' }] },
  { en: 'to trust', ar: 'وَثِقَ', present: 'يَثِق', translit: 'wathiqa · yathiq', cat: 'Feelings', examples: [{ ar: 'أَثِقُ بِصَديقي تَمامًا.', en: 'I fully trust my friend.' }] },
  { en: 'to doubt', ar: 'شَكَّ', present: 'يَشُكّ', translit: 'shakka · yashukk', cat: 'Mind', examples: [{ ar: 'شَكَّ في صِحّةِ الخَبَر.', en: 'He doubted the truth of the news.' }] },

  // ── Faith ─────────────────────────────────────────────────
  { en: 'to believe (have faith)', ar: 'آمَنَ', present: 'يُؤْمِن', translit: 'āmana · yuʾmin', cat: 'Faith', examples: [{ ar: 'آمَنَ بِاللهِ وَرَسولِه.', en: 'He believed in God and His Messenger.' }] },
  { en: 'to repent', ar: 'تابَ', present: 'يَتوب', translit: 'tāba · yatūb', cat: 'Faith', examples: [{ ar: 'تابَ إِلى اللهِ مِنْ ذَنْبِه.', en: 'He repented to God from his sin.' }] },
  { en: 'to praise (God)', ar: 'حَمِدَ', present: 'يَحْمَد', translit: 'ḥamida · yaḥmad', cat: 'Faith', examples: [{ ar: 'نَحْمَدُ اللهَ على نِعَمِه.', en: 'We praise God for His blessings.' }] },
  { en: 'to give charity', ar: 'تَصَدَّقَ', present: 'يَتَصَدَّق', translit: 'taṣaddaqa · yataṣaddaq', cat: 'Faith', examples: [{ ar: 'تَصَدَّقَ على الفُقَراء.', en: 'He gave charity to the poor.' }] },

  // ── Speaking & social ─────────────────────────────────────
  { en: 'to call out / to summon', ar: 'نادى', present: 'يُنادي', translit: 'nādā · yunādī', cat: 'Speaking', examples: [{ ar: 'نادى على صَديقِه.', en: 'He called out to his friend.' }] },
  { en: 'to invite', ar: 'دَعا', present: 'يَدْعو', translit: 'daʿā · yadʿū', cat: 'People', examples: [{ ar: 'دَعَوْتُهُ إِلى الحَفْلة.', en: 'I invited him to the party.' }] },
  { en: 'to welcome', ar: 'رَحَّبَ', present: 'يُرَحِّب', translit: 'raḥḥaba · yuraḥḥib', cat: 'People', examples: [{ ar: 'رَحَّبَ بِالضُّيوفِ بِحَرارة.', en: 'He warmly welcomed the guests.' }] },
  { en: 'to greet', ar: 'سَلَّمَ', present: 'يُسَلِّم', translit: 'sallama · yusallim', cat: 'People', examples: [{ ar: 'سَلَّمْتُ على جيراني.', en: 'I greeted my neighbors.' }] },
  { en: 'to advise', ar: 'نَصَحَ', present: 'يَنْصَح', translit: 'naṣaḥa · yanṣaḥ', cat: 'People', examples: [{ ar: 'نَصَحَني بِالصَّبْر.', en: 'He advised me to be patient.' }] },
  { en: 'to warn', ar: 'حَذَّرَ', present: 'يُحَذِّر', translit: 'ḥadhdhara · yuḥadhdhir', cat: 'People', examples: [{ ar: 'حَذَّرَهُ مِنَ الخَطَر.', en: 'He warned him of the danger.' }] },
  { en: 'to congratulate', ar: 'هَنَّأَ', present: 'يُهَنِّئ', translit: 'hannaʾa · yuhanniʾ', cat: 'People', examples: [{ ar: 'هَنَّأْتُهُ بِالنَّجاح.', en: 'I congratulated him on his success.' }] },
  { en: 'to complain', ar: 'اِشْتَكى', present: 'يَشْتَكي', translit: 'ishtakā · yashtakī', cat: 'Speaking', examples: [{ ar: 'اِشْتَكى مِنَ الأَلَم.', en: 'He complained of the pain.' }] },
  { en: 'to discuss', ar: 'ناقَشَ', present: 'يُناقِش', translit: 'nāqasha · yunāqish', cat: 'Speaking', examples: [{ ar: 'ناقَشْنا المَوْضوعَ طَويلًا.', en: 'We discussed the topic at length.' }] },
  { en: 'to argue', ar: 'جادَلَ', present: 'يُجادِل', translit: 'jādala · yujādil', cat: 'Speaking', examples: [{ ar: 'جادَلَهُ في الرَّأْي.', en: 'He argued with him about the opinion.' }] },
  { en: 'to describe', ar: 'وَصَفَ', present: 'يَصِف', translit: 'waṣafa · yaṣif', cat: 'Speaking', examples: [{ ar: 'وَصَفَ المَكانَ بِدِقّة.', en: 'He described the place precisely.' }] },
  { en: 'to repeat', ar: 'كَرَّرَ', present: 'يُكَرِّر', translit: 'karrara · yukarrir', cat: 'Speaking', examples: [{ ar: 'كَرِّرِ الجُمْلةَ رَجاءً.', en: 'Repeat the sentence please.' }] },
  { en: 'to suggest / to propose', ar: 'اِقْتَرَحَ', present: 'يَقْتَرِح', translit: 'iqtaraḥa · yaqtariḥ', cat: 'Speaking', examples: [{ ar: 'اِقْتَرَحْتُ فِكْرةً جَديدة.', en: 'I suggested a new idea.' }] },
  { en: 'to lie', ar: 'كَذَبَ', present: 'يَكْذِب', translit: 'kadhaba · yakdhib', cat: 'Speaking', examples: [{ ar: 'لا تَكْذِبْ أَبَدًا.', en: 'Never lie.' }] },
  { en: 'to tell the truth', ar: 'صَدَقَ', present: 'يَصْدُق', translit: 'ṣadaqa · yaṣduq', cat: 'Speaking', examples: [{ ar: 'اِصْدُقْ دائِمًا.', en: 'Always tell the truth.' }] },

  // ── Mind & study ──────────────────────────────────────────
  { en: 'to memorize', ar: 'حَفِظَ', present: 'يَحْفَظ', translit: 'ḥafiẓa · yaḥfaẓ', cat: 'Mind', examples: [{ ar: 'حَفِظْتُ القَصيدة.', en: 'I memorized the poem.' }] },
  { en: 'to review', ar: 'راجَعَ', present: 'يُراجِع', translit: 'rājaʿa · yurājiʿ', cat: 'Mind', examples: [{ ar: 'راجَعْتُ الدَّرْسَ قَبْلَ النَّوْم.', en: 'I reviewed the lesson before sleeping.' }] },
  { en: 'to translate', ar: 'تَرْجَمَ', present: 'يُتَرْجِم', translit: 'tarjama · yutarjim', cat: 'Mind', examples: [{ ar: 'تَرْجَمَ الكِتابَ إِلى العَرَبِيّة.', en: 'He translated the book into Arabic.' }] },
  { en: 'to solve', ar: 'حَلَّ', present: 'يَحُلّ', translit: 'ḥalla · yaḥull', cat: 'Mind', examples: [{ ar: 'حَلَلْتُ المَسْأَلة.', en: 'I solved the problem.' }] },
  { en: 'to calculate', ar: 'حَسَبَ', present: 'يَحْسُب', translit: 'ḥasaba · yaḥsub', cat: 'Work & Money', examples: [{ ar: 'حَسَبْتُ التَّكاليفَ كُلَّها.', en: 'I calculated all the costs.' }] },
  { en: 'to count', ar: 'عَدَّ', present: 'يَعُدّ', translit: 'ʿadda · yaʿudd', cat: 'Everyday', examples: [{ ar: 'عَدَدْتُ النُّقودَ مَرَّتَيْن.', en: 'I counted the money twice.' }] },
  { en: 'to measure', ar: 'قاسَ', present: 'يَقيس', translit: 'qāsa · yaqīs', cat: 'Everyday', examples: [{ ar: 'قِسْتُ طولَ الغُرْفة.', en: 'I measured the length of the room.' }] },
  { en: 'to imagine', ar: 'تَخَيَّلَ', present: 'يَتَخَيَّل', translit: 'takhayyala · yatakhayyal', cat: 'Mind', examples: [{ ar: 'تَخَيَّلْ مُسْتَقْبَلًا أَفْضَل.', en: 'Imagine a better future.' }] },
  { en: 'to dream', ar: 'حَلَمَ', present: 'يَحْلُم', translit: 'ḥalama · yaḥlum', cat: 'Mind', examples: [{ ar: 'حَلَمْتُ بِحُلْمٍ جَميل.', en: 'I had a beautiful dream.' }] },
  { en: 'to notice', ar: 'لاحَظَ', present: 'يُلاحِظ', translit: 'lāḥaẓa · yulāḥiẓ', cat: 'Mind', examples: [{ ar: 'لاحَظْتُ تَغَيُّرًا في وَجْهِه.', en: 'I noticed a change in his face.' }] },
  { en: 'to discover', ar: 'اِكْتَشَفَ', present: 'يَكْتَشِف', translit: 'iktashafa · yaktashif', cat: 'Mind', examples: [{ ar: 'اِكْتَشَفَ العُلَماءُ دَواءً جَديدًا.', en: 'Scientists discovered a new medicine.' }] },
  { en: 'to search / to look for', ar: 'بَحَثَ', present: 'يَبْحَث', translit: 'baḥatha · yabḥath', cat: 'Mind', examples: [{ ar: 'بَحَثْتُ عَنْ مِفْتاحي.', en: 'I searched for my key.' }] },
  { en: 'to examine / to inspect', ar: 'فَحَصَ', present: 'يَفْحَص', translit: 'faḥaṣa · yafḥaṣ', cat: 'Mind', examples: [{ ar: 'فَحَصَ الطَّبيبُ المَريض.', en: 'The doctor examined the patient.' }] },
  { en: 'to test', ar: 'اِخْتَبَرَ', present: 'يَخْتَبِر', translit: 'ikhtabara · yakhtabir', cat: 'Mind', examples: [{ ar: 'اِخْتَبَرَ المُعَلِّمُ الطُّلّاب.', en: 'The teacher tested the students.' }] },
  { en: 'to check / to verify', ar: 'تَحَقَّقَ', present: 'يَتَحَقَّق', translit: 'taḥaqqaqa · yataḥaqqaq', cat: 'Mind', examples: [{ ar: 'تَحَقَّقْتُ مِنَ العُنْوان.', en: 'I verified the address.' }] },
  { en: 'to prove', ar: 'أَثْبَتَ', present: 'يُثْبِت', translit: 'athbata · yuthbit', cat: 'Mind', examples: [{ ar: 'أَثْبَتَ صِحّةَ كَلامِه.', en: 'He proved the truth of his words.' }] },
  { en: 'to mean / to intend', ar: 'قَصَدَ', present: 'يَقْصِد', translit: 'qaṣada · yaqṣid', cat: 'Mind', examples: [{ ar: 'ماذا تَقْصِدُ بِذلِك؟', en: 'What do you mean by that?' }] },
  { en: 'to prefer', ar: 'فَضَّلَ', present: 'يُفَضِّل', translit: 'faḍḍala · yufaḍḍil', cat: 'Mind', examples: [{ ar: 'أُفَضِّلُ الشايَ على القَهْوة.', en: 'I prefer tea over coffee.' }] },
  { en: 'to plan', ar: 'خَطَّطَ', present: 'يُخَطِّط', translit: 'khaṭṭaṭa · yukhaṭṭiṭ', cat: 'Work & Money', examples: [{ ar: 'خَطَّطْنا لِلرِّحْلة.', en: 'We planned for the trip.' }] },
  { en: 'to organize / to arrange', ar: 'رَتَّبَ', present: 'يُرَتِّب', translit: 'rattaba · yurattib', cat: 'Home', examples: [{ ar: 'رَتَّبْتُ غُرْفَتي.', en: 'I arranged my room.' }] },

  // ── Getting, giving, money ────────────────────────────────
  { en: 'to get / to obtain', ar: 'حَصَلَ', present: 'يَحْصُل', translit: 'ḥaṣala · yaḥṣul', cat: 'Everyday', examples: [{ ar: 'حَصَلْتُ على وَظيفةٍ جَديدة.', en: 'I got a new job.' }] },
  { en: 'to gather / to collect', ar: 'جَمَعَ', present: 'يَجْمَع', translit: 'jamaʿa · yajmaʿ', cat: 'Action', examples: [{ ar: 'جَمَعْتُ الأَوْراقَ مِنَ الأَرْض.', en: 'I gathered the papers from the ground.' }] },
  { en: 'to share', ar: 'شارَكَ', present: 'يُشارِك', translit: 'shāraka · yushārik', cat: 'People', examples: [{ ar: 'شارَكْتُهُ طَعامي.', en: 'I shared my food with him.' }] },
  { en: 'to distribute', ar: 'وَزَّعَ', present: 'يُوَزِّع', translit: 'wazzaʿa · yuwazziʿ', cat: 'Action', examples: [{ ar: 'وَزَّعَ الهَدايا على الأَطْفال.', en: 'He distributed the gifts to the children.' }] },
  { en: 'to lend', ar: 'أَقْرَضَ', present: 'يُقْرِض', translit: 'aqraḍa · yuqriḍ', cat: 'Work & Money', examples: [{ ar: 'أَقْرَضْتُهُ بَعْضَ المال.', en: 'I lent him some money.' }] },
  { en: 'to borrow', ar: 'اِسْتَعارَ', present: 'يَسْتَعير', translit: 'istaʿāra · yastaʿīr', cat: 'Work & Money', examples: [{ ar: 'اِسْتَعَرْتُ كِتابًا مِنَ المَكْتَبة.', en: 'I borrowed a book from the library.' }] },
  { en: 'to earn / to gain', ar: 'كَسَبَ', present: 'يَكْسِب', translit: 'kasaba · yaksib', cat: 'Work & Money', examples: [{ ar: 'يَكْسِبُ مالًا مِنْ عَمَلِه.', en: 'He earns money from his work.' }] },
  { en: 'to spend (money)', ar: 'أَنْفَقَ', present: 'يُنْفِق', translit: 'anfaqa · yunfiq', cat: 'Work & Money', examples: [{ ar: 'أَنْفَقْتُ الكَثيرَ هذا الشَّهْر.', en: 'I spent a lot this month.' }] },
  { en: 'to save / to set aside', ar: 'وَفَّرَ', present: 'يُوَفِّر', translit: 'waffara · yuwaffir', cat: 'Work & Money', examples: [{ ar: 'أُوَفِّرُ جُزْءًا مِنْ راتِبي.', en: 'I save part of my salary.' }] },
  { en: 'to rent', ar: 'اِسْتَأْجَرَ', present: 'يَسْتَأْجِر', translit: 'istaʾjara · yastaʾjir', cat: 'Work & Money', examples: [{ ar: 'اِسْتَأْجَرْتُ شَقّةً صَغيرة.', en: 'I rented a small apartment.' }] },
  { en: 'to own / to possess', ar: 'مَلَكَ', present: 'يَمْلِك', translit: 'malaka · yamlik', cat: 'Work & Money', examples: [{ ar: 'يَمْلِكُ بَيْتًا كَبيرًا.', en: 'He owns a big house.' }] },
  { en: 'to order (goods / food)', ar: 'طَلَبَ', present: 'يَطْلُب', translit: 'ṭalaba · yaṭlub', cat: 'Work & Money', examples: [{ ar: 'طَلَبْتُ القَهْوة.', en: 'I ordered coffee.' }] },
  { en: 'to reserve / to book', ar: 'حَجَزَ', present: 'يَحْجِز', translit: 'ḥajaza · yaḥjiz', cat: 'Work & Money', examples: [{ ar: 'حَجَزْتُ تَذْكِرةَ طائِرة.', en: 'I booked a plane ticket.' }] },
  { en: 'to cancel', ar: 'أَلْغى', present: 'يُلْغي', translit: 'alghā · yulghī', cat: 'Everyday', examples: [{ ar: 'أَلْغَيْتُ المَوْعِد.', en: 'I canceled the appointment.' }] },
  { en: 'to postpone / to delay', ar: 'أَجَّلَ', present: 'يُؤَجِّل', translit: 'ajjala · yuʾajjil', cat: 'Everyday', examples: [{ ar: 'أَجَّلْنا الاِجْتِماع.', en: 'We postponed the meeting.' }] },

  // ── Going out & social ────────────────────────────────────
  { en: 'to hurry', ar: 'أَسْرَعَ', present: 'يُسْرِع', translit: 'asraʿa · yusriʿ', cat: 'Movement', examples: [{ ar: 'أَسْرِعْ، لَقَدْ تَأَخَّرْنا.', en: "Hurry, we're late." }] },
  { en: 'to attend', ar: 'حَضَرَ', present: 'يَحْضُر', translit: 'ḥaḍara · yaḥḍur', cat: 'People', examples: [{ ar: 'حَضَرْتُ المُحاضَرة.', en: 'I attended the lecture.' }] },
  { en: 'to join', ar: 'اِنْضَمَّ', present: 'يَنْضَمّ', translit: 'inḍamma · yanḍamm', cat: 'People', examples: [{ ar: 'اِنْضَمَمْتُ إِلى الفَريق.', en: 'I joined the team.' }] },
  { en: 'to participate', ar: 'اِشْتَرَكَ', present: 'يَشْتَرِك', translit: 'ishtaraka · yashtarik', cat: 'People', examples: [{ ar: 'اِشْتَرَكْتُ في المُسابَقة.', en: 'I participated in the competition.' }] },
  { en: 'to celebrate', ar: 'اِحْتَفَلَ', present: 'يَحْتَفِل', translit: 'iḥtafala · yaḥtafil', cat: 'People', examples: [{ ar: 'اِحْتَفَلْنا بِعيدِ ميلادِه.', en: 'We celebrated his birthday.' }] },
  { en: 'to marry', ar: 'تَزَوَّجَ', present: 'يَتَزَوَّج', translit: 'tazawwaja · yatazawwaj', cat: 'People', examples: [{ ar: 'تَزَوَّجَ العامَ الماضي.', en: 'He got married last year.' }] },
  { en: 'to raise (children)', ar: 'رَبّى', present: 'يُرَبّي', translit: 'rabbā · yurabbī', cat: 'People', examples: [{ ar: 'رَبّى أَوْلادَهُ تَرْبِيةً حَسَنة.', en: 'He raised his children well.' }] },

  // ── Movement & body ───────────────────────────────────────
  { en: 'to move', ar: 'تَحَرَّكَ', present: 'يَتَحَرَّك', translit: 'taḥarraka · yataḥarrak', cat: 'Movement', examples: [{ ar: 'تَحَرَّكَ القِطارُ بِبُطْء.', en: 'The train moved slowly.' }] },
  { en: 'to turn around', ar: 'اِسْتَدارَ', present: 'يَسْتَدير', translit: 'istadāra · yastadīr', cat: 'Movement', examples: [{ ar: 'اِسْتَدارَ إِلى الخَلْف.', en: 'He turned around.' }] },
  { en: 'to climb', ar: 'تَسَلَّقَ', present: 'يَتَسَلَّق', translit: 'tasallaqa · yatasallaq', cat: 'Movement', examples: [{ ar: 'تَسَلَّقَ الجَبَل.', en: 'He climbed the mountain.' }] },
  { en: 'to go down / to descend', ar: 'نَزَلَ', present: 'يَنْزِل', translit: 'nazala · yanzil', cat: 'Movement', examples: [{ ar: 'نَزَلْتُ مِنَ الحافِلة.', en: 'I got off the bus.' }] },
  { en: 'to go up / to ascend', ar: 'صَعِدَ', present: 'يَصْعَد', translit: 'ṣaʿida · yaṣʿad', cat: 'Movement', examples: [{ ar: 'صَعِدْتُ إِلى الطابِقِ الأَعْلى.', en: 'I went up to the top floor.' }] },
  { en: 'to fall', ar: 'سَقَطَ', present: 'يَسْقُط', translit: 'saqaṭa · yasquṭ', cat: 'Movement', examples: [{ ar: 'سَقَطَ الكِتابُ مِنْ يَدي.', en: 'The book fell from my hand.' }] },
  { en: 'to ride', ar: 'رَكِبَ', present: 'يَرْكَب', translit: 'rakiba · yarkab', cat: 'Movement', examples: [{ ar: 'رَكِبْتُ الحافِلةَ إِلى المَدْرَسة.', en: 'I rode the bus to school.' }] },

  // ── Arts & leisure ────────────────────────────────────────
  { en: 'to dance', ar: 'رَقَصَ', present: 'يَرْقُص', translit: 'raqaṣa · yarquṣ', cat: 'Action', examples: [{ ar: 'رَقَصَ النّاسُ في الحَفْلة.', en: 'People danced at the party.' }] },
  { en: 'to sing', ar: 'غَنّى', present: 'يُغَنّي', translit: 'ghannā · yughannī', cat: 'Action', examples: [{ ar: 'غَنّى أُغْنِيةً جَميلة.', en: 'He sang a beautiful song.' }] },
  { en: 'to draw / to paint', ar: 'رَسَمَ', present: 'يَرْسُم', translit: 'rasama · yarsum', cat: 'Action', examples: [{ ar: 'رَسَمْتُ صورةً لِلبَحْر.', en: 'I drew a picture of the sea.' }] },
  { en: 'to watch', ar: 'شاهَدَ', present: 'يُشاهِد', translit: 'shāhada · yushāhid', cat: 'Everyday', examples: [{ ar: 'شاهَدْنا فِلْمًا مُمْتِعًا.', en: 'We watched an enjoyable film.' }] },
  { en: 'to listen', ar: 'اِسْتَمَعَ', present: 'يَسْتَمِع', translit: 'istamaʿa · yastamiʿ', cat: 'Everyday', examples: [{ ar: 'اِسْتَمَعْتُ إِلى القُرْآن.', en: 'I listened to the Quran.' }] },

  // ── Hands-on / household ──────────────────────────────────
  { en: 'to knock', ar: 'طَرَقَ', present: 'يَطْرُق', translit: 'ṭaraqa · yaṭruq', cat: 'Everyday', examples: [{ ar: 'طَرَقَ البابَ بِلُطْف.', en: 'He knocked on the door gently.' }] },
  { en: 'to hit / to strike', ar: 'ضَرَبَ', present: 'يَضْرِب', translit: 'ḍaraba · yaḍrib', cat: 'Action', examples: [{ ar: 'ضَرَبَ الكُرةَ بِقَدَمِه.', en: 'He struck the ball with his foot.' }] },
  { en: 'to press / to push down', ar: 'ضَغَطَ', present: 'يَضْغَط', translit: 'ḍaghaṭa · yaḍghaṭ', cat: 'Action', examples: [{ ar: 'ضَغَطْتُ على الزِّرّ.', en: 'I pressed the button.' }] },
  { en: 'to wipe', ar: 'مَسَحَ', present: 'يَمْسَح', translit: 'masaḥa · yamsaḥ', cat: 'Home', examples: [{ ar: 'مَسَحْتُ الطاوِلة.', en: 'I wiped the table.' }] },
  { en: 'to shake', ar: 'هَزَّ', present: 'يَهُزّ', translit: 'hazza · yahuzz', cat: 'Action', examples: [{ ar: 'هَزَّ رَأْسَهُ مُوافِقًا.', en: 'He shook his head in agreement.' }] },
  { en: 'to tie', ar: 'رَبَطَ', present: 'يَرْبِط', translit: 'rabaṭa · yarbiṭ', cat: 'Action', examples: [{ ar: 'رَبَطْتُ الحِذاء.', en: 'I tied my shoe.' }] },
  { en: 'to hang / to suspend', ar: 'عَلَّقَ', present: 'يُعَلِّق', translit: 'ʿallaqa · yuʿalliq', cat: 'Home', examples: [{ ar: 'عَلَّقْتُ الصورةَ على الجِدار.', en: 'I hung the picture on the wall.' }] },
  { en: 'to dig', ar: 'حَفَرَ', present: 'يَحْفِر', translit: 'ḥafara · yaḥfir', cat: 'Action', examples: [{ ar: 'حَفَروا بِئْرًا عَميقة.', en: 'They dug a deep well.' }] },

  // ── Devices & work ────────────────────────────────────────
  { en: 'to turn on / to operate', ar: 'شَغَّلَ', present: 'يُشَغِّل', translit: 'shaghghala · yushaghghil', cat: 'Everyday', examples: [{ ar: 'شَغَّلْتُ الحاسوب.', en: 'I turned on the computer.' }] },
  { en: 'to turn off', ar: 'أَطْفَأَ', present: 'يُطْفِئ', translit: 'aṭfaʾa · yuṭfiʾ', cat: 'Everyday', examples: [{ ar: 'أَطْفِئِ الضَّوْءَ رَجاءً.', en: 'Turn off the light please.' }] },
  { en: 'to record', ar: 'سَجَّلَ', present: 'يُسَجِّل', translit: 'sajjala · yusajjil', cat: 'Action', examples: [{ ar: 'سَجَّلْتُ المُحاضَرة.', en: 'I recorded the lecture.' }] },
  { en: 'to print', ar: 'طَبَعَ', present: 'يَطْبَع', translit: 'ṭabaʿa · yaṭbaʿ', cat: 'Work & Money', examples: [{ ar: 'طَبَعْتُ الوَثيقة.', en: 'I printed the document.' }] },
  { en: 'to copy', ar: 'نَسَخَ', present: 'يَنْسَخ', translit: 'nasakha · yansakh', cat: 'Work & Money', examples: [{ ar: 'نَسَخْتُ المِلَفّ.', en: 'I copied the file.' }] },
  { en: 'to delete', ar: 'حَذَفَ', present: 'يَحْذِف', translit: 'ḥadhafa · yaḥdhif', cat: 'Work & Money', examples: [{ ar: 'حَذَفْتُ الرِّسالة.', en: 'I deleted the message.' }] },
  { en: 'to download', ar: 'حَمَّلَ', present: 'يُحَمِّل', translit: 'ḥammala · yuḥammil', cat: 'Work & Money', examples: [{ ar: 'حَمَّلْتُ التَّطْبيق.', en: 'I downloaded the app.' }] },
  { en: 'to upload / to raise', ar: 'رَفَعَ', present: 'يَرْفَع', translit: 'rafaʿa · yarfaʿ', cat: 'Action', examples: [{ ar: 'رَفَعْتُ الصورةَ على الإِنْتَرْنِت.', en: 'I uploaded the picture to the internet.' }] },

  // ── Nature ────────────────────────────────────────────────
  { en: 'to plant', ar: 'زَرَعَ', present: 'يَزْرَع', translit: 'zaraʿa · yazraʿ', cat: 'Nature', examples: [{ ar: 'زَرَعْتُ شَجَرةً في الحَديقة.', en: 'I planted a tree in the garden.' }] },
  { en: 'to water (plants)', ar: 'سَقى', present: 'يَسْقي', translit: 'saqā · yasqī', cat: 'Nature', examples: [{ ar: 'سَقَيْتُ الأَزْهار.', en: 'I watered the flowers.' }] },
  { en: 'to shine / to rise (sun)', ar: 'أَشْرَقَ', present: 'يُشْرِق', translit: 'ashraqa · yushriq', cat: 'Nature', examples: [{ ar: 'أَشْرَقَتِ الشَّمْسُ صَباحًا.', en: 'The sun rose in the morning.' }] },
  { en: 'to rain', ar: 'أَمْطَرَ', present: 'يُمْطِر', translit: 'amṭara · yumṭir', cat: 'Nature', examples: [{ ar: 'أَمْطَرَتِ السَّماءُ بِغَزارة.', en: 'It rained heavily.' }] },
  { en: 'to blow (wind)', ar: 'هَبَّ', present: 'يَهُبّ', translit: 'habba · yahubb', cat: 'Nature', examples: [{ ar: 'هَبَّتِ الرِّياحُ القَوِيّة.', en: 'Strong winds blew.' }] },

  // ── States & keeping ──────────────────────────────────────
  { en: 'to remain / to stay', ar: 'بَقِيَ', present: 'يَبْقى', translit: 'baqiya · yabqā', cat: 'Everyday', examples: [{ ar: 'بَقيتُ في البَيْتِ اليَوْم.', en: 'I stayed at home today.' }] },
  { en: 'to leave behind / to let', ar: 'تَرَكَ', present: 'يَتْرُك', translit: 'taraka · yatruk', cat: 'Action', examples: [{ ar: 'تَرَكْتُ مِفْتاحي في البَيْت.', en: 'I left my key at home.' }] },
  { en: 'to keep', ar: 'اِحْتَفَظَ', present: 'يَحْتَفِظ', translit: 'iḥtafaẓa · yaḥtafiẓ', cat: 'Everyday', examples: [{ ar: 'اِحْتَفَظْتُ بِالرِّسالة.', en: 'I kept the letter.' }] },
  { en: 'to hide', ar: 'أَخْفى', present: 'يُخْفي', translit: 'akhfā · yukhfī', cat: 'Action', examples: [{ ar: 'أَخْفى الهَدِيّة.', en: 'He hid the gift.' }] },
  { en: 'to appear / to show up', ar: 'ظَهَرَ', present: 'يَظْهَر', translit: 'ẓahara · yaẓhar', cat: 'Everyday', examples: [{ ar: 'ظَهَرَ القَمَرُ في السَّماء.', en: 'The moon appeared in the sky.' }] },
  { en: 'to disappear', ar: 'اِخْتَفى', present: 'يَخْتَفي', translit: 'ikhtafā · yakhtafī', cat: 'Everyday', examples: [{ ar: 'اِخْتَفى فَجْأةً.', en: 'He disappeared suddenly.' }] },
  { en: 'to lower / to reduce', ar: 'خَفَّضَ', present: 'يُخَفِّض', translit: 'khaffaḍa · yukhaffiḍ', cat: 'Work & Money', examples: [{ ar: 'خَفَّضوا الأَسْعار.', en: 'They lowered the prices.' }] },
];
