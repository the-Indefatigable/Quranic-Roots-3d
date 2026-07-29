// Everyday Words & Expressions — the connective tissue of real Arabic speech:
// expressions and fillers, discourse connectors, feeling words, describing
// words (adjectives), question words, and the everyday particles Arabs actually
// use. These aren't verbs, so there's no tense — just the word, how to say it,
// and an example of it in use.

export interface WordExample {
  ar: string;
  en: string;
}

export interface DailyWord {
  en: string;        // English gloss
  ar: string;        // Arabic
  translit: string;  // transliteration
  type: string;      // category (see WORD_TYPES)
  example?: WordExample;
  note?: string;     // short usage note
}

export const WORD_TYPES = [
  'Expression', 'Connector', 'Feeling', 'Describing', 'Question', 'Time', 'Common',
] as const;

export const dailyWords: DailyWord[] = [
  // ── Expressions & fillers ─────────────────────────────────
  { en: 'honestly / frankly', ar: 'بِصَراحة', translit: 'biṣarāḥa', type: 'Expression', example: { ar: 'بِصَراحة، لَمْ يُعْجِبْني الفِلْم.', en: "Honestly, I didn't like the film." } },
  { en: 'simply / put simply', ar: 'بِبَساطة', translit: 'bibasāṭa', type: 'Expression', example: { ar: 'بِبَساطة، نَحْنُ بِحاجةٍ إِلى وَقْت.', en: 'Simply put, we need time.' } },
  { en: "no problem / it's simple", ar: 'بَسيطة', translit: 'basīṭa', type: 'Expression', note: 'Very common colloquial reassurance.', example: { ar: 'لا تَقْلَقْ، المَسْأَلةُ بَسيطة.', en: "Don't worry, it's no big deal." } },
  { en: 'God willing', ar: 'إِنْ شاءَ الله', translit: 'in shāʾ Allāh', type: 'Expression', example: { ar: 'سَأَزورُكَ غَدًا إِنْ شاءَ الله.', en: 'I will visit you tomorrow, God willing.' } },
  { en: 'as God willed (wow!)', ar: 'ما شاءَ الله', translit: 'mā shāʾ Allāh', type: 'Expression', note: 'Said when admiring something, to give thanks & ward off envy.', example: { ar: 'ما شاءَ الله، عَمَلٌ رائِع!', en: 'Mashallah, excellent work!' } },
  { en: 'praise be to God / I’m fine', ar: 'الحَمْدُ لله', translit: 'al-ḥamdu lillāh', type: 'Expression', example: { ar: 'كَيْفَ حالُك؟ الحَمْدُ لله.', en: 'How are you? Fine, praise God.' } },
  { en: 'I mean / that is', ar: 'يَعْني', translit: 'yaʿnī', type: 'Expression', note: 'Ubiquitous filler, like English “like / you know”.', example: { ar: 'هو، يَعْني، مَشْغولٌ قَليلًا.', en: 'He is, I mean, a little busy.' } },
  { en: 'by the way', ar: 'على فِكْرة', translit: 'ʿalā fikra', type: 'Expression', example: { ar: 'على فِكْرة، اِتَّصَلَ بِكَ أَخوك.', en: 'By the way, your brother called you.' } },
  { en: 'of course', ar: 'طَبْعًا', translit: 'ṭabʿan', type: 'Expression', example: { ar: 'طَبْعًا سَأُساعِدُك.', en: 'Of course I will help you.' } },
  { en: 'certainly / for sure', ar: 'بِالتَّأْكيد', translit: 'bit-taʾkīd', type: 'Expression', example: { ar: 'بِالتَّأْكيد، هذا صَحيح.', en: "Certainly, that's correct." } },
  { en: 'maybe / perhaps', ar: 'رُبَّما', translit: 'rubbamā', type: 'Expression', example: { ar: 'رُبَّما نَذْهَبُ غَدًا.', en: 'Maybe we will go tomorrow.' } },
  { en: 'possible / can I? / maybe', ar: 'مُمْكِن', translit: 'mumkin', type: 'Expression', note: 'Also “is it possible…?” to make polite requests.', example: { ar: 'مُمْكِن كوبَ ماء؟', en: 'Can I have a glass of water?' } },
  { en: 'excuse me / you’re welcome', ar: 'عَفْوًا', translit: 'ʿafwan', type: 'Expression', example: { ar: 'شُكْرًا! — عَفْوًا.', en: 'Thank you! — You’re welcome.' } },
  { en: 'please', ar: 'مِنْ فَضْلِك', translit: 'min faḍlik', type: 'Expression', example: { ar: 'الماءَ مِنْ فَضْلِك.', en: 'Water, please.' } },
  { en: 'it’s okay / no harm', ar: 'لا بَأْس', translit: 'lā baʾs', type: 'Expression', example: { ar: 'تَأَخَّرْتَ قَليلًا، لا بَأْس.', en: 'You’re a little late, it’s okay.' } },
  { en: 'anyway / in any case', ar: 'على كُلِّ حال', translit: 'ʿalā kulli ḥāl', type: 'Expression', example: { ar: 'على كُلِّ حال، سَنُحاوِل.', en: 'In any case, we will try.' } },
  { en: 'actually / in fact', ar: 'في الواقِع', translit: 'fī l-wāqiʿ', type: 'Expression', example: { ar: 'في الواقِع، الأَمْرُ مُخْتَلِف.', en: 'Actually, the matter is different.' } },
  { en: 'congratulations', ar: 'مَبْروك', translit: 'mabrūk', type: 'Expression', example: { ar: 'مَبْروك على النَّجاح!', en: 'Congratulations on your success!' } },
  { en: 'approximately / almost', ar: 'تَقْريبًا', translit: 'taqrīban', type: 'Expression', example: { ar: 'اِنْتَهَيْتُ تَقْريبًا.', en: 'I’m almost done.' } },
  { en: 'that’s it / enough / done', ar: 'خَلاص', translit: 'khalāṣ', type: 'Expression', note: 'Colloquial: “done / stop / okay then”.', example: { ar: 'خَلاص، فَهِمْتُ.', en: 'Okay, I get it.' } },
  { en: 'welcome!', ar: 'أَهْلًا وَسَهْلًا', translit: 'ahlan wa sahlan', type: 'Expression', example: { ar: 'أَهْلًا وَسَهْلًا بِك!', en: 'Welcome!' } },

  // ── Connectors ────────────────────────────────────────────
  { en: 'but', ar: 'لكِنْ', translit: 'lākin', type: 'Connector', example: { ar: 'أُريدُ الذَّهابَ لكِنّي مَشْغول.', en: 'I want to go but I’m busy.' } },
  { en: 'because', ar: 'لِأَنَّ', translit: 'li-anna', type: 'Connector', example: { ar: 'بَقيتُ لِأَنَّ الجَوَّ مُمْطِر.', en: 'I stayed because the weather was rainy.' } },
  { en: 'so / therefore', ar: 'إِذَنْ', translit: 'idhan', type: 'Connector', example: { ar: 'أَنْتَ مُتْعَب، إِذَنْ اِسْتَرِحْ.', en: 'You’re tired, so rest.' } },
  { en: 'therefore / for that reason', ar: 'لِذلِك', translit: 'li-dhālik', type: 'Connector', example: { ar: 'كانَ مَريضًا، لِذلِك غابَ.', en: 'He was sick, therefore he was absent.' } },
  { en: 'in addition to', ar: 'بِالإِضافةِ إِلى', translit: 'bil-iḍāfati ilā', type: 'Connector', example: { ar: 'بِالإِضافةِ إِلى ذلِك، هو ذَكِيّ.', en: 'In addition to that, he is smart.' } },
  { en: 'on the contrary', ar: 'على العَكْس', translit: 'ʿalā l-ʿaks', type: 'Connector', example: { ar: 'على العَكْس، أَنا سَعيدٌ جِدًّا.', en: 'On the contrary, I’m very happy.' } },
  { en: 'on the other hand', ar: 'مِنْ ناحيةٍ أُخْرى', translit: 'min nāḥiyatin ukhrā', type: 'Connector', example: { ar: 'مِنْ ناحيةٍ أُخْرى، السِّعْرُ مُرْتَفِع.', en: 'On the other hand, the price is high.' } },
  { en: 'in contrast / conversely', ar: 'بِالمُقابِل', translit: 'bil-muqābil', type: 'Connector', example: { ar: 'هو هادِئ، بِالمُقابِل أَخوهُ نَشيط.', en: 'He is calm; in contrast, his brother is energetic.' } },
  { en: 'despite / in spite of', ar: 'بِالرَّغْمِ مِنْ', translit: 'bir-raghmi min', type: 'Connector', example: { ar: 'نَجَحَ بِالرَّغْمِ مِنَ الصُّعوبات.', en: 'He succeeded despite the difficulties.' } },
  { en: 'nevertheless / yet', ar: 'مَعَ ذلِك', translit: 'maʿa dhālik', type: 'Connector', example: { ar: 'كانَ مُتْعَبًا، وَمَعَ ذلِك عَمِل.', en: 'He was tired, yet he worked.' } },
  { en: 'since / given that', ar: 'بِما أَنَّ', translit: 'bimā anna', type: 'Connector', example: { ar: 'بِما أَنَّكَ هُنا، لِنَبْدَأ.', en: 'Since you’re here, let’s begin.' } },
  { en: 'also / too', ar: 'أَيْضًا', translit: 'ayḍan', type: 'Connector', example: { ar: 'أَنا أَيْضًا أُريدُ القَهْوة.', en: 'I want coffee too.' } },
  { en: 'likewise / similarly', ar: 'كَذلِك', translit: 'kadhālik', type: 'Connector', example: { ar: 'هي مُجْتَهِدة، وَأَخوها كَذلِك.', en: 'She is diligent, and so is her brother.' } },
  { en: 'for example', ar: 'مَثَلًا', translit: 'mathalan', type: 'Connector', example: { ar: 'أُحِبُّ الفاكِهة، مَثَلًا التُّفّاح.', en: 'I like fruit, for example apples.' } },
  { en: 'finally / at last', ar: 'أَخيرًا', translit: 'akhīran', type: 'Connector', example: { ar: 'وَأَخيرًا، شُكْرًا لَكُم.', en: 'And finally, thank you all.' } },
  { en: 'in short', ar: 'بِاخْتِصار', translit: 'bikhtiṣār', type: 'Connector', example: { ar: 'بِاخْتِصار، الفِكْرةُ ناجِحة.', en: 'In short, the idea works.' } },
  { en: 'while / whereas', ar: 'بَيْنَما', translit: 'baynamā', type: 'Connector', example: { ar: 'قَرَأْتُ بَيْنَما كانَ يَكْتُب.', en: 'I read while he was writing.' } },
  { en: 'when (at the time)', ar: 'عِنْدَما', translit: 'ʿindamā', type: 'Connector', example: { ar: 'اِتَّصِلْ بي عِنْدَما تَصِل.', en: 'Call me when you arrive.' } },
  { en: 'if', ar: 'إِذا', translit: 'idhā', type: 'Connector', example: { ar: 'إِذا دَرَسْتَ، سَتَنْجَح.', en: 'If you study, you will succeed.' } },
  { en: 'in order to', ar: 'لِكَي', translit: 'li-kay', type: 'Connector', example: { ar: 'أَدْرُسُ لِكَي أَتَعَلَّم.', en: 'I study in order to learn.' } },
  { en: 'either… or', ar: 'إِمّا… أَوْ', translit: 'immā… aw', type: 'Connector', example: { ar: 'إِمّا الآنَ أَوْ غَدًا.', en: 'Either now or tomorrow.' } },
  { en: 'even', ar: 'حَتّى', translit: 'ḥattā', type: 'Connector', example: { ar: 'الكُلُّ جاءَ، حَتّى الأَطْفال.', en: 'Everyone came, even the children.' } },

  // ── Feeling words ─────────────────────────────────────────
  { en: 'happy', ar: 'سَعيد', translit: 'saʿīd', type: 'Feeling', example: { ar: 'أَنا سَعيدٌ بِلِقائِك.', en: 'I’m happy to meet you.' } },
  { en: 'sad', ar: 'حَزين', translit: 'ḥazīn', type: 'Feeling', example: { ar: 'بَدا حَزينًا اليَوْم.', en: 'He seemed sad today.' } },
  { en: 'angry', ar: 'غاضِب', translit: 'ghāḍib', type: 'Feeling', example: { ar: 'لِماذا أَنْتَ غاضِب؟', en: 'Why are you angry?' } },
  { en: 'afraid / scared', ar: 'خائِف', translit: 'khāʾif', type: 'Feeling', example: { ar: 'الطِّفْلُ خائِفٌ مِنَ الظَّلام.', en: 'The child is afraid of the dark.' } },
  { en: 'excited', ar: 'مُتَحَمِّس', translit: 'mutaḥammis', type: 'Feeling', example: { ar: 'أَنا مُتَحَمِّسٌ لِلرِّحْلة.', en: 'I’m excited for the trip.' } },
  { en: 'worried / anxious', ar: 'قَلِق', translit: 'qaliq', type: 'Feeling', example: { ar: 'هي قَلِقةٌ على اِبْنِها.', en: 'She is worried about her son.' } },
  { en: 'proud', ar: 'فَخور', translit: 'fakhūr', type: 'Feeling', example: { ar: 'أَنا فَخورٌ بِك.', en: 'I’m proud of you.' } },
  { en: 'grateful', ar: 'مُمْتَنّ', translit: 'mumtann', type: 'Feeling', example: { ar: 'أَنا مُمْتَنٌّ لِمُساعَدَتِك.', en: 'I’m grateful for your help.' } },
  { en: 'tired', ar: 'مُتْعَب', translit: 'mutʿab', type: 'Feeling', example: { ar: 'أَشْعُرُ أَنّي مُتْعَب.', en: 'I feel tired.' } },
  { en: 'busy', ar: 'مَشْغول', translit: 'mashghūl', type: 'Feeling', example: { ar: 'أَنا مَشْغولٌ هذا الأُسْبوع.', en: 'I’m busy this week.' } },
  { en: 'comfortable / relaxed', ar: 'مُرْتاح', translit: 'murtāḥ', type: 'Feeling', example: { ar: 'أَشْعُرُ بِأَنّي مُرْتاحٌ هُنا.', en: 'I feel comfortable here.' } },
  { en: 'surprised / amazed', ar: 'مُنْدَهِش', translit: 'mundahish', type: 'Feeling', example: { ar: 'كُنْتُ مُنْدَهِشًا مِنَ الخَبَر.', en: 'I was amazed by the news.' } },
  { en: 'shy', ar: 'خَجول', translit: 'khajūl', type: 'Feeling', example: { ar: 'إِنّهُ طِفْلٌ خَجول.', en: 'He is a shy child.' } },
  { en: 'sure / certain', ar: 'مُتَأَكِّد', translit: 'mutaʾakkid', type: 'Feeling', example: { ar: 'أَنا مُتَأَكِّدٌ مِنْ ذلِك.', en: 'I’m sure of that.' } },
  { en: 'ready', ar: 'مُسْتَعِدّ', translit: 'mustaʿidd', type: 'Feeling', example: { ar: 'هَلْ أَنْتَ مُسْتَعِدّ؟', en: 'Are you ready?' } },

  // ── Describing (adjectives) ───────────────────────────────
  { en: 'long / tall', ar: 'طَويل', translit: 'ṭawīl', type: 'Describing', example: { ar: 'طَريقٌ طَويل.', en: 'A long road.' } },
  { en: 'short', ar: 'قَصير', translit: 'qaṣīr', type: 'Describing', example: { ar: 'قِصّةٌ قَصيرة.', en: 'A short story.' } },
  { en: 'wide / broad', ar: 'عَريض', translit: 'ʿarīḍ', type: 'Describing', example: { ar: 'شارِعٌ عَريض.', en: 'A wide street.' } },
  { en: 'narrow', ar: 'ضَيِّق', translit: 'ḍayyiq', type: 'Describing', example: { ar: 'مَمَرٌّ ضَيِّق.', en: 'A narrow passage.' } },
  { en: 'thick', ar: 'سَميك', translit: 'samīk', type: 'Describing', example: { ar: 'كِتابٌ سَميك.', en: 'A thick book.' } },
  { en: 'thin (objects)', ar: 'رَفيع', translit: 'rafīʿ', type: 'Describing', example: { ar: 'خَيْطٌ رَفيع.', en: 'A thin thread.' } },
  { en: 'slim / thin (person)', ar: 'نَحيف', translit: 'naḥīf', type: 'Describing', example: { ar: 'رَجُلٌ نَحيف.', en: 'A slim man.' } },
  { en: 'big / large', ar: 'كَبير', translit: 'kabīr', type: 'Describing', example: { ar: 'بَيْتٌ كَبير.', en: 'A big house.' } },
  { en: 'small', ar: 'صَغير', translit: 'ṣaghīr', type: 'Describing', example: { ar: 'قِطّةٌ صَغيرة.', en: 'A small cat.' } },
  { en: 'high / tall', ar: 'مُرْتَفِع', translit: 'murtafiʿ', type: 'Describing', example: { ar: 'جَبَلٌ مُرْتَفِع.', en: 'A high mountain.' } },
  { en: 'low', ar: 'مُنْخَفِض', translit: 'munkhafiḍ', type: 'Describing', example: { ar: 'صَوْتٌ مُنْخَفِض.', en: 'A low voice.' } },
  { en: 'heavy', ar: 'ثَقيل', translit: 'thaqīl', type: 'Describing', example: { ar: 'حَقيبةٌ ثَقيلة.', en: 'A heavy bag.' } },
  { en: 'light (in weight)', ar: 'خَفيف', translit: 'khafīf', type: 'Describing', example: { ar: 'وَجْبةٌ خَفيفة.', en: 'A light meal.' } },
  { en: 'new', ar: 'جَديد', translit: 'jadīd', type: 'Describing', example: { ar: 'هاتِفٌ جَديد.', en: 'A new phone.' } },
  { en: 'old', ar: 'قَديم', translit: 'qadīm', type: 'Describing', example: { ar: 'بِناءٌ قَديم.', en: 'An old building.' } },
  { en: 'fast / quick', ar: 'سَريع', translit: 'sarīʿ', type: 'Describing', example: { ar: 'قِطارٌ سَريع.', en: 'A fast train.' } },
  { en: 'slow', ar: 'بَطيء', translit: 'baṭīʾ', type: 'Describing', example: { ar: 'إِنْتِرْنِتٌ بَطيء.', en: 'A slow internet.' } },
  { en: 'strong', ar: 'قَوِيّ', translit: 'qawiyy', type: 'Describing', example: { ar: 'رَجُلٌ قَوِيّ.', en: 'A strong man.' } },
  { en: 'weak', ar: 'ضَعيف', translit: 'ḍaʿīf', type: 'Describing', example: { ar: 'إِشارةٌ ضَعيفة.', en: 'A weak signal.' } },
  { en: 'beautiful', ar: 'جَميل', translit: 'jamīl', type: 'Describing', example: { ar: 'مَنْظَرٌ جَميل.', en: 'A beautiful view.' } },
  { en: 'clean', ar: 'نَظيف', translit: 'naẓīf', type: 'Describing', example: { ar: 'غُرْفةٌ نَظيفة.', en: 'A clean room.' } },
  { en: 'dirty', ar: 'وَسِخ', translit: 'wasikh', type: 'Describing', example: { ar: 'حِذاءٌ وَسِخ.', en: 'A dirty shoe.' } },
  { en: 'easy', ar: 'سَهْل', translit: 'sahl', type: 'Describing', example: { ar: 'سُؤالٌ سَهْل.', en: 'An easy question.' } },
  { en: 'difficult / hard', ar: 'صَعْب', translit: 'ṣaʿb', type: 'Describing', example: { ar: 'اِمْتِحانٌ صَعْب.', en: 'A difficult exam.' } },
  { en: 'hot', ar: 'حارّ', translit: 'ḥārr', type: 'Describing', example: { ar: 'الجَوُّ حارٌّ اليَوْم.', en: 'The weather is hot today.' } },
  { en: 'cold', ar: 'بارِد', translit: 'bārid', type: 'Describing', example: { ar: 'ماءٌ بارِد.', en: 'Cold water.' } },
  { en: 'full', ar: 'مُمْتَلِئ', translit: 'mumtaliʾ', type: 'Describing', example: { ar: 'الكوبُ مُمْتَلِئ.', en: 'The glass is full.' } },
  { en: 'empty', ar: 'فارِغ', translit: 'fārigh', type: 'Describing', example: { ar: 'الصُّنْدوقُ فارِغ.', en: 'The box is empty.' } },
  { en: 'expensive', ar: 'غالٍ', translit: 'ghālin', type: 'Describing', example: { ar: 'هذا غالٍ جِدًّا.', en: 'This is very expensive.' } },
  { en: 'cheap', ar: 'رَخيص', translit: 'rakhīṣ', type: 'Describing', example: { ar: 'سِعْرٌ رَخيص.', en: 'A cheap price.' } },
  { en: 'deep', ar: 'عَميق', translit: 'ʿamīq', type: 'Describing', example: { ar: 'بِئْرٌ عَميقة.', en: 'A deep well.' } },

  // ── Common “m-” words Arabs use a lot ─────────────────────
  { en: 'important', ar: 'مُهِمّ', translit: 'muhimm', type: 'Describing', example: { ar: 'هذا أَمْرٌ مُهِمّ.', en: 'This is an important matter.' } },
  { en: 'excellent', ar: 'مُمْتاز', translit: 'mumtāz', type: 'Describing', example: { ar: 'عَمَلٌ مُمْتاز!', en: 'Excellent work!' } },
  { en: 'forbidden / not allowed', ar: 'مَمْنوع', translit: 'mamnūʿ', type: 'Describing', example: { ar: 'التَّدْخينُ مَمْنوع.', en: 'Smoking is forbidden.' } },
  { en: 'suitable / appropriate', ar: 'مُناسِب', translit: 'munāsib', type: 'Describing', example: { ar: 'وَقْتٌ مُناسِب.', en: 'A suitable time.' } },
  { en: 'different', ar: 'مُخْتَلِف', translit: 'mukhtalif', type: 'Describing', example: { ar: 'رَأْيٌ مُخْتَلِف.', en: 'A different opinion.' } },
  { en: 'useful / beneficial', ar: 'مُفيد', translit: 'mufīd', type: 'Describing', example: { ar: 'كِتابٌ مُفيد.', en: 'A useful book.' } },
  { en: 'amazing / astonishing', ar: 'مُدْهِش', translit: 'mudhish', type: 'Describing', example: { ar: 'مَنْظَرٌ مُدْهِش.', en: 'An amazing view.' } },
  { en: 'famous / well-known', ar: 'مَشْهور', translit: 'mashhūr', type: 'Describing', example: { ar: 'كاتِبٌ مَشْهور.', en: 'A famous writer.' } },
  { en: 'free (of charge)', ar: 'مَجّانِيّ', translit: 'majjānī', type: 'Describing', example: { ar: 'التَّطْبيقُ مَجّانِيّ.', en: 'The app is free.' } },
  { en: 'sick / ill', ar: 'مَريض', translit: 'marīḍ', type: 'Describing', example: { ar: 'هو مَريضٌ اليَوْم.', en: 'He is sick today.' } },
  { en: 'most (of)', ar: 'مُعْظَم', translit: 'muʿẓam', type: 'Common', example: { ar: 'مُعْظَمُ النّاسِ يُوافِقون.', en: 'Most people agree.' } },
  { en: 'like / similar to', ar: 'مِثْل', translit: 'mithl', type: 'Common', example: { ar: 'هو مِثْلُ أَخيه.', en: 'He is like his brother.' } },

  // ── Question words ────────────────────────────────────────
  { en: 'what', ar: 'ماذا', translit: 'mādhā', type: 'Question', example: { ar: 'ماذا تُريد؟', en: 'What do you want?' } },
  { en: 'who', ar: 'مَنْ', translit: 'man', type: 'Question', example: { ar: 'مَنْ هُناك؟', en: 'Who is there?' } },
  { en: 'where', ar: 'أَيْنَ', translit: 'ayna', type: 'Question', example: { ar: 'أَيْنَ تَسْكُن؟', en: 'Where do you live?' } },
  { en: 'when', ar: 'مَتى', translit: 'matā', type: 'Question', example: { ar: 'مَتى تَصِل؟', en: 'When do you arrive?' } },
  { en: 'how', ar: 'كَيْفَ', translit: 'kayfa', type: 'Question', example: { ar: 'كَيْفَ حالُك؟', en: 'How are you?' } },
  { en: 'why', ar: 'لِماذا', translit: 'limādhā', type: 'Question', example: { ar: 'لِماذا تَأَخَّرْت؟', en: 'Why are you late?' } },
  { en: 'how much / how many', ar: 'كَمْ', translit: 'kam', type: 'Question', example: { ar: 'كَمِ السّاعة؟', en: 'What time is it?' } },
  { en: 'which', ar: 'أَيّ', translit: 'ayy', type: 'Question', example: { ar: 'أَيَّ لَوْنٍ تُفَضِّل؟', en: 'Which color do you prefer?' } },

  // ── Time words ────────────────────────────────────────────
  { en: 'now', ar: 'الآنَ', translit: 'al-ān', type: 'Time', example: { ar: 'تَعالَ الآنَ.', en: 'Come now.' } },
  { en: 'today', ar: 'اليَوْمَ', translit: 'al-yawm', type: 'Time', example: { ar: 'أَنا مَشْغولٌ اليَوْمَ.', en: 'I’m busy today.' } },
  { en: 'tomorrow', ar: 'غَدًا', translit: 'ghadan', type: 'Time', example: { ar: 'أَراكَ غَدًا.', en: 'See you tomorrow.' } },
  { en: 'yesterday', ar: 'أَمْسِ', translit: 'ams', type: 'Time', example: { ar: 'وَصَلْتُ أَمْسِ.', en: 'I arrived yesterday.' } },
  { en: 'always', ar: 'دائِمًا', translit: 'dāʾiman', type: 'Time', example: { ar: 'هو دائِمًا مُتَأَخِّر.', en: 'He is always late.' } },
  { en: 'sometimes', ar: 'أَحْيانًا', translit: 'aḥyānan', type: 'Time', example: { ar: 'أَحْيانًا أَمْشي إِلى العَمَل.', en: 'Sometimes I walk to work.' } },
  { en: 'never', ar: 'أَبَدًا', translit: 'abadan', type: 'Time', example: { ar: 'لَنْ أَنْساكَ أَبَدًا.', en: 'I will never forget you.' } },
  { en: 'before', ar: 'قَبْلَ', translit: 'qabla', type: 'Time', example: { ar: 'اِتَّصِلْ قَبْلَ أَنْ تَأْتي.', en: 'Call before you come.' } },
  { en: 'after', ar: 'بَعْدَ', translit: 'baʿda', type: 'Time', example: { ar: 'نَلْتَقي بَعْدَ الصَّلاة.', en: 'We meet after the prayer.' } },

  // ── Common everyday words ─────────────────────────────────
  { en: 'very', ar: 'جِدًّا', translit: 'jiddan', type: 'Common', example: { ar: 'الطَّعامُ لَذيذٌ جِدًّا.', en: 'The food is very delicious.' } },
  { en: 'a lot / many', ar: 'كَثير', translit: 'kathīr', type: 'Common', example: { ar: 'لَدَيَّ عَمَلٌ كَثير.', en: 'I have a lot of work.' } },
  { en: 'a little / few', ar: 'قَليل', translit: 'qalīl', type: 'Common', example: { ar: 'اِنْتَظِرْ قَليلًا.', en: 'Wait a little.' } },
  { en: 'all / every', ar: 'كُلّ', translit: 'kull', type: 'Common', example: { ar: 'كُلُّ شَيْءٍ بِخَيْر.', en: 'Everything is fine.' } },
  { en: 'some', ar: 'بَعْض', translit: 'baʿḍ', type: 'Common', example: { ar: 'بَعْضُ النّاسِ يُحِبّونَه.', en: 'Some people like it.' } },
  { en: 'together', ar: 'مَعًا', translit: 'maʿan', type: 'Common', example: { ar: 'لِنَعْمَلْ مَعًا.', en: 'Let’s work together.' } },
  { en: 'alone / only', ar: 'وَحْد', translit: 'waḥd', type: 'Common', note: 'Used with a pronoun: وَحْدي (by myself), وَحْدَه (by himself).', example: { ar: 'ذَهَبْتُ وَحْدي.', en: 'I went alone.' } },
  { en: 'here', ar: 'هُنا', translit: 'hunā', type: 'Common', example: { ar: 'تَعالَ هُنا.', en: 'Come here.' } },
  { en: 'there', ar: 'هُناك', translit: 'hunāk', type: 'Common', example: { ar: 'اِجْلِسْ هُناك.', en: 'Sit there.' } },
  { en: 'maybe / it’s possible', ar: 'مِنَ المُمْكِن', translit: 'mina l-mumkin', type: 'Common', example: { ar: 'مِنَ المُمْكِنِ أَنْ يَتَأَخَّر.', en: 'It’s possible he’ll be late.' } },
];
