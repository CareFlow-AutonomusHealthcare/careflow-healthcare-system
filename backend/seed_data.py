"""
Seeds full dummy data: 100 patients, 20 doctors, 70 staff, inventory, proposals.
Run from project root: backend/venv/bin/python3 backend/seed_data.py
"""
import sys, os, random, json
from datetime import datetime, timedelta
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import mysql.connector
from backend.database import (
    MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
)

now = datetime.now()

FIRST_NAMES = [
    "James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda","William","Barbara",
    "David","Susan","Richard","Jessica","Joseph","Sarah","Thomas","Karen","Charles","Lisa",
    "Christopher","Nancy","Daniel","Betty","Matthew","Margaret","Anthony","Sandra","Mark","Ashley",
    "Donald","Dorothy","Steven","Kimberly","Paul","Emily","Andrew","Donna","Joshua","Michelle",
    "Kenneth","Carol","Kevin","Amanda","Brian","Melissa","George","Deborah","Timothy","Stephanie",
    "Ronald","Rebecca","Edward","Sharon","Jason","Laura","Jeffrey","Cynthia","Ryan","Kathleen",
    "Jacob","Amy","Gary","Angela","Nicholas","Shirley","Eric","Anna","Jonathan","Brenda",
    "Stephen","Pamela","Larry","Emma","Justin","Nicole","Scott","Helen","Brandon","Samantha",
    "Benjamin","Katherine","Samuel","Christine","Raymond","Debra","Gregory","Rachel","Frank","Carolyn",
    "Ahmed","Fatima","Omar","Aisha","Hassan","Zainab","Ali","Nour","Ibrahim","Layla",
    "Priya","Raj","Anita","Vikram","Sunita","Arjun","Meera","Ravi","Kavya","Suresh",
]
LAST_NAMES = [
    "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
    "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
    "Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson",
    "Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
    "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts",
    "Patel","Shah","Kumar","Singh","Sharma","Gupta","Ali","Khan","Ahmed","Hassan",
    "Chen","Wang","Liu","Zhang","Yang","Huang","Wu","Zhou","Li","Sun",
    "Okafor","Diallo","Mensah","Nkosi","Abubakar","Eze","Adeyemi","Osei","Kamara","Traore",
]
SPECIALTIES = [
    "Cardiology","Internal Medicine","Emergency Medicine","Oncology","Neurology",
    "Orthopedics","Pediatrics","Radiology","Anesthesiology","Gastroenterology",
    "Pulmonology","Nephrology","Endocrinology","Rheumatology","Dermatology",
    "Psychiatry","Urology","Ophthalmology","ENT","Hematology",
]
DEPARTMENTS = [
    "Cardiology","Internal Medicine","Emergency","Oncology",
    "Neurology","Orthopedics","Pediatrics","ICU",
]
CONDITIONS = [
    "diabetes","hypertension","asthma","copd","heart_failure",
    "ckd","cancer","obesity","depression","hypothyroidism",
    "atrial_fibrillation","stroke_history","liver_disease","hiv","epilepsy",
]
LAB_TYPES = [
    ("HbA1c",          4.0, 14.0),
    ("Blood Pressure",  60, 200),
    ("Creatinine",     0.4,  6.0),
    ("WBC",            2.0, 18.0),
    ("Hemoglobin",     6.0, 18.0),
    ("Glucose",         60, 400),
    ("Cholesterol",    100, 350),
    ("Troponin",       0.0,  5.0),
    ("Sodium",         125, 155),
    ("Potassium",      2.5,  6.5),
]
INVENTORY_ITEMS = [
    ("Surgical Gloves (S)",    "boxes",  120),
    ("Surgical Gloves (M)",    "boxes",  200),
    ("Surgical Gloves (L)",    "boxes",   80),
    ("IV Bags 500ml",          "units",   45),
    ("IV Bags 1000ml",         "units",   30),
    ("Syringes 5ml",           "boxes",   60),
    ("Syringes 10ml",          "boxes",    8),
    ("Syringes 20ml",          "boxes",   15),
    ("Blood Pressure Cuffs",   "units",   12),
    ("Pulse Oximeters",        "units",   18),
    ("Defibrillator Pads",     "sets",     5),
    ("Oxygen Masks",           "units",   30),
    ("Nasal Cannulas",         "units",   50),
    ("Oxygen Cylinders",       "units",    7),
    ("Chemotherapy Kits",      "kits",     3),
    ("Sterile Dressings",      "packs",   60),
    ("Gauze Rolls",            "rolls",  150),
    ("Surgical Tape",          "rolls",   90),
    ("Alcohol Swabs",          "boxes",  200),
    ("Disposable Gowns",       "units",  300),
    ("N95 Masks",              "boxes",   25),
    ("Face Shields",           "units",   40),
    ("Thermometers",           "units",   22),
    ("Stethoscopes",           "units",   15),
    ("Catheters (Foley)",      "units",   35),
    ("Nasogastric Tubes",      "units",   20),
    ("Suture Kits",            "kits",    18),
    ("Scalpels",               "boxes",   12),
    ("Forceps",                "units",   25),
    ("Specimen Containers",    "boxes",   80),
    ("Blood Collection Tubes", "boxes",   55),
    ("Urine Test Strips",      "boxes",   40),
    ("Glucose Test Strips",    "boxes",   30),
    ("ECG Electrodes",         "packs",   45),
    ("Wheelchair",             "units",    8),
    ("Crutches",               "pairs",   14),
    ("Bedpans",                "units",   20),
    ("Feeding Tubes",          "units",   12),
    ("Insulin Pens",           "units",   60),
    ("Morphine Vials",         "vials",    9),
]

def rand_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def seed():
    conn = mysql.connector.connect(
        host=MYSQL_HOST, port=int(MYSQL_PORT),
        user=MYSQL_USER, password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE, autocommit=True
    )
    cur = conn.cursor()

    # ── Disable FK checks, clear, re-enable ──────────────────────────
    cur.execute("SET FOREIGN_KEY_CHECKS = 0")
    for tbl in ["audit_logs","decisions","action_proposals","risk_scores",
                "labs","appointments","patients","staffing_capacity",
                "inventory","nursing_staff","doctors","rooms","departments"]:
        cur.execute(f"TRUNCATE TABLE {tbl}")
    cur.execute("SET FOREIGN_KEY_CHECKS = 1")
    print("✓ Cleared & reset all tables")

    # ── Departments ──────────────────────────────────────────────────
    for d in DEPARTMENTS:
        cur.execute("INSERT INTO departments (name) VALUES (%s)", (d,))
    print(f"✓ {len(DEPARTMENTS)} departments")

    # ── Rooms ─────────────────────────────────────────────────────────
    statuses = ["Available","Occupied","Maintenance"]
    for dept_id in range(1, len(DEPARTMENTS) + 1):
        for i in range(1, 6):
            cur.execute(
                "INSERT INTO rooms (department_id, room_number, status) VALUES (%s,%s,%s)",
                (dept_id, f"{dept_id}{i:02d}", random.choice(statuses))
            )
    print(f"✓ {len(DEPARTMENTS) * 5} rooms")

    # ── 20 Doctors ────────────────────────────────────────────────────
    used = set()
    for i in range(20):
        name = f"Dr. {rand_name()}"
        while name in used: name = f"Dr. {rand_name()}"
        used.add(name)
        cur.execute(
            "INSERT INTO doctors (department_id, full_name, specialty) VALUES (%s,%s,%s)",
            ((i % len(DEPARTMENTS)) + 1, name, SPECIALTIES[i % len(SPECIALTIES)])
        )
    print("✓ 20 doctors")

    # ── 70 Nursing Staff ──────────────────────────────────────────────
    used = set()
    for i in range(70):
        name = rand_name()
        while name in used: name = rand_name()
        used.add(name)
        cur.execute(
            "INSERT INTO nursing_staff (department_id, full_name, shift) VALUES (%s,%s,%s)",
            ((i % len(DEPARTMENTS)) + 1, name, "Day" if i % 2 == 0 else "Night")
        )
    print("✓ 70 nursing staff")

    # ── Inventory ─────────────────────────────────────────────────────
    for idx, (name, unit, qty) in enumerate(INVENTORY_ITEMS):
        cur.execute(
            "INSERT INTO inventory (department_id, item_name, quantity_in_stock, unit) VALUES (%s,%s,%s,%s)",
            ((idx % len(DEPARTMENTS)) + 1, name, qty, unit)
        )
    print(f"✓ {len(INVENTORY_ITEMS)} inventory items")

    # ── Staffing Capacity ─────────────────────────────────────────────
    for dept_id in range(1, len(DEPARTMENTS) + 1):
        for shift in ["Day", "Night"]:
            cur.execute(
                "INSERT INTO staffing_capacity (department_id, shift, current_staff_count, required_staff_count) VALUES (%s,%s,%s,%s)",
                (dept_id, shift, random.randint(4, 10), random.randint(8, 14))
            )
    print("✓ Staffing capacity")

    # ── 100 Patients ──────────────────────────────────────────────────
    high_risk = set(random.sample(range(1, 101), 20))
    mod_risk  = set(random.sample([i for i in range(1, 101) if i not in high_risk], 35))
    used = set()
    for i in range(1, 101):
        name = rand_name()
        while name in used: name = rand_name()
        used.add(name)
        if i in high_risk:
            conds = {c: True for c in random.sample(CONDITIONS, random.randint(2, 4))}
        elif i in mod_risk:
            conds = {c: True for c in random.sample(CONDITIONS, random.randint(1, 2))}
        else:
            n = random.choices([0, 1], weights=[0.4, 0.6])[0]
            conds = {c: True for c in random.sample(CONDITIONS, n)} if n else {}
        cur.execute(
            "INSERT INTO patients (full_name, chronic_conditions) VALUES (%s,%s)",
            (name, json.dumps(conds))
        )
    print("✓ 100 patients")

    # ── Appointments ──────────────────────────────────────────────────
    apt_count = 0
    for pid in range(1, 101):
        for week in range(1, 13):
            scheduled = now - timedelta(weeks=week, days=random.randint(0, 4))
            if pid in high_risk:
                status = random.choices(["Attended","Missed","Cancelled"], weights=[0.25,0.60,0.15])[0]
            elif pid in mod_risk:
                status = random.choices(["Attended","Missed","Cancelled"], weights=[0.50,0.35,0.15])[0]
            else:
                status = random.choices(["Attended","Missed","Cancelled"], weights=[0.70,0.20,0.10])[0]
            cur.execute(
                "INSERT INTO appointments (patient_id, status, scheduled_at) VALUES (%s,%s,%s)",
                (pid, status, scheduled)
            )
            apt_count += 1
    print(f"✓ {apt_count} appointments")

    # ── Labs ──────────────────────────────────────────────────────────
    lab_count = 0
    for pid in range(1, 101):
        chosen = random.sample(LAB_TYPES, 2)
        for (test_type, lo, hi) in chosen:
            base = random.uniform(lo * 0.6, hi * 0.7)
            for week in range(1, 13):
                recorded = now - timedelta(weeks=week, days=random.randint(0, 3))
                drift = week * random.uniform(0.2, 0.6) if pid in high_risk else random.uniform(-1.0, 1.0)
                val = round(max(lo, min(hi, base + drift)), 2)
                cur.execute(
                    "INSERT INTO labs (patient_id, test_type, test_value, recorded_at) VALUES (%s,%s,%s,%s)",
                    (pid, test_type, val, recorded)
                )
                lab_count += 1
    print(f"✓ {lab_count} lab records")

    cur.close()
    conn.close()

    print(f"""
✓ Seeding complete!
  {len(DEPARTMENTS)} departments | {len(DEPARTMENTS)*5} rooms
  20 doctors | 70 nursing staff
  {len(INVENTORY_ITEMS)} inventory items
  100 patients ({len(high_risk)} high-risk, {len(mod_risk)} moderate, {100-len(high_risk)-len(mod_risk)} low)
  {apt_count} appointments | {lab_count} lab records

  → Log in as admin and click 'Run Risk Engine' to generate proposals.
""")

if __name__ == "__main__":
    seed()
