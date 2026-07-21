(() => {
    const trigger = document.querySelector('.home-intro-trigger');
    const drawer = document.querySelector('.home-intro-drawer');
    const close = drawer?.querySelector('.home-intro-close');
    const selector = document.querySelector('#site-language');
    if (!trigger || !drawer || !close) return;

    const translations = {
        'pt-br': ['A porta está aberta...', 'Atravesse. Aqui, toda certeza deixa uma sombra.', 'Você está diante de uma biblioteca construída para quem ainda sente prazer em pensar. Entre sem pressa. Caminhe por ideias antigas e inquietações modernas. Encontre filósofos, mitos, livros, conceitos e perguntas que sobreviveram ao tempo. O Mente Crua não exige que você concorde — apenas que deixe suas certezas do lado de fora por alguns instantes. Escolha uma porta. Siga uma dúvida. Talvez você não saia daqui olhando o mundo da mesma forma.', 'Entre. Questione. Volte diferente.', 'Entre no universo Mente Crua', 'Fechar convite'],
        'pt-pt': ['A porta está aberta...', 'Atravesse. Aqui, toda a certeza deixa uma sombra.', 'Está diante de uma biblioteca construída para quem ainda sente prazer em pensar. Entre sem pressa. Caminhe por ideias antigas e inquietações modernas. Encontre filósofos, mitos, livros, conceitos e perguntas que sobreviveram ao tempo. O Mente Crua não exige que concorde — apenas que deixe as suas certezas do lado de fora por alguns instantes. Escolha uma porta. Siga uma dúvida. Talvez não saia daqui a olhar o mundo da mesma forma.', 'Entre. Questione. Volte diferente.', 'Entre no universo Mente Crua', 'Fechar convite'],
        'en-gb': ['The door is open...', 'Step through. Here, every certainty casts a shadow.', 'You stand before a library built for those who still take pleasure in thinking. Enter without haste. Walk among ancient ideas and modern unease. Meet philosophers, myths, books, concepts and questions that have survived time. Mente Crua does not ask you to agree — only to leave your certainties outside for a moment. Choose a door. Follow a doubt. You may not leave seeing the world in quite the same way.', 'Enter. Question. Return changed.', 'Enter the world of Mente Crua', 'Close invitation'],
        'es-es': ['La puerta está abierta...', 'Cruza. Aquí, toda certeza proyecta una sombra.', 'Estás ante una biblioteca construida para quienes todavía disfrutan pensando. Entra sin prisa. Recorre ideas antiguas e inquietudes modernas. Encuentra filósofos, mitos, libros, conceptos y preguntas que han sobrevivido al tiempo. Mente Crua no exige que estés de acuerdo; solo que dejes tus certezas fuera durante unos instantes. Elige una puerta. Sigue una duda. Tal vez no salgas de aquí mirando el mundo de la misma manera.', 'Entra. Cuestiona. Vuelve diferente.', 'Entra en el universo Mente Crua', 'Cerrar invitación'],
        'es-latam': ['La puerta está abierta...', 'Cruza. Aquí, toda certeza proyecta una sombra.', 'Estás frente a una biblioteca construida para quienes todavía disfrutan pensar. Entra sin prisa. Recorre ideas antiguas e inquietudes modernas. Encuentra filósofos, mitos, libros, conceptos y preguntas que sobrevivieron al tiempo. Mente Crua no exige que estés de acuerdo; solo que dejes tus certezas afuera por unos instantes. Elige una puerta. Sigue una duda. Tal vez no salgas de aquí mirando el mundo de la misma manera.', 'Entra. Cuestiona. Vuelve diferente.', 'Entra al universo Mente Crua', 'Cerrar invitación'],
        'fr-fr': ['La porte est ouverte...', 'Franchissez-la. Ici, chaque certitude projette une ombre.', 'Vous êtes devant une bibliothèque conçue pour ceux qui éprouvent encore le plaisir de penser. Entrez sans hâte. Parcourez les idées anciennes et les inquiétudes modernes. Rencontrez des philosophes, des mythes, des livres, des concepts et des questions qui ont traversé le temps. Mente Crua ne vous demande pas d’être d’accord — seulement de laisser vos certitudes dehors quelques instants. Choisissez une porte. Suivez un doute. Peut-être ne repartirez-vous pas avec le même regard sur le monde.', 'Entrez. Questionnez. Revenez différent.', 'Entrez dans l’univers Mente Crua', 'Fermer l’invitation'],
        'de-de': ['Die Tür steht offen...', 'Treten Sie ein. Hier wirft jede Gewissheit einen Schatten.', 'Vor Ihnen liegt eine Bibliothek für Menschen, die noch Freude am Denken haben. Treten Sie ohne Eile ein. Wandern Sie durch alte Ideen und moderne Unruhe. Begegnen Sie Philosophen, Mythen, Büchern, Begriffen und Fragen, die die Zeit überdauert haben. Mente Crua verlangt keine Zustimmung — nur, dass Sie Ihre Gewissheiten für einen Augenblick draußen lassen. Wählen Sie eine Tür. Folgen Sie einem Zweifel. Vielleicht verlassen Sie diesen Ort mit einem anderen Blick auf die Welt.', 'Eintreten. Hinterfragen. Verändert zurückkehren.', 'Die Welt von Mente Crua betreten', 'Einladung schließen'],
        'it-it': ['La porta è aperta...', 'Attraversala. Qui ogni certezza lascia un’ombra.', 'Sei davanti a una biblioteca costruita per chi prova ancora piacere nel pensare. Entra senza fretta. Cammina tra idee antiche e inquietudini moderne. Incontra filosofi, miti, libri, concetti e domande sopravvissuti al tempo. Mente Crua non pretende che tu sia d’accordo: ti chiede soltanto di lasciare fuori le tue certezze per qualche istante. Scegli una porta. Segui un dubbio. Forse uscirai da qui guardando il mondo in modo diverso.', 'Entra. Interroga. Torna diverso.', 'Entra nell’universo Mente Crua', 'Chiudi invito'],
        'ru-ru': ['Дверь открыта...', 'Войдите. Здесь каждая уверенность отбрасывает тень.', 'Перед вами библиотека, созданная для тех, кто всё ещё получает удовольствие от размышлений. Входите не спеша. Пройдите среди древних идей и современных тревог. Встретьте философов, мифы, книги, понятия и вопросы, пережившие время. Mente Crua не требует согласия — лишь предлагает на мгновение оставить уверенность за порогом. Выберите дверь. Следуйте за сомнением. Возможно, вы выйдете отсюда с другим взглядом на мир.', 'Войдите. Спросите. Вернитесь другим.', 'Войти в мир Mente Crua', 'Закрыть приглашение'],
        'ar': ['الباب مفتوح...', 'اعبر. هنا لكل يقين ظلّ.', 'أمامك مكتبة بُنيت لمن لا يزال يجد متعة في التفكير. ادخل بلا عجلة. سر بين أفكار قديمة وقلق حديث. التقِ بالفلاسفة والأساطير والكتب والمفاهيم والأسئلة التي صمدت أمام الزمن. لا يطلب منك Mente Crua أن توافق، بل أن تترك يقينك خارج الباب للحظات. اختر باباً. اتبع شكّاً. لعلّك لا تخرج من هنا وأنت ترى العالم بالطريقة نفسها.', 'ادخل. تساءل. عُد مختلفاً.', 'ادخل عالم Mente Crua', 'إغلاق الدعوة'],
        'ar-eg': ['الباب مفتوح...', 'ادخل. هنا كل يقين وراه ظل.', 'قدامك مكتبة معمولة للي لسه بيستمتع بالتفكير. ادخل براحتك. امشِ وسط أفكار قديمة وقلق حديث. قابل فلاسفة وأساطير وكتب ومفاهيم وأسئلة عاشت أكتر من زمنها. Mente Crua مش بيطلب منك توافق، بس سيب يقينك برّه الباب شوية. اختار باب. امشِ ورا شك. يمكن تخرج من هنا وإنت شايف العالم بطريقة مختلفة.', 'ادخل. اسأل. ارجع مختلف.', 'ادخل عالم Mente Crua', 'اقفل الدعوة'],
        'hi-in': ['दरवाज़ा खुला है...', 'भीतर आइए। यहाँ हर निश्चितता एक छाया छोड़ती है।', 'आपके सामने उन लोगों के लिए बनी एक लाइब्रेरी है जिन्हें अब भी सोचने में आनंद मिलता है। बिना जल्दबाज़ी के प्रवेश कीजिए। पुराने विचारों और आधुनिक बेचैनियों के बीच चलिए। समय से बचे दार्शनिकों, मिथकों, पुस्तकों, अवधारणाओं और प्रश्नों से मिलिए। Mente Crua आपसे सहमत होने को नहीं कहता—बस कुछ पल के लिए अपनी निश्चितताओं को बाहर छोड़ने को कहता है। एक दरवाज़ा चुनिए। किसी संदेह के पीछे चलिए। शायद लौटते समय दुनिया वैसी न दिखे।', 'प्रवेश कीजिए। प्रश्न कीजिए। बदले हुए लौटिए।', 'Mente Crua की दुनिया में प्रवेश करें', 'निमंत्रण बंद करें'],
        'ja-jp': ['扉は開いています…', '足を踏み入れてください。ここでは、あらゆる確信が影を落とします。', 'ここは、今も考えることに喜びを感じる人のために築かれた図書館です。急がずにお入りください。古い思想と現代の不安の間を歩き、時を生き延びた哲学者、神話、本、概念、問いに出会ってください。Mente Cruaは同意を求めません。ただ少しの間、確信を扉の外に置いてほしいのです。扉を一つ選び、疑問を追ってください。帰る頃には、世界が同じようには見えないかもしれません。', '入り、問い、違う自分で戻る。', 'Mente Cruaの世界へ', '招待を閉じる'],
        'ko-kr': ['문은 열려 있습니다…', '들어오세요. 이곳에서는 모든 확신이 그림자를 드리웁니다.', '이곳은 아직도 생각하는 즐거움을 아는 사람들을 위해 세운 도서관입니다. 서두르지 말고 들어오세요. 오래된 사상과 현대의 불안 사이를 걸으며 시간을 견딘 철학자, 신화, 책, 개념과 질문을 만나세요. Mente Crua는 동의를 요구하지 않습니다. 잠시 확신을 문밖에 두기를 바랄 뿐입니다. 하나의 문을 고르고 의심을 따라가세요. 돌아갈 때에는 세상이 전과 같아 보이지 않을지도 모릅니다.', '들어오라. 질문하라. 달라져서 돌아가라.', 'Mente Crua의 세계로', '초대 닫기'],
        'zh-cn': ['门已打开……', '请走进来。在这里，每一种确信都会投下阴影。', '你面前是一座为仍能从思考中感到快乐的人建造的图书馆。请从容进入，在古老思想与现代不安之间行走，遇见穿越时间的哲学家、神话、书籍、概念与问题。Mente Crua不要求你赞同，只邀请你暂时把确信留在门外。选择一扇门，追随一个疑问。离开时，你眼中的世界也许已不再相同。', '进入。追问。带着改变归来。', '进入 Mente Crua 的世界', '关闭邀请']
    };

    const localizedNames = {
        'pt-br': 'Mente Crua',
        'pt-pt': 'Mente Crua',
        'en-gb': 'Raw Mind (Mente Crua)',
        'es-es': 'Mente Cruda (Mente Crua)',
        'es-latam': 'Mente Cruda (Mente Crua)',
        'fr-fr': 'Esprit Brut (Mente Crua)',
        'de-de': 'Roher Geist (Mente Crua)',
        'it-it': 'Mente Cruda (Mente Crua)',
        'ru-ru': 'Мысль без прикрас (Mente Crua)',
        'ar': 'فكر بلا أقنعة (Mente Crua)',
        'ar-eg': 'فكر بلا أقنعة (Mente Crua)',
        'hi-in': 'अनावृत विचार (Mente Crua)',
        'ja-jp': 'むきだしの思考 (Mente Crua)',
        'ko-kr': '날것의 생각 (Mente Crua)',
        'zh-cn': '赤思 (Mente Crua)'
    };

    const naturalPhrases = {
        'pt-br': [['Siga uma dúvida.', 'Siga o fio de uma dúvida.']],
        'pt-pt': [['Siga uma dúvida.', 'Siga o fio de uma dúvida.']],
        'en-gb': [['Follow a doubt.', 'Follow a thread of doubt.']],
        'es-es': [['Sigue una duda.', 'Sigue el hilo de una duda.']],
        'es-latam': [['Sigue una duda.', 'Sigue el rastro de una duda.']],
        'fr-fr': [['Suivez un doute.', 'Suivez le fil d’un doute.']],
        'de-de': [['Folgen Sie einem Zweifel.', 'Folgen Sie der Spur eines Zweifels.']],
        'it-it': [['Segui un dubbio.', 'Segui il filo di un dubbio.']],
        'ru-ru': [['Следуйте за сомнением.', 'Следуйте по следу сомнения.']]
    };

    const eyebrow = drawer.querySelector('.home-intro-eyebrow');
    const title = drawer.querySelector('h2');
    const paragraph = drawer.querySelector('p');
    const signature = drawer.querySelector('.home-intro-signature');

    function translate(language) {
        const source = translations[language] || translations['pt-br'];
        const localName = localizedNames[language] || 'Mente Crua';
        const text = source.map(value => value.replaceAll('Mente Crua', localName));
        (naturalPhrases[language] || []).forEach(([from, to]) => {
            text[2] = text[2].replace(from, to);
        });
        [eyebrow.textContent, title.textContent, paragraph.textContent, signature.textContent] = text;
        trigger.setAttribute('aria-label', text[4]);
        close.setAttribute('aria-label', text[5]);
    }

    function setOpen(open, returnFocus = false) {
        drawer.classList.toggle('is-open', open);
        trigger.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', String(open));
        drawer.setAttribute('aria-hidden', String(!open));
        if (open) setTimeout(() => close.focus({ preventScroll: true }), 280);
        if (!open && returnFocus) trigger.focus();
    }

    trigger.addEventListener('click', () => setOpen(!drawer.classList.contains('is-open')));
    close.addEventListener('click', () => setOpen(false, true));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false, true);
    });
    document.addEventListener('click', event => {
        if (drawer.classList.contains('is-open') && !drawer.contains(event.target) && !trigger.contains(event.target)) setOpen(false);
    });
    selector?.addEventListener('change', () => translate(selector.value));
    translate(selector?.value || localStorage.getItem('mente-crua-language') || 'pt-br');
})();
