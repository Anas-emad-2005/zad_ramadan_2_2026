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
