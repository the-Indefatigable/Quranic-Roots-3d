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
  'Everyday', 'Speaking', 'Movement', 'Feelings', 'Mind', 'Work & Money', 'Home', 'People', 'Faith', 'Action',
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
];
