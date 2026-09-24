// SynapseEdu offline clinical curriculum knowledge base.
// 100% local — no network required. Powering Make Tests / Write Notes /
// Flashcards / Fix Mistakes / Ask Anything when Gemini is not configured.

export const SPECIALTIES = ['cardiology', 'neurology', 'pharmacology', 'pathology', 'immunology'];

export const SPECIALTY_LABELS = {
  cardiology: 'Cardiology',
  neurology: 'Neurology',
  pharmacology: 'Pharmacology',
  pathology: 'Pathology',
  immunology: 'Immunology',
};

export const PERSONAS = [
  {
    id: 'attending',
    label: 'Clinical Attending',
    blurb: 'Diagnostic reasoning & management',
    sys: 'You are a senior clinical attending physician teaching at the bedside. Explain mechanisms, challenge premature closure, and emphasize diagnosis and management. Use precise clinical language.',
  },
  {
    id: 'board',
    label: 'Board Exam Coach',
    blurb: 'USMLE/NEET-PG traps & mnemonics',
    sys: 'You are a ruthless board-exam coach. Frame everything as high-yield exam content: point out the classic trap in every question, give a memory anchor (mnemonic, visual, or story), and rank teaching points by yield.',
  },
  {
    id: 'study',
    label: 'Study Partner',
    blurb: 'Peer tutoring, patient & incremental',
    sys: 'You are a friendly, brilliant study partner. Break concepts down incrementally, ask one probing question at a time when appropriate, and use analogies. Never condescend. Encourage spaced repetition.',
  },
];

export const KNOWLEDGE_BASE = {
  cardiology: {
    label: 'Cardiology',
    icon: '❤️',
    topics: ['Heart Failure', 'ACS & MI', 'Arrhythmias', 'Valvular Disease'],
    notes: {
      title: 'Cardiology High-Yield Framework',
      pathophysiology:
        'HF is a syndrome of impaired ventricular filling or ejection. HFrEF <40% (systolic), HFpEF ≥50% (diastolic, most common in elderly hypertensives). ACS spans unstable angina → NSTEMI → STEMI; STEMI = transmural ischemia on a ruptured plaque with total coronary occlusion, ST elevation mirrors the occluded territory.',
      diagnostics:
        [
          'Diagnose HF with BNP/NT-proBNP + echo (LVEF, diastolic indices); categorize by EF, symptoms (NYHA), and congestion (lung US, JVP, weight).',
          'ACS: serial troponin (hs-cTn at 0/1h or 0/2h algorithms), 12-lead ECG within 10 min of arrival; echo for regional wall motion; cath for high-risk.',
          'Arrhythmias: syncope workup with ECG, Holter, event monitor; long QT, Brugada, HOCM need specific suspicion.',
          'Valve: echo-Doppler is diagnostic — aortic stenosis = gradient + valve area (<1.0 cm² severe), MR/AR by regurgitant volume & LV size.',
        ],
      pharmacotherapy:
        [
          'HFrEF (the four pillars): ARNI (sacubitril/valsartan) or ACEi/ARB + beta-blocker (carvedilol, metoprolol succinate, bisoprolol) + MRA (spironolactone) + SGLT2i (dapagliflozin). Loop diuretics for congestion, not mortality.',
          'STEMI: aspirin + P2Y12 (ticagrelor/prasugrel) + anticoag (heparin) + primary PCI ≤90 min; fibrinolysis if PCI impossible within 120 min.',
          'AF rate vs rhythm: rate control with beta-blocker/diltiazem; stroke prevention with DOAC/NOAC by CHA2DS2-VASc; amiodarone is default antiarrhythmic in structural heart disease.',
          'Severe AS is a surgical disease: transcatheter (TAVR) or surgical (SAVR) — medical therapy only bridges symptoms.',
        ],
      traps:
        [
          'DO NOT give AV nodal blockers (beta-blockers, diltiazem, verapamil, digoxin) for WPW + AF — they predispose to VF via the accessory pathway; use procainamide or cardiovert.',
          'Tamponade physiology: pulsus paradoxus, equalization of diastolic pressures, electrical alternans — drain before cause-hunting.',
          'Pericarditis pain is positional (better sitting forward), relieved by NSAIDs — NOT the crushing obstruction of ACS.',
          'DON’T treat HFpEF with inotropes; treat volume + rate + BP + comorbidities.',
        ],
    },
    vignettes: [
      {
        topic: 'Heart Failure',
        stem: 'A 68-year-old man with longstanding hypertension and diabetes presents with progressive exertional dyspnea over 3 months. BP 148/92. JVP 6 cm. Trace pedal edema. Echocardiography shows LVEF 62% with concentric LVH and E/e\' ratio 14. BNP is 420 pg/mL. Which is the most appropriate next step in management?',
        options: [
          'Start dapagliflozin and optimize blood pressure and volume status',
          'Start digoxin and instruct bed rest',
          'Refer immediately for coronary angiography',
          'Begin dobutamine infusion',
        ],
        correct: 0,
        explanation: 'This is HFpEF (normal EF, elevated filling pressures, diastolic dysfunction). SGLT2 inhibitors are now indicated in HFpEF (EMPEROR-Preserved/DELIVER), while the core treatment is controlling volume, BP, and comorbidities. Digoxin/dobutamine are systolic-failure tools and do not address the diastolic physiology.',
      },
      {
        topic: 'Heart Failure',
        stem: 'A 55-year-old man with dilated cardiomyopathy (LVEF 25%) is on sacubitril/valsartan, bisoprolol, and spironolactone but still has NYHA II symptoms. Which medication class, when added, has been shown to reduce mortality AND hospitalization in this setting?',
        options: ['An SGLT2 inhibitor', 'A loop diuretic alone', 'Ivabradine', 'A calcium-channel blocker'],
        correct: 0,
        explanation: 'DAPA-HF and EMPEROR-Reduced established SGLT2 inhibitors (dapagliflozin, empagliflozin) as a fourth pillar for HFrEF regardless of diabetes. Loop diuretics relieve symptoms but do not improve survival. Ivabradine is second-line after maximal beta-blockade.',
      },
      {
        topic: 'ACS & MI',
        stem: 'A 62-year-old woman arrives with crushing substernal chest pain of 90 minutes. ECG shows 2 mm ST elevation in leads II, III, aVF. Which intervention is the priority?',
        options: [
          'Immediate primary PCI within 90 minutes',
          'CT coronary angiogram first to confirm anatomy',
          'Stress test with imaging after medical stabilization',
          'Fibrinolysis regardless of cath availability',
        ],
        correct: 0,
        explanation: 'Inferior STEMI (II, III, aVF) requires rapid reperfusion — primary PCI within 90 minutes of first medical contact. Fibrinolysis is used only when PCI cannot be delivered within 120 minutes. CTA and stress testing are inappropriate in acute STEMI.',
      },
      {
        topic: 'Arrhythmias',
        stem: 'A 24-year-old man presents with palpitations and a pre-excited AF (irregular wide-complex tachycardia). ECG during sinus rhythm shows a delta wave. Assuming hemodynamic instability, the safest next step is:',
        options: [
          'Ibutilide or procainamide, or synchronized cardioversion if unstable',
          'Adenosine bolus',
          'Verapamil infusion',
          'Digoxin load',
        ],
        correct: 0,
        explanation: 'This is WPW syndrome with AF. AV-nodal blockers (adenosine, verapamil, digoxin, beta-blockers) increase conduction down the accessory pathway and can precipitate ventricular fibrillation. In stable patients use an accessory-pathway-active drug (procainamide/ibutilide); unstable patients get immediate cardioversion.',
      },
      {
        topic: 'Valvular Disease',
        stem: 'A 76-year-old man has progressive exertional syncope and angina. Carotid upstroke is delayed, and a harsh late-peaking systolic murmur is best heard at the right upper sternal border. Echo documents an aortic valve area of 0.7 cm². Which management is indicated?',
        options: [
          'Aortic valve replacement (TAVR) with evaluation of coronary anatomy',
          'Annual echo with watchful waiting',
          'Start a nitrate and beta-blocker and observe',
          'Balloon aortic valvuloplasty as definitive therapy',
        ],
        correct: 0,
        explanation: 'Severe symptomatic AS is fatal without valve replacement; exertional syncope portends an average survival of ~2 years. TAVR (or SAVR) is definitive. Balloon valvuloplasty is only a bridge, and nitro-vasodilators are dangerous because they reduce preload the hypertrophied LV already needs.',
      },
    ],
    flash: [
      { front: 'HFrEF "four pillars" that improve survival', back: 'ARNI/ACEi-ARB · Beta-blocker · MRA · SGLT2i. Loop diuretics treat congestion only.', topic: 'Heart Failure' },
      { front: 'Mnemonic for ACS: what must happen within 10 min of ED arrival?', back: 'ECG within 10 minutes; troponin on arrival (0/1h or 0/2h algorithms); aspirin immediately.', topic: 'ACS & MI' },
      { front: 'Why is verapamil contraindicated in WPW + AF?', back: 'AV nodal blockade ↑ accessory-pathway (Mahabhava) conduction → risk of VF. Use procainamide/ibutilide.', topic: 'Arrhythmias' },
      { front: 'Pulsus paradoxus + electrical alternans + equalized diastolics = ?', back: 'Cardiac tamponade — pericardiocentesis before exhaustive workup.', topic: 'Heart Failure' },
      { front: 'Severe AS survival by presentation', back: 'Angina ~5y, syncope ~2-3y, HF ~2y. Definitive fix = TAVR/SAVR.', topic: 'Valvular Disease' },
      { front: 'Which murmur changes with squat-to-stand?', back: 'HOCM (↓ preload → louder) vs AS. Hand-grip ↓ obstructive murmurs (AS, HOCM), ↑ MR & AR.', topic: 'Valvular Disease' },
    ],
  },
  neurology: {
    label: 'Neurology',
    icon: '🧠',
    topics: ['Stroke & TIA', 'Epilepsy', 'Headache', 'Movement Disorders'],
    notes: {
      title: 'Neurology High-Yield Framework',
      pathophysiology:
        'Stroke: 87% ischemic vs 13% hemorrhagic. Ischemic injury = core infarction + penumbra; every minute of large-vessel occlusion kills ~1.9 million neurons. Seizures reflect abnormal synchronized hyperexcitability — focal vs generalized; status epilepticus = 5+ minutes (or 2+ without recovery) and is a medical emergency.',
      diagnostics: [
        'Stroke: noncontrast head CT immediately to exclude hemorrhage; then CTA/CTP or MRI for penumbra and vessel occlusion.',
        'Epilepsy: EEG (routine + prolonged), MRI brain; distinguish provoked (electrolyte, alcohol) seizures.',
        'Headache: red flags = sudden onset worst-ever ("thunderclap"), fever+neck stiffness, papilledema, focal deficit, age>50 new onset. Get imaging / LP accordingly.',
        'Parkinsonism: clinical diagnosis; DAT scan for ambiguous cases; MRI if atypical (magnetic-resonance parkinsonism).',
      ],
      pharmacotherapy: [
        'IV tPA ≤4.5h from onset (with strict exclusions); mechanical thrombectomy ≤24h for large-vessel occlusion. Give aspirin (not heparin) for most ischemic strokes, and percuss dose before swallowing.',
        'Status epilepticus: benzodiazepine first line (lorazepam IV), then levetiracetam/fosphenytoin/valproate; refractory → anesthetic infusion with EEG monitoring.',
        'Migraine acute: triptans or NSAIDs early; CGRP antagonists (gepants) for triptan-intolerant/contraindicated. Prophylaxis: beta-blockers, amitriptyline, topiramate, CGRP mAbs.',
        'Parkinson: levodopa is most potent; motor complications (dyskinesias, wearing-off) managed with adjuncts—COMT inhibitors, MAO-B inhibitors, amantadine.',
      ],
      traps: [
        'TIA/minor stroke ≠ "harmless": ABCD². Get vessel imaging; symptomatic carotid stenosis ≥70% → endarterectomy within 2 weeks.',
        'Subarachnoid hemorrhage: sudden thunderclap headache, CT negative in ~98% if within 6h, then lumbar puncture for xanthochromia.',
        'Don\'t bromocryptine-park a DBS-eligible young patient with severe tremor — refer for deep brain stimulation.',
        'Status epilepticus is NOT for lone benzodiazepines; escalate the second-line agent within minutes, not hours.',
      ],
    },
    vignettes: [
      {
        topic: 'Stroke & TIA',
        stem: 'A 71-year-old woman presents 90 minutes after sudden-onset right hemiparesis, right facial droop, and aphasia. NIHSS is 16. BP 178/96. Blood glucose is normal. Noncontrast CT is negative for hemorrhage. What should be done immediately?',
        options: [
          'IV thrombolysis (tPA) after reviewing all exclusion criteria',
          'Observation because improvement may still occur',
          'Aspirin loading and discharge home with risk-factor control',
          'Emergent carotid duplex before any therapy',
        ],
        correct: 0,
        explanation: 'Acute ischemic stroke within 4.5h is a thrombolysis candidate once hemorrhage is excluded and exclusions are reviewed. BP is acceptable (<185/110 threshold). Aspirin is not a substitute for reperfusion; delaying treatment shrinks the salvageable penumbra.',
      },
      {
        topic: 'Epilepsy',
        stem: 'A 34-year-old man with a known left hippocampal sclerosis complex partial epilepsy is in the ED with continuous focal aware seizures that generalize after 8 minutes — now 7 minutes into a generalized tonic-clonic seizure with no signs of stopping. Which step is correct?',
        options: [
          'Lorazepam 4 mg IV, repeated once, then an IV antiseizure medication (levetiracetam/fosphenytoin)',
          'Only oxygen and positioning while awaiting natural resolution',
          'Immediate intubation and propofol without benzodiazepines',
          'Carbamazepine load by mouth now',
        ],
        correct: 0,
        explanation: 'This is convulsive status epilepticus. Standard sequence: benzodiazepine → second-line parenteral ASM (or both early), rather than mouth tablets. Stop the seizure before worries about airway; refractory cases proceed to anesthetic agents with EEG.',
      },
      {
        topic: 'Headache',
        stem: 'A 29-year-old previously well woman reports the sudden onset, during exertion, of the worst headache of her life ("like a thunderclap"), now improved. Neurological exam is normal. CT brain without contrast at 6 hours is negative. What should you do next?',
        options: [
          'Lumbar puncture looking for xanthochromia / RBCs',
          'Reassure and discharge with a migraine plan',
          'Start verapamil and schedule a PET scan',
          'Order CT angiography with contrast only',
        ],
        correct: 0,
        explanation: 'Thunderclap headache requires excluding subarachnoid hemorrhage. A normal CT after 6 hours is reassuring but not definitive; LP for xanthochromia/red cells is the confirmatory test. CTA helps identify aneurysm noninvasively, but LP remains the classic next step for SAH exclusion.',
      },
      {
        topic: 'Movement Disorders',
        stem: 'A 58-year-old man has a pill-rolling rest tremor, bradykinesia, and stooped posture for 1 year. Exam confirms parkinsonism. He is bothered primarily by tremor and slowness that limit his work. Which initial therapy is most appropriate?',
        options: [
          'Carbidopa/levodopa',
          'Ropinirole (dopamine agonist)',
          'Donepezil',
          'Haloperidol',
        ],
        correct: 0,
        explanation: 'Levodopa remains the most effective therapy for motor symptoms of Parkinson disease; functional impact is the modern indication to start it (not to delay out of dyskinesia fear). Agonists may be an alternative in younger patients but are less potent. Haloperidol would worsen parkinsonism.',
      },
      {
        topic: 'Stroke & TIA',
        stem: 'A 66-year-old man with a transient 15-minute episode of left-arm weakness this morning has a normal neurologic exam. Carotid duplex shows 80% stenosis of the right internal carotid. Which therapy is indicated next?',
        options: [
          'Carotid endarterectomy within 2 weeks + aspirin + statin + BP control',
          'Wait 6 months and re-image to decide',
          'Start warfarin instead of aspirin',
          'Immediate carotid angioplasty with bare-metal stent',
        ],
        correct: 0,
        explanation: 'Symptomatic carotid stenosis ≥70% benefits from endarterectomy within 2 weeks plus secondary prevention (aspirin, high-intensity statin, BP control). Adults with TIA are at highest risk in the first days-2 weeks — deferral loses the therapeutic window.',
      },
    ],
    flash: [
      { front: 'STEMI of the brain: which stroke scale quantifies deficit quickly?', back: 'NIH Stroke Scale. Use it, document it — it drives decisions and prognostication.', topic: 'Stroke & TIA' },
      { front: 'Time windows: IV tPA vs thrombectomy', back: 'tPA ≤4.5h (some 4.5-9h with imaging selection); thrombectomy ≤24h with large-vessel occlusion + salvageable penumbra.', topic: 'Stroke & TIA' },
      { front: 'Thunderclap headache → stepwise exclusion', back: 'CT head (6h →98% sensitive) → LP xanthochromia/RBCs → CTA for aneurysm.', topic: 'Headache' },
      { front: 'Status epilepticus drug ladder', back: 'Benzodiazepine → levetiracetam/fosphenytoin/valproate → anesthetic (midazolam/propofol) + EEG.', topic: 'Epilepsy' },
      { front: 'Tremor: think of the "tremor at rest" disease', back: 'Parkinson disease. Rest tremor + bradykinesia + rigidity. Most responsive = levodopa.', topic: 'Movement Disorders' },
      { front: 'SAH whereabouts: send LP even with negative CT when clinical suspicion is high', back: 'RBCs + xanthochromia (bili from lysed cells) = SAH. Never trust a clean CT alone in classic presentations.', topic: 'Headache' },
    ],
  },
  pharmacology: {
    label: 'Pharmacology',
    icon: '💊',
    topics: ['Antibiotics', 'Cardiac Drugs', 'Analgesia', 'Endocrine & Metabolic'],
    notes: {
      title: 'Pharmacology High-Yield Framework',
      pathophysiology:
        'Antibiotics: bactericidal (β-lactams, fluoroquinolones, aminoglycosides) vs bacteriostatic (macrolides, tetracyclines, sulfonamides). Time-dependent (β-lactams) vs concentration-dependent (Aminoglycosides, FQs) killing determines dosing intervals. Cardiac drugs target the autonomic cascade and ion channels; avoid AV-nodal blockers in WPW. Analgesia: WHO ladder — NSAIDs/paracetamol → weak opioids → strong opioids, always with laxative prophylaxis.',
      diagnostics: [
        'Before antibiotics: cultures are "diagnostic" — then escalate/de-escalate at 48-72h. Check renal function for renally cleared agents.',
        'Monitor therapy: vancomycin troughs, digoxin levels, lithium levels, INR for warfarin, and glucose for insulin.',
      ],
      pharmacotherapy: [
        'β-lactam dose optimization: use time above MIC — give frequent or continuous dosing (not once daily).',
        'Aminoglycosides: once-daily dosing leverages concentration-dependent kill; monitor for nephro/ototoxicity even with troughs in range.',
        'Azithromycin: beware QTc prolongation; avoid in known long QT.',
        'Warfarin vs DOAC: DOACs (apixaban/rivaroxaban/edoxaban/dabigatran) preferred for AF/VTE unless mechanical valve or severe renal impairment/antiphospholipid syndrome.',
      ],
      traps: [
        'Allergy to penicillin: ask what actually happened; true anaphylaxis rules out all β-lactams — cephalosporins are a no-go in true anaphylaxis but fine in most "rash" histories.',
        'Vancomycin + piperacillin-tazobactam = classic nephrotoxic combo; weigh against alternatives in the ATN-prone patient.',
        'Opioid-induced constipation is expected — never withhold laxatives. Respiratory depression is the dose-limiting fear.',
        'Ciprofloxacin + warfarin: inhibit CYP1A2/3A4 → ↑ INR. Watch the interaction list, not just the drug.',
      ],
    },
    vignettes: [
      {
        topic: 'Antibiotics',
        stem: 'A 45-year-old man with penicillin-anaphylaxis history develops hospital-acquired pneumonia. Sputum grows MRSA. Which antibiotic should be selected?',
        options: [
          'Ceftriaxone',
          'Vancomycin',
          'Amoxicillin-clavulanate',
          'Aztreonam alone',
        ],
        correct: 1,
        explanation: 'MRSA pneumonia requires an anti-MRSA agent — vancomycin (or linezolid/ceftaroline). Ceftriaxone and amoxicillin-clavulanate lack MRSA coverage, and true penicillin anaphylaxis precludes all β-lactams, including aztreonam (which is β-lactam but monobactam + covers gram-negatives, not MRSA).',
      },
      {
        topic: 'Cardiac Drugs',
        stem: 'A 68-year-old woman with paroxysmal AF (CHADS2-VASc 4) and a mechanical mitral valve replacement needs anticoagulation. Which regimen is correct?',
        options: [
          'Warfarin with INR 2.5-3.5 (target for mechanical mitral valve)',
          'Apixaban 5 mg twice daily',
          'Low-dose aspirin',
          'Rivaroxaban 20 mg daily',
        ],
        correct: 0,
        explanation: 'Mechanical heart valves (especially mitral) require warfarin with a higher INR target (2.5-3.5); DOACs are contraindicated in mechanical valves and moderately-severe mitral stenosis. Aspirin alone is inadequate for stroke prevention in AF.',
      },
      {
        topic: 'Analgesia',
        stem: 'A 30-year-old laparotomy patient has severe postoperative pain (numeric rating 8/10). NSAIDs are contraindicated for renal impairment. Which is the most appropriate step up the analgesic ladder?',
        options: [
          'Oral morphine-equivalent opioid with scheduled laxatives and PRN antiemetic',
          'Tramadol only at night to avoid dependence',
          'Paracetamol alone',
          'Ketamine infusion as first line',
        ],
        correct: 0,
        explanation: 'Moderate-to-severe post-op pain calls for step-3 opioids (morphine equivalents) in a scheduled/controlled regimen. Prevent opioid-induced constipation with routine laxatives and treat nausea anticipatorily. Ketamine is a second-line adjunct, not monotherapy.',
      },
      {
        topic: 'Endocrine & Metabolic',
        stem: 'A 55-year-old with type 2 diabetes and eGFR 80 is on metformin plus empagliflozin, with worsening albuminuria (UACR 800 mg/g). Which addition has the strongest renoprotective evidence?',
        options: ['SGLT2 inhibitor (already on it) → start finerenone', 'Sitagliptin', 'Glibenclamide', 'Pioglitazone'],
        correct: 0,
        explanation: 'Finerenone (nonsteroidal MRA) reduces CKD progression in T2D with albuminuria on top of maximal ACEi/ARB + SGLT2i (FIDELIO). The patient already has maximal SGLT2i benefit, so add finerenone. Sulfonylureas/DPP4i carry neutral-to-lesser renal evidence; pioglitazone causes fluid retention.',
      },
      {
        topic: 'Antibiotics',
        stem: 'A nurse reports an "allergy to penicillin" causing a maculopapular rash 15 years ago. She now needs antibiotics for community-acquired pneumonia. What is the evidenced approach?',
        options: [
          'Give a cephalosporin (e.g., ceftriaxone); true anaphylaxis is not established by this history',
          'Avoid all β-lactams indefinitely and use azithromycin + a quinolone',
          'Skin-prick test to penicillin is mandatory before any β-lactam',
          'Desensitize to penicillin before therapy',
        ],
        correct: 0,
        explanation: 'A distant maculopapular rash is a low-risk history — most "penicillin allergies" are not immunologically confirmed, and cephalosporins are safe in non-anaphylactoid histories. Skin-prick/prep-testing is unavailable in most EDs; desensitization is reserved for true anaphylaxis when the β-lactam is essential.',
      },
    ],
    flash: [
      { front: 'Time- vs concentration-dependent killing', back: 'β-lactams=time above MIC (multiple doses); aminoglycosides & fluoroquinolones=concentration/Cmax:MIC (once daily).', topic: 'Antibiotics' },
      { front: 'Penicillin "allergy" — the honest classification', back: 'Anaphylaxis/immediate → avoid all β-lactams. Delayed rash → cephalosporins usually safe; attempt labels surgically-clean.', topic: 'Antibiotics' },
      { front: 'Warfarin vs DOAC in mechanical valve', back: 'Mechanical valves = WARFARIN (target INR 2.5-3.5 for mitral). DOACs are contraindicated.', topic: 'Cardiac Drugs' },
      { front: 'Anticoagulation and antiphospholipid syndrome', back: 'APLS = autoimmune thrombosis → warfarin, NOT DOACs (DOACs underperform; risk of recurrence).', topic: 'Cardiac Drugs' },
      { front: 'Opioid ladder pearl', back: 'Always pair opioids with scheduled laxatives — constipation is universal, respiratory depression is the ceiling.', topic: 'Analgesia' },
      { front: 'Nephrotoxic combo to remember', back: 'Vancomycin + piperacillin-tazobactam ↑ AKI risk. Monitor creatinine closely in the septic patient.', topic: 'Antibiotics' },
    ],
  },
  pathology: {
    label: 'Pathology',
    icon: '🔬',
    topics: ['Neoplasia', 'Inflammation & Repair', 'Genetics & Syndromes', 'Clinical Pathology'],
    notes: {
      title: 'Pathology High-Yield Framework',
      pathophysiology:
        'Neoplasia: hallmarks — self-sufficiency in growth signals, insensitivity to antigrowth, evading apoptosis, limitless replication (telomerase), sustained angiogenesis, invasion & metastasis, reprogrammed metabolism (Warburg), evading immune destruction. Inflammation: cardinal signs; granulomas = organized macrophage response to persistent antigen (TB, sarcoid, Crohns, histoplasma).',
      diagnostics: [
        'Tumor "grade" (differentiation/mitoses) vs "stage" (TNM spread) — stage drives prognosis more strongly in most solid tumors.',
        'Sentinel lymph node biopsy for melanoma/breast determines nodal status with minimal morbidity.',
        'Immunohistochemistry panels (CK, Vimentin, S100, CD markers) resolve ambiguous histology.',
      ],
      pharmacotherapy: [
        'Idh1/2 inhibitors, BCR-ABL TKIs (imatinib) and ALK/EGFR TKIs exemplify targeted therapy; immune checkpoint inhibitors (PD-1/PD-L1) reactivate cytotoxic T cells.',
        'Adjuvant vs neoadjuvant therapy decisions depend on risk, stage, and biology, not just tumor size.',
      ],
      traps: [
        'Don\'t call every "mass" cancer — abscess, hematoma, cyst, and granuloma mimic malignancy on imaging and even histology.',
        'Grading ≠ staging; a low-grade tumor can be high-stage.',
        'Biopsy before "treatment" of a suspected sarcoma is mandatory to avoid catastrophic soft-tissue contamination.',
        'Lymphoma vs carcinoma: differentiate by IHC/morphology — "small round blue cell" is not a diagnosis.',
      ],
    },
    vignettes: [
      {
        topic: 'Neoplasia',
        stem: 'A 60-year-old man has weight loss, night sweats, and a left supraclavicular (Virchow) lymph node that is hard and fixed. What does this node likely represent and from where?',
        options: [
          'Metastatic gastric or abdominal malignancy (Virchow node via thoracic duct drainage)',
          'Local lymphoma only, unrelated to abdomen',
          'Sarcoidosis without systemic symptoms',
          'Tuberculous adenitis solely from lung disease',
        ],
        correct: 0,
        explanation: 'The left supraclavicular/Virchow node drains the thoracic duct from the abdomen; in adults it most commonly signals metastatic gastric, pancreatic, or other abdominal cancer. In lymphomas nodes are usually larger/matted but not classically "Virchow". Histology + IHC will discriminate cancers needing staging.',
      },
      {
        topic: 'Neoplasia',
        stem: 'Which of the following best describes the difference between tumor GRADE and STAGE?',
        options: [
          'Grade reflects differentiation & mitotic rate; stage reflects anatomic extent (TNM)',
          'Grade is based on tumor size alone; stage on cell morphology',
          'They are interchangeable terms for prognosis',
          'Stage is histologic; grade is clinical',
        ],
        correct: 0,
        explanation: 'Grade = how much the tumor resembles the tissue of origin (differentiation) + proliferative activity; Stage = tumor (T), lymph nodes (N), metastasis (M). Stage — especially the presence of metastasis — is the strongest single prognostic variable.',
      },
      {
        topic: 'Inflammation & Repair',
        stem: 'A 35-year-old with chronic cough and weight loss has necrotizing granulomas on lung biopsy with caseating centers. Which infectious organism is the classic causative agent?',
        options: ['Mycobacterium tuberculosis', 'Streptococcus pneumoniae', 'Influenza virus', 'Histoplasma immunoband transient'],
        correct: 0,
        explanation: 'Caseating (necrotizing) granulomas classically mark pulmonary tuberculosis (Mycobacterium tuberculosis). Noncaseating granulomas suggest sarcoidosis or Crohn disease. Bacterial pneumonia and influenza produce neutrophilic/lymphocytic inflammation without granulomata.',
      },
      {
        topic: 'Genetics & Syndromes',
        stem: 'A 28-year-old woman with a strong family history of colon cancer (father 42 y) presents with multiple colonic adenomas. Germline testing is positive for a mutation in APC. Which syndrome is this?',
        options: ['Familial adenomatous polyposis (FAP)', 'Lynch syndrome', 'Peutz-Jeghers syndrome', 'Cowden syndrome'],
        correct: 0,
        explanation: 'FAP is caused by germline APC mutations → hundreds of adenomatous polyps from the second decade → colorectal cancer by ~40 years without colectomy. Lynch (HNPCC) causes fewer polyps via MMR defects; Peutz-Jeghers has hamartomas + mucocutaneous pigmentation.',
      },
      {
        topic: 'Clinical Pathology',
        stem: 'A hemoglobin A1c of 9.1% in an adult (reference <5.7%) most directly reflects which phenomenon?',
        options: [
          'Glycation of hemoglobin proportional to average glucose over previous ~2-3 months',
          'Acute hypoglycemia over 24 hours',
          'Fructosamine-derived insulin resistance only',
          'Renal clearance of insulin',
        ],
        correct: 0,
        explanation: 'A1c is formed by nonenzymatic glycation of hemoglobin, proportional to mean glucose over the RBC lifecycle (~90-120 days). It is the standard for diabetes monitoring and prognosis. Acute glucose and fructosamine measure shorter windows.',
      },
    ],
    flash: [
      { front: 'Hallmark of cancer set (pick 6)', back: 'Self-sufficiency in growth · insensitivity to anti-growth · evading apoptosis · limitless replication · angiogenesis · invasion/metastasis. (+ reprogrammed metabolism, immune evasion)', topic: 'Neoplasia' },
      { front: 'Caseating granuloma = ? Non-caseating = ?', back: 'Caseating → TB (± fungal). Non-caseating → sarcoidosis, Crohn, leprosy variants, brucellosis.', topic: 'Inflammation & Repair' },
      { front: 'FAP vs Lynch quick split', back: 'FAP = APC polyposis (hundreds of polyps). Lynch = MMR mutation, few polyps, right-sided, MSI-high, extra-colonic (endometrial).', topic: 'Genetics & Syndromes' },
      { front: 'Virchow node = ?', back: 'Left supraclavicular node – metastatic abdominal cancer (gastric > pancreatic) via thoracic duct. Biopsy + IHC.', topic: 'Neoplasia' },
      { front: 'A1c window', back: '~2-3 months (RBC lifespan ~120d). Fructosamine = 2-3 weeks (albumin).', topic: 'Clinical Pathology' },
      { front: 'Grade = ? Stage = ?', back: 'Grade: differentiation + mitotic rate (histology). Stage: TNM (anatomy) — stage outweighs grade prognostically.', topic: 'Neoplasia' },
    ],
  },
  immunology: {
    label: 'Immunology',
    icon: '🛡️',
    topics: ['Hypersensitivity', 'Autoimmunity', 'Immunodeficiencies', 'Transplantation & Vaccines'],
    notes: {
      title: 'Immunology High-Yield Framework',
      pathophysiology:
        'The immune system = innate (fast, nonspecific: complement, neutrophils, macrophages, NK) + adaptive (specific, memory: T/B cells). Hypersensitivity = exaggerated host-immune damaging response, classified I-IV (Gell-Coombs). Autoimmunity = broken self-tolerance (central & peripheral). Primary immune deficiency = recurrent/unusual infections from genetic blocks.',
      diagnostics: [
        'Type I: skin-prick/IgE, serum tryptase in anaphylaxis. Type II: direct/indirect Coombs, anti-GBM. Type III: C3/C4, ANCA, cryoglobulins, biopsy for immune complexes. Type IV: tuberculin, patch testing, biopsy with lymphocytic infiltrates.',
        'Immunodeficiencies: CBC with differential (lymphocytes, neutrophils), immunoglobulin levels (IgG/A/M), lymphocyte subsets (CD4/CD8), flow cytometry, vaccine response titers.',
        'Transplant monitoring: renal function, troughs of CNIs (tacrolimus), doppler US, biopsy for rejection.',
      ],
      pharmacotherapy: [
        'Anaphylaxis: IM epinephrine + supine, oxygen, fluids; antihistamines/steroids are adjuncts, NOT first-line.',
        'Autoimmune flares: glucocorticoids + disease-modifying agents (methotrexate, biologics). Biologics screen for latent TB first.',
        'Immunosuppression for transplant: induction with basiliximab/antithymocyte globulin; maintenance tacrolimus + MMF + prednisone ± steroids; treat CMV prophylaxis.',
        'Vaccines: live vaccines (MMR, varicella, intranasal flu) contraindicated in severe immunosuppression.',
      ],
      traps: [
        'Type II vs III: Type II targets SELF cell-surface antigens (hemolytic anemia, ITP); Type III is soluble immune complexes (SLE, serum sickness).',
        'Recurrent staph/pyogenic infections → think neutrophil defect (CGD) or complement (C3). Recurrent viral ↔ T-cell/NK defect.',
        'Anaphylaxis is TYPE I but the "nigraine" lists it under mast-cell: give epinephrine, not steroids first.',
        'Live vaccines in the immunocompromised = illness, not immunity.',
      ],
    },
    vignettes: [
      {
        topic: 'Hypersensitivity',
        stem: 'A 38-year-old develops urticaria, angioedema, and hypotension 10 minutes after receiving IV contrast for a CT. BP 75/40, audible wheeze. What is the single most important immediate treatment?',
        options: [
          'Intramuscular epinephrine 0.5 mg (1:1000), laterally in the thigh',
          'IV corticosteroids first',
          'Nebulized salbutamol alone',
          'Benadryl 50 mg IV',
        ],
        correct: 0,
        explanation: 'Anaphylaxis is a type I reaction; IM epinephrine into the thigh is the first-line life-saving drug. Antihistamines and corticosteroids are adjunctive — epinephrine buys the time for everything else.',
      },
      {
        topic: 'Autoimmunity',
        stem: 'A 40-year-old woman has malar rash, photosensitivity, arthralgia, and serositis. ANA is 1:1280; anti-dsDNA is positive. Which hypersensitivity mechanism is most central to the tissue injury?',
        options: [
          'Type III — immune complex deposition in vessels and glomeruli',
          'Type II — direct antibody against RBC surface antigens',
          'Type I — immediate IgE-mediated inflammation',
          'Type IV — delayed hypersensitivity with CD8 infiltration',
        ],
        correct: 0,
        explanation: 'Systemic lupus erythematosus is the classic type III (immune-complex) disease: soluble antigen-antibody complexes deposit in vessels/glomeruli, fix complement, and recruit neutrophils → vasculitis, nephritis, serositis. Anti-dsDNA correlates with renal disease.',
      },
      {
        topic: 'Immunodeficiencies',
        stem: 'A 15-month-old boy has had 4 episodes of invasive pneumococcal sepsis and profound cervical lymph-node hypoplasia, but no unusual viral infections. Total immunoglobulins are low, and B cells are absent on flow cytometry. Which is the most likely diagnosis?',
        options: ['X-linked agammaglobulinemia (Bruton, BTK defect)', 'DiGeorge syndrome', 'HIV infection', 'Chronic granulomatous disease'],
        correct: 0,
        explanation: 'Recurrent encapsulated bacterial infections (Streptococcus pneumoniae, H. influenzae) with absent B cells and hypogammaglobulinemia = X-linked agammaglobulinemia (BTK mutation interrupting early B-cell development). T-cell function is preserved. CGD presents with catalase-positive deep infections, not hypogammaglobulinemia.',
      },
      {
        topic: 'Transplantation & Vaccines',
        stem: 'Before starting a TNF-alpha inhibitor for rheumatoid arthritis, which screen is most important to check?',
        options: ['Latent tuberculosis screening (± IGRA/TST with CXR)', 'Hemoglobin A1c', 'A1AT phenotype', 'Vitamin D level alone'],
        correct: 0,
        explanation: 'TNF-α is essential for granuloma containment of Mycobacteria. Anti-TNF biologics reactivate latent TB; screening (TST/IGRA with CXR) and treatment if positive is mandatory before initiation — the single most important step to avoid miliary TB.',
      },
      {
        topic: 'Transplantation & Vaccines',
        stem: 'Which vaccine would be UNSAFE to give to a patient receiving high-dose immunosuppression after renal transplantation?',
        options: ['Live attenuated MMR', 'Inactivated influenza, 2026 strain', 'mRNA COVID-19 booster', 'Inactivated hepatitis B'],
        correct: 0,
        explanation: 'Live vaccines (MMR, varicella, live-attenuated influenza, yellow fever, BCG) are contraindicated in severe immunosuppression because the virus can cause disease. Inactivated vaccines (flu, COVID, HepB) are generally safe and recommended, with modified schedules.',
      },
    ],
    flash: [
      { front: 'Gell-Coombs I-IV in one line', back: 'I=IgE/mast cells (anaphylaxis, hay fever); II=cytotoxic Ab (AIHA, ITP); III=immune complexes (SLE, serum sickness); IV=T-cell delayed (contact dermatitis, TB).', topic: 'Hypersensitivity' },
      { front: 'Bruton agammaglobulinemia signature', back: 'BTK mutation, absent B cells, early encapsulated bacterial infections; T cell function intact.', topic: 'Immunodeficiencies' },
      { front: 'Type II vs III memory hook', back: 'Type II = antibodies against CELL surface (self). Type III = soluble immune complexes (vessels/glomeruli). Example: Coombs + → II; SLE nephritis → III.', topic: 'Hypersensitivity' },
      { front: 'Anaphylaxis drug order of born', back: 'Epinephrine IM first. Steroids & antihistamines are sidekicks. Never "benadryl first" in shock.', topic: 'Hypersensitivity' },
      { front: 'Anti-TNF screen list', back: 'TB (IGRA/TST + CXR) before starting. Also hepatitis B/C serologies.', topic: 'Transplantation & Vaccines' },
      { front: 'CGD pearls', back: 'NADPH oxidase defect → catalase-positive organisms (Staph, Serratia, Nocardia, Aspergillus) → granulomas + pneumonias.', topic: 'Immunodeficiencies' },
    ],
  },
};

// Generic curriculum fallback used when specialty is "general"
export const GENERAL_CURRICULUM = {
  label: 'General Medicine',
  icon: '📚',
  topics: ['Clinical Reasoning', 'Patient Safety', 'High-Yield Pearls'],
  notes: {
    title: 'Clinical Reasoning Framework',
    pathophysiology:
      'Anchor diagnostic reasoning in Bayesian thinking: pretest probability × likelihood ratio → post-test probability. Structure every case: chief complaint → key discriminating history → focused exam → minimal initial testing → rank the differential with a lead diagnosis and a must-not-miss.',
    diagnostics: [
      'Use pretest probability before every test you order; a test only helps when it changes management.',
      'Recheck your diagnosis with "what is the one finding that would destroy my working diagnosis?"',
    ],
    pharmacotherapy: [
      'Start low, go slow with geriatric dosing; always reconcile medication lists.',
      'Never prescribe without checking drug-drug interactions (especially QT, CYP, renally-cleared).',
    ],
    traps: [
      'Premature closure is the #1 diagnostic error — list at least 3 differentials.',
      'Never attribute a rising troponin or a "worst headache" to cost/psychology without exclusion.',
    ],
  },
  vignettes: [
    {
      topic: 'Clinical Reasoning',
      stem: 'A 70-year-old man with abdominal pain, vomiting, and low urine output is hypotensive. Management priority is:',
      options: ['Restore perfusion with IV fluids and treat the cause', 'CT imaging before resuscitation', 'Analgesia only', 'Observation for 6 hours'],
      correct: 0,
      explanation: 'Shock of any etiology is a perfusion emergency: fluid resuscitation (directed by response) + supplement oxygen + treat cause. Imaging can follow stabilization. "Diagnose then treat" fails in the unwell patient.',
    },
  ],
};