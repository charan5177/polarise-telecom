import io
import csv
from datetime import datetime
from typing import List, Any
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from app.models.models import Call, WorkSession, Lead

def format_dt(dt: Any) -> str:
    if not dt:
        return ""
    if isinstance(dt, datetime):
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    return str(dt)

def format_duration(seconds: int) -> str:
    if not seconds:
        return "00:00"
    m, s = divmod(seconds, 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"

def generate_calls_excel(calls: List[Call], report_title: str = "Call History Report") -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Calls"
    
    # Title Banner
    ws.merge_cells("A1:T1")
    title_cell = ws["A1"]
    title_cell.value = f"Polaris Educational Consultancy — {report_title}"
    title_cell.font = Font(name="Segoe UI", size=14, bold=True, color="FFFFFF")
    title_cell.fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 36

    # Generated date subtitle
    ws.merge_cells("A2:T2")
    sub_cell = ws["A2"]
    sub_cell.value = f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Total Records: {len(calls)}"
    sub_cell.font = Font(name="Segoe UI", size=10, italic=True, color="64748B")
    sub_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 20

    headers = [
        "Call ID", "Provider Call ID", "Employee ID", "Employee Name", "Lead Code",
        "Parent/Student Name", "Customer Phone", "Direction", "Caller ID (Virtual)",
        "Call Start", "Call Answer", "Call End", "Total Elapsed Duration",
        "Connected Talk Duration", "Status", "Outcome", "Recording Status",
        "Recording Reference", "Follow-up Date", "Notes"
    ]

    header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="2563EB", end_color="2563EB", fill_type="solid")
    header_align = Alignment(horizontal="center", vertical="center", wrap_text=True)
    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    ws.row_dimensions[4].height = 28
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=4, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_align
        cell.border = thin_border

    row_idx = 5
    for call in calls:
        emp_id = call.user.employee_id if call.user else "N/A"
        emp_name = call.user.name if call.user else "N/A"
        lead_code = call.lead.lead_code if call.lead else "Unlinked"
        cust_name = call.customer_name or (call.lead.student_name if call.lead else "Unknown")
        rec_status = call.recording.status if call.recording else "Not Recorded"
        rec_ref = call.recording.recording_sid if call.recording else ""

        row_values = [
            call.id,
            call.call_sid,
            emp_id,
            emp_name,
            lead_code,
            cust_name,
            call.customer_number,
            call.direction.capitalize(),
            call.caller_id,
            format_dt(call.start_time),
            format_dt(call.answer_time),
            format_dt(call.end_time),
            format_duration(call.elapsed_duration),
            format_duration(call.connected_duration),
            call.status.capitalize(),
            call.call_outcome or "Pending Review",
            rec_status,
            rec_ref,
            format_dt(call.follow_up_date),
            call.notes or ""
        ]

        ws.row_dimensions[row_idx].height = 22
        fill_color = "F8FAFC" if row_idx % 2 == 0 else "FFFFFF"
        row_fill = PatternFill(start_color=fill_color, end_color=fill_color, fill_type="solid")

        for col_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=val)
            cell.font = Font(name="Segoe UI", size=10)
            cell.fill = row_fill
            cell.border = thin_border
            if col_idx in [1, 7, 9, 13, 14, 15, 20]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")
        row_idx += 1

    # Adjust column widths
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()

def generate_work_sessions_excel(sessions: List[WorkSession]) -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Work Sessions"
    
    ws.merge_cells("A1:H1")
    title_cell = ws["A1"]
    title_cell.value = "Polaris Educational Consultancy — Attendance & Work Sessions"
    title_cell.font = Font(name="Segoe UI", size=14, bold=True, color="FFFFFF")
    title_cell.fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 36

    headers = [
        "Session ID", "Employee ID", "Employee Name", "Date",
        "Login Time", "Logout Time", "Working Duration", "Status"
    ]

    header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="0D9488", end_color="0D9488", fill_type="solid")
    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    ws.row_dimensions[3].height = 26
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=3, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    row_idx = 4
    for s in sessions:
        emp_id = s.user.employee_id if s.user else "N/A"
        emp_name = s.user.name if s.user else "N/A"
        status_label = "Active (Logged In)" if s.is_active else "Completed (Logged Out)"

        row_values = [
            s.id,
            emp_id,
            emp_name,
            str(s.session_date),
            format_dt(s.login_time),
            format_dt(s.logout_time) if s.logout_time else "In Progress",
            format_duration(s.duration_seconds),
            status_label
        ]

        ws.row_dimensions[row_idx].height = 20
        fill_color = "F8FAFC" if row_idx % 2 == 0 else "FFFFFF"
        row_fill = PatternFill(start_color=fill_color, end_color=fill_color, fill_type="solid")

        for col_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=val)
            cell.font = Font(name="Segoe UI", size=10)
            cell.fill = row_fill
            cell.border = thin_border
            cell.alignment = Alignment(horizontal="center", vertical="center")
        row_idx += 1

    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 14)

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()

def generate_employee_callsheet_excel(leads: List[Lead], employee_name: str = "All Counselors") -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Call Sheet"

    ws.merge_cells("A1:G1")
    title_cell = ws["A1"]
    title_cell.value = f"Polaris Educational Consultancy — Student Calling Sheet ({employee_name})"
    title_cell.font = Font(name="Segoe UI", size=13, bold=True, color="FFFFFF")
    title_cell.fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 34

    headers = [
        "Lead Code", "Student Name", "Parent Name", "Calling Phone Number",
        "Course Interest", "City", "Notes / Call Disposition"
    ]

    header_font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="2563EB", end_color="2563EB", fill_type="solid")
    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    ws.row_dimensions[3].height = 24
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=3, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    row_idx = 4
    for lead in leads:
        row_values = [
            lead.lead_code,
            lead.student_name,
            lead.parent_name or "N/A",
            lead.phone,
            lead.course_interest or "General Admissions",
            lead.city or "Bengaluru",
            "" # Empty column for handwritten / offline calling remarks
        ]

        ws.row_dimensions[row_idx].height = 22
        fill_color = "FFF7ED" if row_idx % 2 == 0 else "FFFFFF"
        row_fill = PatternFill(start_color=fill_color, end_color=fill_color, fill_type="solid")

        for col_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=val)
            cell.font = Font(name="Segoe UI", size=10)
            cell.fill = row_fill
            cell.border = thin_border
            if col_idx in [1, 4, 6]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")
        row_idx += 1

    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 16)

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()

def generate_leads_excel(leads: List[Lead]) -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Leads"

    ws.merge_cells("A1:K1")
    title_cell = ws["A1"]
    title_cell.value = "Polaris Educational Consultancy — Leads Master Register"
    title_cell.font = Font(name="Segoe UI", size=14, bold=True, color="FFFFFF")
    title_cell.fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 36

    headers = [
        "Lead Code", "Student Name", "Parent Name", "Phone", "Email",
        "City", "Course Interest", "Source", "Assigned Employee", "Status", "Priority"
    ]

    header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="3B82F6", end_color="3B82F6", fill_type="solid")
    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    ws.row_dimensions[3].height = 26
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=3, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    row_idx = 4
    for lead in leads:
        emp_name = lead.assigned_employee.name if lead.assigned_employee else "Unassigned"
        row_values = [
            lead.lead_code,
            lead.student_name,
            lead.parent_name or "",
            lead.phone,
            lead.email or "",
            lead.city or "",
            lead.course_interest or "",
            lead.lead_source or "",
            emp_name,
            lead.status,
            lead.priority
        ]

        ws.row_dimensions[row_idx].height = 20
        fill_color = "F8FAFC" if row_idx % 2 == 0 else "FFFFFF"
        row_fill = PatternFill(start_color=fill_color, end_color=fill_color, fill_type="solid")

        for col_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=val)
            cell.font = Font(name="Segoe UI", size=10)
            cell.fill = row_fill
            cell.border = thin_border
            cell.alignment = Alignment(horizontal="left", vertical="center")
        row_idx += 1

    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 3, 14)

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()

def generate_calls_csv(calls: List[Call]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Call ID", "Provider Call ID", "Employee ID", "Employee Name", "Lead Code",
        "Parent/Student Name", "Customer Phone", "Direction", "Caller ID",
        "Call Start", "Call Answer", "Call End", "Total Elapsed Duration (sec)",
        "Connected Talk Duration (sec)", "Status", "Outcome", "Recording Status"
    ])
    for call in calls:
        writer.writerow([
            call.id,
            call.call_sid,
            call.user.employee_id if call.user else "",
            call.user.name if call.user else "",
            call.lead.lead_code if call.lead else "",
            call.customer_name or "",
            call.customer_number,
            call.direction,
            call.caller_id,
            format_dt(call.start_time),
            format_dt(call.answer_time),
            format_dt(call.end_time),
            call.elapsed_duration,
            call.connected_duration,
            call.status,
            call.call_outcome or "",
            call.recording.status if call.recording else "Not Recorded"
        ])
    return output.getvalue()

def generate_sample_lead_template_excel() -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Lead Import Template"

    # Header styling
    ws.merge_cells("A1:H1")
    title_cell = ws["A1"]
    title_cell.value = "Polaris Educational Consultancy — Student & Parent Leads Intake Template"
    title_cell.font = Font(name="Segoe UI", size=13, bold=True, color="FFFFFF")
    title_cell.fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 36

    ws.merge_cells("A2:H2")
    sub_cell = ws["A2"]
    sub_cell.value = "Note: Fill in Student Name and 10-digit Phone Number (e.g. 9876543210). Upload to auto-distribute among telecallers."
    sub_cell.font = Font(name="Segoe UI", size=9, italic=True, color="475569")
    sub_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 20

    headers = [
        "Student Name", "Parent Name", "Phone Number", "Alt Phone",
        "Email Address", "City", "Course Interest", "Priority"
    ]
    header_fill = PatternFill(start_color="2563EB", end_color="2563EB", fill_type="solid")
    header_font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    ws.row_dimensions[4].height = 26
    for col_idx, h in enumerate(headers, 1):
        c = ws.cell(row=4, column=col_idx, value=h)
        c.font = header_font
        c.fill = header_fill
        c.alignment = Alignment(horizontal="center", vertical="center")
        c.border = thin_border

    sample_rows = [
        ("Rahul Sharma", "Sanjay Sharma", "9876543211", "9876543212", "rahul.s@gmail.com", "Bengaluru", "B.Tech Computer Science", "High"),
        ("Ananya Rao", "Venkatesh Rao", "9845012341", "", "ananya.r@yahoo.com", "Mysuru", "MBBS NEET UG Guidance", "Urgent"),
        ("Kabir Mehta", "Alok Mehta", "9820011221", "9820011222", "kabir.m@outlook.com", "Mumbai", "MBA International Business", "Medium"),
        ("Deepika Reddy", "Koti Reddy", "9848033441", "", "deepika.r@gmail.com", "Hyderabad", "B.Tech AI & Data Science", "High"),
        ("Farhan Sheikh", "Dr. Tariq Sheikh", "9819055661", "", "farhan.s@gmail.com", "Pune", "B.Arch Architecture", "Medium")
    ]

    for r_idx, row in enumerate(sample_rows, 5):
        ws.row_dimensions[r_idx].height = 22
        for c_idx, val in enumerate(row, 1):
            c = ws.cell(row=r_idx, column=c_idx, value=val)
            c.font = Font(name="Segoe UI", size=10)
            c.border = thin_border
            c.alignment = Alignment(horizontal="left", vertical="center")

    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 3, 16)

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()

def parse_leads_file(content: bytes, filename: str) -> List[dict]:
    """
    Parses uploaded Excel (.xlsx, .xls) or CSV files into normalized lead records.
    Normalizes 10-digit Indian mobile numbers (+91XXXXXXXXXX).
    """
    rows_data = []
    fname_lower = filename.lower()

    if fname_lower.endswith(".xlsx") or fname_lower.endswith(".xls"):
        wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
        ws = wb.active
        # Look for headers
        headers = []
        start_row = 1
        for r in range(1, min(15, ws.max_row + 1)):
            row_vals = [str(ws.cell(row=r, column=c).value or "").strip() for c in range(1, ws.max_column + 1)]
            non_empty = [v for v in row_vals if v]
            if len(non_empty) >= 2:
                row_text = " ".join(non_empty).lower()
                if "name" in row_text and ("phone" in row_text or "mobile" in row_text or "contact" in row_text or "number" in row_text):
                    headers = [v.lower() for v in row_vals]
                    start_row = r + 1
                    break
        
        if not headers and ws.max_row >= 1:
            headers = [str(ws.cell(row=1, column=c).value or "").strip().lower() for c in range(1, ws.max_column + 1)]
            start_row = 2

        for r in range(start_row, ws.max_row + 1):
            row_dict = {}
            has_val = False
            for c, h in enumerate(headers, 1):
                val = ws.cell(row=r, column=c).value
                if val is not None and str(val).strip():
                    has_val = True
                row_dict[h] = str(val).strip() if val is not None else ""
            if has_val:
                rows_data.append(row_dict)

    else:
        # CSV parsing
        try:
            decoded = content.decode("utf-8-sig")
        except Exception:
            decoded = content.decode("latin-1")
        reader = csv.DictReader(io.StringIO(decoded))
        for row in reader:
            normalized_row = {k.strip().lower() if k else "": (v.strip() if v else "") for k, v in row.items()}
            rows_data.append(normalized_row)

    # Normalize extracted lead objects
    parsed_leads = []
    for r in rows_data:
        # Detect student name
        student_name = (
            r.get("student name") or r.get("student_name") or r.get("student") or
            r.get("name") or r.get("candidate name") or r.get("applicant name") or ""
        ).strip()

        # Detect parent name
        parent_name = (
            r.get("parent name") or r.get("parent_name") or r.get("parent") or
            r.get("father name") or r.get("mother name") or r.get("guardian") or ""
        ).strip()

        # Detect phone
        phone_raw = (
            r.get("phone") or r.get("mobile") or r.get("contact number") or
            r.get("phone number") or r.get("calling phone number") or r.get("primary phone") or ""
        ).strip()

        if not student_name or not phone_raw:
            continue

        # Clean phone digits
        digits = "".join(filter(str.isdigit, phone_raw))
        if len(digits) > 10 and digits.startswith("91"):
            digits = digits[2:]
        if len(digits) > 10 and digits.startswith("0"):
            digits = digits[1:]
        
        if len(digits) != 10:
            continue
            
        formatted_phone = f"+91{digits}"

        alt_phone_raw = (r.get("alt phone") or r.get("alternate phone") or r.get("alt_phone") or "").strip()
        alt_digits = "".join(filter(str.isdigit, alt_phone_raw))
        if len(alt_digits) > 10 and alt_digits.startswith("91"):
            alt_digits = alt_digits[2:]
        formatted_alt = f"+91{alt_digits}" if len(alt_digits) == 10 else None

        email = (r.get("email") or r.get("email address") or "").strip().lower() or None
        city = (r.get("city") or r.get("location") or "Bengaluru").strip()
        state = (r.get("state") or "Karnataka").strip()
        course = (
            r.get("course interest") or r.get("course") or r.get("program") or 
            r.get("stream") or "Admissions Guidance"
        ).strip()
        priority = (r.get("priority") or "Medium").capitalize().strip()
        if priority not in ("Low", "Medium", "High", "Urgent"):
            priority = "Medium"
        notes = (r.get("notes") or r.get("remarks") or r.get("comments") or "").strip() or None

        parsed_leads.append({
            "student_name": student_name,
            "parent_name": parent_name or None,
            "phone": formatted_phone,
            "alt_phone": formatted_alt,
            "email": email,
            "city": city,
            "state": state,
            "course_interest": course,
            "priority": priority,
            "notes": notes
        })

    return parsed_leads

