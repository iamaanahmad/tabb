export const SAMPLE_DOCUMENTS = [
  {
    id: "sample_er_denial",
    title: "Out-of-Network Emergency Room Fee Denial",
    filename: "er_denial_letter_2026.pdf",
    category: "Emergency Care / No Surprises Act",
    content: `
METROPOLITAN HEALTH INSURANCE CORP
100 Corporate Parkway, Suite 400
New York, NY 10001

NOTICE OF DENIAL OF ADVERSE BENEFIT DETERMINATION
Date: August 2, 2026
Patient Name: Alex Mercer
Member ID: MET-9842105-01
Claim Reference Number: CLM-2026-884912
Date of Service: July 14, 2026
Provider: Saint Jude General Emergency Dept (Out-of-Network)
Total Billed Amount: $4,850.00
Plan Allowance: $0.00
Patient Responsibility: $4,850.00

REASON FOR DENIAL:
Code 142-OON: Out-of-Network Facility and Physician Services.
"Services rendered by out-of-network provider without prior authorization. Emergency services authorization was not submitted within 24 hours of stabilization."

DISPUTE RIGHTS:
You have 180 days to appeal this determination under federal and state guidelines.
`
  },
  {
    id: "sample_mri_prior_auth",
    title: "Diagnostic Lumbar Spine MRI Denial",
    filename: "mri_denial_notice.pdf",
    category: "Diagnostic Imaging / Medical Necessity",
    content: `
APEX CARE HEALTH PLAN
Prior Authorization & Appeals Division
PO Box 99201, Austin, TX 78701

DENIAL OF PRIOR AUTHORIZATION REQUEST
Date: July 28, 2026
Patient Name: Sarah Jenkins
Member ID: APX-77319-B
Claim/Auth Ref: PA-992140
Provider: Texas Advanced Radiology
Service Requested: CPT 72148 - MRI Lumbar Spine without contrast
Total Cost: $2,100.00

REASON FOR DENIAL:
"Medical Necessity Criteria Not Met (Clinical Policy Manual Sec 4.2). Documentation does not establish 6 weeks of conservative therapy (Physical Therapy or Chiropractic care) prior to advanced neuroimaging."

APPEAL DEADLINE:
Level 1 Internal Appeal must be submitted within 60 calendar days.
`
  },
  {
    id: "sample_medication_step_therapy",
    title: "Specialty Autoimmune Biologic Denial",
    filename: "biologic_step_therapy_denial.pdf",
    category: "Prescription Drug / Step Therapy",
    content: `
BLUE CROSS SHIELD NATIONAL
Pharmacy Benefit Manager (PBM) Services
Date: August 5, 2026

PATIENT DENIAL NOTICE
Patient: Marcus Vance
Rx Member ID: BCS-4410923
Prescribed Drug: Skyrizi (risankizumab-rzaa) 150mg/mL
Prescriber: Dr. Elena Rostova, MD (Rheumatology)
Total Monthly Cost: $9,400.00

DENIAL REASON:
"Step Therapy Requirement Failed. Plan requires mandatory 90-day trial of generic Methotrexate and Humira (adalimumab biosimilar) prior to approval of second-line biologic therapy."

EXEMPTION CRITERIA:
Prescriber may submit a Step Therapy Exception Request with documented contraindications or prior treatment failure records.
`
  }
];
