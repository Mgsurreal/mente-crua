import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEREIA = ROOT / "modules" / "artigos" / "a-pequena-sereia-o-conto-em-que-o-amor-nao-salva-ninguem" / "translations"
CANTIGA = ROOT / "modules" / "artigos" / "durma-ou-alguma-coisa-vira-buscar-voce" / "translations"

REPLACEMENTS = {
    "pt-pt": {
        "São domesticados.": "São domesticadas.",
        "Mas a sereia criada por Hans Christian Andersen Ele não vivia": "Mas a sereia criada por Hans Christian Andersen não vivia",
        "Ele não recebe um corpo humano como presente": "Ela não recebe um corpo humano como presente",
        "Ele não conquista o príncipe.": "Ela não conquista o príncipe.",
        "Ele não regressa a casa.": "Ela não regressa a casa.",
        "Esta diferença perturba profundamente o protagonista.": "Esta diferença perturba profundamente a protagonista.",
        "O mais novo organiza o jardim": "A mais nova organiza o jardim",
    },
    "en-gb": {
        "Its roughest parts are trimmed": "Their roughest parts are trimmed",
        "But the mermaid created by Hans Christian Andersen He didn't live": "But the mermaid created by Hans Christian Andersen didn't live",
        "He does not receive a human body as a gift": "She does not receive a human body as a gift",
        "He does not conquer the prince.": "She does not conquer the prince.",
        "He does not return home.": "She does not return home.",
        "He wishes not to disappear.": "She does not wish to disappear.",
        "He wants to be human enough not to disappear.": "She wants to be human enough not to disappear.",
        "He prepares a potion capable of transforming his tail into legs.": "She prepares a potion capable of transforming her tail into legs.",
        "Their roughest parts are trimmed, its most awkward questions are replaced with comfortable answers, and its endings are rearranged": "Their roughest parts are trimmed, their most awkward questions are replaced with comfortable answers, and their endings are rearranged",
        "<strong>The Little Mermaid entered the</strong> modern imagination": "<strong>The Little Mermaid</strong> entered the modern imagination",
        "It does not defeat the witch.": "She does not defeat the witch.",
        "when he finally receives the opportunity to save his own life, he must choose": "when she finally receives the opportunity to save her own life, she must choose",
        "the one for whom he sacrificed everything": "the one for whom she sacrificed everything",
        "And it disappears into the sea.": "And she disappears into the sea.",
        "Still, he looked up.": "Still, she looked up.",
        "It represents a possibility of passage": "He represents a possibility of passage",
        "depends on whether it is chosen.": "depends on whether she is chosen.",
        "In it, he places flowers": "In it, she places flowers",
        "There is a restlessness in it that is difficult to explain. It is not exactly contempt for its origin.": "There is a restlessness in her that is difficult to explain. It is not exactly contempt for her origins.",
        "She watches it unseen, fascinated not only by its beauty": "She watches him unseen, fascinated not only by his beauty",
        "all that it represents: the human world": "all that he represents: the human world",
        "It saves the one who will never know who really saved him.": "She saves the one who will never know who really saved him.",
        "holds her body and keeps it above the waves": "holds his body and keeps him above the waves",
        "Then she takes it to the beach": "Then she takes him to the beach",
        "He possesses the truth, but he does not possess a voice": "She possesses the truth, but she does not possess a voice",
        "His first great gesture of love happens": "Her first great gesture of love happens",
        "Find out where the prince's palace is, repeatedly approach the coast and observe human life": "She finds out where the prince's palace is, repeatedly approaches the coast and observes human life",
        "The more you know that world": "The more she knows that world",
        "inseparable in his imagination": "inseparable in her imagination",
        "the witch often deceives. It offers": "the witch often deceives. She offers",
        "Everyone will see its lightness.": "Everyone will see her lightness.",
        "The witch cuts out his tongue.": "The witch cuts out her tongue.",
        "Just look at it.": "She can only look at him.",
        "Every movement, however, tears his feet.": "Every movement, however, tears her feet.",
        "During the night, he bleeds in silence.": "During the night, she bleeds in silence.",
        "But your suffering does not automatically produce understanding.": "But her suffering does not automatically produce understanding.",
        "Instead, it talks about the young woman": "Instead, he talks about the young woman",
        "You can't fix it.": "She cannot correct him.",
        "He cannot say: it was I who went through the storm.": "She cannot say: it was I who went through the storm.",
        "the loss of his voice": "the loss of her voice",
        "Without language, it cannot be fully known.": "Without language, she cannot be fully known.",
        "he doesn't see his story": "he doesn't see her story",
        "and finally the choice.": "and finally choose her.",
        "They gave them to the sea witch": "They gave it to the sea witch",
        "They offer him a knife.": "They offer her a knife.",
        "Everything you lost can be recovered.": "Everything she lost can be recovered.",
        "Your home.  </p>": "Her home.  </p>",
        "Your sisters.  </p>": "Her sisters.  </p>",
        "His three hundred years of life.": "Her three hundred years of life.",
        "the one for whom he abandoned everything": "the one for whom she abandoned everything",
        "He approaches with the knife in his hands.": "She approaches with the knife in her hands.",
        "Perhaps some readers wish it did.": "Perhaps some readers wish she did.",
        "He does not conclude that his own suffering gives him authority over his life. He does not demand payment for what he has voluntarily offered. He does not decide that, since he cannot have it, no one can.": "She does not conclude that her own suffering gives her authority over his life. She does not demand payment for what she voluntarily offered. She does not decide that, since she cannot have him, no one can.",
        "He throws the knife into the sea.": "She throws the knife into the sea.",
        "And jumps ship.": "And jumps from the ship.",
        "He suffers because he believes that he needs": "She suffers because she believes that she needs",
        "His original body seems insufficient. His life": "Her original body seems insufficient. Her life",
        "His voice, although extraordinary": "Her voice, although extraordinary",
        "He wants to escape the condition": "She wants to escape the condition",
        "The foam around it becomes luminous.": "The foam around her becomes luminous.",
        "It was not marriage that granted him a soul.": "It was not marriage that granted her a soul.",
        "Even in his hope, the tale retains a shadow.": "Even in its hope, the tale retains a shadow.",
        "The little mermaid does not control the prince's love. It does not control the rules that separate humans and sea creatures. He does not control the pact after accepting it.": "The little mermaid does not control the prince's love. She does not control the rules that separate humans and sea creatures. She does not control the pact after accepting it.",
        "In the final moment, however, he controls the knife.": "In the final moment, however, she controls the knife.",
        "It can turn your pain into violence or interrupt that movement. It can make someone else pay for the path they themselves chose. You can survive through his death.": "She can turn her pain into violence or interrupt that movement. She can make someone else pay for the path she chose. She can survive through the prince's death.",
        "does not give back your voice": "does not give back her voice",
        "what is still left of their humanity": "what is still left of her humanity",
        "the true birth of your soul": "the true birth of her soul",
        "It is what expresses his uniqueness. When you give your tongue to the witch, you are not just giving up a skill. It is eliminating the tool that could allow the human world to know it.": "It is what expresses her uniqueness. When she gives her tongue to the witch, she is not just giving up a skill. She is eliminating the tool that could allow the human world to know her.",
        "others interpret their silence": "others interpret her silence",
        "It can be admired as long as it remains impossible to hear.": "She can be admired as long as she remains impossible to hear.",
        "He can walk among humans, but he cannot tell": "She can walk among humans, but she cannot tell",
        "She can walk among humans, but she cannot tell how he got there.": "She can walk among humans, but she cannot tell how she got there.",
        "His new body is a body conquered by violence.": "Her new body is a body conquered by violence.",
        "the mermaid does not only lose her love. He also loses the explanation that supported everything he endured.": "the mermaid does not only lose the man she loves. She also loses the explanation that supported everything she endured.",
        "It could make the mermaid's voice return": "He could make the mermaid's voice return",
        "He could turn his rival into an impostor": "He could turn the princess into an impostor",
        "The family does not recover it.": "Her family does not recover her.",
        "It does not control the rules of the world.": "She does not control the rules of the world.",
        "But he controls what he will do with the knife.": "But she controls what she will do with the knife.",
        "Your mermaid is brave, but also impulsive. It is loving, but idealizes.": "Andersen's mermaid is brave, but also impulsive. She is loving, but idealizes.",
        "He does not find the love he imagined.": "She does not find the love she imagined.",
        "He does not return to the place from which he came.": "She does not return to the place from which she came.",
        "depends on your own actions": "depends on her own actions",
        "But he also fails to turn her into a murderer.": "But love also fails to turn her into a murderer.",
        "He believed that losing his voice": "She believed that losing her voice",
        "abandoning his own world": "abandoning her own world",
        "knives go through your feet": "knives go through her feet",
        "<strong>to interpret The Little Mermaid</strong> as just": "to interpret <strong>The Little Mermaid</strong> as just",
        "a story against love sacrifice. A warning to no one to abandon": "a story against self-sacrifice for love. A warning not to abandon",
        "she believes that it has purpose": "she believes that it has a purpose",
        "accompanies parties": "attends celebrations",
        "She was welcomed by <strong>the so-called daughters of the air</strong>.": "She was welcomed by the beings known as the <strong>Daughters of the Air</strong>.",
        "they can conquer it through good deeds": "they can earn one through good deeds",
        "He could make the mermaid's voice return": "He could have made the mermaid's voice return",
        "He could turn the princess into an impostor": "He could have turned the princess into an impostor",
        "loses her marine body": "loses her mermaid body",
        "How many of us can we abandon before the dream ceases to be ours?": "How much of ourselves can we abandon before the dream ceases to be ours?",
        "Palácio submarino antigo iluminado por feixes de luz que atravessam a superfície do oceano.": "Ancient underwater palace illuminated by beams of light passing through the ocean surface.",
        "Pequena sereia resgatando um príncipe inconsciente durante uma tempestade e um naufrágio.": "The little mermaid rescues an unconscious prince during a storm and shipwreck.",
        "Pequena sereia diante de uma bruxa do mar em uma caverna submarina sombria.": "The little mermaid faces a sea witch in a dark underwater cave.",
        "Jovem humana dançando descalça em um salão enquanto reflexos semelhantes a lâminas aparecem no chão.": "Young human woman dancing barefoot in a hall as blade-like reflections appear on the floor.",
        "Jovem segurando uma faca enquanto o príncipe e sua esposa dormem em um quarto de navio.": "Young woman holding a knife while the prince and his wife sleep in a ship's cabin.",
        "Pequena sereia entre o reino submarino e uma cidade humana iluminada acima da superfície.": "The little mermaid between the underwater kingdom and a human city glowing above the surface.",
        "A pequena sereia transformando-se em espuma luminosa e sendo recebida por figuras etéreas no céu.": "The little mermaid turns into luminous foam and is welcomed by ethereal figures in the sky.",
        "Faca antiga e concha abandonadas em uma praia escura ao nascer do sol.": "An antique knife and shell abandoned on a dark beach at sunrise.",
        "alt=\"Palácio submarino antigo iluminado por feixes de luz que atravessam a superfície do oceano.\"": "alt=\"Ancient underwater palace illuminated by beams of light passing through the ocean surface.\"",
        "alt=\"Pequena sereia resgatando um príncipe inconsciente durante uma tempestade e um naufrágio.\"": "alt=\"The little mermaid rescues an unconscious prince during a storm and shipwreck.\"",
        "alt=\"Pequena sereia diante de uma bruxa do mar em uma caverna submarina sombria.\"": "alt=\"The little mermaid faces a sea witch in a dark underwater cave.\"",
        "alt=\"Jovem humana dançando descalça em um salão enquanto reflexos semelhantes a lâminas aparecem no chão.\"": "alt=\"Young human woman dancing barefoot in a hall as blade-like reflections appear on the floor.\"",
        "alt=\"Jovem segurando uma faca enquanto o príncipe e sua esposa dormem em um quarto de navio.\"": "alt=\"Young woman holding a knife while the prince and his wife sleep in a ship's cabin.\"",
        "alt=\"Pequena sereia entre o reino submarino e uma cidade humana iluminada acima da superfície.\"": "alt=\"The little mermaid between the underwater kingdom and a human city glowing above the surface.\"",
        "alt=\"A pequena sereia transformando-se em espuma luminosa e sendo recebida por figuras etéreas no céu.\"": "alt=\"The little mermaid turns into luminous foam and is welcomed by ethereal figures in the sky.\"",
        "alt=\"Faca antiga e concha abandonadas em uma praia escura ao nascer do sol.\"": "alt=\"An antique knife and shell abandoned on a dark beach at sunrise.\"",
    },
    "es-es": {"Están domesticados.": "Están domesticadas."},
    "es-latam": {"Están domesticados.": "Están domesticadas."},
    "fr-fr": {
        "Ils sont domestiqués.": "Elles sont domestiquées.",
        "Mais la sirène créée par Hans Christian Andersen Il ne vivait": "Mais la sirène créée par Hans Christian Andersen ne vivait",
        "Il ne reçoit pas un corps humain en cadeau": "Elle ne reçoit pas un corps humain en cadeau",
        "Il ne conquiert pas le prince.": "Elle ne conquiert pas le prince.",
        "Il ne rentre pas chez lui.": "Elle ne rentre pas chez elle.",
        "Il ne souhaite pas disparaître.": "Elle ne souhaite pas disparaître.",
    },
    "it-it": {"Sono addomesticati.": "Sono addomesticate."},
}


for locale, replacements in REPLACEMENTS.items():
    path = SEREIA / f"{locale}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    serialized = json.dumps(data, ensure_ascii=False, indent=2)
    for old, new in replacements.items():
        serialized = serialized.replace(old, new)
    path.write_text(serialized, encoding="utf-8")
    print(f"{locale}: {len(replacements)} correções editoriais aplicadas")


CANTIGA_EN_REPLACEMENTS = {
    "Maybe you're thinking that the baby didn't even understand those words. He probably didn't really understand.":
        "Maybe you're thinking that the baby didn't even understand those words. The baby probably didn't.",
    "Thankfully. He heard the rhythm, recognized the voice and felt the body of those who rocked him.":
        "Thankfully. The baby heard the rhythm, recognized the voice and felt the body of the person rocking the cradle.",
    "Black-faced Ox</a>\n      They could appear": "Black-faced Ox</a>\n      could appear",
    "the form while the adult sang about danger. But perhaps the lyrics were not entirely addressed to her.":
        "the form while the adult sang about danger. But perhaps the lyrics were not entirely addressed to the child.",
    "The adult listened to his own anguish transformed into history.":
        "The adult heard their own anguish transformed into a story.",
    "Cuca comes to pick it up.": "Cuca comes to take the child away.",
    "the child is warned not to remain on the end of the bed. Otherwise, a small gray wolf may appear and take you into the forest.":
        "the child is warned not to stay near the edge of the bed. Otherwise, a small grey wolf may appear and carry the child into the forest.",
    "The child may not understand the risk of falling, but understands that he does not want to find the wolf.":
        "The child may not understand the risk of falling, but understands that meeting the wolf is best avoided.",
    "Many songs preserved not only her childhood, but the voice of those who took care of her.":
        "Many songs preserved not only childhood, but also the voices of those who cared for children.",
    "shifts the focus from the baby to the one who rocks him.":
        "shifts the focus from the baby to the person rocking the cradle.",
    "The child is cradled while his mother works in the fields.":
        "The child is cradled while the mother works in the fields.",
    "the child is cradled while his mother works in the fields.":
        "the child is cradled while the mother works in the fields.",
    "the adult world continues to function without being able to stop for him.":
        "the adult world keeps moving without being able to stop for the child.",
    "It is possible to tell where he lives, when he appears":
        "It is possible to say where it lives, when it appears",
    "what should be done to keep him away": "what should be done to keep it away",
    "He set a boundary:": "The monster set a boundary:",
    "He lives on whenever we invent a threatening presence":
        "It lives on whenever we invent a threatening presence",
    "But when he transforms the creature into a permanent authority":
        "But when the adult transforms the creature into a permanent authority",
    "History reminds us that maybe it won't.": "The story reminds us that maybe it won't.",
    "Coconut and Coke": "Coco and Coca",
    "Bag Man": "Boogeyman",
}

cantiga_en = CANTIGA / "en-gb.json"
cantiga_data = json.loads(cantiga_en.read_text(encoding="utf-8"))
cantiga_serialized = json.dumps(cantiga_data, ensure_ascii=False, indent=2)
for old, new in CANTIGA_EN_REPLACEMENTS.items():
    cantiga_serialized = cantiga_serialized.replace(old, new)
cantiga_en.write_text(cantiga_serialized, encoding="utf-8")
print(f"cantiga en-gb: {len(CANTIGA_EN_REPLACEMENTS)} correções editoriais aplicadas")


SEREIA_IMAGE_PATHS = {
    "img/imagem-01-abertura-do-oceano.webp": "img/abertura-do-oceano.webp",
    "img/imagem-02-o-naufragio.webp": "img/o-naufragio.webp",
    "img/imagem-03-pacto-com-a-bruxa-do-mar.webp": "img/pacto-com-a-bruxa-do-mar.webp",
    "img/imagem-04-danca-sobre-facas-invisiveis.webp": "img/danca-sobre-facas-invisiveis.webp",
    "img/imagem-05-escolha-diante-do-principe.webp": "img/escolha-diante-do-principe.webp",
    "img/imagem-06-sereia-diante-de-dois-mundos.webp": "img/sereia-diante-de-dois-mundos.webp",
    "img/imagem-07-salto-e-filhas-do-ar.webp": "img/salto-e-filhas-do-ar.webp",
    "img/imagem-08-final-do-artigo.webp": "img/final-do-artigo.webp",
}
for path in [SEREIA.parent / "data.json", *SEREIA.glob("*.json")]:
    data = json.loads(path.read_text(encoding="utf-8"))
    serialized = json.dumps(data, ensure_ascii=False, indent=2)
    for old, new in SEREIA_IMAGE_PATHS.items():
        serialized = serialized.replace(old, new)
    path.write_text(serialized, encoding="utf-8")
print("sereia: caminhos das 8 imagens internas normalizados")
