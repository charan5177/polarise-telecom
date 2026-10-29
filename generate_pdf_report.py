import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 755, "Polarise Telecom Technology — Project Specification & Telephony Architecture")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 747, 558, 747)
            
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 35, page_text)
        self.drawString(54, 35, "CONFIDENTIAL — Polaris Educational Consultancy Telephony & CRM")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 47, 558, 47)
        self.restoreState()

def build_pdf(filename="Polarise_Telecom_Project_Report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#1e293b")
    accent_blue = colors.HexColor("#2563eb")
    accent_teal = colors.HexColor("#0d9488")
    neutral_dark = colors.HexColor("#0f172a")
    neutral_body = colors.HexColor("#334155")
    card_bg = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#cbd5e1")
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=accent_blue,
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=accent_teal,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=neutral_body,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=neutral_body,
        leftIndent=14,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'Code',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1e1b4b"),
        spaceAfter=4
    )

    meta_style = ParagraphStyle(
        'Meta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#64748b")
    )

    elements = []
    
    # Header Banner Box
    meta_table = Table([
        [
            Paragraph("<b>Client:</b> Polaris Educational Consultancy<br/><b>System:</b> Admissions Telecalling & PBX CRM", meta_style),
            Paragraph("<b>Version:</b> 1.0.0 Production<br/><b>Date:</b> October 2026 | Deployment: Vercel Live", meta_style)
        ]
    ], colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    elements.append(Paragraph("Polarise Telecom Technology", title_style))
    elements.append(Paragraph("Comprehensive Project Architecture, Telephony Integration & Operational Report", subtitle_style))
    elements.append(meta_table)
    elements.append(Spacer(1, 14))

    # Executive Summary
    elements.append(Paragraph("1. Executive Summary", h1_style))
    elements.append(Paragraph(
        "<b>Polarise Telecom Technology</b> is an enterprise-grade Cloud Telecalling and Student/Parent Admissions CRM developed specifically for <b>Polaris Educational Consultancy</b>. The platform bridges high-volume educational counseling workflows with cloud-based telecom carrier trunks (Exotel PBX). It enables educational counselors to conduct validated outbound calling, manage lead pipelines (100–200 contacts per counselor), record admissions conversations, receive forwarded parent inquiries, and deliver live supervisor telemetry—all while preserving complete privacy and data confidentiality.",
        body_style
    ))
    
    # TelephonyConfig Section
    elements.append(Paragraph("2. Telephony Configuration (TelephonyConfig) & Its Purpose", h1_style))
    elements.append(Paragraph(
        "The <b>TelephonyConfig</b> module serves as the mission-critical abstraction layer between the CRM application and telecom voice carrier backbones. Without telephony configuration, a CRM is merely a static contact database; with <code>TelephonyConfig</code>, the system acts as an interactive, carrier-integrated virtual call center.",
        body_style
    ))

    telephony_items = [
        ("Virtual Number Masking (Caller ID)", "All outbound calls made by counselors display the verified Polaris virtual number (+918047190000). Counselors' personal mobile numbers remain 100% confidential, while parents see a trusted, professional institutional caller ID."),
        ("Click-to-Call PBX Bridging", "When an employee initiates a call from the dashboard, the cloud PBX first rings the counselor's registered extension/phone. Upon answer, it instantaneously dials the student/parent and bridges both audio streams in real-time."),
        ("Dual Operating Mode Engine", "<b>Demo Sandbox Mode:</b> Provides realistic call simulations with synthetic WAV audio waveform generation for training and presentations with zero carrier bills.<br/><b>Live Exotel Mode:</b> Connects directly to Exotel REST APIs using Account SID, API Key, API Token, and Subdomain."),
        ("Automated Call Recording & Storage", "Every call initiated through the PBX is automatically captured from the moment of connection until disconnect. Audio files are indexed and made available strictly to administrative personnel."),
        ("Idempotent Webhook Callbacks", "Listens for real-time carrier events on <code>/api/telephony/webhooks/exotel</code>. Automatically updates call duration, answer timestamp, disposition, and recording SID without continuous client polling."),
        ("Smart Call Forwarding Routing", "Empowers counselors to toggle call forwarding, automatically routing inbound parent callbacks to mobile lines or designated fallback counseling desks.")
    ]

    telephony_table_data = [[
        Paragraph(f"<b>{title}</b>", ParagraphStyle('H', parent=body_style, fontName='Helvetica-Bold', textColor=accent_blue)),
        Paragraph(desc, body_style)
    ] for title, desc in telephony_items]

    t_table = Table(telephony_table_data, colWidths=[160, 344])
    t_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(t_table)
    elements.append(Spacer(1, 14))

    # Architecture & Technology Stack
    elements.append(Paragraph("3. System Architecture & Technology Stack", h1_style))
    tech_data = [
        [Paragraph("<b>Component</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
         Paragraph("<b>Technologies Used</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
         Paragraph("<b>Functional Responsibility</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white))],
        [Paragraph("<b>Frontend SPA</b>", body_style), Paragraph("React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons", body_style), Paragraph("Chroma Waves dynamic canvas, counselor calling desk, admin live supervision, analytics graphs", body_style)],
        [Paragraph("<b>Backend API</b>", body_style), Paragraph("Python 3.10+, FastAPI, SQLAlchemy, Pydantic, Uvicorn", body_style), Paragraph("Async REST endpoints, JWT role security, OpenPyXL parser, carrier webhook handlers", body_style)],
        [Paragraph("<b>Database</b>", body_style), Paragraph("SQLite (with /tmp sync for serverless)", body_style), Paragraph("Zero-cold-start relational persistence for 13 staff accounts, calls, recordings, and lead queues", body_style)],
        [Paragraph("<b>Cloud Telephony</b>", body_style), Paragraph("Exotel Voice PBX & Simulated Wave Engine", body_style), Paragraph("PSTN/GSM voice bridging, virtual caller ID masking, automated audio recording", body_style)],
        [Paragraph("<b>Deployment</b>", body_style), Paragraph("Vercel Serverless Edge Runtime", body_style), Paragraph("Full-stack monorepo deployment with automated CI/CD and public SSL access", body_style)],
    ]
    tech_table = Table(tech_data, colWidths=[100, 180, 224])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(tech_table)
    elements.append(Spacer(1, 14))

    elements.append(PageBreak())

    # User Roles and Security Matrix
    elements.append(Paragraph("4. User Personas & Permissions Matrix", h1_style))
    elements.append(Paragraph(
        "Access control is strictly governed by Role-Based Access Control (RBAC). A total of 13 pre-configured staff accounts are pre-seeded in the database to accommodate team operations:",
        body_style
    ))
    
    roles_data = [
        [Paragraph("<b>Role Level</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
         Paragraph("<b>Default Accounts</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
         Paragraph("<b>Call Recordings</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
         Paragraph("<b>Lead Allocation</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
         Paragraph("<b>PBX Config</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white))],
        [Paragraph("<b>Super Admin</b>", body_style), Paragraph("Dr. Arvind Menon<br/>(admin1@polarisedu.in)", body_style), Paragraph("FULL Access (Listen & Export)", body_style), Paragraph("All Employees", body_style), Paragraph("Full Access", body_style)],
        [Paragraph("<b>Operations Admin</b>", body_style), Paragraph("Pooja Sharma<br/>(admin2@polarisedu.in)", body_style), Paragraph("FULL Access (Supervisory)", body_style), Paragraph("All Employees", body_style), Paragraph("Read Only", body_style)],
        [Paragraph("<b>Reporting Admin</b>", body_style), Paragraph("Karthik Iyer<br/>(admin3@polarisedu.in)", body_style), Paragraph("FULL Access (Analytics)", body_style), Paragraph("All Employees", body_style), Paragraph("Read Only", body_style)],
        [Paragraph("<b>Counselor (10 Staff)</b>", body_style), Paragraph("Rohan, Sneha, Ananya, Vikas, Meera, Aditya, Priya, Rahul, Divya, Farhan", body_style), Paragraph("<font color='#b91c1c'><b>STRICTLY HIDDEN</b></font>", body_style), Paragraph("Assigned Leads Only", body_style), Paragraph("Hidden", body_style)],
    ]
    roles_table = Table(roles_data, colWidths=[90, 130, 110, 100, 74])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(roles_table)
    elements.append(Spacer(1, 14))

    # Core Workflows Walkthrough
    elements.append(Paragraph("5. Step-by-Step Operational Workflows", h1_style))
    
    workflows = [
        ("Step 1: Security & Locked Profile Protection", 
         "Users authenticate via the login portal with the Chroma Waves backdrop. If an administrator locks an employee's profile from the Live Status board, the system revokes access immediately. Any subsequent login attempts present a bold security alert advising them to 'Contact Administrator'."),
        
        ("Step 2: Excel / CSV Bulk Lead Ingestion & Distribution", 
         "The administrator uploads bulk student spreadsheets (.xlsx / .csv). The custom ingestion engine strips out sensitive cost/pricing columns, validates phone numbers against the 10-digit standard, and creates student lead profiles. The admin can then allocate 100 to 200 leads to each of the 10 counselors either through one-click balanced distribution or individual selection."),
        
        ("Step 3: Admissions Counselor Calling Desk", 
         "Counselors see only their designated leads. Clicking any student opens the calling interface. Built-in phone validation prevents accidental dialing if a number contains more or less than 10 digits. When a call completes, counselors select a mandatory call disposition (e.g. Interested, Callback Requested, Admission Confirmed, Not Reachable) and enter counseling notes. Recordings are hidden from the employee."),
         
        ("Step 4: Real-time Live Agent Supervision", 
         "Administrators monitor active team availability on the Live Status Board, indicating the exact count and identity of counselors currently Available, On Call, in Wrap-up, or Offline, ensuring balanced workload and active phone coverage."),
         
        ("Step 5: Call Recordings Audio Station", 
         "Only administrators possess access to the audio vault. The built-in HTML5 player supports scrubber seek, volume control, and duration markers, allowing directors to evaluate counselor pitch quality and student interactions."),
         
        ("Step 6: Day-wise, Weekly & Monthly Analytics Reports", 
         "Dynamic calculation computes call metrics directly from verified call logs. The UI presents multi-colored grouped bar charts (each day highlighted in vibrant gradients) and a chromatic spline trend graph. Clicking any period reveals the telemetry side drawer with granular call detail records."),
         
        ("Step 7: Corporate Data Export Suite", 
         "Administrators can filter and generate 5 standardized reports (Call Detail Records, Staff Performance, Admissions Conversion, Inbound Routing, Audit Trails) with live column schema previews and one-click Excel (.xlsx) / CSV downloads.")
    ]

    for title, desc in workflows:
        elements.append(Paragraph(f"<b>{title}</b>", h2_style))
        elements.append(Paragraph(desc, body_style))
        elements.append(Spacer(1, 3))

    elements.append(Spacer(1, 10))

    # Deployment Specifications
    elements.append(Paragraph("6. Production Deployment & Live Infrastructure", h1_style))
    deploy_info = [
        [Paragraph("<b>Production Web URL:</b>", body_style), Paragraph("<font color='#2563eb'><u>https://polarise-telecom.vercel.app</u></font>", body_style)],
        [Paragraph("<b>GitHub Repository:</b>", body_style), Paragraph("<font color='#2563eb'><u>https://github.com/charan5177/polarise-telecom</u></font>", body_style)],
        [Paragraph("<b>Vercel Project Scope:</b>", body_style), Paragraph("shaikasif346s-projects / polarise-telecom", body_style)],
        [Paragraph("<b>Backend Health Check:</b>", body_style), Paragraph("https://polarise-telecom.vercel.app/api/health (200 OK)", body_style)],
        [Paragraph("<b>Default Master Credentials:</b>", body_style), Paragraph("admin1@polarisedu.in | Polaris@2026", body_style)],
    ]
    deploy_table = Table(deploy_info, colWidths=[160, 344])
    deploy_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(deploy_table)
    elements.append(Spacer(1, 15))

    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#94a3b8"), spaceAfter=10))
    elements.append(Paragraph("<i>Report generated autonomously by Antigravity AI Engineer for Polaris Educational Consultancy. All rights reserved.</i>", meta_style))

    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "Polarise_Telecom_Project_Report.pdf"
    build_pdf(out_file)
