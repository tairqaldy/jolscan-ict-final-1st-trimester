# ICT1103 course digest: syllabus and modules 1–5 (weeks 1–5)

Purpose: a reference for grounding the Assignment #2 group project (computer vision web app plus ML experiment) in what ICT1103 actually teaches. Everything below is taken from the course files in `trimester-1/ict/materials/01-general` to `06-module-5`. Where the course does not cover something, this file says so instead of filling the gap.

Citation format: `(Deck p.N)`. "p." means the PDF page, which for these decks is also the slide number. Deck short names are listed at the start of section 2.

---

## 0. Source inventory and reading notes

| Short name | File | Pages | How it was read |
|---|---|---|---|
| Syl | 01-general/Syllabus.pdf | 17 | full text |
| Lec1-ICT | 02-module-1/Lec1 - Introduction to Machine Learning in ICT.pdf | 38 | text, plus image-only pp.2, 13, 27, 28 viewed (p.24 is a photo-only slide titled "Potential Application (museums, airports, railway stations)", not transcribed) |
| Lec2-Arch | 03-module-2/Week 2 - Lecture.pdf | 81 | full text, plus image-only p.7 viewed |
| Lec3-HCI | 04-module-3/Lec3-Part1-Human_Computer_Interaction_Presentation.pdf | 38 | full text |
| Lec3-DBSys | 04-module-3/Lec3 - Database_Systems_Complete_Course.pdf | 44 | full text |
| Lec3-SQL | 04-module-3/Lec3-SQL.pdf (DB foundations, SQL, normalisation/integrity/optimisation, ORM) | 50 | full text |
| Lec3-ModernDB | 04-module-3/Lec3-Modern-Advanced_Database_Architectures.pdf | 12 | full text |
| Lec4-DataMgmt | 05-module-4/data_analysis_and_management_presentation.pptx | 21 | full text, plus image-only p.13 viewed |
| Lec4-DMViz | 05-module-4/data_mining_and_visualisation_presentation (2).pptx | 35 | full text |
| Lec4-DMTasks | 05-module-4/Tasks-of-Data-Mining (1).pdf | 10 | full text |
| Lec4-DataMatrix | 05-module-4/Decoding_the_Data_Matrix (1).pdf | 15 | image-only deck (no text layer), all 15 pages viewed visually |
| Lec4-VizICT | 05-module-4/Data_Visualization_as_an_ICT_Tool.pptx | 21 | full text |
| Lec4-VizBasics | 05-module-4/Data-visualisation-as-an-ICT-tool (1).pdf | 10 | full text |
| Lec4-DTBig | 05-module-4/Decision_Trees_Large_Data.pptx | 20 | full text |
| Lec4-DTDemyst | 05-module-4/Demystifying_the_Decision_Tree (1).pdf | 16 | image-only deck, all 16 pages viewed visually |
| Lec4-Gini1 | 05-module-4/Gini_Impurity_Lecture_Notes (1).docx | 3 | full text |
| Lec4-Gini3 | 05-module-4/Gini_Impurity_Lecture_Notes (3).docx | 2 | full text |
| Lec5-Net | 06-module-5/ICT-Lec5-Networks and telecommunications.pdf | 39 | full text, plus diagram p.28 viewed |
| Lec5-Inet | 06-module-5/ICT-Lec5-Internet technologies_ from URI to email.pdf | 39 | full text, plus diagram p.31 viewed |
| Lec5-Sec | 06-module-5/ICT-Lec5-Cybersecurity_ Threats, Malware, Defences and Standards.pdf | 43 | full text, plus diagrams pp.5, 22, 24 viewed |
| Lec5-KZ | 06-module-5/ICT-Lec5-Cybersecurity in Kazakhstan_ law, digital signature and encryption.pdf | 15 | full text |

**File-format and duplicate findings (module 4):**
- Every `.pptx` and `.docx` file in `05-module-4` is actually a PDF (`%PDF-1.4` header) with an Office extension. PowerPoint or Word will not open them. Rename them to `.pdf` to view them.
- None of the module 4 files is a byte-identical duplicate. The pairs that look like format duplicates have different content:
  - `Data_Visualization_as_an_ICT_Tool.pptx` (21 pp., advanced: DIKW, dashboards, XAI, accessibility) vs `Data-visualisation-as-an-ICT-tool (1).pdf` (10 pp., beginner: which chart for which question). They are separate decks.
  - `Decision_Trees_Large_Data.pptx` (scaling: histograms, LightGBM, XGBoost) vs `Demystifying_the_Decision_Tree (1).pdf` (intuition: entropy, information gain, Gini). They are separate decks.
  - `Gini_Impurity_Lecture_Notes (1).docx` vs `(3).docx` are two versions of the same notes. Both use the same golf example. (1) adds reference links. (3) adds the Gini vs Entropy table and a scikit-learn snippet. Both are digested together below.
  - `Tasks-of-Data-Mining (1).pdf` overlaps with Module 02 of `data_mining_and_visualisation_presentation`, and `Decoding_the_Data_Matrix` overlaps with both. All three are digested because each has unique items.
- Two decks have no text layer (Lec4-DataMatrix, Lec4-DTDemyst). They were read page by page as images. All pages were legible, and nothing is unreadable.

---

## 1. Syllabus facts

**Course.** Information and Communication Technologies, **ICT 1103**. QAIRU, academic year 2026–2027, year 1, trimester 1. Teaching period 07.09.2026–14.11.2026 (10 weeks). 5 ECTS = 150 h: lectures 30, practicals 20, SIWT 10, SIW 90. Final control: written exam with MCQ and open questions. Programmes 6B06101 AI & ML and 6B06102 Physical AI. Lecturers: Alfarabi Imashev (PhD, Assoc. Prof.) and Aldabergen Aimoldir Bolatkyzy (Senior Lecturer). (Syl p.1)

**Course framing.** "every topic is presented through the lens of working with data: each week answers the question of where and how data analysis and machine learning methods are applied in that layer of digital infrastructure" (Syl p.2). This gives a framing for the defence: each architectural layer of our app should be tied to a data or ML role.

**Learning outcomes (CLO)** (Syl pp.2–3):
- **CLO 1.** Explains ICT purpose and trends and the architecture of computer systems and networks, "justifying the choice of technology for a specific applied task". Assessed on terminological accuracy and the strength of the justification.
- **CLO 2.** Full data cycle: collection, cleaning, transformation, analysis and visualisation. Assessed on reproducibility and correctness of interpretation.
- **CLO 3.** Justifies information-protection tools, assesses threats, and applies "the requirements of the legislation of the Republic of Kazakhstan on personal data and artificial intelligence to a case study". Assessed on completeness of the threat analysis and legal correctness.
- **CLO 4.** Uses mobile and cloud services and network hardware/software. Assessed on "the justification of the service selected and compliance with data security requirements".
- **CLO 5.** Applies basic ML (classification and clustering) to a prepared dataset. Assessed on "the correctness of the method chosen and the justification of the quality metric".
- **CLO 6.** "develops a prototype of a digital service, documents the process and defends the solution with reasoned argument". Assessed on "the working state of the prototype, completeness of documentation and quality of the defence".
- **CLO 7.** Evaluates generative AI tools, including their limitations, errors and ethical and legal risks. Assessed on "the rigour of the verification procedure and the strength of the conclusion".

**Weekly topics** (Syl p.13; detailed plan pp.15–16):
1. Role of ICT in ML and data analysis; ICT standards; SDGs; prospects. Activity: map five economic sectors to model use cases.
2. Computer systems: architecture, data representation, software, OS (including mobile). Activity: "estimating the time and cost of training a model on a CPU compared with a GPU from published benchmarks".
3. HCI (UI, usability, interface types); DB systems (concepts, architecture, data models, normalisation, integrity, query optimisation, SQL, ORM). Activity: "Defining usability requirements for a web interface; designing a normalised structure for an open dataset; creating tables in MySQL through phpMyAdmin; four SELECT queries including aggregation with GROUP BY and a JOIN".
4. Data analysis and management; collection, classification, forecasting; decision trees; large data; data-mining methods, stages and tasks; data visualisation. Activity: spreadsheet charts, cleaning a corrupted dataset "with a log of every decision", distribution and comparison charts, "three findings each supported by a specific figure".
5. Networks (TCP/IP, OSI, IP addressing, DHCP, wired/wireless); Internet (URI, DNS, HTTP, web, email); cybersecurity (threats, malware, protection, standards, RK law, digital signature, encryption). Activity includes "deciding for three datasets whether they may be uploaded to an external AI service under the Digital Code of the RK". Midterm Control 1.
6. Supervised and unsupervised ML. Metrics: accuracy, precision, recall, F1; decision tree; GridSearchCV; K-Means, PCA.
7. Text/NLP: tokenisation, TF-IDF, sentiment, Whisper.
8. **Basic computer vision and multimedia**: "Working with image datasets, image processing and feature extraction combined with machine learning; testing the pretrained models MobileNet, VGG16, VGG19 and ResNet; introduction to the Vision Transformer"; audit of two generative models (AI-4).
9. Cloud ML platforms, MLOps, smart tech (IoT, big data, blockchain, AI). Activity: "creating a web interface for a machine learning model using the Streamlit or Gradio framework; cloud storage, shared access and version history" (AI-3).
10. Containerisation and reproducibility ("Writing a simple Dockerfile to containerise the developed application"); digital business, learning and government; tracing an egov.kz service. "Defence of the group project". Midterm Control 2 closes 09–14.11. AI-0 for quiz and defence.

**Grading** (Syl p.6): AR = (MC1 + MC2)/2. FG = 0.30·MC1 + 0.30·MC2 + 0.40·Exam. Admission requires AR ≥ 50, and passing requires FG ≥ 50. Each midterm is out of 100: lab work 30, assignment 30, quiz 40.
- **MC2 Assignment (30 pts)** = "Group project in teams of up to six, submitted through the LMS and defended in class in week 10. CLO 5, CLO 6, CLO 7" (Syl p.6).
- Letter scale: A 95–100 … D 50–54, FX 25–49, F 0–24 (Syl p.17).

**What the syllabus says about the group project and defence:**
- "Students develop a prototype of a digital service in teams of up to six people … each team keeps a contribution log recording who did what, and at the defence every member is asked an individual question about their own part. A student who cannot explain their own part does not receive the team mark." (Syl p.5)
- The individually verifiable components are the oral defences, where "every team member answers an individual question about their own part" (Syl p.6, item 8.5).
- The CLO 6 criteria are the grading criteria for the prototype: working state, completeness of documentation, quality of defence (Syl p.3). CLO 5 adds "correctness of the method chosen and the justification of the quality metric".
- AI levels: the group project row maps to AI-2/AI-3 (CLO 5) and AI-3/AI-0 (CLO 6, defence) (Syl p.4). **AI-3** = "AI may generate substantial elements. Problem framing, critical verification, integration, sources, individual contribution and the defence are assessed. **A prompt log is mandatory.**" Any substantive AI use must be declared with tool and version, purpose, key prompts, what was produced or changed, and how it was verified (Syl p.9).
- **The syllabus has no separate Assignment #2 rubric or presentation-criteria table.** The only criteria are the CLO assessment phrases above and the AI policy.

**Data and infrastructure rules relevant to the project** (Syl pp.9, 11):
- Data security: "Personal, medical, biometric, financial or confidential data must never be uploaded to external AI services or public repositories, in accordance with item 12.8 of the Assessment Rules, the Digital Code of the RK of 09.01.2026 No. 255-VIII and the Law of the RK of 17.11.2025 No. 230-VIII on Artificial Intelligence."
- Alternatives: "a local model via Ollama, access to the university AI service on request, or a tool-free version".
- Datasets: "Only open, licence-clean sources: data.egov.kz, stat.gov.kz, Kaggle Datasets, UCI Machine Learning Repository, OpenML."
- Software: Python 3.11+, NumPy, pandas, Matplotlib, scikit-learn; MySQL with phpMyAdmin; Colab. Further reading lists Streamlit and Docker docs.
- "No assignment requires a paid service, a powerful laptop or a GPU." (Syl p.11)
- Normative literature: Digital Code RK No. 255-VIII (09.01.2026); Law on AI No. 230-VIII (17.11.2025); standard curriculum (MES Order No. 603) (Syl p.11).

---

## 2. Lecture decks: concepts taught

### 2.1 Lec1-ICT: Introduction to ICT in Machine Learning and Data Analysis (38 pp.)
- **ICT as foundation of ML**: ICT provides the hardware, software, networks and cloud needed to process massive data. Without it, training complex models is impossible (Lec1-ICT p.3).
- **Evolution of ICT**: traditional ICT (2D displays, local servers, manual desks) → next-gen spatial ICT (3D spatial environments, 5G/6G edge networks, AI-driven synthetics) (Lec1-ICT p.2).
- **High-Performance Computing (HPC)**: GPUs and TPUs process complex algorithms quickly, enable deep networks, and cut training time "from weeks to hours or minutes" (Lec1-ICT p.5).
- **Cloud computing platforms** (AWS, Google Cloud, Azure): rent processing on demand, pre-built ML services, managed databases, pay-as-you-go, no on-prem infrastructure needed (Lec1-ICT p.6).
- **Data transmission networks**: 5G for real-time, low-latency transfer, streaming analytics and distributed ML (Lec1-ICT p.7).
- **Data storage solutions**: scalable data lakes for structured and unstructured data; relational and NoSQL; long-term archival for retraining and compliance (Lec1-ICT p.8).
- **Why standards matter**: interoperability (prevents vendor lock-in), security and ethics, trust and reliability (Lec1-ICT p.10).
- **Key standards**: **ISO/IEC JTC 1/SC 42** (AI committee: trustworthiness, bias, lifecycle); **IEEE** (data ethics, governance, cloud interoperability); **W3C** (web data accessible, structured, readable) (Lec1-ICT p.11).
- **SDGs**: 17 Global Goals (Lec1-ICT p.13); green data centres (Lec1-ICT p.15); SDG 9 industry and infrastructure (Lec1-ICT p.16); SDG 13 climate action (satellite-imagery ML for deforestation, disaster prediction, smart grids) (Lec1-ICT p.17); smart cities (Lec1-ICT p.18); Green ICT (zero-carbon DCs, energy-aware software) (Lec1-ICT p.21).
- **Edge computing**: traditional cloud sends data to distant servers and so has higher latency, while edge processes data on local devices "for instant response" (Lec1-ICT p.19). XR shifts rendering to edge servers (Lec1-ICT p.25).
- **Quantum and AI-driven networks**: self-optimising networks reroute traffic and balance load (Lec1-ICT p.20).
- **Extended Reality**: VR (fully immersive), AR (digital layered on real), MR (interacting blend) (Lec1-ICT p.23).
- **Next-gen HCI**: eye-tracking, hand-gesture recognition, voice commands (Lec1-ICT p.26). Examples include eye-tracking capture (Tobii) and sign-language recognition with bounding boxes plus an avatar (Lec1-ICT pp.27–28).
- **XR adoption challenges**: hardware limits, lack of standards, **security and privacy** ("constantly scanning rooms, faces, and iris biometric patterns … a severe legal and ethical hurdle") (Lec1-ICT p.32).
- **Sensors**: detection → conversion → communication (Lec1-ICT p.35). Types include **optical and imaging (CMOS camera sensors)**, used for facial-recognition security (Lec1-ICT p.37). Edge sensors filter noise locally before sending to the cloud (Lec1-ICT p.36).
- **Sensor-network challenges**: power (LPWAN, LoRaWAN, NB-IoT), data security and privacy from node to cloud, interoperability (MQTT, CoAP) (Lec1-ICT p.38).

### 2.2 Lec2-Arch: Data representation, hardware, CPU/GPU/TPU, architecture, OS, software (81 pp.)
- **Data / data representation**: symbols representing people, events, things and ideas; representation = form in which data is stored, processed, transmitted (Lec2-Arch p.2).
- **Bit, byte, units**: KB = 2¹⁰ B … EB = 2⁶⁰ B (Lec2-Arch p.4). Binary number system (Lec2-Arch p.5).
- **Character encodings**: ASCII (128 chars, 7-bit, per p.7; p.8 describes "8-bit" patterns), Unicode (all languages, variable bit), EBCDIC (IBM, 8-bit) (Lec2-Arch pp.7–9).
- **Digital image** = "a list of color numbers for every dot (pixel)". **Sound** = sampled amplitude values (Lec2-Arch p.10). "Multimedia is just numbers" (Lec2-Arch p.11).
- **Hardware**: physical components. File-display flow: processor ↔ chipset ↔ storage ↔ RAM ↔ monitor (Lec2-Arch pp.12–13).
- **Fetch–execute cycle** (fetch, interpret, execute, store); microprocessor performance: clock speed (GHz), FSB, word size (32/64-bit), processor numbers (Lec2-Arch pp.14–15).
- **Cache** (L1 on-chip, L2), **CISC vs RISC** (Lec2-Arch p.16, p.35).
- **RAM types**: SDRAM, DDR, RDRAM, SRAM (cache), DRAM (refresh). **ROM/EEPROM**; RAM volatile vs ROM non-volatile (Lec2-Arch pp.17–18).
- **Buses, expansion slots, ports** (PCI, AGP, USB, HDMI…); input devices (Lec2-Arch pp.19–20).
- **CPU**: control unit, ALU, cache; fetch → decode → execute → writeback; GHz and IPC (Lec2-Arch pp.22–23).
- **GPU**: specialised chip for images, video and maths; integrated vs discrete; hundreds of cores and thousands of ALUs for massive parallel computation (Lec2-Arch pp.24–25).
- **CPU vs GPU, 11 comparisons**: function (general vs specialised); focus (**CPU low latency, GPU high throughput**); cores (2–18 powerful, serial vs thousands of weaker, parallel); memory (CPU up to 64 GB expandable vs GPU ~12 GB non-expandable); **Moore's Law nearing its end vs Huang's Law** (GPU performance doubles every two years); APIs (GPU limited to **CUDA/OpenCL**, CUDA Nvidia-proprietary lock-in); context switching; caching (Lec2-Arch pp.26–29). Takeaway: GPU = "the engine of graphics and AI" (Lec2-Arch p.30).
- **TPU**: Google AI accelerator for tensor and matrix operations, better performance per watt than GPUs for AI, cloud-integrated (Lec2-Arch p.31).
- **CPU vs GPU vs TPU table**: cost (affordable / moderate / expensive, often cloud-based), ecosystem (universal / CUDA, OpenCL / TensorFlow, GCP), best use (OS, apps, databases / graphics, simulations / deep learning) (Lec2-Arch p.32).
- **Computer architecture**: end-to-end structure determining how components interact (Lec2-Arch p.34). Components: CPU, memory, peripherals over the **system bus** (address, data, control) (Lec2-Arch p.36). Input and output units (Lec2-Arch p.37).
- **Memory hierarchy**: primary (RAM volatile, ROM) vs secondary (HDD/SSD, persistent, not directly CPU-accessible) (Lec2-Arch p.38).
- **CPU internals**: registers, ALU, control unit (Lec2-Arch p.39). **Bootloader, POST, OS** (Lec2-Arch p.40). **Interrupts**, bus width (Lec2-Arch p.41).
- **ISA vs microarchitecture** (Lec2-Arch p.42).
- **Client-server systems**: "A distributed architecture separating user-facing terminals (clients) from powerful host resources (servers). The server presents a transparent interface, masking underlying hardware complexities from the querying client." (Lec2-Arch p.43)
- **SIMD** (single instruction, multiple data) and **multicore** (Lec2-Arch p.43).
- **Von Neumann (shared memory, Von Neumann bottleneck) vs Harvard architecture** (Lec2-Arch p.44).
- **Operating system**: intermediary layer between hardware and applications. Objectives: convenience and efficiency (Lec2-Arch p.47). Functions: processor, memory, I/O, process and file management (permissions / access control matrices) (Lec2-Arch pp.48–49). **User mode (Ring 3) vs kernel mode (Ring 0)**. UI provisioning: CLI, GUI (WIMP), natural/touch (Lec2-Arch p.50).
- **OS eras**: serial, simple batch, multiprogrammed batch, time-sharing, distributed (Lec2-Arch pp.51–56). **Parallel (tightly coupled) vs distributed (loosely coupled)** (Lec2-Arch p.56).
- **NOS vs distributed OS**; **RTOS hard vs soft** (Lec2-Arch pp.58–60).
- **Mobile OS**: battery-first, notification servers (APNs, FCM); Android stack (Linux kernel, HAL, ART/AOT); iOS (Darwin/BSD, **sandboxing**: apps cannot read other apps' files without user consent) (Lec2-Arch pp.61–64).
- **Software**: instructions, data structures and documentation; the software stack communicates through **APIs** (Lec2-Arch p.68). System vs application vs programming software (Lec2-Arch p.69). OS layer, utilities, drivers/firmware (Lec2-Arch pp.71–73).
- **Application software**: general-purpose/COTS, vertical-market, **bespoke/custom** (high lifecycle cost, depends on documentation) (Lec2-Arch pp.75–77).
- **Dev tools**: compilers, interpreters, JIT, IDE, linkers/loaders (Lec2-Arch p.79).
- **Middleware** ("software plumbing"): ESB, **RPC**, **API management gateways** (rate-limiting, security token checking, payload transformation for cloud microservices) (Lec2-Arch p.80).

### 2.3 Lec3-HCI: Human-Computer Interaction and Interface Design (38 pp.)
- **AI and HCI**: integrating AI into interfaces, applying HCI to AI systems (conversational AI), designing for AI-powered technologies through user-centred design (Lec3-HCI p.2).
- **Four HCI components**: User, Interface, Goal-Oriented Task, Context (Lec3-HCI p.3).
- **HCI definition**: multidisciplinary field on the design, evaluation and implementation of interactive systems for human use. It draws on CS, cognitive psychology, industrial design and ergonomics. Objectives: maximise efficiency (reduce cognitive friction), ensure safety and accessibility, elevate UX (Lec3-HCI p.4).
- **Modalities**: eye-tracking; pre-touch sensing; **Cloud Computing HCI**, "designing effective management dashboards for provisioning, monitoring, and managing cloud resources" (Lec3-HCI p.5). Pre-touch implementations (Lec3-HCI p.6).
- **Key HCI principles**: user-centred design; usability and satisfaction; efficiency and productivity; **error reduction through clear system feedback**; **information presentation and decision-making through effective data visualisation**; context awareness (Lec3-HCI p.7).
- **Socio-technical interaction loop**: human operator → interface bridge → machine system, which "pushes back operational feedback" (Lec3-HCI p.8).
- **User interface**: the means by which people interact; a semantic translator. Pillars: input layer, output layer, navigation schema (Lec3-HCI p.9).
- **Anatomy of UI architecture**: structural layouts (grids, containers, hierarchies), interactive controls (buttons, inputs, toggles, dropdowns), **feedback mechanics** ("real-time state flags, dynamic processing bars, error callouts") (Lec3-HCI p.10).
- **Mental model** vs **system image**: misalignment causes confusion and errors. Use familiar real-world metaphors such as the trash-can icon (Lec3-HCI p.11).
- **Usability engineering**: usability is "a concrete, measurable quality attribute", not looks. It tracks task success, speed and errors. ROI: productivity, lower support load, retention (Lec3-HCI p.12).
- **Nielsen's 10 Usability Heuristics** (Lec3-HCI p.13; one slide each pp.14–23; summaries pp.24–26):
  1. Visibility of system status: e.g. "A loading indicator or progress bar showing the exact percentage when uploading a heavy file", skeleton loaders, success toasts (p.14).
  2. Match between system and real world: user's language, metaphors (p.15).
  3. User control and freedom: emergency exit, Undo toast, Cancel, undo/redo (p.16).
  4. Consistency and standards: consistent placement and styling, platform conventions (p.17).
  5. Error prevention: disable Submit until valid; "Are you sure you want to delete…?"; constrained date pickers (p.18).
  6. Recognition rather than recall: recently viewed items, visible options, **rich preview snippets of files** (p.19).
  7. Flexibility and efficiency of use: accelerators, shortcuts, batch processing (p.20).
  8. Aesthetic and minimalist design: "Modern landing pages": minimal distraction, progressive disclosure, white space, high-contrast hierarchy (p.21).
  9. Help users diagnose and recover from errors: plain language, precise problem, constructive solution, highlight the precise field (p.22).
  10. Help and documentation: tooltips, searchable help, onboarding walkthroughs ("SaaS platforms & dashboards") (p.23).
- **Usability metrics**: objective (task success rate, time-to-task completion, operational error rate) and subjective (**System Usability Scale (SUS)**, 10-item Likert, score 0–100; **Net Promoter Score (NPS)**) (Lec3-HCI p.27).
- **Interface taxonomy**: CLI and GUI; touch and NUI; VUI (Lec3-HCI p.28). **CLI**: recall-based, steep learning curve, automation (Lec3-HCI p.29). **GUI / WIMP** (windows, icons, menus, pointer) (Lec3-HCI p.30). **Touch UI**: minimum **48×48 px** tap targets ("fat finger problem"); tap, swipe, pinch (Lec3-HCI p.31). **VUI**: high cognitive load, noise, privacy limits (Lec3-HCI p.32). **NUI**: gesture, VR/AR, gaze (Lec3-HCI p.33).
- **Fitts's Law**: MT = a + b·log₂(2D/W). Primary action buttons should be large and easy to reach, and context menus should appear at the pointer (Lec3-HCI p.34).
- **Hick's Law**: T = b·log₂(n+1). Mitigations are progressive disclosure and chunked step-by-step wizards (Lec3-HCI p.35).
- **Information architecture**: logical classification, clear labelling, sitemaps and user flows (any critical node reachable in minimal clicks) (Lec3-HCI p.36).
- **Accessibility (a11y) and inclusive design**: **WCAG**; screen-reader compatibility (clean HTML labels, **alt-text**); colour contrast **at least 4.5:1**; keyboard-only paths (Lec3-HCI p.37).
- **Next frontier**: BCI, proactive predictive UI, haptic materiality (Lec3-HCI p.38).
- Not in this deck: Shneiderman's rules, Gestalt principles, personas, wireframing/prototyping methods, A/B testing.

### 2.4 Lec3-DBSys: Introduction to Database Systems (44 pp.)
- **Evolution**: manual records → punch cards and tapes → software shift (Lec3-DBSys p.2). **Legacy file-based approach**: isolated silos, hardcoded schemas, fragility (Lec3-DBSys p.3).
- **File-system hazards**: data redundancy, data inconsistency, resource waste (Lec3-DBSys p.4); structural dependence, data dependence, lack of ad-hoc queries (Lec3-DBSys p.5).
- **DBMS**: centralised intermediary between applications and storage; unified repository; program–data isolation (Lec3-DBSys p.6).
- **Self-describing system**: metadata, **system catalog / data dictionary** (Lec3-DBSys p.7).
- **Shared access and concurrency**: concurrency scheduling; JDBC/ODBC standardisation (Lec3-DBSys p.8).
- **Transaction**: logical unit of work, illustrated with the bank transfer example (Lec3-DBSys p.9).
- **ACID**: **Atomicity** (all-or-nothing, rollback from logs) (p.10); **Consistency** (valid state to valid state, constraints enforced) (p.11); **Isolation** (uncommitted changes invisible, locks) (p.12); **Durability** (commits survive crashes, **Write-Ahead Logging**) (p.13) (Lec3-DBSys pp.10–13).
- **Three-schema architecture (ANSI-SPARC)**: external → conceptual → internal → disk (Lec3-DBSys p.14). **External level** = role-specific views without duplicating data (p.15). **Conceptual** = logical schema of tables, keys, constraints, hardware-agnostic (p.16). **Internal** = physical layout, pages, **encryption algorithms**, compression, B-tree indexes (p.17).
- **Data independence**: logical (conceptual changes do not break views) and physical (storage changes need no logical change) (Lec3-DBSys pp.18–19).
- **Data model**: object-based (ER diagrams), record-based (relational tables), physical (Lec3-DBSys p.20).
- **Relational model**: Codd 1970; relations/tables; set theory and predicate logic; tuples = rows, attributes = columns, atomic fields (Lec3-DBSys p.21).
- **Hierarchical and network models** (legacy) (Lec3-DBSys p.22).
- **Shift to NoSQL**: SQL scales vertically. Big unstructured data (stream media, JSON events, logs) drove schema-free systems that scale horizontally (Lec3-DBSys p.23).
- **NoSQL types**: **key-value** (sub-ms, opaque value; carts, session caches, config) (p.24); **document** (JSON/BSON, nested, asymmetric fields; CMS, catalogues, user profiles) (p.25); **column-family** (column-grouped storage; IoT telemetry, logging, analytics warehouses) (p.26); **graph** (nodes and edges, no joins; social graphs, recommendation, fraud) (p.27) (Lec3-DBSys pp.24–27).
- **SQL vs NoSQL summary**: SQL = strict schemas, ACID, vertical scaling. NoSQL = dynamic schemas, horizontal availability (**BASE**), scale out. The choice is "Driven entirely by data structure predictability, concurrency limits, and scaling requirements" (Lec3-DBSys p.28).
- **Integrity**: **domain** (types, NOT NULL, CHECK such as Age ≥ 18) (p.29); **entity** (every table has a primary key that is unique and non-null) (p.30); **referential** (foreign key must match an existing PK, no orphan rows) (p.31) (Lec3-DBSys pp.29–31).
- **Referential actions**: ON DELETE RESTRICT / CASCADE / SET NULL (Lec3-DBSys p.32).
- **Normalisation**: reduces redundancy and eradicates anomalies (Lec3-DBSys p.33). **Insertion, update and deletion anomalies** (Lec3-DBSys p.34).
- **1NF** atomic values, no multi-value arrays (p.35); **2NF** 1NF plus no partial dependency on part of a composite key (p.36); **3NF** 2NF plus no transitive dependencies: "depend … on the primary key, the whole primary key, and nothing but the key" (p.37) (Lec3-DBSys pp.35–37).
- **SQL**: standardised declarative language; sublanguages **DDL** (CREATE, ALTER, DROP), **DML** (INSERT, UPDATE, DELETE), **DQL** (SELECT … FROM … WHERE) (Lec3-DBSys pp.38–41).
- **Query processing pipeline**: string → parser → logical optimiser → execution plan → disk → app (Lec3-DBSys p.42). **Query optimiser**: cost model with statistics; full scan vs index (Lec3-DBSys p.43).
- **B-tree index**: sorted helper structure, like a book index. It speeds up lookups at a small cost to INSERT speed (Lec3-DBSys p.44).

### 2.5 Lec3-SQL: Database foundations, SQL fundamentals, normalisation and integrity, ORM (50 pp.)
- **Why databases**: persistent memory, shared access, reliable answers (Lec3-SQL p.2). **Data vs database vs DBMS** (Lec3-SQL p.3).
- **Goals**: correct facts, fast questions, concurrent users, recovery, **controlled access** ("Show each user only what they should see") (Lec3-SQL p.4). DBMS provides define, query, coordinate, protect/operate (Lec3-SQL p.5).
- **Data lifecycle**: model → define → validate → query → evolve (Lec3-SQL p.6). Characteristics: persistent and shared, concurrent but isolated, recoverable, **secure by default**, measurable under load (Lec3-SQL p.7).
- **Roles**: developers, DBAs, analysts, end users (Lec3-SQL p.8).
- **Mini case (course platform)**: Student, Course, Enrollment, Grade, used to answer "who is at risk?" (Lec3-SQL p.9). "The schema makes meaning enforceable" (CREATE TABLE with PRIMARY KEY, NOT NULL) (Lec3-SQL p.10).
- **SQL is declarative**: describe the result and the DBMS chooses the route (Lec3-SQL p.12). SELECT/FROM/WHERE/ORDER BY roles (Lec3-SQL p.13).
- **Predicates**: AND/OR/NOT, **IS NULL** not = NULL, BETWEEN inclusive, LIKE (Lec3-SQL p.14).
- **Aggregation**: GROUP BY, COUNT/AVG; "HAVING filters after aggregation; WHERE filters before it" (Lec3-SQL p.15).
- **Joins**: "Join on keys, not on hope" (Lec3-SQL p.16). **CTE** (WITH) for readability (Lec3-SQL p.17).
- **Mutation**: INSERT, UPDATE, DELETE. Run a SELECT with the same predicate first (Lec3-SQL p.18).
- **Transactions**: BEGIN … COMMIT / roll back; keep transactions small (Lec3-SQL p.19).
- **Safe SQL habits**: explicit columns, **parameterise values** ("Keep user input separate from SQL structure"), test NULL and join cardinality, **EXPLAIN** (Lec3-SQL p.20).
- **Normalisation**: "keeps one fact in one place" (Lec3-SQL p.22). Overloaded table → Student / Course / Enrollment (Lec3-SQL p.23). 1NF rules: one value per cell, no repeating groups, an identifying key (Lec3-SQL p.24).
- **Constraints as guardrails**: PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, NOT NULL (Lec3-SQL p.25). **Layered integrity**: "Validation can improve the user experience, but the database must remain the final guardrail" (Lec3-SQL p.26). Example: enrollment table with CHECK grade 0–100, compound PK, FK (Lec3-SQL p.27).
- **Optimisation as an evidence loop**: define → measure → inspect → change one lever → re-measure (Lec3-SQL p.28). Indexes change access paths (composite order, covering indexes; storage and write cost) (Lec3-SQL p.29). Watch for **N+1 queries** (Lec3-SQL p.30).
- **ORM**: bridges objects and rows (Lec3-SQL pp.31–32). Invented to reduce repeated translation work (p.33). Persistence, mapping, relationships, productivity (`session.add(user)` vs INSERT) (p.34). One class → one table (SQLAlchemy-style `class User(Base)`) (p.35). Lifecycle: object → mapping → SQL → object (p.36). CRUD, relationships, **migrations** (p.37). Benefits: shared vocabulary, safer refactors (p.38). "a layer of convenience, not a database replacement": inspect generated SQL (p.39). Parameterised queries "can reduce common injection risks when used correctly" (p.45). Hidden cost and **lazy loading** (p.47). Relationship types 1:1, 1:many, many:many via join table; transaction boundary (p.48). **ORM vs SQL vs hybrid**: ORM for CRUD and shared models, SQL for complex reporting and tuned queries, hybrid "for practical systems" (p.49). "Start with the model. Keep an eye on the SQL." (p.40, p.50) (Lec3-SQL pp.31–50).

### 2.6 Lec3-ModernDB: Modern and Advanced Database Architectures (12 pp.)
- **Three data archetypes**: structured; semi-structured (JSON, XML); **unstructured** ("80%+ of modern enterprise data (e.g., text, video, audio, satellite images, sensor streams)") (Lec3-ModernDB p.2).
- **Core NoSQL**: document, key-value (caching, session state), wide-column (Lec3-ModernDB p.3).
- **Specialised engines**: graph; **time-series** (IoT telemetry, system metrics); **NewSQL** ("horizontal NoSQL scalability … while strictly enforcing ACID guarantees") (Lec3-ModernDB p.4).
- **Vector databases**: index and search high-dimensional **embeddings** with spatial distance (e.g. **cosine similarity**), used for generative AI, LLMs and semantic search. **Knowledge graphs** for RAG (Lec3-ModernDB p.5).
- **Selection guide**: AI embeddings → vector DB; networks → graph; IoT/metrics → time-series; **dynamic schemas and web apps → document DB** (Lec3-ModernDB p.6).
- **Data landscape for ML**: structured → SQL/NewSQL (tabular features, **metadata storage**); semi-structured → NoSQL; **unstructured (raw files, images, audio, video) → vector / object stores** (tokenisation and embedding generation) (Lec3-ModernDB p.8).
- **Engines**: **Milvus** (open-source, cloud-native, storage and compute separated), **Pinecone** (managed cloud vector DB), **Neo4j** (native property graph) (Lec3-ModernDB p.9).
- **Standard RAG vs GraphRAG** (Lec3-ModernDB pp.10–11).
- **Deployment**: **Docker / Docker Compose** for local and dev (volumes, env keys, ports); **Kubernetes** for production (autoscaling, HA, Helm, persistent volumes, GPU node pools) (Lec3-ModernDB p.12).
- Not taught in modules 1–5: CAP theorem, sharding/replication mechanics, cloud managed SQL services by name.

### 2.7 Lec4-DataMgmt: Data Analysis and Data Management (21 pp.)
- **Data management**: collecting, keeping and using data securely, efficiently and cost-effectively. Pillars: **data governance** (ownership, accountability), **data architecture**, **data quality** (accuracy, completeness, reliability) (Lec4-DataMgmt p.4).
- **Data analysis**: cleaning, transforming and modelling data to discover insights. Types: **descriptive, diagnostic, predictive, prescriptive** (Lec4-DataMgmt p.5).
- **Primary collection**: first-hand (surveys, web forms, sensor logging; interviews, focus groups) (Lec4-DataMgmt p.7). **Secondary**: pre-existing (public DBs, government records; web scraping, **APIs**, RSS); risks include outdated or unverified quality (Lec4-DataMgmt p.8).
- **Collection challenges**: privacy regulations (**GDPR, CCPA**), **selection bias**, system fragmentation, data loss (Lec4-DataMgmt p.9).
- **Structured / semi-structured / unstructured** (~80% unstructured); **ETL (Extract, Transform, Load)** pipelines needed (Lec4-DataMgmt p.11).
- **Taxonomy and metadata**: metadata = "data about data". **Structural** (schema, layout, ordering), **administrative** (dates, permissions/**ACL**, rights, checksums), **descriptive** (keywords; includes "the EXIF data of a photo containing artist names, song titles, geolocations, or camera settings") (Lec4-DataMgmt p.12). A worked JSON example for an image asset (`descriptive_metadata`, `administrative_metadata` with `access_permissions`, `structural_metadata` with `color_space`, `width_pixels`/`height_pixels`, layers) and an XML example (Lec4-DataMgmt p.13).
- **Security classification**: Public, Internal-only, Confidential, **Restricted/Secret (e.g., PII, financial records)** (Lec4-DataMgmt p.14).
- **Forecasting**: quantitative vs qualitative (Delphi) (Lec4-DataMgmt p.16). Time-series components and models (moving averages, exponential smoothing, ARIMA) (Lec4-DataMgmt p.17). Causal and ML models (regression, neural nets, random forests) (Lec4-DataMgmt p.18).
- **Accuracy metrics**: **MAE, MSE** (penalises large errors), **MAPE**; "the objective is error minimization, not absolute perfection" (Lec4-DataMgmt p.19).
- **Trends**: AutoML, edge analytics, real-time streaming, **sovereign data governance** ("strict regional data localization laws") (Lec4-DataMgmt p.20).

### 2.8 Lec4-DMViz: Methods and Stages of Data Mining, and Data Visualisation as an ICT Tool (35 pp.)
- **Data mining**: discovering hidden, previously unknown, valid, actionable patterns; the core phase of **KDD** (Lec4-DMViz p.4). DBMS queries (verification-oriented) vs data mining (discovery-oriented) (Lec4-DMViz p.5). Roots: statistics, AI, ML, DB systems (Lec4-DMViz p.6).
- **Tasks**: **classification** (pre-defined classes; C4.5, Naive Bayes, SVM) (p.8); **regression** (continuous) (p.9); **clustering** (K-Means, hierarchical, DBSCAN) (p.10); **association rules** (Support, Confidence, Lift; Apriori, FP-Growth) (p.11); **anomaly detection** (Isolation Forest, one-class SVM, LOF) (p.12) (Lec4-DMViz pp.8–12).
- **CRISP-DM**: business understanding, data understanding, data preparation, modelling, evaluation, deployment (Lec4-DMViz p.14).
- **KDD process**: selection, preprocessing, transformation, data mining, evaluation/interpretation (Lec4-DMViz p.15).
- **Stage 1–2**: goal alignment, resource inventory, initial inspection, **data quality check** (missing values, conflicting formats, outliers) (Lec4-DMViz p.16).
- **Stage 3, data preparation**: cleansing (imputation, deletion), integration, **feature engineering**, reduction (PCA) (Lec4-DMViz p.17).
- **Stage 4, modelling**: model selection; **"Splitting … into distinct Training, Validation, and Testing segments"**; **hyperparameter optimisation**; iterative comparison of accuracy, time and cost (Lec4-DMViz p.18).
- **Stage 5–6**: technical vs business alignment; audit for **data leakage**; deployment "via APIs, pipeline microservices, or container systems"; **monitoring for data drift** and retraining (Lec4-DMViz p.19).
- **Decision trees and ensembles**: information gain / Gini splits; interpretability for compliance; Random Forests and gradient boosting (XGBoost) (Lec4-DMViz p.21).
- **Neural networks and deep learning**: input, hidden and output layers; strongest on "unstructured image, video, and audio datasets"; trade-off: "Demands substantial computational hardware (GPUs) and acts as a 'black box'" (Lec4-DMViz p.22).
- **Text mining and NLP** (tokenisation, TF-IDF, embeddings) (Lec4-DMViz p.23). **Graph mining** (PageRank, Louvain, GNNs) (Lec4-DMViz p.24).
- **Visualisation**: definition and cognitive value, **pre-attentive attributes** (colour, size, position) (Lec4-DMViz p.26). **Visualisation pipeline**: data ingestion → visual mapping → rendering → **user interaction** (filter, drill down, query on demand) (Lec4-DMViz p.27).
- **Chart classification**: comparison and distribution (**bar/column, line, histogram, box plot**) and composition and relationship (**scatter, bubble, stacked area, treemap**) (Lec4-DMViz p.28).
- **BI ecosystems**: dashboards, operational monitoring with anomaly alerts, strategic reporting, self-service analytics (Lec4-DMViz p.29). Tools: Tableau, Power BI, Matplotlib/Seaborn/Plotly, ggplot2, **D3.js, Chart.js**, Databricks, Kibana (Lec4-DMViz p.30).
- **Principles of effective visual design**: maximise **data-ink ratio** (no chart junk); colour discipline (accent only key outliers); typographic hierarchy; **avoid cognitive distortion** ("start baseline axes at absolute zero, and prevent 3D skew artifacts") (Lec4-DMViz p.31).
- **Ethics**: algorithmic bias, **privacy violations** (re-identification across DBs), GDPR/CCPA compliance, **Explainable AI (XAI)** (Lec4-DMViz p.33). Trends: AutoML, real-time visual analytics, immersive data, edge analytics (Lec4-DMViz p.34).

### 2.9 Lec4-DMTasks: Tasks of Data Mining (10 pp.)
- Data mining turns raw data into patterns: **discover, explain, predict, notice** (Lec4-DMTasks p.2).
- "Start with the question, not the algorithm": describe, predict, organise, detect (Lec4-DMTasks p.3).
- **Classification** assigns a known label, e.g. spam/not spam (p.4); **regression** predicts a numeric value, evaluated against actuals (p.5); **clustering** finds natural groups without labels (p.6); **association** "if this, then that" (p.7); **anomaly detection** establish normal → detect → investigate (p.8); **sequence mining**, where order matters (p.9) (Lec4-DMTasks pp.4–9).
- **Decision guide**: known categories → classification; numeric → regression; no labels → clustering; co-occurring → association; rare/suspicious → anomaly detection; ordered events → sequence mining (Lec4-DMTasks p.10).

### 2.10 Lec4-DataMatrix: Decoding the Data Matrix (15 pp., image-only, read visually)
- **KDD cycle**: data preprocessing (cleaning, integration, reduction) → data mining → pattern evaluation (filtering signal from noise) → knowledge presentation, with "User Feedback & Database Iteration". "Data mining is only one component of the KDD process" (Lec4-DataMatrix p.2).
- **Raw data types**: relational, transactional, textual, spatial, time series, graph (Lec4-DataMatrix p.3).
- **Relational grid vs graph ecosystem**: tables for discrete records and 1-to-many; graphs for many-to-many networks (Lec4-DataMatrix p.4).
- **Predictive (supervised)**: classification, regression; **descriptive (unsupervised)**: clustering, association, sequence mining (Lec4-DataMatrix p.5).
- **Classification** example tree (fever/congestion → cold/strep) (Lec4-DataMatrix p.6). **Regression** example: Exam Score = 67.67 + 5.56·Hours (Lec4-DataMatrix p.7).
- **Classification vs regression**: discrete labels vs continuous numbers; the real-world classification example is "Detecting a Cat vs. Dog in an image filter". **Synthesis rule**: "If the answer is a category, Classify. If the answer is a quantity, Regress." (Lec4-DataMatrix p.8)
- **Clustering**: maximise intra-class similarity, maximise inter-class distance (Lec4-DataMatrix p.9). **Association (market basket, rule confidence) and sequential pattern mining** (Lec4-DataMatrix p.10). **Text mining**: topic modelling, stance classification (Lec4-DataMatrix p.11).
- **Business question → data state → task → technique** table (Lec4-DataMatrix p.12).
- **Six pillars of system design**: "A model is only as strong as its weakest constraint". **Efficiency** (speed, scalability), **Effectiveness** (true predictive accuracy), **Interaction** ("Quality of visual presentation to the end-user"), **Privacy** ("Securing the underlying data"), **Fairness & Bias** ("Equal error distribution across demographic groups"), **Interpretability** ("Rationalizing algorithmic choices to humans") (Lec4-DataMatrix p.13).
- **Interpretability imperative**: a black box has "High accuracy, zero explainability. Fails to build user trust", while an explainable model "Builds trust by explicitly rationalizing the algorithmic choice to the human user" (Lec4-DataMatrix p.14).
- **Iterative horizon**: match the matrix; predict and describe; "Algorithmic accuracy is meaningless without operational efficiency and ethical interpretability". "Extract. Evaluate. Explain. Iterate." (Lec4-DataMatrix p.15)

### 2.11 Lec4-VizICT: Data Visualization as an ICT Tool (21 pp., advanced)
- **Definition**: graphical representation of data via digital systems, the "communication" layer of ICT (Lec4-VizICT p.2).
- **Cognitive foundations**: **pre-attentive attributes**, cognitive-load reduction (Lec4-VizICT p.3).
- **DIKW pipeline** (Data → Information → Knowledge → Wisdom) (Lec4-VizICT p.4).
- **Architecture of visualisation tools**: data layer (SQL, NoSQL, cloud warehouses) → processing engine (**server-side aggregation**) → presentation layer (**client-side rendering with HTML5, WebGL, Canvas**) (Lec4-VizICT p.5).
- **Real-time operational dashboards**: live metrics and **KPIs**, streaming refresh (Kafka), NOC example (Lec4-VizICT p.6). **Decision support systems**: what-if sliders (Lec4-VizICT p.7). **Geospatial / GIS** (Lec4-VizICT p.8). **Scrollytelling** (Lec4-VizICT p.9).
- **Multidimensional visuals**: parallel coordinates, **heatmaps**, radar; t-SNE/UMAP for ML (Lec4-VizICT p.10).
- **Accessibility and universal design**: "Color Blindness Safe: Using specialized palettes (e.g., **Viridis**) and high-contrast logic"; "rich, programmatic **ARIA** attributes and labels" (Lec4-VizICT p.11).
- **Big data obstacles**: over-plotting; downsampling, pixel aggregation, server-side pre-binning (Datashader) (Lec4-VizICT p.12).
- **ML and visual analytics**: **XAI with SHAP or LIME** dependency charts; correlation matrices for feature selection; anomaly flags on time series (Lec4-VizICT p.13).
- **Cloud-native visualisation** (Looker Studio, Power BI, Tableau Cloud; **row-level security**) (Lec4-VizICT p.14). **Open-source libraries**: **D3.js, Chart.js, Plotly, Apache ECharts**; example "Custom React dashboard utilizing TailwindCSS and D3" (Lec4-VizICT p.15).
- **Embedded analytics**: analytics inside transactional workflows reduces context switching (Lec4-VizICT p.16).
- **Misleading visuals**: **truncated Y-axes, cherry-picked bins, distorted aspect ratios**; instituting visual syntax audits (Lec4-VizICT p.17).
- **IoT monitoring, digital twins** (Lec4-VizICT p.18). **BI vs visual analytics**: routine known-number dashboards vs ad-hoc exploration (Lec4-VizICT p.19). AR/VR/WebXR (Lec4-VizICT p.20).
- **Best practices**: user-first design (granularity matched to audience); "high data-to-ink ratios and eliminating decorative chartjunk" (Lec4-VizICT p.21).

### 2.12 Lec4-VizBasics: Data visualisation as an ICT tool (10 pp., beginner)
- Visualisation helps people **compare, spot trends, communicate** (Lec4-VizBasics p.2).
- **Start with purpose**: what data, what to discover (comparison, trend, relationship, share), who the audience is (Lec4-VizBasics p.3).
- **Match form to message**: **bar** compares separate categories; **line** shows change over time; **pie** shows a few categories making up one total; **scatter** shows whether two measures are related (Lec4-VizBasics p.4). Detail slides for bar (p.5), line ("Always label the time period and the measured variable", p.6) and pie ("only a few clear segments", p.7).
- **Honest design**: title and axes, **consistent scales** (do not exaggerate or hide differences), readable colours, "Never hide context that changes the comparison" (Lec4-VizBasics p.8).
- Tools: Excel, Google Sheets, Power BI, Tableau, Canva/Slides (Lec4-VizBasics p.9). Exercise: collect an ethical dataset → choose a chart → label it → write one sentence on the pattern (Lec4-VizBasics p.10).

### 2.13 Lec4-DTBig: Decision Trees: Processing Large Volumes of Data (20 pp.)
- **Anatomy**: root node, internal nodes (X_i ≤ θ), leaf nodes, split criterion (Lec4-DTBig p.3).
- **Split criteria**: Gini(p) = 1 − Σp_k²; entropy H(X) = −Σp_k·log₂p_k; **variance reduction** (MSE) for regression (Lec4-DTBig p.4).
- **CART greedy training**: sort features, test midpoints, pick max gain, recurse (Lec4-DTBig p.5). Complexity: time O(N·D·log N), space O(N·D) (Lec4-DTBig p.6).
- **Breaking points**: OOM beyond ~10⁷ rows, disk thrashing, network bottlenecks (Lec4-DTBig pp.7–8).
- **Histogram-based splits**: bin values (e.g. 255 bins, uint8), complexity O(N·D) + O(B·D·depth) (Lec4-DTBig p.9).
- **Engines**: **LightGBM** (GOSS, leaf-wise), **XGBoost** (hist, out-of-core, Spark), **CatBoost** (categoricals) (Lec4-DTBig pp.10–11). **Level-wise vs leaf-wise** growth (Lec4-DTBig p.12).
- **Distributed training**: horizontal partitioning with local histograms reduced globally; feature parallelism; out-of-core with async prefetching (Lec4-DTBig pp.13–14). Code samples with `device_type` cpu/gpu and XGBoost `device: 'cuda'` (Lec4-DTBig pp.15–16).
- **Case and benchmark**: 500M-row CTR; 100M rows: sklearn OOM, XGBoost ~45 min, LightGBM ~12 min (Lec4-DTBig pp.17–18).
- **Guidelines**: quantise float64 → float32; **Apache Parquet** (column-oriented) instead of CSV; **early stopping** (Lec4-DTBig p.19). Summary (Lec4-DTBig p.20).

### 2.14 Lec4-DTDemyst: Demystifying the Decision Tree (16 pp., image-only, read visually)
- A decision tree mirrors step-by-step human choice: "The machine simply scales human intuition through mathematics" (Lec4-DTDemyst p.2).
- **Anatomy**: a supervised algorithm creating a hierarchical flowchart; root node, branches (attribute values), internal nodes, leaf nodes (Lec4-DTDemyst p.3).
- **Goal of splitting**: create pure subsets by measuring "Impurity" (high → moderate → perfect purity) (Lec4-DTDemyst p.4).
- **Entropy**: baseline uncertainty; higher entropy = more chaos; maximum at p = 0.5 (Lec4-DTDemyst p.5). Worked example: 3 A / 5 B gives entropy = 0.954 (Lec4-DTDemyst p.6).
- **Information Gain** = Entropy(parent) − Weighted Entropy(children); choose the feature with maximum gain (Lec4-DTDemyst p.7).
- **Gini Index** = 1 − Σ(p_i)², the probability of incorrect identification; 0 = pure, 0.5 = high impurity; default in scikit-learn (Lec4-DTDemyst p.8).
- **Entropy vs Gini table**: log vs squared probabilities; slower vs faster; C4.5 vs sklearn default; Gini "favors splits creating equally sized child nodes" (Lec4-DTDemyst p.9).
- **Recursive algorithm**: initialise → evaluate → branch → terminate (Lec4-DTDemyst p.10). Outlook / humidity worked scenario (Lec4-DTDemyst pp.11–14).
- **Ensembles**: multiple trees combined by weights or confidence, the groundwork for Random Forests (Lec4-DTDemyst p.15).
- **Why trees matter**: high interpretability, minimal preprocessing, flexibility (Lec4-DTDemyst p.16).

### 2.15 Lec4-Gini1 / Lec4-Gini3: Gini Impurity lecture notes (3 pp. + 2 pp., EN/RU)
- **Gini impurity** measures homogeneity or impurity and is used in **CART**: Gini = 1 − Σ(p_i)² (Lec4-Gini1 p.1; Lec4-Gini3 p.1).
- **Weighted split**: Gini_split = (N_L/N_total)·Gini_L + (N_R/N_total)·Gini_R (Lec4-Gini1 p.1).
- **Golf example**: parent 6 Yes / 4 No gives 0.48; Sunny (1/3) gives 0.375; Overcast (5/1) gives ≈0.278; split gives 0.3168 (Lec4-Gini1 p.2; Lec4-Gini3 pp.1–2).
- **Gini vs Entropy**: ranges 0–0.5 vs 0–1.0; Gini faster (no log) (Lec4-Gini3 p.2). sklearn `DecisionTreeClassifier(criterion='gini', max_depth=1)` snippet (Lec4-Gini3 p.2).

### 2.16 Lec5-Net: Networks and telecommunications (39 pp.)
- **Protocol** = agreed rules; **stack** = layered rules (Lec5-Net p.3). **Layering** gives one job per layer, independent change and shared standards: "A web application can use Ethernet or Wi-Fi without rewriting its communication logic" (Lec5-Net p.4).
- **OSI 7 layers** (Lec5-Net p.5): application (HTTP, SMTP, DNS), **presentation (encoding, compression, encryption)**, session (Lec5-Net p.6); transport (segments, **ports**, TCP reliable, UDP light), network (IP, routers) (Lec5-Net p.7); data link (frames, MAC), physical (Lec5-Net p.8).
- **TCP/IP 4 layers**: link, internet, transport, application; "OSI is the reference; TCP/IP is what runs" (TLS at application row, ICMP) (Lec5-Net pp.9–10).
- **Encapsulation**: data → segment → packet → frame → bits (Lec5-Net p.11).
- **TCP vs UDP**: handshake, ordered/retransmitted vs best-effort; web/email/files vs DNS/voice/video/games (Lec5-Net p.12). **Three-way handshake**, sequence numbers, acknowledgements, windows (Lec5-Net p.13).
- **Ports and sockets**: 16-bit port 0–65535; socket = IP + port; HTTP 80, **HTTPS 443**, DNS 53, SSH 22 (Lec5-Net p.14). Protocol reference per layer (ARP, PPP) (Lec5-Net p.15).
- **IPv4**: 32 bits, network part + host part, prefix (Lec5-Net p.17). Classful A/B/C/D/E (Lec5-Net p.18). **Subnet mask and CIDR**; /24 = 254 usable hosts (Lec5-Net p.19). Worked /26 split (Lec5-Net p.20).
- **Private ranges** 10/8, 172.16/12, 192.168/16; **loopback 127.0.0.1**; link-local 169.254/16 (Lec5-Net p.21). **NAT** (Lec5-Net p.22).
- **IPv6** 128-bit, hex, SLAAC, no NAT needed; IPv4 vs IPv6 table (Lec5-Net pp.23–24).
- **Routing**: hop by hop, longest-prefix match, default route (Lec5-Net p.25).
- **DHCP**: address, mask, gateway, DNS; UDP 67/68 (Lec5-Net p.27). **DORA**: Discover, Offer, Request, Acknowledge; a lease is time-limited (Lec5-Net p.28). Lease lifecycle T1/T2 (Lec5-Net p.29). Relays, reservations, options (Lec5-Net p.30).
- **Wired media**: twisted pair (100 m), coax, fibre (Lec5-Net p.32). Ethernet standards 10BASE-T → 10GBASE-SR (Lec5-Net p.33). **Switches**, MAC learning, **VLANs**, full duplex (Lec5-Net p.34).
- **Wi-Fi 4/5/6/7** (802.11n/ac/ax/be) (Lec5-Net p.35). **WLAN**: access points, **CSMA/CA**, **WPA3** (Lec5-Net p.36). Cellular (4G LTE, 5G) and Bluetooth/Zigbee (Lec5-Net p.37).
- **Wired vs wireless** selection: speed, mobility, security, cost (Lec5-Net p.38). Takeaways (Lec5-Net p.39).

### 2.17 Lec5-Inet: Internet technologies: from URI to email (39 pp.)
- **End-to-end journey**: identify (URL) → resolve (DNS) → exchange (TCP/TLS + HTTP; HTTP/3 uses QUIC) → render (Lec5-Inet p.3). Milestones (ARPANET 1969, TCP/IP 1983, web 1989–91, W3C 1994, HTTP/2 2015, HTTP/3 2022) (Lec5-Inet p.4).
- **Why identifiers**: IP locates hosts, while resources need stable names. "URI identifies a resource. A URL also describes access" (Lec5-Inet p.6).
- **URI, URL, URN**: URI per **RFC 3986**; URL = where and how to fetch; URN = persistent name (Lec5-Inet p.7).
- **URI anatomy**: scheme, authority (userinfo, host, port), path, **query** (parameters sent to server), **fragment** (client-side) (Lec5-Inet p.8). **Percent-encoding** (space → %20, UTF-8 bytes), IRIs, punycode (Lec5-Inet p.9).
- **Relative references and pitfalls**: only the query reaches the server; trailing slashes; case sensitivity; "Validate redirect destinations to prevent **open redirects**" (Lec5-Inet p.10).
- **DNS**: HOSTS.TXT era (Lec5-Inet p.11); history (Mockapetris 1983, RFC 1034/1035, DNSSEC 2010, DoT/DoH 2016+) (Lec5-Inet p.12); **hierarchy** root → TLD → authoritative (Lec5-Inet p.13); **resolution** via caches, recursive resolver, referrals, **TTL** (Lec5-Inet p.14); **record types** A/AAAA, CNAME, MX, NS/SOA, TXT (SPF, DKIM), PTR (Lec5-Inet p.15); dig/nslookup (Lec5-Inet p.16); **DNS security**: cache poisoning (Kaminsky), DNSSEC (authenticity, not encryption), DoT port 853, DoH, amplification, tunnelling (Lec5-Inet p.17).
- **HTTP evolution**: 0.9 (single GET), 1.0 (RFC 1945; headers, status codes, methods) (Lec5-Inet p.19); **1.1** (persistent connections, Host header, chunked transfer, caching, head-of-line blocking) (Lec5-Inet p.20).
- **Request/response anatomy**: request line (method, target, version), headers, blank line, body; status line (Lec5-Inet p.21).
- **Methods and status codes**: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS. **Safe** = GET, HEAD, OPTIONS; **idempotent** = PUT, DELETE; POST/PATCH not generally idempotent. 2xx (200, 201, 204), 3xx (301, 302, 304), 4xx (400, 401, 403, 404, 429), 5xx (500, 502, 503) (Lec5-Inet p.22).
- **Headers, cookies, caching**: Content-Type, Accept, Authorization, User-Agent; cookies with **SameSite, HttpOnly, Secure**; **CORS** governs cross-origin script access; Cache-Control, ETag, Last-Modified (Lec5-Inet p.23).
- **HTTPS and TLS**: encrypts traffic and authenticates the server via certificates; CA chain of trust; Let's Encrypt; **HSTS**; TLS 1.3 (2018) (Lec5-Inet p.24).
- **HTTP/2** (binary framing, multiplexing, HPACK) and **HTTP/3** (QUIC over UDP, RFC 9114) (Lec5-Inet p.25). curl and DevTools lab; 304 Not Modified (Lec5-Inet p.26).
- **Web history**: JavaScript and PHP 1995, CSS 1996, XMLHttpRequest/Ajax 1999, HTML5 2014, SPAs, WebAssembly 2017 (Lec5-Inet p.28).
- **HTML / CSS / JavaScript**: structure and semantics / layout (Flexbox, Grid, responsive) / behaviour (DOM, events, **fetch**); "Separation of concerns still guides good design" (Lec5-Inet p.29).
- **Browser rendering pipeline**: parse (DOM, CSSOM) → render tree → layout → paint → composite; `defer` and `async` scripts (Lec5-Inet p.30).
- **Server-side and API technologies** (diagram): browser client → **CDN and reverse proxy (nginx)** → API formats (**REST** (Fielding, 2000), **JSON**, **GraphQL** (2015)) → **application server** (CGI, PHP, Java servlets, Node.js, Python and Go frameworks) → **database**, all inside "cloud and containers". Real-time: **WebSocket** (2011) and **Server-Sent Events**. "REST is an architectural style; JSON is a data format." (Lec5-Inet p.31)
- **Web security essentials**: OWASP (injection, broken access control); validate input, **parameterised queries**, server-side permissions; **password hashing and MFA**; **OAuth 2.0** (delegated authorisation) and **OpenID Connect** (authentication); escape output against **XSS**; **CSRF**; same-origin policy, **CSP**, careful CORS; "Never trust a hidden button or a client-side check as an access-control boundary" (Lec5-Inet p.32).
- **Email**: history (Lec5-Inet p.34); MUA → MSA (587) → MTA (MX) → MDA → IMAP/POP3 (Lec5-Inet p.35); ports (Lec5-Inet p.36); RFC 5322 and MIME (Lec5-Inet p.37); **SPF, DKIM, DMARC**, STARTTLS, MTA-STS (Lec5-Inet p.38). Takeaway: "URI names it, DNS finds it, HTTP fetches it" (Lec5-Inet p.39).

### 2.18 Lec5-Sec: Cybersecurity: Threats, Malware, Defences and Standards (43 pp.)
- **CIA triad**: confidentiality, integrity, availability (Lec5-Sec p.4).
- **Vocabulary**: asset, vulnerability, threat, exploit, payload, **attack surface**, control. **Risk = likelihood × impact** ("A useful scoring model, not a universal quantitative law") (Lec5-Sec p.5).
- **History**: Creeper, Elk Cloner, Morris worm (Lec5-Sec p.6); Melissa, antivirus, firewalls (p.7); ILOVEYOU, Slammer, botnets, Patch Tuesday (p.8); Stuxnet, Mirai, WannaCry/NotPetya (p.9); SolarWinds, Log4Shell, RaaS, AI-assisted phishing (p.10); co-evolution timeline ending in **zero trust** (p.11) (Lec5-Sec pp.6–11).
- **Threat actors**: cybercriminals, nation-state/APTs, hacktivists, insiders, script kiddies and researchers (Lec5-Sec p.13). **Classification** by origin (external/internal), intent (deliberate/accidental), selection (targeted/opportunistic); natural threats count too (Lec5-Sec p.14). **By CIA property** (Lec5-Sec p.15).
- **STRIDE** design-time threat modelling: Spoofing (authenticity), Tampering (integrity), Repudiation (non-repudiation), Information disclosure (confidentiality), Denial of service (availability), Elevation of privilege (authorisation). Apply it "to every element of a data-flow diagram: processes, stores, flows and trust boundaries" (Lec5-Sec p.16).
- **Attack vectors and surface**: digital, cloud exposure ("Misconfigured storage, excessive permissions and stolen tokens"), trusted dependencies, physical/human (Lec5-Sec p.17). **Social engineering** (phishing, spear, vishing, smishing, pretexting, baiting, tailgating, BEC) (Lec5-Sec p.18). **Network attacks** (sniffing, MITM, ARP/DNS spoofing, port scanning, DoS/DDoS, amplification) (Lec5-Sec p.19).
- **Web application attacks**: **SQL injection** (parameterised queries), **XSS** (output encoding), **CSRF** (anti-CSRF tokens, SameSite), **broken access control** (server-side checks), **insecure deserialisation**; "Use OWASP Top 10 for awareness" (Lec5-Sec p.20).
- **Password and identity attacks**: brute force, dictionary, spraying, credential stuffing, pass-the-hash, token theft, MFA fatigue. Defences: "**Unique salts** … **Slow password-hashing algorithms**"; rate limits, breached-password checks, passkeys, session protection (Lec5-Sec p.21).
- **Cyber Kill Chain** (reconnaissance, weaponisation, delivery, exploitation, installation, C2, actions on objectives) and **MITRE ATT&CK** (Lec5-Sec p.22).
- **Malware taxonomy by behaviour**: spread (virus, worm, Trojan), access and concealment (spyware, adware, rootkit, backdoor, botnet agent), impact (ransomware, cryptojacker, wiper, fileless); labels overlap (Lec5-Sec p.24). Ransomware anatomy; "Recovery depends on tested offline backups" (Lec5-Sec p.25). Trojans, RATs, rootkits, fileless (Lec5-Sec p.26). Botnets and C2 (Lec5-Sec p.27).
- **Malware analysis**: static vs dynamic (sandbox) (Lec5-Sec p.28). **AV detection**: signatures, heuristics and emulation, behaviour and ML; "A clean scan is evidence, not proof" (Lec5-Sec p.29).
- **Defence in depth**; **least privilege**; **fail-safe defaults** ("deny access unless it is explicitly permitted"); independent layers (Lec5-Sec p.31).
- **Cryptography in practice**: **symmetric AES** (shared key, key storage matters), **asymmetric RSA/ECC** (signatures, key establishment), **hashing** (integrity; authenticity needs MAC or digital signature); TLS combines them; certificates and **PKI**; "never design your own algorithm" (Lec5-Sec p.32).
- **Authentication and access control**: factors (know/have/are), **MFA** combines different types ("two passwords do not"); **RBAC**; least privilege; password managers, **passkeys**, **SSO**, **PAM**; "Authentication asks 'Who are you?' Authorisation asks 'What may you do?'" (Lec5-Sec p.33).
- **Network defences**: packet-filter, stateful and NGFW firewalls; **IDS/IPS** (Snort, Suricata); VLANs, **DMZ**, zero-trust microsegmentation; VPN (Lec5-Sec p.34).
- **Endpoint**: EDR, patching, disabling unused services, **full-disk encryption**, allow-listing, CIS Benchmarks (Lec5-Sec p.35).
- **Security operations**: **SIEM**, **SOC**; incident phases prepare, identify, contain, eradicate, recover, learn; **3-2-1 backups** with offline or immutable copies and tested restores (Lec5-Sec p.36).
- **Toolkit**: Nmap, Wireshark, Metasploit, Burp, Hashcat, ClamAV, Wazuh, Security Onion; test only authorised systems (Lec5-Sec p.37).
- **Secure SDLC**: validate input, encode output, parameterised queries, server-side authorisation; **SAST, DAST, dependency scanning in CI**; **CVE** and **CVSS** (Lec5-Sec p.38).
- **Standards**: **ISO/IEC 27001/27002**, **NIST CSF** (Govern, Identify, Protect, Detect, Respond, Recover; CSF 2.0 added Govern), **NIST SP 800-53**, **CIS Controls**, **OWASP ASVS and Top 10**, **PCI DSS**; "Compliance evidence supports assurance; it does not guarantee security" (Lec5-Sec p.40).
- **Law and ethics**: **GDPR** data protection and breach notification; computer misuse laws; bug bounty scope; responsible disclosure; ACM and (ISC)² codes (Lec5-Sec p.41).
- **Risk assessment worked example (small web shop)**: likelihood/impact table; admin takeover → MFA and restricted privileges (**ISO 27001:2022 Annex A 8.5**, secure authentication); injection breach → parameterised queries (**A 8.28** secure coding); outage → resilience (**A 8.14** redundancy); other treatments are transfer, accept, avoid; residual risk (Lec5-Sec p.42).

### 2.19 Lec5-KZ: Cybersecurity in Kazakhstan: law, digital signature and encryption (15 pp.)
- Kazakhstan treats cybersecurity as national policy. GCI ranking reported as 40th, up from 82nd (historical) (Lec5-KZ p.2).
- **Legal framework**: Law "On Informatization" (2015; No. 418-V of 24 Nov 2015); Law on Electronic Document and Electronic Digital Signature; **Law on Personal Data and Their Protection** (consent, processing, protection); **Government Decree No. 832** (uniform ICT and infosec requirements); "Use the current consolidated text in **Adilet**" (Lec5-KZ p.3).
- **Law "On Cybersecurity"** (working course label; confirm the formal title): scope covers information-security tools, privileged users and critically important digital objects (energy, water, healthcare, comms, banking, transport). Amendment cited: **Law No. 256-VIII, 9 January 2026**, effective six months after publication (Lec5-KZ p.4). The syllabus cites the Digital Code as **No. 255-VIII of 09.01.2026** (Syl p.9). Treat the numbers as "verify in Adilet".
- **Cybershield of Kazakhstan** concept (to end of 2022): test labs, National Information Security Coordination Center, CERT, seven SOCs, scholarships (Lec5-KZ p.6).
- **Institutions**: **Ministry of Artificial Intelligence and Digital Development** with its Information Security Committee; **KZ-CERT**; bug-bounty programme; critical-object operators run their own SOC (Lec5-KZ p.7).
- **Decree No. 832 (20 Dec 2016)** control themes: **access control, logging, network protection, audit** (Lec5-KZ p.8).
- **Digital signature process**: hash the document → sign the hash with the **private key** → attach the certificate from a CA → verify with the **public key** and validate the chain and status. "A signature supports integrity and authenticity · it does not hide the document" (Lec5-KZ p.10).
- **EDS (ЭЦП) in Kazakhstan**: legal force of a handwritten signature when conditions are met; **National Certification Authority** certificates with **NCALayer**; used for eGov, tax, contracts, procurement; "certificate = public identity binding · private key = signing authority" (Lec5-KZ p.11).
- **Encryption standards**: **AES for data at rest**; RSA/ECC for keys and signatures; **SHA-2** hashing; national **GOST-based ST RK 1073, GOST 34.310** for public systems; **TLS for data in transit** (Lec5-KZ p.12).
- **Personal data**: consent and protection duties for owners and operators; proposed inspection power for the Information Security Committee; **security guidelines for personal data published December 2025**; confirm breach-reporting duties in current law (Lec5-KZ p.13).
- **Defence-in-depth for a regulated system**: perimeter (firewall, segmentation, DDoS); identity (strong auth, **EDS login**, privileged-user control); **data (encryption, key management, backup)**; monitoring (logging, SIEM, SOC, incident reporting to the national CERT) (Lec5-KZ p.14).
- **Checklist**: know the applicable laws; use certified EDS and approved cryptography; "Build logging and incident response in from day one"; follow amendments (Lec5-KZ p.15).
- Not in this deck: the text of the Law on AI No. 230-VIII. It is cited only in the syllabus (Syl pp.9, 11). There are no specific article numbers on consent, cross-border transfer or data localisation, and biometric data is not discussed separately here.

---

## 3. Application to our project

| Project decision area | Course concept to cite | Source (deck + page) | One-sentence justification we can say at the defence |
|---|---|---|---|
| Overall framing of the app | Each layer of digital infrastructure has a data/ML role; prototype criteria = working state, documentation, defence | Syl p.2, p.3 (CLO 6) | We designed every layer (UI, API, DB, model) around the data it carries, which is how the course frames ICT, and we document each choice for the CLO 6 criteria. |
| Landing page layout | Nielsen #8 Aesthetic and minimalist design ("Modern landing pages": minimal distraction, progressive disclosure, white space, high-contrast hierarchy) | Lec3-HCI p.21 | The landing page has one primary call to action and keeps secondary info behind progressive disclosure, as heuristic 8 prescribes for landing pages. |
| Upload flow feedback | Nielsen #1 Visibility of system status (progress bar with exact percentage when uploading a heavy file); feedback mechanics (processing bars, state flags) | Lec3-HCI p.14, p.10 | During upload and analysis the user always sees a percentage progress bar and status flags, because the course names exactly this example under heuristic 1. |
| Upload validation | Nielsen #5 Error prevention (disable Submit until valid; confirm destructive actions) and #9 Diagnose and recover (plain-language message plus a fix, highlight the field) | Lec3-HCI p.18, p.22 | We block invalid files before upload and, if something fails, say in plain words what was wrong and how to fix it instead of an error code. |
| Undo / delete of analyses | Nielsen #3 User control and freedom (Undo toast, Cancel) and #5 confirmation dialog | Lec3-HCI p.16, p.18 | Deleting a photo or result asks for confirmation and offers undo, giving the user the "emergency exit" heuristic 3 requires. |
| Navigation and consistency across pages | Nielsen #4 Consistency and standards; information architecture (logical classification, clear labelling, sitemaps and user flows) | Lec3-HCI p.17, p.36 | Landing, dashboard, analytics, settings and upload share one navigation and button style, and our sitemap keeps every page within a couple of clicks. |
| Results page (showing which rules failed) | Recognition rather than recall (rich previews); mental model / system image | Lec3-HCI p.19, p.11 | Results show the photo thumbnail with the violated rules visible next to it, so the user recognises rather than remembers, and the UI matches their mental model of "photo → checklist". |
| Settings page complexity (rules configuration) | Hick's Law T = b·log₂(n+1), progressive disclosure and chunked wizards | Lec3-HCI p.35 | Advanced rule settings sit under collapsible panels and a step-by-step wizard, because Hick's Law says each extra visible option increases decision time. |
| Button sizing and placement | Fitts's Law MT = a + b·log₂(2D/W); touch targets ≥ 48×48 px | Lec3-HCI p.34, p.31 | The Upload/Analyse button is large and placed where the cursor already is, and every tap target is at least 48×48 px for mobile users. |
| Help for first-time users | Nielsen #10 Help and documentation (tooltips, onboarding walkthrough for dashboards) | Lec3-HCI p.23 | Tooltips explain each rule and metric on the dashboard, following the course's SaaS-dashboard example for heuristic 10. |
| Accessibility | WCAG: alt-text, contrast ≥ 4.5:1, keyboard-only paths; colour-blind-safe palettes (Viridis) and ARIA labels for charts | Lec3-HCI p.37; Lec4-VizICT p.11 | All text meets 4.5:1 contrast, every control is keyboard-reachable, and charts use a colour-blind-safe palette with ARIA labels. |
| Usability evaluation of the prototype | Usability metrics: task success rate, time-to-task, error rate; SUS (0–100); NPS | Lec3-HCI p.27 | We measured usability with task success, time-to-complete and a SUS questionnaire, because the course defines usability as measurable, not "looking pretty" (Lec3-HCI p.12). |
| User-centred design and AI in the UI | HCI four components (user, interface, task, context); HCI for AI-powered systems; error reduction through clear feedback | Lec3-HCI pp.2–3, p.7 | We started from the user's task and context, and because our system is AI-powered we expose clear feedback on what the model decided. |
| Model output explanation in the UI | Interpretability imperative (black box fails to build trust); XAI (SHAP/LIME); six pillars: Interaction, Interpretability | Lec4-DataMatrix pp.13–14; Lec4-VizICT p.13; Lec4-DMViz p.33 | Each verdict comes with the rule and reason, because the course shows an unexplained black box "fails to build user trust". |
| Database type for users, rules, uploads metadata, results | Relational model, ACID, integrity constraints; SQL vs NoSQL choice "driven by data structure predictability, concurrency limits, and scaling requirements" | Lec3-DBSys p.21, pp.10–13, p.28 | Our users, rules and results are predictable and related, so a relational DB with ACID guarantees fits the course's own selection criteria better than schema-free NoSQL. |
| Storing the photo files themselves | Unstructured data → vector / object stores; structured metadata → SQL | Lec3-ModernDB p.8, p.2 | Images are unstructured, so we keep the files in object/file storage and only their metadata and paths in SQL, as the course maps unstructured data to object stores and metadata to SQL. |
| Flexible rule output (variable JSON per rule) | Document databases for dynamic schemas and web apps; semi-structured JSON | Lec3-ModernDB p.6; Lec3-DBSys p.25 | If rule outputs vary in shape, we store them as semi-structured JSON, which the course says document stores handle for dynamic schemas. |
| Schema design | Normalisation 1NF/2NF/3NF; anomalies; "one fact in one place"; Student/Course/Enrollment pattern | Lec3-DBSys pp.33–37; Lec3-SQL pp.22–24 | Our schema is in 3NF (users, images, rules, analyses, analysis_rule_results as a join table), which removes the update, insert and delete anomalies the course lists. |
| Integrity of results | Entity, referential, domain integrity; PK, FK, UNIQUE, CHECK, NOT NULL; "database must remain the final guardrail"; ON DELETE CASCADE / RESTRICT | Lec3-DBSys pp.29–32; Lec3-SQL pp.25–27 | The DB itself enforces foreign keys and CHECK constraints (e.g. confidence between 0 and 1), so even a buggy client cannot store an orphaned or invalid result. |
| Saving an analysis atomically | Transactions and ACID atomicity (all-or-nothing) | Lec3-DBSys pp.9–10; Lec3-SQL p.19, p.48 | An analysis and its per-rule results are written in one transaction, so a crash never leaves half a result. |
| Backend data access layer | ORM: mapping, CRUD, migrations; hybrid ORM + SQL; inspect generated SQL; N+1 risk | Lec3-SQL pp.31–50, p.30 | We use an ORM for routine CRUD and migrations but drop to SQL for analytics aggregates, the "hybrid" approach the course recommends for practical systems. |
| Analytics queries | GROUP BY / HAVING aggregation, JOINs, CTEs, declarative SQL | Lec3-SQL pp.12–17 | Dashboard numbers (pass rate per rule, uploads per day) are SQL aggregates with GROUP BY and JOINs, the same patterns as the Week 3 lab. |
| Query performance | Query optimiser, EXPLAIN, B-tree indexes and their write cost; optimisation as an evidence loop | Lec3-DBSys pp.42–44; Lec3-SQL pp.28–30 | We added indexes only where EXPLAIN showed full scans (e.g. results by user and date), measuring before and after as the course's evidence loop says. |
| Role-specific data views | Three-schema architecture, external views; "Show each user only what they should see" | Lec3-DBSys pp.14–15; Lec3-SQL p.4 | Users only see their own uploads and admins see aggregates, which matches the external-view level of ANSI-SPARC. |
| Possible similarity search over images | Vector databases, embeddings, cosine similarity; Milvus/Pinecone | Lec3-ModernDB pp.5, 9 | If we add "find similar photos", embeddings go into a vector DB, which the course names as the store for high-dimensional AI embeddings. Optional, not core. |
| Photo metadata handling | Metadata types: descriptive (EXIF incl. geolocations, camera settings), administrative (permissions, checksums), structural (dimensions, colour space); JSON image-asset example | Lec4-DataMgmt pp.12–13 | We store structural metadata (size, dimensions, format) and a checksum, and strip EXIF geolocation, because the course points out that photo EXIF holds geolocation. |
| Data classification of uploads | Security classification: Restricted/Secret includes PII | Lec4-DataMgmt p.14 | Uploaded photos may contain faces or other PII, so we classify them as restricted data and apply the strictest handling. |
| Analytics: comparing categories (e.g. violations per rule) | Bar chart for separate categories | Lec4-VizBasics pp.4–5; Lec4-DMViz p.28 | Violations per rule are separate categories, so we use a bar chart, the form the course matches to comparison. |
| Analytics: trends over time (uploads/day, pass-rate over time) | Line chart for change over time; label time period and variable | Lec4-VizBasics pp.4, 6; Lec4-DMViz p.28 | Time trends use line charts with labelled time axes, as the course prescribes. |
| Analytics: share of pass/fail | Pie chart only for a few parts of one whole | Lec4-VizBasics pp.4, 7 | Pass vs fail is a two-part whole, the only situation where the course endorses a pie chart. |
| Analytics: confidence-score distribution | Histogram (frequency shape), box plot (distribution, median, outliers) | Lec4-DMViz p.28 | Model confidence is numeric, so we show its distribution with a histogram or box plot rather than a bar chart. |
| Analytics: relationship between two numeric measures | Scatter plot | Lec4-VizBasics p.4; Lec4-DMViz p.28 | Image size vs processing time is shown as a scatter, the form for "whether two measures may be related". |
| Rule × category matrix | Heatmap (multidimensional visuals) | Lec4-VizICT p.10 | A rule-by-category heatmap shows many cells at once without clutter. |
| Dashboard KPIs | Real-time operational dashboards and KPIs; BI dashboards consolidate indicators | Lec4-VizICT p.6; Lec4-DMViz p.29 | The dashboard header shows a few KPIs (uploads, pass rate, average latency), following the course's operational-dashboard pattern. |
| Honest chart design | Data-ink ratio, no chartjunk, axes from zero, no 3D skew; no truncated Y-axes or cherry-picked bins; consistent scales, titles, labels | Lec4-DMViz p.31; Lec4-VizICT pp.17, 21; Lec4-VizBasics p.8 | Our charts start at zero, use no 3D effects and carry titles and labelled axes, avoiding the misleading tactics the course lists. |
| Chart rendering architecture | Data layer → server-side aggregation → client-side rendering (HTML5/Canvas/WebGL); libraries D3.js, Chart.js, Plotly, ECharts | Lec4-VizICT pp.5, 15; Lec4-DMViz p.30 | The API aggregates with SQL and the browser only renders with a JS chart library, the three-layer visualisation architecture from the lecture. |
| Interactive filtering | Visualisation pipeline: user interaction (filter, drill down); embedded analytics in workflows | Lec4-DMViz p.27; Lec4-VizICT p.16 | Users filter analytics by date and rule and drill down to individual photos inside the app, with no separate BI tool. |
| ML experiment lifecycle | CRISP-DM six phases; KDD selection → preprocessing → transformation → mining → evaluation | Lec4-DMViz pp.14–15; Lec4-DataMatrix p.2 | Our experiment follows CRISP-DM from business understanding (which rules matter) through deployment in the app. |
| Task type for the vision model | Classification = known label; synthesis rule "If the answer is a category, Classify"; image cat-vs-dog example | Lec4-DMTasks pp.4, 10; Lec4-DataMatrix p.8 | Checking a photo against rules gives categorical answers (compliant / not, which class), so this is classification by the course's decision guide. |
| Dataset improvement variant | Data quality check (missing values, conflicting formats, outliers); data cleansing, integration, feature engineering; selection bias; log of every cleaning decision | Lec4-DMViz pp.16–17; Lec4-DataMgmt pp.4, 9; Syl p.15 (week 4 activity) | Our dataset improvements (relabelling, de-duplication, class balancing) target data quality and selection bias, and we log every decision as in the Week 4 lab. |
| Model-modification variant / training protocol | Train/validation/test split; hyperparameter optimisation; iterative model comparison by accuracy, time, cost; audit for data leakage | Lec4-DMViz pp.18–19 | We compare baseline and modified models on a held-out test split, tune hyperparameters on validation only, and check for leakage between splits. |
| Quality metric justification | CLO 5 "justification of the quality metric"; forecasting metrics MAE/MSE/MAPE (regression only); classification metrics accuracy/precision/recall/F1 appear only in the syllabus (week 6) | Syl p.2, p.15; Lec4-DataMgmt p.19 | Modules 1–5 teach error metrics only for forecasting. The classification metrics we report come from the week 6 syllabus, and we justify the choice per CLO 5. |
| Fairness of the model | Six pillars: Fairness and Bias ("Equal error distribution across demographic groups"); algorithmic bias | Lec4-DataMatrix p.13; Lec4-DMViz p.33 | We report errors per subgroup of the dataset, because the course defines fairness as equal error distribution. |
| Interpretable baseline (if tabular features are used) | Decision trees: interpretable rule logic, Gini/entropy, information gain, ensembles | Lec4-DTDemyst pp.7–9, 16; Lec4-Gini3 p.2; Lec4-DMViz p.21 | A decision tree on extracted features is a readable baseline the course highlights for compliance-heavy, explainable settings. |
| Why a neural net for images | Deep learning strong on unstructured image data but needs GPUs and is a black box | Lec4-DMViz p.22 | For raw images we use a deep model because the course says it handles unstructured image data best, and we offset the black-box cost with explanations. |
| Monitoring after deployment | Data drift monitoring and retraining; deployment via APIs, microservices, containers | Lec4-DMViz p.19 | We log model confidence over time on the analytics page so data drift becomes visible, which CRISP-DM stage 6 requires. |
| Browser → API → model architecture | Client-server systems; middleware/API gateways (rate-limiting, token checking); software stack communicates through APIs | Lec2-Arch p.43, p.80, p.68 | The browser is a thin client, the API server hides the model hardware behind a transparent interface, and the API layer does token checks and rate-limiting. |
| API style and data format | REST (architectural style), JSON (data format), application server, reverse proxy (nginx), CDN; cloud and containers | Lec5-Inet p.31 | Our frontend calls a REST API that returns JSON, behind an nginx reverse proxy, which is the exact stack in the course diagram. |
| HTTP semantics of endpoints | Methods (POST upload, GET results, DELETE), safe/idempotent; status codes as listed in the course: 200/201/204, 400/401/403/404/429, 500/502/503 | Lec5-Inet p.22 | Uploads are POST (not idempotent), result reads are GET (safe), and errors use the 4xx/5xx classes the course lists, with 429 for rate limits. |
| URLs and query parameters | URI anatomy (path, query, fragment); only the query reaches the server; percent-encoding; validate redirects (open redirect) | Lec5-Inet pp.8–10 | Filters go in the query string, client-only state in the fragment, and we never redirect to unvalidated URLs. |
| Live progress of long analyses | Real-time options: WebSocket and Server-Sent Events | Lec5-Inet p.31 | Analysis progress is pushed with SSE or WebSocket, the real-time options the course lists, which also satisfies heuristic 1. |
| Frontend structure | HTML/CSS/JS separation of concerns; DOM, events, fetch; browser pipeline, defer/async | Lec5-Inet pp.29–30 | The UI keeps structure, style and behaviour separate and loads scripts with defer so rendering is not blocked. |
| Transport and ports | TCP vs UDP; ports (HTTPS 443); socket = IP + port; loopback 127.0.0.1 for local services | Lec5-Net pp.12, 14, 21 | The browser talks to the API over HTTPS on 443 (TCP), while a local model server listens only on loopback so it is not exposed to the network. |
| Layering argument | OSI vs TCP/IP; layering lets parts change independently ("web application can use Ethernet or Wi-Fi without rewriting") | Lec5-Net pp.4, 9–10 | Swapping the model from local to cloud only changes one layer behind the API, the same independence principle as protocol layering. |
| Local vs cloud model: latency | Edge computing processes data on local devices "for instant response", whereas cloud adds latency | Lec1-ICT p.19 | Running the vision model locally is the edge computing pattern, which avoids the round-trip latency of a distant cloud. |
| Local vs cloud model: cost and scale | Cloud platforms (rent on demand, pay-as-you-go, managed services); TPU expensive and cloud-based | Lec1-ICT p.6; Lec2-Arch p.32 | The cloud option gives on-demand GPUs/TPUs without owning hardware, which is its main advantage over a local model. |
| Local vs cloud model: legal constraint | Syllabus data-security rule: personal or biometric data must never be uploaded to external AI services (Digital Code No. 255-VIII; Law on AI No. 230-VIII); alternative "a local model via Ollama"; Week 5 lab "decide whether datasets may be uploaded to an external AI service" | Syl p.9, p.15 | Because user photos can contain biometric or personal data, the course's own rule pushes us to a local model by default, with a cloud model only for non-personal or consented data. |
| Local vs cloud model: hardware | CPU (low latency, serial) vs GPU (high throughput, parallel; ~12 GB VRAM; CUDA lock-in) vs TPU; Huang's Law; "No assignment requires … a GPU" | Lec2-Arch pp.26–32; Syl p.11 | We chose a model small enough for CPU inference, since the course says no assignment needs a GPU, and GPUs add CUDA lock-in and memory limits. |
| Model throughput reasoning | SIMD and multicore; GPUs "Renders graphics up to 100× faster"; CPU vs GPU training cost lab | Lec2-Arch pp.28, 43; Syl p.15 | Batch image inference is a SIMD-style parallel workload, which is why GPU benchmarks are far faster, as in the Week 2 CPU-vs-GPU estimate. |
| Image representation for preprocessing | Digital image = list of colour numbers per pixel; data units | Lec2-Arch pp.4, 10 | Our preprocessing (resize, normalise) works on the image as a pixel-number array, which is the course's definition of a digital image. |
| Deployment and reproducibility | Docker / Docker Compose for local and dev; Kubernetes for production; syllabus week 10 Dockerfile; week 9 Streamlit/Gradio | Lec3-ModernDB p.12; Syl p.16 | The app, DB and model run via Docker Compose, giving reproducible environments as the course recommends for prototypes. |
| Threat modelling of the upload pipeline | STRIDE applied to the data-flow diagram (processes, stores, flows, trust boundaries); attack surface | Lec5-Sec pp.16–17 | We drew the data-flow diagram (browser → API → storage → model) and recorded one STRIDE threat and mitigation per element, as the lecture lab prescribes. |
| Risk prioritisation | Risk = likelihood × impact; treatments reduce/transfer/accept/avoid; ISO 27001:2022 Annex A mappings (8.5, 8.28, 8.14) | Lec5-Sec pp.5, 42 | We ranked risks with likelihood × impact and mapped mitigations to ISO 27001 Annex A controls, following the course's web-shop example. |
| Authentication on login / settings | Factors know/have/are; MFA (different factor types); password hashing with unique salts and slow algorithms; rate limits; passkeys; OAuth 2.0 / OpenID Connect | Lec5-Sec pp.21, 33; Lec5-Inet p.32 | Passwords are stored as salted slow hashes, login is rate-limited, and MFA is available, the identity defences the course lists. |
| Authorisation | Authentication vs authorisation; RBAC; least privilege; fail-safe defaults; server-side access checks ("never trust a hidden button") | Lec5-Sec pp.31, 33; Lec5-Inet p.32 | Roles (user, admin) are checked on the server for every request, and access is denied by default. |
| Web attack defences | SQL injection → parameterised queries; XSS → output encoding/CSP; CSRF → anti-CSRF tokens and SameSite cookies; broken access control; OWASP Top 10/ASVS | Lec5-Sec p.20, p.40; Lec5-Inet pp.23, 32; Lec3-SQL p.20, p.45 | The ORM's parameterised queries stop SQL injection, rendered text is escaped, and session cookies are HttpOnly, Secure and SameSite, following OWASP. |
| Encryption of photos and data | AES for data at rest; TLS for data in transit; SHA-2 hashing; key management; full-disk encryption; DB internal level includes encryption | Lec5-KZ p.12, p.14; Lec5-Sec pp.32, 35; Lec3-DBSys p.17 | Photos are encrypted at rest with AES and travel only over TLS, the pairing the Kazakhstan lecture prescribes, and hashes verify file integrity. |
| HTTPS configuration | TLS authenticates the server via certificates and a CA chain; HSTS; Let's Encrypt | Lec5-Inet p.24 | The deployed site uses a CA-issued TLS certificate with HSTS so browsers never downgrade to HTTP. |
| Personal data and consent (privacy page) | Law on Personal Data and Their Protection (consent, processing, protection duties for owners and operators); personal-data security guidelines Dec 2025; GDPR breach notification (comparative) | Lec5-KZ pp.3, 13; Lec5-Sec p.41; Lec4-DataMgmt p.9 | The privacy page asks for explicit consent before processing photos, because the RK Law on Personal Data places consent and protection duties on us as operator. |
| Data minimisation and retention (settings page) | Privacy pillar ("Securing the underlying data"); privacy violations via re-identification; sovereign data governance / localisation | Lec4-DataMatrix p.13; Lec4-DMViz p.33; Lec4-DataMgmt p.20 | Users can delete their photos and results in settings, and we keep only what the analysis needs, reducing re-identification risk. |
| Digital signature / document integrity | EDS process (hash → sign with private key → certificate → verify with public key); EDS legal force; NCALayer; EDS login | Lec5-KZ pp.10–11, 14 | If we export signed analysis reports, a digital signature proves integrity and authenticity but does not hide content, so it is combined with encryption. Optional for the prototype. |
| Legal grounding statement | Know applicable laws; check Adilet; Law on Informatization; Decree No. 832 (access control, logging, network protection, audit); Law on AI No. 230-VIII (syllabus only) | Lec5-KZ pp.3, 8, 15; Syl p.9 | We list the RK laws that apply and implement Decree 832's control themes (access control, logging, audit) in the backend. |
| Logging and incident response | Build logging and incident response in from day one; SIEM/SOC; incident phases; 3-2-1 backups with tested restores | Lec5-KZ pp.14–15; Lec5-Sec p.36 | The API logs security-relevant events from the first version, and the DB has a 3-2-1 backup plan with a tested restore. |
| Cloud-specific risks (if cloud model chosen) | Cloud exposure: misconfigured storage, excessive permissions, stolen tokens; supply-chain risks | Lec5-Sec pp.10, 17 | With a cloud model, API keys are kept server-side and storage buckets are private, because the course lists misconfigured storage and stolen tokens as the main cloud vectors. |
| Dependency security | Software supply chain (SolarWinds, Log4Shell); dependency scanning in CI; CVE/CVSS | Lec5-Sec pp.10, 38 | We pin and scan dependencies, since the course shows a vulnerable library can compromise an entire service. |
| Standards for AI and web | ISO/IEC JTC 1/SC 42 (AI trustworthiness, bias, lifecycle); W3C; IEEE | Lec1-ICT p.11 | We point to SC 42 for trustworthy-AI concerns (bias, lifecycle) and W3C/WCAG for the web front end. |
| AI-use documentation | AI-3 level: prompt log mandatory; declaration of tool, version, prompts, verification; CLO 7 evaluation of generative AI | Syl pp.4, 9, 3 | We kept a prompt log and declared every AI tool used, as AI-3 requires for the group project. |
| Team process at defence | Contribution log; individual question to each member | Syl pp.5–6 | Our contribution log maps each member to their part so every person can answer the individual defence question. |

Topics from the brief that modules 1–5 do **not** cover:
- Computer vision model architectures (MobileNet, VGG, ResNet, ViT) are named only in the syllabus for week 8 (Syl p.16). No module 1–5 deck teaches them.
- Classification quality metrics (accuracy, precision, recall, F1, confusion matrix) appear only in the syllabus for week 6 (Syl p.15). Modules 1–5 teach only MAE/MSE/MAPE for forecasting (Lec4-DataMgmt p.19) and association-rule metrics (support, confidence, lift) (Lec4-DMViz p.11).
- Cloud ML platforms, MLOps, Streamlit/Gradio and Docker belong to weeks 9–10 in the syllabus. In modules 1–5, Docker and Kubernetes appear only on Lec3-ModernDB p.12.
- File-upload-specific security (MIME/type checks, size limits, malware scanning of uploads) is not covered as such. The closest material is input validation, ClamAV in the toolkit, and the HTTP 4xx codes.
- The text of the Law on AI No. 230-VIII and the Digital Code No. 255-VIII is not covered beyond their citation in the syllabus data-security rule. There is no slide on biometric-data rules.
- UX design methods (personas, wireframes, A/B testing) and Gestalt principles are not covered in modules 1–5.
- CAP theorem, replication and sharding are not covered. Distributed DBs appear only as "horizontal scaling" for NoSQL/NewSQL and as Milvus being cloud-native and distributed.

---

## 4. Glossary index

- 3-2-1 backup rule: Lec5-Sec p.36
- 48×48 px touch target: Lec3-HCI p.31
- ACID (atomicity, consistency, isolation, durability): Lec3-DBSys pp.10–13
- Access control list (ACL): Lec4-DataMgmt p.12
- Accessibility (a11y), WCAG: Lec3-HCI p.37; Lec4-VizICT p.11
- AES (symmetric encryption): Lec5-Sec p.32; Lec5-KZ p.12
- AI levels AI-0…AI-4, prompt log: Syl p.9
- Anomaly detection: Lec4-DMViz p.12; Lec4-DMTasks p.8
- ANSI-SPARC three-schema architecture: Lec3-DBSys p.14
- API (software stack interface): Lec2-Arch p.68
- API management gateway: Lec2-Arch p.80
- ARIA attributes: Lec4-VizICT p.11
- ASCII / Unicode / EBCDIC: Lec2-Arch pp.7–9
- Association rule mining (support, confidence, lift): Lec4-DMViz p.11; Lec4-DMTasks p.7; Lec4-DataMatrix p.10
- Attack surface, attack vector: Lec5-Sec pp.5, 17
- Authentication vs authorisation: Lec5-Sec p.33
- B-tree index: Lec3-DBSys p.44; Lec3-SQL p.29
- Bar / line / pie / scatter chart selection: Lec4-VizBasics pp.4–7; Lec4-DMViz p.28
- BASE: Lec3-DBSys p.28
- BI vs visual analytics: Lec4-VizICT p.19; Lec4-DMViz p.29
- Box plot, histogram: Lec4-DMViz p.28
- Client-server systems: Lec2-Arch p.43
- CIA triad: Lec5-Sec pp.4, 15
- CIDR, subnet mask: Lec5-Net pp.19–20
- Classification (task): Lec4-DMViz p.8; Lec4-DMTasks p.4; Lec4-DataMatrix pp.6, 8
- Cloud computing platforms: Lec1-ICT p.6
- Clustering: Lec4-DMViz p.10; Lec4-DMTasks p.6; Lec4-DataMatrix p.9
- Column-family / wide-column DB: Lec3-DBSys p.26; Lec3-ModernDB p.3
- Cookies (SameSite, HttpOnly, Secure): Lec5-Inet p.23
- CORS, CSP, same-origin policy: Lec5-Inet pp.23, 32
- CPU vs GPU (11 comparisons): Lec2-Arch pp.26–30
- CPU vs GPU vs TPU table: Lec2-Arch p.32
- CRISP-DM: Lec4-DMViz p.14
- CSRF: Lec5-Sec p.20; Lec5-Inet p.32
- CTE (WITH clause): Lec3-SQL p.17
- CUDA / OpenCL lock-in: Lec2-Arch p.29
- Cyber Kill Chain, MITRE ATT&CK: Lec5-Sec p.22
- Data analysis types (descriptive, diagnostic, predictive, prescriptive): Lec4-DataMgmt p.5
- Data drift, data leakage: Lec4-DMViz p.19
- Data independence (logical/physical): Lec3-DBSys pp.18–19
- Data-ink ratio, chartjunk: Lec4-DMViz p.31; Lec4-VizICT p.21
- Data management (governance, architecture, quality): Lec4-DataMgmt p.4
- Data mining definition, KDD: Lec4-DMViz pp.4–5; Lec4-DataMatrix p.2
- Data representation, pixel image: Lec2-Arch pp.2, 10
- Data security rule (no personal/biometric data to external AI): Syl p.9
- Dataset partitioning (train/validation/test): Lec4-DMViz p.18
- DDL / DML / DQL: Lec3-DBSys pp.39–41
- Decision tree anatomy: Lec4-DTBig p.3; Lec4-DTDemyst p.3
- Decree No. 832: Lec5-KZ pp.3, 8
- Defence in depth, least privilege, fail-safe defaults: Lec5-Sec p.31; Lec5-KZ p.14
- DHCP, DORA: Lec5-Net pp.27–30
- Digital signature process: Lec5-KZ p.10
- DIKW pipeline: Lec4-VizICT p.4
- DNS (hierarchy, resolution, records, security): Lec5-Inet pp.11–17
- Docker / Docker Compose / Kubernetes: Lec3-ModernDB p.12
- Document database: Lec3-DBSys p.25; Lec3-ModernDB pp.3, 6
- Edge computing: Lec1-ICT pp.19, 25, 36
- EDS (electronic digital signature), NCALayer, National CA: Lec5-KZ p.11
- Encapsulation: Lec5-Net p.11
- Entropy, information gain: Lec4-DTDemyst pp.5–7; Lec4-DTBig p.4
- ETL: Lec4-DataMgmt p.11
- EXIF metadata: Lec4-DataMgmt p.12
- Explainable AI (XAI), SHAP, LIME: Lec4-VizICT p.13; Lec4-DMViz p.33
- Feature engineering: Lec4-DMViz p.17
- Fitts's Law: Lec3-HCI p.34
- Forecast accuracy metrics (MAE, MSE, MAPE): Lec4-DataMgmt p.19
- GDPR, CCPA: Lec4-DataMgmt p.9; Lec4-DMViz p.33; Lec5-Sec p.41
- Gini impurity, weighted split: Lec4-Gini1 pp.1–2; Lec4-Gini3 pp.1–2; Lec4-DTDemyst p.8; Lec4-DTBig p.4
- Gini vs entropy comparison: Lec4-DTDemyst p.9; Lec4-Gini3 p.2
- GOST / ST RK 1073 / GOST 34.310: Lec5-KZ p.12
- GPU (integrated/discrete, parallel): Lec2-Arch pp.24–25
- Graph database: Lec3-DBSys p.27; Lec3-ModernDB pp.4, 9
- Grading formula: Syl p.6
- Group project rules (team ≤ 6, contribution log, individual question): Syl pp.5–6
- GUI / WIMP: Lec3-HCI p.30; Lec2-Arch p.50
- Hashing (SHA-2), salts, slow password hashing: Lec5-Sec pp.21, 32; Lec5-KZ p.12
- Heatmap, parallel coordinates: Lec4-VizICT p.10
- Hick's Law: Lec3-HCI p.35
- Histogram-based splits, LightGBM, XGBoost, CatBoost: Lec4-DTBig pp.9–12
- HPC (high-performance computing): Lec1-ICT p.5
- HTML / CSS / JavaScript separation: Lec5-Inet p.29
- HTTP methods, safe/idempotent, status codes: Lec5-Inet p.22
- HTTP versions (0.9 to 3, QUIC): Lec5-Inet pp.19–20, 25
- HTTPS, TLS, HSTS, certificates: Lec5-Inet p.24; Lec5-Sec p.32
- Huang's Law vs Moore's Law: Lec2-Arch p.28
- Information architecture: Lec3-HCI p.36
- Integrity (domain, entity, referential): Lec3-DBSys pp.29–31; Lec3-SQL pp.25–27
- Interpretability imperative, black box: Lec4-DataMatrix p.14
- IPv4 / IPv6, private ranges, loopback, NAT: Lec5-Net pp.17–24
- ISO/IEC 27001/27002, Annex A: Lec5-Sec pp.40, 42
- ISO/IEC JTC 1/SC 42, IEEE, W3C: Lec1-ICT p.11
- Key-value store: Lec3-DBSys p.24; Lec3-ModernDB p.3
- KZ-CERT, Ministry of AI and Digital Development: Lec5-KZ p.7
- Law on Personal Data and Their Protection: Lec5-KZ pp.3, 13
- Law "On Cybersecurity" / amendment No. 256-VIII: Lec5-KZ p.4
- Law "On Informatization": Lec5-KZ pp.3, 8
- Law on AI No. 230-VIII, Digital Code No. 255-VIII: Syl pp.9, 11
- Learning outcomes CLO 1–7: Syl pp.2–3
- Malware taxonomy: Lec5-Sec pp.24–27
- Mental model, system image: Lec3-HCI p.11
- Metadata (structural, administrative, descriptive): Lec4-DataMgmt pp.12–13
- MFA, RBAC, SSO, PAM, passkeys: Lec5-Sec p.33
- Middleware, RPC, ESB: Lec2-Arch p.80
- Milvus, Pinecone, Neo4j: Lec3-ModernDB p.9
- Misleading visuals (truncated axes): Lec4-VizICT p.17
- Neural networks / deep learning trade-offs: Lec4-DMViz p.22
- NewSQL: Lec3-ModernDB p.4
- Nielsen's 10 usability heuristics: Lec3-HCI pp.13–26
- NIST CSF / SP 800-53, CIS Controls, PCI DSS: Lec5-Sec p.40
- Normal forms 1NF / 2NF / 3NF: Lec3-DBSys pp.35–37; Lec3-SQL p.24
- Normalisation, anomalies: Lec3-DBSys pp.33–34; Lec3-SQL pp.22–23
- NoSQL shift (horizontal scaling): Lec3-DBSys p.23
- Object / vector stores for unstructured data: Lec3-ModernDB p.8
- ON DELETE CASCADE / RESTRICT / SET NULL: Lec3-DBSys p.32
- ORM (mapping, migrations, lazy loading, hybrid): Lec3-SQL pp.31–50
- OS (functions, user/kernel mode, eras): Lec2-Arch pp.47–60
- OSI 7-layer model, TCP/IP 4-layer model: Lec5-Net pp.5–10
- OWASP Top 10 / ASVS: Lec5-Sec pp.20, 40; Lec5-Inet p.32
- Parameterised queries: Lec3-SQL pp.20, 45; Lec5-Sec p.20
- Personal-data security guidelines (Dec 2025): Lec5-KZ p.13
- PKI, certificate authority: Lec5-Sec p.32; Lec5-KZ pp.10–11
- Ports and sockets (80, 443, 53, 22): Lec5-Net p.14
- Pre-attentive attributes: Lec4-VizICT p.3; Lec4-DMViz p.26
- Predictive vs descriptive tasks: Lec4-DataMatrix p.5
- Primary vs secondary data collection: Lec4-DataMgmt pp.7–8
- Query optimiser, EXPLAIN: Lec3-DBSys pp.42–43; Lec3-SQL pp.20, 29
- RAG vs GraphRAG: Lec3-ModernDB pp.10–11
- Regression (task): Lec4-DMViz p.9; Lec4-DMTasks p.5; Lec4-DataMatrix p.7
- Relational model (Codd): Lec3-DBSys p.21
- REST, JSON, GraphQL, reverse proxy (nginx), CDN: Lec5-Inet p.31
- Risk = likelihood × impact: Lec5-Sec p.5
- Security classification (public … restricted/PII): Lec4-DataMgmt p.14
- Selection bias: Lec4-DataMgmt p.9
- Sensors (optical/CMOS, biometric): Lec1-ICT pp.35–38
- Sequence mining: Lec4-DMTasks p.9; Lec4-DataMatrix p.10
- SIEM, SOC, incident phases: Lec5-Sec p.36
- SIMD, multicore: Lec2-Arch p.43
- Six pillars of system design: Lec4-DataMatrix p.13
- SQL injection: Lec5-Sec p.20
- SQL clauses (SELECT, WHERE, GROUP BY, HAVING, JOIN): Lec3-SQL pp.13–16
- STRIDE: Lec5-Sec p.16
- Structured / semi-structured / unstructured data: Lec3-ModernDB pp.2, 8; Lec4-DataMgmt p.11
- SUS, NPS, usability metrics: Lec3-HCI p.27
- Sustainable Development Goals (SDG 9, 13): Lec1-ICT pp.13, 16–17
- TCP vs UDP, three-way handshake: Lec5-Net pp.12–13
- Three-schema architecture levels: Lec3-DBSys pp.14–17
- Time-series database: Lec3-ModernDB p.4
- TPU: Lec2-Arch p.31
- Transactions (BEGIN/COMMIT): Lec3-DBSys p.9; Lec3-SQL p.19
- URI / URL / URN, URI anatomy, percent-encoding: Lec5-Inet pp.6–10
- Usability engineering: Lec3-HCI p.12
- User-centred design: Lec3-HCI pp.2, 7
- User interface (input, output, navigation): Lec3-HCI pp.9–10
- Vector database, embeddings, cosine similarity: Lec3-ModernDB p.5
- Visualisation pipeline (ingestion, mapping, rendering, interaction): Lec4-DMViz p.27
- Visualisation tool architecture (data, processing, presentation): Lec4-VizICT p.5
- Von Neumann vs Harvard architecture: Lec2-Arch p.44
- Web security essentials (OAuth 2.0, OpenID Connect, XSS): Lec5-Inet p.32
- WebSocket, Server-Sent Events: Lec5-Inet p.31
- Wi-Fi standards, WPA3, CSMA/CA: Lec5-Net pp.35–36
- Wired vs wireless selection: Lec5-Net p.38
- Write-Ahead Logging (WAL): Lec3-DBSys p.13
- XR (VR, AR, MR): Lec1-ICT pp.22–23
- Zero trust: Lec5-Sec pp.11, 34
