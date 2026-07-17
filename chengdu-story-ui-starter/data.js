/* Nội dung canon S01-C01, chuyển thể từ CHUONG_01_NHUNG_NGAY_O_NHO.md. */
(function () {
  "use strict";

  const message = (id, type, zh, pinyin, speakerZh = "", speakerPinyin = "") => ({
    id, type, zh, pinyin,
    ...(speakerZh ? { speakerZh } : {}),
    ...(speakerPinyin ? { speakerPinyin } : {})
  });
  const system = (id, zh, pinyin) => message(id, "system", zh, pinyin);
  const qinghe = (id, zh, pinyin) => message(id, "incoming", zh, pinyin, "清荷姐", "Qīnghé jiě");
  const clerk = (id, zh, pinyin) => message(id, "incoming", zh, pinyin, "店员", "Diànyuán");
  const liu = (id, zh, pinyin) => message(id, "incoming", zh, pinyin, "刘阿姨", "Liú āyí");
  const player = (id, zh, pinyin) => message(id, "outgoing", zh, pinyin, "我", "Wǒ");
  const option = (id, tone, zh, pinyin, effect, reactions) => ({ id, tone, zh, pinyin, effect, reactions });
  const makeChoice = (id, promptZh, promptPinyin, options) => ({
    id,
    promptZh,
    promptPinyin,
    options: options.map(({ reactions, ...item }) => item),
    reactions: Object.fromEntries(options.map(item => [item.id, item.reactions]))
  });

  const commonAfterShoppingRequest = suffix => [
    qinghe(`r02-${suffix}-04`, "钱我晚点转给你。", "Qián wǒ wǎndiǎn zhuǎn gěi nǐ."),
    player(`r02-${suffix}-05`, "好，不着急。", "Hǎo, bù zháojí."),
    qinghe(`r02-${suffix}-06`, "别买太多辣的东西。你还不习惯这边的口味。", "Bié mǎi tài duō là de dōngxi. Nǐ hái bù xíguàn zhèbiān de kǒuwèi.")
  ];

  window.GAME_CONTENT = {
    meta: {
      projectId: "CHENGDU-STORY-S01",
      titleZh: "今天也有新消息",
      titlePinyin: "Jīntiān yě yǒu xīn xiāoxi"
    },
    chapter: {
      id: "S01-C01",
      titleVi: "Chương 1 — Những ngày ở nhờ",
      titleZh: "暂住的日子",
      titlePinyin: "Zànzhù de rìzi",
      subtitleZh: "到成都的第四天",
      subtitlePinyin: "Dào Chéngdū de dì sì tiān",
      estimatedMinutes: "24–28",
      previewWords: ["暂时", "方便", "室友", "找房子", "房源", "合租", "押金", "联系"],
      previewPatterns: [
        { zh: "可以……吗？", pinyin: "Kěyǐ…… ma?" },
        { zh: "需要我……吗？", pinyin: "Xūyào wǒ…… ma?" },
        { zh: "先……再……", pinyin: "Xiān…… zài……" },
        { zh: "是不是因为……？", pinyin: "Shì bú shì yīnwèi……?" },
        { zh: "你什么时候方便……？", pinyin: "Nǐ shénme shíhou fāngbiàn……?" }
      ],
      scenes: [
        {
          id: "scene-01-message",
          titleZh: "清荷的消息 · 17:42",
          titlePinyin: "Qīnghé de xiāoxi",
          relationshipNpcId: "npc-qinghe",
          messages: [
            system("s01-01", "欢迎来到成都。", "Huānyíng láidào Chéngdū."),
            system("s01-02", "这是你来到成都的第四天。", "Zhè shì nǐ láidào Chéngdū de dì sì tiān."),
            system("s01-03", "你暂时住在表姐清荷家。", "Nǐ zànshí zhù zài biǎojiě Qīnghé jiā."),
            system("s01-04", "工作、住处，还有这里的生活，一切都还没有确定。", "Gōngzuò, zhùchù, háiyǒu zhèlǐ de shēnghuó, yíqiè dōu hái méiyǒu quèdìng."),
            system("s01-05", "从今天开始，这是属于你的成都生活。", "Cóng jīntiān kāishǐ, zhè shì shǔyú nǐ de Chéngdū shēnghuó."),
            system("s01-06", "你刚从小区外面回来，手机震了一下。", "Nǐ gāng cóng xiǎoqū wàimiàn huílai, shǒujī zhèn le yíxià."),
            qinghe("s01-07", "你回来了没有？", "Nǐ huílai le méiyǒu?")
          ],
          choice: makeChoice("choice-01", "你怎么回复清荷？", "Nǐ zěnme huífù Qīnghé?", [
            option("c01-a", "helpful", "刚回来。你需要我买什么吗？", "Gāng huílai. Nǐ xūyào wǒ mǎi shénme ma?", { trust: 1, independence: 1 }, [
              qinghe("r01-a-01", "正好，帮我买两瓶水和一包方便面，可以吗？", "Zhènghǎo, bāng wǒ mǎi liǎng píng shuǐ hé yì bāo fāngbiànmiàn, kěyǐ ma?")
            ]),
            option("c01-b", "neutral", "我在楼下，马上上去。", "Wǒ zài lóuxià, mǎshàng shàngqu.", {}, [
              qinghe("r01-b-01", "那正好，帮我买两瓶水和一包方便面，可以吗？", "Nà zhènghǎo, bāng wǒ mǎi liǎng píng shuǐ hé yì bāo fāngbiànmiàn, kěyǐ ma?")
            ]),
            option("c01-c", "cautious", "还没有，怎么了？", "Hái méiyǒu, zěnme le?", {}, [
              qinghe("r01-c-01", "没什么。回来的时候，帮我买两瓶水和一包方便面，可以吗？", "Méi shénme. Huílai de shíhou, bāng wǒ mǎi liǎng píng shuǐ hé yì bāo fāngbiànmiàn, kěyǐ ma?")
            ])
          ])
        },
        {
          id: "scene-02-shopping-request",
          titleZh: "帮清荷买东西",
          titlePinyin: "Bāng Qīnghé mǎi dōngxi",
          relationshipNpcId: "npc-qinghe",
          messages: [qinghe("s02-01", "帮我买两瓶水和一包方便面，可以吗？", "Bāng wǒ mǎi liǎng píng shuǐ hé yì bāo fāngbiànmiàn, kěyǐ ma?")],
          choice: makeChoice("choice-02", "你怎么回答？", "Nǐ zěnme huídá?", [
            option("c02-a", "direct", "可以，我现在去。", "Kěyǐ, wǒ xiànzài qù.", { confidence: 1, independence: 1 }, [
              qinghe("r02-a-01", "谢谢。红烧牛肉味的，不要太辣。", "Xièxie. Hóngshāo niúròu wèi de, bú yào tài là."),
              ...commonAfterShoppingRequest("a")
            ]),
            option("c02-b", "clarify", "哪一种方便面？", "Nǎ yì zhǒng fāngbiànmiàn?", { confidence: 1 }, [
              qinghe("r02-b-01", "红烧牛肉味的，不要太辣。", "Hóngshāo niúròu wèi de, bú yào tài là."),
              qinghe("r02-b-02", "你要是找不到，就问店员。", "Nǐ yàoshi zhǎo bú dào, jiù wèn diànyuán."),
              ...commonAfterShoppingRequest("b")
            ]),
            option("c02-c", "visual", "我怕买错，你发张照片给我吧。", "Wǒ pà mǎi cuò, nǐ fā zhāng zhàopiàn gěi wǒ ba.", { calm: 1 }, [
              qinghe("r02-c-01", "就是这个。", "Jiù shì zhège."),
              qinghe("r02-c-02", "找不到的话，买别的也可以。", "Zhǎo bú dào dehuà, mǎi biéde yě kěyǐ."),
              ...commonAfterShoppingRequest("c")
            ])
          ])
        },
        {
          id: "scene-03-store-help",
          titleZh: "便利店",
          titlePinyin: "Biànlìdiàn",
          messages: [
            system("s03-01", "五分钟后，你走进了小区门口的便利店。", "Wǔ fēnzhōng hòu, nǐ zǒujìn le xiǎoqū ménkǒu de biànlìdiàn."),
            clerk("s03-02", "你好，需要帮忙吗？", "Nǐ hǎo, xūyào bāngmáng ma?")
          ],
          choice: makeChoice("choice-03", "你怎么回答店员？", "Nǐ zěnme huídá diànyuán?", [
            option("c03-a", "direct", "我想找矿泉水。", "Wǒ xiǎng zhǎo kuàngquánshuǐ.", { confidence: 1 }, [clerk("r03-a-01", "在那边，冰柜旁边。", "Zài nàbiān, bīngguì pángbiān.")]),
            option("c03-b", "polite", "请问，水在哪儿？", "Qǐngwèn, shuǐ zài nǎr?", { confidence: 1 }, [clerk("r03-b-01", "直走，在冰柜旁边。", "Zhí zǒu, zài bīngguì pángbiān.")]),
            option("c03-c", "avoid", "先不用，谢谢。", "Xiān bú yòng, xièxie.", {}, [clerk("r03-c-01", "好的。", "Hǎo de.")])
          ])
        },
        {
          id: "scene-04-checkout-bag",
          titleZh: "结账",
          titlePinyin: "Jiézhàng",
          messages: [
            system("s04-01", "你找到了水，也找到了清荷说的方便面。", "Nǐ zhǎodào le shuǐ, yě zhǎodào le Qīnghé shuō de fāngbiànmiàn."),
            system("s04-02", "收银员说得很快。", "Shōuyínyuán shuō de hěn kuài."),
            clerk("s04-03", "一共十五块八。", "Yígòng shíwǔ kuài bā."),
            clerk("s04-04", "要袋子吗？", "Yào dàizi ma?")
          ],
          choice: makeChoice("choice-04", "你听清楚了吗？", "Nǐ tīng qīngchu le ma?", [
            option("c04-a", "yes", "要一个，谢谢。", "Yào yí ge, xièxie.", { confidence: 1 }, [clerk("r04-a-01", "好的。", "Hǎo de.")]),
            option("c04-b", "no", "不用，谢谢。", "Bú yòng, xièxie.", { confidence: 1 }, [clerk("r04-b-01", "好。", "Hǎo.")]),
            option("c04-c", "repeat", "不好意思，请再说一遍。", "Bù hǎoyìsi, qǐng zài shuō yí biàn.", { confidence: 1, flag: "ASK_REPEAT_USED" }, [
              clerk("r04-c-01", "要不要袋子？", "Yào bú yào dàizi?"),
              player("r04-c-02", "要一个，谢谢。", "Yào yí ge, xièxie.")
            ])
          ])
        },
        {
          id: "scene-05-payment",
          titleZh: "选择支付方式",
          titlePinyin: "Xuǎnzé zhīfù fāngshì",
          messages: [clerk("s05-01", "支付宝还是微信？", "Zhīfùbǎo háishi Wēixìn?")],
          choice: makeChoice("choice-05", "你想怎么支付？", "Nǐ xiǎng zěnme zhīfù?", [
            option("c05-a", "alipay", "支付宝。", "Zhīfùbǎo.", {}, [clerk("r05-a-01", "请扫这里。", "Qǐng sǎo zhèlǐ."), clerk("r05-a-02", "好了，慢走。", "Hǎo le, màn zǒu."), player("r05-a-03", "谢谢。", "Xièxie."), system("r05-a-04", "你走出便利店，发现自己刚才一次也没有用翻译软件。", "Nǐ zǒuchū biànlìdiàn, fāxiàn zìjǐ gāngcái yí cì yě méiyǒu yòng fānyì ruǎnjiàn.")]),
            option("c05-b", "wechat", "微信。", "Wēixìn.", {}, [clerk("r05-b-01", "请扫这里。", "Qǐng sǎo zhèlǐ."), clerk("r05-b-02", "好了，慢走。", "Hǎo le, màn zǒu."), player("r05-b-03", "谢谢。", "Xièxie."), system("r05-b-04", "你走出便利店，发现自己刚才一次也没有用翻译软件。", "Nǐ zǒuchū biànlìdiàn, fāxiàn zìjǐ gāngcái yí cì yě méiyǒu yòng fānyì ruǎnjiàn.")]),
            option("c05-c", "cash", "可以用现金吗？", "Kěyǐ yòng xiànjīn ma?", {}, [clerk("r05-c-01", "可以。", "Kěyǐ."), clerk("r05-c-02", "好了，慢走。", "Hǎo le, màn zǒu."), player("r05-c-03", "谢谢。", "Xièxie."), system("r05-c-04", "你走出便利店，发现自己刚才一次也没有用翻译软件。", "Nǐ zǒuchū biànlìdiàn, fāxiàn zìjǐ gāngcái yí cì yě méiyǒu yòng fānyì ruǎnjiàn.")])
          ])
        },
        {
          id: "scene-06-dinner",
          titleZh: "晚饭时",
          titlePinyin: "Wǎnfàn shí",
          relationshipNpcId: "npc-qinghe",
          messages: [
            qinghe("s06-01", "回来了？辛苦了。", "Huílai le? Xīnkǔ le."),
            player("s06-02", "不辛苦。", "Bù xīnkǔ."),
            qinghe("s06-03", "买对了，就是这个。", "Mǎi duì le, jiù shì zhège."),
            qinghe("s06-04", "这几天住得还习惯吗？", "Zhè jǐ tiān zhù de hái xíguàn ma?")
          ],
          choice: makeChoice("choice-06", "你怎么回答清荷？", "Nǐ zěnme huídá Qīnghé?", [
            option("c06-a", "open", "还可以，就是有点不习惯这边的生活。", "Hái kěyǐ, jiùshì yǒudiǎn bù xíguàn zhèbiān de shēnghuó.", { trust: 1, openness: 1 }, [
              qinghe("r06-a-01", "慢慢来。刚来的时候都这样。", "Mànmàn lái. Gāng lái de shíhou dōu zhèyàng."),
              qinghe("r06-a-02", "有什么不明白的，可以直接问我。", "Yǒu shénme bù míngbai de, kěyǐ zhíjiē wèn wǒ.")
            ]),
            option("c06-b", "reassure", "挺好的，你不用担心。", "Tǐng hǎo de, nǐ bú yòng dānxīn.", { trust: 1 }, [
              qinghe("r06-b-01", "真的？你这两天话很少。", "Zhēn de? Nǐ zhè liǎng tiān huà hěn shǎo."),
              player("r06-b-02", "我只是还不太习惯。", "Wǒ zhǐshì hái bú tài xíguàn.")
            ]),
            option("c06-c", "brief", "还好。", "Hái hǎo.", {}, [qinghe("r06-c-01", "嗯。要是不方便，就告诉我。", "Ńg. Yàoshi bù fāngbiàn, jiù gàosu wǒ.")])
          ])
        },
        {
          id: "scene-07-priority",
          titleZh: "先找工作还是房子",
          titlePinyin: "Xiān zhǎo gōngzuò háishi fángzi",
          relationshipNpcId: "npc-qinghe",
          messages: [qinghe("s07-01", "对了，你接下来想先找工作，还是先找房子？", "Duì le, nǐ jiēxiàlai xiǎng xiān zhǎo gōngzuò, háishi xiān zhǎo fángzi?")],
          choice: makeChoice("choice-07", "你怎么回答？", "Nǐ zěnme huídá?", [
            option("c07-a", "housing", "我想先找房子。", "Wǒ xiǎng xiān zhǎo fángzi.", { independence: 1 }, [qinghe("r07-a-01", "也好。有住的地方，做别的事会安心一点。", "Yě hǎo. Yǒu zhù de dìfang, zuò biéde shì huì ānxīn yìdiǎn.")]),
            option("c07-b", "work", "我想先找工作。", "Wǒ xiǎng xiān zhǎo gōngzuò.", { calm: -1 }, [qinghe("r07-b-01", "先找工作也行，但是房子的时间可能更紧。", "Xiān zhǎo gōngzuò yě xíng, dànshì fángzi de shíjiān kěnéng gèng jǐn.")]),
            option("c07-c", "unsure", "我还没想好。", "Wǒ hái méi xiǎng hǎo.", { calm: -1, independence: -1 }, [qinghe("r07-c-01", "你不能一直不想。至少要先看看。", "Nǐ bù néng yìzhí bù xiǎng. Zhìshǎo yào xiān kànkan.")])
          ])
        },
        {
          id: "scene-08-room-truth",
          titleZh: "关于现在的房间",
          titlePinyin: "Guānyú xiànzài de fángjiān",
          relationshipNpcId: "npc-qinghe",
          messages: [
            qinghe("s08-01", "有件事，我得提前告诉你。", "Yǒu jiàn shì, wǒ děi tíqián gàosu nǐ."),
            qinghe("s08-02", "我室友周琳星期天回来。", "Wǒ shìyǒu Zhōu Lín xīngqītiān huílai."),
            qinghe("s08-03", "这个房子是我们一起租的。", "Zhège fángzi shì wǒmen yìqǐ zū de."),
            qinghe("s08-04", "她回来以后，也要用现在这个房间。", "Tā huílai yǐhòu, yě yào yòng xiànzài zhège fángjiān.")
          ],
          choice: makeChoice("choice-08", "你怎么回应？", "Nǐ zěnme huíyìng?", [
            option("c08-a", "accept", "我明白。我会尽快找房子。", "Wǒ míngbai. Wǒ huì jǐnkuài zhǎo fángzi.", { independence: 2, trust: 1, openness: 1 }, [
              qinghe("r08-a-01", "你别有压力。我不是赶你走。", "Nǐ bié yǒu yālì. Wǒ bú shì gǎn nǐ zǒu."),
              qinghe("r08-a-02", "只是早点准备比较好。", "Zhǐshì zǎodiǎn zhǔnbèi bǐjiào hǎo."),
              qinghe("r08-a-03", "我可以帮你看房源。", "Wǒ kěyǐ bāng nǐ kàn fángyuán."),
              qinghe("r08-a-04", "但是最后住哪里，还是要你自己决定。", "Dànshì zuìhòu zhù nǎli, háishi yào nǐ zìjǐ juédìng."),
              qinghe("r08-a-05", "先吃饭吧，面快凉了。", "Xiān chīfàn ba, miàn kuài liáng le."),
              system("r08-a-06", "你点了点头，却突然没什么胃口。", "Nǐ diǎn le diǎn tóu, què tūrán méi shénme wèikǒu.")
            ]),
            option("c08-b", "question", "你是不是不方便让我住？", "Nǐ shì bú shì bù fāngbiàn ràng wǒ zhù?", { openness: 2, calm: -1 }, [
              qinghe("r08-b-01", "不是这个意思。", "Bú shì zhège yìsi."),
              qinghe("r08-b-02", "但这是我们一起租的房子，我不能替她决定。", "Dàn zhè shì wǒmen yìqǐ zū de fángzi, wǒ bù néng tì tā juédìng."),
              qinghe("r08-b-03", "我应该早点跟你说清楚。", "Wǒ yīnggāi zǎodiǎn gēn nǐ shuō qīngchu."),
              qinghe("r08-b-04", "我可以帮你看房源。", "Wǒ kěyǐ bāng nǐ kàn fángyuán."),
              qinghe("r08-b-05", "但是最后住哪里，还是要你自己决定。", "Dànshì zuìhòu zhù nǎli, háishi yào nǐ zìjǐ juédìng."),
              qinghe("r08-b-06", "先吃饭吧，面快凉了。", "Xiān chīfàn ba, miàn kuài liáng le."),
              system("r08-b-07", "你点了点头，却突然没什么胃口。", "Nǐ diǎn le diǎn tóu, què tūrán méi shénme wèikǒu.")
            ]),
            option("c08-c", "apologize", "对不起，给你添麻烦了。", "Duìbuqǐ, gěi nǐ tiān máfan le.", { trust: 1, calm: -1 }, [
              qinghe("r08-c-01", "不是你的错。", "Bú shì nǐ de cuò."),
              qinghe("r08-c-02", "你刚到成都，本来就需要一点时间。", "Nǐ gāng dào Chéngdū, běnlái jiù xūyào yìdiǎn shíjiān."),
              qinghe("r08-c-03", "别什么事都先怪自己。", "Bié shénme shì dōu xiān guài zìjǐ."),
              qinghe("r08-c-04", "我可以帮你看房源。", "Wǒ kěyǐ bāng nǐ kàn fángyuán."),
              qinghe("r08-c-05", "但是最后住哪里，还是要你自己决定。", "Dànshì zuìhòu zhù nǎli, háishi yào nǐ zìjǐ juédìng."),
              qinghe("r08-c-06", "先吃饭吧，面快凉了。", "Xiān chīfàn ba, miàn kuài liáng le."),
              system("r08-c-07", "你点了点头，却突然没什么胃口。", "Nǐ diǎn le diǎn tóu, què tūrán méi shénme wèikǒu.")
            ])
          ])
        },
        {
          id: "scene-09-phone-screen",
          titleZh: "手机屏幕上的消息",
          titlePinyin: "Shǒujī píngmù shàng de xiāoxi",
          relationshipNpcId: "npc-qinghe",
          messages: [
            system("s09-01", "晚上，清荷去洗澡了。", "Wǎnshang, Qīnghé qù xǐzǎo le."),
            system("s09-02", "你去客厅拿充电器，桌上的手机屏幕突然亮了。", "Nǐ qù kètīng ná chōngdiànqì, zhuō shàng de shǒujī píngmù tūrán liàng le."),
            system("s09-03", "周琳：我星期天回来。", "Zhōu Lín: Wǒ xīngqītiān huílai."),
            system("s09-04", "客房里的东西麻烦先收一下。", "Kèfáng lǐ de dōngxi máfan xiān shōu yíxià.")
          ],
          choice: makeChoice("choice-09", "你会怎么做？", "Nǐ huì zěnme zuò?", [
            option("c09-a", "honest", "刚才屏幕亮了，我不小心看到了周琳的消息。", "Gāngcái píngmù liàng le, wǒ bù xiǎoxīn kàndào le Zhōu Lín de xiāoxi.", { openness: 2, calm: 1, flag: "ASSUMPTION_BIAS_FALSE" }, [
              qinghe("r09-a-01", "没关系。", "Méi guānxi."),
              qinghe("r09-a-02", "我本来就应该早点跟你说清楚。", "Wǒ běnlái jiù yīnggāi zǎodiǎn gēn nǐ shuō qīngchu."),
              qinghe("r09-a-03", "周琳没有意见，只是她回来以后要用这个房间。", "Zhōu Lín méiyǒu yìjiàn, zhǐshì tā huílai yǐhòu yào yòng zhège fángjiān."),
              system("r09-a-04", "你虽然有点不安，但已经知道明天要做什么。", "Nǐ suīrán yǒudiǎn bù'ān, dàn yǐjīng zhīdào míngtiān yào zuò shénme.")
            ]),
            option("c09-b", "prepare", "我今晚先整理一下行李吧。", "Wǒ jīnwǎn xiān zhěnglǐ yíxià xíngli ba.", { independence: 1, calm: -1 }, [
              qinghe("r09-b-01", "你怎么开始收拾了？", "Nǐ zěnme kāishǐ shōushi le?"),
              player("r09-b-02", "早点准备比较好。", "Zǎodiǎn zhǔnbèi bǐjiào hǎo."),
              qinghe("r09-b-03", "不用这么急。明天先看看房子。", "Bú yòng zhème jí. Míngtiān xiān kànkan fángzi."),
              system("r09-b-04", "你躺了很久，还是没有睡着。", "Nǐ tǎng le hěn jiǔ, háishi méiyǒu shuìzháo.")
            ]),
            option("c09-c", "assume", "原来她们早就决定好了。", "Yuánlái tāmen zǎo jiù juédìng hǎo le.", { trust: -1, calm: -2, flag: "ASSUMPTION_BIAS_TRUE" }, [
              system("r09-c-01", "你没有问，也没有确认。", "Nǐ méiyǒu wèn, yě méiyǒu quèrèn."),
              system("r09-c-02", "心里却越来越不舒服。", "Xīnlǐ què yuèláiyuè bù shūfu."),
              system("r09-c-03", "你躺了很久，还是没有睡着。", "Nǐ tǎng le hěn jiǔ, háishi méiyǒu shuìzháo.")
            ])
          ])
        },
        {
          id: "scene-10-morning",
          titleZh: "第二天早上",
          titlePinyin: "Dì èr tiān zǎoshang",
          relationshipNpcId: "npc-qinghe",
          messages: [qinghe("s10-01", "早上好。昨晚睡得好吗？", "Zǎoshang hǎo. Zuówǎn shuì de hǎo ma?")],
          choice: makeChoice("choice-10", "你怎么回答？", "Nǐ zěnme huídá?", [
            option("c10-a", "fine", "还可以。", "Hái kěyǐ.", {}, [qinghe("r10-a-01", "嗯。我给你找了几个房源。", "Ńg. Wǒ gěi nǐ zhǎo le jǐ ge fángyuán.")]),
            option("c10-b", "honest", "没怎么睡好。", "Méi zěnme shuì hǎo.", { trust: 1, openness: 1 }, [qinghe("r10-b-01", "是不是因为房子的事？", "Shì bú shì yīnwèi fángzi de shì?"), qinghe("r10-b-02", "我昨天说得太突然了。", "Wǒ zuótiān shuō de tài tūrán le.")]),
            option("c10-c", "closed", "我已经没事了。", "Wǒ yǐjīng méi shì le.", {}, [qinghe("r10-c-01", "好。有事就直接说。", "Hǎo. Yǒu shì jiù zhíjiē shuō.")])
          ])
        },
        {
          id: "scene-11-listings",
          titleZh: "三个房源",
          titlePinyin: "Sān ge fángyuán",
          relationshipNpcId: "npc-qinghe",
          messages: [
            system("s11-01", "刘阿姨：单间，离地铁站十分钟。可以短租。", "Liú āyí: Dānjiān, lí dìtiězhàn shí fēnzhōng. Kěyǐ duǎnzū."),
            system("s11-02", "女生合租：有独立房间，厨房和卫生间共用。", "Nǚshēng hézū: Yǒu dúlì fángjiān, chúfáng hé wèishēngjiān gòngyòng."),
            system("s11-03", "中介房：一室一厅，价格高一点。", "Zhōngjiè fáng: Yí shì yì tīng, jiàgé gāo yìdiǎn."),
            qinghe("s11-04", "你先看看。", "Nǐ xiān kànkan."),
            qinghe("s11-05", "你想先联系哪一个？", "Nǐ xiǎng xiān liánxì nǎ yí ge?")
          ],
          choice: makeChoice("choice-11", "你想先联系哪一个？", "Nǐ xiǎng xiān liánxì nǎ yí ge?", [
            option("c11-a", "liu", "刘阿姨这间吧。", "Liú āyí zhè jiān ba.", { flag: "FIRST_LISTING_LIU" }, [qinghe("r11-a-01", "好。她是朋友介绍的，信息比较清楚。", "Hǎo. Tā shì péngyou jièshào de, xìnxī bǐjiào qīngchu."), qinghe("r11-a-02", "我把刘阿姨的微信推给你了。", "Wǒ bǎ Liú āyí de Wēixìn tuī gěi nǐ le."), qinghe("r11-a-03", "她今天有时间。", "Tā jīntiān yǒu shíjiān.")]),
            option("c11-b", "shared", "我想先看看合租。", "Wǒ xiǎng xiān kànkan hézū.", { flag: "FIRST_LISTING_SHARED" }, [qinghe("r11-b-01", "可以，不过这个人还没回我。", "Kěyǐ, búguò zhège rén hái méi huí wǒ."), qinghe("r11-b-02", "刘阿姨现在刚好在线，你也可以先问问。", "Liú āyí xiànzài gānghǎo zàixiàn, nǐ yě kěyǐ xiān wènwen."), qinghe("r11-b-03", "我把刘阿姨的微信推给你了。", "Wǒ bǎ Liú āyí de Wēixìn tuī gěi nǐ le."), qinghe("r11-b-04", "她今天有时间。", "Tā jīntiān yǒu shíjiān.")]),
            option("c11-c", "terms", "我想先问清楚价格和押金。", "Wǒ xiǎng xiān wèn qīngchu jiàgé hé yājīn.", { independence: 1, flag: "CHECK_TERMS_FIRST" }, [qinghe("r11-c-01", "对，先问清楚再决定。", "Duì, xiān wèn qīngchu zài juédìng."), qinghe("r11-c-02", "刘阿姨这间写得比较完整。", "Liú āyí zhè jiān xiě de bǐjiào wánzhěng."), qinghe("r11-c-03", "我把刘阿姨的微信推给你了。", "Wǒ bǎ Liú āyí de Wēixìn tuī gěi nǐ le."), qinghe("r11-c-04", "她今天有时间。", "Tā jīntiān yǒu shíjiān.")])
          ])
        },
        {
          id: "scene-12-viewing-time",
          titleZh: "约看房时间",
          titlePinyin: "Yuē kànfáng shíjiān",
          relationshipNpcId: "npc-qinghe",
          messages: [qinghe("s12-01", "你什么时候方便看房？", "Nǐ shénme shíhou fāngbiàn kànfáng?")],
          choice: makeChoice("choice-12", "你怎么安排看房？", "Nǐ zěnme ānpái kànfáng?", [
            option("c12-a", "alone", "我今天下午有空，我自己去。", "Wǒ jīntiān xiàwǔ yǒu kòng, wǒ zìjǐ qù.", { independence: 2, flag: "QH_ACCOMPANY_FALSE" }, [qinghe("r12-a-01", "好。先看清楚再决定，不要马上交钱。", "Hǎo. Xiān kàn qīngchu zài juédìng, bú yào mǎshàng jiāo qián.")]),
            option("c12-b", "together", "你晚上有空吗？能不能陪我去看看？", "Nǐ wǎnshang yǒu kòng ma? Néng bu néng péi wǒ qù kànkan?", { trust: 1, flag: "QH_ACCOMPANY_TRUE" }, [qinghe("r12-b-01", "六点以后可以。", "Liù diǎn yǐhòu kěyǐ."), qinghe("r12-b-02", "你先跟她约时间，我下班以后过去。", "Nǐ xiān gēn tā yuē shíjiān, wǒ xiàbān yǐhòu guòqu.")]),
            option("c12-c", "ask-first", "我先跟她聊一下，再决定时间。", "Wǒ xiān gēn tā liáo yíxià, zài juédìng shíjiān.", { independence: 1, flag: "CHECK_TERMS_FIRST" }, [qinghe("r12-c-01", "可以。价格、押金、水电费，都先问清楚。", "Kěyǐ. Jiàgé, yājīn, shuǐdiànfèi, dōu xiān wèn qīngchu.")])
          ])
        },
        {
          id: "scene-13-ending",
          titleZh: "新的联系人",
          titlePinyin: "Xīn de liánxìrén",
          ending: true,
          messages: [
            liu("s13-01", "你好，清荷把你的微信推给我了。", "Nǐ hǎo, Qīnghé bǎ nǐ de Wēixìn tuī gěi wǒ le."),
            liu("s13-02", "你什么时候方便看房？", "Nǐ shénme shíhou fāngbiàn kànfáng?"),
            system("s13-03", "你盯着这条消息看了几秒。", "Nǐ dīngzhe zhè tiáo xiāoxi kàn le jǐ miǎo."),
            system("s13-04", "这一次，你没有马上打开翻译软件。", "Zhè yí cì, nǐ méiyǒu mǎshàng dǎkāi fānyì ruǎnjiàn."),
            system("s13-05", "你第一次主动打开了“找房”页面。", "Nǐ dì yí cì zhǔdòng dǎkāi le “zhǎofáng” yèmiàn."),
            system("s13-06", "成都很大。", "Chéngdū hěn dà."),
            system("s13-07", "你还不知道，下一间房会在哪里。", "Nǐ hái bù zhīdào, xià yì jiān fáng huì zài nǎli."),
            system("s13-08", "回复刘阿姨", "Huífù Liú āyí")
          ]
        }
      ]
    },
    relationships: [
      { id: "npc-qinghe", unlockOnStart: true, nameVi: "Nguyễn Thanh Hà", nameZh: "阮清荷", pinyin: "Ruǎn Qīnghé", avatar: "👩🏻", baseTrust: 0, baseCalm: 0, roleVi: "Chị họ đang sống tại Thành Đô", firstInteraction: "Nhắn tin hỏi bạn mua đồ trên đường về" },
      { id: "npc-zhoulin", unlockOnStart: false, nameVi: "Chu Lâm", nameZh: "周琳", pinyin: "Zhōu Lín", avatar: "🏠", baseTrust: 0, baseCalm: 0 },
      { id: "npc-liu", unlockOnStart: false, nameVi: "Dì Lưu", nameZh: "刘阿姨", pinyin: "Liú āyí", avatar: "🔑", baseTrust: 0, baseCalm: 0 }
    ],
    dictionary: [
      { id: "w01", zh: "暂时", pinyin: "zànshí", vi: "tạm thời", type: "phó từ", exampleZh: "你暂时住在表姐清荷家。", examplePinyin: "Nǐ zànshí zhù zài biǎojiě Qīnghé jiā." },
      { id: "w02", zh: "方便", pinyin: "fāngbiàn", vi: "thuận tiện; tiện", type: "tính từ", exampleZh: "你什么时候方便看房？", examplePinyin: "Nǐ shénme shíhou fāngbiàn kànfáng?" },
      { id: "w03", zh: "室友", pinyin: "shìyǒu", vi: "bạn cùng phòng", type: "danh từ", exampleZh: "我室友周琳星期天回来。", examplePinyin: "Wǒ shìyǒu Zhōu Lín xīngqītiān huílai." },
      { id: "w04", zh: "找房子", pinyin: "zhǎo fángzi", vi: "tìm nhà, tìm phòng", type: "động từ", exampleZh: "我会尽快找房子。", examplePinyin: "Wǒ huì jǐnkuài zhǎo fángzi." },
      { id: "w05", zh: "房源", pinyin: "fángyuán", vi: "nguồn tin phòng cho thuê", type: "danh từ", exampleZh: "我给你找了几个房源。", examplePinyin: "Wǒ gěi nǐ zhǎo le jǐ ge fángyuán." },
      { id: "w06", zh: "合租", pinyin: "hézū", vi: "thuê chung, ở ghép", type: "động từ/danh từ", exampleZh: "我想先看看合租。", examplePinyin: "Wǒ xiǎng xiān kànkan hézū." },
      { id: "w07", zh: "押金", pinyin: "yājīn", vi: "tiền cọc", type: "danh từ", exampleZh: "我想先问清楚价格和押金。", examplePinyin: "Wǒ xiǎng xiān wèn qīngchu jiàgé hé yājīn." },
      { id: "w08", zh: "联系", pinyin: "liánxì", vi: "liên hệ", type: "động từ", exampleZh: "你想先联系哪一个？", examplePinyin: "Nǐ xiǎng xiān liánxì nǎ yí ge?" },
      { id: "w09", zh: "行李", pinyin: "xíngli", vi: "hành lý", type: "danh từ", exampleZh: "我今晚先整理一下行李吧。", examplePinyin: "Wǒ jīnwǎn xiān zhěnglǐ yíxià xíngli ba." },
      { id: "w10", zh: "地铁站", pinyin: "dìtiězhàn", vi: "ga tàu điện ngầm", type: "danh từ", exampleZh: "离地铁站十分钟。", examplePinyin: "Lí dìtiězhàn shí fēnzhōng." },
      { id: "w11", zh: "短租", pinyin: "duǎnzū", vi: "thuê ngắn hạn", type: "động từ", exampleZh: "可以短租。", examplePinyin: "Kěyǐ duǎnzū." },
      { id: "w12", zh: "水电费", pinyin: "shuǐdiànfèi", vi: "tiền điện nước", type: "danh từ", exampleZh: "价格、押金、水电费，都先问清楚。", examplePinyin: "Jiàgé, yājīn, shuǐdiànfèi, dōu xiān wèn qīngchu." },
      { id: "w13", zh: "翻译软件", pinyin: "fānyì ruǎnjiàn", vi: "phần mềm dịch", type: "danh từ", exampleZh: "你没有马上打开翻译软件。", examplePinyin: "Nǐ méiyǒu mǎshàng dǎkāi fānyì ruǎnjiàn." },
      { id: "w14", zh: "不着急", pinyin: "bù zháojí", vi: "không vội", type: "cụm từ", exampleZh: "好，不着急。", examplePinyin: "Hǎo, bù zháojí." }
    ]
  };
})();
