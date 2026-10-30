# RQ1 Darija Chatbot Answers

- Date: 2026-10-16
- Medical model: `openai/gpt-oss-120b`
- Translation model: `openai/gpt-oss-120b`
- These answers come from a single run at the app's temperatures (0.7 for the medical model and 0.2 for translation), so they can vary between runs.
- Times include API request time only; rate-limit waiting time is excluded and retries are reported separately.

## 1a. Headache (Franco-Arabic)

**Question:** rasi kaydrni bzaf hadi yomayn

### Turn 1

**Darija answer:** سمح ليا، كتعاني من راس مقلق. واش تقدر تقول ليا شنو العمر ديالك (ولد تحت 12 عام، بالغ، ولا كبير فوق 65) و شحال قوة الوجيعة (خفيفة، متوسطة، ولا قوية)؟

Time: 1.9 s (stage 1: 0.7 s, stage 2: 1.3 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re dealing with a bad headache. Could you tell me your age group (child under 12, adult, or elderly over 65) and how severe the pain feels (mild, moderate, or severe)?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** For a moderate headache in a healthy 30‑year‑old, try resting in a quiet, dim room and drinking plenty of water. Over‑the‑counter paracetamol (500 mg) or ibuprofen (200 mg) taken as directed on the package can help relieve the pain. Avoid alcohol, caffeine excess, skipping meals, and long screen time; short breaks and gentle eye stretches may be useful. If the headache becomes severe, appears suddenly, is accompanied by fever, neck stiffness, visual changes, nausea, or lasts more than three weeks, seek medical attention promptly. Also see a doctor if you develop new symptoms such as weakness, numbness, or confusion. If you have any known allergies or start new medications, check with a pharmacist or doctor before use. Take care and monitor your symptoms. (الترجمة غير متوفرة)

Time: 6.3 s (stage 1: 1.2 s, stage 2: 5.0 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

For a moderate headache in a healthy 30‑year‑old, try resting in a quiet, dim room and drinking plenty of water. Over‑the‑counter paracetamol (500 mg) or ibuprofen (200 mg) taken as directed on the package can help relieve the pain. Avoid alcohol, caffeine excess, skipping meals, and long screen time; short breaks and gentle eye stretches may be useful. If the headache becomes severe, appears suddenly, is accompanied by fever, neck stiffness, visual changes, nausea, or lasts more than three weeks, seek medical attention promptly. Also see a doctor if you develop new symptoms such as weakness, numbness, or confusion. If you have any known allergies or start new medications, check with a pharmacist or doctor before use. Take care and monitor your symptoms.

</details>

## 1b. Headache (Arabic script)

**Question:** راسي كيضرني بزاف هادي يومين

### Turn 1

**Darija answer:** سمح ليا نسمع هاد الشي. تقدر تقولي شنو الفئة العمرية ديالك (ولد تحت 12، بالغ، ولا فوق 65) و شحال شدة الصداع (خفيف، متوسط، ولا قوي)؟

Time: 1.7 s (stage 1: 0.5 s, stage 2: 1.2 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I'm sorry to hear that. Could you tell me your age group (child under 12, adult, or over 65) and how severe the headache feels (mild, moderate, or severe)?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** إلى كان عندك صداع متوسط كيدوم جوج أيام، ارتاح فواحد القاعة هادئة ومضلمة وبقَى شارب الما مزيان. باراسيتامول ولا إيبوبروفين لي كيتباعو فالصيدلية (خدهم كيف مكتوب فالباكيت) يقدرو يخففو الألم. حيد الشراب، ما تديرش الماكلة، وقلل من الوقت قدام الشاشة؛ تمارين خفيفة للرقبة وضغط سخون يقدرو يخففو التوتر. إلى ولا الصداع فجأة وشديد، ولا جا معاه الحمى، ولا راسك شدّ، ولا تغيّر فالرؤية، ولا حيرة، ولا بقى كثر من ثلاثة أسابيع، سير عند الطبيب فورا. إلا ما كانش هكا، راقب الصداع شوية أيام وشوف الطبيب إلا ما تحسّنش.

Time: 3.2 s (stage 1: 1.1 s, stage 2: 2.1 s)

Retries: 2 (stage 1: 2, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

For a moderate headache lasting two days, rest in a quiet, dim room and stay well‑hydrated. Over‑the‑counter paracetamol or ibuprofen (taken as directed on the package) can help relieve pain. Avoid alcohol, skip meals, and limit screen time; gentle neck stretches and a warm compress may also ease tension. If the headache becomes sudden and severe, is accompanied by fever, neck stiffness, visual changes, confusion, or lasts more than three weeks, seek medical attention promptly. Otherwise, monitor it for a few days and see a doctor if it does not improve.

</details>

## 2a. Fever (adult) (Franco-Arabic)

**Question:** hadi 3 yam ou skhana wasla liya l 39

### Turn 1

**Darija answer:** سمح ليا، ماشي مزيان. تقدر تقولي شنو العمر ديالك (ولد تحت 12، كبير، ولا فوق 65) واش عندك أعراض خرين بحال السعال، حلق موجوع، ولا صعوبة ف التنفس؟

Time: 2.1 s (stage 1: 1.0 s, stage 2: 1.1 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re feeling unwell. Could you tell me your age group (child under 12, adult, or over 65) and whether you have any other symptoms such as cough, sore throat, or difficulty breathing?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** إلى كنتي عندك 30 عام وعندك حرارة 39 درجة كاتستمر ثلاثة أيام وعندك شوية ديال الوجع، ارتاح، شرب مزيان (الما، محاليل الإماهة الفموية، شربة صافية) وخد جرعة عادية ديال باراسيتامول ولا إيبوبروفين، وفقاً لتعليمات العلبة.  <br>راقب واش كاينين أعراض جداد بحال الصداع كيولي أقوى، رقب مشدودة، طفح جلدي، صعوبة فالتنفس، قيء، ولا حرارة ما كتطيحش من بعد 48 ساعة من العلاج.  <br>إلى ما تحسنتش الحرارة فاليوم الجاي، ولا بديتي تحس بأعراض مقلقة، سير عند الطبيب فورا.  <br>إلى عندك أمراض مزمنة، ولا كتستعمل أدوية خرين، ولا عندك حساسية معروفة من دوا، قول هادشي للطبيب.  <br>دير راسك مزيان وسجّل الحرارة ديالك وكيفاش حاسس.

Time: 4.3 s (stage 1: 1.7 s, stage 2: 2.6 s)

Retries: 3 (stage 1: 3, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

For a 30‑year‑old with a temperature of 39 °C lasting three days and moderate discomfort, rest, hydrate well (water, oral rehydration solutions, clear soups) and take a regular dose of paracetamol or ibuprofen, following the package instructions. Monitor for any new signs such as worsening headache, stiff neck, rash, shortness of breath, vomiting, or a temperature that stays high after 48 hours of treatment. If the fever does not improve within the next day, or if you develop any concerning symptoms, seek medical evaluation promptly. If you have any chronic illnesses, are taking other medicines, or have known drug allergies, mention these to the clinician. Take care and keep a record of your temperature and how you feel.

</details>

## 2b. Fever (adult) (Arabic script)

**Question:** هادي 3 يام و السخانة واصلة ليا ل 39

### Turn 1

**Darija answer:** سمح ليا، باين عليك ماشي مزيان. واش نقدر نسولك على الفئة العمرية ديالك (ولد تحت 12، كبير ولا فوق 65) واش عندك شي أمراض مزمنة ولا حاملة؟

Time: 1.9 s (stage 1: 0.9 s, stage 2: 1.1 s)

Retries: 2 (stage 1: 2, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’ve been feeling unwell. May I ask your age group (child under 12, adult, or over 65) and whether you have any chronic health conditions or are pregnant?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** دير الراحة بانتظام، شرب الما بزاف ولا محلول الإماهة الفموية، واستعمل الباراسيتامول (500 ملغ–1 غ كل 6 سوايع، ما تفوتش 4 غ فالنهار) ولا الإيبوبروفين (200–400 ملغ كل 6–8 سوايع، ما تفوتش 1.2 غ فالنهار) باش تنزل السخانة. كل ماكلة خفيفة وتجنب الشراب الكحولي ولا الماكلة الثقيلة. راقب السخانة ديالك؛ إلا بقات فوق 39 °C ولا أكثر من 48 ساعة، ولا جاك صداع قوي، رقب مشدودة، طفح جلدي، صعوبة فالتنفس، قيء بالدم، ولا حسيت بحالة ديال الارتباك ولا الكسل غير طبيعي، سير عند الطبيب فورا. إلا لاحظتي أعراض جديدة ولا السخانة تزادت، عيط على واحد من المختصين فالصحة. دير راسك مزيان وبقا شرب الما.

Time: 3.5 s (stage 1: 1.0 s, stage 2: 2.4 s)

Retries: 3 (stage 1: 1, stage 2: 2)

<details>
<summary>English medical answer (stage 1)</summary>

Take regular rest, drink plenty of water or oral rehydration solutions, and use paracetamol (500 mg–1 g every 6 hours, not exceeding 4 g per day) or ibuprofen (200–400 mg every 6–8 hours, not exceeding 1.2 g per day) to lower the temperature. Keep a light diet and avoid alcohol or heavy meals. Monitor your fever; if it stays at 39 °C or higher after 48 hours, if you develop a severe headache, stiff neck, rash, difficulty breathing, vomiting blood, or feel unusually confused or lethargic, seek medical attention promptly. If you notice any new symptoms or the fever worsens, contact a healthcare professional. Take care and stay hydrated.

</details>

## 3a. Fever (child) (Franco-Arabic)

**Question:** wldi sghir mn lbareh ou houwa skhana wasla l 38

### Turn 1

**Darija answer:** شحال فالعمر ديال ولدك (بالشهر ولا بالعام)؟ واش لاحظتي شي علامات خايبة بحال صعوبة فالتنفس، حكة، ما كياكلش مزيان، ولا كيتقلق بزاف؟

Time: 2.1 s (stage 1: 1.0 s, stage 2: 1.1 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

How old is your child (in months or years)? Have you noticed any other concerning signs such as difficulty breathing, rash, poor feeding, or extreme irritability?

</details>

**Follow-up reply:** wldi 3ndo 4 snin, ma3ndouch tfa7 w kayakol w kaycherb mzyan, ma3ndou 7ta mard akhor

### Turn 2 answer (rate this answer)

**Darija answer:** درجة حرارة ولدك اللي عندو 4 سنين 38°C هي حرارة خفيفة. دير ليه باراسيتامول (ولا إيبوبروفين إلا ما كانش ممنوع) كل 4‑6 سوايع حسب الحاجة، وتأكد بلي كتبع الجرعة المكتوبة على العلبة ولا نصيحة الصيدلي. خليه يشرب مزيان، الما ولا محلول الإماهة الفموية ولا سوائل صافية، ولبسو ملابس خفيفة. قدم ليه ماكلة خفيفة وشجعو على الراحة. راقب أي علامات جديدة بحال صعوبة فالتنفس، حرارة مستمرة عالية من بعد 48 ساعة، طفح ما كيختفي ملي كتضغط عليه، قيء، ولا قلة البول. إلا بقات الحرارة كثر من ثلاثة أيام، ولا تزادت، ولا بان شي أعراض مقلقة، سير للطبيب بسرعة. إلا ما كنتيش متأكد، الصيدلي يقدر يعاونك فالجرعة والنصائح.

Time: 2.8 s (stage 1: 0.7 s, stage 2: 2.1 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Your 4‑year‑old’s temperature of 38 °C is a mild fever. Give age‑appropriate paracetamol (or ibuprofen if not contraindicated) every 4–6 hours as needed, making sure you follow the dose on the package or the pharmacist’s advice. Keep him well hydrated with water, oral rehydration solution, or clear fluids, and dress him in lightweight clothing. Offer light meals and encourage rest. Monitor for any new signs such as difficulty breathing, persistent high temperature after 48 hours, rash that doesn’t fade when pressed, vomiting, or reduced urine output. If the fever lasts more than three days, worsens, or any concerning symptoms appear, seek medical evaluation promptly. If you’re ever unsure, a pharmacist can help with dosing and advice.

</details>

## 3b. Fever (child) (Arabic script)

**Question:** ولدي صغير من البارح و هو السخانة واصلة ل 38

### Turn 1

**Darija answer:** عافاك قول لينا شحال عمر ولدك بالضبط (بالشهر ولا بالعام) و واش عندو شي أعراض خرين بحال حكة، صعوبة فالتنفس، قيء، ولا نقص فالنشاط؟

Time: 1.4 s (stage 1: 0.6 s, stage 2: 0.8 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Could you tell me your child's exact age (in months or years) and whether they have any other symptoms such as a rash, difficulty breathing, vomiting, or reduced activity?

</details>

**Follow-up reply:** ولدي عندو 4 سنين، ما عندوش التفاح و كياكل و كيشرب مزيان، ما عندو حتى مرض آخر

### Turn 2 answer (rate this answer)

**Darija answer:** عند ولد عندو 4 سنين و الحرارة ديالو 38 درجة وبديت البارح وما عندوش مشكل آخر:<br><br>دير ليه باراسيتامول على حساب العمر (تقريباً 15 ملغ لكل كيلو) ولا إيبوبروفين إلا ما كانش عندو موانع، وتبع التعليمات ديال الجرعة لي مكتوبة فالباكيت. شجعو يشرب شوية شوية ديال الما، شربة صافية ولا محلول الإماهة الفموية، وعرض عليه ماكلة خفيفة وسهلة للهضم. خليه يرتاح فغرفة باردة مزيان ولبسو حوايج خفاف.<br><br>راقب العلامات الخطرة: الحرارة تبقى فوق 38 درجة أكثر من 3 أيام، طفح ما كيختفي ملي تضغط عليه، صعوبة فالتنفس، قيء مستمر، خمول، ولا أي تغيير مفاجئ فالسلوك. إلا بان شي حاجة من هادشي، ولا ما متأكدش، عيط للطبيب ديال الأطفال ولا سير لأقرب مركز صحي فالحين. إلا ما كانش، بقا كتعطيه الرعاية الداعمة وعاود قيم الحالة ديالو بانتظام.

Time: 2.9 s (stage 1: 1.0 s, stage 2: 1.9 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

For a 4‑year‑old with a temperature of 38 °C that started yesterday and who is otherwise well:<br><br>Give age‑appropriate paracetamol (usually 15 mg/kg) or ibuprofen if there are no contraindications, following the dose instructions on the package. Encourage regular small sips of water, clear soups, or oral rehydration solution, and offer light, easy‑to‑digest foods. Keep him rested in a comfortably cool room and dress him in light clothing.<br><br>Watch for warning signs: temperature staying above 38 °C for more than 3 days, a rash that doesn’t fade when pressed, difficulty breathing, persistent vomiting, lethargy, or any sudden change in behavior. If any of these appear, or if you’re unsure, contact a pediatrician or go to the nearest health centre promptly. Otherwise, continue supportive care and reassess his condition regularly.

</details>

## 4a. Cough (Franco-Arabic)

**Question:** mn sba7 ou ana fiya lk7a bjehd

### Turn 1

**Darija answer:** قولي ليا شنو العمر ديالك (ولد تحت 12 عام، كبير ولا فوق 65 عام)، شحال من الوقت عندك السعال، واش هو خفيف ولا متوسط ولا قوي؟ وزيد، واش كتجرب صعوبة فالتنفس؟

Time: 2.6 s (stage 1: 1.1 s, stage 2: 1.6 s)

Retries: 3 (stage 1: 3, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me your age group (child under 12, adult, or over 65), how long you’ve had the cough, and whether it feels mild, moderate, or severe? Also, are you experiencing any trouble breathing?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** سعال متوسط فواحد لّي عندو 30 عام وصحي مزيان، بقا غير شوية أيام، غالباً فيروسية وغادي يتحسن بوحدو. ارتاح، شرب الما مزيان ودير شوية ديال المشروبات السخونة بحال الما مع الليمون والعسل. استعمل مرطّب للهوى ولا تنفس البخار باش يهدّو المجرى الهوائي. دوايات السعال لي كتبيع فالصيدلية (بحال ديكسترو ميثورفان) ولا دوا ساهل لتفريغ البلغم (بحال غوايفينيسين) يقدرو يعاونو إلا كان السعال مزعج؛ تبع التعليمات لي مكتوبة على العلبة. ما تدخنش، تجنّب الغبرة، الروائح القوية والهوى البارد بزاف. إلا بقا السعال كثر من ثلاثة أسابيع، ولا حسيت بألم فالصدر، ولا طلق دم مع السعال، ولا لاحظتي صعوبة فالتنفس كتزاد، سير للطبيب بسرعة. وإلا، الراحة فدارك والعناية الداعمة غادي تكون كافية.

Time: 4.5 s (stage 1: 1.9 s, stage 2: 2.7 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

A moderate cough in a healthy 30‑year‑old that’s lasted a few days is usually viral and will improve on its own. Rest, stay well‑hydrated and sip warm drinks such as water with lemon and honey. Use a humidifier or inhale steam to soothe your airways. Over‑the‑counter cough relievers (e.g., dextromethorphan) or a simple expectorant (e.g., guaifenesin) can help if the cough is bothersome; follow the package directions. Avoid smoking, dust, strong fragrances and very cold air. If the cough persists beyond three weeks, you develop chest pain, cough up blood, or notice increasing shortness of breath, seek medical attention promptly. Otherwise, supportive care at home should be sufficient.

</details>

## 4b. Cough (Arabic script)

**Question:** من الصباح و أنا فيا الكحة بجهد

### Turn 1

**Darija answer:** قولي ليا شنو الفئة العمرية ديالك (ولد تحت 12، كبير، ولا فوق 65) و شحال السعال كايحس بيه (خفيف، متوسط، ولا قوي)؟ وزيد، واش عندك شي أمراض مزمنة معروفة بحال الربو ولا أمراض القلب؟

Time: 2.4 s (stage 1: 1.1 s, stage 2: 1.3 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me your age group (child under 12, adult, or over 65) and how severe the cough feels (mild, moderate, or severe)? Also, do you have any known chronic illnesses such as asthma or heart disease?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** رتاح، بقا مرطب وشرب مزيان، وجرب تشرب مشروبات سخونة بحال الما السخون مع الليمون ومغرفة ديال العسل.  <br>ستعمل جهاز الترطيب ولا تنفّس البخار باش تهنّى الحلق.  <br>يمكن لك تاخد أدوية السعال اللي كتبيع فالصيدلية بلا وصفة بحال ديكسترو ميثورفان ولا أدوية كتخرج البلغم بحال غوايفينيسين، غير إلى كانوا كيعونو، وتبع التعليمات المكتوبة على العلبة.  <br>حاول ما تدخنش، وما تستعملش عطور قوية، وما تعرض راسك لهوا بارد بزاف.  <br>إلى بقى السعال كيتستمر كثر من ثلاثة أسابيع، ولا كيخرج الدم، ولا كيجيب وجع فالصدر، ولا صعيب عليك تتنفس أو كتكون الحرارة طالعة، سير للطبيب فالحين.  <br>إلى لاحظتي شي أعراض جديدة، خليك تشوف طبيب باش يشوفك.  <br>دير راسك مزيان.

Time: 3.4 s (stage 1: 1.0 s, stage 2: 2.4 s)

Retries: 3 (stage 1: 2, stage 2: 1)

<details>
<summary>English medical answer (stage 1)</summary>

Rest, stay well‑hydrated and try warm drinks such as hot water with lemon and a spoon of honey. Use a humidifier or inhale steam to ease throat irritation. Over‑the‑counter cough suppressants (e.g., dextromethorphan) or expectorants (e.g., guaifenesin) can be taken if they help, following the package directions. Avoid smoking, strong perfumes, and very cold air. If the cough persists for more than three weeks, produces blood, causes chest pain, or you develop difficulty breathing or a high fever, seek medical attention promptly. If you notice any new symptoms, let a doctor evaluate you. Take care.

</details>

## 5a. Sore throat (Franco-Arabic)

**Question:** fiya l7la9m chwia hadi 4 yam

### Turn 1

**Darija answer:** سمح ليا، ما مرتاحش. تقدر تقولي شنو الفئة العمرية ديالك (ولد تحت 12 عام، كبير، ولا فوق 65 عام) و شحال شدة الحلق (خفيف، متوسط، ولا قوي)؟

Time: 3.1 s (stage 1: 0.8 s, stage 2: 2.3 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re uncomfortable. Could you tell me your age group (child under 12, adult, or over 65) and how severe the sore throat feels (mild, moderate, or severe)?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** حلق خفيف شوية فواحد الراجل اللي بصحة مزيانة عادة كيولي حسن مع شوية ديال العناية الذاتية البسيطة. رتاح وشرب مزيان، بقا مرطّب؛ الما السخون ولا أتاي مع العسل والليمون يقدرو يهدّو. دير غرغرة عدة مرات فاليوم بالما السخون مع الملح (نص ملعقة صغيرة ملح فكاس ديال الما). مسكنات بلا وصفة بحال الباراسيتامول ولا الإيبوبروفين يقدرو ينقصو الألم والحرارة الخفيفة—تبع التعليمات ديال الجرعة لي مكتوبة فالباكيت. حاول ما تشربش التبغ، وما تاكلش الماكلة السخونة بزاف ولا الحارة، وما تشربش الشراب الكحولي وانت كتشفى. إلا بقى الألم كيتستمر أكثر من سيمانة، ولا جاتك حرارة عالية، ولا صعيب عليك تبصّ أو تتنفس، ولا لاحظتي تورم فالعنق، ولا شفت صديد ولا بقع بيضة، سير عند الطبيب فورا. الصيدلي يقدر يوصيك بحبوب للحنجرة ولا بخاخ مطهر خفيف إذا احتاجتي. دير راسك مزيان وتابع الأعراض ديالك.

Time: 3.6 s (stage 1: 1.2 s, stage 2: 2.4 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

A moderate sore throat in a healthy adult usually improves with simple self‑care. Rest and stay well hydrated; warm water or tea with honey and lemon can soothe. Gargle several times a day with warm salt water (½ tsp salt in a glass of water). Over‑the‑counter pain relievers such as paracetamol or ibuprofen can reduce pain and any low‑grade fever—follow the dosing instructions on the package. Avoid smoking, very hot or spicy foods, and alcohol while you’re recovering. If the pain persists beyond a week, you develop a high fever, have difficulty swallowing or breathing, notice swelling of the neck, or see pus or white patches, seek medical attention promptly. A pharmacist can also recommend throat lozenges or a mild antiseptic spray if needed. Take care and monitor your symptoms.

</details>

## 5b. Sore throat (Arabic script)

**Question:** فيا الحلاقم شوية هادي 4 يام

### Turn 1

**Darija answer:** سمح ليا على هاد الطفح اللي كتعيش معاه. باش نعطيك نصيحة مزيانة، عافاك قول ليا شنو العمر ديالك: ولد تحت 12 عام، كبير ولا كبير فوق 65 عام، وشنو شدة الطفح: خفيف، متوسط ولا قوي؟ وزيد، واش عندك شي حساسية معروفة ولا أمراض مزمنة؟

Time: 3.9 s (stage 1: 1.9 s, stage 2: 1.9 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re dealing with this rash. To give safe advice, could you tell me your age group (child under 12, adult, or elderly over 65) and how severe the rash feels (mild, moderate, or severe)? Also, do you have any known allergies or chronic conditions?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** حكة متوسطة اللي بقات كاينة ربعة أيام عند شخص صحي، تقدر تتعالج ف الدار إلا ما كانتش كتزيد بسرعة، ما كتوجعش، ما كتديرش فقاعات، ولا ما تجيش معاها السخانة. جرّب دير كمبريس بارد على البلاصة لمدة 10‑15 دقيقة، مرة ولا جوج مرات ف النهار، وخليك تنظف الجلد بصابون خفيف وماء. ما تحكش؛ استعمل مرطب بلا ريحة باش تنقص الجفاف. حبوب مضادة للحساسية اللي كتلقاها ف الصيدلية (بحال سيتريزين 10 ملغ مرة ف النهار) كتعاون إلا كانت الحكة كتقز. إذا شفت الحكة كتوسع بسرعة، ولا بدات كتخرج صديد، ولا كتدير فقاعات، ولا كتوجع بزاف، ولا جاتك السخانة، سير عند الطبيب ف أقرب وقت. الصيدلي يقدر يوريك كريم ستيرويد مناسب إلا احتاجتيه.

Time: 3.4 s (stage 1: 1.5 s, stage 2: 2.0 s)

Retries: 2 (stage 1: 2, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

A moderate rash that’s been present for four days in a healthy adult can often be managed at home if it isn’t spreading rapidly, painful, blistering, or accompanied by fever.<br><br>Try a cool compress on the area for 10‑15 minutes a few times daily and keep the skin clean with mild soap and water. Avoid scratching; use a fragrance‑free moisturizer to reduce dryness. Over‑the‑counter antihistamine tablets (e.g., cetirizine 10 mg once daily) can help if the rash is itchy. If you notice the rash expanding quickly, developing pus, blisters, severe pain, or you develop a fever, seek medical attention promptly. A pharmacist can also suggest a suitable topical corticosteroid if needed.

</details>

## 6a. Stomach ache (Franco-Arabic)

**Question:** 9bila mora matghdit krchi wlat kadrni bzf

### Turn 1

**Darija answer:** عندك شحال فالعمر (ولد تحت 12، كبير ولا فوق 65)؟ شحال من الوقت كاين الألم؟ واش الألم خفيف ولا متوسط ولا قوي؟

Time: 2.5 s (stage 1: 1.7 s, stage 2: 0.8 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me your age group (child under 12, adult, or over 65), how long the pain has been present, and whether the pain feels mild, moderate, or severe?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** شحال من الوقت وانت كتعيش الوجع ف الظهر—اليوم، شي أيام، ولا كثر من سيمانة؟

Time: 1.9 s (stage 1: 1.2 s, stage 2: 0.7 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

How long have you been experiencing the back pain—today, a few days, or more than a week?

</details>

## 6b. Stomach ache (Arabic script)

**Question:** قبيلة مورا ما تغديت كرشي ولات كاضرني بزاف

### Turn 1

**Darija answer:** سمح ليا أنك كتوجع. واش تقدر تقولي شنو الفئة العمرية ديالك (ولد تحت 12، بالغ، ولا فوق 65)، شحال من الوقت كاين الألم فالمعدة، وكيفاش كتقيم شدة الألم (خفيف، متوسط، ولا قوي)؟

Time: 2.0 s (stage 1: 0.8 s, stage 2: 1.2 s)

Retries: 2 (stage 1: 2, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re in pain. Could you tell me your age group (child under 12, adult, or over 65), how long the stomach pain has been present, and how you would rate its severity (mild, moderate, or severe)?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** إلى كان عندك وجع معدة متوسط وانت شاب 30 عام وصحي، دير شوية ديال العناية بالنفس بسيطة. بقى شرب الما ولا شي سوائل صافية وتفادى الماكلة الثقيلة، الدهنية، الحارة ولا الحامضة نهار ولا جوج أيام؛ جرب أكلات خفيفة بحال الخبز المحمص، الروز، الموز ولا صوص التفاح. تقدر تشري من الصيدلية مضاد حموضة (بحال كربونات الكالسيوم) ولا دواء قصير لتقليل الحموضة بحال رانيتيدين ولا فاموتيدين إلا حسيت بالحموضة. حركة خفيفة وتفادى ترقد ممدد بعد الماكلة يقدرو يخففو الألم. راقب أي عوارض جديدة—القيء، الدم فالقيا ولا فالبراز، السخانة، ماقدرتش تخرج الغازات ولا البول، ولا الألم اللي كيولي أقوى فجأة. إلا بان شي حاجة من هادشي، ولا بقى الوجع كيتستمر أكثر من شوية أيام، سير عند الطبيب بسرعة. إلا مازال ما متأكد، الصيدلي يقدر ينصحك بدواء مناسب من الصيدلية، ولكن من الأحسن تشوف طبيب إلا بقى الوجع مستمر ولا كيزيد.

Time: 4.0 s (stage 1: 1.1 s, stage 2: 2.9 s)

Retries: 2 (stage 1: 2, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

For a moderate stomach ache in a healthy 30‑year‑old, start with simple self‑care. Stay hydrated with water or clear fluids and avoid heavy, fatty, spicy, or acidic foods for a day or two; try bland options like toast, rice, bananas, or applesauce. Over‑the‑counter antacids (e.g., calcium carbonate) or a short course of an acid‑reducing medication such as ranitidine or famotidine can help if you suspect heartburn. Gentle movement and avoiding lying flat after meals may also relieve discomfort. Keep track of any new symptoms—vomiting, blood in vomit or stool, fever, inability to pass gas or urine, or pain that worsens sharply. If any of these appear, or if the pain persists beyond a few days, seek medical evaluation promptly. If you have any doubts, a pharmacist can suggest an appropriate OTC option, but a doctor’s review is advisable for persistent or worsening pain.

</details>

## 7a. Diarrhoea and vomiting (Franco-Arabic)

**Question:** hadi sa3tayn ou ana kant9ya ou fiya ishal

### Turn 1

**Darija answer:** قولي ليا شنو الفئة العمرية ديالك (ولد تحت 12 عام، كبير، ولا شي كبير فوق 65 عام) و واش القيء والإسهال كتحسّهم خفيفين، متوسطين ولا قويين؟

Time: 2.1 s (stage 1: 0.9 s, stage 2: 1.2 s)

Retries: 3 (stage 1: 2, stage 2: 1)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me your age group (child under 12, adult, or elderly over 65) and whether the vomiting and diarrhoea feel mild, moderate, or severe?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** كيفاش تقيم القيء والإسهال – خفيف، متوسط ولا قوي؟

Time: 1.8 s (stage 1: 1.0 s, stage 2: 0.8 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

How would you rate the vomiting and diarrhoea – mild, moderate, or severe?

</details>

## 7b. Diarrhoea and vomiting (Arabic script)

**Question:** هادي ساعتين و أنا كنتقيا و فيا الإسهال

### Turn 1

**Darija answer:** سمح ليا كتحس مريض. باش نعطيك نصيحة مزيانة، عفاك قول ليا:<br><br>1. واش انت كبير ولا ولد تحت 12 ولا فوق 65؟<br>2. كيفاش توصف شدة القيء والإسهال – خفيف، متوسط ولا قوي؟<br><br>إلى كان عندك شي حساسية معروفة ولا شي مرض مزمن بحال السكري ولا الحمل، قول ليا حتى هو.

Time: 3.5 s (stage 1: 1.3 s, stage 2: 2.2 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re feeling unwell. To give safe advice, could you tell me:<br><br>1. Are you an adult, a child under 12, or over 65?  <br>2. How would you describe the severity of the vomiting and diarrhea – mild, moderate, or severe?  <br><br>If you have any known allergies or chronic health conditions (e.g., diabetes, pregnancy), please let me know as well.

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** شرب بزاف ديال الرشفات الصغار ديال سوائل صافية—الما، محلول الإماهة الفموية، ولا المرق الصافي—كل 10‑15 دقيقة. ما تشربش عصاير الفواكه، الصودا، القهوة ولا الحليب حتى تحس براسك مزيان. منين تقدر تبقى تشرب السائل بلا ما تترجع، جرب ماكلة خفيفة بحال الرز السادة، الخبز المحمص، الموز ولا بطاطا مسلوقة. ارتاح وخد دواء خافض للحرارة بحال باراسيتامول إلا جتك السخانة ولا حسيت بعدم الراحة. راقب علامات الجفاف: بول غامق، ما كتدمعش ملي كتعيط، فم ناشف، دوخة. ولا إذا بقى القيء ولا الإسهال أكثر من 48 ساعة، ولا فيه دم، ولا جاتك سخانة عالية، خصك تمشي للطبيب بسرعة. إلا ما كانش هادشي، بقى فدارك، رطّب راسك، ورجع للماكلة العادية بشوية بشوية مع تحسن الأعراض.

Time: 2.7 s (stage 1: 1.1 s, stage 2: 1.7 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Drink plenty of small sips of clear fluids—water, oral rehydration solution, or clear broth—every 10‑15 minutes. Avoid fruit juices, sodas, caffeine and dairy until you feel better. When you can keep fluids down, try bland foods such as plain rice, toast, bananas or boiled potatoes. Rest and keep a fever‑reducing medication like paracetamol if you develop a fever or feel uncomfortable. Watch for signs of dehydration (dark urine, no tears when crying, dry mouth, dizziness) or if vomiting or diarrhea continues beyond 48 hours, contains blood, or you develop a high fever. In those cases, or if you feel unable to stay hydrated, seek medical attention promptly. Otherwise, stay home, hydrate, and return to normal foods gradually as symptoms improve.

</details>

## 8a. Back pain (Franco-Arabic)

**Question:** f9t lyouma sbah ou dhri kaydrni bzf

### Turn 1

**Darija answer:** عافاك قول ليا شنو الفئة العمرية ديالك (ولد تحت 12 عام، بالغ، ولا كبير فوق 65 عام)؟ و كاين شي خدر ولا ضعف ف رجليك، ولا صعوبة ف التحكم ف المثانة ولا ف المجاري؟

Time: 2.9 s (stage 1: 1.4 s, stage 2: 1.5 s)

Retries: 2 (stage 1: 2, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Could you tell me your age group (child under 12, adult, or elderly over 65)? Also, are you experiencing any numbness, weakness in your legs, or trouble controlling your bladder or bowels?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** شكراً. شحال من الوقت عندك هاد الوجع ف الضهر — اليوم، شي أيام، ولا كتر من سيمانة؟

Time: 4.3 s (stage 1: 3.4 s, stage 2: 0.9 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Thanks. How long have you had this back pain—today, a few days, or more than a week?

</details>

## 8b. Back pain (Arabic script)

**Question:** فقت اليوما الصباح و ضهري كيضرني بزاف

### Turn 1

**Darija answer:** سمح ليا، الظهر ديالك كيوجع. تقدر تقول ليا شنو العمر ديالك (ولد &lt;12، بالغ، ولا كبير فالعمر &gt;65) و شحال شدة الوجيعة (خفيفة، متوسطة، ولا قوية)؟ وزيد، واش عندك شي أمراض معروفة (بحال مشاكل فالكلى، إصابة جديدة، ولا حمل)؟

Time: 2.0 s (stage 1: 1.0 s, stage 2: 1.0 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry your back is hurting. Could you tell me your age group (child &lt; 12, adult, or elderly &gt; 65) and how severe the pain feels (mild, moderate, or severe)? Also, do you have any known medical conditions (e.g., kidney issues, recent injury, or pregnancy)?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** إلى كان عندك وجع ظهر متوسط بدا من الصباح، جرب تحرك بشوية بلا ما تبقى غير فالفراش؛ تمشية قصيرة ولا شوية ديال التمدد الخفيف يقدرو يعاونو العضلات يبقاو ناشطين. دير حزمة سخونة ولا بطانية تدفئة على البلاصة اللي كتوجع 15‑20 دقيقة، مرة مرة فاليوم، ولا استعمل كيس ديال الثلج إلا كان الألم كيبان فيه التهاب. الإيبوبروفين لي كيتباع فالصيدلية (إلى ما عندكش قرحة فالمعدة ولا مشاكل فالكلى) يقدر ينقص الألم والالتهاب؛ تبع الجرعة المكتوبة على العلبة. بقى تشرب الما مزيان وما تديرش رفع الحوايج الثقيلة ولا القعدة الطويلة. إلى زاد الألم، ولا مشى للرجليك، ولا حسيت بخدر، ولا جاك الحمى، ولا تبدلات البول، ولا فقدتي التحكم فالمثانة ولا فالأمعاء، سير عند الطبيب فورا. وإلا ما تحسنش بعد شوية ديال العناية الذاتية، رتب موعد مع الطبيب ديالك باش يدير تقييم أكتر.

Time: 2.8 s (stage 1: 0.9 s, stage 2: 1.9 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

For a moderate back ache that started this morning, try gentle movement rather than staying in bed; short walks or light stretching can help keep the muscles active. Apply a warm pack or heating pad to the painful area for 15‑20 minutes a few times a day, or use an ice pack if the pain feels inflamed. Over‑the‑counter ibuprofen (if you have no stomach ulcer or kidney issues) can reduce pain and inflammation; follow the dosing instructions on the label. Stay hydrated and avoid heavy lifting or prolonged sitting. If the pain worsens, spreads to your legs, causes numbness, or you develop fever, urinary changes, or loss of bladder/bowel control, seek medical attention promptly. Otherwise, if it does not improve after a few days of self‑care, schedule a visit with your doctor for further evaluation.

</details>

## 9a. Urinary infection (UTI) (Franco-Arabic)

**Question:** 9bila mni mchit nboul jani 7riq ou ana kanboul

### Turn 1

**Darija answer:** قولي ليا شنو العمر ديالك (ولد تحت 12، كبير ولا فوق 65)، شحال من الوقت كتعيش مع الحموضة والقيء، وواش الأعراض كتحس بيها خفيفة، متوسطة ولا قوية؟

Time: 2.0 s (stage 1: 0.8 s, stage 2: 1.2 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me your age group (child under 12, adult, or over 65), how long you’ve been experiencing the heartburn and vomiting, and whether the symptoms feel mild, moderate, or severe?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** الحرقة اللي كتجيب القيء تقدر تتدار بسهولة بخطوات بسيطة. جرب كل وجبات صغار وبزاف ديال المرات، وتفادى الماكلة اللي كتسببها بحال الماكلة الحارة، الدهنية، المقلية، القهوة، الشوكولاتة، الحمضيات والمشروبات الغازية. بقا واقف على الأقل ساعتين من بعد ما كتكل؛ ما تنقعدش ولا دير تمارين شاقة مباشرة من بعد الماكلة. شرب شوية ديال الما ولا أتاى عشبي بلا كافيين باش يخفف الحمض ديال المعدة، وفكر تشري مضاد حامض من الصيدلية (بحال كربونات الكالسيوم) ولا دواء كيقلل الحمض (بحال رانيتيدين ولا فاموتيدين) إلا ما عندكش حساسية معروفة. بقا مرطب—شرب شوية شوية ديال الما ولا محلول الإماهة من بعد القيء. إلا بقات الحرقة كتعاود أكثر من 3 مرات فالسيمانة، ولا كتطول أكثر من سيمانة، ولا كتزاد، ولا لقيتي صعوبة فالبلاع، قيء مستمر، نقص فالوزن، ولا ألم فالصدر، سير عند الطبيب باش يدير لك تشخيص ويعطيك دوا إذا خاص.

Time: 5.6 s (stage 1: 1.3 s, stage 2: 4.4 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Heartburn that leads to vomiting can often be managed with simple steps. Try eating smaller, more frequent meals and avoid trigger foods such as spicy, fatty, fried, coffee, chocolate, citrus and carbonated drinks. Stay upright for at least 2 hours after eating; avoid lying down or heavy exercise right after meals. Sip water or a non‑caffeinated herbal tea to help dilute stomach acid, and consider an over‑the‑counter antacid (e.g., calcium carbonate) or a short course of an acid‑reducing product (e.g., ranitidine or famotidine) if you have no known allergies. Keep hydrated—drink small sips of water or oral rehydration solution after vomiting. If the heartburn recurs more than 3 times a week, lasts longer than a week, worsens, or you develop difficulty swallowing, persistent vomiting, weight loss, or chest pain, see a doctor for further evaluation and possible prescription medication.

</details>

## 9b. Urinary infection (UTI) (Arabic script)

**Question:** قبيلة مني مشيت نبول جاني الحريق و أنا كنبول

### Turn 1

**Darija answer:** سمح ليا على هاد الشي اللي كايوقع ليك. واش تقدر تقولي ليا شنو الفئة العمرية ديالك (ولد تحت 12 عام، بالغ، ولا كبير فوق 65 عام)، شحال من الوقت كاينة الإحساس بالحرقان، واش الإحساس خفيف، متوسط ولا قوي؟ إلا كنتي مرا فالعمر اللي ممكن تحملي فيه ولاد، قوليا واش ممكن تكوني حاملة.

Time: 4.1 s (stage 1: 2.7 s, stage 2: 1.5 s)

Retries: 2 (stage 1: 2, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I'm sorry you're experiencing that. Could you tell me your age group (child under 12, adult, or elderly over 65), how long the burning sensation has been present, and whether it feels mild, moderate, or severe? If you are a woman of child‑bearing age, let me know if you might be pregnant.

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** كيبان ليك عندك إحساس بالحرقان فالصدر كيولي أقوى ملي كتسعل، هادشي عادي ديال الحموضة ولا الارتجاع المريئي. جرب تقسم الماكلة لوجبات صغار، وتفادى الماكلة الحارة، الدهنية، المقلية، القهوة والمشروبات الغازية، وما ترقدش أقل من جوج سوايع من بعد ما كلتي. رفع شوية راس الفراش وخلّيك واقف من بعد الماكلة. مضادات الحموضة لي كتلقاها فالصيدلية (بحال كربونات الكالسيوم) ولا دواء قصير كيقلل الحموضة بحال الرانيتيدين ولا الأوميبرازول يقدرو يعاونوك، غير تبع التعليمات ديال العلبة وما تستعملهمش على طول بلا ما تستاشر طبيب. إلا كان الحرقان كل نهار، ولا لاحظتي صعوبة فالبلع، ولا نقص غير مفسر فالوزن، ولا قيء، خاصك تشوف طبيب. إلا حسيت بألم صدري قوي فجأة، ولا ضيق فالتنفس، ولا أعراض ديال نوبة قلبية، عيط للطوارئ دابا.

Time: 6.7 s (stage 1: 4.4 s, stage 2: 2.3 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

It sounds like you have a burning sensation in your chest that gets worse when you cough, which is typical of heartburn or acid reflux. Try eating smaller meals, avoiding spicy, fatty, fried, coffee and carbonated drinks, and don’t lie down for at least two hours after eating. Raise the head of your bed slightly and stay upright after meals. Over‑the‑counter antacids (e.g., calcium carbonate) or a short course of an acid‑reducing medication such as ranitidine or omeprazole can help, but follow the package instructions and avoid long‑term use without a doctor’s advice. If the burning occurs most days, you notice difficulty swallowing, unexplained weight loss, or vomiting, seek medical evaluation. If you develop sudden severe chest pain, shortness of breath, or symptoms of a heart attack, call emergency services immediately.

</details>

## 10a. Heartburn (Franco-Arabic)

**Question:** mni ftrt sbah ou m3da dyali kadrni bzf

### Turn 1

**Darija answer:** سمح ليا على الألم اللي كتعيشو. واش تقدر تقولي شنو الفئة العمرية ديالك (ولد تحت 12، كبير ولا فوق 65) و شحال شدة الألم فالمعدة (خفيف، متوسط ولا قوي)؟ وزيد، إلا كنتي مرا فالعمر اللي ممكن تلد فيه، واش حاملة دابا؟

Time: 4.9 s (stage 1: 1.8 s, stage 2: 3.1 s)

Retries: 3 (stage 1: 2, stage 2: 1)

<details>
<summary>English medical answer (stage 1)</summary>

I'm sorry you're in pain. Could you tell me your age group (child under 12, adult, or over 65) and how severe the stomach pain feels (mild, moderate, or severe)? Also, if you are a woman of child‑bearing age, are you currently pregnant?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** شحال من الوقت وانت كتوجع فالمعدة—من الصباح هاد الصباح، ولا شي أيام، ولا كثر؟

Time: 2.2 s (stage 1: 1.4 s, stage 2: 0.8 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

How long have you been experiencing this stomach pain—since this morning, for a few days, or longer?

</details>

## 10b. Heartburn (Arabic script)

**Question:** مني فطرت الصباح و المعدة ديالي كاضرني بزاف

### Turn 1

**Darija answer:** عافاك قول ليا شنو الفئة العمرية ديالك (ولد تحت 12 عام، بالغ، ولا كبير فوق 65 عام)، شحال من الوقت كاين الألم فالمعدة من الفطور، واش الألم خفيف ولا متوسط ولا قوي؟

Time: 2.0 s (stage 1: 0.7 s, stage 2: 1.3 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Could you tell me your age group (child under 12, adult, or elderly over 65), how long the stomach pain has been present since breakfast, and whether the pain feels mild, moderate, or severe?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** وجع معدة متوسط بدا الصباح اليوم عند واحد شاب بصحة مزيانة عندو 30 عام غالباً كيرجع لهضم خايب، التهاب خفيف فالمعدة، ولا غير اضطراب مؤقت فالمعدة. حاول ترتاح وتفادى ترقد مسطح مباشرة من بعد ماكلة. ستيك على ماكلة خفيفة بحال توست، رز، موز، ولا بطاطا مسلوقة وبقى رطب بشوية شوية ديال الما ولا مرق صافي. مضادات الحموضة اللي كتبيع فالصيدلية (مثلاً كربونات الكالسيوم) ولا دواء قصير لتقليل الحموضة (مثلاً رانيتيدين ولا فاموتيدين) يقدرو يعاونوك إلا كان عندك حرقان فالمعدة. تجنب القهوة، الشراب الكحولي، الماكلة الحارة، المقلية، ولا اللي فيها بزاف ديال الدهن حتى يتحسن الوجع. إلا شد الوجع بزاف، ولا ولاّت القيء، ولا كاين دم فالبراز ولا فالقيا، ولا الحرارة، ولا بقا الوجع كيتستمر أكثر من يومين، سير عند الطبيب بسرعة. إلا لاحظتي شي أعراض جديدة، قول لي.

Time: 4.7 s (stage 1: 2.6 s, stage 2: 2.1 s)

Retries: 2 (stage 1: 2, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

A moderate stomach ache that started this morning in a healthy 30‑year‑old is often caused by indigestion, mild gastritis, or a temporary upset stomach. Try to rest and avoid lying flat right after meals. Stick to bland foods such as toast, rice, bananas, or boiled potatoes and stay hydrated with small sips of water or clear broth. Over‑the‑counter antacids (e.g., calcium carbonate) or a short course of an acid‑reducer (e.g., ranitidine or famotidine) can help if you have heartburn‑type discomfort. Avoid caffeine, alcohol, spicy, fried, or very fatty foods until the pain improves. If the pain becomes severe, you develop vomiting, blood in stool or vomit, fever, or it persists beyond a couple of days, see a doctor promptly. If you notice any new symptoms, let me know.

</details>

## 11a. Constipation (Franco-Arabic)

**Question:** krchi 9as7a ou fiya l9abd

### Turn 1

**Darija answer:** قولي ليا شنو الفئة العمرية ديالك (ولد تحت 12 عام، كبير ولا فوق 65 عام)، شحال من الوقت وانت مسدود، واش الألم خفيف ولا متوسط ولا قوي؟

Time: 2.5 s (stage 1: 1.3 s, stage 2: 1.2 s)

Retries: 2 (stage 1: 2, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me your age group (child under 12, adult, or over 65), how long you’ve been constipated, and whether the pain is mild, moderate, or severe?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** إلى كان عندك إمساك متوسط فواحد لابن سليم، زيد شوية ديال الألياف (حبوب كاملة، الفواكه، الخضرة، البقول) وحاول تشرب على الأقل تمان كاسان ديال الما كل نهار.  <br>حركة خفيفة بحال تمشية قصيرة من بعد الماكلة كتعاون تحرك الأمعاء.  <br>إلى ما خرجتش من الحمام أكثر من ثلاثة أيام، يمكن لك تستعمل ملين أوسموتيكي من الصيدلية (بحال بولي إيثيلين غليكول) كيف ما مكتوب، وتفادى الملينات المنشطة إلا إذا نصحك الصيدلي.  <br>دير روتين ثابت—حاول تجلس على المرحاض ف نفس الوقت كل نهار، خصوصاً من بعد الماكلة.  <br>سير للطبيب إلا شفت الدم ف البراز، أو وجع ف البطن قوي، أو تورم مفاجئ، ولا بقا الإمساك كاين أكثر من جوج سمانة مع أنك درتي هاد النصائح.

Time: 4.0 s (stage 1: 1.1 s, stage 2: 2.9 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

For moderate constipation in a healthy adult, try adding more fiber (whole grains, fruits, vegetables, legumes) and aim for at least eight glasses of water daily. Gentle physical activity such as a short walk after meals can help stimulate bowel movements. If you haven’t had a bowel movement for more than three days, an over‑the‑counter osmotic laxative (e.g., polyethylene glycol) taken as directed can be useful; avoid stimulant laxatives unless advised by a pharmacist. Keep a regular schedule—try to sit on the toilet at the same time each day, especially after meals. Seek medical attention if you notice blood in the stool, severe abdominal pain, sudden swelling, or if constipation persists for more than two weeks despite these measures.

</details>

## 11b. Constipation (Arabic script)

**Question:** كرشي قاسحة و فيا القبض

### Turn 1

**Darija answer:** سمح ليا حيت كتقاسي. تقدر تقولي شنو الفئة العمرية ديالك (ولد تحت 12، كبير ولا فوق 65)، شحال من الوقت عندك المعدة صعيبة والإمساك، وشنو درجة الألم: خفيف، متوسط ولا قوي؟

Time: 3.5 s (stage 1: 1.8 s, stage 2: 1.7 s)

Retries: 3 (stage 1: 3, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re uncomfortable. Could you tell me your age group (child under 12, adult, or over 65), how long you’ve had the hard stomach and constipation, and whether the pain feels mild, moderate, or severe?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** إلى كنتي فحال واحد شاب 30 عام وصحي وعندك إمساك متوسط، جرب هاد الخطوات:<br><br>شرب الما بزاف—حاول تشرب على الأقل 8 كيسان (حوالي 2 لتر) فاليوم، وكمّ شوية شوية طوال النهار. زيد الماكلة اللي فيها ألياف كثيرة بحال الحبوب الكاملة، الفول، الفواكه (خصوصاً الكمثرى، التفاح بالقشرة، التوت) والخضرة. الزيادة بشوية بشوية كتعاون ما يجيكش الغازات. حاول توصل لـ 25‑30 غرام ديال الألياف كل نهار وفكر تستعمل مكمل ألياف (بحال السيليوم) إلا ما قدرتش تجيبها من الماكلة.<br><br>بقا ناشط، دير المشي بانتظام ولا تمارين خفيفة، هادشي كيعاون حركة الأمعاء. إذا احتاجيتي، يمكن لك تستعمل ملين أسموزي متوفر فالصيدلية (بحال البولي إيثيلين غليكول) غير لوقت قصير؛ تبع التعليمات اللي فالعلبة وما تستعملوش مدة طويلة بلا ما تسول الطبيب.<br><br>ملي تلاحظ دم فالبراز، ألم قوي، ماقدرتش تدوز الغازات ولا البراز فجأة، نقص وزن ما مفهمتوش، ولا بقات الأعراض كاتستمر أكثر من سيمانة رغم هاد النصائح، سير عند الطبيب.

Time: 4.1 s (stage 1: 1.8 s, stage 2: 2.2 s)

Retries: 2 (stage 1: 2, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

For moderate constipation in a healthy 30‑year‑old, try these steps:<br><br>Drink plenty of water—aim for at least 8 cups (about 2 L) a day, and sip fluids throughout the day. Add high‑fiber foods such as whole grains, beans, fruits (especially pears, apples with skin, berries) and vegetables. A gradual increase helps avoid gas. Aim for 25–30 g of fiber daily and consider a fiber supplement (e.g., psyllium) if you can’t get enough from food.<br><br>Stay active with regular walking or light exercise, which promotes bowel movements. If needed, an over‑the‑counter osmotic laxative (e.g., polyethylene glycol) can be used for a short period; follow the package directions and avoid long‑term use without medical advice.<br><br>Seek a doctor’s evaluation if you notice blood in the stool, severe pain, sudden inability to pass gas or stool, unexplained weight loss, or if symptoms persist beyond a week despite these measures.

</details>

## 12a. Cold and flu (Franco-Arabic)

**Question:** hadi simana ou fiya rwa7

### Turn 1

**Darija answer:** قولي ليا شنو الفئة العمرية ديالك (ولد تحت 12، بالغ، ولا فوق 65) و شحال شدة البرد ديالك (خفيف، متوسط، ولا قوي)؟

Time: 2.6 s (stage 1: 1.1 s, stage 2: 1.5 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me your age group (child under 12, adult, or over 65) and how severe your cold feels (mild, moderate, or severe)?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** باش تدير برد متوسط، ارتاح وبقَى تشرب مزيان — الما، أتاى بالأعشاب، ولا مرق سخون.  <br>غسلات الأنف بماء ملحي سخون ولا سبراي ديال التنفس يقدرو يخففو السيلان ديال الأنف، و دير معلقة عسل مع ما ليمون سخون يهدى أي إزعاج فالحلق.  <br>إلى جابك السخانة ولا راس كيوجع ولا الوجيعات، تقدر دير باراسيتامول (500 ملغ – 1 غ كل 6 سوايع) ولا إيبوبروفين (200 ملغ – 400 ملغ كل 6 سوايع)، بلا ما تفوت الكمية اليومية.  <br>حاول ما تشربش التبغ، ولا الكحول، ولا المشروبات الباردة بزاف.  <br>راقب العوارض ديالك: سير للطبيب إلا بقات السخانة كثر من 3 أيام، ولا حسيت بألم فالصدر، ولا صعوبة فالتنفس، ولا بقى البرد كثر من 3 أسابيع.  <br>إلا ما وقعش هادشي، أغلب البردات كتتحسن فحد الأسبوع مع هاد النصائح.

Time: 4.2 s (stage 1: 1.2 s, stage 2: 3.0 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

For a moderate cold, rest and keep hydrated—water, herbal tea, or warm broth. Warm saline nasal rinses or a decongestant spray can relieve a runny nose, and a teaspoon of honey with warm lemon water may soothe any throat irritation. If you develop a fever, headache, or aches, you can take paracetamol (500 mg – 1 g every 6 hours) or ibuprofen (200 mg – 400 mg every 6 hours), staying within the daily limits. Avoid smoking, alcohol, and very cold drinks. Monitor your symptoms: seek medical care if the fever lasts more than 3 days, you develop chest pain, shortness of breath, or the cold persists beyond 3 weeks. Otherwise, most colds improve within a week with these supportive measures.

</details>

## 12b. Cold and flu (Arabic script)

**Question:** هادي سيمانة و فيا الرواح

### Turn 1

**Darija answer:** سمح ليا، عارف أنك مريض/مريضة من أسبوع. واش تقدر تقولي شنو الفئة العمرية ديالك (ولد تحت 12، كبير ولا فوق 65)، شحال قوية الأعراض (خفيفة، متوسطة ولا قوية)، واش كان عندك السخانة ولا شي علامات كتزيد؟

Time: 3.6 s (stage 1: 1.9 s, stage 2: 1.8 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’ve been feeling unwell for a week. Could you tell me your age group (child under 12, adult, or over 65), how severe the symptoms feel (mild, moderate, or severe), and whether you’ve had any fever or worsening signs?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** كيبان بحال زكام متوسط اللي بقا تقريباً سيمانة. رتاح، شرب الما مزيان، واستعمل مرطّب للهواء ولا تنفّس بخار إلا حسيت أن الأنف مسدود. الدوا اللي كتبيع فالصيدلية بحال باراسيتامول ولا إيبوبروفين يقدرو يعاونو فصداع الراس، التهاب الحلق ولا حرارة خفيفة—تبع التعليمات ديال الجرعة لي مكتوبة على العلبة. غسل الحلق بماء سخون مع الملح والعسل مع أتاي الليمون السخون يقدر يهدى الحلق. بّعد على التدخين وقلل من الشراب. راقب أي علامات جديدة ولا كتزاد: حرارة عالية ما كتتحسنش، ألم فالصدر، صعوبة فالتنفس، ولا أعراض كاتبقى أكثر من ثلاث سيمانات. إلا وقع شي حاجة من هادشي، ولا حسيت براسك كتزاد الحال، سير عند الطبيب فورا.

Time: 2.9 s (stage 1: 0.8 s, stage 2: 2.0 s)

Retries: 3 (stage 1: 1, stage 2: 2)

<details>
<summary>English medical answer (stage 1)</summary>

It sounds like a moderate cold that’s lasted about a week. Rest, stay well hydrated, and use a humidifier or steam inhalation if the nasal passages feel blocked. Over‑the‑counter pain relievers such as paracetamol or ibuprofen can help with any headache, sore throat or mild fever—follow the dosing instructions on the package. Warm salt water gargles and honey with warm lemon tea can soothe a sore throat. Avoid smoking and limit alcohol. Keep an eye on any new or worsening signs: high fever that doesn’t improve, chest pain, difficulty breathing, or symptoms that persist beyond three weeks. If any of those occur, or if you feel significantly worse, seek medical attention promptly.

</details>

## 13a. High blood pressure (Franco-Arabic)

**Question:** 3ndi daght dem tale3

### Turn 1

**Darija answer:** سمح ليا كتعيش ضغط دم عالي. عافاك قولي ليا شنو الفئة العمرية ديالك (ولد &lt;12، بالغ، ولا كبير فوق 65)، شحال من الوقت وهو مرتفع (اليوم، شي أيام، ولا أكثر من سيمانة)، وكدير معاك القراءة: خفيفة، متوسطة ولا قوية؟

Time: 2.8 s (stage 1: 1.1 s, stage 2: 1.7 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re experiencing high blood pressure. Could you tell me your age group (child &lt; 12, adult, or elderly &gt; 65), how long it’s been elevated (today, a few days, or over a week), and whether the reading feels mild, moderate, or severe?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** ضغط الدم ديالك مرتفع شوية وما كتستعملش أي دواء. عاود تقيسو من بعد شوية ديال الراحة؛ إلا بقا فوق 140/90، بدا بتدابير نمط الحياة: نقص الملح، تجنب الماكلة المعلبة، حدّ الكحول، سقط التدخين إلا كان، حافظ على وزن صحي، وهدّف على الأقل 150 دقيقة ديال الرياضة المتوسطة كل سيمانة. شرب الما بزاف، دير تقنيات الاسترخاء لتقليل التوتر، ونعس مزيان. راقب الضغط ديالك فدار (ولا فالصيدلية) شحال من مرة فاليوم لمدة سيمانة. إلا بقا الضغط مرتفع، ولا جاب لك راسك، دوخة، ألم فالصدر، ولا أي أعراض جديدة، شوف طبيب بسرعة لتقييم إضافي وعلاج محتمل. المتابعة المنتظمة مهمة حتى إلا كنتي بخير.

Time: 2.6 s (stage 1: 1.0 s, stage 2: 1.6 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Your blood pressure is moderately high and you’re not on any medication. Check it again after a few minutes of rest; if it stays above 140/90 mmHg, start with lifestyle measures: reduce salt, avoid processed foods, limit alcohol, quit smoking if applicable, maintain a healthy weight, and aim for at least 150 minutes of moderate exercise weekly. Drink plenty of water, manage stress with relaxation techniques, and get enough sleep. Monitor your pressure at home (or at a pharmacy) a few times a day for a week. If readings remain elevated, or you develop headaches, dizziness, chest pain, or any new symptoms, see a doctor promptly for further evaluation and possible treatment. Regular follow‑up is important even if you feel well.

</details>

## 13b. High blood pressure (Arabic script)

**Question:** عندي ضغط الدم طالع

### Turn 1

**Darija answer:** سمح ليا نسمع هاد الشي. عفاك قول ليا شنو العمر ديالك (أقل من 12، بالغ، ولا فوق 65) و شحال من الوقت لاحظتي الضغط ديالك طالع؟ وزيد، واش عندك شي أمراض خرين بحال السكري، أمراض الكلى، ولا تاريخ ديال مشاكل القلب؟

Time: 2.8 s (stage 1: 1.2 s, stage 2: 1.6 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry to hear that. Could you tell me your age group (under 12, adult, or over 65) and how long you’ve noticed your blood pressure being high? Also, do you have any other health conditions such as diabetes, kidney disease, or a history of heart problems?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** ضغط الدم ديالك مرتفع، وفاش عمرك 30 عام خاصك تعالج فيه بكري. قيس الضغط ديالك بواحد الكوف موثوق؛ إلا بقا فوق 130/80 فزوج أيام مختلفين، دير مراجعة عند الطبيب. فهاد الوقت، جرب هاد الخطوات: نقص الماكلة المملحة والوجبات السريعة، حاول ما تفوتش 5 غرام ديال الملح الزايد فاليوم؛ كل بزاف ديال الفواكه والخضرة، الحبوب الكاملة، والبروتين الخفيف؛ بقى ناشط على الأقل 150 دقيقة ديال الرياضة المتوسطة كل سيمانة (بحال المشي السريع); حافظ على وزن مزيان وتفادى السُكر بزاف. نقص التوتر بتقنيات الاسترخاء بحال التنفس العميق أو المشي القصير. شرب الما بلا ما تشرب المشروبات السكرية، وقف التدخين إلا كنت كتدخن. راقب الضغط ديالك بانتظام وكتب ملاحظات باش تبغيها للطبيب. إلا حسيت بالصداع، الدوخة، ألم فالصدر، صعوبة فالتنفس، أو أي تغيير مفاجئ، سير عند الطبيب بسرعة.

Time: 3.4 s (stage 1: 1.1 s, stage 2: 2.3 s)

Retries: 2 (stage 1: 1, stage 2: 1)

<details>
<summary>English medical answer (stage 1)</summary>

Your blood pressure is elevated, and at age 30 it’s important to address it early. Check your reading with a reliable cuff; if it stays above 130/80 mmHg on two separate days, arrange a doctor’s review. In the meantime, try these steps: limit salty foods and processed snacks, aim for less than 5 g of added salt daily; eat plenty of fruits, vegetables, whole grains, and lean protein; keep active with at least 150 minutes of moderate exercise (e.g., brisk walking) each week; maintain a healthy weight and avoid excess alcohol. Reduce stress with relaxation techniques such as deep breathing or short walks. Drink water instead of sugary drinks, and stop smoking if you do. Monitor your pressure regularly and keep a log to share with your doctor. If you notice headaches, dizziness, chest pain, shortness of breath, or any sudden change, seek medical attention promptly.

</details>

## 14a. Type 2 diabetes (Franco-Arabic)

**Question:** 3ndi sokkar mn naw3 tani

### Turn 1

**Darija answer:** فاهم عندك السكري من النوع الثاني. كيفاش نقدر نعاونك اليوم؟ واش كتحس بأي أعراض معينة ولا عندك شي مشكل بخصوص المرض ديالك؟

Time: 1.8 s (stage 1: 0.9 s, stage 2: 0.9 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I understand you have type 2 diabetes. How can I help you today? Are you experiencing any specific symptoms or concerns related to your condition?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** فرحان/فرحانة حيث باين عليك مزيان. تقدر تقول ليا فين كتحس بالألم المتوسط و شحال من الوقت وهو كاين؟ وزيد، واش كتقيس سكر الدم ديالك بانتظام؟ إلا كان، شنو هو النطاق اللي كيطيح فيه عادةً؟

Time: 2.0 s (stage 1: 0.7 s, stage 2: 1.3 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m glad you’re otherwise well. Could you tell me where you’re feeling the moderate pain and how long it has been present? Also, do you regularly check your blood‑sugar levels, and if so, what range do they usually fall into?

</details>

## 14b. Type 2 diabetes (Arabic script)

**Question:** عندي السكر من النوع الثاني

### Turn 1

**Darija answer:** فهمت بلي عندك السكري من النوع الثاني. خصك تدير فحوصات سكر الدم بانتظام وتلتزم بخطة الدوا ديال الطبيب؛ ما توقفش ولا تبدل الجرعات بلا ما تسول. حاول تاكل وجبة متوازنة فيها الخضرة، الحبوب الكاملة، بروتين خفيف ومحدود من الماكلة اللي فيها سكر أو مكررة؛ التحكم فالكميات كيعاون على تنظيم السكر. دير على الأقل 150 دقيقة ديال النشاط المتوسط كل سيمانة (بحال المشي السريع) وبقا شرب الما بزاف. راقب العلامات اللي كتحتاج تدخل طبي سريع، بحال سكر الدم عالي مستمر (&gt;250 ملغ/دL)، أعراض نقص سكر الدم (الرجفة، الارتباك، العرق)، نقص الوزن بلا سبب، تغيّر فالرؤية، جروح فالرجلين، أو كثرة التبول. دير فحوصات دورية للـ HbA1c، ضغط الدم، الكوليسترول، وظيفة الكلى، فحص العين وتفقد الرجلين. إلا لاحظتي شي أعراض مقلقة ولا صعيب عليك تدبر سكر الدم، عيط للطبيب ديالك فورا.

Time: 4.6 s (stage 1: 2.1 s, stage 2: 2.5 s)

Retries: 1 (stage 1: 1, stage 2: 0)

**Note:** turn 1 gave advice directly

<details>
<summary>English medical answer (stage 1)</summary>

I understand you have type 2 diabetes. Keep blood‑sugar checks regular and follow your doctor’s medication plan; don’t stop or change doses without advice. Aim for a balanced diet rich in vegetables, whole grains, lean protein and limited sugary or refined foods; portion control helps control glucose. Include at least 150 minutes of moderate activity each week (e.g., brisk walking) and stay hydrated. Monitor for signs that need prompt medical attention, such as persistent high blood sugar (&gt;250 mg/dL), symptoms of low blood sugar (shakiness, confusion, sweating), unexplained weight loss, new vision changes, foot sores, or frequent urination. Keep routine check‑ups for HbA1c, blood pressure, cholesterol, kidney function, eye exams, and foot inspections. If you notice any concerning symptoms or have trouble managing your glucose, contact your healthcare provider promptly.

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** تقدر تقولي فين كاينة الوجيعة وشحال من الوقت حاس بيها؟ وزيد، واش لاحظتي شي سخانة ولا غثيان ولا شي تغيير فالشوف ديالك ولا فالتنفس؟

Time: 2.3 s (stage 1: 1.1 s, stage 2: 1.2 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me where the pain is located and how long you’ve been feeling it? Also, have you noticed any fever, nausea, or changes in your vision or breathing?

</details>

## 15a. Anxiety and stress (Franco-Arabic)

**Question:** Kan7ess b l9la9 w stress bzaf

### Turn 1

**Darija answer:** سمح ليا كتقلقك هاد الحالة. واش تقدر تقولي شنو الفئة العمرية ديالك (ولد &lt;12، كبير ولا فوق 65)، شحال من مدة وانت كتعيش هاد الإحساس (اليوم، شي أيام، ولا أكثر من سيمانة)، وشنو درجة القلق (خفيفة، متوسطة، ولا قوية)؟

Time: 2.4 s (stage 1: 1.3 s, stage 2: 1.1 s)

Retries: 3 (stage 1: 3, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re feeling so anxious. Could you tell me your age group (child &lt; 12, adult, or over 65), how long you’ve been feeling this way (today, a few days, or more than a week), and how severe the anxiety feels (mild, moderate, or severe)?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** جرّب تقنيات بسيطة لتخفيف القلق: قعد مريّح، تنفس 4 ثواني، شد النفس 4 ثواني، زفير 4 ثواني؛ عاود هادشي 5‑10 دقايق، ثلاث مرات فاليوم. نقص القهوة والكحول، حاول تنعس على الأقل 7 سوايع، ودار 30 دقيقة ديال الرياضة المتوسطة (المشي، الجري) أغلب الأيام. كتب ملاحظات قصيرة على الحوايج اللي كيقلقوك وكيفاش تجاوبت عليهم؛ هادشي يعاونك تشوف الأنماط وتخطط طرق التعامل (مثلاً، فترات راحة قصيرة، استرخاء العضلات بالتدريج). إلا بقات الإحساس متوسط ولا زاد، ولا بدا يأثر على الخدمة، العلاقات ولا النعاس، فكر تشوف طبيب عام ولا مختص فالصحة النفسية باش يدير لك استشارة ولا علاج (CBT). يقدرو يقرروا واش الدوا يقدر يكون مفيد. إلا حسيت بنوبة هلع، ألم فالصدر، ولا أفكار إيذاء الذات، طلب المساعدة الطارئة دابا.

Time: 3.2 s (stage 1: 1.2 s, stage 2: 2.0 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Try simple anxiety‑relief techniques: sit comfortably, breathe in for 4 seconds, hold 4 seconds, exhale 4 seconds; repeat 5‑10 minutes, three times a day. Limit caffeine and alcohol, get at least 7 hours of sleep, and aim for 30 minutes of moderate exercise (walk, jogging) most days. Keep a short diary of stressful triggers and how you responded; this can help you spot patterns and plan coping strategies (e.g., short breaks, progressive muscle relaxation). If the feeling stays moderate or worsens, or begins to affect work, relationships, or sleep, consider speaking with a primary‑care doctor or a mental‑health professional for possible counseling or therapy (CBT). They can also assess if medication might be helpful. If you ever feel panic, chest pain, or thoughts of self‑harm, seek emergency help immediately.

</details>

## 15b. Anxiety and stress (Arabic script)

**Question:** كنحس بالقلق و الستريس بزاف

### Turn 1

**Darija answer:** سمح ليا حيت كتقلق راسك هكا. نقدر نسولك: واش انت كبير، ولا ولد تحت 12 عام، ولا فوق 65 عام؟ شحال من الوقت وانت كتعيش هاد القلق (اليوم، شي أيام، ولا كثر من سيمانة)؟ وكيفاش كتقيم الشدة ديالو: خفيف، متوسط ولا قوي بزاف؟

Time: 2.0 s (stage 1: 0.8 s, stage 2: 1.2 s)

Retries: 1 (stage 1: 1, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re feeling so anxious. May I ask: are you an adult, a child under 12, or over 65? How long have you been experiencing this level of anxiety (today, a few days, or more than a week)? And would you describe the intensity as mild, moderate, or severe?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** عادي تحس بشوية القلق فالعمر ديالك، خصوصاً ملي كيكثر الضغط. دير تنفس عميق بانتظام ولا تقنية 4‑7‑8 (تنفس 4 ثواني، شدي النفس 7، زفير 8) شحال من مرة فاليوم. حاول تنعس على الأقل 7‑8 سوايع، خليك ثابت فوقت النعاس، وقلل القهوة ولا الشراب الكحولي فالعشية. رياضة خفيفة بحال مشي 20 دقيقة، يوجا ولا تمطية كتعاون تنقص هرمونات الضغط. كتب القلق ديالك فورقة وحدد وقت خاص للقلق ديال 15 دقيقة كل نهار، ومن بعد عاود دير تأجيل للهموم الأخرى بشوية. إلا الأفكار كتغلبك ولا كتستمر أكثر من شحال من سيمانة، فكر تشوف طبيب عام يقدر يحولك لمعالج نفسي ولا يقترح دواء قصير المدة إلا احتاجتيه. بقا على تواصل مع صحابك ولا عائلتك اللي كيدعموك، وشرب بزاف الما طوال النهار.

Time: 3.3 s (stage 1: 1.2 s, stage 2: 2.1 s)

Retries: 3 (stage 1: 2, stage 2: 1)

<details>
<summary>English medical answer (stage 1)</summary>

It’s common to feel moderate anxiety at your age, especially when stress builds up. Try regular deep‑breathing or the 4‑7‑8 technique (inhale 4 seconds, hold 7, exhale 8) a few times each day. Aim for at least 7–8 hours of sleep, keep a consistent bedtime, and limit caffeine or alcohol in the evening. Light exercise such as a 20‑minute walk, yoga, or stretching can lower stress hormones. Write down worries on paper and set aside a specific “worry time” of 15 minutes each day, then gently postpone any other concerns. If thoughts feel overwhelming, intrusive, or last more than a few weeks, consider speaking with a primary‑care doctor who can refer you to a therapist for cognitive‑behavioral therapy or suggest short‑term medication if needed. Stay connected with supportive friends or family, and drink plenty of water throughout the day.

</details>

## 16a. Insomnia (Franco-Arabic)

**Question:** hadi simana makan9drch n3es blil

### Turn 1

**Darija answer:** عافاك قول لينا شنو الفئة العمرية ديالك: ولد تحت 12 عام، بالغ، ولا كبير فوق 65 عام؟ و شحال شدة الأرق عندك: خفيف، متوسط ولا شديد؟ وزيد، واش كتحس بأعراض خرا بحال الوجع، القلق، ولا السخانة؟

Time: 2.5 s (stage 1: 0.8 s, stage 2: 1.7 s)

Retries: 5 (stage 1: 1, stage 2: 4)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me your age group (child under 12, adult, or elderly over 65) and how severe the sleeplessness feels (mild, moderate, or severe)? Also, are you experiencing any other symptoms such as pain, anxiety, or fever?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** كاين بحال إلى نتَ راجل (30 عام) وعندك صعوبة متوسطة فالنوم تقريبا أسبوع، وما عندكش حتى مرض آخر ولا دوا.  <br><br>جرب هاد النصائح ديال النظافة ديال النوم: خليك ديما كتنعس وتفيق فنفس الوقت، نقص القهوة والماكلة الثقيلة من بعد نص النهار، طفي الشاشات على الأقل ساعة قبل ما تنعس، دير بيتك بارد ومظلم، ودير روتين مريح قبل ما تنعس (دوش سخون، قرا شي حاجة، تنفس هادئ). ما تديرش قيلولة فالنهار وخلي الفراش غير للنوم. رياضة خفيفة فالصباح ولا فالنص النهار كتعاون، ولكن ما تديرش تمارين قوية قرب الوقت ديال النوم. إلا كان القلق ولا الأفكار كتجري فدماغك وما خلاتكش تنعس، جرب تمارين التنفس ديال “الصندوق” لمدة 5 دقايق (تنفس 4 ثواني، حبس 4 ثواني، زفير 4 ثواني، حبس 4 ثواني) ولا استعمل تطبيق ديال الوعي.  <br><br>إلى بقات مشاكل النوم كثر من جوج سمانات، ولا تزادت، ولا بدلات خدمتك اليومية، سير عند الطبيب باش يدير لك تشخيص ويعطيك علاج قصير المدة.

Time: 3.6 s (stage 1: 1.0 s, stage 2: 2.6 s)

Retries: 3 (stage 1: 1, stage 2: 2)

<details>
<summary>English medical answer (stage 1)</summary>

It sounds like you’re an adult (30 years) with moderate difficulty sleeping for about a week, without any other illness or medication.<br><br>Try these sleep‑hygiene steps: keep a consistent bedtime and wake‑time, limit caffeine and heavy meals after mid‑afternoon, turn off screens at least an hour before bed, create a cool dark bedroom, and do a relaxing routine (warm shower, reading, gentle breathing) before sleep. Avoid napping during the day and reserve the bed for sleep only. Light exercise earlier in the day can help, but stop vigorous activity close to bedtime. If anxiety or racing thoughts keep you awake, try a 5‑minute “box breathing” (inhale 4 s, hold 4 s, exhale 4 s, hold 4 s) or a short mindfulness app.<br><br>If sleep problems continue beyond two weeks, worsen, or affect daily functioning, see a doctor for further evaluation and possible short‑term treatment.

</details>

## 16b. Insomnia (Arabic script)

**Question:** هادي سيمانة ما كنقدرش نعس بالليل

### Turn 1

**Darija answer:** سمح ليا على صعوبة النوم ديالك. واش تقدر تقولي شنو الفئة العمرية ديالك (ولد تحت 12، كبير، ولا فوق 65)، شحال قوية القلة ديال النوم (خفيفة، متوسطة، ولا قوية)، واش عندك شي أمراض مزمنة ولا حاملة؟

Time: 2.3 s (stage 1: 0.9 s, stage 2: 1.5 s)

Retries: 2 (stage 1: 1, stage 2: 1)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re having trouble sleeping. Could you tell me your age group (child under 12, adult, or over 65), how severe the sleeplessness feels (mild, moderate, or severe), and whether you have any chronic health conditions or are pregnant?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** باش تحل مشكل النوم المتوسط وقصير المدة عند شاب بصحة مزيانة عندو 30 عام، جرب هاد الخطوات:<br><br>دير روتين ثابت قبل ما تنعس: سير للنعاس وفْق من نفس الوقت كل نهار، حتى فالعطلة. خليك تخلي بيت النوم مظلم، بارد، وهادئ؛ نقص من الشاشات (التلفون، التلفزة) على الأقل ساعة قبل ما تنعس وفكّر تدير شي نشاط هادي بحال القراية ولا تمارين خفيفة.<br><br>ما تستعملش المنبهات من بعد نص النهار—القهوة، النيكوتين، والماكلة الثقيلة. نقص من الكحول، حيت يقدر يخلط النوم فليل. نقص شوية من شرب الما فالعشية باش ما تقومش للحمام.<br><br>إلى كنتي مخلوع وما قادرش تنعس، قوم و دير شي حاجة هادئة وضو خفيف (مثلاً القراية) حتى تحس بالنعاس؛ ما تشوفش الساعة. جرعة صغيرة من الميلاتونين (0.5–3 ملغ) تاخدها قبل النعاس بنص ساعة تقدر تعاون تعاود تنظم الإيقاع، ولكن سولو الصيدلي إلا كان عندك شي مشكل صحي مخفي ولا دوا.<br><br>إلى بقات الصعوبة كاتستمر أكثر من شي أسابيع، ولا كتزاد، ولا جات مع القلق، الاكتئاب، ولا العيا نهار كامل، دير موعد مع طبيب عام باش يدير لك فحص أكتر.

Time: 5.5 s (stage 1: 1.4 s, stage 2: 4.1 s)

Retries: 3 (stage 1: 2, stage 2: 1)

<details>
<summary>English medical answer (stage 1)</summary>

For a moderate, short‑term sleep problem in a healthy 30‑year‑old, try these steps:<br><br>Create a consistent bedtime routine: go to bed and wake up at the same time each day, even on weekends. Keep the bedroom dark, cool, and quiet; limit screens (phone, TV) at least an hour before sleep and consider a brief relaxing activity like reading or gentle stretching.<br><br>Avoid stimulants after mid‑afternoon—caffeine, nicotine, and heavy meals. Limit alcohol, which can disrupt sleep later in the night. Reduce fluid intake in the evening to prevent waking for the bathroom.<br><br>If you’re lying awake, get up and do a quiet, low‑light activity (e.g., reading) until you feel sleepy; avoid checking the clock. A short, low‑dose melatonin (0.5–3 mg) taken 30 minutes before bedtime can help reset the rhythm, but check with a pharmacist if you have any hidden health issues or medications.<br><br>If difficulty persists beyond a few weeks, worsens, or is accompanied by anxiety, depression, or daytime fatigue, schedule a visit with a primary‑care doctor for further evaluation.

</details>

## 17a. Hay fever / allergy (Franco-Arabic)

**Question:** 3ndi 7asasiya mn lghobra ou had lyamat wlit kank7 bzf

### Turn 1

**Darija answer:** قولي ليا شنو الفئة العمرية ديالك (ولد تحت 12 عام، كبير ولا فوق 65 عام)، شحال من نهار وانت كتسعل، واش السعال خفيف، متوسط ولا قوي؟

Time: 1.8 s (stage 1: 0.7 s, stage 2: 1.1 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me your age group (child under 12, adult, or over 65), how many days you’ve been coughing, and whether the cough feels mild, moderate, or severe?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** إلى كان عندك سعال متوسط فواحد الراجل اللي بصحة مزيانة، بدا بالراحة الكثيرة وبقَى مرطّب مزيان — الما، أتاي سخون مع العسل والليمون يقدرو يهدّو الحلق. استعمل دواء سعال من الصيدلية إلا احتاجيتي، ولا دواء كيخرّج البلغم إلا بغيتي. وفكّر تاخد دورة قصيرة ديال باراسيتامول ولا إيبوبروفين إلا جاب لك السخانة ولا حسيت بألم. بْعد ما تدخّن، ما تعرض راسك للهواء البارد ولا للمواد المهيجة، وخلّي راسك مرفوع ملي كتنعس.  <br><br>أغلب السعال الفيروسي كيتحسّن فـ 3‑4 أسابيع. سير عند الطبيب إلا بقى السعال كثر من ثلاثة أسابيع، ولا خرجت دم من السعال، ولا حسيت بألم فالصدر، ولا لاحظتي صعوبة فالتنفس كتزاد، ولا فجأة جاب لك سخانة عالية ولا أعراض مقلقة أخرى. إلا عندك شي مرض خفي ما قلتيش عليه، قول للطبيب.

Time: 3.2 s (stage 1: 0.8 s, stage 2: 2.4 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

For a moderate cough in a healthy adult, start with plenty of rest and stay well‑hydrated—water, warm tea with honey and lemon can soothe the throat. Use an over‑the‑counter cough suppressant or expectorant if needed, and consider a short course of paracetamol or ibuprofen if you develop any fever or discomfort. Avoid smoking, cold air, and irritants, and keep your head elevated while sleeping.<br><br>Most viral coughs improve within 3–4 weeks. Seek medical attention if the cough lasts longer than three weeks, you cough up blood, develop chest pain, notice increasing shortness of breath, or if you suddenly develop a high fever or other concerning symptoms. If you have any underlying health conditions that were not mentioned, let a doctor know.

</details>

## 17b. Hay fever / allergy (Arabic script)

**Question:** عندي حساسية من الغبرة و هاد اليامات وليت كنكح بزاف

### Turn 1

**Darija answer:** قولي ليا شنو الفئة العمرية ديالك (ولد تحت 12، بالغ، ولا كبير فوق 65)، شحال من نهار وانت كتعطس بزاف، واش الأعراض خفيفة ولا متوسطة ولا قوية؟

Time: 1.8 s (stage 1: 0.9 s, stage 2: 0.9 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me your age group (child under 12, adult, or elderly over 65), how many days you’ve been sneezing a lot, and whether the symptoms feel mild, moderate, or severe?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** شكراً. شحال من الوقت وانت كتتعطس بزاف—غـي اليوم، ولا فـ 2‑3 أيام اللي فاتوا، ولا كثر من سيمانة؟

Time: 2.1 s (stage 1: 0.8 s, stage 2: 1.3 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Thanks. How long have you been experiencing the frequent sneezing—just today, for the past 2–3 days, or more than a week?

</details>

## 18a. Minor burn (Franco-Arabic)

**Question:** 9bila knt kantyb ou ana nt7rq wa7d l7rqa sghira

### Turn 1

**Darija answer:** سمح ليا حيت ما كتحسش مزيان. تقدر تقولي شنو الفئة العمرية ديالك (ولد تحت 12، كبير ولا شي حد كبير فوق 65) و شحال من الوقت دازت منين بدا الحرق الصغير؟ وزيد، كيفاش توصف الحرق: خفيف، متوسط ولا قوي؟

Time: 1.7 s (stage 1: 0.9 s, stage 2: 0.7 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re feeling unwell. Could you tell me your age group (child under 12, adult, or elderly over 65) and how long ago the small burn started? Also, would you describe the burn as mild, moderate, or severe?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** برد الحرق تحت ما جاري بشوية ديال الما لمدة 10–20 دقيقة، من بعد نشفّيه بقطعة نقيّة. ما تديرش الثلج، ولا الزبدة، ولا معجون السنان. غطّيه بضمادة معقمة ما كتلتصقش ولا شاش نقي؛ بدلها إلا ولاّت مبلولة. تقدر تاخد باراسيتامول (500 ملغ) كل 6 سوايع، ما تفوتش 3 غرام ف 24 سوايع، باش يخفّ الألم المتوسط. خليك محافظ على النظافة، ما تكسرش الفقاعات، وراقب احمرار كثر، تورم، صديد ولا حرارة—هذو علامات ديال العدوى خاصها مراجعة طبيب. إلا زاد الألم، ولا الحرق توسّع، ولا بان شي علامة ديال العدوى، سير للطبيب بسرعة. ارتاح، شرب الما بزاف، وحافظ على الجرح من الاحتكاك.

Time: 2.3 s (stage 1: 0.9 s, stage 2: 1.4 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Cool the burn under gently running water for 10–20 minutes, then pat dry with a clean cloth. Do not apply ice, butter, or toothpaste. Cover with a sterile non‑adhesive dressing or a clean gauze bandage; change it if it becomes wet. You can take paracetamol (500 mg) every 6 hours, not exceeding 3 g in 24 hours, to ease the moderate pain. Keep the area clean, avoid breaking any blisters, and watch for increasing redness, swelling, pus, or fever—signs of infection that need a doctor’s review. If the pain worsens, the burn spreads, or you notice any infection signs, seek medical care promptly. Rest, stay hydrated, and protect the wound from friction.

</details>

## 18b. Minor burn (Arabic script)

**Question:** قبيلة كنت كنطيب و أنا نتحرق واحد الحرقة صغيرة

### Turn 1

**Darija answer:** قولي ليا شنو العمر ديالك (ولد تحت 12 عام، كبير ولا شياب فوق 65) وشحال من الوقت داز منين وقع الحرق؟ وزيد، واش كاين شي فقاعات ولا ألم شديد حدا الحرق؟

Time: 2.2 s (stage 1: 1.1 s, stage 2: 1.1 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me your age group (child under 12, adult, or elderly over 65) and how long ago the burn occurred? Also, is there any blistering or severe pain around the burn?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** عالج حرق صغير ولا متوسط الألم بدوز الما باردة (ماشي باردة بحال الثلج) على الجرح لمدة 10 حتى 15 دقيقة، من بعد نشفوه بشوية باليد. دير طبقة خفيفة ديال مرهم مطهر من الصيدلية (بحال كلورهيكسيدين ولا باكتراسين) وغطّيه بضمادة نظيفة، ما فيهاش لاصق ومعقمة. تقدر تشرب باراسيتامول ولا إيبوبروفين إذا كان الألم مزال، وحافظ على المنطقة من الخدش ولا السخونية. بدل الضمادة كل نهار، وشوف واش كاين حمرة كيتزاد، تورم، صديد، ولا الألم كيتفاقم—هاذ الشي يقدر يكون علامة ديال المرض ولا خصك تشوف طبيب. ما تفرقعش الفقاعات اللي كتظهر. إذا كبر الحرق ولا كيوجع بزاف ولا جاك السخانة، سير عند الطبيب فورا. ارتاح، شرب الما بزاف، وخلي الجرح نقي وهو كيشفى.

Time: 5.0 s (stage 1: 0.9 s, stage 2: 4.1 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Treat a small, moderate‑pain burn by running cool (not ice‑cold) water over it for 10–15 minutes, then gently pat dry. Apply a thin layer of an over‑the‑counter antiseptic ointment (e.g., chlorhexidine or bacitracin) and cover with a clean, non‑adhesive sterile dressing. You can take paracetamol or ibuprofen for pain if needed, and keep the area protected from friction or heat. Change the dressing daily, watch for increasing redness, swelling, pus, or worsening pain—these may signal infection and require medical review. Avoid popping any blisters that form. If the burn enlarges, becomes very painful, or you develop fever, seek a doctor promptly. Rest, stay hydrated, and keep the wound clean while it heals.

</details>

## 19a. Ear pain (Franco-Arabic)

**Question:** Wedni katdreni bzaf hadi yomayn

### Turn 1

**Darija answer:** سمح ليا على الصداع اللي كيدير ليك الألم. واش نقدر نسولك: واش انت كبير، ولا ولد تحت 12 عام، ولا فوق 65 عام؟ كيفاش كتقيم الوجيعة ديال راسك—خفيفة، متوسطة ولا قوية؟ كاين شي أعراض خرين بحال السخانة، الغثيان، تغيّر فالرؤية، ولا رّقبة مشدودة؟

Time: 2.9 s (stage 1: 1.0 s, stage 2: 1.9 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re experiencing a painful headache. May I ask: are you an adult, a child under 12, or over 65? How would you rate the pain—mild, moderate, or severe? Have you noticed any other symptoms such as fever, nausea, vision changes, or a stiff neck?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** قعد فواحد الغرفة هادئة ومضلمة وشرب الما بزاف. تقدر تاخد دوا مسكن من الصيدلية بحال الباراسيتامول (500 ملغ–1 غ كل 4–6 سوايع، أقصى جرعة 4 غ فاليوم) ولا الإيبوبروفين (200–400 ملغ كل 6–8 سوايع، أقصى جرعة 1.2 غ فاليوم) إلا ماكانش عندك موانع. ما تشربش الكحول، ما تاكلش، وقَلّص الوقت قدام الشاشة حتى يهدى الوجع. إلى شدّ الصداع بزاف، ولا جا معاه الحمى، ولا الغثيان، ولا تغيّر فالرؤية، ولا رقبك شدّ، ولا بقى كثر من ثلاث سمانات، سير عند الطبيب فورا. إلى عندك أمراض مزمنة ولا كتستعمل أدوية خرين، سول الصيدلي ولا الطبيب قبل ما تاخد المسكن.

Time: 3.0 s (stage 1: 1.0 s, stage 2: 2.0 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Rest in a quiet, dim room and drink plenty of water. You can take an over‑the‑counter analgesic such as paracetamol (500 mg–1 g every 4–6 h, max 4 g per day) or ibuprofen (200–400 mg every 6–8 h, max 1.2 g per day) if you have no contraindications. Avoid alcohol, skip meals, and limit screen time until the pain eases. If the headache becomes severe, is accompanied by fever, nausea, visual changes, stiff neck, or lasts more than three weeks, seek medical attention promptly. If you have any chronic conditions or are on other medicines, check with a pharmacist or doctor before taking pain relievers.

</details>

## 19b. Ear pain (Arabic script)

**Question:** ودني كاضرني بزاف هادي يومين

### Turn 1

**Darija answer:** سمح ليا سمعك كيوجعك. واش تقدر تقولي شنو العمر ديالك (ولد تحت 12 عام، كبير ولا فوق 65 عام) و شحال شدة الألم—خفيف، متوسط ولا قوي؟

Time: 1.8 s (stage 1: 0.4 s, stage 2: 1.4 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry your ear is hurting. Could you tell me your age group (child under 12, adult, or over 65) and how severe the pain feels—mild, moderate, or severe?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** إلى كان عندك وجيعة ودن متوسطة كاتدوم يومين وعندك 30 عام وصحي، بدا بالعناية البسيطة ديالك. خذ دواء مسكن من الصيدلية بحال باراسيتامول ولا إيبوبروفين كيف مكتوب فالباكيت، ودير كمبريس دافي وناشف على ودن البرّا 10‑15 دقيقة شحال ما بغيتي فاليوم. خليك خلى الودن ناشفة—ما تدخنش للما، ما تستعملش قطرات للودن، ولا تحط القطن فالأذن. إلا جاك السخانة، ولا خرج شي سوايل، ولا الوجيعة تزادت، ولا سمعك بدا يطيح، ولا الألم بقا كاين أكثر من شوية أيام، سير عند طبيب يدير لك فحص للودن ويمكن يعطيك دوا (مثلاً مضاد حيوي إذا كان عدوى). إلا حسيت بألم فجائي قوي، ولا دوخة، ولا ضعف ف الوجه، خصك تمشي للطوارئ فحالة طارئة.

Time: 2.7 s (stage 1: 0.9 s, stage 2: 1.8 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

For a moderate ear ache lasting two days in a healthy 30‑year‑old, start with simple self‑care. Take an over‑the‑counter pain reliever such as paracetamol or ibuprofen as directed on the package, and apply a warm, dry compress to the outer ear for 10–15 minutes a few times a day. Keep the ear dry—avoid swimming, ear drops, or inserting cotton buds. If you develop fever, drainage, worsening pain, hearing loss, or the discomfort persists beyond a few more days, see a doctor for an ear examination and possible prescription (e.g., antibiotics for an infection). If you notice sudden severe pain, vertigo, or facial weakness, seek urgent medical attention.

</details>

## 20a. Muscle cramps (Franco-Arabic)

**Question:** 9bila knt kanjri ou mni dkhlt ldar kan7s bles cramps lfkhd dyali

### Turn 1

**Darija answer:** سمح ليا إلا كنتي ما مرتاحش. واش تقدر تقول ليا شنو السن ديالك (ولد &lt;12، بالغ، ولا كبير ف السن &gt;65)، شحال من الوقت كاين عندك تشنجات ف الظهر، و شحال كتحسّ بيهم من الشدة (خفيف، متوسط، ولا قوي)؟

Time: 2.2 s (stage 1: 0.8 s, stage 2: 1.4 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

I’m sorry you’re uncomfortable. Could you tell me your age group (child &lt; 12, adult, or elderly &gt; 65), how long the back cramps have been present, and how severe they feel (mild, moderate, or severe)?

</details>

**Follow-up reply:** ana kbir, 3ndi 30 3am, lwja3 metwasset, ma3ndi 7ta mard akhor w makanakhod 7ta dwa

### Turn 2 answer (rate this answer)

**Darija answer:** إلى كان عندك تشنجات خفيفة ف الظهر وانت بصحة مزيانة، جرب تحرك بشوية بلا ما تبقى غير ف الفراش—دير مشايات قصيرة وشوية تمدد خفيف يقدرو يعاونوا العضلات يرتاحو.  <br>دير حزمة سخونة ولا دوز دش سخون على البلاصة اللي كتوجعك 15 حتى 20 دقيقة، مرة ولا جوج ف النهار.  <br>مسكنات بحال الإيبوبروفين لي كتلقاه ف الصيدلية (إلا ما عندكش قرحة ف المعدة ولا مشاكل ف الكلى) ولا الباراسيتامول يقدرو ينقصو الوجيعة والالتهاب؛ تبع الجرعة المكتوبة على العلبة.  <br>حافظ على وضعية مزيانة وانت جالس ولا واقف، ما تشدش حوايج ثقيلة، واستعمل فراش مريح يدعم الظهر.  <br>إلا زادت الوجيعة، ولا مشات للرجليك، ولا حسيت بخدر ولا تنميل، ولا لقيتي صعوبة ف التحكم ف البول ولا ف الغائط، سير عند الطبيب ف أقرب وقت.  <br>إلا ما كانش هكا، راقب الوضعية شوية أيام؛ إلا ما تحسنتش من بعد سيمانة، دير موعد مع الطبيب ديالك باش يشوفو الحالة مزيان.

Time: 3.3 s (stage 1: 1.1 s, stage 2: 2.2 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

For moderate back cramps in a healthy adult, try gentle movement rather than staying in bed—short walks and light stretching can help the muscles relax. Apply a warm pack or a warm shower to the painful area for 15‑20 minutes a few times a day. Over‑the‑counter ibuprofen (if you have no stomach ulcer or kidney issues) or paracetamol can reduce pain and inflammation; follow the dosing instructions on the package. Maintain good posture while sitting or standing, avoid heavy lifting, and use a supportive mattress. If the pain worsens, spreads to your legs, causes numbness, tingling, or you notice difficulty controlling bladder or bowels, seek medical attention promptly. Otherwise, monitor for a few days; if it hasn’t improved after a week, book a visit with your doctor for further evaluation.

</details>

## 20b. Muscle cramps (Arabic script)

**Question:** قبيلة كنت كنجري و مني دخلت للدار كنحس بالكرومب فالفخد ديالي

### Turn 1

**Darija answer:** عافاك قول ليا شنو العمر ديالك (ولد تحت 12 عام، بالغ، ولا فوق 65 عام)، شحال من الوقت كاين عندك تشنج فالفخذ، وشنو القوة ديال الألم (خفيف، متوسط، ولا قوي)؟

Time: 2.3 s (stage 1: 1.3 s, stage 2: 1.1 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

Can you tell me your age group (child under 12, adult, or over 65), how long the thigh cramp has been present, and how severe it feels (mild, moderate, or severe)?

</details>

**Follow-up reply:** أنا كبير، عندي 30 عام، الوجع متوسط، ما عندي حتى مرض آخر و ما كناخد حتى دوا

### Turn 2 answer (rate this answer)

**Darija answer:** شحال من الوقت ونتا كتعيش هاد التشنج فالفخذ—غير اليوم، ولا شي أيام، ولا كثر من هكا؟

Time: 1.7 s (stage 1: 1.1 s, stage 2: 0.6 s)

Retries: 0 (stage 1: 0, stage 2: 0)

<details>
<summary>English medical answer (stage 1)</summary>

How long have you been experiencing this thigh cramp—just today, for a few days, or longer?

</details>
