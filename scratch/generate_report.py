import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

pdf_path = r"C:\Users\User\Downloads\Scrutor_Complete_Project_Explanation_Report.pdf"
desktop_pdf_path = r"C:\Users\User\Desktop\Scrutor_Complete_Project_Explanation_Report.pdf"
docs_pdf_path = r"c:\Users\User\Documents\Fault detection\Fault_detection\docs\Scrutor_Complete_Project_Explanation_Report.pdf"

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36
)

styles = getSampleStyleSheet()

# Custom Styles
title_style = ParagraphStyle('DocTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=20, leading=24, textColor=colors.HexColor('#0F172A'))
subtitle_style = ParagraphStyle('DocSubTitle', parent=styles['Normal'], fontName='Helvetica', fontSize=10.5, leading=14, textColor=colors.HexColor('#475569'))
h1_style = ParagraphStyle('H1', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=13, leading=16, textColor=colors.HexColor('#1E293B'), spaceBefore=12, spaceAfter=5)
body_style = ParagraphStyle('BodyTextCustom', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor('#334155'), spaceAfter=5)
bullet_style = ParagraphStyle('BulletCustom', parent=body_style, leftIndent=12, firstLineIndent=-8, spaceAfter=3)

story = []

# Title Section
story.append(Paragraph('📘 Scrutor: Comprehensive Project Technical & Architecture Guide', title_style))
story.append(Paragraph('End-to-End Deep Dive into Machine Learning Algorithms, Technology Trade-offs, Data Scaling, and System Architecture', subtitle_style))
story.append(Spacer(1, 6))
story.append(HRFlowable(width='100%', thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=10))

# SECTION 1: PROJECT PROCESS & WORKFLOW
story.append(Paragraph('1. Step-by-Step Project Process & System Workflow', h1_style))
story.append(Paragraph('The <b>Scrutor</b> application was engineered in 6 distinct sequential phases to create a production-grade predictive maintenance platform:', body_style))

steps = [
    ('Step 1: Telemetry Data Definition & Range Guardrails', 'Defined 7 operational sensor features (Voltage, Current, Motor Speed, Motor Temp, Vibration, Ambient Temp, Humidity) and established physical min/max operating bounds to prevent out-of-range data contamination.'),
    ('Step 2: Preprocessing & Dual-Stage Feature Scaling', 'Raw sensor inputs are first Min-Max normalized into a [0.0, 1.0] interval, then transformed via Scikit-Learn StandardScaler (z = (x - μ) / σ) to standardize feature variance across different physical units.'),
    ('Step 3: Machine Learning Classifier Selection & Training', 'Trained a 200-tree Random Forest Classifier on historical industrial machine telemetry datasets to classify machine state into 4 diagnostic classes (Normal, Warning, Worst Condition, Critical) with confidence probability scoring.'),
    ('Step 4: Asynchronous Backend API & In-Memory Preloading', 'Built an ASGI microservice using FastAPI. Utilized FastAPI lifespan context to load pickled ML binaries into memory on boot, delivering sub-10ms inference latencies.'),
    ('Step 5: Interactive Client Dashboard & Range Validation', 'Engineered a Next.js 15 SPA with React Hook Form and Zod schemas, enforcing real-time validation for blank/zero/out-of-range sensor inputs before dispatches.'),
    ('Step 6: Production Full-Stack Cloud Deployment', 'Deployed backend container to Render and frontend Next.js application to Vercel, enabling global accessibility with automatic CORS security rules.')
]

for title, desc in steps:
    story.append(Paragraph(f'<b>• {title}:</b> {desc}', bullet_style))

story.append(Spacer(1, 6))

# SECTION 2: WHY RANDOM FOREST WAS CHOSEN OVER ALTERNATIVES
story.append(Paragraph('2. Machine Learning Model Trade-offs & Algorithm Comparison', h1_style))
story.append(Paragraph('Below is the detailed technical comparison explaining why <b>Random Forest Classifier</b> was selected over alternative algorithms:', body_style))

ml_comp = [
    ['Algorithm', 'Pros / Suitability', 'Cons / Limitations', 'Verdict for Scrutor'],
    ['Random Forest\n(Selected)', 'Handles non-linear sensor feature interactions; immune to overfitting via bagging; fast inference; outputs probability scores.', 'Slightly higher memory footprint than single tree.', 'SELECTED: Best accuracy & explainability for tabular telemetry.'],
    ['Single Decision Tree', 'Extremely fast execution and simple rule paths.', 'High variance; prone to severe overfitting on noisy sensor data.', 'REJECTED: Low generalization on noisy industrial telemetry.'],
    ['Logistic Regression', 'Mathematically simple and highly interpretable.', 'Assumes linear decision boundaries; fails on complex non-linear machinery interactions.', 'REJECTED: Cannot capture multi-parameter thermal/vibration failure curves.'],
    ['Support Vector Machine (SVM)', 'Effective in high-dimensional feature spaces.', 'Slow training and inference; probability calibration requires expensive Platt scaling.', 'REJECTED: Harder to extract real-time confidence scores.'],
    ['Deep Neural Network (MLP)', 'Can model highly complex non-linear functions.', 'Requires huge training datasets; acts as a black box; prone to overfitting small tabular sets.', 'REJECTED: Overkill for 7 tabular features; lacks quick explainability.']
]

t_ml = Table(ml_comp, colWidths=[95, 145, 145, 135])
t_ml.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 8),
    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ('FONTSIZE', (0,1), (-1,-1), 7.5),
    ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#ECFDF5')),
]))
story.append(t_ml)
story.append(Spacer(1, 6))

# SECTION 3: WHY FASTAPI WAS CHOSEN FOR BACKEND
story.append(Paragraph('3. Backend Architecture: Why FastAPI Was Selected', h1_style))

be_comp = [
    ['Framework', 'Architecture Type', 'Execution Performance', 'Why Chosen / Rejected'],
    ['FastAPI\n(Selected)', 'ASGI (Asynchronous)', 'Ultra-high throughput (~20,000 req/sec via Uvicorn)', 'SELECTED: Native async, Pydantic type safety, automatic Swagger docs, instant lifespan model preloading.'],
    ['Flask', 'WSGI (Synchronous)', 'Moderate throughput; blocking sync execution', 'REJECTED: Requires add-on libraries for async & Pydantic; slower under concurrent load.'],
    ['Django', 'WSGI Monolith', 'Heavy memory footprint due to ORM & admin overhead', 'REJECTED: Over-engineered for microservice ML inference endpoints.']
]

t_be = Table(be_comp, colWidths=[85, 105, 140, 190])
t_be.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 8),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ('FONTSIZE', (0,1), (-1,-1), 7.5),
    ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#ECFDF5')),
]))
story.append(t_be)
story.append(Spacer(1, 6))

# SECTION 4: WHY NEXT.JS 15 & TAILWIND WAS CHOSEN FOR FRONTEND
story.append(Paragraph('4. Frontend Architecture: Why Next.js 15 & Tailwind CSS Were Selected', h1_style))

fe_comp = [
    ['Technology', 'Selected Technology', 'Alternative Considered', 'Why Selected Over Alternative'],
    ['Framework', 'Next.js 15 (App Router)', 'Vite / Create React App', 'Next.js provides production build optimizations, file-based routing, and built-in environment variable management.'],
    ['Styling', 'Tailwind CSS v4', 'Vanilla CSS / Bootstrap', 'Tailwind utility-first architecture allows rapid dark-mode UI design, border glow keyframes, and responsive layouts with zero CSS bundle overhead.'],
    ['Form Engine', 'React Hook Form + Zod', 'Manual State (`useState`)', 'React Hook Form prevents re-rendering the entire form on every keystroke. Zod provides schema-level type safety for validation rules.']
]

t_fe = Table(fe_comp, colWidths=[85, 115, 115, 205])
t_fe.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 8),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ('FONTSIZE', (0,1), (-1,-1), 7.5),
]))
story.append(t_fe)
story.append(Spacer(1, 6))

# SECTION 5: EXACT TELEMETRY VALUES FOR 4 STATES
story.append(Paragraph('5. Reference Telemetry Values for 4 Diagnostic Conditions', h1_style))

values_table = [
    ['Telemetry Parameter', 'Valid Range', 'Normal State', 'Warning State', 'Worst Condition', 'Critical State'],
    ['Voltage (V)', '180 - 260 V', '220.0 V', '251.1 V', '232.0 V', '191.6 V'],
    ['Current (A)', '0.1 - 30 A', '6.7 A', '11.1 A', '7.7 A', '6.1 A'],
    ['Motor Speed (RPM)', '10 - 3000 RPM', '1500 RPM', '1311 RPM', '1401 RPM', '1114 RPM'],
    ['Motor Temp (°C)', '1 - 120 °C', '32.2 °C', '106.1 °C', '29.9 °C', '97.7 °C'],
    ['Vibration (g)', '0.01 - 5 g', '0.20 g', '4.00 g', '0.80 g', '0.50 g'],
    ['Ambient Temp (°C)', '-10 - 60 °C', '25.0 °C', '39.0 °C', '-1.7 °C', '48.2 °C'],
    ['Humidity (%)', '1 - 100 %', '35.0 %', '10.8 %', '65.3 %', '10.4 %'],
    ['Confidence Rating', '0 - 100%', '100.0%', '93.0%', '98.5%', '99.5%']
]

t_val = Table(values_table, colWidths=[105, 75, 75, 75, 95, 95])
t_val.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 7.5),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ('FONTSIZE', (0,1), (-1,-1), 7.5),
    ('BACKGROUND', (2,1), (2,-1), colors.HexColor('#ECFDF5')),
    ('BACKGROUND', (3,1), (3,-1), colors.HexColor('#FEF3C7')),
    ('BACKGROUND', (4,1), (4,-1), colors.HexColor('#FFEDD5')),
    ('BACKGROUND', (5,1), (5,-1), colors.HexColor('#FEE2E2')),
]))
story.append(t_val)
story.append(Spacer(1, 6))

# SECTION 6: PHYSICAL ENGINEERING EXPLANATIONS
story.append(Paragraph('6. Physics & Engineering Explanations of Diagnostic States', h1_style))
story.append(Paragraph('<b>1. Normal State (Class 0):</b> Core temperature (32.2°C) and vibration (0.20g) are low, indicating minimal mechanical friction. Current draw (6.7A) confirms baseline electrical power consumption.', body_style))
story.append(Paragraph('<b>2. Warning State (Class 1):</b> High vibration (4.00g) combined with elevated motor temperature (106.1°C) indicates early bearing wear or shaft misalignment. Maintenance required.', body_style))
story.append(Paragraph('<b>3. Worst Condition State (Class 2):</b> Sub-zero ambient temperature (-1.7°C) and high humidity (65.3%) thicken gearbox lubricant, causing viscous friction and motor speed reduction (1401 RPM).', body_style))
story.append(Paragraph('<b>4. Critical State (Class 3):</b> Low supply voltage (191.6V) reduces torque, causing rotation speed collapse (1114 RPM) while high ambient heat (48.2°C) causes severe thermal overload. Demands emergency shutdown.', body_style))

doc.build(story)

# Copy to Desktop and Docs
import shutil
shutil.copy(pdf_path, desktop_pdf_path)
shutil.copy(pdf_path, docs_pdf_path)

print('Generated PDF successfully at:', pdf_path)
