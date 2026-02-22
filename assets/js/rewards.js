/**
 * rewards.js
 * Defines all rewards, their point thresholds, and presentation.
 * Actual unlock/lock state is checked via Storage module.
 *
 * Each reward:
 *   id        – unique string key
 *   threshold – points needed to unlock
 *   title     – Arabic title
 *   icon      – emoji or Unicode icon
 *   content   – modal body HTML shown when reward is opened
 */

'use strict';

const Rewards = (() => {

    const REWARDS_LIST = [
        {
            id: 'reward_50',
            threshold: 50,
            title: 'بداية مباركة 🌙',
            icon: '🌙',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">🌙</div>
          <h5 class="reward-title-modal mb-2">تهانينا! لقد بلغت ٥٠ رصيداً</h5>
          <p class="reward-body">
            "مَن قامَ رمضانَ إيمانًا واحتِسابًا غُفِرَ له ما تقدَّمَ من ذنبِه"
            <br><small class="text-muted">(صحيح البخاري)</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>تحدي العبادة:</strong><br>
            التزم بقراءة جزء كامل من القرآن هذا الأسبوع واستمتع بالتدبّر.
          </p>
        </div>
      `,
        },
        {
            id: 'reward_100',
            threshold: 100,
            title: 'نجم رمضان ⭐',
            icon: '⭐',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">⭐</div>
          <h5 class="reward-title-modal mb-2">ممتاز! لقد بلغت ١٠٠ رصيداً</h5>
          <p class="reward-body">
            "إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ"
            <br><small class="text-muted">سورة التوبة – آية ١٢٠</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>تحدي الصدقة:</strong><br>
            تصدّق بما تيسّر على ثلاثة أشخاص مختلفين هذا الأسبوع.
            الصدقة تطفئ الخطيئة وتفتح أبواب الرزق.
          </p>
        </div>
      `,
        },
        {
            id: 'reward_150',
            threshold: 150,
            title: 'روح مطمئنة 🕊️',
            icon: '🕊️',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">🕊️</div>
          <h5 class="reward-title-modal mb-2">رائع! لقد بلغت ١٥٠ رصيداً</h5>
          <p class="reward-body">
            "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"
            <br><small class="text-muted">سورة الرعد – آية ٢٨</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>دعاء مقترح:</strong><br>
            اللهم اجعل قلبي طاهراً، ولساني صادقاً، وطريقي مستقيماً.
            <br>رددها بخشوع بعد كل صلاة.
          </p>
        </div>
      `,
        },
        {
            id: 'reward_200',
            threshold: 200,
            title: 'حارس الليل 🌟',
            icon: '🌟',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">🌟</div>
          <h5 class="reward-title-modal mb-2">أحسنت! لقد بلغت ٢٠٠ رصيداً</h5>
          <p class="reward-body">
            "تَتَجَافَى جُنُوبُهُمْ عَنِ الْمَضَاجِعِ يَدْعُونَ رَبَّهُمْ خَوْفًا وَطَمَعًا"
            <br><small class="text-muted">سورة السجدة – آية ١٦</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>تحدي قيام الليل:</strong><br>
            حافظ على ركعتين على الأقل بعد منتصف الليل لمدة سبعة أيام متواصلة.
            القيام دأب الصالحين.
          </p>
        </div>
      `,
        },
        {
            id: 'reward_250',
            threshold: 250,
            title: 'رفيع الدرجات 💎',
            icon: '💎',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">💎</div>
          <h5 class="reward-title-modal mb-2">سبحان الله! لقد بلغت ٢٥٠ رصيداً</h5>
          <p class="reward-body">
            "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ"
            <br><small class="text-muted">سورة الزمر – آية ١٠</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>الهدية الكبرى:</strong><br>
            أنت من الذين يُكتب لهم في هذا الشهر خير الدنيا والآخرة.
            <br>استمر على هذا الطريق، واسأل الله أن يثبّتك. جزاك الله خيراً.
          </p>
        </div>
      `,
        },
        {
            id: 'reward_300',
            threshold: 300,
            title: 'سائر على الدرب 🌱',
            icon: '🌱',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">🌱</div>
          <h5 class="reward-title-modal mb-2">رائع! لقد بلغت ٣٠٠ رصيداً</h5>
          <p class="reward-body">
            "فَاسْتَبِقُوا الْخَيْرَاتِ"
            <br><small class="text-muted">سورة البقرة – آية ١٤٨</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>تحدي التدبّر:</strong><br>
            خصص وقتاً لقراءة تفسير سورة من القرآن هذا الأسبوع واستمتع بالتدبّر.
          </p>
        </div>
      `,
        },
        {
            id: 'reward_400',
            threshold: 400,
            title: 'مصباح الهدى 🪔',
            icon: '🪔',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">🪔</div>
          <h5 class="reward-title-modal mb-2">ممتاز! لقد بلغت ٤٠٠ رصيداً</h5>
          <p class="reward-body">
            "وَمَا تَفْعَلُوا مِنْ خَيْرٍ يَعْلَمْهُ اللَّهُ"
            <br><small class="text-muted">سورة البقرة – آية ١٩٧</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>تحدي الصدقة:</strong><br>
            شارك بصدقة سرية جديدة على من يحتاج، واجعلها خالصة لوجه الله.
          </p>
        </div>
      `,
        },
        {
            id: 'reward_500',
            threshold: 500,
            title: 'نور متزايد 💡',
            icon: '💡',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">💡</div>
          <h5 class="reward-title-modal mb-2">أحسنت! لقد بلغت ٥٠٠ رصيداً</h5>
          <p class="reward-body">
            "وَمَا عِندَ اللَّهِ خَيْرٌ وَأَبْقَى"
            <br><small class="text-muted">سورة القصص – آية ٦٠</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>تحدي النوافل:</strong><br>
            احرص على صلاة الضحى يومياً هذا الأسبوع، فهي صدقة عن كل مفصل في جسدك.
          </p>
        </div>
      `,
        },
        {
            id: 'reward_600',
            threshold: 600,
            title: 'واحة المؤمن 🌴',
            icon: '🌴',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">🌴</div>
          <h5 class="reward-title-modal mb-2">ما شاء الله! لقد بلغت ٦٠٠ رصيداً</h5>
          <p class="reward-body">
            "سَيَجْزِي اللَّهُ الشَّاكِرِينَ"
            <br><small class="text-muted">سورة آل عمران – آية ١٤٤</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>تحدي الخدمة:</strong><br>
            خصص وقتاً للتطوع في خدمة المجتمع أو مساعدة جارك، فالأجر عظيم.
          </p>
        </div>
      `,
        },
        {
            id: 'reward_700',
            threshold: 700,
            title: 'قمر التهجد 🌜',
            icon: '🌜',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">🌜</div>
          <h5 class="reward-title-modal mb-2">بارك الله فيك! لقد بلغت ٧٠٠ رصيداً</h5>
          <p class="reward-body">
            "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ"
            <br><small class="text-muted">سورة البقرة – آية ٢٢٢</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>تحدي الاستغفار:</strong><br>
            جدد التوبة واستغفر الله مئة مرة يومياً، واطلب منه الثبات.
          </p>
        </div>
      `,
        },
        {
            id: 'reward_800',
            threshold: 800,
            title: 'قلب مطمئن 🧡',
            icon: '🧡',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">🧡</div>
          <h5 class="reward-title-modal mb-2">مذهل! لقد بلغت ٨٠٠ رصيداً</h5>
          <p class="reward-body">
            "إِنَّ مَعَ الْعُسْرِ يُسْرًا"
            <br><small class="text-muted">سورة الشرح – آية ٦</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>تحدي العطاء:</strong><br>
            تفقّد جيرانك وأقاربك، واسأل عن حاجتهم وساعدهم بما تستطيع.
          </p>
        </div>
      `,
        },
        {
            id: 'reward_900',
            threshold: 900,
            title: 'فجر الأمل 🌄',
            icon: '🌄',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">🌄</div>
          <h5 class="reward-title-modal mb-2">مبارك! لقد بلغت ٩٠٠ رصيداً</h5>
          <p class="reward-body">
            "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ"
            <br><small class="text-muted">سورة البقرة – آية ١٥٣</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>تحدي الدعاء:</strong><br>
            حافظ على أذكار الصباح والمساء يومياً، وأكثر من الدعاء للمسلمين في كل سجدة.
          </p>
        </div>
      `,
        },
        {
            id: 'reward_1000',
            threshold: 1000,
            title: 'التمام والكمال 🏆',
            icon: '🏆',
            content: `
        <div class="reward-content text-center">
          <div class="reward-icon-lg mb-3">🏆</div>
          <h5 class="reward-title-modal mb-2">ما شاء الله! لقد بلغت ١٠٠٠ رصيداً</h5>
          <p class="reward-body">
            "جَزَاءً مِن رَّبِّكَ عَطَاءً حِسَابًا"
            <br><small class="text-muted">سورة النبأ – آية ٣٥</small>
          </p>
          <hr>
          <p class="mt-3 reward-challenge">
            <strong>الهدية الكبرى:</strong><br>
            لقد أتممت الرحلة المباركة كاملة. حافظ على هذه الأعمال بعد رمضان، واستمر بالدعاء والصلاة والتلاوة.
            نسأل الله أن يتقبل منك ويثبتك على الطاعة.
          </p>
        </div>
      `,
        },
    ];

    /**
     * Returns all rewards, each annotated with unlocked status.
     */
    function getAllAnnotated() {
        return REWARDS_LIST.map(r => ({
            ...r,
            unlocked: Storage.isRewardUnlocked(r.id),
        }));
    }

    /**
     * Given current total points, unlock any newly-earned rewards.
     * Returns array of newly-unlocked reward objects.
     */
    function checkAndUnlock(totalPoints) {
        const newlyUnlocked = [];
        for (const reward of REWARDS_LIST) {
            if (totalPoints >= reward.threshold) {
                const isNew = Storage.unlockReward(reward.id);
                if (isNew) newlyUnlocked.push(reward);
            }
        }
        return newlyUnlocked;
    }

    return { REWARDS_LIST, getAllAnnotated, checkAndUnlock };

})();
