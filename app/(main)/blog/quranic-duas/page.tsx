import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Duas of the Quran — Every Rabbana & Rabbi Supplication, with Source',
  description:
    'A complete, grouped collection of the duas mentioned in the Quran — the 40 Rabbana supplications, the duas of the Prophets (Adam, Nuh, Ibrahim, Musa, Yunus, Ayyub, Zakariyya and more), and the short Quranic duas — each with fully-vowelled Arabic, transliteration, translation, the speaker, and the exact surah:ayah reference.',
  alternates: { canonical: 'https://quroots.com/blog/quranic-duas' },
  openGraph: {
    title: 'Duas of the Quran — The Complete Grouped Collection | QuRoots',
    description:
      'The Rabbana duas, the Prophets’ supplications, and the short Quranic duas — Arabic, transliteration, translation, and source for each.',
    url: 'https://quroots.com/blog/quranic-duas',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

type Dua = {
  arabic: string;
  latin: string;
  translation: string;
  context: string;
  speaker: string;
  ref: string;
};

type Section = {
  id: string;
  title: string;
  arabic: string;
  intro: string;
  duas: Dua[];
};

const SECTIONS: Section[] = [
  {
    id: 'rabbana',
    title: 'The Rabbana Duas — “Our Lord…”',
    arabic: 'رَبَّنَا',
    intro:
      'Scholars count roughly forty supplications in the Quran that open with the vocative rabbana — “Our Lord.” They are phrased in the plural because they are meant to be carried by the whole community, not one tongue. Here are the most beloved of them, in the order they appear in the mushaf.',
    duas: [
      {
        arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا ے إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ',
        latin: 'Rabbana taqabbal minna, innaka anta’s-Sami’u’l-’Alim',
        translation: 'Our Lord, accept this from us. Indeed, You are the All-Hearing, the All-Knowing.',
        context: 'Ibrahim and Ismaʿil prayed this as they raised the foundations of the Kaʿbah — the first dua tied to the House itself.',
        speaker: 'Ibrahim & Ismaʿil',
        ref: 'Al-Baqarah 2:127',
      },
      {
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        latin: 'Rabbana atina fi’d-dunya hasanatan wa fi’l-akhirati hasanatan wa qina ’adhaba’n-nar',
        translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
        context: 'The most-recited dua of the Prophet ﷺ — a complete request balancing both worlds in a single breath.',
        speaker: 'The believers',
        ref: 'Al-Baqarah 2:201',
      },
      {
        arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
        latin: 'Rabbana afrigh ’alayna sabran wa thabbit aqdamana wa’nsurna ’ala’l-qawmi’l-kafirin',
        translation: 'Our Lord, pour upon us patience, plant our feet firm, and grant us victory over the disbelieving people.',
        context: 'The cry of Talut’s small band as they faced Jalut (Goliath) and his army — a dua for steadiness in overwhelming odds.',
        speaker: 'Talut’s soldiers',
        ref: 'Al-Baqarah 2:250',
      },
      {
        arabic: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا',
        latin: 'Rabbana la tu’akhidhna in nasina aw akhta’na',
        translation: 'Our Lord, do not take us to task if we forget or err.',
        context: 'From the closing two verses of Al-Baqarah — revealed, the hadith says, from a treasure beneath the Throne.',
        speaker: 'The believers',
        ref: 'Al-Baqarah 2:286',
      },
      {
        arabic: 'رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا',
        latin: 'Rabbana wa la tuhammilna ma la taqata lana bih, wa’fu ’anna wa’ghfir lana wa’rhamna',
        translation: 'Our Lord, do not burden us with what we cannot bear. Pardon us, forgive us, and have mercy on us.',
        context: 'The final petition of Al-Baqarah — three mercies asked in a row: pardon, forgiveness, then mercy.',
        speaker: 'The believers',
        ref: 'Al-Baqarah 2:286',
      },
      {
        arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ',
        latin: 'Rabbana la tuzigh qulubana ba’da idh hadaytana wa hab lana min ladunka rahmah, innaka anta’l-Wahhab',
        translation: 'Our Lord, do not let our hearts deviate after You have guided us, and grant us mercy from Yourself. Indeed, You are the Bestower.',
        context: 'The prayer of “those firmly grounded in knowledge” — a plea that guidance, once given, not be lost.',
        speaker: 'The firmly-rooted in knowledge',
        ref: 'Aal ’Imran 3:8',
      },
      {
        arabic: 'رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ النَّارِ',
        latin: 'Rabbana innana amanna fa’ghfir lana dhunubana wa qina ’adhaba’n-nar',
        translation: 'Our Lord, we have believed, so forgive us our sins and protect us from the punishment of the Fire.',
        context: 'The dua of those who guard themselves — named in the same passage as people who rise before dawn to seek forgiveness.',
        speaker: 'The God-conscious',
        ref: 'Aal ’Imran 3:16',
      },
      {
        arabic: 'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
        latin: 'Rabbana’ghfir lana dhunubana wa israfana fi amrina wa thabbit aqdamana wa’nsurna ’ala’l-qawmi’l-kafirin',
        translation: 'Our Lord, forgive us our sins and our excesses in our affair, plant our feet firm, and grant us victory over the disbelieving people.',
        context: 'The words of the devoted companions of past prophets who never lost heart in battle — forgiveness asked first, victory second.',
        speaker: 'The devoted men of God',
        ref: 'Aal ’Imran 3:147',
      },
      {
        arabic: 'رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ',
        latin: 'Rabbana ma khalaqta hadha batilan, subhanaka fa qina ’adhaba’n-nar',
        translation: 'Our Lord, You did not create all this in vain. Glory be to You — so protect us from the punishment of the Fire.',
        context: 'The reflection of those who ponder the heavens and earth “standing, sitting, and lying on their sides.”',
        speaker: 'People of understanding',
        ref: 'Aal ’Imran 3:191',
      },
      {
        arabic: 'رَبَّنَا وَآتِنَا مَا وَعَدْتَنَا عَلَى رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ الْقِيَامَةِ ۗ إِنَّكَ لَا تُخْلِفُ الْمِيعَادَ',
        latin: 'Rabbana wa atina ma wa’adtana ’ala rusulika wa la tukhzina yawma’l-qiyamah, innaka la tukhlifu’l-mi’ad',
        translation: 'Our Lord, grant us what You promised us through Your messengers, and do not disgrace us on the Day of Resurrection. Indeed, You never break Your promise.',
        context: 'The closing dua of the same passage of reflection — the hope of the Hereafter held to the certainty of God’s promise.',
        speaker: 'People of understanding',
        ref: 'Aal ’Imran 3:194',
      },
      {
        arabic: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
        latin: 'Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna lanakunanna mina’l-khasirin',
        translation: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy on us, we will surely be among the losers.',
        context: 'The words of repentance Adam and Hawwa were taught after the slip in the Garden — the prototype of every tawbah.',
        speaker: 'Adam & Hawwa',
        ref: 'Al-A’raf 7:23',
      },
      {
        arabic: 'رَبَّنَا افْتَحْ بَيْنَنَا وَبَيْنَ قَوْمِنَا بِالْحَقِّ وَأَنتَ خَيْرُ الْفَاتِحِينَ',
        latin: 'Rabbana’ftah baynana wa bayna qawmina bi’l-haqqi wa anta khayru’l-fatihin',
        translation: 'Our Lord, decide between us and our people in truth, for You are the best of those who decide.',
        context: 'The dua of Shuʿayb when his people threatened to drive him out — turning judgment over to the only fair Judge.',
        speaker: 'Shuʿayb',
        ref: 'Al-A’raf 7:89',
      },
      {
        arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ',
        latin: 'Rabbana afrigh ’alayna sabran wa tawaffana muslimin',
        translation: 'Our Lord, pour patience upon us and let us die as those who have submitted to You.',
        context: 'The magicians of Pharaoh prayed this the moment they believed in Musa — facing crucifixion, they asked only for patience and a Muslim death.',
        speaker: 'Pharaoh’s magicians',
        ref: 'Al-A’raf 7:126',
      },
      {
        arabic: 'رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِلْقَوْمِ الظَّالِمِينَ وَنَجِّنَا بِرَحْمَتِكَ مِنَ الْقَوْمِ الْكَافِرِينَ',
        latin: 'Rabbana la taj’alna fitnatan li’l-qawmi’z-zalimin, wa najjina bi rahmatika mina’l-qawmi’l-kafirin',
        translation: 'Our Lord, do not make us a trial for the wrongdoing people, and deliver us by Your mercy from the disbelieving people.',
        context: 'The dua of the small band who believed in Musa under Pharaoh’s tyranny — asking not to become a tool of oppression.',
        speaker: 'The believers with Musa',
        ref: 'Yunus 10:85–86',
      },
      {
        arabic: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
        latin: 'Rabbana’ghfir li wa li walidayya wa li’l-mu’minina yawma yaqumu’l-hisab',
        translation: 'Our Lord, forgive me, my parents, and the believers on the Day the reckoning is established.',
        context: 'Ibrahim’s prayer for three circles at once — himself, his parents, and the whole body of believers.',
        speaker: 'Ibrahim',
        ref: 'Ibrahim 14:41',
      },
      {
        arabic: 'رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
        latin: 'Rabbana atina min ladunka rahmatan wa hayyi’ lana min amrina rashada',
        translation: 'Our Lord, grant us mercy from Yourself and shape for us right guidance in our affair.',
        context: 'The dua of the young men of the Cave (Ashab al-Kahf) as they fled to shelter their faith.',
        speaker: 'The People of the Cave',
        ref: 'Al-Kahf 18:10',
      },
      {
        arabic: 'رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنتَ خَيْرُ الرَّاحِمِينَ',
        latin: 'Rabbana amanna fa’ghfir lana wa’rhamna wa anta khayru’r-rahimin',
        translation: 'Our Lord, we have believed, so forgive us and have mercy on us, for You are the best of the merciful.',
        context: 'The Quran teaches this as the dua of God’s servants who were mocked for it — forgiveness and mercy asked together.',
        speaker: 'The believing servants',
        ref: 'Al-Mu’minun 23:109',
      },
      {
        arabic: 'رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ ۖ إِنَّ عَذَابَهَا كَانَ غَرَامًا',
        latin: 'Rabbana’srif ’anna ’adhaba jahannam, inna ’adhabaha kana gharama',
        translation: 'Our Lord, turn away from us the punishment of Hell. Indeed, its punishment is relentless.',
        context: 'A dua of “the servants of the Most Merciful” (ʿibad ar-Rahman) described at the end of Al-Furqan.',
        speaker: 'The servants of the Most Merciful',
        ref: 'Al-Furqan 25:65',
      },
      {
        arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
        latin: 'Rabbana hab lana min azwajina wa dhurriyyatina qurrata a’yunin wa’j’alna li’l-muttaqina imama',
        translation: 'Our Lord, grant us from our spouses and offspring comfort to our eyes, and make us leaders for the God-conscious.',
        context: 'The family dua of ʿibad ar-Rahman — the most-loved supplication for a righteous household.',
        speaker: 'The servants of the Most Merciful',
        ref: 'Al-Furqan 25:74',
      },
      {
        arabic: 'رَبَّنَا وَسِعْتَ كُلَّ شَيْءٍ رَحْمَةً وَعِلْمًا فَاغْفِرْ لِلَّذِينَ تَابُوا وَاتَّبَعُوا سَبِيلَكَ وَقِهِمْ عَذَابَ الْجَحِيمِ',
        latin: 'Rabbana wasi’ta kulla shay’in rahmatan wa ’ilman fa’ghfir li’lladhina tabu wa’ttaba’u sabilaka wa qihim ’adhaba’l-jahim',
        translation: 'Our Lord, You encompass all things in mercy and knowledge, so forgive those who repent and follow Your way, and protect them from the punishment of the Blaze.',
        context: 'The dua the angels who carry the Throne make for the believers — a prayer said about you, not by you.',
        speaker: 'The angels of the Throne',
        ref: 'Ghafir 40:7',
      },
      {
        arabic: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِلَّذِينَ آمَنُوا',
        latin: 'Rabbana’ghfir lana wa li ikhwanina’lladhina sabaquna bi’l-imani wa la taj’al fi qulubina ghillan li’lladhina amanu',
        translation: 'Our Lord, forgive us and our brothers who preceded us in faith, and leave no rancour in our hearts toward those who have believed.',
        context: 'The dua of later generations for the first believers — a prayer that keeps the heart of the ummah clean across time.',
        speaker: 'Those who came after',
        ref: 'Al-Hashr 59:10',
      },
      {
        arabic: 'رَبَّنَا عَلَيْكَ تَوَكَّلْنَا وَإِلَيْكَ أَنَبْنَا وَإِلَيْكَ الْمَصِيرُ',
        latin: 'Rabbana ’alayka tawakkalna wa ilayka anabna wa ilayka’l-masir',
        translation: 'Our Lord, upon You we rely, to You we turn in repentance, and to You is the final return.',
        context: 'Part of the excellent example set by Ibrahim and those with him as they broke with disbelief.',
        speaker: 'Ibrahim & those with him',
        ref: 'Al-Mumtahanah 60:4',
      },
      {
        arabic: 'رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا ۖ إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        latin: 'Rabbana atmim lana nurana wa’ghfir lana, innaka ’ala kulli shay’in qadir',
        translation: 'Our Lord, perfect our light for us and forgive us. Indeed, You are over all things competent.',
        context: 'The dua of the believers on the Day of Judgment as their light runs ahead of them across the Bridge.',
        speaker: 'The believers (on Judgment Day)',
        ref: 'At-Tahrim 66:8',
      },
    ],
  },
  {
    id: 'prophets',
    title: 'Duas of the Prophets — “My Lord…”',
    arabic: 'رَبِّ',
    intro:
      'Where rabbana is the voice of the community, rabbi — “my Lord” — is the private, singular cry of one servant. The Quran preserves the most intimate moments of the prophets in exactly these words: Musa stammering before Pharaoh, Yunus in the belly of the fish, Ayyub in his illness, Zakariyya in his old age.',
    duas: [
      {
        arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِن لِّسَانِي يَفْقَهُوا قَوْلِي',
        latin: 'Rabbi’shrah li sadri, wa yassir li amri, wa’hlul ’uqdatan min lisani, yafqahu qawli',
        translation: 'My Lord, expand my chest for me, ease my task for me, and untie the knot from my tongue so they may understand my speech.',
        context: 'Musa’s dua at the burning bush, commanded to go to Pharaoh — the timeless prayer before any hard, frightening task.',
        speaker: 'Musa',
        ref: 'Ta-Ha 20:25–28',
      },
      {
        arabic: 'رَبِّ زِدْنِي عِلْمًا',
        latin: 'Rabbi zidni ’ilma',
        translation: 'My Lord, increase me in knowledge.',
        context: 'The shortest, most quoted dua for seekers of knowledge — the only thing the Prophet ﷺ was commanded to ask for more of.',
        speaker: 'The Prophet ﷺ',
        ref: 'Ta-Ha 20:114',
      },
      {
        arabic: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
        latin: 'Rabbi inni lima anzalta ilayya min khayrin faqir',
        translation: 'My Lord, I am in desperate need of whatever good You send down to me.',
        context: 'Musa’s whispered dua in Madyan — alone, exhausted, and penniless after watering the flocks. A prayer of complete dependence.',
        speaker: 'Musa',
        ref: 'Al-Qasas 28:24',
      },
      {
        arabic: 'رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي',
        latin: 'Rabbi inni zalamtu nafsi fa’ghfir li',
        translation: 'My Lord, I have wronged myself, so forgive me.',
        context: 'Musa’s instant repentance after he struck a man who then died — and God forgave him at once.',
        speaker: 'Musa',
        ref: 'Al-Qasas 28:16',
      },
      {
        arabic: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
        latin: 'La ilaha illa anta, subhanaka, inni kuntu mina’z-zalimin',
        translation: 'There is no god but You. Glory be to You. Indeed, I was among the wrongdoers.',
        context: 'The dua of Yunus from inside the fish, in three layers of darkness. The hadith: no Muslim ever prays it for anything without God answering.',
        speaker: 'Yunus (Dhu’n-Nun)',
        ref: 'Al-Anbiya 21:87',
      },
      {
        arabic: 'رَبِّ إِنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ',
        latin: 'Rabbi inni massaniya’d-durru wa anta arhamu’r-rahimin',
        translation: 'My Lord, harm has touched me, and You are the Most Merciful of the merciful.',
        context: 'Ayyub’s dua after years of illness and loss — a complaint so gentle it names the affliction without once asking to be cured.',
        speaker: 'Ayyub',
        ref: 'Al-Anbiya 21:83',
      },
      {
        arabic: 'رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً ۖ إِنَّكَ سَمِيعُ الدُّعَاءِ',
        latin: 'Rabbi hab li min ladunka dhurriyyatan tayyibah, innaka sami’u’d-du’a’',
        translation: 'My Lord, grant me from Yourself a goodly offspring. Indeed, You are the Hearer of supplication.',
        context: 'Zakariyya’s dua for a child in his old age, prayed quietly in the prayer-niche — answered with Yahya.',
        speaker: 'Zakariyya',
        ref: 'Aal ’Imran 3:38',
      },
      {
        arabic: 'رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ',
        latin: 'Rabbi la tadharni fardan wa anta khayru’l-warithin',
        translation: 'My Lord, do not leave me alone (without an heir), and You are the best of inheritors.',
        context: 'Zakariyya again — the same longing, phrased with perfect adab: even the request ends by praising God as the ultimate heir.',
        speaker: 'Zakariyya',
        ref: 'Al-Anbiya 21:89',
      },
      {
        arabic: 'رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ',
        latin: 'Rabbi hab li mina’s-salihin',
        translation: 'My Lord, grant me one of the righteous.',
        context: 'Ibrahim’s dua for a son — notice he asks not merely for a child but for a righteous one. The answer was Ismaʿil.',
        speaker: 'Ibrahim',
        ref: 'As-Saffat 37:100',
      },
      {
        arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ',
        latin: 'Rabbi’j’alni muqima’s-salati wa min dhurriyyati, rabbana wa taqabbal du’a’',
        translation: 'My Lord, make me an establisher of prayer, and from my offspring too. Our Lord, accept my supplication.',
        context: 'Ibrahim’s dua for a praying lineage — he asks not just to pray himself but for the salah to outlive him in his children.',
        speaker: 'Ibrahim',
        ref: 'Ibrahim 14:40',
      },
      {
        arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ',
        latin: 'Rabbi awzi’ni an ashkura ni’mataka’llati an’amta ’alayya wa ’ala walidayya wa an a’mala salihan tardah',
        translation: 'My Lord, enable me to be grateful for Your favour which You have bestowed upon me and my parents, and to do righteous deeds that please You.',
        context: 'Recommended for one who reaches forty years — a dua of gratitude, prayed earlier by Sulayman over the ant (27:19).',
        speaker: 'The mature believer',
        ref: 'Al-Ahqaf 46:15',
      },
      {
        arabic: 'رَبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ وَاجْعَل لِّي مِن لَّدُنكَ سُلْطَانًا نَّصِيرًا',
        latin: 'Rabbi adkhilni mudkhala sidqin wa akhrijni mukhraja sidqin wa’j’al li min ladunka sultanan nasira',
        translation: 'My Lord, cause me to enter in a manner of truth and to exit in a manner of truth, and grant me from Yourself a supporting authority.',
        context: 'A dua for sincerity at every threshold — every beginning and ending kept honest, with God’s help behind it.',
        speaker: 'The Prophet ﷺ',
        ref: 'Al-Isra 17:80',
      },
      {
        arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَن دَخَلَ بَيْتِي مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ',
        latin: 'Rabbi’ghfir li wa li walidayya wa li man dakhala baytiya mu’minan wa li’l-mu’minina wa’l-mu’minat',
        translation: 'My Lord, forgive me, my parents, whoever enters my house as a believer, and all the believing men and women.',
        context: 'Nuh’s dua after 950 years of calling his people — the widest circle of forgiveness asked by any prophet.',
        speaker: 'Nuh',
        ref: 'Nuh 71:28',
      },
      {
        arabic: 'رَبِّ أَنزِلْنِي مُنزَلًا مُبَارَكًا وَأَنتَ خَيْرُ الْمُنزِلِينَ',
        latin: 'Rabbi anzilni munzalan mubarakan wa anta khayru’l-munzilin',
        translation: 'My Lord, let me land at a blessed landing-place, for You are the best to bring to land.',
        context: 'Nuh’s dua as the Ark came to rest — recommended by the Prophet ﷺ when boarding any vehicle or arriving anywhere.',
        speaker: 'Nuh',
        ref: 'Al-Mu’minun 23:29',
      },
      {
        arabic: 'رَبِّ هَبْ لِي حُكْمًا وَأَلْحِقْنِي بِالصَّالِحِينَ',
        latin: 'Rabbi hab li hukman wa alhiqni bi’s-salihin',
        translation: 'My Lord, grant me sound judgment and join me with the righteous.',
        context: 'Ibrahim’s dua for wisdom and good company — to be gathered, in the end, among the people of righteousness.',
        speaker: 'Ibrahim',
        ref: 'Ash-Shu’ara 26:83',
      },
    ],
  },
  {
    id: 'short',
    title: 'Short Quranic Duas & Words of Reliance',
    arabic: 'أَدْعِيَةٌ قصِيرَة',
    intro:
      'Not every Quranic dua opens with a vocative. Some are a single line of guidance, refuge, or reliance — short enough to keep on the tongue all day, weighty enough to have carried prophets through fire and armies through battle.',
    duas: [
      {
        arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        latin: 'Ihdina’s-sirata’l-mustaqim',
        translation: 'Guide us to the straight path.',
        context: 'The heart of Al-Fatihah, repeated in every unit of every prayer — the one dua a Muslim makes at least seventeen times a day.',
        speaker: 'Every worshipper',
        ref: 'Al-Fatihah 1:6',
      },
      {
        arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
        latin: 'Hasbuna’llahu wa ni’ma’l-wakil',
        translation: 'Allah is sufficient for us, and He is the best Disposer of affairs.',
        context: 'What the believers said when warned that an army had gathered against them — and it only increased their faith.',
        speaker: 'The believers',
        ref: 'Aal ’Imran 3:173',
      },
      {
        arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
        latin: 'Hasbiya’llahu la ilaha illa huwa, ’alayhi tawakkaltu wa huwa rabbu’l-’arshi’l-’azim',
        translation: 'Allah is sufficient for me. There is no god but He. Upon Him I rely, and He is the Lord of the Mighty Throne.',
        context: 'The closing dua of Surah At-Tawbah — recommended seven times morning and evening as a prayer of total reliance.',
        speaker: 'The Prophet ﷺ',
        ref: 'At-Tawbah 9:129',
      },
      {
        arabic: 'رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ',
        latin: 'Rabbi a’udhu bika min hamazati’sh-shayatin, wa a’udhu bika rabbi an yahdurun',
        translation: 'My Lord, I seek refuge in You from the whisperings of the devils, and I seek refuge in You, my Lord, lest they be present with me.',
        context: 'A Quranic prayer of refuge — protection not only from the whispers but from the very presence of the whisperers.',
        speaker: 'The Prophet ﷺ',
        ref: 'Al-Mu’minun 23:97–98',
      },
      {
        arabic: 'حَسْبِيَ اللَّهُ وَنِعْمَ الْوَكِيلُ',
        latin: 'Hasbiya’llahu wa ni’ma’l-wakil',
        translation: 'Allah is sufficient for me, and He is the best Disposer of affairs.',
        context: 'The words Ibrahim is reported to have said as he was thrown into the fire — and the fire was made cool and safe.',
        speaker: 'Ibrahim (by report)',
        ref: 'Al-Anbiya 21:69 (context)',
      },
      {
        arabic: 'عَسَى رَبِّي أَن يَهْدِيَنِي سَوَاءَ السَّبِيلِ',
        latin: '’Asa rabbi an yahdiyani sawa’a’s-sabil',
        translation: 'Perhaps my Lord will guide me to the even path.',
        context: 'Musa’s hopeful words as he set out toward Madyan, a fugitive with no plan — trust voiced as quiet hope.',
        speaker: 'Musa',
        ref: 'Al-Qasas 28:22',
      },
    ],
  },
];

const TOTAL = SECTIONS.reduce((n, s) => n + s.duas.length, 0);

export default function QuranicDuasPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Duas of the Quran — The Complete Grouped Collection',
    url: 'https://quroots.com/blog/quranic-duas',
    publisher: { '@type': 'Organization', name: 'QuRoots' },
    educationalLevel: 'All levels',
    inLanguage: ['en', 'ar'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-xs text-text-tertiary mb-8" aria-label="Breadcrumb">
          <Link href="/blog" className="hover:text-text-secondary transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-text-secondary">Duas of the Quran</span>
        </nav>

        <p className="text-4xl font-arabic text-primary mb-3" dir="rtl">أَدْعِيَةُ الْقُرْآنِ</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-4">
          Duas of the Quran — The Supplications, Grouped &amp; Sourced
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed mb-4">
          The Quran is not only a book that is read to us — it is a book that teaches us how to speak back. Woven through its surahs are the actual words of prayer that prophets, angels, and believers used in their hardest and highest moments: Adam&apos;s first repentance, Yunus from inside the fish, Ibrahim raising the Kaʿbah, the angels who carry the Throne praying for <em>you</em>.
        </p>
        <p className="text-text-secondary text-base leading-relaxed mb-10">
          Below are <strong className="text-text">{TOTAL} of these supplications</strong>, grouped into three families: the communal <em>Rabbana</em> duas (&quot;Our Lord&quot;), the intimate <em>Rabbi</em> duas of the prophets (&quot;My Lord&quot;), and the short Quranic duas of reliance and refuge. Each card gives the fully-vowelled Arabic, a transliteration, the meaning, who said it, and the exact <span className="text-primary/90">surah:ayah</span> so you can read it in context.
        </p>

        {/* Why the Quran's own duas */}
        <section className="mb-12">
          <div className="rounded-2xl border border-primary/20 bg-primary-light p-6">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Why pray with the Quran&apos;s own words</h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              You may ask Allah for anything in any language. But the duas chosen by Allah Himself and placed in His Book carry a guarantee the rest do not: their wording is perfect, their meaning is sound, and reciting them is itself an act of worship. Notice the shared <em>adab</em> (etiquette) in nearly every one:
            </p>
            <ul className="space-y-2 text-sm text-text-secondary leading-relaxed">
              <li className="flex gap-2"><span className="text-primary shrink-0">•</span> They open by <strong className="text-text">naming the relationship</strong> — <em>rabbana</em>, <em>rabbi</em> (“my Lord”), before asking for anything.</li>
              <li className="flex gap-2"><span className="text-primary shrink-0">•</span> They often <strong className="text-text">praise before petition</strong> and close on one of God&apos;s names — <em>innaka anta’s-Sami’u’l-’Alim</em>.</li>
              <li className="flex gap-2"><span className="text-primary shrink-0">•</span> They ask for the <strong className="text-text">Hereafter alongside the world</strong>, never one at the cost of the other.</li>
            </ul>
          </div>
        </section>

        {/* Quick jump */}
        <nav className="mb-12 flex flex-wrap gap-2" aria-label="Sections">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface text-text-secondary hover:text-text hover:border-primary/40 transition-colors"
            >
              {s.title.split(' — ')[0]}
              <span className="text-text-tertiary ml-1.5">{s.duas.length}</span>
            </a>
          ))}
        </nav>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="mb-14 scroll-mt-20">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h2 className="text-xl font-semibold text-text">{section.title}</h2>
              <span className="font-arabic text-2xl text-primary shrink-0" dir="rtl">{section.arabic}</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">{section.intro}</p>

            <div className="space-y-4">
              {section.duas.map((d) => (
                <div key={d.ref + d.latin} className="rounded-2xl border border-border bg-surface p-6">
                  <p className="font-arabic text-2xl sm:text-[1.7rem] text-text text-right leading-loose mb-3" dir="rtl">{d.arabic}</p>
                  <p className="text-sm text-text-tertiary italic mb-2">{d.latin}</p>
                  <p className="text-base font-medium text-text leading-relaxed mb-4">&ldquo;{d.translation}&rdquo;</p>

                  <p className="text-sm text-text-secondary leading-relaxed mb-4">{d.context}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-light text-primary font-medium">
                      {d.speaker}
                    </span>
                    <span className="text-text-tertiary">
                      <span className="uppercase tracking-wider">Source </span>
                      <span className="text-text-secondary">{d.ref}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Key takeaways */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-text mb-4">How to use this collection</h2>
          <ul className="space-y-2 text-sm text-text-secondary leading-relaxed">
            <li className="flex gap-2"><span className="text-primary shrink-0">1.</span> Pick <strong className="text-text-secondary">one dua per week</strong> and memorise it with its meaning — understanding what you say transforms the prayer.</li>
            <li className="flex gap-2"><span className="text-primary shrink-0">2.</span> Match the dua to the moment: <em>Rabbi’shrah li sadri</em> before a hard task, <em>Hasbuna’llah</em> when you feel outnumbered, the dua of Yunus in distress.</li>
            <li className="flex gap-2"><span className="text-primary shrink-0">3.</span> Read each one <strong className="text-text-secondary">in its surah</strong> using the reference — the story around the dua is half its power.</li>
            <li className="flex gap-2"><span className="text-primary shrink-0">4.</span> Trace the verbs to their roots in the <Link href="/roots" className="text-primary hover:text-primary underline">Roots Browser</Link> — <span className="font-arabic">غ ف ر</span> (forgive), <span className="font-arabic">ر ح م</span> (mercy), <span className="font-arabic">ه د ي</span> (guide) recur across nearly every dua.</li>
          </ul>
        </section>

        <div className="flex items-center justify-between pt-8 border-t border-border-light">
          <Link href="/blog/classical-arabic-rebukes" className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">
            &larr; Rebukes &amp; Curse-Idioms
          </Link>
          <Link href="/blog" className="text-sm text-primary hover:text-primary transition-colors">
            All Articles &rarr;
          </Link>
        </div>
      </article>
    </>
  );
}
