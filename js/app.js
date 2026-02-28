

//--------------------

// 1. بيانات نظام وصف الموقع
const constructionTypes = [
    // مباني
    { label: "مبنى مكتمل التشطيب", icon: "fa-building" },
    { label: "مبنى خرساني (هيكل فقط)", icon: "fa-building-columns" },
    { label: "جمالون معدني", icon: "fa-warehouse" },
    { label: "مكتب إداري", icon: "fa-briefcase" },
    { label: "محل / وحدة تجارية", icon: "fa-store" },
    { label: "ورشة فنية / صناعية", icon: "fa-tools" },
    // أراضي
    { label: "أرض فضاء", icon: "fa-map" },
    { label: "أرض صحراوية", icon: "fa-mountain-sun" },
    { label: "أرض زراعية", icon: "fa-seedling" },
	{ label: "مزرعة/أحواض", icon: "fa-water" },
    // مواقع مفتوحة ومنشآت خفيفة
    { label: "ساحة مفتوحة", icon: "fa-expand" },
    { label: "موقع تحت الإنشاء", icon: "fa-person-digging" },
    { label: "منشأة مؤقتة", icon: "fa-tents" }
];

const facilityData = {
    infra: [
        { name: "كهرباء قوى", icon: "fa-bolt" },
        { name: "مياه عمومية", icon: "fa-tint" },
        { name: "صرف صحي", icon: "fa-faucet" },
        { name: "غاز طبيعي", icon: "fa-burn" }
    ],

    safety: [
        { name: "سور خارجي", icon: "fa-border-all" },
        { name: "نظام إطفاء حريق", icon: "fa-fire-extinguisher" },
        { name: "كاميرات مراقبة", icon: "fa-video" },
        { name: "أمن وحراسة", icon: "fa-user-shield" }
    ],

    finish: [
        { name: "أرضيات مكتملة", icon: "fa-square" },
        { name: "دهانات كاملة", icon: "fa-paint-brush" },
        { name: "تهوية صناعية", icon: "fa-fan" },
        { name: "تكييف مركزي", icon: "fa-wind" }
    ],

    special: [
        { name: "بئر مياه", icon: "fa-fill-drip" },
        { name: "طاقة شمسية", icon: "fa-sun" },
        { name: "عنابر تربية", icon: "fa-home" },
        { name: "أحواض سمكية", icon: "fa-fish" }

   ]
};





let currentConst = "";
let selectedProductionStages = [];

// --- وظائف وصف الموقع ---

function initSiteDescriptionSystem() {
    const grid = document.getElementById('constructionGrid');
    grid.innerHTML = constructionTypes.map(t => `
        <div class="col-4 col-md-3">
            <div class="const-type-card" onclick="selectConst('${t.label}', this)">
                <i class="fas ${t.icon}"></i><span>${t.label}</span>
            </div>
        </div>
    `).join('');

    Object.keys(facilityData).forEach(key => {
        const container = document.getElementById(`group-${key}`);
        container.innerHTML = facilityData[key].map(f => `
            <div class="facility-chip" onclick="toggleFacility(this)">
                <i class="fas ${f.icon}"></i> ${f.name}
            </div>
        `).join('');
    });
}

function selectConst(label, el) {
    document.querySelectorAll('.const-type-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    currentConst = label;
    document.getElementById('specialized-box').style.display = (label.includes('مزرعة') || label.includes('فضاء')) ? 'block' : 'none';
    updateSiteNarrative();
}

function toggleFacility(el) {
    el.classList.toggle('active');
    updateSiteNarrative();
}

function updateSiteNarrative() {
    const activeChips = Array.from(document.querySelectorAll('.facility-chip.active')).map(c => c.innerText.trim());
    let text = currentConst ? `تبين للجنة أن الموقع عبارة عن (${currentConst}). ` : `بمعاينة موقع ممارسة النشاط؛ `;
    
    if (activeChips.length > 0) {
        text += `والموقع مجهز بالكامل بكافة المرافق والتجهيزات اللازمة، والتي تشمل: (${activeChips.join(' - ')}). `;
    } else {
        text += `وتبين أن الموقع لا يزال تحت التجهيز ولم يتم استكمال كافة المرافق الفنية به بعد. `;
    }
    document.getElementById('siteNarrative').value = text;
}

// --- وظائف العملية الإنتاجية ---

function initProductionFlow(activity) {
    const wrapper = document.getElementById('productionFlowWrapper');
    if (!wrapper) return;
    
    wrapper.innerHTML = '';
    selectedProductionStages = [];
    
    const currentActivity = activity || document.getElementById('activityTypeSelect').value || "industrial";
    const stages = productionStagesDB[currentActivity] || productionStagesDB["industrial"] || [];

    stages.forEach((s, i) => {
        const card = document.createElement('div');
        card.className = 'stage-card-modern';
        card.id = `stage_card_${i}`;
        card.innerHTML = `
            <button class="btn-add-note" onclick="event.stopPropagation(); addStageNote(${i})" title="إضافة ملاحظة فنية">
                <i class="fas fa-edit"></i>
            </button>
            <div class="step-number">${i + 1}</div>
            <div class="stage-name">${s}</div>
            <div id="note_${i}" class="note-preview" style="display:none;"></div>
        `;
        card.onclick = () => toggleStage(i, s);
        wrapper.appendChild(card);
    });

    // تحديث العنوان ليظهر بوضوح في سطر مستقل
    const actObj = masterActivityDB.find(a => a.value === currentActivity);
    if(actObj) {
        document.getElementById('productionFlowHeader').innerHTML = 
            `<i class="fas fa-project-diagram me-2"></i> مسار العمل لـ: <div class="activity-name-badge">${actObj.text}</div>`;
    }
}

// دالة إضافة الملاحظة بشكل أجمل
function addStageNote(index) {
    const stage = selectedProductionStages.find(s => s.id === index);
    if (!stage) {
        alert("⚠️ يرجى تفعيل المرحلة أولاً بالضغط عليها قبل إضافة ملاحظة.");
        return;
    }

    const note = prompt("📝 أدخل ملاحظتك الفنية لهذه المرحلة:", stage.note);
    if (note !== null) {
        stage.note = note;
        const noteDiv = document.getElementById(`note_${index}`);
        const card = document.getElementById(`stage_card_${index}`);
        
        if (note.trim() !== "") {
            noteDiv.innerText = note;
            noteDiv.style.display = 'block';
            card.classList.add('has-note');
        } else {
            noteDiv.style.display = 'none';
            card.classList.remove('has-note');
        }
        compileProductionNarrative();
    }
}

function toggleStage(index, name) {
    const card = document.getElementById(`stage_card_${index}`);
    card.classList.toggle('active');
    
    if (card.classList.contains('active')) {
        selectedProductionStages.push({ id: index, name: name, note: "" });
    } else {
        selectedProductionStages = selectedProductionStages.filter(s => s.id !== index);
    }
    compileProductionNarrative();
}

function addStageNote(index) {
    const note = prompt("أدخل ملاحظاتك لهذه المرحلة (مثال: يتم آلياً، تحت المعاينة، توافر الماكينات...):");
    if (note !== null) {
        const stage = selectedProductionStages.find(s => s.id === index);
        if (stage) {
            stage.note = note;
            const noteDiv = document.getElementById(`note_${index}`);
            noteDiv.innerText = `ملاحظة: ${note}`;
            noteDiv.style.display = 'block';
            compileProductionNarrative();
        } else {
            alert("يرجى تفعيل المرحلة أولاً بالضغط عليها.");
        }
    }
}

function compileProductionNarrative() {
    if (selectedProductionStages.length === 0) {
        document.getElementById('productionNarrative').value = '';
        return;
    }

    // ترتيب المراحل حسب تسلسلها الأصلي
    const sorted = [...selectedProductionStages].sort((a, b) => a.id - b.id);
    
    let text = "من خلال المعاينة الميدانية لخطوط الإنتاج والوقوف على طبيعة النشاط، تتلخص الدورة الإنتاجية بالشركة في المراحل المتتابعة الآتية:\n";
    
    sorted.forEach((s, i) => {
        text += `${i + 1}. مرحلة (${s.name})${s.note ? ': حيث تبين للجنة ' + s.note : ''}.\n`;
    });
    
    text += "\nوخلصت اللجنة إلى أن العملية الإنتاجية تتم بشكل منتظم وتتوافق مع المواصفات الفنية المعتمدة لهذا النشاط.";
    document.getElementById('productionNarrative').value = text;
}

// ربط المحرك بباقي النظام
document.addEventListener('DOMContentLoaded', () => {
    initSiteDescriptionSystem();
    if (typeof masterActivityDB !== 'undefined') {
        masterActivityDB.forEach(act => {
            licenseDB[act.value] = act.details;
            productionStagesDB[act.value] = act.productionStages;
            technicalNotesDB[act.value] = act.technicalNotes;
            licenseFieldsDB[act.value] = act.dynamicLicenseFields;
        });
    }

    // الآن استدعاء الدوال لملء الواجهة
    if (typeof initSiteDescriptionSystem === 'function') {
        initSiteDescriptionSystem();
    }
    
    // استدعاء المراحل (افتراضياً لنشاط صناعي مثلاً)
    if (typeof initProductionFlow === 'function') {
        initProductionFlow('industrial'); 
    }
	
    // ملء قائمة Override
    // الكود الجديد والمصحح لعرض الأسماء باللغة العربية
const override = document.getElementById('activityOverride');
if (override && typeof masterActivityDB !== 'undefined') {
    // نقوم بمسح الخيارات الحالية (باستثناء أول خيار)
    override.innerHTML = '<option value="">   -                  تغيير نوع النشاط  ..............</option>';
    
    // نمر على قاعدة البيانات الرئيسية لنحصل على الاسم العربي (text) والقيمة (value)
    masterActivityDB.forEach(act => {
        const opt = document.createElement('option');
        opt.value = act.value; // القيمة البرمجية (للبحث في الداتا)
        opt.innerText = act.text; // النص الذي يظهر للمستخدم (بالعربية)
        override.appendChild(opt);
    });
    console.log("✅ تم تحديث قائمة المراحل الإنتاجية بالأسماء العربية");
}

    // مراقبة تغيير النشاط في الشاشة الرابعة لتحديث السابعة تلقائياً
    const mainActivitySelect = document.getElementById('activityTypeSelect');
    if (mainActivitySelect) {
        mainActivitySelect.addEventListener('change', function() {
            initProductionFlow(this.value);
        });
    }
});

//--------------------------------



    /* 1. التنقل بين الصفحات */
    function nextStep(stepNumber) {
        document.querySelectorAll('.step-section').forEach(el => el.classList.remove('active'));
        document.getElementById('step' + stepNumber).classList.add('active');
        window.scrollTo(0, 0);
        
        // عند الانتقال إلى الشاشة الخامسة، نقوم بتحديث العنوان المكرر
        if (stepNumber === 8) {
                
            updateRepeatedAddress();
        }
    }

    /* 2. منطق الضرائب المقسمة */
    function moveFocus(currentInput, nextInputId) {
        if (currentInput.value.length >= 3) {
            document.getElementById(nextInputId).focus();
        }
    }

    function syncVatNumber() {
        if (document.getElementById('vatCheck').checked) {
            const t1 = document.getElementById('tax1').value;
            const t2 = document.getElementById('tax2').value;
            const t3 = document.getElementById('tax3').value;
            if(t1 || t2 || t3) {
                document.getElementById('vatNumber').value = t1 + '-' + t2 + '-' + t3;
            } else {
                document.getElementById('vatNumber').value = "";
            }
        }
    }

    function toggleVatSection() {
        const isChecked = document.getElementById('vatCheck').checked;
        const vatSection = document.getElementById('vatSection');
        vatSection.style.display = isChecked ? 'block' : 'none';
        if (isChecked) {
            syncVatNumber();
        } else {
            document.getElementById('vatNumber').value = "";
        }
    }

    /* 3. المساعدات العامة */
    function toggleSection(id, isChecked) {
        document.getElementById(id).style.display = isChecked ? 'block' : 'none';
    }

    function toggleRepDetails() {
        const isChecked = document.getElementById('includeRep').checked;
        document.getElementById('repDetails').style.display = isChecked ? 'block' : 'none';
    }

    /* 4. وظائف إضافة الصفوف الديناميكية (آلات وخامات) */
/* ==========================================================
   تعديل احترافي: جعل المعاينة الميدانية مرآة للفواتير فقط
   ========================================================== */

// 1. دالة إنشاء صف الآلات (نسخة العرض فقط للمعاينة)
function addMachineRow() {
    const container = document.getElementById('machinesContainer');
    const newDiv = document.createElement('div');
    newDiv.className = 'machine-row border p-3 mb-3 bg-white shadow-sm rounded';
    
    // ملاحظة: الحقول القادمة من الفاتورة تم جعلها (readonly) مع خلفية رمادية فاتحة
    // تم إزالة زر الحذف لمنع الحذف من هذه الشاشة
    newDiv.innerHTML = `
        <div class="row g-3 position-relative">
            <div class="col-12 col-md-3">
                <label class="small text-muted mb-1">اسم الآلة (من الفاتورة)</label>
                <input type="text" class="form-control bg-light fw-bold" readonly placeholder="اسم الآلة">
            </div>
            <div class="col-6 col-md-2">
                <label class="small text-muted mb-1">العدد</label>
                <input type="number" class="form-control bg-light fw-bold" readonly placeholder="العدد">
            </div>
            <div class="col-6 col-md-2">
                <label class="small text-muted mb-1">مصدر الآلة</label>
                <select class="form-select border-primary">
                    <option value="" selected disabled>اختر </option>
                    <option value="استيراد">استيراد</option>
                    <option value="محلي">محلي</option>
                </select>
            </div>
            <div class="col-6 col-md-2">
                <label class="small text-muted mb-1">القيمة</label>
                <input type="text" class="form-control bg-light" readonly placeholder="القيمة">
            </div>
            <div class="col-6 col-md-3">
                <label class="small text-muted mb-1">التاريخ</label>
                <input type="date" class="form-control bg-light" readonly>
            </div>
            <!-- تم إزالة عمود زر الحذف بالكامل للحفاظ على سلامة البيانات -->
        </div>`;
    container.appendChild(newDiv);
}

// 2. دالة إنشاء صف الخامات (نسخة العرض فقط للمعاينة)
function addMaterialRow() {
    const container = document.getElementById('materialsContainer');
    const newDiv = document.createElement('div');
    newDiv.className = 'material-row border p-3 mb-3 bg-white shadow-sm rounded';
    
    newDiv.innerHTML = `
        <div class="row g-3">
            <div class="col-12 col-md-4">
                <label class="small text-muted mb-1">اسم الخامة (من الفاتورة)</label>
                <input type="text" class="form-control bg-light fw-bold" readonly placeholder="اسم الخامة">
            </div>

            <div class="col-6 col-md-2">
                <label class="small text-muted mb-1">الكمية</label>
                <input type="number" class="form-control bg-light fw-bold" readonly placeholder="0">
            </div>
            
            <div class="col-6 col-md-3">
                <label class="small text-muted mb-1">وحدة القياس (تحدد بالمعاينة)</label>
                <select class="form-select border-primary">
                    <option value="">اختر..</option>
                    <option>كيلو</option><option>طن</option><option>لتر</option><option>لتر3</option><option>قطعة</option><option>وحدة</option><option>سم3</option>
                </select>
            </div>	

            <div class="col-6 col-md-3">
                <label class="small text-muted mb-1">القيمة جـم</label>
                <input type="text" class="form-control bg-light" readonly placeholder="0.00">
            </div>
            
            <div class="col-6 col-md-4">
                <label class="small text-muted mb-1">مصدر الخامة (يحدد بالمعاينة)</label>
                <select class="form-select border-primary">
                    <option value="">اختر..</option>
                    <option>محلي</option><option>استيراد</option>
                </select>
            </div>
            
            <div class="col-6 col-md-4">
                <label class="small text-muted mb-1">الفترة (تحدد بالمعاينة)</label>
                <select class="form-select border-primary">
                    <option value="">اختر..</option>
                    <option>يوم</option><option>شهر</option><option>سنة</option>
                </select>
            </div>
            
            <div class="col-12 col-md-4">
                 <label class="small text-muted mb-1">تصنيف الخامة (للمعاينة)</label>
                 <!-- تمت إضافة border-primary هنا 👇 -->
                 <input class="form-control border-primary" list="material-options-readonly" placeholder="تصنيف الخامة...">
                 <datalist id="material-options-readonly">
        <option value="1. مواد حيوية (نباتي/خشبي/ورق)"></option>
        <option value="2. مواد حيوية (عضوي حيواني/بشري)"></option>
        <option value="6. أقمشة/خيوط (طبيعية)"></option>
        
        <option value="8. أتربة/أحجار/صخور خام"></option>
        <option value="9. مواد البناء الأساسية (محاجر/إسمنت/جص)"></option>
        <option value="3. معادن/فلزات وسبائكها"></option>
        <option value="10. زجاج وسيراميك"></option>

        <option value="4. بترولي/بوليمر (بلاستيك)"></option>
        <option value="5. أقمشة/خيوط (صناعي)"></option>
        <option value="7. زيوت/شحوم (بترولية/صناعية)"></option>
        <option value="13. مواد مركبة وهيكلية متخصصة"></option>
        
        <option value="11. أملاح/كيماويات/أحماض/قواعد"></option>
        <option value="12. غازات صناعية ومخاليطها"></option>

        <option value="14. أجهزة إلكترونية/كهربائية (منتج مجمع)"></option>
        <option value="15. بطاريات ومواد تخزين الطاقة"></option>
        <option value="16. مركبات (وحدات نقل مجمعة)"></option>

        <option value="17. المواد الخطرة (النفايات المتخصصة)"></option>
        <option value="18. النفايات الطبية"></option>
                 </datalist>
            </div>
        </div>`;
    
    container.appendChild(newDiv);
}
// 3. تحديث دالة الربط لتعمل مع الدوال الجديدة
// هذه الدالة تضمن أن الأزرار في شاشة الفواتير (5) هي التي تنشئ الصفوف في (7)
function addMachineRowManual() {
    addMachineRow(); // تستدعي الدالة المعدلة أعلاه
}

function addMaterialRowManual() {
    addMaterialRow(); // تستدعي الدالة المعدلة أعلاه
}

    // New function for dynamic energy rows
    function addEnergyRow() {
        const container = document.getElementById('energyContainer');
        const newRow = document.createElement('div');
        newRow.className = 'row g-2 mb-2 energy-row border-top pt-2';
        newRow.innerHTML = `
            <div class="col-md-3">
                <label class="info-label small">نوع الطاقة</label>
                <select class="form-select form-select-sm">
                    <<option value="">-- اختر --</option>
                    <option>كهرباء</option>
                    <option>كيروسين</option>
                    <option>بنزين</option>
                    <option>سولار</option>
                    <option>غاز طبيعي / غاز مسال</option>
                    <option>فحم حجري</option>
                    <option>مازوت / زيت الوقود</option>
                    <option>طاقة متجددة (عام)</option>
                    <option>طاقة شمسية</option>
                    <option>طاقة الرياح</option>
                    <option>طاقة مائية / كهرومائية</option>
                    <option>طاقة الكتلة الحيوية</option>
                    <option>طاقة حرارية أرضية</option>
                    <option>طاقة نووية</option>
                    <option>هيدروجين</option>
                    <option>بخار</option>
                               </select>

            </div>
            <div class="col-md-3">
                <label class="info-label small">متوسط الاستهلاك</label>
                <input type="number" class="form-control form-control-sm" placeholder="الرقم">
            </div>
            <div class="col-md-2">
                <label class="info-label small">الوحدة</label>
                <select class="form-select form-select-sm">
                        <option>كيلو</option><option>طن</option><option>لتر</option><option>لتر3</option><option>قطعة</option><option>وحدة</option><option>سم3</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="info-label small">القيمة (جنيهاً)</label>
                <input type="number" class="form-control form-control-sm" placeholder="المبلغ">
            </div>
            <div class="col-md-1 d-flex align-items-end">
                <button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="removeRow(this)">-</button>
            </div>
        `;
        container.appendChild(newRow);
    }

    function removeRow(button) {
        button.closest('.energy-row').remove();
    }

    /* 5. قاعدة بيانات المدن لكل محافظة */
    const citiesDB = {
    "القاهرة": [
        "القاهرة الجديدة", "الشروق", "المنيل","مدينة نصر", "مصر القديمة", "مصر الجديدة", "الزمالك", 
        "المعادي", "المقطم", "العبور", "15 مايو", "السلام", "بدر", "الوايلي",
        "الزاوية الحمراء", "الدراسة", "الشرابية", "حدائق القبة", "حلوان"
    ],
    
    "الجيزة": [
        "الدقي", "المهندسين", "العجوزة", "أكتوبر", "الشيخ زايد", "6 أكتوبر", 
        "الهرم", "البدرشين", "الصف", "أوسيم", "كرداسة", "إمبابة", "الوراق",
        "العمرانية", "المنيب", "أبو النمرس", "ناهيا", "الحرانية"
    ],
    
    "الإسكندرية": [
        "المنتزه", "سموحة", "سيدي جابر", "اللبان", "العصافرة", "المعمورة", 
        "برج العرب", "برج العرب الجديدة", "المنشية", "الجمرك", "الرأس السوداء",
        "كرموز", "المندرة", "الظاهرية", "العجمي", "المكس", "ابو قير"
    ],
    
    "الدقهلية": [
        "المنصورة", "طلخا", "ميت غمر", "دكرنس", "أجا", "منية النصر", 
        "السنبلاوين", "بلقاس", "شربين", "المطرية", "تمي الأمديد", "بنى عبيد",
        "الجمصة", "كفر سعد", "نبروه", "الجمالية"
    ],
    
    "البحيرة": [
        "دمنهور", "كفر الدوار", "رشيد", "إدكو", "أبو المطامير", "حوش عيسى", 
        "شبراخيت", "كوم حمادة", "وادي النطرون", "ابو حمص", "الدلنجات", "بدر",
        "المحمودية", "إيتاي البارود", "حوش عيسى"
    ],
    
    "الغربية": [
        "طنطا", "المحلة الكبرى", "زفتى", "سمنود", "كفر الزيات", "بسيون", 
        "قطور", "سنبلاوين", "المشتول", "بشبيش", "صفط تراب", "ميت الحارون"
    ],
    
    "المنوفية": [
        "شبين الكوم", "منوف", "السادات", "أشمون", "الباجور", "قويسنا", 
        "بركة السبع", "تلا", "الشهداء", "سرس الليان", "أبو حريز", "ميت العامل"
    ],
    
    "القليوبية": [
        "بنها", "شبرا الخيمة", "قليوب", "الخانكة", "كفر شكر", "طوخ", 
        "القناطر الخيرية", "العبور", "مسطرد", "أبو زعبل", "خانكة", "سنديون"
    ],
    
    "الشرقية": [
        "الزقازيق", "العاشر من رمضان", "بلبيس", "أبو حماد", "ههيا", "فاقوس", 
        "صان الحجر", "مشتول السوق", "كفر صقر", "أبو كبير", "الحسينية", "ديرب نجم",
        "منيا القمح", "الإبراهيمية", "هئيت"
    ],
    
    "كفر الشيخ": [
        "كفر الشيخ", "دسوق", "فوه", "مطوبس", "بلطيم", "الحامول", 
        "سيدي سالم", "الرياض", "بيلا", "سيدي غازي", "قلين", "الحامول"
    ],
    
    "دمياط": [
        "دمياط", "فارسكور", "الزرقا", "كفر سعد", "روض الفرج", "السرو",
        "عزبة البرج", "ميت أبو غالب", "كفر البطيخ", "شطا", "الرهاوية"
    ],
    
    "بورسعيد": [
        "بورسعيد", "بورفؤاد", "الضواحي", "المناخ", "العرب", "الزهور"
    ],
    
    "الإسماعيلية": [
        "الإسماعيلية", "فايد", "القنطرة شرق", "القنطرة غرب", "التل الكبير",
        "أبو صوير", "القصاصين", "التنفيذية", "المحطة الجديدة"
    ],
    
    "السويس": [
        "السويس", "الأربعين", "عتاقة", "الجناين", "فيصل", "المصنع",
        "الصلبية", "أبو درويش", "أبو عطوة"
    ],
    
    "الفيوم": [
        "الفيوم", "طامية", "سنورس", "إطسا", "يوسف الصديق", "ابشواي",
        "الحادقة", "السيالة", "كوم أوشيم", "منشأة عبد الله"
    ],
    
    "بني سويف": [
        "بني سويف", "ببا", "الفشن", "سمسطا", "الواسطى", "ناصر",
        "اهناسيا", "دشاش", "مقبل", "قمن العروس"
    ],
    
    "المنيا": [
        "المنيا", "ملوي", "دير مواس", "مغاغة", "بني مزار", "مطاي", 
        "سمالوط", "العدوة", "أبو قرقاص", "مطروس", "بركة حسن"
    ],
    
    "أسيوط": [
        "أسيوط", "ديروط", "منفلوط", "أبنوب", "أبو تيج", "الغنايم", 
        "ساحل سليم", "البداري", "صدفا", "القوصية", "أسيوط الجديدة"
    ],
    
    "سوهاج": [
        "سوهاج", "أخميم", "البلينا", "مركز سوهاج", "المنشأة", "دار السلام", 
        "جرجا", "طما", "الكوثر", "المراغة", "جهينة", "طهطا"
    ],
    
    "قنا": [
        "قنا", "قفط", "نقادة", "دشنا", "فرشوط", "قوص", "أبو تشت",
        "نجع حمادي", "الوقف", "دندرة", "نقادة الجديدة"
    ],
    
    "الأقصر": [
        "الأقصر", "الطود", "إسنا", "البياضية", "الزينية", "أرمنت",
        "القرنة", "الديدامون", "المنشية"
    ],
    
    "أسوان": [
        "أسوان", "دراو", "كوم أمبو", "نصر النوبة", "إدفو", "ابو الريش",
        "كلابشة", "السلسلة", "البصيلية", "العليقات"
    ],
    
    "الوادي الجديد": [
        "الخارجة", "الداخلة", "الفرافرة", "باريس", "بلاط", "موط",
        "القصر", "المنيرة", "شرق العوينات"
    ],
    
    "مطروح": [
        "مرسى مطروح", "الحمام", "العلمين", "الضبعة", "سيوة", "النقبة",
        "السلوم", "النجيلة", "كليوباترا"
    ],
    
    "البحر الأحمر": [
        "الغردقة", "رأس غارب", "سفاجا", "القصير", "مرسى علم", "الشلاتين",
        "حلايب", "الجنوب", "القصير الجديدة"
    ],
    
    "شمال سيناء": [
        "العريش", "الشيخ زويد", "رفح", "بئر العبد", "الحسنة", "نخل",
        "القريعة", "الميدان", "الروضة"
    ],
    
    "جنوب سيناء": [
        "شرم الشيخ", "دهب", "نويبع", "طابا", "رأس سدر", "أبو رديس", 
        "أبو زنيمة", "سانت كاترين", "الطور", "شاسف", "وادي فيران"
    ]
};

    /* 6. تحديث قائمة المدن بناءً على المحافظة المختارة */
    function updateCities() {
        const governorateSelect = document.getElementById('governorateSelect');
        const citySelect = document.getElementById('citySelect');
        const selectedGovernorate = governorateSelect.value;
        
        // مسح القائمة الحالية
        citySelect.innerHTML = '<option value="">-- اختر المحافظة أولا --</option>';
        
        // إذا تم اختيار محافظة، قم بملء قائمة المدن
        if (selectedGovernorate && citiesDB[selectedGovernorate]) {
            citiesDB[selectedGovernorate].forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        }
    }

    /* 7. تحديث العنوان المكرر في الشاشة الخامسة */
    function updateRepeatedAddress() {
        const governorate = document.getElementById('governorateSelect').value;
        const city = document.getElementById('citySelect').value;
        const addressDetails = document.getElementById('addressDetails').value;
        
        let addressText = '';
        
        if (addressDetails) {
            addressText += addressDetails;
        }
        
        if (city) {
            addressText += (addressText ? '، ' : '') + city;
        }
        
        if (governorate) {
            addressText += (addressText ? '، ' : '') + governorate;
        }
        
        document.getElementById('repeatedAddress').textContent = addressText || 'لم يتم تحديد العنوان بعد';
    }

 

    /* 9. بيانات الشركات */
    const companiesDB = {
        "2025": {
            date: "01-05-2025",
            headName: "أحمد محمد سيد زكى", headCode: "1055", headPhone: "01025896341",
            memberName: "طارق عصام امين", memberCode: "3295", memberPhone: "01063003278",
            name: "كيخيا للصناعات النسيجية",
            committee: "موقف تنفيذي -  ميدانية - حكومية",
            legal: "ذات مسئولية محدودة", law: "قانون 72 لسنة 2017", capital: "10000",
            activity: "إقامة وتشغيل مصنع لتصنيع الانسجة وصباغة وتجهيز.",
            address: "العبور - المنطقة الصناعية الأولى - قطعة 8",
            certNo: "24-319086-1-01", certDate: "05-01-2022",
			companyRepName: "محمد ابراهيم كخيا",
            companyRepPhone: "01263003200",
            prRepName: "ممثل العلاقات العامة",
            prRepPhone: "01063003278"
        },
        "2026": {
            date: "15-06-2026",
            headName: "محسن كمال الدين", headCode: "5589", headPhone: "01236547890",
            memberName: "هاني رمزي فؤاد", memberCode: "3341", memberPhone: "01098765432",
            name: "عبدالهادي أحمد مشهدي (سيلفرتكس)",
            committee: "بدء نشاط", legal: "تضامن", law: "قانون 72 لسنة 2017", capital: "584004",
            activity: "إقامة وتشغيل مصنع لتصنيع خيوط البولي بروبلين.",
            address: "شبرا الخيمة - شارع حسن متولي - عقار 11",
            certNo: "24-554120-2-08", certDate: "10-03-2023",
			companyRepName: "عبدالهادى احمد",
            companyRepPhone: "0115420233",
            prRepName: "ممثل العلاقات العامة",
            prRepPhone: "01063003278"
        },
        "2027": {
            date: "20-08-2027",
            headName: "خالد عبد الرحمن", headCode: "9901", headPhone: "01555444333",
            memberName: "ياسر جلال الدين", memberCode: "7720", memberPhone: "01112223334",
            name: "السورية الألمانية للتجارة",
            committee: "موقف تنفيذي -  مكتبية - فنية", legal: "مساهمة", law: "قانون 159 لسنة 1981", capital: "50000",
            activity: "الاستيراد والتصدير.",
            address: "شبرا الخيمة - شارع إبراهيم عبد الجليل - عقار 15",
            certNo: "24-112233-9-05", certDate: "01-05-2024",
			companyRepName: "حسين السوري",
            companyRepPhone: "01163003278",
            prRepName: "ممثل العلاقات العامة",
            prRepPhone: "01063003278"
        }
    };

    function loadCompanyData() {
    const decisionNo = document.getElementById('decisionNoInput').value;
    const companyData = companiesDB[decisionNo];
    
    if (companyData) {
        // ملء بيانات القرار
        document.getElementById('decisionDateLabel').innerHTML = `<strong>الصادر في:</strong> ${companyData.date}`;
        
        // ملء بيانات رئيس اللجنة وعضوها
        document.getElementById('headName').value = companyData.headName;
        document.getElementById('headCode').value = companyData.headCode;
        document.getElementById('headPhone').value = companyData.headPhone;
        document.getElementById('memberName').value = companyData.memberName;
        document.getElementById('memberCode').value = companyData.memberCode;
        document.getElementById('memberPhone').value = companyData.memberPhone;
        
        // ملء بيانات الشركة
        document.getElementById('companyName').value = companyData.name;
        document.getElementById('committeeType').value = companyData.committee;
        document.getElementById('legalForm').value = companyData.legal;
        document.getElementById('capital').value = companyData.capital;
        document.getElementById('law').value = companyData.law;
        document.getElementById('activity').value = companyData.activity;
        document.getElementById('address').value = companyData.address;
        
        // تحديث نص شهادة التأسيس
        document.getElementById('certText').innerHTML = `صدرت شهادة الهيئة المرخصة بتأسيس الشركة محل العرض برقم <span class="text-danger">${companyData.certNo}</span> وتاريخ <span class="text-danger">${companyData.certDate}</span>`;
        
        // ⭐⭐ التعديل الجديد: ملء بيانات ممثل الشركة ⭐⭐
        document.getElementById('companyRepName').value = companyData.companyRepName;
        document.getElementById('companyRepPhone').value = companyData.companyRepPhone;
        
        // ⭐⭐ التعديل الجديد: ملء بيانات ممثل العلاقات العامة ⭐⭐
        document.getElementById('prRepName').value = companyData.prRepName;
        document.getElementById('prRepPhone').value = companyData.prRepPhone;
        
        // تحديث زر الواتساب بعد ملء البيانات
        updateWhatsAppButton();
    } else {
        // إذا لم يكن هناك بيانات، نعيد الحقول إلى القيم الافتراضية
        resetCompanyData();
    }
}

function resetCompanyData() {
    // نعيد الحقول إلى القيم الافتراضية
    document.getElementById('decisionDateLabel').innerHTML = '';
    
    // بيانات رئيس اللجنة وعضوها
    document.getElementById('headName').value = "اسم افتراضي";
    document.getElementById('headCode').value = "0000";
    document.getElementById('headPhone').value = "01xxxxxxxxx";
    document.getElementById('memberName').value = "اسم افتراضي";
    document.getElementById('memberCode').value = "0000";
    document.getElementById('memberPhone').value = "01xxxxxxxxx";
    
    // بيانات الشركة
    document.getElementById('companyName').value = "";
    document.getElementById('committeeType').value = "";
    document.getElementById('legalForm').value = "";
    document.getElementById('capital').value = "";
    document.getElementById('law').value = "";
    document.getElementById('activity').value = "";
    document.getElementById('address').value = "";
    document.getElementById('certText').innerHTML = 'صدرت شهادة الهيئة المرخصة بتأسيس الشركة محل العرض برقم <span class="text-danger">-----</span> وتاريخ <span class="text-danger">--/--/----</span>';
    
    // ⭐⭐ التعديل الجديد: إعادة تعيين بيانات ممثل الشركة ⭐⭐
    document.getElementById('companyRepName').value = "";
    document.getElementById('companyRepPhone').value = "";
    
    // ⭐⭐ التعديل الجديد: إعادة تعيين بيانات ممثل العلاقات العامة ⭐⭐
    document.getElementById('prRepName').value = "";
    document.getElementById('prRepPhone').value = "";
}


function resetCompanyData() {
    // نعيد الحقول إلى القيم الافتراضية
    document.getElementById('decisionDateLabel').innerHTML = '';
    
    // بيانات رئيس اللجنة وعضوها
    document.getElementById('headName').value = "اسم افتراضي";
    document.getElementById('headCode').value = "0000";
    document.getElementById('headPhone').value = "01xxxxxxxxx";
    document.getElementById('memberName').value = "اسم افتراضي";
    document.getElementById('memberCode').value = "0000";
    document.getElementById('memberPhone').value = "01xxxxxxxxx";
    
    // بيانات الشركة
    document.getElementById('companyName').value = "";
    document.getElementById('committeeType').value = "";
    document.getElementById('legalForm').value = "";
    document.getElementById('capital').value = "";
    document.getElementById('law').value = "";
    document.getElementById('activity').value = "";
    document.getElementById('address').value = "";
    document.getElementById('certText').innerHTML = 'صدرت شهادة الهيئة المرخصة بتأسيس الشركة محل العرض برقم <span class="text-danger">-----</span> وتاريخ <span class="text-danger">--/--/----</span>';
    
    // بيانات ممثل الشركة
    document.getElementById('companyRepName').value = "";
    document.getElementById('companyRepPhone').value = "";
    
    // بيانات ممثل العلاقات العامة
    document.getElementById('prRepName').value = "";
    document.getElementById('prRepPhone').value = "";
}




function updateLicenseRequirements() {
    const type = document.getElementById('activityTypeSelect').value;
    const resultArea = document.getElementById('licenseResultArea');
    
    if (type && licenseDB[type]) {
        document.getElementById('actLicense').innerText = licenseDB[type].act;
        document.getElementById('reqLicense').innerText = licenseDB[type].req;
        document.getElementById('authLicense').innerText = licenseDB[type].auth;
        document.getElementById('reqLocation').innerText = licenseDB[type].loc;
        document.getElementById('legalBasis').innerText = licenseDB[type].leg;
// ==========================================
// معالجة الروابط والأدلة بذكاء (يدعم درايف وروابط الهيئة)
// ==========================================
const guideNameDisplay = document.getElementById('guideNameDisplay');
const guideLinkArea = document.getElementById('guideLinkArea');

// دالة لمعالجة الروابط حسب نوعها بطريقة احترافية
function getSmartLinks(url) {
    let viewUrl = url;
    let downloadUrl = url;

    // 1. معالجة روابط Google Drive
    if (url.includes('drive.google.com/file/d/')) {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            viewUrl = url.includes('/view') ? url.replace('/view', '/preview') : url;
            downloadUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
    } 
    // 2. معالجة باقي الروابط (بما فيها روابط الهيئة .ashx وأي رابط خارجي)
    else {
        // نستخدم عارض جوجل المدمج لكسر حماية التحميل الإجباري من سيرفرات الهيئة
        viewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
        // نحتفظ بالرابط الأصلي لزر التحميل ليعمل كما هو
        downloadUrl = url; 
    }

    return { viewUrl, downloadUrl };
}

let outputHTML = '';

// فحص إذا كان هناك مصفوفة أدلة (أكثر من ملف)
if (licenseDB[type].guides && licenseDB[type].guides.length > 0) {
    guideNameDisplay.innerText = "الأدلة والملفات المرفقة للنشاط:";
    
    outputHTML += '<div class="mt-2">';
    licenseDB[type].guides.forEach((guide) => {
        const links = getSmartLinks(guide.link);
        
        outputHTML += `
            <div class="d-flex align-items-center justify-content-between p-2 mb-2 bg-white border rounded shadow-sm">
                <strong class="text-primary" style="font-size: 0.9rem;"><i class="fas fa-file-pdf me-2"></i> ${guide.name}</strong>
                <div>
                    <a href="${links.viewUrl}" target="_blank" class="btn btn-sm btn-outline-info ms-1" title="عرض الدليل">
                        <i class="fa fa-eye"></i> عرض
                    </a>
                    <a href="${links.downloadUrl}" target="_blank" ${links.downloadUrl !== guide.link ? '' : 'download'} class="btn btn-sm btn-success" title="تحميل الدليل">
                        <i class="fa fa-download"></i> تحميل
                    </a>
                </div>
            </div>`;
    });
    outputHTML += '</div>';
    
    guideLinkArea.innerHTML = outputHTML;

} 
// فحص إذا كان هناك رابط واحد فقط (للتوافق مع البيانات القديمة)
else if (licenseDB[type].link) {
    guideNameDisplay.innerText = licenseDB[type].guid || "دليل النشاط:";
    const links = getSmartLinks(licenseDB[type].link);
    
    outputHTML = `
        <div class="mt-2 d-flex align-items-center">
            <a href="${links.viewUrl}" target="_blank" class="btn btn-sm btn-info ms-2 text-white">
                <i class="fa fa-eye"></i> عرض الدليل
            </a>
            <a href="${links.downloadUrl}" target="_blank" ${links.downloadUrl !== licenseDB[type].link ? '' : 'download'} class="btn btn-sm btn-success">
                <i class="fa fa-download"></i> تحميل الدليل
            </a>
        </div>`;
    
    guideLinkArea.innerHTML = outputHTML;
} 
// في حالة عدم وجود أدلة
else {
    guideNameDisplay.innerText = "لا يوجد أدلة مرفقة حالياً.";
    guideLinkArea.innerHTML = '';
}

        resultArea.style.display = 'block';
        // ✨ السطر المطلوب إضافته هنا:
        updateSpecializedFacilityVisibility(type);
        
        // تعبئة الملاحظات الفنية تلقائياً
        const technicalNotesTextarea = document.getElementById('technicalNotesTextarea');
        if (technicalNotesTextarea) {
            if (technicalNotesDB[type]) {
                technicalNotesTextarea.value = technicalNotesDB[type];
            } else {
                technicalNotesTextarea.value = "1. التأكد من مطابقة الموقع للاشتراطات العامة للنشاط\n2. التحقق من التراخيص والمستندات المطلوبة\n3. مراجعة وسائل السلامة والأمان\n4. التأكد من التزام الشركة بالمعايير البيئية\n5. التحقق من سجلات التدريب للعاملين";
            }
        }
        
        // تحديث بادج نوع النشاط
        updateActivityTypeBadge(type);
        
        // تحميل الحقول الديناميكية للتراخيص
        loadDynamicLicenseFields(type);
    } else {
        resultArea.style.display = 'none';
        // إخفاء قسم التراخيص الديناميكية
        document.getElementById('dynamicLicensesCard').style.display = 'none';
        
        // إفراغ حقل الملاحظات الفنية
        const technicalNotesTextarea = document.getElementById('technicalNotesTextarea');
        if (technicalNotesTextarea) {
            technicalNotesTextarea.value = "";
        }
        
        resultArea.style.display = 'none';


        // إعادة تعيين البادج
        updateActivityTypeBadge(null);
    }
}


   /* 11. وظيفة التصدير (جديد) */
    function exportReport(format) {
        alert(`جاري تجهيز تقرير الشركة للتصدير بصيغة: ${format.toUpperCase()}.\n(هذه وظيفة وهمية تحتاج إلى تنفيذ من جانب الخادم).`);
        // في التطبيق الحقيقي، هنا يتم استدعاء واجهة برمجة التطبيقات (API) الخاصة بالخادم لتوليد الملف المطلوب.
    }







// ==========================================================
// الدوال المساعدة لتحويل الأرقام إلى حروف (للمبالغ المالية)
// ==========================================================

function convertLessThanOneThousand(n) {
    if (n === 0) return "";
    let result = "";

    const single = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
    const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
    const tens_arr = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
    const hundreds_arr = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

    let h = Math.floor(n / 100);
    let r = n % 100;

    if (h > 0) {
        result += hundreds_arr[h];
    }

    if (r > 0) {
        if (result.length > 0) result += " و";

        if (r < 10) {
            result += single[r];
        } else if (r < 20) {
            result += teens[r - 10];
        } else {
            let t = Math.floor(r / 10);
            let u = r % 10;
            if (u > 0) {
                result += single[u] + " و";
            }
            result += tens_arr[t];
        }
    }
    return result;
}

function numberToArabicWords(num) {
    num = Number(num);
    if (num === 0) return "صفر";
    if (typeof num !== 'number' || isNaN(num) || num < 0) return "";

    let result = "";
    let i = 0;
    let tempNum = num;

    while (tempNum > 0 && i < 4) {
        let chunk = tempNum % 1000;
        
        if (chunk > 0) {
            let chunk_words = "";
            let power_word = "";

            if (i === 0) {
                // الآحاد والعشرات والمئات (بدون قوة)
                chunk_words = convertLessThanOneThousand(chunk);
            } else if (i === 1) {
                // الآلاف
                if (chunk === 1) {
                    power_word = "ألف";
                } else if (chunk === 2) {
                    power_word = "ألفان";
                } else if (chunk >= 3 && chunk <= 10) {
                    chunk_words = convertLessThanOneThousand(chunk);
                    power_word = "آلاف";
                } else {
                    chunk_words = convertLessThanOneThousand(chunk);
                    power_word = "ألف";
                }
            } else if (i === 2) {
                // الملايين
                if (chunk === 1) {
                    power_word = "مليون";
                } else if (chunk === 2) {
                    power_word = "مليونان";
                } else if (chunk >= 3 && chunk <= 10) {
                    chunk_words = convertLessThanOneThousand(chunk);
                    power_word = "ملايين";
                } else {
                    chunk_words = convertLessThanOneThousand(chunk);
                    power_word = "مليون";
                }
            } else if (i === 3) {
                // المليارات
                if (chunk === 1) {
                    power_word = "مليار";
                } else if (chunk === 2) {
                    power_word = "ملياران";
                } else if (chunk >= 3 && chunk <= 10) {
                    chunk_words = convertLessThanOneThousand(chunk);
                    power_word = "مليارات";
                } else {
                    chunk_words = convertLessThanOneThousand(chunk);
                    power_word = "مليار";
                }
            }

            // تجميع الجزء الحالي
            let combined_chunk = "";
            if (chunk_words && power_word) {
                combined_chunk = chunk_words + " " + power_word;
            } else if (power_word) {
                combined_chunk = power_word;
            } else {
                combined_chunk = chunk_words;
            }
            
            // إضافة للنتيجة النهائية
            if (result.length > 0) {
                result = combined_chunk.trim() + " و" + result;
            } else {
                result = combined_chunk.trim();
            }
        }
        
        tempNum = Math.floor(tempNum / 1000);
        i++;
    }

    return result.trim().replace(/\s{2,}/g, ' ');
}

// دالة ربط حقل المبلغ في الشاشة الثانية
function updateFeeWords() {
    const inputField = document.getElementById('feeNumeric');
    const outputField = document.getElementById('feeWords');
    const feeValue = parseInt(inputField.value);

    if (isNaN(feeValue) || feeValue <= 0) {
        outputField.value = "";
        return;
    }

    const words = numberToArabicWords(feeValue);
    
    // إضافة التمييز الصحيح (جنيهاً أو جنيهات)
    let currency_suffix = "جنيهاً مصرياً";
    if (feeValue === 1) {
        currency_suffix = "جنيهاً مصرياً";
    } else if (feeValue === 2) {
        currency_suffix = "جنيهان مصريان";
    } else if (feeValue >= 3 && feeValue <= 10) {
        currency_suffix = "جنيهات مصرية";
    } else if (feeValue >= 11) {
        currency_suffix = "جنيهاً مصرياً";
    }
    
    outputField.value = "فقط " + words + " " + currency_suffix;
}


// ==========================================================
// الدوال المساعدة لتحويل التاريخ إلى حروف (للشاشة الأخيرة)
// ==========================================================

const ARABIC_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const DAY_WORDS = {
    1: "الأول", 2: "الثاني", 3: "الثالث", 4: "الرابع", 5: "الخامس", 6: "السادس", 7: "السابع", 8: "الثامن", 9: "التاسع", 10: "العاشر",
    11: "الحادي عشر", 12: "الثاني عشر", 13: "الثالث عشر", 14: "الرابع عشر", 15: "الخامس عشر", 16: "السادس عشر", 17: "السابع عشر", 18: "الثامن عشر", 19: "التاسع عشر",
    20: "العشرون", 21: "الحادي والعشرون", 22: "الثاني والعشرون", 23: "الثالث والعشرون", 24: "الرابع والعشرون", 25: "الخامس والعشرون",
    26: "السادس والعشرون", 27: "السابع والعشرون", 28: "الثامن والعشرون", 29: "التاسع والعشرون", 30: "الثلاثون", 31: "الحادي والثلاثون"
};

// دالة بسيطة لتحويل سنة 2025 إلى ألفان وخمسة وعشرين
function numberToYearWords(year) {
    if (year < 2000) return String(year);
    
    // استخدام دالة تحويل الأرقام الأساسية، ولكن بدون إضافة "ألف" في النهاية
    let year_words = numberToArabicWords(year);
    
    // تعديل صيغة الألف (إضافة "عام" أو "سنة" حسب تفضيلك)
    return year_words.trim().replace(/\s{2,}/g, ' '); 
}

function dateToArabicWords(dateString) {
    if (!dateString) return "";
    
    // يتم تحليل التاريخ بصيغة YYYY-MM-DD
    const date = new Date(dateString);
    
    if (isNaN(date)) return "تاريخ غير صحيح";

    const year = date.getFullYear();
    const month = date.getMonth(); // يبدأ من 0
    const day = date.getDate();

    const dayWord = DAY_WORDS[day];
    const monthName = ARABIC_MONTHS[month];
    const yearWords = numberToYearWords(year);
    
    // الصيغة المطلوبة: الخامس والعشرين من شهر مارس لعام الفان وخمس وعشرين
    return `${dayWord} من شهر ${monthName} لعام ${yearWords}`;
}

// دالة ربط حقل التاريخ في الشاشة الأخيرة
function updateDateWords() {
    const inputField = document.getElementById('productionStartDate');
    const outputField = document.getElementById('productionStartDateWords');
    const dateValue = inputField.value;

    if (!dateValue) {
        outputField.textContent = "الرجاء اختيار تاريخ";
        return;
    }
    
    outputField.textContent = dateToArabicWords(dateValue);
}

// دالة تحويل التاريخ إلى نصوص عربية للشاشة الأخيرة
function updateProductionDateWords() {
    const dateInput = document.getElementById('productionStartDateFinal');
    const wordsInput = document.getElementById('productionStartDateWords');
    const dateValue = dateInput.value;

    if (!dateValue) {
        wordsInput.value = "";
        return;
    }

    const arabicDate = dateToArabicWords(dateValue);
    wordsInput.value = arabicDate;
}

// دالة تحويل السنة إلى كلمات عربية (محسنة)
function numberToYearWords(year) {
    if (year < 2000) return String(year);
    
    let yearNum = parseInt(year);
    
    // معالجة خاصة للسنوات من 2000 إلى 2030
    if (yearNum >= 2000 && yearNum <= 2030) {
        const specialYears = {
            2000: "ألفين", 2001: "ألفين وواحد", 2002: "ألفين واثنين", 
            2003: "ألفين وثلاثة", 2004: "ألفين وأربعة", 2005: "ألفين وخمسة",
            2006: "ألفين وستة", 2007: "ألفين وسبعة", 2008: "ألفين وثمانية",
            2009: "ألفين وتسعة", 2010: "ألفين وعشرة", 2011: "ألفين وأحد عشر",
            2012: "ألفين واثني عشر", 2013: "ألفين وثلاثة عشر", 2014: "ألفين وأربعة عشر",
            2015: "ألفين وخمسة عشر", 2016: "ألفين وستة عشر", 2017: "ألفين وسبعة عشر",
            2018: "ألفين وثمانية عشر", 2019: "ألفين وتسعة عشر", 2020: "ألفين وعشرين",
            2021: "ألفين وواحد وعشرين", 2022: "ألفين واثنين وعشرين", 2023: "ألفين وثلاثة وعشرين",
            2024: "ألفين وأربعة وعشرين", 2025: "ألفين وخمسة وعشرين", 2026: "ألفين وستة وعشرين",
            2027: "ألفين وسبعة وعشرين", 2028: "ألفين وثمانية وعشرين", 2029: "ألفين وتسعة وعشرين",
            2030: "ألفين وثلاثين"
        };
        return specialYears[yearNum] || numberToArabicWords(yearNum);
    }
    
    return numberToArabicWords(yearNum);
}

// دالة تحويل التاريخ إلى كلمات عربية (محسنة)
function dateToArabicWords(dateString) {
    if (!dateString) return "";
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return "تاريخ غير صحيح";
        }

        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        const dayWord = DAY_WORDS[day] || numberToArabicWords(day);
        const monthName = ARABIC_MONTHS[month] || "غير معروف";
        const yearWords = numberToYearWords(year);
        
        return `${dayWord} من ${monthName} سنة ${yearWords}`;
    } catch (error) {
        return "خطأ في تحويل التاريخ";
    }
}

/* 11. وظيفة تحديد وحفظ الموقع GPS - (محسّنة للموبايل) */


// ==========================================
// ==========================================
// 1. إعدادات API
// ==========================================
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_API_KEY_HERE';

// ==========================================
// 2. دالة تحديد الموقع الرئيسية المحسنة
// ==========================================
/* ==========================================================
   نظام إدارة المواقع المتعدد - الشاشة الرابعة
   ========================================================== */

// تهيئة نظام المواقع عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeLocationsSystem();
});

// تهيئة نظام المواقع
function initializeLocationsSystem() {
    // تعبئة قوائم المحافظات للموقع الرئيسي
    populateGovernorateLists();
}

// تعبئة قوائم المحافظات لجميع المواقع
function populateGovernorateLists() {
    const governorateSelects = document.querySelectorAll('.governorate-select');
    const mainGovernorateSelect = document.getElementById('governorateSelect'); // القائمة الرئيسية القديمة
    
    governorateSelects.forEach(select => {
        // مسح المحتوى الحالي
        select.innerHTML = '<option value="">-- اختر محافظة --</option>';
        
        // إضافة المحافظات من قاعدة البيانات
        Object.keys(citiesDB).forEach(governorate => {
            const option = document.createElement('option');
            option.value = governorate;
            option.textContent = governorate;
            select.appendChild(option);
        });
    });
}

// تحديث قائمة المدن لموقع معين
function updateCitiesForLocation(governorateSelect) {
    const locationSection = governorateSelect.closest('.location-section');
    const citySelect = locationSection.querySelector('.city-select');
    const selectedGovernorate = governorateSelect.value;
    
    // مسح القائمة الحالية
    citySelect.innerHTML = '<option value="">-- اختر المحافظة أولا --</option>';
    
    // إذا تم اختيار محافظة، قم بملء قائمة المدن
    if (selectedGovernorate && citiesDB[selectedGovernorate]) {
        citiesDB[selectedGovernorate].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

// إضافة موقع جديد
function addNewLocation() {
    const container = document.getElementById('locationsContainer');
    const locationId = 'location_' + Date.now();
    const newLocationDiv = document.createElement('div');
    newLocationDiv.className = 'location-section card mb-4 p-3 border-success';
    newLocationDiv.id = locationId;

    newLocationDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="text-success mb-0">موقع إضافي للشركة</h5>
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeLocation('${locationId}')">
                <i class="bi bi-trash"></i> حذف الموقع
            </button>
        </div>
        <div class="row mb-3">
            <div class="col-md-6"><label class="info-label">تاريخ المعاينة</label><input type="date" class="form-control inspection-date"></div>
            <div class="col-md-6">
                <label class="info-label">المحافظة</label>
                <select class="form-select governorate-select" onchange="updateCitiesForLocation(this)">
                    <option value="">-- اختر محافظة --</option>
                </select>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-md-6">
                <label class="info-label">المدينة</label>
                <select class="form-select city-select">
                    <option value="">-- اختر المحافظة أولا --</option>
                </select>
            </div>
            <div class="col-md-6">
                <label class="info-label">تفاصيل العنوان (المنطقة/الشارع/الرقم)</label>
                <input type="text" class="form-control address-details" placeholder="اسم الشارع، المنطقة، رقم العقار...">
            </div>
        </div>
        
        <div class="mb-3">
            <button class="btn btn-primary w-100 location-button" onclick="getAndSaveLocationForLocation(this)">
                📍 تحديد الموقع GPS (خط الطول وخط العرض)
            </button>
            <div class="location-status mt-2 text-center" style="display:none; color:#198754; font-weight:bold;">✅ تم تحديد الموقع بنجاح.</div>
            <div class="location-error mt-2 text-center" style="display:none; color:#dc3545; font-weight:bold;">❌ تعذر تحديد الموقع. يرجى التأكد من تفعيل GPS.</div>
        </div>
        
        <div class="row mb-3">
            <div class="col-md-6">
                <label class="info-label">خط الطول (Longitude)</label>
                <input type="text" class="form-control longitude" readonly placeholder="سيظهر هنا تلقائيًا">
            </div>
            <div class="col-md-6">
                <label class="info-label">خط العرض (Latitude)</label>
                <input type="text" class="form-control latitude" readonly placeholder="سيظهر هنا تلقائيًا">
            </div>
        </div>
        
        <div class="mb-3">
            <label class="info-label">عنوان موقع المعاينة (رابط من Google Maps)</label>
            <div class="input-group">
                <input type="text" class="form-control map-link" placeholder="سيظهر الرابط هنا تلقائياً" readonly>
                <button class="btn btn-outline-primary open-map-btn" type="button" disabled onclick="openMapLinkForLocation(this)">
                    🌎 فتح الخريطة
                </button>
            </div>
        </div>

        <div class="card mb-3 bg-light border-0">
            <div class="card-body p-3">
                <h6 class="text-primary fw-bold border-bottom pb-2 mb-2">📍 العنوان المستخرج (Reverse Geocoding)</h6>
                
                <div class="mb-2">
                    <span class="badge bg-primary mb-1">OpenStreetMap (مجاني)</span>
                    <p class="osm-address mb-0 text-muted small fw-bold" style="min-height: 20px;">
                        ... في انتظار تحديد الموقع
                    </p>
                </div>
            </div>
        </div>

            <!-- حقل التحقق من وجود شركة أخرى في الموقع -->
<div class="mb-3">
    <label class="info-label">فحص وجود شركة أخرى في الموقع</label>
    <div class="input-group">
        <button class="btn btn-outline-warning" type="button" onclick="checkExistingCompany(this)">
            <i class="bi bi-search"></i> فحص الموقع
        </button>
        <input type="text" class="form-control" placeholder="سيظهر نتيجة الفحص هنا👇" readonly id="existingCompanyResult">
    </div>
    <small class="text-muted">يقوم هذا الفحص بالبحث عن شركات مسجلة في نفس العنوان.</small>
</div>
		            <!-- حقل الملاحظات للموقع الرئيسي -->
        <div class="mb-3">
            <label class="info-label">ملاحظات على الموقع</label>
            <textarea class="form-control location-notes" rows="2" placeholder="أدخل أي ملاحظات خاصة بهذا الموقع..."></textarea>
        </div>
    `;

    container.appendChild(newLocationDiv);
    
    // تعبئة قائمة المحافظات للموقع الجديد
    const governorateSelect = newLocationDiv.querySelector('.governorate-select');
    populateGovernorateSelect(governorateSelect);
}

// تعبئة قائمة محافظة محددة
function populateGovernorateSelect(selectElement) {
    selectElement.innerHTML = '<option value="">-- اختر محافظة --</option>';
    
    Object.keys(citiesDB).forEach(governorate => {
        const option = document.createElement('option');
        option.value = governorate;
        option.textContent = governorate;
        selectElement.appendChild(option);
    });
}

// حذف موقع
function removeLocation(locationId) {
    const locationElement = document.getElementById(locationId);
    if (locationElement) {
        locationElement.remove();
    }
}

/* ==========================================================
   نظام تحديد الموقع المحسن للمواقع المتعددة
   ========================================================== */

// دالة تحديد الموقع للمواقع الفردية
async function getAndSaveLocationForLocation(button) {
    const locationSection = button.closest('.location-section');
    const statusDiv = locationSection.querySelector('.location-status');
    const errorDiv = locationSection.querySelector('.location-error');
    const longInput = locationSection.querySelector('.longitude');
    const latInput = locationSection.querySelector('.latitude');
    const mapLinkInput = locationSection.querySelector('.map-link');
    const btnOpenMap = locationSection.querySelector('.open-map-btn');
    const osmAddressLabel = locationSection.querySelector('.osm-address');
    const governorateSelect = locationSection.querySelector('.governorate-select');
    const citySelect = locationSection.querySelector('.city-select');
    const addressDetailsInput = locationSection.querySelector('.address-details');

// إعادة تعيين الواجهة
statusDiv.style.display = 'none';
errorDiv.style.display = 'none';
longInput.value = '';
latInput.value = '';
mapLinkInput.value = '';
btnOpenMap.disabled = true;

// ------------------------------------------------------------------
// **التعديل هنا:** إضافة تحقق (if (osmAddressLabel)) لمنع الخطأ
if (osmAddressLabel) {
    osmAddressLabel.textContent = '... جاري البحث';
    osmAddressLabel.className = 'mb-0 text-muted small fw-bold';
}
// ------------------------------------------------------------------

button.disabled = true;
button.innerHTML = '📡 جاري الاتصال بالأقمار الصناعية...';

    if (!navigator.geolocation) {
        handleLocationErrorForLocation(errorDiv, button, "المتصفح لا يدعم تحديد الموقع الجغرافي");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const lat = position.coords.latitude;
                const long = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                // تعبئة حقول الإحداثيات
                // تحديث واجهة النجاح فوراً
latInput.value = lat.toFixed(7);
longInput.value = long.toFixed(7);
const googleMapsUrl = `https://www.google.com/maps?q=${lat},${long}`;
mapLinkInput.value = googleMapsUrl;
btnOpenMap.disabled = false;

statusDiv.style.display = 'block';
errorDiv.style.display = 'none';
button.disabled = false;
button.innerHTML = `✅ تم التحديد (الدقة: ${Math.round(accuracy)}م)`;

// عرض رسالة مؤقتة
if (osmAddressLabel) {
    osmAddressLabel.textContent = '⏳ جاري تحديث البيانات...';
    osmAddressLabel.className = 'mb-0 text-info small fw-bold';
}

// تنفيذ طلبات OSM في الخلفية بدون انتظار
(async () => {
    try {
        // طلب واحد فقط للحصول على كل البيانات
        const addressData = await getAddressDataFromOSM(lat, long);
        
        if (addressData && addressData.display_name) {
            // تحديث العنوان فوراً
            if (osmAddressLabel) {
                osmAddressLabel.textContent = addressData.display_name;
                osmAddressLabel.className = 'mb-0 text-success small fw-bold';
            }
            
            // استخراج المحافظة والمدينة
            const { governorate, city } = extractGovernorateAndCity(addressData.address || addressData);
            
            // تحديث القوائم فوراً بدون انتظار
            if (governorate && governorateSelect) {
                updateSelectWithValue(governorateSelect, governorate);
                updateCitiesForLocation(governorateSelect);
                
                // تحديث المدينة بعد 50ms لضمان تحديث القائمة
                if (city && citySelect) {
                    setTimeout(() => updateSelectWithValue(citySelect, city), 50);
                }
            }
            
            // تحديث تفاصيل العنوان
            if (addressDetailsInput) {
                const cleanAddress = extractCleanAddress(addressData.display_name, governorate, city);
                addressDetailsInput.value = cleanAddress;
            }
        }
    } catch (err) {
        console.error('خطأ في جلب بيانات OSM:', err);
        if (osmAddressLabel) {
            osmAddressLabel.textContent = '⚠️ تعذر جلب تفاصيل العنوان';
            osmAddressLabel.className = 'mb-0 text-warning small fw-bold';
        }
    }
})();



} catch (err) {
    console.error('خطأ في معالجة الموقع:', err);
    handleLocationErrorForLocation(errorDiv, button, 'حدث خطأ أثناء معالجة بيانات الموقع');
}
        },
        (error) => {
            handleErrorResponseForLocation(error, errorDiv, button);
        },
        {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 10000
        }
    );
}

// استخراج بيانات الموقع وتحديث القوائم


// الحصول على البيانات التفصيلية من OSM
// إضافة Cache للطلبات السريعة
const osmCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

async function getAddressDataFromOSM(lat, long) {
    const cacheKey = `${lat.toFixed(5)},${long.toFixed(5)}`;
    const cached = osmCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
    }
    
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?` + 
                    `format=jsonv2&lat=${lat}&lon=${long}&` +
                    `accept-language=ar&addressdetails=1&zoom=18`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'LocationApp/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // حفظ البيانات الكاملة
        const result = {
            display_name: data.display_name || 'لا يمكن العثور على العنوان',
            address: data.address || {}
        };
        
        osmCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        
        return result;
    } catch (error) {
        console.error("OSM Error:", error.message);
        return null;
    }
}
// استخراج المحافظة والمدينة من بيانات العنوان
function extractGovernorateAndCity(addressData) {
    let governorate = '';
    let city = '';

    // البحث عن المحافظة (state أو county)
    if (addressData.state) {
        governorate = addressData.state;
    } else if (addressData.county) {
        governorate = addressData.county;
    }

    // البحث عن المدينة (city أو town أو village)
    if (addressData.city) {
        city = addressData.city;
    } else if (addressData.town) {
        city = addressData.town;
    } else if (addressData.village) {
        city = addressData.village;
    } else if (addressData.municipality) {
        city = addressData.municipality;
    }

    return { governorate, city };
}

// استخراج العنوان النظيف (بدون المحافظة والمدينة)
function extractCleanAddress(fullAddress, governorate, city) {
    let cleanAddress = fullAddress;
    
    // إزالة المحافظة والمدينة من العنوان
    if (governorate) {
        cleanAddress = cleanAddress.replace(new RegExp(governorate, 'gi'), '').trim();
    }
    if (city) {
        cleanAddress = cleanAddress.replace(new RegExp(city, 'gi'), '').trim();
    }
    
    // تنظيف العناوين من الفواصل الزائدة
    cleanAddress = cleanAddress.replace(/,+/g, ',').replace(/^,|,$/g, '').trim();
    cleanAddress = cleanAddress.replace(/\s+/g, ' ').trim();
    
    return cleanAddress;
}

// تحديث القائمة المنسدلة بقيمة محددة
function updateSelectWithValue(selectElement, value) {
    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].text === value) {
            selectElement.value = selectElement.options[i].value;
            return true;
        }
    }
    
    // إذا لم توجد القيمة، نضيفها
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
    selectElement.value = value;
    
    return false;
}

// فتح رابط الخريطة لموقع معين
function openMapLinkForLocation(button) {
    const locationSection = button.closest('.location-section');
    const mapLinkInput = locationSection.querySelector('.map-link');
    const link = mapLinkInput.value;
    
    if (link && link.startsWith('http')) {
        window.open(link, '_blank', 'noopener,noreferrer');
    } else {
        alert("يرجى تحديد الموقع أولاً لتوليد الرابط");
    }
}

// دوال معالجة الأخطاء للمواقع
function handleErrorResponseForLocation(error, errorDiv, btn) {
    errorDiv.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '📍 تحديد الموقع GPS';

    let msg = "";
    switch(error.code) {
        case error.PERMISSION_DENIED:
            msg = "❌ تم رفض إذن الموقع. قم بتفعيله من إعدادات المتصفح.";
            break;
        case error.POSITION_UNAVAILABLE:
            msg = "❌ إشارة GPS ضعيفة أو غير متوفرة.";
            break;
        case error.TIMEOUT:
            msg = "❌ انتهت المهلة. يرجى المحاولة في مكان مفتوح.";
            break;
        default:
            msg = "❌ حدث خطأ غير معروف.";
    }
    errorDiv.textContent = msg;
}

function handleLocationErrorForLocation(errorDiv, btn, message) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
    btn.disabled = false;
    btn.innerHTML = '📍 تحديد الموقع GPS';
}

/* ==========================================================
   دوال لجمع بيانات جميع المواقع
   ========================================================== */

// جمع بيانات جميع المواقع
function getAllLocationsData() {
    const locations = [];
    const locationSections = document.querySelectorAll('.location-section');
    
    locationSections.forEach((section, index) => {
        const locationData = {
            id: section.id || `location_${index}`,
            inspectionDate: section.querySelector('.inspection-date').value,
            governorate: section.querySelector('.governorate-select').value,
            city: section.querySelector('.city-select').value,
            addressDetails: section.querySelector('.address-details').value,
            longitude: section.querySelector('.longitude').value,
            latitude: section.querySelector('.latitude').value,
            mapLink: section.querySelector('.map-link').value,
            notes: section.querySelector('.location-notes').value
        };
        
        locations.push(locationData);
    });
    
    return locations;
}

// التحقق من صحة بيانات المواقع
function validateLocationsData() {
    const locations = getAllLocationsData();
    let isValid = true;
    const errors = [];
    
    locations.forEach((location, index) => {
        if (!location.governorate || !location.city) {
            isValid = false;
            errors.push(`الموقع ${index + 1}: يرجى تحديد المحافظة والمدينة`);
        }
        
        if (!location.longitude || !location.latitude) {
            isValid = false;
            errors.push(`الموقع ${index + 1}: يرجى تحديد الإحداثيات الجغرافية`);
        }
    });
    
    return { isValid, errors };
}
// ==========================================================

/* نظام إدارة الضرائب المتقدم */
const vatManager = {
    // إعدادات قابلة للتخصيص
    config: {
        startYear: 2020,
        months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        statusOptions: [
            { value: 'ايجابي', text: 'إيجابي' },
            { value: 'سلبي', text: 'سلبي' },
            { value: 'لم يقدم', text: 'لم يقدم' }
        ]
    },
    
    // تهيئة النظام
    init: function() {
        this.populateYearDropdown();
        this.setupEventListeners();
    },
    
    // ملء قائمة السنوات
    populateYearDropdown: function() {
        const yearSelect = document.getElementById('vatYearSelect');
        const currentYear = new Date().getFullYear();
        
        yearSelect.innerHTML = '<option value="">-- اختر العام --</option>';
        
        for (let year = currentYear; year >= this.config.startYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    },
    
    // تحديث الواجهة بناءً على السنة المختارة
    updateInterface: function(selectedYear) {
        const labels = document.querySelectorAll('#vatReturnsDetails .small.fw-bold');
        
        labels.forEach(label => {
            if (label.textContent.includes('صورة ضوئية من إقرار الضريبة عن شهر')) {
                label.textContent = selectedYear ? 
                    `صورة ضوئية من إقرار الضريبة عن شهر (${selectedYear}):` :
                    'صورة ضوئية من إقرار الضريبة عن شهر:';
            }
        });
        
        // يمكنك إضافة المزيد من المنطق هنا
        this.handleYearChange(selectedYear);
    },
    
    // التعامل مع تغيير السنة
    handleYearChange: function(year) {
        if (year) {
            console.log(`تم اختيار السنة: ${year}`);
            // هنا يمكنك إضافة منطق إضافي مثل:
            // - جلب البيانات المحفوظة لهذه السنة
            // - تفعيل/تعطيل خيارات معينة
            // - إظهار إشعارات etc.
        }
    },
    
    // إعداد مستمعي الأحداث
    setupEventListeners: function() {
        const yearSelect = document.getElementById('vatYearSelect');
        if (yearSelect) {
            yearSelect.addEventListener('change', (e) => {
                this.updateInterface(e.target.value);
            });
        }
    },
    
    // الحصول على البيانات الحالية
    getCurrentData: function() {
        return {
            year: document.getElementById('vatYearSelect').value,
            month1: document.getElementById('vatMonth1').value,
            month2: document.getElementById('vatMonth2').value
        };
    },
    
    // حفظ البيانات (للاستخدام المستقبلي)
    saveData: function() {
        const data = this.getCurrentData();
        // هنا يمكنك إضافة منطق لحفظ البيانات
        console.log('بيانات الضريبة:', data);
        return data;
    }
};

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    vatManager.init();
});

// دالة التوافق مع الكود القديم
function updateVatMonths() {
    const selectedYear = document.getElementById('vatYearSelect').value;
    vatManager.updateInterface(selectedYear);
}


/* دوال قسم محضر المناقشة والصور */
function toggleMeetingMinutesSection() {
    const checkBox = document.getElementById('meetingMinutesCheck');
    const section = document.getElementById('meetingMinutesSection');
    section.style.display = checkBox.checked ? 'block' : 'none';
}

function togglePhotoCaptureSection() {
    const checkBox = document.getElementById('photoCaptureCheck');
    const section = document.getElementById('photoCaptureSection');
    section.style.display = checkBox.checked ? 'block' : 'none';
}

function openCamera() {
    // محاولة فتح الكاميرا باستخدام input file مع سمة capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // 'environment' للكاميرا الخلفية، 'user' للأمامية
    input.onchange = (e) => {
        handleFileSelect(e.target);
    };
    input.click();
}

function handleFileSelect(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const photoPreview = document.getElementById('photoPreview');
            photoPreview.innerHTML = `
                <div class="alert alert-success">
                    <p>✅ تم تحميل الصورة بنجاح</p>
                    <img src="${e.target.result}" class="img-thumbnail mt-2" style="max-height: 200px;">
                    <div class="mt-2">
                        <button class="btn btn-sm btn-danger" onclick="removePhoto()">إزالة الصورة</button>
                    </div>
                </div>
            `;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removePhoto() {
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('fileInput').value = '';
}


// دالة حفظ التقرير المحسّنة
function saveFinalReport() {
    const btn = document.getElementById('btnSaveFinal');
    const originalText = btn.innerHTML;
    
    // تأثير التحميل
    btn.classList.add('btn-loading');
    btn.innerHTML = '<span class="btn-icon">⏳</span> جاري الحفظ...';
    btn.disabled = true;
    
    // محاكاة عملية الحفظ (استبدلها بالكود الحقيقي)
    setTimeout(() => {
        // إزالة تأثير التحميل
        btn.classList.remove('btn-loading');
        btn.innerHTML = '<span class="btn-icon">✅</span> تم الحفظ بنجاح!';
        btn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        
        // رسالة نجاح
        alert('✅ تم حفظ التقرير النهائي بنجاح!');
        
        // إعادة الزر لحالته الأصلية بعد 3 ثواني
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 3000);
        
    }, 1500); // 1.5 ثانية للمحاكاة
}

// دالة التصدير المحسّنة (موجودة بالفعل - يمكن تحسينها)
function exportReport(format) {
    const formatNames = {
        'word': 'Word (DOCX)',
        'pdf': 'PDF',
        'json': 'JSON'
    };
    
    const formatIcons = {
        'word': '📄',
        'pdf': '📕',
        'json': '📋'
    };
    
    alert(`${formatIcons[format]} جاري تجهيز تقرير الشركة للتصدير بصيغة: ${formatNames[format]}.\n\n(هذه وظيفة وهمية تحتاج إلى تنفيذ من جانب الخادم)`);
    
    // هنا يمكنك إضافة الكود الحقيقي للتصدير
    console.log(`Exporting report as ${format.toUpperCase()}`);
}


// دالة تحميل الحقول الديناميكية للتراخيص
function loadDynamicLicenseFields(activityType) {
    const container = document.getElementById('dynamicLicensesContainer');
    const card = document.getElementById('dynamicLicensesCard');
    const template = document.getElementById('licenseFieldTemplate');
    
    // مسح المحتويات السابقة
    container.innerHTML = '';
    
    // إظهار أو إخفاء البطاقة
    if (licenseFieldsDB[activityType]) {
        card.style.display = 'block';
        
        // إنشاء الحقول الديناميكية
        licenseFieldsDB[activityType].forEach((field, index) => {
            const clone = template.content.cloneNode(true);
            const fieldGroup = clone.querySelector('.license-field-group');
            const checkbox = clone.querySelector('.license-main-checkbox');
            const label = clone.querySelector('.form-check-label');
            const details = clone.querySelector('.license-details');
            
            // تعيين القيم
            checkbox.id = `license_${activityType}_${index}`;
            label.textContent = field.name;
            label.htmlFor = checkbox.id;
            
            // إذا كان الحقل مطلوباً، نجعله مفعلاً مسبقاً
            if (field.required) {
                checkbox.checked = true;
                details.style.display = 'block';
                fieldGroup.classList.add('border-success');
            }
            
            // إضافة حدث التغيير
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    details.style.display = 'block';
                    fieldGroup.classList.add('border-success');
                    fieldGroup.classList.remove('border-secondary');
                } else {
                    details.style.display = 'none';
                    fieldGroup.classList.remove('border-success');
                    fieldGroup.classList.add('border-secondary');
                }
            });
            
            container.appendChild(clone);
        });
    } else {
        card.style.display = 'none';
    }
}

// دالة الحصول على بيانات التراخيص المدخلة
function getLicenseData() {
    const licenseData = {};
    const fieldGroups = document.querySelectorAll('.license-field-group');
    
    fieldGroups.forEach(group => {
        const checkbox = group.querySelector('.license-main-checkbox');
        const label = group.querySelector('.form-check-label').textContent;
        
        if (checkbox.checked) {
            licenseData[label] = {
                number: group.querySelector('.license-number').value,
                issueDate: group.querySelector('.license-issue-date').value,
                expiryDate: group.querySelector('.license-expiry-date').value,
                notes: group.querySelector('.license-notes').value
            };
        }
    });
    
    return licenseData;
}

/* دوال جديدة لإدارة التعديلات في الشاشة الثالثة */

// تبديل تفاصيل التعديل
function toggleModificationDetails(detailsId, isChecked) {
    document.getElementById(detailsId).style.display = isChecked ? 'block' : 'none';
}

// إضافة عنصر تعديل جديد
function addModificationItem(containerId, modificationType) {
    const container = document.getElementById(containerId);
    const newItem = document.createElement('div');
    newItem.className = 'modification-item mb-2 p-2 bg-light rounded border-top';
    
    // بناء HTML مختلف حسب نوع التعديل
    if (modificationType === 'modifyLegalUmbrella') {
        newItem.innerHTML = `
            <div class="row g-2 align-items-center">
                <div class="col-md-3">
                    <label class="info-label small">رقم المادة</label>
                    <input type="text" class="form-control form-control-sm" placeholder="ادخل رقم المادة">
                </div>
                <div class="col-md-3">
                    <label class="info-label small">بتاريخ</label>
                    <input type="date" class="form-control form-control-sm">
                </div>
                <div class="col-md-3">
                    <label class="info-label small">نوع التعديل</label>
                    <select class="form-select form-select-sm">
                        <option>الدخول إلى</option>
                        <option>الخروج من</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="removeModificationItem(this)">- حذف</button>
                </div>
            </div>
        `;
    } else {
        newItem.innerHTML = `
            <div class="row g-2 align-items-center">
                <div class="col-md-4">
                    <label class="info-label small">رقم المادة</label>
                    <input type="text" class="form-control form-control-sm" placeholder="ادخل رقم المادة">
                </div>
                <div class="col-md-4">
                    <label class="info-label small">بتاريخ</label>
                    <input type="date" class="form-control form-control-sm">
                </div>
                <div class="col-md-4">
                    <button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="removeModificationItem(this)">- حذف</button>
                </div>
            </div>
        `;
    }
    
    container.appendChild(newItem);
}

// حذف عنصر تعديل
function removeModificationItem(button) {
    button.closest('.modification-item').remove();
}

// دالة إضافة عنصر تعديل جديد (المعدلة)
function addModificationItem(containerId, modificationType) {
    const container = document.getElementById(containerId);
    const newItem = document.createElement('div');
    newItem.className = 'modification-item mb-2 p-2 bg-light rounded border-top';
    
    // بناء HTML مختلف حسب نوع التعديل
    if (modificationType === 'modifyLegalUmbrella') {
        newItem.innerHTML = `
            <div class="row g-2 align-items-center">
                <div class="col-md-3">
                    <label class="info-label small">رقم المادة</label>
                    <input type="text" class="form-control form-control-sm" placeholder="ادخل رقم المادة">
                </div>
                <div class="col-md-3">
                    <label class="info-label small">بتاريخ</label>
                    <input type="date" class="form-control form-control-sm">
                </div>
                <div class="col-md-3">
                    <label class="info-label small">نوع التعديل</label>
                    <select class="form-select form-select-sm">
                        <option>الدخول إلى</option>
                        <option>الخروج من</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="removeModificationItem(this)">- حذف</button>
                </div>
            </div>
            <!-- حقل الملاحظات المضاف -->
            <div class="row g-2 mt-2">
                <div class="col-12">
                    <label class="info-label small">ملاحظات</label>
                    <textarea class="form-control form-control-sm" rows="2" placeholder="أدخل أي ملاحظات حول هذا التعديل..."></textarea>
                </div>
            </div>
        `;
    } else {
        newItem.innerHTML = `
            <div class="row g-2 align-items-center">
                <div class="col-md-4">
                    <label class="info-label small">رقم المادة</label>
                    <input type="text" class="form-control form-control-sm" placeholder="ادخل رقم المادة">
                </div>
                <div class="col-md-4">
                    <label class="info-label small">بتاريخ</label>
                    <input type="date" class="form-control form-control-sm">
                </div>
                <div class="col-md-4">
                    <button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="removeModificationItem(this)">- حذف</button>
                </div>
            </div>
            <!-- حقل الملاحظات المضاف -->
            <div class="row g-2 mt-2">
                <div class="col-12">
                    <label class="info-label small">ملاحظات</label>
                    <textarea class="form-control form-control-sm" rows="2" placeholder="أدخل أي ملاحظات حول هذا التعديل..."></textarea>
                </div>
            </div>
        `;
    }
    
    container.appendChild(newItem);
}


/* ==========================================================
   نظام التحليل المالي الخبير (Financial Expert System)
   ========================================================== */
function runFinancialAnalysis() {
    // 1. جلب القيم وتحويلها لأرقام
    // استخدام || 0 لضمان عدم حدوث خطأ في الحسابات
    const inventory = parseFloat(document.getElementById('valInventory').value) || 0;
    const debtors = parseFloat(document.getElementById('valDebtors').value) || 0;
    const creditors = parseFloat(document.getElementById('valCreditors').value) || 0;
    const sales = parseFloat(document.getElementById('valSales').value) || 0;
    const depreciation = parseFloat(document.getElementById('valDepreciation').value) || 0;
    
    const vatStatus1 = document.getElementById('vatStatus1')?.value;
    const vatStatus2 = document.getElementById('vatStatus2')?.value;

    const resultsDiv = document.getElementById('financialAnalysisResults');
    const placeholder = document.getElementById('analysisPlaceholder');

    // إخفاء النتائج إذا كانت كل القيم صفر
    if (inventory === 0 && debtors === 0 && creditors === 0 && sales === 0) {
        resultsDiv.style.display = 'none';
        placeholder.style.display = 'block';
        return;
    }

    resultsDiv.style.display = 'block';
    placeholder.style.display = 'none';

    // === أولاً: تحليل السيولة (Working Capital Logic) ===
    const liquidityAlert = document.getElementById('liquidityAlert');
    const liquidityText = document.getElementById('liquidityText');
    const currentAssets = inventory + debtors;
    
    // القاعدة: هل الأصول المتداولة تغطي الخصوم المتداولة؟
    if (currentAssets > creditors) {
        liquidityAlert.innerHTML = '<div class="alert alert-success py-2 px-3 mb-2"><i class="fas fa-check-circle"></i> <strong>موقف مالي متزن:</strong> الأصول المتداولة تغطي الالتزامات قصيرة الأجل.</div>';
        liquidityText.innerHTML = `الشركة تعتمد على مواردها الذاتية في التمويل. نسبة التغطية: ${creditors > 0 ? (currentAssets/creditors).toFixed(2) : 'عالية جداً'}.`;
    } else if (creditors > currentAssets) {
        liquidityAlert.innerHTML = '<div class="alert alert-danger py-2 px-3 mb-2"><i class="fas fa-exclamation-triangle"></i> <strong>تنبيه سيولة:</strong> الدائنون أكبر من الأصول المتداولة.</div>';
        liquidityText.innerHTML = 'الشركة تعتمد بشكل كبير على الموردين في تمويل النشاط، وهذا قد يشير إلى تعثر في السداد أو ضغط مالي، أو أن الشركة تحصل على تسهيلات ائتمانية كبيرة من الموردين.';
    } else {
        liquidityAlert.innerHTML = '<div class="alert alert-info py-2 px-3 mb-2">لا توجد بيانات كافية لتحليل السيولة بدقة.</div>';
        liquidityText.innerHTML = '';
    }

    // === ثانياً: تحليل كفاءة الدوران (Turnover Logic) ===
    const activityAlert = document.getElementById('activityAlert');
    const activityText = document.getElementById('activityText');

    if (sales > 0) {
        if (inventory > sales) {
            activityAlert.innerHTML = '<div class="alert alert-warning py-2 px-3 mb-2"><i class="fas fa-boxes"></i> <strong>تراكم مخزون:</strong> رصيد المخزون أكبر من حجم المبيعات.</div>';
            activityText.innerHTML = 'يرجى التأكد من عدم وجود مخزون راكد أو بطيء الحركة، حيث أن معدل دوران المخزون يبدو منخفضاً مقارنة بالمبيعات المسجلة.';
        } else if (inventory === 0 && sales > 0) {
            activityAlert.innerHTML = '<div class="alert alert-info py-2 px-3 mb-2"><strong>نشاط خدمي أو Just-in-Time:</strong> مبيعات بدون مخزون.</div>';
            activityText.innerHTML = 'قد تكون الشركة خدمية، أو تتبع سياسة التوريد المباشر دون تخزين. يرجى التحقق من طبيعة النشاط.';
        } else {
            activityAlert.innerHTML = '<div class="alert alert-success py-2 px-3 mb-2"><i class="fas fa-chart-line"></i> <strong>دوران جيد:</strong> المبيعات تتناسب منطقياً مع المخزون.</div>';
            activityText.innerHTML = 'العلاقة بين المبيعات والمخزون تبدو طبيعية وتعكس حركة دوران مقبولة.';
        }
    } else if (sales === 0 && inventory > 0) {
        activityAlert.innerHTML = '<div class="alert alert-danger py-2 px-3 mb-2"><i class="fas fa-stop-circle"></i> <strong>توقف نشاط محتمل:</strong> وجود مخزون دون مبيعات.</div>';
        activityText.innerHTML = 'يوجد مخزون ولكن لا توجد مبيعات في قائمة الدخل. هل الشركة في مرحلة التأسيس وما زالت تخزن؟ أم أنها متوقفة عن البيع؟';
    } else {
        activityAlert.innerHTML = '';
        activityText.innerHTML = 'لم يتم إدخال بيانات المبيعات بعد.';
    }

    // === ثالثاً: الفحص المتقاطع (Cross-Check Rules) ===
    // ... (بداية دالة runFinancialAnalysis)

    // ... (جزء جلب القيم وتحليل السيولة وكفاءة الدوران لا يتغير) ...

    // === ثالثاً: الفحص المتقاطع (Cross-Check Rules) - بعد التعديل ===
    const checkList = document.getElementById('crossCheckList');
    checkList.innerHTML = ''; // مسح القائمة

    // تهيئة المتغيرات لجمع معلومات الإقرارات الضريبية
    const vatPositiveCount = (vatStatus1 === 'ايجابي' ? 1 : 0) + (vatStatus2 === 'ايجابي' ? 1 : 0);
    // يحسب عدد الإقرارات التي تم إدخال حالتها (إيجابي أو سلبي)
    const totalVatInputs = (vatStatus1 && vatStatus1 !== '') + (vatStatus2 && vatStatus2 !== ''); 
    
    // قاعدة 1: الإهلاك والمبيعات
    if (depreciation > 0 && sales === 0) {
        addCheckItem(checkList, 'يوجد إهلاك أصول ولا توجد مبيعات: هل المصنع متوقف والآلات تعمل؟ أم أنه إهلاك محاسبي فقط؟', 'text-danger');
    }

    // قاعدة 2: المبيعات والإقرارات الضريبية (المنطق المصحح والأكثر دقة)
    if (sales > 0 && totalVatInputs > 0) {
        if (vatPositiveCount === 0) {
            // حالة: توجد مبيعات في القائمة المالية (السنوية/الفترة)، ولكن كلا الإقرارين المدخلين سلبيان.
            addCheckItem(checkList, '❌ <strong>تنبيه ضروري ومهم:</strong> توجد مبيعات في قائمة الدخل السنوية، ولكن حالة الإقرارات الضريبية المدخلة (*كلاهما*) سلبية. هذا يشير إلى احتمال **إخفاء مبيعات** أو **خطأ في تسجيل ضريبة المخرجات** على مدار العام. يجب التحقق من نسبة الضريبة المحصلة مقارنة بالمبيعات الكلية.', 'text-danger fw-bold bg-warning-subtle');
        } else if (vatPositiveCount < totalVatInputs) {
            // حالة: وجود إقرار إيجابي واحد على الأقل مع إقرار سلبي واحد.
            addCheckItem(checkList, 'مطابقة مقبولة: توجد مبيعات، وبعض الإقرارات إيجابية وبعضها سلبي، وهذا طبيعي في سياق شراء أصول أو تراكم مخزون. (مؤشر التزام جيد إجمالاً).', 'text-success');
        } else {
             // حالة: كلا الإقرارين المدخلين إيجابيان
             addCheckItem(checkList, 'مطابقة كاملة: توجد مبيعات والإقرارات إيجابية (مؤشر التزام جيد).', 'text-success');
        }
    } else if (sales === 0 && totalVatInputs > 0 && vatPositiveCount > 0) {
        // حالة عكسية: لا توجد مبيعات سنوية (بالقائمة)، ولكن الإقرارات إيجابية.
        addCheckItem(checkList, '⚠️ <strong>تناقض بيانات:</strong> لا توجد مبيعات في قائمة الدخل السنوية، ولكن هناك إقرار ضريبي إيجابي. يرجى مراجعة الفترة الزمنية للقائمة المالية والإقرارات المدخلة للتأكد من التطابق.', 'text-warning');
    }
    
    // قاعدة 3: المخزون والدائنون
    if (creditors > 0 && inventory === 0) {
         addCheckItem(checkList, 'يوجد دائنون ولا يوجد مخزون: هل الديون لتمويل أصول ثابتة أم مصاريف تشغيل؟', 'text-muted');
    }
    
    // قاعدة 4: المدينون والمبيعات
    if (debtors > sales && sales > 0) {
         addCheckItem(checkList, 'رصيد المدينين يفوق المبيعات: هل هناك سياسة بيع آجل طويلة الأمد؟ أم مشاكل في التحصيل؟', 'text-warning');
    }

// ... (نهاية دالة runFinancialAnalysis) ...
}

// دالة مساعدة لإضافة عنصر للقائمة
function addCheckItem(list, text, cssClass) {
    const li = document.createElement('li');
    li.className = `list-group-item ${cssClass}`;
    li.innerHTML = text;
    list.appendChild(li);
}

/* ==========================================================
   دوال OpenStreetMap المفقودة
   ========================================================== */



// دالة معالجة الأخطاء للموقع
function handleErrorResponseForLocation(error, errorDiv, btn) {
    errorDiv.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '📍 تحديد الموقع GPS';

    let msg = "";
    switch(error.code) {
        case error.PERMISSION_DENIED:
            msg = "❌ تم رفض إذن الموقع. قم بتفعيله من إعدادات المتصفح.";
            break;
        case error.POSITION_UNAVAILABLE:
            msg = "❌ إشارة GPS ضعيفة أو غير متوفرة.";
            break;
        case error.TIMEOUT:
            msg = "❌ انتهت المهلة. يرجى المحاولة في مكان مفتوح.";
            break;
        default:
            msg = "❌ حدث خطأ غير معروف.";
    }
    errorDiv.textContent = msg;
}

// دالة معالجة خطأ الموقع
function handleLocationErrorForLocation(errorDiv, btn, message) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = message;
    btn.disabled = false;
    btn.innerHTML = '📍 تحديد الموقع GPS';
}

/* ==========================================================
   تحديث نظام العنوان المكرر للشاشة السابعة
   ========================================================== */

function updateRepeatedAddress() {
    const locations = getAllLocationsData();
    const repeatedAddressDiv = document.getElementById('repeatedAddress');
    
    if (locations.length === 0) {
        repeatedAddressDiv.textContent = 'لم يتم تحديد أي مواقع بعد';
        return;
    }
    
    let addressHTML = '';
    
    locations.forEach((location, index) => {
        const locationType = index === 0 ? 'الموقع الرئيسي' : `موقع إضافي ${index}`;
        
        let addressText = '';
        if (location.addressDetails) addressText += location.addressDetails;
        if (location.city) addressText += (addressText ? '، ' : '') + location.city;
        if (location.governorate) addressText += (addressText ? '، ' : '') + location.governorate;
        
        addressHTML += `
            <div class="mb-2 p-2 border rounded bg-white">
                <strong>${locationType}:</strong><br>
                ${addressText || 'لم يتم تحديد العنوان بالكامل'}
                ${location.longitude && location.latitude ? 
                    `<br><small class="text-muted">الإحداثيات: ${location.latitude}, ${location.longitude}</small>` : ''}
            </div>
        `;
    });
    
    repeatedAddressDiv.innerHTML = addressHTML;
}

// دالة جمع بيانات جميع المواقع
function getAllLocationsData() {
    const locations = [];
    const locationSections = document.querySelectorAll('.location-section');
    
    locationSections.forEach((section, index) => {
        const locationData = {
            id: section.id || `location_${index}`,
            inspectionDate: section.querySelector('.inspection-date')?.value || '',
            governorate: section.querySelector('.governorate-select')?.value || '',
            city: section.querySelector('.city-select')?.value || '',
            addressDetails: section.querySelector('.address-details')?.value || '',
            longitude: section.querySelector('.longitude')?.value || '',
            latitude: section.querySelector('.latitude')?.value || '',
            mapLink: section.querySelector('.map-link')?.value || '',
            notes: section.querySelector('.location-notes')?.value || ''
        };
        
        locations.push(locationData);
    });
    
    return locations;
}




// معالجة تغيير المحافظة بشكل آمن
function handleGovernorateChange(event) {
    if (event.target.classList.contains('governorate-select')) {
        if (typeof updateCitiesForLocation === 'function') {
            updateCitiesForLocation(event.target);
        }
        
        // تحديث العنوان المكرر إذا كانت الشاشة الخامسة مفتوحة
        const step8 = document.getElementById('step8');
        if (step8 && step8.classList.contains('active')) {
            if (typeof updateRepeatedAddress === 'function') {
                updateRepeatedAddress();
            }
        }
    }
}

// معالجة إدخال العنوان بشكل آمن
function handleAddressInput(event) {
    if (event.target.classList.contains('address-details') || 
        event.target.classList.contains('city-select')) {
        
        const step8 = document.getElementById('step8');
        if (step8 && step8.classList.contains('active')) {
            if (typeof updateRepeatedAddress === 'function') {
                updateRepeatedAddress();
            }
        }
    }
}


// تحسين دالة عرض نتائج البحث في التراخيص
function displayActivityTypeSearchResults(results, searchTerm = '') {
    const resultsContainer = document.getElementById('activityTypeSearchResults');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="search-result-item text-muted" style="text-align: center; color: #999; cursor: default;">
                <i class="fas fa-search" style="font-size: 24px; margin-bottom: 8px;"></i>
                <div>لم يتم العثور على نتائج مطابقة</div>
                <small style="font-size: 11px;">جرب استخدام كلمات مختلفة</small>
            </div>
        `;
        resultsContainer.style.display = 'block';
        return;
    }
    
    // دالة لتمييز النص المطابق
    // دالة لتمييز النص المطابق (محسّنة)
function highlightMatch(text, term) {
    if (!term || !text) return text;
    
    const normalizedText = normalizeArabicText(text.toLowerCase());
    const normalizedTerm = normalizeArabicText(term.toLowerCase());
    
    // البحث عن الكلمة في النص
    let index = normalizedText.indexOf(normalizedTerm);
    
    if (index === -1) return text;
    
    // حساب طول الكلمة المطابقة في النص الأصلي
    // (قد يختلف عن طول كلمة البحث بسبب التشكيل والهمزات)
    let matchLength = term.length;
    
    // محاولة إيجاد الطول الصحيح
    let originalMatchedPart = text.substr(index, matchLength);
    let normalizedOriginal = normalizeArabicText(originalMatchedPart.toLowerCase());
    
    // تعديل الطول إذا لزم الأمر
    while (normalizedOriginal !== normalizedTerm && matchLength < text.length - index) {
        matchLength++;
        originalMatchedPart = text.substr(index, matchLength);
        normalizedOriginal = normalizeArabicText(originalMatchedPart.toLowerCase());
    }
    
    // تقسيم النص
    const beforeMatch = text.substr(0, index);
    const matchedText = text.substr(index, matchLength);
    const afterMatch = text.substr(index + matchLength);
    
    return `${beforeMatch}<span class="highlight">${matchedText}</span>${afterMatch}`;
}
    
    let html = '';
    const maxResults = 8; // عرض أول 8 نتائج فقط
    const displayResults = results.slice(0, maxResults);
    
    displayResults.forEach((item, index) => {
        const highlightedText = highlightMatch(item.text, searchTerm);
        const animationDelay = index * 0.05; // تأخير بسيط لكل نتيجة
        
        html += `
            <div class="search-result-item" 
                 onclick="selectActivityType('${item.value}', '${item.text.replace(/'/g, "\\'")}')"
                 style="animation: slideIn 0.3s ease ${animationDelay}s both;">
                ${highlightedText}
            </div>
        `;
    });
    
    // إضافة رسالة إذا كان هناك نتائج أكثر
    if (results.length > maxResults) {
        html += `
            <div class="search-result-item" style="background: #f0f0f0; cursor: default; text-align: center; color: #666; font-size: 12px;">
                <i class="fas fa-info-circle"></i> يوجد ${results.length - maxResults} نتيجة إضافية - استمر في الكتابة للتصفية
            </div>
        `;
    }
    
    resultsContainer.innerHTML = html;
    resultsContainer.style.display = 'block';
}

// إضافة keyframe للأنيميشن (يضاف مرة واحدة فقط)
if (!document.getElementById('searchAnimationStyle')) {
    const style = document.createElement('style');
    style.id = 'searchAnimationStyle';
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        
        /* تأثير نبض خفيف للنتيجة المختارة */
        @keyframes pulse {
            0%, 100% {
                box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
            }
            50% {
                box-shadow: 0 4px 16px rgba(33, 150, 243, 0.4);
            }
        }
    `;
    document.head.appendChild(style);
}

// دالة اختيار النشاط من نتائج البحث (محسّنة)
function selectActivityType(value, text) {
    // 1. إخفاء نتائج البحث وتحديث حقل النص
    const resultsContainer = document.getElementById('activityTypeSearchResults');
    resultsContainer.style.display = 'none';
    
    const searchInput = document.getElementById('activityTypeSearch');
    searchInput.value = text;
    
    // 2. تحديث القائمة المنسدلة المخفية
    const selectElement = document.getElementById('activityTypeSelect');
    selectElement.value = value;
    
    // 3. تحديث بيانات التراخيص (في الشاشة الرابعة)
    updateLicenseRequirements();
    
    // 🔥 الحل: استدعاء تحديث مراحل الإنتاج لشاشة المعاينة (الشاشة السابعة) 🔥
    if (typeof initProductionFlow === 'function') {
        initProductionFlow(value);
    }

    // 4. إطلاق حدث التغيير يدوياً لضمان مزامنة أي دوال أخرى مرتبطة بـ addEventListener
    const event = new Event('change', { bubbles: true });
    selectElement.dispatchEvent(event);
    
    // 5. إظهار رسالة نجاح وتأثيرات
    showSuccessMessage('تم اختيار النشاط وتحديث مراحل الإنتاج');
    
    if (searchInput) {
        searchInput.style.animation = 'pulse 0.5s ease';
        setTimeout(() => searchInput.style.animation = '', 500);
    }
}

// دالة لإظهار رسالة نجاح (إضافة اختيارية)
function showSuccessMessage(message) {
    // التحقق من وجود عنصر الرسالة
    let messageElement = document.getElementById('successMessage');
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'successMessage';
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            z-index: 10000;
            display: none;
            animation: fadeIn 0.3s ease;
            font-size: 14px;
            font-weight: 500;
        `;
        document.body.appendChild(messageElement);
    }
    
    messageElement.innerHTML = `<i class="fas fa-check-circle" style="margin-left: 8px;"></i> ${message}`;
    messageElement.style.display = 'block';
    
    // إخفاء الرسالة بعد 3 ثوانٍ
    setTimeout(() => {
        messageElement.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            messageElement.style.display = 'none';
            messageElement.style.animation = 'fadeIn 0.3s ease';
        }, 300);
    }, 3000);
}

// إضافة أنيميشن fadeOut في الـ CSS
if (!document.getElementById('fadeOutAnimation')) {
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.id = 'fadeOutAnimation';
    fadeOutStyle.textContent = `
        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-10px);
            }
        }
    `;
    document.head.appendChild(fadeOutStyle);
}

// إخفاء نتائج البحث عند النقر خارجها (محسّن)
document.addEventListener('click', function(event) {
    const searchInput = document.getElementById('activityTypeSearch');
    const searchResults = document.getElementById('activityTypeSearchResults');
    const searchContainer = searchInput ? searchInput.parentElement : null;
    
    // التحقق من أن النقر ليس داخل منطقة البحث
    if (searchContainer && !searchContainer.contains(event.target)) {
        if (searchResults) {
            searchResults.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => {
                searchResults.style.display = 'none';
                searchResults.style.animation = '';
            }, 200);
        }
    }
});

// تحسين حقل البحث: البحث عند كل ضغطة مفتاح
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('activityTypeSearch');
    
        // إظهار النتائج عند التركيز على الحقل (إذا كان هناك نص ونتائج مخفية)
        searchInput.addEventListener('focus', function() {
            const resultsContainer = document.getElementById('activityTypeSearchResults');
            if (this.value.trim().length > 0 && resultsContainer && resultsContainer.children.length > 0) {
                resultsContainer.style.display = 'block';
            }
        });

        // تحديث حقل البحث النصي عند اختيار نشاط من القائمة المنسدلة مباشرةً
        const activitySelect = document.getElementById('activityTypeSelect');
        if (activitySelect) {
            activitySelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                if (selectedOption && selectedOption.value && searchInput) {
                    searchInput.value = selectedOption.text;
                }
            });
        }
        
        // مسح حقل البحث عند الضغط على Escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                document.getElementById('activityTypeSearchResults').style.display = 'none';
                document.getElementById('activityTypeSelect').value = '';
            }
            
            // التنقل بين النتائج باستخدام الأسهم
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                navigateSearchResults(e.key === 'ArrowDown' ? 'down' : 'up');
            }
            
            // اختيار النتيجة المحددة بالضغط على Enter
            if (e.key === 'Enter') {
                e.preventDefault();
                selectHighlightedResult();
            }
        }); 
    });





// متغير لتتبع النتيجة المحددة حالياً
let currentHighlightedIndex = -1;

// دالة التنقل بين نتائج البحث بالأسهم
function navigateSearchResults(direction) {
    const resultsContainer = document.getElementById('activityTypeSearchResults');
    const resultItems = resultsContainer.querySelectorAll('.search-result-item:not([style*="cursor: default"])');
    
    if (resultItems.length === 0) return;
    
    // إزالة التمييز السابق
    if (currentHighlightedIndex >= 0 && currentHighlightedIndex < resultItems.length) {
        resultItems[currentHighlightedIndex].style.background = '';
        resultItems[currentHighlightedIndex].style.transform = '';
        resultItems[currentHighlightedIndex].style.borderLeft = '';
    }
    
    // تحديث الفهرس
    if (direction === 'down') {
        currentHighlightedIndex = (currentHighlightedIndex + 1) % resultItems.length;
    } else {
        currentHighlightedIndex = currentHighlightedIndex <= 0 ? resultItems.length - 1 : currentHighlightedIndex - 1;
    }
    
    // تمييز النتيجة الجديدة
    const highlightedItem = resultItems[currentHighlightedIndex];
    highlightedItem.style.background = 'linear-gradient(to right, #bbdefb 0%, #90caf9 100%)';
    highlightedItem.style.transform = 'translateX(5px)';
    highlightedItem.style.borderLeft = '4px solid #1976d2';
    
    // التمرير إلى النتيجة المحددة
    highlightedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// دالة اختيار النتيجة المحددة
function selectHighlightedResult() {
    const resultsContainer = document.getElementById('activityTypeSearchResults');
    const resultItems = resultsContainer.querySelectorAll('.search-result-item:not([style*="cursor: default"])');
    
    if (currentHighlightedIndex >= 0 && currentHighlightedIndex < resultItems.length) {
        resultItems[currentHighlightedIndex].click();
        currentHighlightedIndex = -1;
    }
}



// نظام مراقبة تغيير الشاشات
function setupStepObserver() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // عند تغيير الشاشة النشطة
                const step8 = document.getElementById('step8');
                if (step8 && step8.classList.contains('active')) {
                    if (typeof updateRepeatedAddress === 'function') {
                        updateRepeatedAddress();
                    }
                }
            }
        });
    });
    
    // مراقبة جميع عناصر الشاشات
    document.querySelectorAll('.step-section').forEach(section => {
        observer.observe(section, { attributes: true });
    });
}



console.log('🎯 تم تحميل نظام إدارة الأحداث الآمن');

function nextStep(stepNumber) {
    document.querySelectorAll('.step-section').forEach(el => el.classList.remove('active'));
    document.getElementById('step' + stepNumber).classList.add('active');
    window.scrollTo(0, 0);
    
    // تحديث العنوان المكرر عند الانتقال للشاشة الخامسة
    if (stepNumber === 8) {
        setTimeout(updateRepeatedAddress, 100);
    }
}

/* دوال الأقسام الجديدة في الشاشة السادسة */

/* دوال تبديل عرض الأقسام */

function toggleAssetsInvoicesSection() {
    const checkBox = document.getElementById('assetsInvoicesCheck');
    const section = document.getElementById('assetsInvoicesSection');
    section.style.display = checkBox.checked ? 'block' : 'none';
}

function togglePurchaseInvoicesSection() {
    const checkBox = document.getElementById('purchaseInvoicesCheck');
    const section = document.getElementById('purchaseInvoicesSection');
    section.style.display = checkBox.checked ? 'block' : 'none';
}

function toggleStoreAdditionsSection() {
    const checkBox = document.getElementById('storeAdditionsCheck');
    const section = document.getElementById('storeAdditionsSection');
    section.style.display = checkBox.checked ? 'block' : 'none';
}

function toggleSalesInvoicesSection() {
    const checkBox = document.getElementById('salesInvoicesCheck');
    const section = document.getElementById('salesInvoicesSection');
    section.style.display = checkBox.checked ? 'block' : 'none';
}

/* دوال إضافة الحقول ديناميكياً */

// 1. إضافة آلة (تنشئ صف في الشاشة 5 وصف في الشاشة 7)
function addAssetInvoice() {
    // إضافة في الشاشة 5
    const container5 = document.getElementById('assetsInvoicesContainer');
    const index = container5.querySelectorAll('.asset-invoice-item').length;
    const newItem5 = document.createElement('div');
    newItem5.className = 'asset-invoice-item mb-3 p-3 border rounded bg-white border-top border-dark position-relative';
    newItem5.innerHTML = `
        <div class="row g-3">
            <div class="col-md-3"><label class="small text-muted">اسم الآلة</label><input type="text" class="form-control form-control-sm sync-asset-name"></div>
            <div class="col-md-3"><label class="small text-muted">العدد</label><input type="number" class="form-control form-control-sm sync-asset-qty"></div>
            <div class="col-md-3"><label class="small text-muted">تاريخ الشراء</label><input type="date" class="form-control form-control-sm sync-asset-date"></div>
            <div class="col-md-2"><label class="small text-muted">القيمة</label><input type="number" class="form-control form-control-sm sync-asset-val"></div>
            <div class="col-md-1 d-flex align-items-end"><button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="removeSyncRow('asset', ${index})"><i class="bi bi-trash"></i></button></div>
        </div>`;
    container5.appendChild(newItem5);

    // إضافة في الشاشة 7 (استدعاء دالة الإضافة الأصلية مع تعديل بسيط)
    addMachineRowManual(); 
}

// 2. إضافة خامة (تنشئ صف في الشاشة 5 وصف في الشاشة 7)
function addPurchaseInvoice() {
    const container5 = document.getElementById('purchaseInvoicesContainer');
    const index = container5.querySelectorAll('.purchase-invoice-item').length;
    const newItem5 = document.createElement('div');
    newItem5.className = 'purchase-invoice-item mb-3 p-3 border rounded bg-white border-top border-primary position-relative';
    newItem5.innerHTML = `
        <div class="row g-3">
            <div class="col-md-3"><label class="small text-muted">اسم الخامة</label><input type="text" class="form-control form-control-sm sync-material-name"></div>
            <div class="col-md-3"><label class="small text-muted">الكمية</label><input type="number" class="form-control form-control-sm sync-material-qty"></div>
            <div class="col-md-3"><label class="small text-muted">التاريخ</label><input type="date" class="form-control form-control-sm sync-material-date"></div>
            <div class="col-md-2"><label class="small text-muted">القيمة</label><input type="number" class="form-control form-control-sm sync-material-val"></div>
            <div class="col-md-1 d-flex align-items-end"><button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="removeSyncRow('material', ${index})"><i class="bi bi-trash"></i></button></div>
        </div>`;
    container5.appendChild(newItem5);

    addMaterialRowManual();
}


// 3. إضافة إذن إضافة مخزني
function addStoreAddition() {
    const container = document.getElementById('storeAdditionsContainer');
    const newItem = document.createElement('div');
    newItem.className = 'store-addition-item mb-3 p-3 border rounded bg-white border-top border-success position-relative';
    newItem.innerHTML = `
        <div class="row g-3">
            <div class="col-md-3">
                <label class="info-label small">اسم المنتج</label>
                <input type="text" class="form-control form-control-sm" placeholder="أدخل اسم المنتج">
            </div>
            <div class="col-md-3">
                <label class="info-label small">الكمية</label>
                <input type="number" class="form-control form-control-sm" placeholder="الكمية المنتجة">
            </div>
            <div class="col-md-3">
                <label class="info-label small">تاريخ الإذن</label>
                <input type="date" class="form-control form-control-sm">
            </div>
            <div class="col-md-2">
                <label class="info-label small">القيمة (جنية)</label>
                <input type="number" class="form-control form-control-sm" placeholder="القيمة">
            </div>
            <div class="col-md-1 d-flex align-items-end">
                <button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="this.closest('.store-addition-item').remove()">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(newItem);
}

// 4. إضافة فاتورة بيع
function addSalesInvoice() {
    const container = document.getElementById('salesInvoicesContainer');
    const newItem = document.createElement('div');
    newItem.className = 'sales-invoice-item mb-3 p-3 border rounded bg-white border-top border-warning position-relative';
    newItem.innerHTML = `
        <div class="row g-2">
            <div class="col-md-3">
                <label class="info-label small">اسم المنتج</label>
                <input type="text" class="form-control form-control-sm" placeholder="اسم المنتج">
            </div>
            <div class="col-md-2">
                <label class="info-label small">رقم الفاتورة</label>
                <input type="text" class="form-control form-control-sm" placeholder="الرقم">
            </div>
            <div class="col-md-2">
                <label class="info-label small">الكمية</label>
                <input type="number" class="form-control form-control-sm" placeholder="العدد">
            </div>
            <div class="col-md-2">
                <label class="info-label small">التاريخ</label>
                <input type="date" class="form-control form-control-sm">
            </div>
            <div class="col-md-2">
                <label class="info-label small">القيمة (جنية)</label>
                <input type="number" class="form-control form-control-sm" placeholder="القيمة">
            </div>
            <div class="col-md-1 d-flex align-items-end">
                <button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="this.closest('.sales-invoice-item').remove()">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(newItem);
}// دوال الحذف
function removePurchaseInvoice(button) {
    const items = document.querySelectorAll('.purchase-invoice-item');
    if (items.length > 1) {
        button.closest('.purchase-invoice-item').remove();
    } else {
        alert('لا يمكن حذف السجل الوحيد المتبقي');
    }
}

function removeStoreAddition(button) {
    const items = document.querySelectorAll('.store-addition-item');
    if (items.length > 1) {
        button.closest('.store-addition-item').remove();
    } else {
        alert('لا يمكن حذف السجل الوحيد المتبقي');
    }
}

function removeSalesInvoice(button) {
    const items = document.querySelectorAll('.sales-invoice-item');
    if (items.length > 1) {
        button.closest('.sales-invoice-item').remove();
    } else {
        alert('لا يمكن حذف السجل الوحيد المتبقي');
    }
}

// دالة تحديث بادج نوع النشاط
function updateActivityTypeBadge(activityType) {
    const badge = document.getElementById('activityTypeBadge');
    const select = document.getElementById('activityTypeSelect');
    const selectedOption = select.options[select.selectedIndex];
    
    if (activityType && selectedOption.text) {
        badge.textContent = selectedOption.text;
        badge.style.backgroundColor = getActivityBadgeColor(activityType);
    } else {
        badge.textContent = "--";
        badge.style.backgroundColor = '#6c757d';
    }
}

// دالة للحصول على لون البادج بناءً على نوع النشاط
function getActivityBadgeColor(activityType) {
    const colorMap = {
        'صناعي': '#dc3545',
        'فندق': '#0d6efd',
        'قرية': '#198754',
        'نقل': '#fd7e14',
        'غوص': '#20c997',
        'عائم': '#6f42c1',
        'يخت': '#e83e8c',
        'زراعي': '#28a745',
        'حيواني': '#17a2b8',
        'داجني': '#ffc107',
        'سمكي': '#6610f2'
    };
    
    return colorMap[activityType] || '#0d6efd';
}

/* ==========================================================
   نظام إدارة ممثلي الشركة والعلاقات العامة
   ========================================================== */

// تهيئة الحقول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تعيين التاريخ الحالي كحد أدنى
    const today = new Date().toISOString().split('T')[0];
    
    // تعيين اليوم التالي كقيمة افتراضية
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    const inspectionDateInput = document.getElementById('inspectionDate');
    if (inspectionDateInput) {
        inspectionDateInput.value = tomorrowString; // اليوم التالي
        inspectionDateInput.min = today; // لا يمكن اختيار تاريخ قديم
    }
    
    // تعيين الساعة 9:00 صباحاً كقيمة افتراضية
    const inspectionTimeInput = document.getElementById('inspectionTime');
    if (inspectionTimeInput) {
        inspectionTimeInput.value = '09:00';
    }
    
    // تحديث زر الواتساب عند تغيير البيانات
    const inputsToWatch = ['prRepName', 'prRepPhone', 'inspectionDate', 'inspectionTime', 'companyName', 'address', 'decisionNoInput'];
    inputsToWatch.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', updateWhatsAppButton);
            input.addEventListener('change', updateWhatsAppButton);
        }
    });
});

// تحديث حالة زر الواتساب
function updateWhatsAppButton() {
    const prPhone = document.getElementById('prRepPhone').value;
    const whatsappBtn = document.getElementById('whatsappBtn');
    
    if (prPhone && prPhone.trim().length >= 10) {
        whatsappBtn.disabled = false;
        whatsappBtn.title = 'إرسال رسالة واتساب لممثل العلاقات العامة';
    } else {
        whatsappBtn.disabled = true;
        whatsappBtn.title = 'يرجى إدخال رقم هاتف ممثل العلاقات العامة';
    }
}

// دالة إرسال رسالة الواتساب لممثل العلاقات العامة
function sendWhatsAppMessage() {
    // جمع البيانات من الحقول
    const prName = document.getElementById('prRepName').value.trim();
    const prPhone = document.getElementById('prRepPhone').value.trim();
    const companyName = document.getElementById('companyName').value.trim();
    const decisionNo = document.getElementById('decisionNoInput').value.trim();
    const decisionDateLabel = document.getElementById('decisionDateLabel').innerText;
    const companyAddress = document.getElementById('address').value.trim();
    const inspectionDate = document.getElementById('inspectionDate').value;
    const inspectionTime = document.getElementById('inspectionTime').value;
    
    // التحقق من البيانات المطلوبة
    if (!prPhone) {
        alert('❌ يرجى إدخال رقم هاتف ممثل العلاقات العامة');
        return;
    }
    
    // تنسيق اسم الممثل
    const prNameFormatted = prName ? `السيد الاستاذ/ ${prName}` : 'السيد الاستاذ/ ممثل العلاقات العامة';
    
    // تنسيق رقم القرار والتاريخ
    let decisionInfo = '';
    if (decisionNo) {
        if (decisionDateLabel && decisionDateLabel.includes('الصادر في:')) {
            const decisionDate = decisionDateLabel.replace('الصادر في:', '').trim();
            decisionInfo = `وفقا لقرار الهيئة رقم ${decisionNo} بتاريخ ${decisionDate}`;
        } else {
            decisionInfo = `وفقا لقرار الهيئة رقم ${decisionNo}`;
        }
    }
    
    // تنسيق تاريخ المعاينة
    let inspectionDateFormatted = '';
    if (inspectionDate) {
        const dateObj = new Date(inspectionDate);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        inspectionDateFormatted = `${day}/${month}/${year}`;
    }
    
    // تنسيق وقت المعاينة
    let inspectionTimeFormatted = '';
    if (inspectionTime) {
        const timeParts = inspectionTime.split(':');
        if (timeParts.length >= 2) {
            const hours = parseInt(timeParts[0]);
            const minutes = timeParts[1];
            inspectionTimeFormatted = `${hours}:${minutes}`;
        }
    }
    
    // بناء نص الرسالة
    const messageLines = [
        `${prNameFormatted} 
          تحيه طيبة وبعد`,
        '',
        'يرجي التفضل بتوفير سيارة لمعاينة',
        companyName ? `شركة: ${companyName}` : 'شركة',
        decisionInfo ? decisionInfo : 'وفقا لقرار الهيئة',
        '',
        'موقع المعاينة:',
        companyAddress || 'موقع الشركة',
        '',
        inspectionDateFormatted ? `وذلك يوم ${inspectionDateFormatted}` : 'وذلك يوم',
        inspectionTimeFormatted ? `في تمام الساعة ${inspectionTimeFormatted}` : '',
        '',
         `وتفضلوا بقبول فائق الاحترام` 
    ];
    
    // تنظيف الرسالة من الأسطر الفارغة
    const filteredMessage = messageLines.filter(line => line.trim() !== '');
    const finalMessage = filteredMessage.join('\n');
    
    // تنظيف رقم الهاتف (إزالة المسافات والرموز)
    let cleanPhone = prPhone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    // إضافة مفتاح الدولة إذا لم يكن موجوداً
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
        cleanPhone = '+20' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('1') && cleanPhone.length === 10) {
        cleanPhone = '+20' + cleanPhone;
    } else if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+2' + cleanPhone;
    }
    
    // ترميز النص لرابط الواتساب
    const encodedMessage = encodeURIComponent(finalMessage);
    
    // إنشاء رابط الواتساب
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // فتح الرابط في نافذة جديدة
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    // عرض رسالة تأكيد
    showNotification('تم إنشاء رسالة الواتساب بنجاح', 'The WhatsApp message has been successfully created');
}

// دالة لعرض إشعار
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 8px;
    `;
    
    notification.innerHTML = `
        <strong>${type === 'success' ? '✅' : 'ℹ️'}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // إضافة الإشعار إلى الصفحة
    document.body.appendChild(notification);
    
    // إزالة الإشعار تلقائياً بعد 5 ثوانٍ
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// دالة لتنسيق رقم الهاتف أثناء الكتابة
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.startsWith('01')) {
        // تنسيق رقم مصري: 01XXXXXXXXX
        if (value.length <= 11) {
            let formatted = '';
            for (let i = 0; i < value.length; i++) {
                if (i === 2 || i === 5 || i === 8) {
                    formatted += ' ';
                }
                formatted += value[i];
            }
            input.value = formatted.trim();
        }
    }
}

// إضافة مستمعين للأحداث على حقول الهواتف
document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = ['companyRepPhone', 'prRepPhone'];
    
    phoneInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                formatPhoneNumber(this);
                if (id === 'prRepPhone') {
                    updateWhatsAppButton();
                }
            });
        }
    });
});

// تحديث العنوان في رسالة الواتساب عند تغيير بيانات الشركة
function updateCompanyAddressInMessage() {
    // سيتم استدعاء هذه الدالة عند تغيير بيانات الشركة
    updateWhatsAppButton();
}

// ربط تحديث رسالة الواتساب مع تغيير بيانات الشركة
document.addEventListener('DOMContentLoaded', function() {
    const companyDataFields = ['companyName', 'address'];
    
    companyDataFields.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateCompanyAddressInMessage);
            input.addEventListener('change', updateCompanyAddressInMessage);
        }
    });
});

/* 15. دالة التحقق من تاريخ الانتهاء وتوليد التنبيهات */
function checkExpiryDate(dateInput, alertDivId) {
    const alertDiv = document.getElementById(alertDivId);
    if (!dateInput.value) {
        alertDiv.innerHTML = '';
        return;
    }

    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(today.getMonth() + 1);

    let alertMessage = '';
    let alertClass = '';

    if (selectedDate < today) {
        alertMessage = '⚠️ تنبيه: تاريخ الانتهاء منقضي. يرجى التحقق من سريان الوثيقة.';
        alertClass = 'alert alert-danger';
    } else if (selectedDate <= oneMonthFromNow) {
        alertMessage = '⚠️ تنبيه: تاريخ الانتهاء يقترب (أقل من شهر). يرجى تجديد الوثيقة قريباً.';
        alertClass = 'alert alert-warning';
    } else {
        alertMessage = '✅ الوثيقة سارية.';
        alertClass = 'alert alert-success';
    }

    alertDiv.innerHTML = `<div class="${alertClass} p-2 small">${alertMessage}</div>`;
}

/* 16. دالة التحقق من جميع التواريخ دفعة واحدة */
function validateAllExpiryDates() {
    const expiryInputs = [
        { id: 'commercialRegisterExpiry', alertId: 'commercialRegisterAlert' },
        { id: 'taxCardExpiry', alertId: 'taxCardAlert' }
    ];

    expiryInputs.forEach(item => {
        const input = document.getElementById(item.id);
        if (input) {
            checkExpiryDate(input, item.alertId);
        }
    });
}

/* 17. نظام تحليل الفواتير الذكي */
/* ==========================================================
/* ==========================================================
   🔥 محرك التدقيق الجنائي الذكي V9 SUPREME 🔥
   ========================================================== 
   المزايا الثورية:
   ✓ كشف تلاعب متعدد الطبقات (Multi-Layer Fraud Detection)
   ✓ تحليل ذكي لجميع الأنشطة (صناعي/تجاري/خدمي/زراعي/فندقي)
   ✓ تحديث فوري لحظي (Real-time) مع Debounce ذكي
   ✓ محاكاة مخزنية دقيقة بالتسلسل الزمني الكامل
   ✓ كشف الأنماط الشاذة (Anomaly Detection)
   ✓ تحليل الربحية متعدد المستويات
   ✓ نظام تصنيف تلقائي للنشاط
   ✓ واجهة بصرية احترافية مع أيقونات ديناميكية
   ========================================================== */

const SUPREME_AUDITOR = {
    // ⚙️ إعدادات النظام القابلة للتخصيص
    config: {
        precisionMargin: 0.001,           // هامش الخطأ المسموح للكميات العشرية
        highProfitThreshold: 250,         // تنبيه إذا تجاوز الربح 250%
        lowProfitThreshold: 5,            // تنبيه إذا انخفض الربح عن 5%
        negativeProfitAlert: true,        // تفعيل تنبيه الخسارة
        stockAlertThreshold: 100000,      // تنبيه للمخزون الراكد بقيمة أكبر من
        debounceDelay: 350,               // تأخير التحديث (مللي ثانية)
        enableLoadingIndicator: true,     // مؤشر التحميل
        dateFormat: 'ar-EG',              // تنسيق التاريخ
        currencySymbol: 'جنيه'            // رمز العملة
    },

    // 🎯 المحرك الرئيسي - يعمل بذكاء خارق
    analyze: function() {
        const container = document.getElementById('invoiceRecommendations');
        if (!container) return;

        // عرض مؤشر معالجة احترافي
        if (this.config.enableLoadingIndicator) {
            container.innerHTML = `
                <div class="d-flex align-items-center justify-content-center py-3 text-primary">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    <span class="small fw-bold">المحرك الذكي يحلل البيانات...</span>
                </div>`;
        }

        // معالجة بعد 50ms لعرض المؤشر
        setTimeout(() => {
            try {
                const data = this.extractData();

                // حالة عدم وجود بيانات
                if (data.totalRecords === 0) {
                    container.innerHTML = `
                        <div class="alert alert-light border-0 shadow-sm text-center py-4">
                            <i class="bi bi-shield-check text-success fs-1 d-block mb-3"></i>
                            <h6 class="text-dark mb-2">🎯 نظام تحليل الفواتير  جاهز</h6>
                            <p class="text-muted small mb-0">ابدأ بإدخال الآلات والفواتير، وسأقوم بالتحليل الفوري والكشف عن أي تلاعبات محتملة.</p>
                        </div>`;
                    return;
                }

                let auditResults = [];

                // 🏭 المرحلة 1: تصنيف النشاط تلقائياً
                const activityType = this.detectActivityType(data);
                auditResults.push({
                    type: 'primary',
                    priority: 0,
                    msg: `🏢 <b>نوع النشاط المكتشف:</b> ${activityType.label} <span class="badge bg-primary">${activityType.confidence}%</span>`
                });

                // 🔍 المرحلة 2: فحص سلامة الأصول (الآلات/المعدات)
                auditResults.push(...this.auditAssets(data));

                // ⏰ المرحلة 3: التحليل الزمني المتقدم
                auditResults.push(...this.auditTimeline(data));

                // 📊 المرحلة 4: محاكاة المخزون الشاملة
                const inventoryResults = this.simulateInventory(data);
                auditResults.push(...inventoryResults.errors);
                auditResults.push(...inventoryResults.warnings);
                auditResults.push(...inventoryResults.success);

                // 🛒 المرحلة 5: كشف النشاط التجاري
                auditResults.push(...this.detectTrading(data));

                // 💰 المرحلة 6: التحليل المالي الشامل
                auditResults.push(...this.auditFinancials(data));

                // 🎨 المرحلة 7: كشف الأنماط الشاذة (Anomaly Detection)
                auditResults.push(...this.detectAnomalies(data));

                // 📈 المرحلة 8: تحليل الأداء والكفاءة
                auditResults.push(...this.analyzePerformance(data));

                // عرض النتائج بتصميم احترافي
                this.render(auditResults, container);

            } catch (error) {
                console.error("❌ خطأ في المحرك:", error);
                container.innerHTML = `
                    <div class="alert alert-danger d-flex align-items-center">
                        <i class="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
                        <div>
                            <strong>خطأ في المعالجة</strong>
                            <div class="small">الرجاء التحقق من صحة البيانات المدخلة وإعادة المحاولة.</div>
                        </div>
                    </div>`;
            }
        }, 50);
    },

    // 📦 استخراج البيانات بذكاء فائق
    extractData: function() {
        const extractRows = (className, type) => {
            const rows = [];
            document.querySelectorAll(`.${className}`).forEach((row, index) => {
                const inputs = row.querySelectorAll('input');
                const name = inputs[0]?.value.trim();
                
                let qty, date, val;
                
                // تحديد موقع الأعمدة حسب نوع الجدول
                if (className === 'asset-invoice-item') {
                    qty = parseFloat(inputs[1]?.value);
                    date = new Date(inputs[2]?.value);
                    val = parseFloat(inputs[3]?.value) || 0;
                } else if (className === 'sales-invoice-item') {
                    qty = parseFloat(inputs[2]?.value);
                    date = new Date(inputs[3]?.value);
                    val = parseFloat(inputs[4]?.value) || 0;
                } else {
                    qty = parseFloat(inputs[1]?.value);
                    date = new Date(inputs[2]?.value);
                    val = parseFloat(inputs[3]?.value) || 0;
                }

                // التحقق من اكتمال البيانات الأساسية
                if (name && !isNaN(qty) && qty > 0 && !isNaN(date.getTime())) {
                    rows.push({
                        id: `${type}_${index}`,
                        name: name,
                        nameLower: name.toLowerCase(),
                        qty: qty,
                        date: date,
                        val: val,
                        type: type,
                        unitCost: val > 0 && qty > 0 ? val / qty : 0
                    });
                }
            });
            return rows;
        };

        const assets = extractRows('asset-invoice-item', 'ASSET');
        const purchases = extractRows('purchase-invoice-item', 'PURCHASE');
        const additions = extractRows('store-addition-item', 'ADDITION');
        const sales = extractRows('sales-invoice-item', 'SALE');

        const allTransactions = [...assets, ...purchases, ...additions, ...sales];
        const itemTransactions = [...purchases, ...additions, ...sales];
        
        // استخراج الأسماء الفريدة
        const uniqueItems = [...new Set(itemTransactions.map(i => i.nameLower))];

        // حساب القيم الإجمالية
        const totals = {
            assets: assets.reduce((sum, i) => sum + i.val, 0),
            purchases: purchases.reduce((sum, i) => sum + i.val, 0),
            additions: additions.reduce((sum, i) => sum + i.val, 0),
            sales: sales.reduce((sum, i) => sum + i.val, 0)
        };

        return {
            assets, purchases, additions, sales,
            allTransactions, itemTransactions, uniqueItems,
            totals,
            totalRecords: allTransactions.length,
            hasAssets: assets.length > 0,
            hasPurchases: purchases.length > 0,
            hasProduction: additions.length > 0,
            hasSales: sales.length > 0
        };
    },

    // 🎯 تصنيف النشاط الذكي
    detectActivityType: function(data) {
        let scores = {
            manufacturing: 0,    // صناعي
            trading: 0,          // تجاري
            service: 0,          // خدمي
            agricultural: 0,     // زراعي/حيواني
            mixed: 0             // مختلط
        };

        // مؤشرات النشاط الصناعي
        if (data.hasAssets) scores.manufacturing += 40;
        if (data.hasProduction) scores.manufacturing += 30;
        if (data.hasAssets && data.hasProduction && data.hasPurchases) scores.manufacturing += 30;

        // مؤشرات النشاط التجاري
        const tradingItems = this.findTradingItems(data);
        if (tradingItems.length > 0) {
            scores.trading += tradingItems.length * 15;
            if (!data.hasAssets && !data.hasProduction) scores.trading += 40;
        }

        // مؤشرات النشاط الخدمي
        if (data.hasSales && !data.hasPurchases && !data.hasAssets) scores.service += 70;
        if (data.sales.some(s => s.name.match(/خدمة|استشار|تدريب|صيانة/i))) scores.service += 30;

        // مؤشرات النشاط الزراعي/الحيواني
        if (data.purchases.some(p => p.name.match(/بذور|أسمدة|علف|دواجن|ماشية/i))) scores.agricultural += 50;
        if (data.additions.some(a => a.name.match(/محصول|إنتاج حيواني|ألبان/i))) scores.agricultural += 50;

        // نشاط مختلط
        if (scores.manufacturing > 50 && scores.trading > 50) scores.mixed += 80;

        // تحديد النشاط الأعلى
        const maxScore = Math.max(...Object.values(scores));
        const activity = Object.keys(scores).find(k => scores[k] === maxScore);

        const labels = {
            manufacturing: '🏭 نشاط صناعي/إنتاجي',
            trading: '🛒 نشاط تجاري',
            service: '🤝 نشاط خدمي',
            agricultural: '🌾 نشاط زراعي/حيواني',
            mixed: '🔀 نشاط مختلط (صناعي + تجاري)'
        };

        return {
            type: activity,
            label: labels[activity] || '📊 نشاط عام',
            confidence: Math.min(Math.round(maxScore), 100)
        };
    },

    // 🏗️ فحص الأصول (الآلات والمعدات)
    auditAssets: function(data) {
        let results = [];

        if (data.assets.length === 0) {
            // لا يوجد أصول
            if (data.hasProduction) {
                results.push({
                    type: 'danger',
                    priority: 1,
                    msg: '🚨 <b>شبهة تلاعب خطيرة:</b> يوجد إنتاج منتجات تامة بدون وجود أي آلات أو معدات مسجلة في المصنع!'
                });
            } else if (data.hasPurchases && data.totals.purchases > 50000 && !data.hasSales) {
                results.push({
                    type: 'warning',
                    priority: 2,
                    msg: `⚠️ <b>تجميد استثماري:</b> توجد مشتريات بقيمة <b>${data.totals.purchases.toLocaleString()}</b> ${this.config.currencySymbol} بدون أصول إنتاجية. قد تكون نشاطاً تجارياً أو معطلة.`
                });
            }
        } else {
            // يوجد أصول
            const sortedAssets = [...data.assets].sort((a, b) => a.date - b.date);
            const firstAssetDate = sortedAssets[0].date;
            const totalAssetValue = data.totals.assets;

            // فحص: إنتاج قبل شراء الآلات
            const preAssetProduction = data.additions.filter(a => a.date < firstAssetDate);
            if (preAssetProduction.length > 0) {
                results.push({
                    type: 'danger',
                    priority: 1,
                    msg: `🛑 <b>استحالة فيزيائية:</b> تم تسجيل إنتاج "${preAssetProduction[0].name}" بتاريخ ${this.formatDate(preAssetProduction[0].date)} قبل شراء الآلات بتاريخ ${this.formatDate(firstAssetDate)}`
                });
            }

            // فحص: مبيعات قبل شراء الآلات
            const preAssetSales = data.sales.filter(s => s.date < firstAssetDate);
            if (preAssetSales.length > 0) {
                results.push({
                    type: 'danger',
                    priority: 1,
                    msg: `🛑 <b>تناقض زمني:</b> تم بيع "${preAssetSales[0].name}" قبل إنشاء القدرة الإنتاجية.`
                });
            }

            // رسالة تأكيد السلامة
            if (preAssetProduction.length === 0 && preAssetSales.length === 0) {
                results.push({
                    type: 'success',
                    priority: 8,
                    msg: `✅ <b>التسلسل المنطقي سليم:</b> الآلات ⬅️ الإنتاج ⬅️ المبيعات متوافق زمنياً.`
                });
            }

            results.push({
                type: 'info',
                priority: 9,
                msg: `🏗️ <b>القدرة الإنتاجية:</b> ${data.assets.length} أصل بقيمة استثمارية <b>${totalAssetValue.toLocaleString()}</b> ${this.config.currencySymbol}.`
            });
        }

        return results;
    },

    // ⏰ التحليل الزمني المتقدم
    auditTimeline: function(data) {
        let results = [];

        data.uniqueItems.forEach(itemName => {
            const itemPurchases = data.purchases.filter(p => p.nameLower === itemName);
            const itemAdditions = data.additions.filter(a => a.nameLower === itemName);
            const itemSales = data.sales.filter(s => s.nameLower === itemName);

            // فحص: بيع بدون مصدر
            if (itemSales.length > 0 && itemPurchases.length === 0 && itemAdditions.length === 0) {
                results.push({
                    type: 'warning',
                    priority: 3,
                    msg: `❓ <b>مصدر غامض:</b> يتم بيع "${itemName}" بدون أي مشتريات أو إنتاج مسجل. قد يكون مخزون سابق أو تلاعب.`
                });
            }

            // فحص: بيع قبل الشراء/الإنتاج
            if (itemSales.length > 0 && (itemPurchases.length > 0 || itemAdditions.length > 0)) {
                const firstInDate = new Date(Math.min(
                    ...[...itemPurchases, ...itemAdditions].map(i => i.date.getTime())
                ));
                const firstSale = itemSales.sort((a, b) => a.date - b.date)[0];
                
                if (firstSale.date < firstInDate) {
                    results.push({
                        type: 'danger',
                        priority: 2,
                        msg: `⏳ <b>خرق التسلسل الزمني:</b> بيع "${itemName}" بتاريخ ${this.formatDate(firstSale.date)} قبل أول إدخال له بتاريخ ${this.formatDate(firstInDate)}.`
                    });
                }
            }
        });

        return results;
    },

    // 📊 محاكاة المخزون الشاملة (الجوهرة التقنية)
    simulateInventory: function(data) {
        let errors = [], warnings = [], success = [];

        data.uniqueItems.forEach(itemName => {
            const timeline = data.itemTransactions
                .filter(t => t.nameLower === itemName)
                .sort((a, b) => a.date - b.date);

            let stock = 0;
            let totalCost = 0;
            let transactions = [];
            let hasNegative = false;

            timeline.forEach(trans => {
                if (trans.type === 'PURCHASE' || trans.type === 'ADDITION') {
                    stock += trans.qty;
                    totalCost += trans.val;
                    transactions.push({ type: 'IN', qty: trans.qty, date: trans.date });
                } else if (trans.type === 'SALE') {
                    if (trans.qty > stock + this.config.precisionMargin) {
                        hasNegative = true;
                        errors.push({
                            type: 'danger',
                            priority: 1,
                            msg: `⚖️ <b>عجز حرج في المخزون:</b> بيع <b>${trans.qty}</b> من "${itemName}" بتاريخ ${this.formatDate(trans.date)} والرصيد المتاح فقط <b>${stock.toFixed(2)}</b>.`
                        });
                    }
                    stock -= trans.qty;
                    transactions.push({ type: 'OUT', qty: trans.qty, date: trans.date });
                }
            });

            // تحليل الرصيد النهائي
            if (stock > 0) {
                if (totalCost > 0) {
                    const avgCost = (totalCost / (stock + transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.qty, 0))).toFixed(2);
                    
                    if (totalCost > this.config.stockAlertThreshold) {
                        warnings.push({
                            type: 'warning',
                            priority: 4,
                            msg: `📦 <b>مخزون راكد عالي القيمة:</b> "${itemName}" متبقي <b>${stock.toFixed(2)}</b> بقيمة <b>${totalCost.toLocaleString()}</b> ${this.config.currencySymbol} (متوسط: ${avgCost}).`
                        });
                    } else {
                        success.push({
                            type: 'success',
                            priority: 8,
                            msg: `✅ <b>مخزون سليم:</b> "${itemName}" رصيد <b>${stock.toFixed(2)}</b> بقيمة ${totalCost.toLocaleString()} ${this.config.currencySymbol}.`
                        });
                    }
                }
            } else if (stock < -this.config.precisionMargin) {
                errors.push({
                    type: 'danger',
                    priority: 1,
                    msg: `🔴 <b>رصيد سالب نهائي:</b> "${itemName}" الرصيد الختامي <b>${stock.toFixed(2)}</b> (مستحيل منطقياً).`
                });
            } else if (!hasNegative && data.hasSales) {
                success.push({
                    type: 'success',
                    priority: 8,
                    msg: `✅ <b>توازن مثالي:</b> حركة "${itemName}" منضبطة تماماً.`
                });
            }
        });

        return { errors, warnings, success };
    },

    // 🛒 كشف النشاط التجاري
    detectTrading: function(data) {
        let results = [];
        const tradingItems = this.findTradingItems(data);

        if (tradingItems.length > 0) {
            results.push({
                type: 'info',
                priority: 7,
                msg: `🏪 <b>أصناف تجارية مكتشفة:</b> ${tradingItems.map(t => `"${t}"`).join(' • ')}`
            });
        }

        return results;
    },

    // 🔍 إيجاد الأصناف التجارية
    findTradingItems: function(data) {
        const purchasedNames = new Set(data.purchases.map(p => p.nameLower));
        const soldNames = new Set(data.sales.map(s => s.nameLower));
        return [...soldNames].filter(name => purchasedNames.has(name));
    },

    // 💰 التحليل المالي الشامل
    auditFinancials: function(data) {
        let results = [];

        const { assets: totalAssets, purchases: totalPurchases, sales: totalSales } = data.totals;

        // تحليل الربحية
        if (totalPurchases > 0 && totalSales > 0) {
            const profit = totalSales - totalPurchases;
            const margin = ((profit / totalPurchases) * 100).toFixed(1);

            if (margin > this.config.highProfitThreshold) {
                results.push({
                    type: 'warning',
                    priority: 3,
                    msg: `💸 <b>هامش ربح شاذ:</b> الهامش <b>${margin}%</b> مرتفع جداً (>${this.config.highProfitThreshold}%). قد يشير لأسعار بيع مبالغ فيها أو تكاليف غير مكتملة.`
                });
            } else if (margin < this.config.lowProfitThreshold && margin > 0) {
                results.push({
                    type: 'warning',
                    priority: 4,
                    msg: `📉 <b>هامش ربح ضئيل:</b> الربحية <b>${margin}%</b> منخفضة جداً (<${this.config.lowProfitThreshold}%). قد تحتاج لمراجعة الأسعار.`
                });
            } else if (margin < 0) {
                if (this.config.negativeProfitAlert) {
                    results.push({
                        type: 'danger',
                        priority: 2,
                        msg: `📉 <b>خسارة فعلية:</b> المبيعات أقل من التكاليف بنسبة <b>${Math.abs(margin)}%</b>. خسارة قدرها ${Math.abs(profit).toLocaleString()} ${this.config.currencySymbol}.`
                    });
                }
            } else {
                results.push({
                    type: 'success',
                    priority: 7,
                    msg: `💰 <b>ربحية صحية:</b> هامش الربح الإجمالي <b>${margin}%</b> في النطاق الطبيعي.`
                });
            }
        } else if (totalPurchases > 0 && totalSales === 0) {
            results.push({
                type: 'primary',
                priority: 6,
                msg: `📦 <b>رأس مال معطل:</b> سيولة مجمدة في المخزون بقيمة <b>${totalPurchases.toLocaleString()}</b> ${this.config.currencySymbol} بانتظار التصنيع/البيع.`
            });
        }

        return results;
    },

    // 🎨 كشف الأنماط الشاذة (Anomaly Detection)
    detectAnomalies: function(data) {
        let results = [];

        // كشف أسعار البيع الشاذة
        const salesByItem = {};
        data.sales.forEach(s => {
            if (!salesByItem[s.nameLower]) salesByItem[s.nameLower] = [];
            salesByItem[s.nameLower].push(s.unitCost);
        });

        Object.keys(salesByItem).forEach(item => {
            const prices = salesByItem[item];
            if (prices.length > 1) {
                const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                const maxPrice = Math.max(...prices);
                const minPrice = Math.min(...prices);
                
                if ((maxPrice - minPrice) / avgPrice > 0.5) { // تباين >50%
                    results.push({
                        type: 'warning',
                        priority: 5,
                        msg: `📊 <b>تذبذب سعري غير طبيعي:</b> "${item}" يُباع بأسعار متفاوتة بشكل كبير (${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} ${this.config.currencySymbol}).`
                    });
                }
            }
        });

        // كشف فترات ركود طويلة
        if (data.hasSales && data.sales.length > 2) {
            const sortedSales = [...data.sales].sort((a, b) => a.date - b.date);
            for (let i = 1; i < sortedSales.length; i++) {
                const daysDiff = (sortedSales[i].date - sortedSales[i-1].date) / (1000 * 60 * 60 * 24);
                if (daysDiff > 90) { // أكثر من 3 شهور
                    results.push({
                        type: 'info',
                        priority: 8,
                        msg: `⏸️ <b>فجوة زمنية:</b> توقف نشاط البيع لمدة ${Math.round(daysDiff)} يوم بين ${this.formatDate(sortedSales[i-1].date)} و ${this.formatDate(sortedSales[i].date)}.`
                    });
                    break; // عرض أول فجوة فقط
                }
            }
        }

        return results;
    },

    // 📈 تحليل الأداء والكفاءة
    analyzePerformance: function(data) {
        let results = [];

        // معدل دوران المخزون (إذا وجدت بيانات كافية)
        if (data.hasPurchases && data.hasSales && data.totals.purchases > 0) {
            const turnoverRatio = (data.totals.sales / data.totals.purchases).toFixed(2);
            
            if (turnoverRatio < 0.5) {
                results.push({
                    type: 'warning',
                    priority: 6,
                    msg: `🔄 <b>بطء دوران المخزون:</b> معدل الدوران ${turnoverRatio}x منخفض. قد يشير لتكدس بضاعة.`
                });
            } else if (turnoverRatio > 3) {
                results.push({
                    type: 'success',
                    priority: 9,
                    msg: `🔄 <b>كفاءة تشغيلية عالية:</b> معدل دوران المخزون ${turnoverRatio}x ممتاز.`
                });
            }
        }

        // متوسط قيمة الفاتورة
        if (data.sales.length > 3) {
            const avgSaleValue = data.totals.sales / data.sales.length;
            results.push({
                type: 'info',
                priority: 9,
                msg: `💳 <b>متوسط قيمة البيع:</b> ${avgSaleValue.toLocaleString()} ${this.config.currencySymbol} لكل فاتورة (${data.sales.length} فاتورة).`
            });
        }

        return results;
    },

    // 🎨 العرض الاحترافي مع ترتيب ذكي
    render: function(results, container) {
        if (results.length === 0) {
            container.innerHTML = `
                <div class="alert alert-secondary text-center">
                    <i class="bi bi-search fs-3 d-block mb-2"></i>
                    <span class="small">لا توجد توصيات حالياً</span>
                </div>`;
            return;
        }

        // ترتيب حسب الأولوية
        results.sort((a, b) => (a.priority || 10) - (b.priority || 10));

        const html = results.map(item => {
            const icon = this.getIcon(item.type);
            const borderColor = this.getBorderColor(item.type);
            
            return `
                <div class="alert alert-${item.type} d-flex align-items-start shadow-sm mb-2 p-3 border-0 animate__animated animate__fadeInUp" 
                     style="border-right: 5px solid ${borderColor} !important; border-radius: 10px;">
                    <div class="me-3 fs-4">${icon}</div>
                    <div style="flex: 1; font-size: 0.9rem; line-height: 1.6;">${item.msg}</div>
                </div>`;
        }).join('');

        container.innerHTML = html;
    },

    // 🎯 أدوات مساعدة
    getIcon: function(type) {
        const icons = {
            danger: '<i class="bi bi-exclamation-octagon-fill text-danger"></i>',
            warning: '<i class="bi bi-exclamation-triangle-fill text-warning"></i>',
            success: '<i class="bi bi-check-circle-fill text-success"></i>',
            primary: '<i class="bi bi-box-seam text-primary"></i>',
            info: '<i class="bi bi-info-circle-fill text-info"></i>'
        };
        return icons[type] || '<i class="bi bi-circle-fill"></i>';
    },

    getBorderColor: function(type) {
        const colors = {
            danger: '#dc3545',
            warning: '#ffc107',
            success: '#198754',
            primary: '#0d6efd',
            info: '#0dcaf0'
        };
        return colors[type] || '#6c757d';
    },

    formatDate: function(date) {
        return date.toLocaleDateString(this.config.dateFormat, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};

// ==========================================
// 🚀 نظام المراقبة اللحظي المتطور
// ==========================================
function initializeSupremeAudit() {
    const mainContainer = document.getElementById('step5');
    if (!mainContainer) {
        console.warn('⚠️ العنصر الرئيسي (step5) غير موجود');
        return;
    }

    let debounceTimer = null;
    let isAnalyzing = false;

    // دالة التحليل مع Debounce
// دالة التحليل مع Debounce
    const triggerAnalysis = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (!isAnalyzing) {
                isAnalyzing = true;
                
                // استدعاء نظام التحليل المالي فقط (بدون مزامنة البيانات لأن الـ Listener تكفل بها)
                SUPREME_AUDITOR.analyze();
                
                setTimeout(() => { isAnalyzing = false; }, 100);
            }
        }, SUPREME_AUDITOR.config.debounceDelay);
    };

    // 1️⃣ مراقبة إدخال البيانات (Input Events)
    mainContainer.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            triggerAnalysis();
        }
    });

    // 2️⃣ مراقبة التغييرات في الـ DOM (إضافة/حذف صفوف)
    const observer = new MutationObserver((mutations) => {
        const hasRelevantChanges = mutations.some(m => 
            m.type === 'childList' && 
            (m.addedNodes.length > 0 || m.removedNodes.length > 0)
        );
        
        if (hasRelevantChanges && !isAnalyzing) {
            triggerAnalysis();
        }
    });

    // مراقبة الحاويات الأربعة
    const containersToWatch = [
        'assetsInvoicesContainer',
        'purchaseInvoicesContainer',
        'storeAdditionsContainer',
        'salesInvoicesContainer'
    ];

    containersToWatch.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            observer.observe(container, {
                childList: true,
                subtree: true,
                attributes: false
            });
        }
    });

    // 3️⃣ تحليل أولي عند التحميل
    setTimeout(() => {
        SUPREME_AUDITOR.analyze();
    }, 200);

    console.log('✅ نظام التدقيق الجنائي V9 Supreme جاهز ويعمل');
}

// 🎬 تشغيل النظام عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSupremeAudit);
} else {
    initializeSupremeAudit();
}

// دالة الزر اليدوي (اختيارية)
function analyzeInvoices() {
    SUPREME_AUDITOR.analyze();
}
//-----------------------

/* نظام التحقق من وجود شركات أخرى في الموقع - نسخة محسّنة مع OpenStreetMap */

// قاعدة بيانات للاختبار
const fakeCompaniesDB = [
    { name: "شركة النيل للأثاث", responsible: "محمد حسين ابراهيم", mobile: "201063003278", address: "العباسية - 3  شارع صلاح سالم", governorate: "القاهرة", city: "مدينة نصر", lat: 30.1191068, lng: 31.2740701 },
    { name: "مصنع الصفا للحديد", responsible: "حسن حسين حسان", mobile: "201063003278", address: "العبور - المنطقة الصناعية", governorate: "القاهرة", city: "العبور", lat: 30.1140688, lng: 31.2544184 },
    { name: "مصنع الصفا لبيع السيارات", responsible: "محمد حسين ابراهيم", mobile: "201063003278", address: "مدينة نصر - 3 صلاح سالم", governorate: "القاهرة", city: "مدينة نصر", lat: 30.1150688, lng: 31.2546184 },
    { name: "شركة كيخيا للصناعات النسيجية", responsible: "محمد حسين ابراهيم", mobile: "201063003278", address: "العبور - المنطقة الصناعية الأولى", governorate: "القاهرة", city: "العبور", lat: 30.0709413, lng: 31.2969586 },
    { name: "شركة المصرية الالمانية لصناعة السيارات", responsible: "محمد حسين ابراهيم", mobile: "201063003278", address: "العبور - المنطقة الصناعية الأولى", governorate: "القليوبية", city: "العبور", lat: 29.9728896, lng: 30.9493760 },

   { name: "مصنع الصفا للحديد", responsible: "حسن حسين حسان", mobile: "201063003278", address: "مدينة نصر - الوفاء والامل", governorate: "القاهرة", city: "مدينة نصر", lat: 30.0341225, lng: 31.3454515 },
   { name: "مصنع الصفا للنحاس", responsible: "حسين حسين حسن", mobile: "201063003278", address: "مدينة نصر - الوفاء والامل", governorate: "القاهرة", city: "مدينة نصر", lat: 30.0344048, lng: 31.3465232 },
   { name: "مصنع الصفا للالومنيوم", responsible: "حسنين ابوحسين حسان", mobile: "201063003278", address: "مدينة نصر - الوفاء والامل", governorate: "القاهرة", city: "مدينة نصر", lat: 30.0342647, lng: 31.3462480 },

    { name: "شركة شمال الدلتا لنقل", responsible: "محمد حسين ابراهيم", mobile: "201063003278", address: "مدينة نصر - صلاح سالم", governorate: "القاهرة", city: "مدينة نصر", lat: 29.9728896, lng: 30.9460992 }


];

const SEARCH_RADIUS_KM = 0.5;
const locationChecks = new Map();

async function checkExistingCompany(button) {
    const locationSection = button.closest('.location-section');
    const sectionId = locationSection.dataset.sectionId || generateSectionId(locationSection);
    const latInput = locationSection.querySelector('.latitude');
    const lngInput = locationSection.querySelector('.longitude');
    const resultInput = locationSection.querySelector('#existingCompanyResult');

    if (!resultInput) {
        console.error("❌ لم يتم العثور على input id='existingCompanyResult'");
        alert("خطأ: يرجى التأكد من وجود حقل النتيجة في القسم.");
        return;
    }

    const latitude = latInput.value.trim();
    const longitude = lngInput.value.trim();

    if (!latitude || !longitude) {
        resultInput.value = '⚠️ يرجى إدخال خط العرض والطول أولاً';
        resetResultStyles(resultInput);
        return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
        resultInput.value = '⚠️ صيغة خط العرض أو الطول غير صحيحة';
        applyWarningStyles(resultInput);
        return;
    }

    const originalText = button.innerHTML;
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> جاري الفحص...';
    button.disabled = true;

    try {
        await new Promise(r => setTimeout(r, 500));
        const matches = findCompaniesWithinRadiusDetailed(lat, lng);

        if (matches.length > 0) {
            matches.sort((a, b) => a.distanceMeters - b.distanceMeters);
            const closestDistance = matches[0].distanceMeters;
            let severity = 'warning';
            let icon = '⚠️';
            
            if (closestDistance <= 5 || closestDistance <= 300) {
                severity = 'danger';
                icon = '⛔';
            }

            createOrUpdateResultDisplay(locationSection, matches, icon, severity);
            locationChecks.set(sectionId, {
                hasCompanies: true,
                companies: matches,
                lastChecked: new Date(),
                locationData: { latitude, longitude }
            });
        } else {
            createOrUpdateResultDisplay(locationSection, [], '✅', 'success');
            locationChecks.set(sectionId, {
                hasCompanies: false,
                lastChecked: new Date(),
                locationData: { latitude, longitude }
            });
        }
    } catch (err) {
        console.error("خطأ برمجي:", err);
        resultInput.value = '❌ خطأ غير متوقع';
        applyErrorStyles(resultInput);
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function findCompaniesWithinRadiusDetailed(lat, lon) {
    return fakeCompaniesDB
        .map(company => {
            const distance = calculateDistance(lat, lon, company.lat, company.lng);
            const distanceMeters = Math.round(distance * 1000);
            return { ...company, distance: distance, distanceMeters: distanceMeters };
        })
        .filter(company => company.distance <= SEARCH_RADIUS_KM);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function createOrUpdateResultDisplay(locationSection, matches, icon, severity) {
    let resultDiv = locationSection.querySelector('.company-check-results');
    
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.className = 'company-check-results mt-3';
        
        // البحث عن حاوية زر الفحص (div.mb-3 الذي يحتوي على الزر والـ input)
        const checkButtonContainer = locationSection.querySelector('.btn-outline-warning').closest('.mb-3');
        
        if (checkButtonContainer) {
            // إدراج النتائج مباشرة بعد حاوية زر الفحص
            checkButtonContainer.parentNode.insertBefore(resultDiv, checkButtonContainer.nextSibling);
        } else {
            // في حالة عدم العثور على الحاوية، أضف في نهاية القسم
            locationSection.appendChild(resultDiv);
        }
    }

    resultDiv.innerHTML = '';

    if (matches.length === 0) {
        resultDiv.innerHTML = `
            <div class="alert alert-success border border-success shadow-sm" role="alert" style="text-align: right; direction: rtl;">
                <h5 class="alert-heading"><i class="bi bi-check-circle-fill me-2"></i>✅ الموقع آمن</h5>
                <hr>
                <p class="mb-0 fw-bold">لا توجد أي شركة مسجلة ضمن نطاق 500 متر</p>
            </div>`;
        return;
    }

    const alertClass = severity === 'danger' ? 'alert-danger' : 'alert-warning';
    const borderClass = severity === 'danger' ? 'border-danger' : 'border-warning';
    const veryClose = matches.filter(c => c.distanceMeters <= 100).length;
    const close = matches.filter(c => c.distanceMeters > 100 && c.distanceMeters <= 300).length;
    const moderate = matches.filter(c => c.distanceMeters > 300).length;

    let html = `<div class="alert ${alertClass} border ${borderClass} shadow-sm" role="alert" style="text-align: right; direction: rtl;">
            <h5 class="alert-heading"><i class="bi bi-exclamation-triangle-fill me-2"></i>${icon} تم العثور على ${convertToArabicNumerals(matches.length)} شركة/شركات ضمن نطاق 500 متر</h5><hr>`;

    matches.forEach((company, index) => {
        const number = convertToArabicNumerals(index + 1);
        let dangerLevel = '', dangerBadge = '';
        
        if (company.distanceMeters <= 5) {
            dangerLevel = 'تنبيه هام للغاية: موقع مطابق تقريباً!';
            dangerBadge = 'bg-danger';
        } else if (company.distanceMeters <= 100) {
            dangerLevel = 'تنبيه هام: قريبة جداً!';
            dangerBadge = 'bg-danger';
        } else if (company.distanceMeters <= 300) {
            dangerLevel = 'تنبيه: قريبة';
            dangerBadge = 'bg-warning text-dark';
        } else {
            dangerLevel = 'تنبيه: ضمن النطاق';
            dangerBadge = 'bg-info text-dark';
        }

        html += `<div class="card mb-3 border-${severity === 'danger' ? 'danger' : 'warning'}">
                <div class="card-body" style="text-align: right;">
                    <h6 class="card-title fw-bold mb-2">${number}. 📌 ${company.name}</h6>
                    <h6 class="card-title fw-bold mb-2"><strong> 👤: ${company.responsible}</h6>
                    <h6 class="card-title fw-bold mb-2"><strong> 📞: ${company.mobile}</h6>


                    <p class="card-text mb-1"><strong>📍 العنوان:</strong> ${company.address}</p>
                    <p class="card-text mb-2"><strong>📏 المسافة:</strong> <span class="badge bg-primary">${convertToArabicNumerals(company.distanceMeters)} متر</span></p>
                    <span class="badge ${dangerBadge} px-3 py-2">${dangerLevel}</span>
                </div></div>`;
    });

    html += `<hr><div class="mt-3 p-3 bg-light rounded border"><h6 class="fw-bold mb-2">📊 الملخص الإحصائي:</h6><ul class="mb-0" style="list-style: none; padding-right: 0;">`;
    
    if (veryClose > 0) html += `<li class="mb-1">🔴 <strong>قريبة جداً (≤100م):</strong> ${convertToArabicNumerals(veryClose)} شركة</li>`;
    if (close > 0) html += `<li class="mb-1">🟠 <strong>قريبة (101-300م):</strong> ${convertToArabicNumerals(close)} شركة</li>`;
    if (moderate > 0) html += `<li class="mb-1">🟡 <strong>متوسطة (301-500م):</strong> ${convertToArabicNumerals(moderate)} شركة</li>`;

    html += `</ul></div><div class="text-center mt-3"><button type="button" class="btn btn-primary btn-lg shadow" onclick="openCompaniesMap(this)" style="border-radius: 25px;"><i class="bi bi-geo-alt-fill me-2"></i>🗺️ عرض الشركات على خريطة </button></div></div>`;

    resultDiv.innerHTML = html;
    resultDiv.dataset.currentLat = locationSection.querySelector('.latitude').value;
    resultDiv.dataset.currentLng = locationSection.querySelector('.longitude').value;
    resultDiv.dataset.companies = JSON.stringify(matches);
}

function convertToArabicNumerals(num) {
    const arabicNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return String(num).replace(/\d/g, d => arabicNumerals[d]);
}

function applyWarningStyles(el) { el.className = 'form-control bg-warning text-dark fw-bold'; el.style.minHeight = '150px'; }
function applySuccessStyles(el) { el.className = 'form-control bg-success text-white fw-bold'; el.style.minHeight = '60px'; }
function applyErrorStyles(el) { el.className = 'form-control bg-danger text-white fw-bold'; el.style.minHeight = '150px'; }
function resetResultStyles(el) { el.className = 'form-control bg-light text-dark'; el.style.minHeight = '60px'; }
function generateSectionId(section) { const id = 'sec-' + Math.random().toString(36).slice(2); section.dataset.sectionId = id; return id; }
function getLocationCheckInfo(sectionId) { return locationChecks.get(sectionId); }
function exportCheckResults(sectionId) {
    const checkInfo = locationChecks.get(sectionId);
    if (!checkInfo) return null;
    return { timestamp: checkInfo.lastChecked.toISOString(), location: checkInfo.locationData, hasCompanies: checkInfo.hasCompanies, companies: checkInfo.companies || [], totalCompanies: checkInfo.companies?.length || 0 };
}

// ==================== وظائف خريطة OpenStreetMap ====================

function openCompaniesMap(button) {
    const resultDiv = button.closest('.company-check-results');
    const currentLat = parseFloat(resultDiv.dataset.currentLat);
    const currentLng = parseFloat(resultDiv.dataset.currentLng);
    const companies = JSON.parse(resultDiv.dataset.companies);
    
    if (!currentLat || !currentLng || !companies) { 
        alert('❌ خطأ في تحميل بيانات الخريطة'); 
        return; 
    }
    
    createMapModal(currentLat, currentLng, companies);
}

function createMapModal(currentLat, currentLng, companies) {
    const existingModal = document.getElementById('mapModal');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
        <div id="mapModal" class="modal fade" tabindex="-1">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content" style="direction: rtl;">
                    <div class="modal-header bg-gradient" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <h5 class="modal-title text-white fw-bold">
                            <i class="bi bi-map-fill me-2"></i>
                            خريطة OpenStreetMap للشركات المجاورة
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-0" style="position: relative; overflow: hidden;">
                        <!-- زر الإظهار (يظهر فقط عند إخفاء القائمة) -->
                        <button id="btnShowMapList" onclick="toggleMapList(true)" class="btn btn-primary shadow-lg" 
                                style="position: absolute; top: 15px; left: 15px; z-index: 1100; display: none; border-radius: 50px; font-weight: bold; border: 2px solid white;">
                            <i class="bi bi-list-ul me-1"></i> عرض 
                        </button>

                        <!-- الخريطة -->
                        <div id="mapContainer" style="width: 100%; height: calc(100vh - 120px); position: relative;"></div>
                        
                        <!-- لوحة التحكم الجانبية -->
                        <div id="mapControlPanel" style="position: absolute; top: 15px; left: 15px; z-index: 1000; background: white; border-radius: 15px; box-shadow: 0 4px 25px rgba(0,0,0,0.2); width: 320px; max-width: 90vw; max-height: calc(100vh - 160px); overflow-y: auto; transition: all 0.3s ease;">
                            <div style="padding: 15px;">
                                <!-- رأس القائمة مع زر الإخفاء -->
                                <div class="d-flex justify-content-between align-items-center mb-3" style="border-bottom: 2px solid #667eea; padding-bottom: 8px;">
                                    <h6 class="fw-bold m-0" style="color: #667eea;">
                                        <i class="bi bi-info-circle-fill me-1"></i> قائمة الشركات المسجلة بهيئة الاستثمار في نطاق 500 متر من الموقع الحالي
                                    </h6>
                                    <button onclick="toggleMapList(false)" class="btn btn-sm btn-outline-secondary" style="border-radius: 20px; font-size: 11px; padding: 2px 10px;">
                                        إخفاء <i class="bi bi-chevron-left"></i>
                                    </button>
                                </div>
 
                                
                                <!-- معلومات الموقع الحالي -->
                                <div class="alert alert-success mb-3" style="text-align: right; border-radius: 10px;">
                                    <div class="d-flex align-items-center mb-2">
                                        <span style="font-size: 24px; margin-left: 10px;">📍</span>
                                        <strong>موقعك الحالي</strong>
                                    </div>
                                    <small class="text-muted">
                                        Lat: ${currentLat.toFixed(6)}<br>
                                        Lng: ${currentLng.toFixed(6)}
                                    </small>
                                </div>
                                
                                <!-- قائمة الشركات -->
                                <div id="companiesList" style="text-align: right;">
                                    <h6 class="fw-bold mb-3" style="color: #e74c3c;">
                                        <i class="bi bi-building me-2"></i>
                                        الشركات المجاورة (${convertToArabicNumerals(companies.length)})
                                    </h6>
                                    ${companies.map((c, i) => `
                                        <div class="company-item mb-2 p-3" data-company-index="${i}" 
                                             style="background: ${c.distanceMeters <= 100 ? '#ffe6e6' : c.distanceMeters <= 300 ? '#fff3cd' : '#d1ecf1'}; 
                                                    border-radius: 10px; cursor: pointer; transition: all 0.3s; border: 2px solid transparent;"
                                             onmouseover="highlightCompanyMarker(${i}, true)" 
                                             onmouseout="highlightCompanyMarker(${i}, false)"
                                             onclick="focusOnCompany(${i})">
                                            <div class="fw-bold mb-1" style="color: ${c.distanceMeters <= 100 ? '#dc3545' : c.distanceMeters <= 300 ? '#856404' : '#0c5460'};">
                                                ${convertToArabicNumerals(i + 1)}. ${c.name}
                                            </div>
                                            <div style="font-size: 12px; color: #666;">
                                                <i class="bi bi-geo-alt me-1"></i>${c.city}
                                            </div>
                                            <div class="mt-2">
                                                <span class="badge" style="background: ${c.distanceMeters <= 100 ? '#dc3545' : c.distanceMeters <= 300 ? '#ffc107' : '#17a2b8'};">
                                                    📏 ${convertToArabicNumerals(c.distanceMeters)} متر
                                                </span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                
                                <!-- دليل الألوان -->
                                <div class="mt-4 p-3" style="background: #f8f9fa; border-radius: 10px; text-align: right;">
                                    <h6 class="fw-bold mb-3" style="font-size: 14px;">🎨 دليل الألوان</h6>
                                    <div class="mb-2" style="font-size: 13px;">
                                        <span style="display: inline-block; width: 15px; height: 15px; background: #28a745; border-radius: 50%; margin-left: 8px;"></span>
                                        موقعك الحالي
                                    </div>
                                    <div class="mb-2" style="font-size: 13px;">
                                        <span style="display: inline-block; width: 15px; height: 15px; background: #dc3545; border-radius: 50%; margin-left: 8px;"></span>
                                        قريبة جداً (&lt;100م)
                                    </div>
                                    <div class="mb-2" style="font-size: 13px;">
                                        <span style="display: inline-block; width: 15px; height: 15px; background: #ffc107; border-radius: 50%; margin-left: 8px;"></span>
                                        قريبة (100-300م)
                                    </div>
                                    <div style="font-size: 13px;">
                                        <span style="display: inline-block; width: 15px; height: 15px; background: #17a2b8; border-radius: 50%; margin-left: 8px;"></span>
                              متوسطة (&gt;300م)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle me-1"></i>
                            إغلاق
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
	
    // تحميل مكتبة Leaflet
    if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.onload = () => initializeMap(currentLat, currentLng, companies);
        document.head.appendChild(script);
    } else {
        initializeMap(currentLat, currentLng, companies);
    }
    
    const modal = new bootstrap.Modal(document.getElementById('mapModal'));
    modal.show();
}

// أضف هذه الدالة الجديدة في أي مكان داخل وسم <script> للتحكم في الإظهار والإخفاء
function toggleMapList(show) {
    const panel = document.getElementById('mapControlPanel');
    const showBtn = document.getElementById('btnShowMapList');
    
    if (show) {
        panel.style.display = 'block';
        showBtn.style.display = 'none';
    } else {
        panel.style.display = 'none';
        showBtn.style.display = 'block';
    }
}
// متغيرات عامة للخريطة
let map = null;
let markers = [];
let circles = [];
let currentLocationMarker = null;

function initializeMap(currentLat, currentLng, companies) {
    setTimeout(() => {
        if (map) {
            map.remove();
        }
        
        // إنشاء الخريطة
        map = L.map('mapContainer', {
            center: [currentLat, currentLng],
            zoom: 14,
            zoomControl: true
        });
        
        // إضافة طبقة الخريطة من OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // رسم دوائر النطاق
        const circleStyles = [
            { radius: 100, color: '#dc3545', fillColor: '#dc3545', fillOpacity: 0.1 },
            { radius: 300, color: '#ffc107', fillColor: '#ffc107', fillOpacity: 0.08 },
            { radius: 500, color: '#17a2b8', fillColor: '#17a2b8', fillOpacity: 0.06 }
        ];
        
        circleStyles.forEach(style => {
            const circle = L.circle([currentLat, currentLng], {
                radius: style.radius,
                color: style.color,
                fillColor: style.fillColor,
                fillOpacity: style.fillOpacity,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(map);
            circles.push(circle);
        });
        
        // إضافة علامة الموقع الحالي
        const greenIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #28a745; width: 30px; height: 30px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); position: relative;">
                      <div style="position: absolute; top: -40px; left: 50%; transform: translateX(-50%); background: #28a745; color: white; padding: 5px 10px; border-radius: 5px; white-space: nowrap; font-weight: bold; font-size: 12px;">أنت هنا 📍</div>
                   </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        currentLocationMarker = L.marker([currentLat, currentLng], { icon: greenIcon }).addTo(map);
        
        // إضافة علامات الشركات
        companies.forEach((company, index) => {
            let markerColor = '#17a2b8';
            if (company.distanceMeters <= 100) markerColor = '#dc3545';
            else if (company.distanceMeters <= 300) markerColor = '#ffc107';
            
            const icon = L.divIcon({
                className: 'custom-company-icon',
                html: `
                    <div class="company-marker" data-marker-index="${index}" style="position: relative;">
                        <!-- الدائرة النابضة الخارجية -->
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; border-radius: 50%; background-color: ${markerColor}; opacity: 0.6; animation: pulse 2s infinite;"></div>
                        <!-- الدبوس الرئيسي -->
                        <div style="position: relative; background-color: ${markerColor}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer; z-index: 10; animation: bounce 1s infinite alternate;"></div>
                    </div>
                    <style>
                        @keyframes pulse {
                            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
                            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
                            100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
                        }
                        @keyframes bounce {
                            0% { transform: translateY(0px); }
                            100% { transform: translateY(-5px); }
                        }
                    </style>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            
            const marker = L.marker([company.lat, company.lng], { icon: icon }).addTo(map);
            
            const popupContent = `
                <div style="text-align: right; direction: rtl; min-width: 250px;">
                    <h6 class="fw-bold mb-2" style="color: ${markerColor};">📌 ${company.name}</h6>
                    <p class="mb-1" style="font-size: 13px;"><strong>👤 المسؤل:</strong> ${company.responsible}</p>
                    <p class="mb-1" style="font-size: 13px;"><strong>📞 الهاتف:</strong> ${company.mobile}</p>
                    <p class="mb-1" style="font-size: 13px;"><strong>📍 العنوان:</strong> ${company.address}</p>
                    <p class="mb-1" style="font-size: 13px;"><strong>🌇 المدينة:</strong> ${company.city}</p>
                    <p class="mb-1" style="font-size: 13px;"><strong>🏙️ المحافظة:</strong> ${company.governorate}</p>
                    <p class="mb-2"><span class="badge" style="background: ${markerColor};">بعد الشركة عن موقعك📏 ${convertToArabicNumerals(company.distanceMeters)} متر</span></p>
                    <div class="text-center mt-2">
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${company.lat},${company.lng}" 
                           target="_blank" 
                           class="btn btn-sm btn-success" 
                           style="border-radius: 20px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.2);color: #fff;">
                            <i class="bi bi-map me-1"></i>
                            🧭 الوصول عبر Google Maps
                        </a>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            markers.push(marker);
        });
        
        // ضبط حدود الخريطة لتشمل جميع العلامات
        const bounds = L.latLngBounds([[currentLat, currentLng], ...companies.map(c => [c.lat, c.lng])]);
        map.fitBounds(bounds, { padding: [50, 50] });
        
    }, 300);
}

// تسليط الضوء على علامة الشركة
window.highlightCompanyMarker = function(index, highlight) {
    const markerElements = document.querySelectorAll('.company-marker');
    if (markerElements[index]) {
        if (highlight) {
            markerElements[index].style.transform = 'scale(1.5)';
            markerElements[index].style.zIndex = '1000';
        } else {
            markerElements[index].style.transform = 'scale(1)';
            markerElements[index].style.zIndex = '1';
        }
    }
};

// التركيز على شركة معينة
window.focusOnCompany = function(index) {
    if (markers[index]) {
        map.setView(markers[index].getLatLng(), 17, { animate: true });
        markers[index].openPopup();
        
        // تمييز العنصر في القائمة
        document.querySelectorAll('.company-item').forEach((item, i) => {
            if (i === index) {
                item.style.borderColor = '#667eea';
                item.style.transform = 'scale(1.02)';
            } else {
                item.style.borderColor = 'transparent';
                item.style.transform = 'scale(1)';
            }
        });
    }
};
/* 20. دالة عرض الإشعارات */
/* ==================== الحل النهائي الاحترافي ==================== */

/* دالة محسّنة لإنشاء PDF محضر المناقشة  */


async function generateMeetingMinutesPDF() {
    try {
        // جمع البيانات الأساسية
        const representativeRole = document.getElementById('representativeRole')?.value;
        const representativeName = document.getElementById('representativeName')?.value;
        const meetingText = document.querySelector('#meetingMinutesSection textarea')?.value;

        // التحقق الذكي من البيانات المطلوبة
        const missingFields = [];
        
        if (!representativeRole || representativeRole === '') {
            missingFields.push('صفة الممثل');
        }
        
        if (!representativeName || representativeName.trim() === '') {
            missingFields.push('اسم الممثل');
        }
        
        if (!meetingText || meetingText.trim() === '') {
            missingFields.push('محضر المناقشة');
        }

        // عرض رسالة تفصيلية في حالة وجود حقول ناقصة
        if (missingFields.length > 0) {
            const fieldsList = missingFields.map(field => `• ${field}`).join('\n');
            const message = missingFields.length === 1 
                ? `⚠️ يرجى تعبئة الحقل التالي:\n\n${fieldsList}`
                : `⚠️ يرجى تعبئة الحقول التالية:\n\n${fieldsList}`;
            
            showNotification('warning', message);
            
            // تركيز المؤشر على أول حقل فارغ
            if (!representativeRole || representativeRole === '') {
                document.getElementById('representativeRole')?.focus();
            } else if (!representativeName || representativeName.trim() === '') {
                document.getElementById('representativeName')?.focus();
            } else if (!meetingText || meetingText.trim() === '') {
                document.querySelector('#meetingMinutesSection textarea')?.focus();
            }
            
            return;
        }

        // جمع باقي البيانات
        const decisionNo = document.getElementById('decisionNoInput')?.value || 'غير محدد';
        
        let decisionDateText = 'غير محدد';
        const decisionDateLabel = document.getElementById('decisionDateLabel');
        if (decisionDateLabel) {
            const labelText = decisionDateLabel.innerHTML || decisionDateLabel.innerText;
            decisionDateText = labelText.replace(/<[^>]*>/g, '').replace('الصادر في:', '').trim();
        }
        
        const companyName = document.getElementById('companyName')?.value || 'غير محدد';
        const inspectionDate = document.getElementById('inspectionDate')?.value;
        const inspectionTime = document.getElementById('inspectionTime')?.value || 'غير محدد';
        const headName = document.getElementById('headName')?.value || 'غير محدد';
        const memberName = document.getElementById('memberName')?.value || 'غير محدد';

        // الحصول على الوقت الفعلي الحالي
        const currentTime = new Date().toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });

        const formattedDate = inspectionDate ? formatArabicDate(inspectionDate) : 'غير محدد';

        // إنشاء PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        // إنشاء الصفحة الأولى
        let currentPage = 1;
        await createPage(pdf, {
            representativeRole,
            representativeName,
            meetingText,
            decisionNo,
            decisionDateText,
            companyName,
            formattedDate,
            inspectionTime,
            currentTime,
            headName,
            memberName,
            isFirstPage: true,
            currentPage
        });

        // حساب إذا كان يحتاج صفحات إضافية
        const textLines = meetingText.split('\n').filter(l => l.trim());
        const estimatedPages = Math.ceil(textLines.length / 30); // تقدير تقريبي

        if (estimatedPages > 1) {
            // إضافة صفحات إضافية للنص الطويل
            const linesPerPage = 30;
            for (let i = 1; i < estimatedPages; i++) {
                pdf.addPage();
                currentPage++;
                const startLine = i * linesPerPage;
                const endLine = Math.min((i + 1) * linesPerPage, textLines.length);
                const pageText = textLines.slice(startLine, endLine).join('\n');
                
                await createContinuationPage(pdf, {
                    meetingText: pageText,
                    currentPage,
                    totalPages: estimatedPages
                });
            }
        }

        // حفظ الملف
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const cleanCompanyName = companyName.replace(/[^\u0600-\u06FF\w\s]/g, '').replace(/\s+/g, '_');
        const fileName = `محضر_مناقشة_${cleanCompanyName}_${timestamp}.pdf`;
        pdf.save(fileName);

        const totalPages = pdf.internal.getNumberOfPages();
        showNotification('success', `✓ تم إنشاء ملف PDF بنجاح (${totalPages} ${totalPages === 1 ? 'صفحة' : 'صفحات'})`);

    } catch (error) {
        console.error('خطأ في إنشاء PDF:', error);
        showNotification('error', 'حدث خطأ أثناء إنشاء الملف: ' + error.message);
    }
}

// دالة إنشاء الصفحة الأولى
async function createPage(pdf, data) {
    const content = document.createElement('div');
    content.style.cssText = `
        direction: rtl;
        font-family: 'Traditional Arabic', 'Arial', sans-serif;
        width: 750px;
        padding: 0;
        background: white;
        line-height: 1.8;
        position: relative;
    `;

    content.innerHTML = `
        <div style="border: 3px solid #2c3e50; padding: 20px; position: relative; min-height: 1000px;">
            <div style="border: 1px solid #95a5a6; padding: 18px; position: relative;">
                
                <!-- رأس الصفحة -->
                <div style="text-align: right; margin-bottom: 15px; padding: 10px 12px; background: #f8f9fa; border: 2px solid #2c3e50; border-radius: 5px;">
                    <div style="font-size: 17px; font-weight: bold; color: #2c3e50; line-height: 1.5;">
                        الهيئة العامة للاستثمار والمناطق الحرة
                    </div>
                    <div style="font-size: 10px; margin-top: 2px; color: #7f8c8d; font-weight: normal;">
                        General Authority for Investment and Free Zones
                    </div>
                </div>

                <!-- العنوان الرئيسي -->
                <div style="text-align: center; margin: 20px 0 15px 0;">
                    <h1 style="color: #2c3e50; font-size: 26px; margin: 0; font-weight: bold; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 5px;">
                        محضر مناقشة بين اللجنة وممثل الشركة
                    </h1>
                    <div style="margin: 10px auto; width: 180px; height: 2px; background: #bdc3c7;"></div>
                </div>

                <!-- معلومات المحضر -->
                <div style="background: #f8f9fa; border-right: 4px solid #34495e; padding: 12px; margin: 12px 0; border-radius: 4px;">
                    <div style="font-size: 14px; line-height: 1.7;">
                        <p style="margin: 5px 0;">
                            <strong>التاريخ:</strong> ${data.formattedDate} | 
                            <strong>انتقلت اللجنة من مقر الهيئة في تمام الساعة:</strong> ${data.inspectionTime} | 
                            <strong>تم الانتهاء من إعداد المحضر فى تمام الساعة:</strong> ${data.currentTime}
                        </p>
                        <p style="margin: 5px 0;">
                            <strong>القرار رقم:</strong> ${data.decisionNo} | 
                            <strong>تاريخ القرار:</strong> ${data.decisionDateText}
                        </p>
                        <p style="margin: 5px 0;">
                            <strong>اسم الشركة:</strong> ${data.companyName}
                        </p>
                    </div>
                </div>

                <!-- بيانات الممثل -->
                <div style="background: white; border: 2px solid #bdc3c7; padding: 12px; margin: 12px 0; border-radius: 4px;">
                    <p style="font-size: 15px; margin: 0; color: #2c3e50;">
                        <strong>تم فتح محضر المناقشة مع ${data.representativeRole}:</strong> 
                        <span style="text-decoration: underline; font-weight: bold;">${data.representativeName}</span>
                    </p>
                </div>

                <!-- عنوان المحضر -->
                <h2 style="color: #2c3e50; background: #ecf0f1; font-size: 17px; padding: 8px 12px; margin: 20px 0 12px 0; border-right: 5px solid #34495e; border-radius: 3px;">
                    محضر المناقشة:
                </h2>

                <!-- نص المحضر -->
                <div style="background: white; border: 2px solid #bdc3c7; border-radius: 5px; padding: 18px; margin: 12px 0 80px 0;">
                    ${data.meetingText.split('\n').map(p => 
                        p.trim() ? `<p style="margin: 8px 0; font-size: 14px; text-align: justify; line-height: 1.8; color: #2c3e50;">${p}</p>` : '<br>'
                    ).join('')}
                </div>

                <!-- قسم الاستيفاءات المطلوبة -->
                <div style="background: #fffbf0; border: 2px solid #d4a574; border-radius: 5px; padding: 15px; margin: 20px 0 18px 0;">
                    <h3 style="color: #8b6914; font-size: 16px; margin: 0 0 10px 0; border-bottom: 2px solid #d4a574; padding-bottom: 6px;">
                        الاستيفاءات المطلوبة
                    </h3>
                    
                    <p style="font-size: 14px; margin: 10px 0; line-height: 1.7;">
                        <strong>يُرجى موافاة اللجنة بالاستيفاءات المطلوبة في خلال:</strong>
                    </p>

                    <!-- مربعات الاختيار في سطر واحد -->
                    <div style="margin: 12px 0; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e0e0e0; text-align: center;">
                        <label style="display: inline-block; margin: 0 20px; font-size: 14px;">
                            <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #7f8c8d; margin-left: 5px; vertical-align: middle; border-radius: 2px;"></span>
                            <strong>أسبوع واحد</strong>
                        </label>
                        <label style="display: inline-block; margin: 0 20px; font-size: 14px;">
                            <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #7f8c8d; margin-left: 5px; vertical-align: middle; border-radius: 2px;"></span>
                            <strong>أسبوعين</strong>
                        </label>
                        <label style="display: inline-block; margin: 0 20px; font-size: 14px;">
                            <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #7f8c8d; margin-left: 5px; vertical-align: middle; border-radius: 2px;"></span>
                            <strong>شهر واحد</strong>
                        </label>
                    </div>

                    <div style="background: #fff5f5; border-right: 4px solid #c0392b; padding: 10px; margin-top: 12px; border-radius: 4px;">
                        <p style="font-size: 13px; margin: 0; line-height: 1.7; color: #7f1d1d; font-weight: 500;">
                            <strong>تنويه هام:</strong> في حالة عدم موافاتنا بالمستندات المذكورة خلال المدة المحددة، يُعد ذلك موافقة من الشركة على إلغاء أعمال اللجنة والتقدم بطلب لجنة جديدة.
                        </p>
                    </div>
                </div>

                <!-- التوقيعات -->
                <div style="border-top: 2px solid #95a5a6; padding-top: 18px; margin-top: 25px;">
                    <h3 style="color: #2c3e50; font-size: 17px; margin-bottom: 15px; text-align: center; font-weight: bold;">
                        التوقيعات والاعتماد
                    </h3>
                    
                    <table style="width: 100%; text-align: center; font-size: 13px; border-collapse: separate; border-spacing: 8px;">
                        <tr>
                            <td style="padding: 12px; background: #f8f9fa; border: 2px solid #bdc3c7; border-radius: 5px; width: 33%; vertical-align: top;">
                                <div style="font-weight: bold; font-size: 14px; color: #2c3e50; margin-bottom: 5px;">رئيس اللجنة</div>
                                <div style="margin: 8px 0; font-size: 15px;"><strong>${data.headName}</strong></div>
                                <div style="margin: 20px auto; border-bottom: 2px solid #7f8c8d; width: 70%;"></div>
                                <div style="color: #7f8c8d; font-size: 11px; margin-top: 5px;">التوقيع</div>
                            </td>
                            <td style="padding: 12px; background: #f8f9fa; border: 2px solid #bdc3c7; border-radius: 5px; width: 33%; vertical-align: top;">
                                <div style="font-weight: bold; font-size: 14px; color: #2c3e50; margin-bottom: 5px;">عضو اللجنة</div>
                                <div style="margin: 8px 0; font-size: 15px;"><strong>${data.memberName}</strong></div>
                                <div style="margin: 20px auto; border-bottom: 2px solid #7f8c8d; width: 70%;"></div>
                                <div style="color: #7f8c8d; font-size: 11px; margin-top: 5px;">التوقيع</div>
                            </td>
                            <td style="padding: 12px; background: #f8f9fa; border: 2px solid #bdc3c7; border-radius: 5px; width: 34%; vertical-align: top;">
                                <div style="font-weight: bold; font-size: 14px; color: #2c3e50; margin-bottom: 5px;">${data.representativeRole}</div>
                                <div style="margin: 8px 0; font-size: 15px;"><strong>${data.representativeName}</strong></div>
                                <div style="margin: 20px auto; border-bottom: 2px solid #7f8c8d; width: 70%;"></div>
                                <div style="color: #7f8c8d; font-size: 11px; margin-top: 5px;">التوقيع والختم</div>
                            </td>
                        </tr>
                    </table>
                </div>

            </div>
        </div>
    `;

    // إضافة وتحويل لـ Canvas
    content.style.position = 'fixed';
    content.style.top = '-10000px';
    document.body.appendChild(content);
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 800
    });

    document.body.removeChild(content);

    // إضافة للـ PDF
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 5;
    const footerSpace = 20;
    
    const imgWidth = pageWidth - (2 * margin);
    const maxHeight = pageHeight - footerSpace;
    const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, maxHeight);
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    
    // إضافة التذييل
    addFooter(pdf, data.currentPage, 1);
}

// دالة إنشاء صفحة متابعة
async function createContinuationPage(pdf, data) {
    const content = document.createElement('div');
    content.style.cssText = `
        direction: rtl;
        font-family: 'Traditional Arabic', 'Arial', sans-serif;
        width: 750px;
        padding: 0;
        background: white;
        line-height: 1.8;
    `;

    content.innerHTML = `
        <div style="border: 3px solid #2c3e50; padding: 20px;">
            <div style="border: 1px solid #95a5a6; padding: 18px;">
                
                <!-- رأس الصفحة المتكرر -->
                <div style="text-align: right; margin-bottom: 15px; padding: 10px 12px; background: #f8f9fa; border: 2px solid #2c3e50; border-radius: 5px;">
                    <div style="font-size: 17px; font-weight: bold; color: #2c3e50; line-height: 1.5;">
                        الهيئة العامة للاستثمار والمناطق الحرة
                    </div>
                    <div style="font-size: 10px; margin-top: 2px; color: #7f8c8d; font-weight: normal;">
                        General Authority for Investment and Free Zones
                    </div>
                </div>

                <h2 style="color: #2c3e50; background: #ecf0f1; font-size: 17px; padding: 8px 12px; margin: 15px 0 12px 0; border-right: 5px solid #34495e; border-radius: 3px;">
                    محضر المناقشة (تابع):
                </h2>

                <div style="background: white; border: 2px solid #bdc3c7; border-radius: 5px; padding: 18px; margin: 12px 0; min-height: 800px;">
                    ${data.meetingText.split('\n').map(p => 
                        p.trim() ? `<p style="margin: 8px 0; font-size: 14px; text-align: justify; line-height: 1.8; color: #2c3e50;">${p}</p>` : '<br>'
                    ).join('')}
                </div>

            </div>
        </div>
    `;

    content.style.position = 'fixed';
    content.style.top = '-10000px';
    document.body.appendChild(content);
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 800
    });

    document.body.removeChild(content);

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 5;
    const footerSpace = 20;
    
    const imgWidth = pageWidth - (2 * margin);
    const maxHeight = pageHeight - footerSpace;
    const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, maxHeight);
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    
    addFooter(pdf, data.currentPage, data.totalPages);
}

// دالة التذييل المحسّنة
function addFooter(pdf, currentPage, totalPages) {
    const pageHeight = 297;
    const footerY = pageHeight - 12;
    
    // خط فاصل
    pdf.setDrawColor(189, 195, 199);
    pdf.setLineWidth(0.3);
    pdf.line(15, footerY - 5, 195, footerY - 5);
    
    // رقم الصفحة
    pdf.setFontSize(11);
    pdf.setTextColor(44, 62, 80);
    const pageNum = `${currentPage} / ${totalPages}`;
    const pageNumWidth = pdf.getTextWidth(pageNum);
    pdf.text(pageNum, (210 - pageNumWidth) / 2, footerY);
    
    // نص التذييل
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    const footerText = 'Meeting Minutes';
    const textWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, (210 - textWidth) / 2, footerY + 4);
}

// دالة تنسيق التاريخ
function formatArabicDate(dateString) {
    if (!dateString) return 'غير محدد';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        
        return date.toLocaleDateString('ar-EG', options);
    } catch (error) {
        return dateString;
    }
}

// دالة الإشعارات المحسّنة
function showNotification(type, message) {
    // التحقق من وجود دالة إشعارات مخصصة
    if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
        window.showNotification(type, message);
        return;
    }
    
    // استخدام alert كبديل احتياطي
    const icons = { 
        success: '✅', 
        warning: '⚠️', 
        error: '❌',
        info: 'ℹ️'
    };
    
    const titles = {
        success: 'نجح',
        warning: 'تنبيه',
        error: 'خطأ',
        info: 'معلومة'
    };
    
    const title = titles[type] || 'إشعار';
    const icon = icons[type] || '•';
    
    alert(`${icon} ${title}\n\n${message}`);
}

// يجب إضافة هذا الكود إلى وسم <script> الموجود في الصفحة
// ==========================================================
// زر اضافة مخلفات جديده
document.addEventListener('DOMContentLoaded', function() {
        const addButton = document.getElementById('add-waste-btn');
        const container = document.getElementById('waste-entries-container');
        const template = document.getElementById('waste-entry-template');

        // دالة لإضافة صف جديد
        function addWasteEntry() {
            // استنساخ محتوى القالب
            const newEntry = template.content.cloneNode(true);
            const newRow = newEntry.querySelector('.waste-entry-row');

            // إيجاد زر الحذف في الصف الجديد المضاف وتعيين الدالة له
            const deleteButton = newRow.querySelector('.delete-waste-btn');
            if (deleteButton) {
                deleteButton.addEventListener('click', function() {
                    // حذف الصف الأب بالكامل عند الضغط على زر الحذف
                    newRow.remove();
                });
            }

            // إضافة الصف الجديد إلى الحاوية
            container.appendChild(newEntry);
        }

        // الاستماع لزر "إضافة مخلفات أخرى"
        addButton.addEventListener('click', addWasteEntry);

        // تعديل بسيط على الصف الأول: لكي يظهر زر الحذف فقط في الصفوف المضافة
        // الصف الأول لا يحتوي على زر حذف، ولذلك نعدل تنسيق العمود الأخير فيه ليتناسب مع الإضافة الجديدة.
        const firstRow = container.querySelector('.waste-entry-row:first-child .col-md-2:last-child');
        if (firstRow) {
            // تعديل تنسيق الـ col-md-2 الأخير في الصف الأول ليتطابق مع الـ template
             firstRow.innerHTML = `
                <label class="info-label small d-block">الفترة </label>
                <select class="form-select">
                    <option>يوم</option><option>شهر</option><option>سنة</option>
                </select>
            `;
        }
    });

// عند تحميل الصفحة، نضمن أن يتم تطبيق الإعدادات الأولية (حيث القيمة الافتراضية هي "تمليك")
    document.addEventListener('DOMContentLoaded', (event) => {
        updateFields();
    });

    function updateFields() {
        const typeSelect = document.getElementById('ownershipType');
        const party1Input = document.getElementById('party1');
        const party2Input = document.getElementById('party2');
        
        // العناصر الجديدة التي سنتحكم بها
        const dateFromCol = document.getElementById('dateFromCol');
        const dateToCol = document.getElementById('dateToCol');
        const durationCol = document.getElementById('durationCol');
        const dateFromLabel = dateFromCol.querySelector('label');

        const selectedType = typeSelect.value;

        // 1. تغيير تسمية الطرفين (Placeholders) (نفس المنطق السابق)
        switch (selectedType) {
            case 'تمليك':
                party1Input.placeholder = 'البائع (الطرف الأول)';
                party2Input.placeholder = 'المشتري (الطرف الثاني)';
                break;
            case 'إيجار':
                party1Input.placeholder = 'المؤجر (الطرف الأول)';
                party2Input.placeholder = 'المستأجر (الطرف الثاني)';
                break;
            case 'انتفاع':
                party1Input.placeholder = 'المانح (الطرف الأول)';
                party2Input.placeholder = 'المنتفع (الطرف الثاني)';
                break;
            case 'تنازل':
                party1Input.placeholder = 'المتنازل  (الطرف الأول)';
                party2Input.placeholder = 'المتنازل له (الطرف الثاني)';
                break;
            default:
                party1Input.placeholder = 'الطرف الأول';
                party2Input.placeholder = 'الطرف الثاني';
                break;
        }

        // 2. التحكم في إظهار/إخفاء حقول التاريخ والمدة

        if (selectedType === 'إيجار') {
            // الإيجار: يظهر التاريخ "من" و "حتى" و "المدة" (كافة الحقول)
            dateFromCol.style.display = 'block';
            dateToCol.style.display = 'block';
            durationCol.style.display = 'block';
            dateFromCol.className = 'col-md-4'; // إعادة توزيع الأعمدة
            dateFromLabel.textContent = 'تاريخ العقد من'; // تغيير التسمية لـ "من"

        } else if (selectedType === 'تمليك' || selectedType === 'تنازل' || selectedType === 'انتفاع') {
            // تمليك/تنازل/انتفاع: يظهر فقط حقل "تاريخ العقد"، ويتم إخفاء "حتى" و "المدة"
            dateFromCol.style.display = 'block';
            dateToCol.style.display = 'none'; // إخفاء حقل "حتى"
            durationCol.style.display = 'none'; // إخفاء حقل "المدة"
            dateFromCol.className = 'col-md-12'; // حقل التاريخ يأخذ كامل العرض
            dateFromLabel.textContent = 'تاريخ التعاقد'; // تغيير التسمية ليكون "تاريخ التعاقد" فقط
        } 
    }

//----------
//-----------
/* ==========================================================
   🔄 محرك المزامنة الآلي بين الفواتير والمعاينة الميدانية
   ========================================================== */

function syncInvoicesToInspection() {
    // 1. مزامنة الآلات والمعدات
    syncAssets();
    
    // 2. مزامنة الخامات
    syncMaterials();
}

/* ==========================================================
   تحديث: فصل مزامنة الآلات عن الخامات بدقة
   ========================================================== */

function syncAssets() {
    const invoiceRows = document.querySelectorAll('.asset-invoice-item');
    const inspectionContainer = document.getElementById('machinesContainer');
    const inspectionRows = inspectionContainer.querySelectorAll('.machine-row');
    const checkSection = document.getElementById('machinesCheck');

    // 1. التحقق أولاً: هل يوجد بيانات حقيقية (اسم آلة مكتوب)؟
    let hasData = false;
    invoiceRows.forEach(row => {
        const name = row.querySelectorAll('input')[0].value.trim();
        if (name !== "") hasData = true;
    });

    // 2. تفعيل القسم في المعاينة *فقط* إذا وجدت بيانات
    if (hasData && !checkSection.checked) {
        checkSection.checked = true;
        toggleSection('machineDetails', true);
    } 
    // ملاحظة: لا نقوم بإلغاء التفعيل (else) للحفاظ على خيارات المستخدم إذا أراد تفعيلها يدوياً

    // 3. نقل البيانات
    invoiceRows.forEach((invRow, index) => {
        const invInputs = invRow.querySelectorAll('input');
        const name = invInputs[0].value; // الاسم
        const qty = invInputs[1].value;  // العدد
        const date = invInputs[2].value; // التاريخ
        const val = invInputs[3].value;  // القيمة

        // ننقل البيانات فقط إذا كان هناك صف مقابل في المعاينة
        let inspRow = inspectionRows[index];
        
        // إذا لم يكن الصف موجوداً وتم كتابة اسم، نقوم بإنشائه (للصفوف الجديدة)
        if (!inspRow && name.trim() !== "") {
            addMachineRowManual(); 
            const newRows = inspectionContainer.querySelectorAll('.machine-row');
            inspRow = newRows[newRows.length - 1];
        }

        if (inspRow) {
            const inspInputs = inspRow.querySelectorAll('input');
            // الترتيب: [0]الاسم، [1]العدد، [2]القيمة، [3]التاريخ
            inspInputs[0].value = name;
            inspInputs[1].value = qty;
            inspInputs[2].value = val;
            inspInputs[3].value = date;
        }
    });
}

function syncMaterials() {
    const invoiceRows = document.querySelectorAll('.purchase-invoice-item');
    const inspectionContainer = document.getElementById('materialsContainer');
    const inspectionRows = inspectionContainer.querySelectorAll('.material-row');
    const checkSection = document.getElementById('materialsCheck');

    // 1. التحقق أولاً: هل يوجد بيانات حقيقية (اسم خامة مكتوب)؟
    let hasData = false;
    invoiceRows.forEach(row => {
        const name = row.querySelectorAll('input')[0].value.trim();
        if (name !== "") hasData = true;
    });

    // 2. تفعيل القسم في المعاينة *فقط* إذا وجدت بيانات
    if (hasData && !checkSection.checked) {
        checkSection.checked = true;
        toggleSection('materialDetails', true);
    }

    // 3. نقل البيانات
    invoiceRows.forEach((invRow, index) => {
        const invInputs = invRow.querySelectorAll('input');
        const name = invInputs[0].value; // الاسم
        const qty = invInputs[1].value;  // الكمية
        // invInputs[2] هو التاريخ في الفاتورة، لكن لا يوجد حقل تاريخ للخامة في المعاينة (حسب طلبك الأخير)
        const val = invInputs[3].value;  // القيمة

        let inspRow = inspectionRows[index];

        if (!inspRow && name.trim() !== "") {
            addMaterialRowManual();
            const newRows = inspectionContainer.querySelectorAll('.material-row');
            inspRow = newRows[newRows.length - 1];
        }

        if (inspRow) {
            const inspInputs = inspRow.querySelectorAll('input');
            // الترتيب حسب التعديل الأخير: [0]الاسم، [1]العدد، [2]القيمة
            if(inspInputs[0]) inspInputs[0].value = name;
            if(inspInputs[1]) inspInputs[1].value = qty;
            if(inspInputs[2]) inspInputs[2].value = val;
        }
    });
}
//--------------------
/* ==========================================================
   🚀 محرك المزامنة الثنائي (Two-Way Master Sync)
   ========================================================== */

/* ==========================================================
   مستمع الأحداث الذكي والمزامنة (الكود المحدث بالكامل)
   ========================================================== */

document.addEventListener('input', function(e) {
    // 1. إذا كان التعديل في فواتير الآلات (الشاشة 5)
    if (e.target.closest('.asset-invoice-item')) {
        syncAssets(); // نحدث الآلات فقط في المعاينة
        if (typeof SUPREME_AUDITOR !== 'undefined') SUPREME_AUDITOR.analyze(); // تحديث التحليل المالي
    }
    
    // 2. إذا كان التعديل في فواتير الخامات (الشاشة 5)
    else if (e.target.closest('.purchase-invoice-item')) {
        syncMaterials(); // نحدث الخامات فقط في المعاينة
        if (typeof SUPREME_AUDITOR !== 'undefined') SUPREME_AUDITOR.analyze(); // تحديث التحليل المالي
    }
    
    // 3. باقي الحقول (المبيعات، المخزون...) تحدث التحليل المالي فقط
    else if (e.target.closest('.sales-invoice-item') || e.target.closest('.store-addition-item')) {
        if (typeof SUPREME_AUDITOR !== 'undefined') SUPREME_AUDITOR.analyze();
    }
});

// دالة مزامنة الآلات (منعزلة ودقيقة)
function syncAssets() {
    const invoiceRows = document.querySelectorAll('.asset-invoice-item');
    const inspectionContainer = document.getElementById('machinesContainer');
    const inspectionRows = inspectionContainer.querySelectorAll('.machine-row');
    const checkSection = document.getElementById('machinesCheck');

    // 1. التحقق: هل يوجد اسم آلة مكتوب؟
    let hasData = false;
    invoiceRows.forEach(row => {
        const nameInput = row.querySelectorAll('input')[0];
        if (nameInput && nameInput.value.trim() !== "") hasData = true;
    });

    // 2. تفعيل القسم في المعاينة فقط إذا وجدت بيانات ولم يكن مفعلاً
    if (hasData && !checkSection.checked) {
        checkSection.checked = true;
        toggleSection('machineDetails', true);
    } 

    // 3. نقل البيانات
    invoiceRows.forEach((invRow, index) => {
        const invInputs = invRow.querySelectorAll('input');
        // ترتيب المصدر (الفواتير): [0]الاسم، [1]العدد، [2]التاريخ، [3]القيمة
        const name = invInputs[0].value;
        const qty = invInputs[1].value;
        const date = invInputs[2].value;
        const val = invInputs[3].value;

        let inspRow = inspectionRows[index];
        
        // إنشاء صف جديد في المعاينة إذا لزم الأمر
        if (!inspRow && name.trim() !== "") {
            addMachineRowManual(); 
            // إعادة قراءة الصفوف بعد الإضافة
            const newRows = inspectionContainer.querySelectorAll('.machine-row');
            inspRow = newRows[newRows.length - 1];
        }

        if (inspRow) {
            const inspInputs = inspRow.querySelectorAll('input');
            // ترتيب الهدف (المعاينة): [0]الاسم، [1]العدد، [2]القيمة، [3]التاريخ
            // (ملاحظة: حقل المصدر هو select ولا يتم حسابه ضمن inputs)
            if (inspInputs[0]) inspInputs[0].value = name;
            if (inspInputs[1]) inspInputs[1].value = qty;
            if (inspInputs[2]) inspInputs[2].value = val;
            if (inspInputs[3]) inspInputs[3].value = date;
        }
    });
}

// دالة مزامنة الخامات (منعزلة ودقيقة)
function syncMaterials() {
    const invoiceRows = document.querySelectorAll('.purchase-invoice-item');
    const inspectionContainer = document.getElementById('materialsContainer');
    const inspectionRows = inspectionContainer.querySelectorAll('.material-row');
    const checkSection = document.getElementById('materialsCheck');

    // 1. التحقق: هل يوجد اسم خامة مكتوب؟
    let hasData = false;
    invoiceRows.forEach(row => {
        const nameInput = row.querySelectorAll('input')[0];
        if (nameInput && nameInput.value.trim() !== "") hasData = true;
    });

    // 2. تفعيل القسم في المعاينة فقط إذا وجدت بيانات ولم يكن مفعلاً
    if (hasData && !checkSection.checked) {
        checkSection.checked = true;
        toggleSection('materialDetails', true);
    }

    // 3. نقل البيانات
    invoiceRows.forEach((invRow, index) => {
        const invInputs = invRow.querySelectorAll('input');
        // ترتيب المصدر (الفواتير): [0]الاسم، [1]العدد، [2]التاريخ، [3]القيمة
        const name = invInputs[0].value;
        const qty = invInputs[1].value;
        // invInputs[2] هو التاريخ (لا ينقل للخامات في المعاينة)
        const val = invInputs[3].value;

        let inspRow = inspectionRows[index];

        // إنشاء صف جديد في المعاينة إذا لزم الأمر
        if (!inspRow && name.trim() !== "") {
            addMaterialRowManual();
            const newRows = inspectionContainer.querySelectorAll('.material-row');
            inspRow = newRows[newRows.length - 1];
        }

        if (inspRow) {
            const inspInputs = inspRow.querySelectorAll('input');
            // ترتيب الهدف (المعاينة) حسب آخر تحديث للكود:
            // [0] الاسم، [1] الكمية، [2] القيمة، [3] تصنيف الخامة (يدوي)
            if(inspInputs[0]) inspInputs[0].value = name;
            if(inspInputs[1]) inspInputs[1].value = qty;
            if(inspInputs[2]) inspInputs[2].value = val;
        }
    });
}

// دالة الحذف (تقوم بحذف الصف المقابل وإعادة التحليل)
function removeSyncRow(type, index) {
    const isAsset = type === 'asset';
    const container5 = document.getElementById(isAsset ? 'assetsInvoicesContainer' : 'purchaseInvoicesContainer');
    const container7 = document.getElementById(isAsset ? 'machinesContainer' : 'materialsContainer');
    
    const rows5 = container5.querySelectorAll(isAsset ? '.asset-invoice-item' : '.purchase-invoice-item');
    const rows7 = container7.querySelectorAll(isAsset ? '.machine-row' : '.material-row');

    // حذف الصف من الفواتير
    if (rows5[index]) rows5[index].remove();
    
    // حذف الصف المقابل من المعاينة (إذا كان صفاً إضافياً وليس الصف الأول الأساسي)
    // أو يمكن تفريغه إذا كان الصف الأول، لكن الحذف أفضل للحفاظ على التطابق
    if (rows7[index]) {
        // إذا كان هناك صف واحد فقط، لا نحذفه بل نفرغه (لأنه الصف الأساسي في HTML)
        if (rows7.length === 1 && index === 0) {
             const inputs = rows7[index].querySelectorAll('input');
             inputs.forEach(input => input.value = "");
        } else {
             rows7[index].remove();
        }
    }

    // إعادة تشغيل التحليل المالي بعد الحذف لتحديث التوصيات
    if (typeof SUPREME_AUDITOR !== 'undefined') SUPREME_AUDITOR.analyze();
}


//-----------------------------------------------------










/****************************************************************************
 * 🔐 نظام الإدارة وبوابة الدخول (Admin & Portal System v1.0)
 ****************************************************************************/

let currentUserRole = 'user';

// 1️⃣ دالة تسجيل الدخول المعدلة
// متغير عالمي للتحكم في صلاحية استخدام الذكاء الاصطناعي خلال الجلسة
var SESSION_AI_ENABLED = false; 

function handleLogin() {
    const codeInput = document.querySelector('input[placeholder="أدخل الكود الوظيفي"]');
    const passInput = document.querySelector('input[placeholder="*********"]');
    const code = codeInput.value;
    const pass = passInput.value;

    if (code === 'voice' && pass === 'voice') {
        SESSION_AI_ENABLED = true;
        showNotification('success', 'تم تفعيل وضع المساعد الذكي (Gemini)');
        nextStep(2);
    } 
    else if (code === 'admin' && pass === 'admin') {
        SESSION_AI_ENABLED = false; 
        nextStep(2);
        // إظهار زر لوحة التحكم للمسؤول فقط (إذا كان موجوداً)
        if(document.getElementById('adminBtn')) document.getElementById('adminBtn').style.display = 'block';
    } 
    else {
        // الدخول العادي
        SESSION_AI_ENABLED = false;
        
        // --- الإضافة هنا ---
        // إخفاء قسم تسجيل الدخول فوراً لضمان عدم ظهوره في الأعلى
        document.getElementById('step1').style.display = 'none';
        
        // إخفاء أي أزرار إدارية قد تكون متبقية من جلسة سابقة
        if(document.getElementById('adminBtn')) document.getElementById('adminBtn').style.display = 'none';
        
        nextStep(2);
    }

    // تنظيف الحقول بعد الضغط على الزر لزيادة الأمان ومنع التكرار
    codeInput.value = '';
    passInput.value = '';
}
// 2️⃣ واجهة إضافة نشاط جديد (Admin UI)
function createAdminPanel() {
    const adminModal = document.createElement('div');
    adminModal.id = 'adminPanelModal';
    adminModal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:20000; display:none; overflow-y:auto; padding:20px;";
    
    adminModal.innerHTML = `
        <div style="background:white; max-width:800px; margin:20px auto; border-radius:15px; padding:30px; position:relative;">
            <button onclick="closeAdminPanel()" style="position:absolute; top:15px; left:15px; border:none; background:none; font-size:1.5rem;">&times;</button>
            <h3 class="text-primary mb-4"><i class="fas fa-user-shield"></i> لوحة تحكم المسؤول - إضافة نشاط جديد</h3>
            
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">اسم النشاط (بالعربية)</label>
                    <input type="text" id="newActName" class="form-control" placeholder="مثال: مصنع كابلات كهربائية">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">كود النشاط (Value)</label>
                    <input type="text" id="newActValue" class="form-control" placeholder="مثال: ACT-CABLES">
                </div>
                <div class="col-12">
                    <label class="form-label fw-bold">كلمات البحث (مفصولة بفاصلة)</label>
                    <textarea id="newActKeywords" class="form-control" rows="2" placeholder="كهرباء, كابلات, تصنيع, طاقة"></textarea>
                </div>
                
                <hr>
                <h5 class="text-secondary">بيانات التراخيص</h5>
                <div class="col-md-6">
                    <label class="form-label">الجهة المانحة</label>
                    <input type="text" id="newActAuth" class="form-control">
                </div>
                <div class="col-md-6">
                    <label class="form-label">السند القانوني</label>
                    <input type="text" id="newActLeg" class="form-control">
                </div>
                <div class="col-12">
                    <label class="form-label">الاشتراطات المطلوبة</label>
                    <textarea id="newActReq" class="form-control" rows="3"></textarea>
                </div>
                
                <hr>
                <h5 class="text-secondary">مراحل الإنتاج (مفصولة بفاصلة)</h5>
                <div class="col-12">
                    <textarea id="newActStages" class="form-control" rows="2" placeholder="استلام الخامات, التصنيع, التغليف, التخزين"></textarea>
                </div>
            </div>
            
            <div class="mt-4">
                <button onclick="saveNewActivity()" class="btn btn-success w-100 py-2 fw-bold">حفظ النشاط الجديد في المنظومة</button>
            </div>
        </div>
    `;
    // ✅ الحل: ننتظر حتى تكتمل الصفحة ثم نضيف العنصر
document.addEventListener('DOMContentLoaded', function() {
    // ضع كود إنشاء المودال أو إضافته هنا
    if (document.body) {
        document.body.appendChild(adminModal);
    }
});

    
    // إضافة زر فتح اللوحة في الهيدر
    const btn = document.createElement('button');
    btn.id = 'adminPanelBtn';
    btn.className = 'btn btn-warning btn-sm';
    btn.style.cssText = "position:fixed; top:10px; left:10px; z-index:10000; display:none;";
    btn.innerHTML = '<i class="fas fa-cog"></i> لوحة التحكم';
    btn.onclick = openAdminPanel;
    document.body.appendChild(btn);
}

function openAdminPanel() { document.getElementById('adminPanelModal').style.display = 'block'; }
function closeAdminPanel() { document.getElementById('adminPanelModal').style.display = 'none'; }

// 3️⃣ دالة حفظ النشاط الجديد
function saveNewActivity() {
    const name = document.getElementById('newActName').value;
    const value = document.getElementById('newActValue').value;
    const keywords = document.getElementById('newActKeywords').value.split(',').map(k => k.trim());
    const auth = document.getElementById('newActAuth').value;
    const leg = document.getElementById('newActLeg').value;
    const req = document.getElementById('newActReq').value;
    const stages = document.getElementById('newActStages').value.split(',').map(s => s.trim());

    if (!name || !value) { alert('يرجى إكمال البيانات الأساسية'); return; }

    // أ. إضافة للقائمة المنسدلة
    const select = document.getElementById('activityTypeSelect');
    const opt = document.createElement('option');
    opt.value = value;
    opt.text = name;
    select.add(opt);

    // ب. إضافة لقاعدة بيانات البحث
    if (typeof activityTypeSearchDB !== 'undefined') {
        activityTypeSearchDB.push({ value, text: name, keywords });
    }

    // ج. إضافة لقاعدة بيانات التراخيص
    if (typeof licenseDB !== 'undefined') {
        licenseDB[value] = { act: name, req: req, auth: auth, loc: "حسب الموقع", leg: leg, guid: "دليل النشاط الجديد", link: "" };
    }

    // د. إضافة لقاعدة بيانات مراحل الإنتاج
    if (typeof productionStagesDB !== 'undefined') {
        productionStagesDB[value] = stages;
    }

    showSuccessMessage('تم إضافة النشاط الجديد بنجاح');
    closeAdminPanel();
}

// تشغيل النظام
function createAdminPanel() {
    // التحقق من وجود الـ body أولاً لمنع الخطأ
    if (!document.body) {
        // إذا لم يكن موجوداً، ننتظر ونحاول مرة أخرى
        document.addEventListener('DOMContentLoaded', createAdminPanel);
        return;
    }

    // التحقق من أن الزر غير موجود بالفعل (لمنع التكرار)
    if (document.getElementById('adminPanelBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'adminPanelBtn';
    btn.className = 'btn btn-warning btn-sm';
    btn.style.cssText = "position:fixed; top:10px; left:10px; z-index:10000; display:none;"; // لاحظ أنه مخفي display:none
    btn.innerHTML = '<i class="fas fa-cog"></i> لوحة التحكم';
    btn.onclick = openAdminPanel; // تأكد أن دالة openAdminPanel موجودة
    
    document.body.appendChild(btn);
}

// تشغيل الدالة بأمان
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAdminPanel);
} else {
    createAdminPanel();
}





    // قاعدة بيانات الأنشطة المخصصة
    let biActivities = JSON.parse(localStorage.getItem('biActivitiesDB')) || [];

    // تعديل دالة الدخول لفتح لوحة التحكم الجديدة
    const originalHandleLoginBI = handleLogin;
    handleLogin = function() {
        const code = document.querySelector('input[placeholder="أدخل الكود الوظيفي"]').value;
        const pass = document.querySelector('input[placeholder="*********"]').value;

        if (code === 'admin' && pass === 'admin') {
            currentUserRole = 'admin';
            document.getElementById('step1').style.display = 'none';
            document.getElementById('adminDashboardBI').style.display = 'block';
            initBICharts();
            refreshBIStats();
            refreshBIActivitiesList();
            showSuccessMessage('مرحباً بك في منصة ذكاء الأعمال - لوحة التحكم جاهزة');
        } else {
            originalHandleLoginBI();
        }
    };

    function closeAdminBI() {
    // إخفاء لوحة التحكم
    document.getElementById('adminDashboardBI').style.display = 'none';
    
    // إظهار صفحة تسجيل الدخول (الخطوة 1)
    document.getElementById('step1').style.display = 'block';

    // تفريغ الحقول لضمان عدم بقاء بيانات المسؤول
    const codeInput = document.querySelector('input[placeholder="أدخل الكود الوظيفي"]');
    const passInput = document.querySelector('input[placeholder="*********"]');
    if(codeInput) codeInput.value = '';
    if(passInput) passInput.value = '';
    
    // تأكد من إخفاء أي أزرار إدارية إضافية قد تكون ظهرت
    const adminBtn = document.getElementById('adminBtn'); // لو كان لديك زر يفتح اللوحة
    if(adminBtn) adminBtn.style.display = 'none';
}

    function showAdminSection(id, btn) {
        document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        document.getElementById(id).style.display = 'block';
        btn.classList.add('active');
    }

    function switchSmartTab(id, btn) {
        document.querySelectorAll('.smart-tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.smart-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        btn.classList.add('active');
    }

    function saveSmartActivityBI() {
        const data = {
            id: Date.now(),
            name: document.getElementById('bi-name').value,
            licName: document.getElementById('bi-lic-name').value,
            auth: document.getElementById('bi-auth').value,
            loc: document.getElementById('bi-loc').value,
            leg: document.getElementById('bi-leg').value,
            guid: document.getElementById('bi-guid').value,
            check: document.getElementById('bi-check').value,
            details: document.getElementById('bi-details').value,
            stages: document.getElementById('bi-stages').value,
            map: document.getElementById('bi-map').value,
            createdAt: new Date().toISOString()
        };

        if (!data.name) { alert('يرجى إدخال اسم النشاط'); return; }

        biActivities.push(data);
        localStorage.setItem('biActivitiesDB', JSON.stringify(biActivities));
        
        // تحديث المنظومة الأصلية أيضاً
        if (typeof licenseDB !== 'undefined') {
            const value = data.name.replace(/\s+/g, '_');
            licenseDB[value] = { 
                act: data.name, 
                req: data.check, 
                auth: data.auth, 
                loc: data.loc, 
                leg: data.leg, 
                guid: data.guid, 
                link: "" 
            };
        }

        showSuccessMessage('تم إضافة النشاط الجديد بنجاح');
        document.getElementById('smartAddForm').reset();
        refreshBIStats();
        refreshBIActivitiesList();
        initBICharts();
    }

    function refreshBIStats() {
    // تحديث العناصر الموجودة بالفعل في الـ HTML
    document.getElementById('kpi-total-companies').textContent = 
        (typeof companiesDB !== 'undefined' ? Object.keys(companiesDB).length : 0) + biActivities.length;
    
    // إذا كنت تريد تحديث النشاطات أيضاً، يمكنك إضافة عنصر في الـ HTML له
    // document.getElementById('stat-total-activities').textContent = ...
    
    // تحديث معدل النمو (يمكنك وضع المنطق الحقيقي هنا)
    document.getElementById('kpi-growth-rate').textContent = "18.5%";
    
    // تحديث استهلاك الطاقة
    document.getElementById('kpi-energy').textContent = "4,250";
    
    // تحديث المخلفات
    document.getElementById('kpi-waste').textContent = "12,450";
}

    function refreshBIActivitiesList() {
        const tbody = document.getElementById('bi-activities-list');
        tbody.innerHTML = '';
        
        biActivities.forEach(act => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold">${act.name}</td>
                <td>${act.auth || '---'}</td>
                <td><span class="badge-status badge-licensed">نشط</span></td>
                <td>
                    <button onclick="editBIActivity(${act.id})" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteBIActivity(${act.id})" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function deleteBIActivity(id) {
        if (confirm('هل أنت متأكد من حذف هذا النشاط؟')) {
            biActivities = biActivities.filter(a => a.id != id);
            localStorage.setItem('biActivitiesDB', JSON.stringify(biActivities));
            refreshBIActivitiesList();
            refreshBIStats();
            initBICharts();
        }
    }

    let charts = {};

        
        let biCharts = {};
        function updateBIChartsByPeriod() { initBICharts(); }
        function initBICharts() {
            const colors = { primary: '#0d6efd', success: '#27ae60', warning: '#f39c12', danger: '#e74c3c', info: '#0dcaf0' };
            const ctx1 = document.getElementById('mainGrowthChart').getContext('2d');
            if (biCharts.growth) biCharts.growth.destroy();
            biCharts.growth = new Chart(ctx1, { type: 'line', data: { labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'], datasets: [{ label: 'الشركات', data: [1200, 1450, 1680, 1850, 2300, 2847], borderColor: colors.primary, backgroundColor: 'rgba(13, 110, 253, 0.1)', fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false } });
            const ctx2 = document.getElementById('statusChartBI').getContext('2d');
            if (biCharts.status) biCharts.status.destroy();
            biCharts.status = new Chart(ctx2, { type: 'doughnut', data: { labels: ['جادة', 'متوقفة', 'تحت الإنشاء'], datasets: [{ data: [2105, 542, 200], backgroundColor: [colors.success, colors.danger, colors.warning] }] }, options: { responsive: true, maintainAspectRatio: false } });
            const ctx3 = document.getElementById('activitiesChartBI').getContext('2d');
            if (biCharts.activities) biCharts.activities.destroy();
            biCharts.activities = new Chart(ctx3, { type: 'bar', data: { labels: ['نسيج', 'غذائي', 'كيماوي', 'معادن', 'بناء'], datasets: [{ label: 'عدد الأنشطة', data: [45, 38, 32, 28, 25], backgroundColor: colors.info }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' } });
            const ctx4 = document.getElementById('energyChartBI').getContext('2d');
            if (biCharts.energy) biCharts.energy.destroy();
            biCharts.energy = new Chart(ctx4, { type: 'pie', data: { labels: ['كهرباء', 'غاز', 'طاقة شمسية'], datasets: [{ data: [55, 30, 15], backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4'] }] }, options: { responsive: true, maintainAspectRatio: false } });
            const ctx5 = document.getElementById('importsChartBI').getContext('2d');
            if (biCharts.imports) biCharts.imports.destroy();
            biCharts.imports = new Chart(ctx5, { type: 'bar', data: { labels: ['الآلات', 'الخامات'], datasets: [{ label: 'مستورد', data: [68, 45], backgroundColor: colors.danger }, { label: 'محلي', data: [32, 55], backgroundColor: colors.success }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { max: 100 } } } });
            const ctx6 = document.getElementById('wasteChartBI').getContext('2d');
            if (biCharts.waste) biCharts.waste.destroy();
            biCharts.waste = new Chart(ctx6, { type: 'bar', data: { labels: ['عضوية', 'معادن', 'بلاستيك', 'ورق', 'كيماويات'], datasets: [{ label: 'الكمية (طن)', data: [4200, 3100, 2450, 1800, 900], backgroundColor: '#95a5a6' }] }, options: { responsive: true, maintainAspectRatio: false } });
        }




