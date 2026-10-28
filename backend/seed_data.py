import os
import sys
from datetime import datetime, timezone, timedelta, date

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.models.models import (
    User, EmployeeProfile, WorkSession, Lead, Call, CallRecording, CallEvent, FollowUp, AuditLog, ProviderAccount
)

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("[INFO] Seeding Polarise Telecom Technology database...")

    # Default demo password for all initial accounts
    DEFAULT_PASS = "Polaris@2026"
    hashed_pass = get_password_hash(DEFAULT_PASS)

    now = datetime.now(timezone.utc)
    today = now.date()

    # 1. Seed 3 Administrators
    admins_data = [
        {
            "employee_id": "ADM-001",
            "name": "Dr. Arvind Menon",
            "email": "admin1@polarisedu.in",
            "role": "super_admin",
            "designation": "Super Administrator & Director",
            "department": "Executive Management",
            "phone_number": "+918047190001",
            "extension": "100"
        },
        {
            "employee_id": "ADM-002",
            "name": "Pooja Sharma",
            "email": "admin2@polarisedu.in",
            "role": "operations_admin",
            "designation": "Operations Administrator & Telecalling Lead",
            "department": "Telecalling Operations",
            "phone_number": "+918047190002",
            "extension": "101"
        },
        {
            "employee_id": "ADM-003",
            "name": "Karthik Iyer",
            "email": "admin3@polarisedu.in",
            "role": "reporting_admin",
            "designation": "Reporting Administrator & Admissions Analyst",
            "department": "Data & Performance Analytics",
            "phone_number": "+918047190003",
            "extension": "102"
        }
    ]

    admin_users = []
    for adm in admins_data:
        user = User(
            employee_id=adm["employee_id"],
            name=adm["name"],
            email=adm["email"],
            hashed_password=hashed_pass,
            role=adm["role"],
            phone_number=adm["phone_number"],
            extension=adm["extension"],
            is_active=True
        )
        db.add(user)
        db.flush()

        profile = EmployeeProfile(
            user_id=user.id,
            designation=adm["designation"],
            department=adm["department"],
            current_status="available",
            status_message="Admin Console Active",
            last_status_change=now,
            last_active_at=now
        )
        db.add(profile)
        admin_users.append(user)

    # 2. Seed 10 Employees
    telecallers_data = [
        ("EMP-001", "Rohan Verma", "emp01@polarisedu.in", "+919876543201", "201", "available", "Online - Ready to dial"),
        ("EMP-002", "Sneha Patel", "emp02@polarisedu.in", "+919876543202", "202", "available", "Online - Calling STEM leads"),
        ("EMP-003", "Ananya Rao", "emp03@polarisedu.in", "+919876543203", "203", "on_break", "Lunch Break (15 mins)"),
        ("EMP-004", "Vikas Deshmukh", "emp04@polarisedu.in", "+919876543204", "204", "available", "Online - Counseling NEET aspirants"),
        ("EMP-005", "Meera Nair", "emp05@polarisedu.in", "+919876543205", "205", "available", "Online - Active"),
        ("EMP-006", "Aditya Kulkarni", "emp06@polarisedu.in", "+919876543206", "206", "offline", "Signed off"),
        ("EMP-007", "Priya Sundaram", "emp07@polarisedu.in", "+919876543207", "207", "available", "Online - Management admissions"),
        ("EMP-008", "Rahul Sengupta", "emp08@polarisedu.in", "+919876543208", "208", "available", "Online - North India admissions"),
        ("EMP-009", "Divya Joshi", "emp09@polarisedu.in", "+919876543209", "209", "on_break", "Tea Break"),
        ("EMP-010", "Farhan Khan", "emp10@polarisedu.in", "+919876543210", "210", "available", "Online - Overseas admissions")
    ]

    employees = []
    for eid, name, email, phone, ext, st, st_msg in telecallers_data:
        user = User(
            employee_id=eid,
            name=name,
            email=email,
            hashed_password=hashed_pass,
            role="telecaller",
            phone_number=phone,
            extension=ext,
            is_active=True
        )
        db.add(user)
        db.flush()

        profile = EmployeeProfile(
            user_id=user.id,
            designation="Senior Admissions Telecaller",
            department="Student Admissions Counseling",
            current_status=st,
            status_message=st_msg,
            last_status_change=now - timedelta(minutes=25),
            last_active_at=now - timedelta(minutes=2)
        )
        db.add(profile)

        # Active work session for logged-in employees
        if st != "offline":
            login_time = now - timedelta(hours=3, minutes=15)
            session = WorkSession(
                user_id=user.id,
                session_date=today,
                login_time=login_time,
                is_active=True,
                duration_seconds=int((now - login_time).total_seconds()),
                active_calls_count=8
            )
            db.add(session)

        employees.append(user)

    # 3. Seed Realistic Scale of Student & Parent Leads (140 leads per employee = 1,500 total leads)
    first_names = ["Aarav", "Rohan", "Ananya", "Sneha", "Aditya", "Pooja", "Vikram", "Tanmay", "Ishita", "Kabir", "Rhea", "Aryan", "Meera", "Farhan", "Kavya", "Arjun", "Priya", "Nikhil", "Divya", "Rahul", "Varun", "Simran", "Deepak", "Anushka", "Manish", "Deepika", "Kunal", "Shruti", "Akash", "Tanya"]
    surnames = ["Sharma", "Verma", "Patel", "Rao", "Deshmukh", "Nair", "Kulkarni", "Sundaram", "Sengupta", "Joshi", "Khan", "Iyer", "Menon", "Reddy", "Chawla", "Bedi", "Tiwari", "Bose", "Nambiar", "Mukherjee", "Chatterjee", "Shetty", "Gowda", "Bhat", "Hegde", "Pillai", "Agarwal", "Bansal", "Gupta", "Malhotra"]
    parent_titles = ["Rajesh", "Venkatesh", "Sunil", "Amit", "Harpreet", "Dr. Suresh", "Nitin", "Gopalakrishnan", "Mansoor", "Milind", "Navin", "Sudhir", "Koti", "Prabhakar", "Sanjay", "Alok", "Prakash", "Dr. Tariq", "Dinesh", "Subhash"]
    courses = [
        "B.Tech Computer Science (AI & ML)", "MBBS NEET UG Guidance", "MBA in Data Analytics & Marketing", 
        "B.Tech Electronics & Robotics", "MS in Computer Science (USA / Canada)", "BDS & Allied Health Sciences", 
        "B.Tech Mechanical & EV Engineering", "B.Sc Biotechnology & Research", "Integrated BBA-MBA Dual Degree", 
        "B.Tech Aerospace & Avionics", "Masters in International Management", "MBBS Direct Admission Counseling", 
        "B.Tech Cybersecurity & Cloud", "NEET PG Counseling Guidance", "B.Arch Architecture & Design"
    ]
    locations = [
        ("Bengaluru", "Karnataka"), ("Mysuru", "Karnataka"), ("Pune", "Maharashtra"), ("Mumbai", "Maharashtra"), 
        ("Hyderabad", "Telangana"), ("Chennai", "Tamil Nadu"), ("Delhi NCR", "Delhi"), ("Kochi", "Kerala"), 
        ("Kolkata", "West Bengal"), ("Chandigarh", "Punjab"), ("Belagavi", "Karnataka"), ("Hubballi", "Karnataka"), 
        ("Lucknow", "Uttar Pradesh"), ("Vijayawada", "Andhra Pradesh"), ("Jaipur", "Rajasthan"), ("Ahmedabad", "Gujarat")
    ]
    statuses = ["New", "Assigned", "Contacted", "Interested", "Follow-up Required", "Converted"]
    priorities = ["Medium", "High", "Urgent", "Low"]
    sources = ["Website Inquiry", "Google Ads", "Meta Ads", "Education Fair", "School Outreach", "Direct Referral"]

    seeded_leads = []
    phone_counter = 9845010000

    # 3a. Seed 140 leads for EACH of the 10 employees (1,400 leads assigned)
    for emp_idx, emp in enumerate(employees):
        for lead_num in range(1, 141):
            s_fn = first_names[(emp_idx * 14 + lead_num) % len(first_names)]
            s_sn = surnames[(emp_idx * 7 + lead_num) % len(surnames)]
            s_name = f"{s_fn} {s_sn}"
            p_name = f"{parent_titles[(lead_num + emp_idx) % len(parent_titles)]} {s_sn}"
            city, state = locations[(lead_num + emp_idx) % len(locations)]
            course = courses[(lead_num * 3 + emp_idx) % len(courses)]
            st = statuses[(lead_num + emp_idx) % len(statuses)]
            pri = priorities[(lead_num + emp_idx) % len(priorities)]
            src = sources[(lead_num + emp_idx) % len(sources)]
            phone_counter += 1
            phone_str = f"+91{phone_counter}"
            email_str = f"{s_fn.lower()}.{s_sn.lower()}{lead_num}@gmail.com"
            lead_code = f"POL-{emp.employee_id}-{lead_num:03d}"

            lead = Lead(
                lead_code=lead_code,
                student_name=s_name,
                parent_name=p_name,
                phone=phone_str,
                email=email_str,
                city=city,
                state=state,
                course_interest=course,
                lead_source=src,
                status=st,
                priority=pri,
                assigned_user_id=emp.id,
                total_calls_count=2 if st in ("Contacted", "Interested", "Converted") else 0,
                last_contact_date=now - timedelta(hours=(lead_num % 48) + 1) if st != "New" else None,
                next_follow_up=now + timedelta(days=1, hours=lead_num % 6) if st == "Follow-up Required" else None,
                notes=f"Inquiry for {course}. Student scored 90%+ in 12th board exams."
            )
            db.add(lead)
            seeded_leads.append(lead)

    # 3b. Seed 100 unassigned leads in pool for Admin testing and allocation
    for pool_idx in range(1, 101):
        s_fn = first_names[(pool_idx * 3) % len(first_names)]
        s_sn = surnames[(pool_idx * 5) % len(surnames)]
        s_name = f"{s_fn} {s_sn}"
        p_name = f"{parent_titles[pool_idx % len(parent_titles)]} {s_sn}"
        city, state = locations[pool_idx % len(locations)]
        course = courses[pool_idx % len(courses)]
        phone_counter += 1
        phone_str = f"+91{phone_counter}"
        email_str = f"{s_fn.lower()}.{s_sn.lower()}{pool_idx}@gmail.com"
        lead_code = f"POL-POOL-{pool_idx:03d}"

        lead = Lead(
            lead_code=lead_code,
            student_name=s_name,
            parent_name=p_name,
            phone=phone_str,
            email=email_str,
            city=city,
            state=state,
            course_interest=course,
            lead_source="Google Search Campaign",
            status="New",
            priority=priorities[pool_idx % len(priorities)],
            assigned_user_id=None,
            total_calls_count=0,
            notes=f"Fresh web inquiry for {course}. Awaiting counselor assignment."
        )
        db.add(lead)
        seeded_leads.append(lead)

    db.flush()

    # 4. Seed Historical Calls with Accurate Ringing vs Talk Times and Demo Recordings
    sample_calls_info = [
        (employees[0], seeded_leads[0], "outbound", "completed", "Interested - Scheduled Campus Visit", 45, 120, "Discussed AI & ML seat matrix and fee structure. Parent scheduled personal campus visit on Saturday."),
        (employees[0], seeded_leads[1], "outbound", "completed", "Follow-up Required", 30, 215, "Informed about government and management quota cutoffs for NEET UG. Requested call back tomorrow after discussing with spouse."),
        (employees[0], seeded_leads[2], "inbound", "completed", "Converted / Admission Done", 15, 340, "Parent called back to confirm admission seat deposit for MBA in Data Analytics. Transferred receipt details."),
        (employees[1], seeded_leads[3], "outbound", "completed", "Call Back Requested", 20, 85, "Student was currently attending tuition classes. Mother requested evening call at 6:30 PM."),
        (employees[1], seeded_leads[4], "outbound", "busy", "Busy / Not Answered", 40, 0, "Called twice. Line was busy. Automated retry scheduled in 2 hours."),
        (employees[3], seeded_leads[6], "outbound", "completed", "Interested - Sent Brochure", 25, 160, "Sent Mechanical and Robotics curriculum syllabus over WhatsApp. Student interested in German exchange semester."),
        (employees[4], seeded_leads[7], "outbound", "completed", "Converted / Seat Reserved", 20, 290, "Admissions counseling completed. Student confirmed application form submission for B.Sc Biotech."),
        (employees[6], seeded_leads[8], "inbound", "completed", "Interested - Fee Discussion", 10, 180, "Parent inquired about installment payment options and hostel accommodation fees.")
    ]

    for emp, lead, direction, status, outcome, ringing_sec, talk_sec, notes in sample_calls_info:
        call_sid = f"SIM-EXO-{emp.employee_id}-{lead.lead_code}"
        call_start = now - timedelta(hours=2, minutes=30)
        call_ans = call_start + timedelta(seconds=ringing_sec) if talk_sec > 0 else None
        call_end = call_start + timedelta(seconds=ringing_sec + talk_sec)

        call = Call(
            call_sid=call_sid,
            user_id=emp.id,
            lead_id=lead.id,
            customer_number=lead.phone,
            customer_name=lead.student_name,
            direction=direction,
            caller_id="+918047190000",
            status=status,
            start_time=call_start,
            answer_time=call_ans,
            end_time=call_end,
            elapsed_duration=ringing_sec + talk_sec,
            connected_duration=talk_sec, # Strictly talk time
            call_outcome=outcome,
            cost=1.50 if talk_sec > 0 else 0.0,
            is_demo=True,
            notes=notes,
            created_at=call_start
        )
        db.add(call)
        db.flush()

        # Add initial call event
        db.add(CallEvent(
            call_id=call.id,
            event_type="initiated",
            timestamp=call_start,
            raw_payload=f"Call initiated via Exotel virtual trunk +918047190000"
        ))

        # Add recording if connected talk time > 0
        if talk_sec > 0:
            rec = CallRecording(
                call_id=call.id,
                recording_sid=f"REC-{call.id}",
                recording_url=f"/api/telephony/recordings/{call.id}/stream",
                duration_seconds=talk_sec,
                status="Available",
                is_simulated=True,
                created_at=call_end
            )
            db.add(rec)

    # 5. Seed Follow-ups
    fu1 = FollowUp(
        lead_id=seeded_leads[1].id,
        user_id=employees[0].id,
        scheduled_time=now + timedelta(days=1, hours=2),
        status="pending",
        notes="Discuss NEET cutoffs with parent (Mr. Venkatesh Hegde)"
    )
    fu2 = FollowUp(
        lead_id=seeded_leads[3].id,
        user_id=employees[1].id,
        scheduled_time=now + timedelta(hours=4),
        status="pending",
        notes="Call student Ishita Sengupta after her tuition classes"
    )
    db.add(fu1)
    db.add(fu2)

    # 6. Provider Account record
    prov = ProviderAccount(
        provider_name="Exotel",
        is_active=True,
        virtual_number="+918047190000",
        subdomain="api.exotel.com",
        account_sid_masked="exo_demo_account_polaris",
        api_key_masked="exo_demo_key_99812",
        webhook_url="/api/telephony/webhooks/exotel"
    )
    db.add(prov)

    # 7. Audit Log
    db.add(AuditLog(
        user_id=admin_users[0].id,
        user_name=admin_users[0].name,
        action="SYSTEM_INITIALIZED",
        entity_type="System",
        details="Polarise Telecom Technology database initialized with 13 official accounts, demo leads and Exotel telephony adapter."
    ))

    db.commit()
    db.close()
    print("[SUCCESS] Seed complete! 13 accounts (3 Admins + 10 Telecallers) ready with password: 'Polaris@2026'")

if __name__ == "__main__":
    seed_database()
