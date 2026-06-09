import json
import os

db = {}

# 1. Main Page
db["main_page"] = {
    "title": "Islamic Philosophy",
    "meta": "From the Islamic Philosophy Encyclopedia",
    "infobox": {
        "title": "Islamic Philosophy",
        "image": "⚖️",
        "number": "Subfield of Philosophy",
        "meaning": "Falsafa & Kalam",
        "revelation_period": "8th – 17th Century (Classical)",
        "verses": "Major Schools: 5",
        "aliases": "Falsafa, Hikmah, Kalam"
    },
    "content": """
        <p><b>Islamic philosophy</b> is a branch of Islamic studies representing a systematic effort to reconcile philosophy (reason) and the religious teachings of Islam (revelation). The classical era of Islamic philosophy is historically understood to have coincided with the <b>Islamic Golden Age</b> (roughly 8th–14th centuries CE), extending to Safavid Persia in the 17th century.</p>
        
        <h2>Introduction</h2>
        <p>Islamic philosophy emerged during the Translation Movement in Baghdad, where classical Greek philosophical works (Aristotle, Plato, Plotinus) were translated into Arabic. Early Muslim thinkers sought to reconcile Greek rationalism with the monotheistic principles of the Quran, giving birth to unique schools of theology (<i>Kalam</i>) and rationalist metaphysics (<i>Falsafa</i>).</p>
        <p>A central Quranic anchor for early philosophers was <b>Surah Ali 'Imran (3:190)</b>: <i>"Indeed, in the creation of the heavens and the earth... are signs for those of understanding."</i> This and similar verses were viewed as divine mandates to investigate the natural order using intellect (<i>Aql</i>).</p>

        <h2>Major Schools of Thought</h2>
        <p>Islamic intellectual history is broadly categorized into five major traditions:</p>
        <ul>
            <li><b>Kalam (Theology)</b>: A dialectical rationalism focused on defending religious dogmas using logic. Key movements include the Mu'tazilites (strict rationalists) and the Ash'arites (moderates).</li>
            <li><b>Falsafa (Peripateticism)</b>: A rationalist tradition heavily influenced by Aristotelianism and Neoplatonism, led by thinkers like Al-Farabi, Ibn Sina, and Ibn Rushd.</li>
            <li><b>Ishraqi (Illuminationism)</b>: Founded by Suhrawardi, it criticizes Aristotelianism and blends rational logic with intuitive, mystical illumination.</li>
            <li><b>Athari (Traditionalism)</b>: Refuses dialectical theology (Kalam) and metaphorical interpretation of divine attributes, advocating for the literal acceptance of scripture (*bi-la kayfa*).</li>
            <li><b>Wahdat al-Wujud (Unity of Being)</b>: A mystical-metaphysical ontology founded by Ibn Arabi, asserting that all existence is ultimately a manifestation of a Single Reality (God).</li>
        </ul>

        <h2>Historical Significance</h2>
        <p>The philosophical works written in Arabic during this period were later translated into Latin and Hebrew. Thinkers like Ibn Sina (Avicenna) and Ibn Rushd (Averroes) had a profound impact on Western Europe, serving as the bridge to the European Renaissance and influencing medieval Christian scholastics such as Thomas Aquinas, who referred to Averroes simply as "The Commentator."</p>
    """
}

# 2. Kalam School
db["kalam_school"] = {
    "title": "Kalam (Islamic Theology)",
    "meta": "Theological School of Islamic Thought",
    "infobox": {
        "title": "Ilm al-Kalam",
        "image": "💬",
        "number": "Dialectical Theology",
        "meaning": "Defending religious dogmas",
        "revelation_period": "8th Century onwards",
        "verses": "Methods: Dialectics & Logic",
        "aliases": "Mutakallimun, Theology"
    },
    "content": """
        <p><b>ʿIlm al-Kalām</b> (Arabic: علم الكلام, literally "science of discourse") is the discipline of seeking theological knowledge through dialectics and rational argumentation. It is one of the "religious sciences" in Islamic tradition.</p>
        
        <h2>Origin and Definition</h2>
        <p>Kalam arose as a response to political divisions and theological debates in the early Muslim community. The main topics of discussion centered around the nature of God's attributes, the creation of the Quran, free will versus predestination, and the status of a sinner.</p>

        <h2>Major Sub-schools</h2>
        <h3>1. The Mu'tazilites</h3>
        <p>The Mu'tazilah was the earliest rationalist school of Kalam. They advocated for five theological principles, emphasizing **divine justice** (Adl) and **divine unity** (Tawhid). They argued that human reason is capable of defining moral truths and that the Quran was created, rather than eternal. To maintain divine unity, they rejected co-eternal attributes of God, arguing metaphorical interpretations of anthropomorphic verses like <b>Surah Al-Fath (48:10)</b> ("The Hand of Allah is over their hands").</p>

        <h3>2. The Ash'arites</h3>
        <p>Founded by Abu al-Hasan al-Ash'ari (who broke away from the Mu'tazilites), this school sought a middle path. They argued that while God's attributes are real and co-eternal, human reason cannot comprehend them completely (<i>bi-la kayfa</i> - without asking how). They also developed the theory of **acquisition** (<i>kasb</i>) to reconcile free will and predestination.</p>

        <h3>3. The Maturidites</h3>
        <p>Founded by Abu Mansur al-Maturidi, this school is highly similar to Ash'arism but gives a slightly greater role to human reason in ethics and free will, asserting that humans can discover some moral truths (like the existence of a Creator) through independent reasoning.</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "If it is said: 'Why do you engage in Kalam when the Salaf (early scholars) remained silent on it?' We reply: The Salaf were silent on it because no innovators had arisen to raise doubts. When doubts are raised, defending the truth becomes obligatory."
            <br><small>— Al-Ghazali, <i>Moderation in Belief (Al-Iqtisad fi al-I'tiqad)</i></small>
        </blockquote>
    """
}

# 3. Falsafa School
db["falsafa_school"] = {
    "title": "Falsafa (Islamic Peripateticism)",
    "meta": "Rationalist Philosophy School",
    "infobox": {
        "title": "Falsafa",
        "image": "🏛️",
        "number": "Islamic Peripateticism",
        "meaning": "Aristotelian-Neoplatonic synthesis",
        "revelation_period": "9th – 12th Century",
        "verses": "Core: Reason, Causality",
        "aliases": "Hikmah, Falasifah"
    },
    "content": """
        <p><b>Falsafa</b> (Arabic: فلسفة) refers to the rationalist philosophical school in the Islamic Golden Age that synthesized Greek Aristotelianism, Platonism, and Neoplatonism within an Islamic framework.</p>
        
        <h2>The Translation Movement</h2>
        <p>Falsafa began in the House of Wisdom in Baghdad during the Abbasid Caliphate. Translators like Hunayn ibn Ishaq translated the complete works of Aristotle and Plotinus. The early Peripatetics (known in Arabic as the <i>Mashsha'iyyah</i>) believed that philosophical truth and religious truth were two aspects of the same reality.</p>

        <h2>Core Concepts</h2>
        <h3>The Necessary Existent (Wajib al-Wujud)</h3>
        <p>Falasifah defined God as the *Necessary Existent* whose existence is identical to His essence. They argued that the universe emanated eternally from God as a logical consequence of His self-knowledge, a Neoplatonic view that clashed with traditional creationism. They linked this to <b>Surah Al-Qasas (28:88)</b>: <i>"Everything will be destroyed except His Face."</i></p>

        <h3>Active Intellect (al-Aql al-Fa'al)</h3>
        <p>They posited that human minds gain abstract knowledge by connecting to the *Active Intellect*, a cosmic intelligence representing the lowest of the celestial spheres. Prophetology was explained as a state where a prophet's highly refined intellect connects instantaneously to this Active Intellect, receiving knowledge in the form of imaginative symbols.</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "We ought not to be ashamed of appreciating the truth and of acquiring it wherever it comes from, even if it comes from foreign races and nations distant from us. For the seeker of truth there is nothing of higher value than the truth itself."
            <br><small>— Al-Kindi, <i>On First Philosophy (Fi al-Falsafah al-Ula)</i></small>
        </blockquote>
    """
}

# 4. Ishraqi School
db["ishraqi_school"] = {
    "title": "Ishraqi (Illuminationism)",
    "meta": "Philosophy of Light and Intuition",
    "infobox": {
        "title": "Hikmat al-Ishraq",
        "image": "☀️",
        "number": "Illuminationist School",
        "meaning": "Wisdom of Illumination",
        "revelation_period": "12th Century onwards",
        "verses": "Core: Intuitive presence",
        "aliases": "Illuminationism, Ishraqiyyun"
    },
    "content": """
        <p><b>Illuminationist philosophy</b> (Arabic: حكمت الإشراق, <i>Hikmat al-Ishraq</i>) is a philosophical school founded by Shihab al-Din al-Suhrawardi in the 12th century. It criticizes the rationalist Aristotelianism of Falsafa and advocates for a combination of intellectual rigor and intuitive vision.</p>
        
        <h2>The Ontology of Light</h2>
        <p>Suhrawardi replaced the traditional Aristotelian metaphysics of "substance and accident" with an ontology of **Light** (<i>Nur</i>). In his philosophy, all reality consists of degrees of light and darkness. God is the **Light of Lights** (<i>Nur al-Anwar</i>), from whom all existence radiates eternally. This school drew direct inspiration from the Quranic Verse of Light (<b>Surah An-Nur 24:35</b>): <i>"Allah is the Light of the heavens and the earth."</i></p>

        <h2>Knowledge by Presence (al-Ilm al-Huduri)</h2>
        <p>Illuminationists distinguish between two types of knowledge:</p>
        <ul>
            <li><b>Conceptual Knowledge</b>: Indirect knowledge obtained through representation, definitions, and concepts (used by Peripatetics).</li>
            <li><b>Knowledge by Presence</b>: Direct, unmediated intuitive awareness, similar to how the soul knows its own existence. Suhrawardi argued that true wisdom is only achieved when rational training is completed by mystical contemplation and purification of the soul.</li>
        </ul>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "The Light of Lights is that which is self-luminous and gives light to all other things. Its existence is too manifest to need definition, for all things are made manifest by it, and what makes other things manifest cannot itself be hidden."
            <br><small>— Suhrawardi, <i>The Philosophy of Illumination (Hikmat al-Ishraq)</i></small>
        </blockquote>
    """
}

# 5. Athari School
db["athari_school"] = {
    "title": "Athari School (Traditionalism)",
    "meta": "Scripturalist Theology School",
    "infobox": {
        "title": "Athariyyah",
        "image": "📜",
        "number": "Traditionalist School",
        "meaning": "Adhering to scriptural transmission",
        "revelation_period": "9th Century onwards",
        "verses": "Core: Literalism, Bila Kayfa",
        "aliases": "Salafiyyah, Ahl al-Hadith"
    },
    "content": """
        <p>The <b>Athari school</b> (Arabic: الأثرية, literally "textualist") is a school of Islamic theology that rejects dialectical rationalism (Kalam) in favor of strict reliance on the literal text of the Quran and the Hadith (traditions).</p>

        <h2>Core Principles</h2>
        <h3>Rejection of Kalam and Ta'wil</h3>
        <p>Atharis argue that human reason is subordinate to divine revelation. They strongly oppose the Mu'tazilite and Ash'arite practice of <i>ta'wil</i> (metaphorical interpretation) of God's attributes. If the Quran says God has a "Face" or "Hand," the Athari position is to accept it literally as described, without explaining it metaphorically, comparing it to creation, or asking how (<i>bi-la kayfa</i>). They cite <b>Surah Ash-Shura (42:11)</b>: <i>"There is nothing like unto Him, and He is the Hearing, the Seeing."</i></p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "We believe in these verses and traditions as they have come down, without comparing them to creation, without defining their limits, and without questioning their meanings. We say: Allah knows best what He meant."
            <br><small>— Ahmad ibn Hanbal, <i>Foundations of the Sunnah (Usul al-Sunnah)</i></small>
        </blockquote>
    """
}

# 6. Wahdat al-Wujud
db["wahdat_al_wujud"] = {
    "title": "Wahdat al-Wujud (Unity of Being)",
    "meta": "Sufi Metaphysical Ontology",
    "infobox": {
        "title": "Wahdat al-Wujud",
        "image": "🌀",
        "number": "Mystical Ontology",
        "meaning": "Absolute Unity of Existence",
        "revelation_period": "13th Century onwards",
        "verses": "Core: Self-manifestation of God",
        "aliases": "Akbarian School, Unity of Being"
    },
    "content": """
        <p><b>Wahdat al-Wujud</b> (Arabic: وحدة الوجود, "Unity of Existence") is a Sufi philosophical doctrine which asserts that all existence is ultimately a single, unified Reality (God), and that all created things are merely reflections or self-manifestations of that one divine source.</p>

        <h2>Metaphysical Foundations</h2>
        <p>Developed by the followers of Ibn Arabi, the doctrine argues that only God has absolute existence (<i>Wujud</i>). Created things do not possess existence independently; rather, they are "possible entities" that receive existence as a loan from the Divine. The universe is compared to a mirror reflecting the divine names and attributes. Practitioners cite <b>Surah Al-Baqarah (2:115)</b>: <i>"And to Allah belongs the east and the west. So wherever you turn, there is the Face of Allah."</i></p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "He is the Essence of all that is manifest, and He is the Hidden Essence of all that is unmanifest. The creation is nothing but His outer garment, and His reality is the inner spirit of all that exists."
            <br><small>— Ibn Arabi, <i>The Bezels of Wisdom (Fusus al-Hikam)</i></small>
        </blockquote>
    """
}

# 7. Al-Kindi
db["al_kindi"] = {
    "title": "Al-Kindi (Alkindus)",
    "meta": "The Father of Arabic Philosophy",
    "infobox": {
        "title": "Al-Kindi",
        "image": "📐",
        "number": "801 – 873 CE",
        "meaning": "Peripatetic Falsafa, Mathematics",
        "revelation_period": "Kufa / Baghdad, Iraq",
        "verses": "Key Work: On First Philosophy",
        "aliases": "Alkindus, Philosopher of the Arabs"
    },
    "content": """
        <p><b>Abu Yusuf Ya'qub ibn Ishaq al-Kindi</b> (known in the West as <b>Alkindus</b>) was the first major philosopher of the Islamic tradition. He is widely honored as the **"Philosopher of the Arabs"** for introducing Greek philosophy into the Arabic-speaking world.</p>

        <h2>Reconciling Philosophy and Revelation</h2>
        <p>Al-Kindi argued that philosophy (discovering truth through intellect) and religion (receiving truth through revelation) are entirely compatible. He asserted that the Quran contains philosophical truths expressed in clear, accessible language, and that the study of logic and metaphysics is necessary to fully comprehend divine revelation.</p>

        <h2>First Philosophy</h2>
        <p>In his treatise *On First Philosophy*, Al-Kindi defined metaphysics as the knowledge of the "First Truth" (God). He formulated one of the earliest arguments against the infinity of time and matter, asserting that the universe must have been created out of nothing (*ex nihilo*) by a sovereign Creator, a view that aligned closely with early Islamic theology.</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "We must not be ashamed of admiring the truth and of acquiring it wherever it comes from, even if it comes from foreign races and nations distant from us. For the seeker of truth, there is nothing of higher value than the truth itself."
            <br><small>— Al-Kindi, <i>On First Philosophy (Fi al-Falsafah al-Ula)</i></small>
        </blockquote>
    """
}

# 8. Al-Farabi
db["al_farabi"] = {
    "title": "Al-Farabi (Alpharabius)",
    "meta": "The Second Teacher | Classical Peripatetic",
    "infobox": {
        "title": "Al-Farabi",
        "image": "🧕",
        "number": "872 – 950 CE",
        "meaning": "Peripatetic Philosophy, Logic",
        "revelation_period": "Farab, Kazakhstan / Damascus",
        "verses": "Key Work: The Virtuous City",
        "aliases": "Alpharabius, The Second Teacher"
    },
    "content": """
        <p><b>Abu Nasr al-Farabi</b> (known in the West as <b>Alpharabius</b>) was an early Muslim philosopher and logician. He was regarded as the greatest philosophical authority in the Islamic world after Aristotle, earning him the title of **"The Second Teacher"** (<i>al-Mu'allim al-Thani</i>).</p>
        
        <h2>Contributions to Logic</h2>
        <p>Al-Farabi wrote extensive commentaries on Aristotle's Organon and organized logic into a complete system. He argued that logic is a universal grammar that provides the rules for correct reasoning, helping to distinguish truth from falsehood in all sciences.</p>

        <h2>The Virtuous City (Ara' Ahl al-Madina al-Fadila)</h2>
        <p>In his famous work, *The Virtuous City*, Al-Farabi adapted Plato's *Republic* to an Islamic context. He argued that the goal of political association is to achieve happiness for its citizens. The city should be ruled by a philosopher-king, whom Al-Farabi identified with the Islamic concept of the Prophet-Imam, possessing both philosophical intellect and prophetic imagination.</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "The Virtuous City is like a healthy body, whose limbs cooperate to preserve the life of the whole organism and to make it perfect. Just as the heart is the chief organ that regulates the body, the ruler of the city must be the source of its guidance and order."
            <br><small>— Al-Farabi, <i>The Virtuous City (Ara' Ahl al-Madina al-Fadila)</i></small>
        </blockquote>
    """
}

# 9. Al-Razi
db["al_razi"] = {
    "title": "Al-Razi (Rhazes)",
    "meta": "Platonist Philosopher and Master Physician",
    "infobox": {
        "title": "Al-Razi",
        "image": "⚖️",
        "number": "865 – 925 CE",
        "meaning": "Platonist Philosophy & Medicine",
        "revelation_period": "Rey, Iran / Baghdad",
        "verses": "Key Work: The Spiritual Physick",
        "aliases": "Rhazes, Abu Bakr al-Razi"
    },
    "content": """
        <p><b>Abu Bakr Muhammad ibn Zakariya al-Razi</b> (known in the West as <b>Rhazes</b>) was a Persian polymath, physician, and philosopher. He is widely considered one of the most important figures in the history of medicine, as well as a highly original, albeit controversial, rationalist philosopher.</p>
        
        <h2>The Five Eternals (al-Qudama al-Khamsah)</h2>
        <p>In his metaphysics, Al-Razi rejected the Aristotelian views of Falsafa and proposed a Platonist-inspired cosmology based on **Five Eternal Principles**: God, the Universal Soul, Absolute Matter, Absolute Space, and Absolute Time.</p>
        <p>He argued that the soul will remain trapped in the physical world until it is awakened by philosophy to recognize its divine, immaterial origin, at which point it will return to its spiritual home and the material universe will dissolve back into primary matter.</p>

        <h2>Strict Rationalism</h2>
        <p>Al-Razi was a defender of the absolute sufficiency of **Reason** (<i>Aql</i>). He believed that reason is God's greatest gift to humanity, capable of discovering scientific, physical, and moral truths without the need for supernatural revelation. Because of his controversial criticisms of organized religion and prophetic authority, his philosophical writings were heavily criticized by contemporary Muslim theologians and philosophers like Al-Farabi.</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "Reason is God's greatest gift to us... by it we understand all that elevates us and makes our lives good and noble. It is through reason that we have developed medicine, mathematics, and navigation. We must not allow passions or blind imitation to override it."
            <br><small>— Al-Razi, <i>The Spiritual Physick (Al-Tibb al-Ruhani)</i></small>
        </blockquote>
    """
}

# 10. Ibn Sina
db["ibn_sina"] = {
    "title": "Ibn Sina (Avicenna)",
    "meta": "Prince of Physicians | Master of Rationalist Falsafa",
    "infobox": {
        "title": "Ibn Sina",
        "image": "📖",
        "number": "980 – 1037 CE",
        "meaning": "Avicennian Metaphysics & Medicine",
        "revelation_period": "Bukhara, Uzbekistan / Hamadan",
        "verses": "Key Work: The Book of Healing",
        "aliases": "Avicenna, Al-Shaykh al-Ra'is"
    },
    "content": """
        <p><b>Ibn Sina</b> (known in the West as <b>Avicenna</b>) was a Persian polymath who is regarded as one of the most significant thinkers of the Islamic Golden Age. He consolidated Peripatetic philosophy into a systematic science known as Avicennian Metaphysics.</p>
        
        <h2>The Floating Man Thought Experiment</h2>
        <p>To prove the existence and immateriality of the soul, Ibn Sina proposed the **Floating Man** thought experiment. Imagine a person created in mid-air, fully mature but with their eyes covered and limbs splayed so they cannot touch anything or receive sensory input. Even without any sensory experience, this person would still be aware of their own self-existence. This demonstrates that the soul (consciousness) is independent of the physical body, anticipating Rene Descartes' <i>Cogito, ergo sum</i> by centuries. He linked the tranquil soul to <b>Surah Al-Fajr (89:27)</b>.</p>

        <h2>Proof of the Truthful (Burhan al-Siddiqin)</h2>
        <p>Ibn Sina formulated a cosmological argument for the existence of God. He classified existents into two categories: Contingent Existents and the Necessary Existent (<i>Wajib al-Wujud</i>). To avoid an infinite regress of causes, there must be a primary cause that is Necessary in itself. This Necessary Existent is God.</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "Let us imagine a man created all at once, floating in the void... His limbs are separated so they do not touch. He has no sight, no sound, no sense. If he is asked: 'Does he exist?' he would assert that he exists, even if he cannot affirm his body or any external matter. Thus, the soul is a distinct substance from the body."
            <br><small>— Ibn Sina, <i>The Book of Healing (Kitab al-Shifa)</i></small>
        </blockquote>
    """
}

# 11. Al-Ghazali
db["al_ghazali"] = {
    "title": "Al-Ghazali (Algazel)",
    "meta": "Proof of Islam | Critic of Peripateticism",
    "infobox": {
        "title": "Al-Ghazali",
        "image": "🕌",
        "number": "1058 – 1111 CE",
        "meaning": "Kalam, Ash'arism, Sufism",
        "revelation_period": "Tus, Iran / Baghdad",
        "verses": "Key Work: Deliverance from Error",
        "aliases": "Algazel, Hujjat al-Islam"
    },
    "content": """
        <p><b>Abu Hamid al-Ghazali</b> (known in the West as <b>Algazel</b>) was a Persian theologian, jurist, and mystic. He is regarded as one of the most influential figures in Islamic intellectual history, famous for his critiques of Greek philosophy and his integration of Sufism into mainstream theology.</p>
        
        <h2>The Critique of Falsafa</h2>
        <p>In his famous work *The Incoherence of the Philosophers* (<i>Tahafut al-Falasifah</i>), Al-Ghazali launched a devastating critique against the Peripatetics (specifically Al-Farabi and Ibn Sina). He argued that while logic and mathematics are valid, the philosophers failed to prove their metaphysical assertions using reason. He identified twenty philosophical errors, declaring three of them to be heretical: the eternity of the world, that God knows only universals, and the denial of physical resurrection.</p>

        <h2>Occasionalism (Denial of Natural Causality)</h2>
        <p>To defend divine omnipotence, Al-Ghazali advocated for **Occasionalism**. He argued that there is no necessary causal connection between natural events (such as fire touching cotton and cotton burning). Instead, fire does not cause the cotton to burn; rather, God creates the burning of the cotton at the "occasion" of contact. Natural laws are simply habitual patterns created by God's will. He linked this to <b>Surah Al-Anfal (8:17)</b>.</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "The connection between what is habitually believed to be a cause and what is believed to be an effect is not necessary... Rather, their connection is due to the prior decree of God, who creates them side-by-side, not because one has a power in itself to cause the other."
            <br><small>— Al-Ghazali, <i>The Incoherence of the Philosophers (Tahafut al-Falasifah)</i></small>
        </blockquote>
    """
}

# 12. Ibn Tufail
db["ibn_tufail"] = {
    "title": "Ibn Tufail (Abubacer)",
    "meta": "Andalusian Peripatetic and Novelist",
    "infobox": {
        "title": "Ibn Tufail",
        "image": "🌴",
        "number": "1105 – 1185 CE",
        "meaning": "Peripatetic Falsafa, Medicine",
        "revelation_period": "Guadix, Spain / Marrakech, Morocco",
        "verses": "Key Work: Hayy ibn Yaqzan",
        "aliases": "Abubacer, Author of Hayy"
    },
    "content": """
        <p><b>Abu Bakr Muhammad ibn Abd al-Malik ibn Tufail</b> (known in the West as <b>Abubacer</b>) was an Andalusian Arab philosopher, physician, and royal advisor. He is best known for writing the first philosophical novel, **Hayy ibn Yaqzan**.</p>

        <h2>The Self-Taught Intellect (Hayy ibn Yaqzan)</h2>
        <p>In *Hayy ibn Yaqzan* (literally "The Alive, Son of the Awake"), Ibn Tufail tells the story of a feral child who grows up completely alone on a deserted tropical island. Through independent observation, dissection, and rational reflection, Hayy discovers the laws of physics, astronomy, and biology. Eventually, he ascends to the metaphysical realization of a single Creator, demonstrating that human reason, left to itself, can reach the highest truths of science and religion.</p>

        <h2>Philosophy and Society</h2>
        <p>When Hayy eventually encounters a religious human society on a neighboring island, he realizes that the absolute rational truths he discovered are identical to the symbolic teachings of the prophets. However, he concludes that the majority of humanity is unable to grasp pure philosophical concepts and requires the visual and moral symbols of organized religion to live peacefully.</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "He began to contemplate the heavens and the earth... and he saw that all things, though diverse, were linked in a single order. He understood that this order must have a non-corporeal Creator, who is the source of all existence and light."
            <br><small>— Ibn Tufail, <i>Hayy ibn Yaqzan (The Living Son of the Awake)</i></small>
        </blockquote>
    """
}

# 13. Ibn Rushd
db["ibn_rushd"] = {
    "title": "Ibn Rushd (Averroes)",
    "meta": "The Commentator | Defender of Rationalism",
    "infobox": {
        "title": "Ibn Rushd",
        "image": "📜",
        "number": "1126 – 1198 CE",
        "meaning": "Aristotelianism, Law, Rationalism",
        "revelation_period": "Cordoba, Spain / Marrakech",
        "verses": "Key Work: Decisive Treatise",
        "aliases": "Averroes, The Commentator"
    },
    "content": """
        <p><b>Ibn Rushd</b> (known in the West as <b>Averroes</b>) was an Andalusian philosopher, jurist, and physician. He was the most prominent defender of rationalism in the western Islamic world, famous for his detailed commentaries on Aristotle.</p>
        
        <h2>Response to Al-Ghazali</h2>
        <p>Ibn Rushd wrote a systematic refutation of Al-Ghazali's critique titled *The Incoherence of the Incoherence* (<i>Tahafut al-Tahafut</i>). He argued that Al-Ghazali misunderstood both philosophy and theology. Ibn Rushd defended natural causality and asserted that rational philosophy is not only compatible with Islam but is actually commanded by the Quran.</p>

        <h2>The Decisive Treatise (Fasl al-Maqal)</h2>
        <p>In his legal treatise *Fasl al-Maqal*, Ibn Rushd examined whether the study of philosophy is permissible under Islamic law. He concluded that philosophy is **obligatory** (<i>wajib</i>) for those who possess the intellectual capacity to study it. He argued that truth cannot contradict truth; if scriptural revelation seems to contradict rational philosophy, the scripture must be interpreted allegorically (<i>ta'wil</i>).</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "If the activity of philosophy is nothing more than study of existing beings... and the Law has commanded us to reflect upon existing beings, then it is clear that the Law has commanded philosophy. And since truth cannot contradict truth, we assert that whenever a demonstration leads to a conclusion that conflicts with the literal meaning of scripture, that scripture must be interpreted allegorically."
            <br><small>— Ibn Rushd, <i>The Decisive Treatise (Fasl al-Maqal)</i></small>
        </blockquote>
    """
}

# 14. Ibn Arabi
db["ibn_arabi"] = {
    "title": "Ibn Arabi (The Greatest Master)",
    "meta": "Mystical Philosopher of Wahdat al-Wujud",
    "infobox": {
        "title": "Ibn Arabi",
        "image": "🌀",
        "number": "1165 – 1240 CE",
        "meaning": "Wahdat al-Wujud, Gnosis",
        "revelation_period": "Murcia, Spain / Damascus, Syria",
        "verses": "Key Work: Bezels of Wisdom",
        "aliases": "Al-Shaykh al-Akbar, Doctor Maximus"
    },
    "content": """
        <p><b>Muhyiddin Ibn Arabi</b> (known as **Al-Shaykh al-Akbar**, "The Greatest Master") was an Andalusian Sufi mystic and philosopher. He is the central figure of classical Islamic mysticism, famous for formulating the metaphysics of **Wahdat al-Wujud** (Unity of Being).</p>

        <h2>Metaphysical System</h2>
        <p>Ibn Arabi argued that all of creation is a series of mirrors reflecting the Divine. The universe is not separate from God; rather, it is the external manifestation of God's hidden names and attributes. He categorized existence into the Divine Essence (<i>al-Dhat</i>), the Divine Names, and the physical world. He drew extensively on <b>Surah Al-Baqarah (2:115)</b> to illustrate this divine omnipresence.</p>

        <h2>The Perfect Man (al-Insan al-Kamil)</h2>
        <p>He introduced the concept of the **Perfect Man** (<i>al-Insān al-Kāmil</i>), the human being who has realized their divine nature and acts as the bridge between God and creation. The Perfect Man is the microcosm through whom God contemplates His own reflection in the universe.</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "He is the mirror in which you see yourself, and you are the mirror in which He contemplates His Names and manifests His attributes. The servant is the Lord, and the Lord is the servant; would that I knew who is the one obligated to pray!"
            <br><small>— Ibn Arabi, <i>The Bezels of Wisdom (Fusus al-Hikam)</i></small>
        </blockquote>
    """
}

# 15. Ibn Khaldun
db["ibn_khaldun"] = {
    "title": "Ibn Khaldun",
    "meta": "Father of Sociology and Historiography",
    "infobox": {
        "title": "Ibn Khaldun",
        "image": "🌍",
        "number": "1332 – 1406 CE",
        "meaning": "Sociology, History, Economics",
        "revelation_period": "Tunis, Tunisia / Cairo, Egypt",
        "verses": "Key Work: The Muqaddimah",
        "aliases": "Father of Historiography"
    },
    "content": """
        <p><b>Ibn Khaldun</b> was a North African Arab sociologist, historian, and philosopher. He is widely acknowledged as one of the founding fathers of modern sociology, historiography, demography, and economics.</p>
        
        <h2>The Muqaddimah (The Introduction)</h2>
        <p>His masterwork, the *Muqaddimah* (originally written as an introduction to his book of world history), laid out the scientific foundations of history and society. He criticized traditional historians for simply copying legends and proposed a scientific method to verify historical accounts based on social laws.</p>

        <h2>Asabiyyah (Social Cohesion)</h2>
        <p>Ibn Khaldun introduced the concept of **Asabiyyah** (meaning "group feeling" or "social solidarity"). He argued that Asabiyyah is strongest among nomadic tribes. When a tribe with strong cohesion conquers a weakened urban empire, they establish a new dynasty. However, over generations, the ruling family becomes accustomed to luxury, the group feeling decays, and the dynasty collapses, repeating a predictable **5-stage cycle** of rise and fall every 120 years.</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "Dynasties have a natural lifespan like individuals. They grow, reach maturity, and then begin to decay... The lifespan of a dynasty rarely exceeds three generations, which is approximately one hundred and twenty years, as luxury and luxury-induced corruption destroy the group feeling (Assabiyyah) that founded the state."
            <br><small>— Ibn Khaldun, <i>The Muqaddimah</i></small>
        </blockquote>
    """
}

# 16. Ibn Taymiyyah
db["ibn_taymiyyah"] = {
    "title": "Ibn Taymiyyah",
    "meta": "Athari Reformer and Critic of Greek Logic",
    "infobox": {
        "title": "Ibn Taymiyyah",
        "image": "📖",
        "number": "1263 – 1328 CE",
        "meaning": "Athari Theology, Jurisprudence",
        "revelation_period": "Harran, Turkey / Damascus, Syria",
        "verses": "Key Work: Against the Logicians",
        "aliases": "Taqi al-Din, Sheikh al-Islam"
    },
    "content": """
        <p><b>Taqi al-Din Ahmad ibn Taymiyyah</b> was a Syrian Athari theologian and reformer. He is famous for his absolute defense of scriptural traditionalism and his devastating intellectual critiques of Greek logic and dialectical theology (Kalam).</p>

        <h2>Critique of Greek Logic (Aristotelianism)</h2>
        <p>In his monumental work *Against the Logicians* (<i>Nasihat al-Mutakallimin</i>), Ibn Taymiyyah argued that Aristotelian logic is a redundant and flawed framework. He asserted that definitions do not lead to the true essence of things, and that syllogisms are useless for acquiring new knowledge. He famously argued: **"Aristotelian logic is neither needed by the intelligent mind nor useful for the dull one."**</p>

        <h2>Defense of the Athari Creed</h2>
        <p>Ibn Taymiyyah advocated for a return to the methodology of the *Salaf* (the first three generations of Muslims). He rejected the allegorical interpretations of the Ash'arites and the rationalism of the Peripatetics, asserting that the Quran and Sunnah contain all necessary rational proofs for the existence and attributes of God without needing Greek terminology.</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "The logicians assert that no knowledge can be obtained except through definitions and syllogisms... But this is false. Most human knowledge, both in the sciences and in daily life, is obtained directly through perception and experience, without any recourse to their artificial definitions."
            <br><small>— Ibn Taymiyyah, <i>Against the Logicians (Radd 'ala al-Mantiqiyyin)</i></small>
        </blockquote>
    """
}

# 17. Suhrawardi
db["suhrawardi"] = {
    "title": "Suhrawardi",
    "meta": "The Master of Illumination | Sheikh al-Ishraq",
    "infobox": {
        "title": "Suhrawardi",
        "image": "☀️",
        "number": "1154 – 1191 CE",
        "meaning": "Illuminationist Philosophy",
        "revelation_period": "Suhraward, Iran / Aleppo, Syria",
        "verses": "Key Work: Philosophy of Illumination",
        "aliases": "Al-Maqtul, Sheikh al-Ishraq"
    },
    "content": """
        <p><b>Shihab al-Din al-Suhrawardi</b> (known as <b>Sheikh al-Ishraq</b>, "The Master of Illumination") was a Persian philosopher who founded the Illuminationist school of Islamic thought.</p>
        
        <h2>Philosophical Vision</h2>
        <p>Suhrawardi sought to reconcile rational discursive philosophy (represented by Peripateticism) with mystical experience (represented by Sufism). He believed that the ultimate truths are perceived through intuitive vision, which he termed "illumination".</p>

        <h2>Ontology of Light</h2>
        <p>In his masterpiece, *The Philosophy of Illumination* (<i>Hikmat al-Ishraq</i>), Suhrawardi posited that all of creation is composed of light. All beings are defined by their level of illumination: some are self-luminous (incorporeal lights), while others are dark substances (matter). All lights emanate from the **Light of Lights** (<i>Nur al-Anwar</i>).</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "True wisdom is not obtained by conceptual proof and discursive reasoning alone, but by direct tasting and spiritual vision. He who has not experienced the illumination of the Light of Lights remains in the darkness of concepts."
            <br><small>— Suhrawardi, <i>The Philosophy of Illumination (Hikmat al-Ishraq)</i></small>
        </blockquote>
    """
}

# 18. Mulla Sadra
db["mulla_sadra"] = {
    "title": "Mulla Sadra",
    "meta": "Master of Transcendent Theosophy",
    "infobox": {
        "title": "Mulla Sadra",
        "image": "⚖️",
        "number": "1571 – 1640 CE",
        "meaning": "Transcendent Philosophy",
        "revelation_period": "Shiraz, Iran / Isfahan",
        "verses": "Key Work: The Four Journeys",
        "aliases": "Sadr al-Din al-Shirazi"
    },
    "content": """
        <p><b>Sadr al-Din al-Shirazi</b> (known as <b>Mulla Sadra</b>) was a Persian philosopher who led the Iranian cultural renaissance in the 17th century. He synthesized Kalam, Falsafa, Ishraq, and Sufi gnosis into a single system called **Transcendent Theosophy** (<i>al-Hikmah al-Muta'aliyah</i>).</p>
        
        <h2>Primacy of Existence (Asalat al-Wujud)</h2>
        <p>Prior to Mulla Sadra, philosophers debated whether essence or existence is primary. Mulla Sadra argued that **Existence (Wujud) is primary**, and essence is merely an intellectual abstraction. Reality is a single, continuous existence that manifests in varying degrees of intensity—a concept known as the *gradation of existence* (<i>tashkik al-wujud</i>).</p>

        <h2>Substantial Motion (al-Harakat al-Jawhariyyah)</h2>
        <p>Classical Aristotelian philosophy held that change only occurs in accidental properties (like color or size), while the underlying substance of an object remains static. Mulla Sadra rejected this, arguing that the very **substance** of the universe is in constant motion and change, flowing continuously towards spiritual perfection.</p>

        <h2>Primary Source Excerpt</h2>
        <blockquote>
            "Existence is the sole reality, and it is a single, graded light that manifests in diverse degrees of intensity. Essences are nothing but the intellectual limits of these gradations, having no reality of their own except as concepts in the mind."
            <br><small>— Mulla Sadra, <i>The Four Journeys (Al-Asfar al-Arba'ah)</i></small>
        </blockquote>
    """
}

# Load detailed articles from the articles/ directory if present
articles_dir = '/home/razim/quran-app/philosophy/articles'
if os.path.exists(articles_dir):
    for key in db.keys():
        file_path = os.path.join(articles_dir, f"{key}.html")
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    html_content = f.read().strip()
                if html_content:
                    db[key]["content"] = html_content
                    print(f"Loaded content for {key} from HTML file.")
            except Exception as e:
                print(f"Error reading {file_path}: {e}")

# Write out the JSON database
dest_dir = '/home/razim/quran-app/philosophy'
os.makedirs(dest_dir, exist_ok=True)
dest_path = os.path.join(dest_dir, 'philosophy-data.json')
with open(dest_path, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=4, ensure_ascii=False)

print("DATABASE_SAVED_SUCCESSFULLY")
