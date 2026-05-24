import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  FileText,
  HelpCircle,
  RefreshCw,
  Plus,
  Trash2,
  History,
  Sparkles,
  ChevronDown,
  ChevronRight,
  UploadCloud,
  Check,
  BookMarked,
  Copy,
  ArrowRight,
  Flame,
  Search,
  Eye,
  Download,
  GitFork,
  CheckCircle,
  ListCollapse,
  Layers,
  MapPin,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FAQItem, SummaryResult, MindmapResult, MindmapSubtopic } from "./types";

// Masterful Sample Material written by IT Senior Expert
const SAMPLE_MATERIALS = [
  {
    title: "REST API & Clean Code - Dasar Backend",
    text: `Untuk membangun backend yang andal dan mudah dirawat, ada dua pilar utama: REST API yang didesain secara benar dan penulisan kode menggunakan prinsip Clean Code.

REST (REpresentational State Transfer) memanfaatkan metode-metode HTTP standar untuk melakukan manipulasi data (CRUD):
1. GET /api/users - Mengambil daftar seluruh pengguna.
2. POST /api/users - Membuat pengguna baru. Payload dikirim dalam format JSON di bagian request body.
3. PUT /api/users/:id - Mengupdate data pengguna secara menyeluruh berdasarkan ID.
4. DELETE /api/users/:id - Menghapus data pengguna dari server database.

Setiap HTTP Request wajib mengembalikan HTTP Status Code yang tepat guna memandu aplikasi client:
- 200 OK: Request berhasil dan mengembalikan data.
- 201 Created: Data baru berhasil dibuat di database server.
- 400 Bad Request: Request tidak valid, biasanya struktur JSON masukan salah atau ada validasi gagal.
- 401 Unauthorized: Membutuhkan login/kredensial API Key sebelum mengakses endpoint ini.
- 404 Not Found: Resource yang diminta tidak ada di system server.
- 500 Internal Server Error: Terjadi bug fatal di codebase backend.

Selain struktur API, penulisan kode wajib mematuhi panduan Clean Code demi produktivitas tim:
- DRY (Don't Repeat Yourself): Hindari duplikasi logika. Ekstrak kode berkali-kali ke dalam satu service helper modular.
- KISS (Keep It Simple, Stupid): Sederhanakan alur algoritma. Jangan mempersulit alur kerja if-else jika ada solusi bawaan framework yang dinamis.
- Self-Documenting Code: Pilih nama variabel dan fungsi yang menjelaskan tujuannya secara literal (misal: "calculateDiscounts" bukan "calcDsc").`
  },
  {
    title: "Sistem Kerja Database SQL vs NoSQL",
    text: `Database merupakan jantung dari setiap aplikasi web modern. Di industri IT, database terbagi menjadi dua paradigma besar: SQL (Relational) dan NoSQL (Non-Relational/Document).

Database SQL (Relational Database Management System - RDBMS) menggunakan tabel, baris, dan kolom untuk menstrukturkan data. Contoh terkenalnya adalah PostgreSQL, MySQL, dan SQLite.
Karakteristik penting SQL:
- Skema data kaku dan terdefinisi di awal (DBMS schema). Perubahan struktur harus melalui migrasi DDL (Data Definition Language).
- Menjamin integritas ACID (Atomicity, Consistency, Isolation, Durability) secara ketat, wajib digunakan untuk aplikasi perbankan atau pembukuan finansial.
- Relasi antar tabel terhubung menggunakan Foreign Key, dan query pencarian digabungkan menggunakan sintaks JOIN.

Database NoSQL menyimpan data dalam format dokumen semi-terstruktur mirip JSON (BSON). Contoh terkenalnya adalah MongoDB, Firebase Firestore, dan Cassandra.
Karakteristik penting NoSQL:
- Skema fleksibel (Schema-less). Setiap dokumen dalam satu database collection bisa memiliki struktur field yang berbeda-beda.
- Skalabilitas mendatar (Horizontal scaling) yang luar biasa cepat, mempermudah perluasan kapasitas database ke banyak server klaster cloud secara dinamis.
- Tidak berfokus pada JOIN yang mahal, melainkan menyimpan data terkait dalam satu dokumen yang sama (denormalized data) untuk kecepatan baca puncak.`
  },
  {
    title: "Prinsip Dasar Cyber Security & Kriptografi",
    text: `Keamanan siber (Cyber Security) adalah disiplin ilmu melindungi server, jaringan, program komputer, serta data berharga dari ancaman serangan siber ilegal. Ada tiga pilar utama keamanan informasi yang dikenal dengan istilah CIA Triad:
1. Confidentiality (Kerahasiaan): Memastikan data hanya bisa diakses oleh pihak berwenang melalui enkripsi dan kontrol otentikasi ketat.
2. Integrity (Integritas): Menjamin informasi tidak diubah secara ilegal selama pengiriman atau penyimpanan dengan menggunakan fungsi hash digital.
3. Availability (Ketersediaan): Menjamin sistem dan data selalu siap diakses kapanpun pengguna butuh dengan menerapkan proteksi antibencana dan pencegahan DDoS.

Kriptografi adalah teknologi utama untuk menerapkan CIA Triad tersebut. Berdasarkan model kuncinya, enkripsi dibagi menjadi dua tipe:
- Enkripsi Simetris (Symmetric Encryption): Menggunakan satu kunci rahasia yang sama untuk proses membobol sandi (dekripsi) dan menyandikan teks (enkripsi). Sangat cepat tetapi sulit mempercayakan distribusi kuncinya dengan aman. Contoh: AES (Advanced Encryption Standard).
- Enkripsi Asimetris (Asymmetric Encryption): Menggunakan sepasang kunci terpisah, yaitu Public Key yang disebarkan luas untuk menyandikan data, dan Private Key yang dirahasiakan pemilik untuk membongkar sandi tersebut. Contoh: algoritma RSA dan ECC.`
  }
];

interface HistoryItem {
  id: string;
  timestamp: string;
  title: string;
  manualText: string;
  summary: SummaryResult | null;
  mindmap: MindmapResult | null;
}

export default function App() {
  const [manualText, setManualText] = useState<string>("");
  const [fileData, setFileData] = useState<{
    base64: string;
    mimeType: string;
    fileName: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // App running states
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isLoadingMindmap, setIsLoadingMindmap] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab control
  const [activeTab, setActiveTab] = useState<"summary" | "mindmap">("summary");

  // Output states
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [mindmapResult, setMindmapResult] = useState<MindmapResult | null>(null);

  // Mindmap Visual Interaction States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [highlightedSubtopic, setHighlightedSubtopic] = useState<string | null>(null);
  const [mindmapViewStyle, setMindmapViewStyle] = useState<"visual-tree" | "bento-flow">("visual-tree");

  // Interactive dynamic items
  const [faqOpenState, setFaqOpenState] = useState<Record<number, boolean>>({});
  const [actionItemsChecked, setActionItemsChecked] = useState<Record<number, boolean>>({});
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [copiedTextSuccess, setCopiedTextSuccess] = useState<boolean>(false);

  // History State
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // Refs for auto scrolling to result
  const resultRef = useRef<HTMLDivElement | null>(null);

  // Tips and humorous loading messages from a Master Dev
  const loadingTips = [
    "Menyandikan silsilah konsep materi...",
    "Merakit pohon hierarki Topik -> Sub-topik -> Detail...",
    "Memetakan relasi modular antar data pelajaran...",
    "Bypassing stack overflows untuk menyusun peta pikiran...",
    "Mengompresi data teks tebal menjadi kotak-kotak bagan interaktif...",
    "Menyamakan visualisasi bento dan jaring laba-laba relasi...",
    "Membuat ringkasan terstruktur dengan Standard Kompetensi IT..."
  ];
  const [loadingTipIndex, setLoadingTipIndex] = useState<number>(0);

  // Interval for rotating loading tips
  useEffect(() => {
    let interval: any;
    if (isLoadingSummary || isLoadingMindmap) {
      interval = setInterval(() => {
        setLoadingTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoadingSummary, isLoadingMindmap]);

  // Load history from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem("ai_study_history");
    if (cached) {
      try {
        setHistoryList(JSON.parse(cached));
      } catch (e) {
        console.error("Gagal memuat histori studi", e);
      }
    }
  }, []);

  // Sync checklist states when a summary result is loaded
  useEffect(() => {
    if (summaryResult) {
      const initialChecked: Record<number, boolean> = {};
      summaryResult.actionItems.forEach((_, idx) => {
        initialChecked[idx] = false;
      });
      setActionItemsChecked(initialChecked);

      const initialFaqs: Record<number, boolean> = {};
      summaryResult.faqs.forEach((_, idx) => {
        initialFaqs[idx] = idx === 0; // open first FAQ by default
      });
      setFaqOpenState(initialFaqs);
    }
  }, [summaryResult]);

  // Helper file uploader reader
  const handleFile = (file: File) => {
    setIsFileLoading(true);
    setSelectedFile(file);
    setErrorMsg(null);

    const reader = new FileReader();

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isText = file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md");

    if (isPdf) {
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setFileData({
          base64: dataUrl,
          mimeType: "application/pdf",
          fileName: file.name
        });
        setIsFileLoading(false);
      };
      reader.readAsDataURL(file);
    } else if (isText) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setManualText(text);
        setFileData(null); // Clear file data since text is placed in editor
        setIsFileLoading(false);
      };
      reader.readAsText(file);
    } else {
      // General attempt to read as text for csv, json, md etc
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setManualText(text);
        setFileData(null);
        setIsFileLoading(false);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileData(null);
  };

  // Pre-load a sample material
  const loadSample = (index: number) => {
    const sample = SAMPLE_MATERIALS[index];
    setManualText(sample.text);
    clearFile();
    setErrorMsg(null);
  };

  // API Call - Summarizer
  const executeSummarize = async () => {
    if (!manualText.trim() && !fileData) {
      setErrorMsg("Harap masukkan teks materi atau unduh/unggah file dokumen terlebih dahulu!");
      return;
    }

    setIsLoadingSummary(true);
    setErrorMsg(null);
    setSummaryResult(null);
    setActiveTab("summary");

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: manualText,
          fileBase64: fileData?.base64,
          mimeType: fileData?.mimeType,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal menghubungi server untuk membuat ringkasan.");
      }

      const data: SummaryResult = await response.json();
      setSummaryResult(data);

      // Save to history list
      saveHistory(data.title, manualText, data, mindmapResult);

      // Scroll smoothly to output
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);

    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Gagal membuat ringkasan. Silakan cek koneksi API Key Anda.");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // API Call - Mindmap Generator
  const executeGenerateMindmap = async () => {
    if (!manualText.trim() && !fileData) {
      setErrorMsg("Harap masukkan teks materi atau unggah file dokumen terlebih dahulu!");
      return;
    }

    setIsLoadingMindmap(true);
    setErrorMsg(null);
    setMindmapResult(null);
    setCollapsedNodes({});
    setActiveTab("mindmap");

    try {
      const response = await fetch("/api/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: manualText,
          fileBase64: fileData?.base64,
          mimeType: fileData?.mimeType,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal menghubungi server untuk membuat kuis kustom.");
      }

      const data: MindmapResult = await response.json();
      setMindmapResult(data);

      // Save to history list
      saveHistory(data.topic, manualText, summaryResult, data);

      // Scroll smoothly to output
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);

    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Gagal membangun peta konsep mindmap. Pastikan teks mencukupi.");
    } finally {
      setIsLoadingMindmap(false);
    }
  };

  // Dual Function - Run Both Summarize and Mindmap representation
  const executeAll = async () => {
    if (!manualText.trim() && !fileData) {
      setErrorMsg("Harap masukkan teks materi atau unggah file dokumen terlebih dahulu!");
      return;
    }

    setErrorMsg(null);
    setIsLoadingSummary(true);
    setIsLoadingMindmap(true);
    setSummaryResult(null);
    setMindmapResult(null);
    setCollapsedNodes({});
    setActiveTab("summary");

    try {
      const [sumResResponse, mindResResponse] = await Promise.all([
        fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: manualText,
            fileBase64: fileData?.base64,
            mimeType: fileData?.mimeType,
          }),
        }),
        fetch("/api/mindmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: manualText,
            fileBase64: fileData?.base64,
            mimeType: fileData?.mimeType,
          }),
        })
      ]);

      let sumData: SummaryResult | null = null;
      let mndData: MindmapResult | null = null;

      if (sumResResponse.ok) {
        sumData = await sumResResponse.json();
        setSummaryResult(sumData);
      } else {
        const errData = await sumResResponse.json().catch(() => ({}));
        throw new Error(`Ringkasan Error: ${errData.error || "Koneksi summarizer gagal."}`);
      }

      if (mindResResponse.ok) {
        mndData = await mindResResponse.json();
        setMindmapResult(mndData);
      } else {
        const errData = await mindResResponse.json().catch(() => ({}));
        throw new Error(`Mindmap Error: ${errData.error || "Koneksi mindmap generator gagal."}`);
      }

      // Add to history
      saveHistory(
        sumData ? sumData.title : mndData ? mndData.topic : "Studi Peta Pikiran",
        manualText,
        sumData,
        mndData
      );

      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);

    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Gagal memproses parallel request.");
    } finally {
      setIsLoadingSummary(false);
      setIsLoadingMindmap(false);
    }
  };

  // Local Storage Save History
  const saveHistory = (
    title: string,
    rawText: string,
    sum: SummaryResult | null,
    mnd: MindmapResult | null
  ) => {
    const newEntry: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short"
      }),
      title: title || "Konsep AI Peta Konsep",
      manualText: rawText,
      summary: sum,
      mindmap: mnd
    };

    setHistoryList((prev) => {
      const filterTitle = title || "Konsep AI Peta Konsep";
      const updated = [newEntry, ...prev.filter((item) => item.title !== filterTitle)].slice(0, 10);
      localStorage.setItem("ai_study_history", JSON.stringify(updated));
      return updated;
    });
  };

  // Load an item from History
  const loadHistoryItem = (item: HistoryItem) => {
    setManualText(item.manualText);
    clearFile();
    setSummaryResult(item.summary);
    setMindmapResult(item.mindmap);
    setCollapsedNodes({});

    if (item.summary) {
      setActiveTab("summary");
    } else if (item.mindmap) {
      setActiveTab("mindmap");
    }

    setErrorMsg(null);

    // Smooth scroll down to result
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 400);
  };

  // Delete a history item
  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistoryList((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("ai_study_history", JSON.stringify(updated));
      return updated;
    });
  };

  // Clear all histories
  const clearAllHistory = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat belajar lokal?")) {
      setHistoryList([]);
      localStorage.removeItem("ai_study_history");
    }
  };

  // Copy Summary text to Clipboard
  const copySummaryToClipboard = () => {
    if (!summaryResult) return;
    const bulletList = summaryResult.keyPoints.map((pt) => `• ${pt}`).join("\n");
    const faqList = summaryResult.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
    
    const textToCopy = `===== ${summaryResult.title.toUpperCase()} =====\n\nRINGKASAN:\n${summaryResult.summary}\n\nPOIN UTAMA:\n${bulletList}\n\nTANYA JAWAB KLINIS BELAJAR:\n${faqList}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    });
  };

  // Copy Mindmap Text tree to Clipboard
  const copyMindmapToClipboard = () => {
    if (!mindmapResult) return;
    let treeStr = `[TOPIC]: ${mindmapResult.topic.toUpperCase()}\n`;
    mindmapResult.subtopics.forEach((sub, i) => {
      treeStr += ` ├── [SUBTOPIC ${i+1}]: ${sub.title.toUpperCase()}\n`;
      sub.points.forEach((point) => {
        treeStr += `      └── ${point}\n`;
      });
    });

    navigator.clipboard.writeText(treeStr).then(() => {
      setCopiedTextSuccess(true);
      setTimeout(() => setCopiedTextSuccess(false), 2000);
    });
  };

  // Toggle Collapse Mindmap subtopic nodes
  const toggleCollapseNode = (title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedNodes(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Check if mindmap nodes contain search input
  const matchesSearch = (text: string) => {
    if (!searchQuery) return false;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-[#FFD100] text-black p-4 md:p-8 font-sans selection:bg-black selection:text-[#FFD100]">
      {/* Container wrapper for Neo-Brutalist Layout */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER HERO BANNER - PREMIUM NEO-BRUTALIST */}
        <header className="relative bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-12 translate-y-2">
            <GitFork size={280} className="text-black transform -rotate-12" />
          </div>
          
          <div className="space-y-3 z-10 text-left">
            <div className="inline-flex items-center gap-2 bg-black text-[#FFD100] px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Flame size={14} className="text-[#FFD100] animate-pulse" /> STUDENT_MODE // NEO-BRUTALIST ARCHITECT v1.5
            </div>
            
            <h1 className="text-4xl md:text-5xl font-sans font-black tracking-tight text-black flex flex-wrap items-center gap-2">
              <span>STUDY.AI // </span>
              <span className="bg-[#FF90E8] text-black px-3 py-1 border-3 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase">
                MINDMAPPER
              </span>
            </h1>
            
            <p className="text-sm md:text-base font-bold text-black max-w-2xl leading-relaxed">
              Konverter visual pelajaran bertenaga kecerdasan buatan. Mengubah file PDF tebal, dokumen teks kuliah kaku, maupun tulisan lepas menjadi <strong>Ringkasan Terstruktur Dokumen</strong> dan <strong>Bagan Peta Pikiran Interaktif</strong> demi pemahaman materi super cepat.
            </p>
          </div>

          <div className="flex shrink-0 w-full md:w-auto z-10">
            <div className="bg-[#33D6A6] border-4 border-black p-4 text-center sm:text-left shadow-[5px_5px_0px_rgba(0,0,0,1)] w-full font-mono">
              <div className="text-xs text-black uppercase font-black tracking-wider">ENGINE_STATUS:</div>
              <div className="font-extrabold text-sm text-black uppercase flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <Sparkles size={16} className="text-[#FF90E8] animate-bounce" /> ACTIVE // GEMINI_3.5_FLASH
              </div>
            </div>
          </div>
        </header>

        {/* STUDY CONTROLS GRID */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT AREA: UPLOAD & TEXT EDITOR INPUT (Col 7) */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* FILE UPLOAD & TEXT AREA COMPONENT */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
              <div className="absolute top-[-18px] left-5 bg-[#FF90E8] text-black px-3 py-1 font-sans font-black border-3 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs uppercase">
                01 // DOKUMEN & MATERI PEMBELAJARAN
              </div>

              {/* Sample Quick-Starter Sticks */}
              <div className="mb-5 mt-3 text-left">
                <span className="block text-xs font-mono font-black uppercase text-[#888] mb-2">
                  MUAT CONTAK STUDI KASUS IT & CYBERSECURITY:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_MATERIALS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadSample(idx)}
                      className="px-3 py-1.5 bg-white border-2 border-black text-xs font-bold hover:bg-[#FFD100] active:translate-y-0.5 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 leading-normal text-left"
                    >
                      <BookMarked size={12} className="shrink-0 text-[#FF90E8]" /> {sample.title.split(" - ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag n Drop Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-4 border-dashed border-black bg-[#fafafa] p-4 md:p-6 text-center transition-all relative ${
                  selectedFile ? "bg-[#33D6A6]/10 border-[#33D6A6]" : "hover:bg-[#FFD100]/10"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {isFileLoading ? (
                  <div className="py-4 flex flex-col items-center gap-2">
                    <RefreshCw className="animate-spin text-black" size={32} />
                    <span className="font-mono text-xs font-extrabold leading-none uppercase">Mengekstrak Meta-Dokumen...</span>
                  </div>
                ) : selectedFile ? (
                  <div className="flex flex-col items-center py-2">
                    <FileText className="text-black mb-2 animate-bounce" size={40} />
                    <p className="font-sans font-black text-sm text-black max-w-md truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs font-mono text-gray-500 mt-0.5 font-bold">
                      ({(selectedFile.size / 1024).toFixed(1)} KB) • FILE SIAP DIKONVERSI AI
                    </p>
                    <button
                      onClick={clearFile}
                      className="mt-3 px-3 py-1.5 bg-[#FFD100] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      CLEAR_FILE.EXE
                    </button>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center py-3">
                    <UploadCloud className="text-black mb-2 hover:scale-110 transition-transform hover:text-[#FF90E8]" size={48} />
                    <span className="font-sans font-black text-sm uppercase text-black hover:underline tracking-tight">
                      DROP_DOCUMENT_HERE.PDF (ATAU KLIK UNTUK IMPORT)
                    </span>
                    <span className="text-xs font-mono text-gray-500 mt-1 font-bold">
                      Menerima dokumen PDF aseli / plain .TXT, .MD
                    </span>
                  </label>
                )}
              </div>

              {/* Separator */}
              <div className="relative my-6 text-center">
                <hr className="border-t-3 border-black" />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 font-mono text-xs font-black uppercase text-gray-400">
                  INPUT_LOGIC_FIELD_MANUAL
                </span>
              </div>

              {/* Manual Input Area */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <label className="font-mono font-black text-xs uppercase text-black block">
                    Salin & Tempel Text Materi Kuliah:
                  </label>
                  {manualText && (
                    <span className="font-mono text-[10px] bg-black text-[#FFD100] px-1.5 py-0.5 border border-black font-bold">
                      SIZE: {manualText.length} CHARS
                    </span>
                  )}
                </div>
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Ketik materi, artikel, paper ilmiah, kode program atau catatan secara acak di sini..."
                  rows={9}
                  className="w-full bg-[#fafafa] text-black p-3 border-4 border-black focus:outline-none focus:bg-white font-mono text-xs shadow-inner leading-relaxed resize-y"
                ></textarea>
              </div>

              {/* ACTION EXECUTE BUTTONS - TRUE BRUTALIST */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                
                <button
                  onClick={executeSummarize}
                  disabled={isLoadingSummary || isFileLoading}
                  className="px-4 py-3 bg-[#FF90E8] text-black border-3 border-black font-sans font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> 1. Buat Ringkasan
                </button>

                <button
                  onClick={executeGenerateMindmap}
                  disabled={isLoadingMindmap || isFileLoading}
                  className="px-4 py-3 bg-[#33D6A6] text-black border-3 border-black font-sans font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                >
                  <GitFork size={16} /> 2. Generate Mindmap
                </button>

                <button
                  onClick={executeAll}
                  disabled={isLoadingSummary || isLoadingMindmap || isFileLoading}
                  className="px-4 py-3 bg-black text-white border-3 border-black font-sans font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} className="text-[#FFD100]" /> Jalankan Semua
                </button>

              </div>
            </div>

            {/* ERROR CARD */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FF90E8] text-black border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden text-left"
              >
                <div className="absolute right-2 top-2 opacity-20">
                  <Flame size={64} />
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-black text-[#FFD100] p-1.5 border border-black font-mono font-bold text-xs shrink-0">FAIL</div>
                  <div>
                    <h4 className="font-sans font-black text-sm uppercase">ERROR_LOG: PARSING FAIL</h4>
                    <p className="text-xs font-mono mt-1 leading-relaxed">{errorMsg}</p>
                    <div className="mt-3">
                      <span className="text-[10px] font-mono font-bold bg-black text-[#FFD100] px-2 py-1">
                        CHECK_GEMINI_API_KEY_VARIABLES
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* METHODOLOGY OF ACTIVE RECALL */}
            <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left">
              <div className="flex items-start gap-3">
                <Flame className="text-[#FF90E8] shrink-0 mt-0.5 animate-pulse" size={24} />
                <div>
                  <h4 className="font-sans font-black text-xs uppercase tracking-wide">METODE MEMORI JANGKA PANJANG (SPACED RECALL):</h4>
                  <p className="text-xs text-gray-700 leading-relaxed mt-1">
                    Visualisasi spasial lewat peta konsep (mindmap) meningkatkan daya simpan otak hingga 70%. Gunakan tab 
                    <strong> 1. Ringkasan Dokumen</strong> untuk pemahaman teoretis yang cepat, lalu beralih ke 
                    <strong> 2. Mindmap Bagan Konseptual</strong> untuk memetakan hubungan hierarki secara visual.
                  </p>
                </div>
              </div>
            </div>

          </section>

          {/* RIGHT AREA: STUDY HISTORY (Col 5) */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* HISTORY LIST CONTAINER */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
              <div className="absolute top-[-18px] left-5 bg-[#33D6A6] text-black px-3 py-1 font-sans font-black border-3 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs uppercase">
                RIWAYAT LOKAL ({historyList.length})
              </div>

              {historyList.length === 0 ? (
                <div className="text-center py-10 text-slate-500 space-y-2">
                  <History className="mx-auto text-gray-300" size={32} />
                  <p className="font-mono text-xs font-bold uppercase text-gray-400">DATABASE_EMPTY // NO_RECORDS</p>
                  <p className="text-[11px] text-gray-400">Arsip belajar baru akan terekam otomatis di local penyimpanan.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 text-left">
                  <div className="flex justify-between items-center pb-2 border-b-2 border-black">
                    <span className="font-mono text-[10px] text-gray-400 uppercase font-black">DAFTAR ARSIP CONCEPT-MAPS</span>
                    <button
                      onClick={clearAllHistory}
                      className="text-xs text-[#FF90E8] hover:underline font-black flex items-center gap-1 font-mono"
                    >
                      <Trash2 size={12} /> HAPUS_SEMUA
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {historyList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => loadHistoryItem(item)}
                        className="p-3 bg-white hover:bg-[#FFD100]/25 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-between gap-3 text-left group"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-[9px] bg-black text-[#FFD100] px-1 py-0.5 uppercase font-bold mr-2">
                            {item.timestamp}
                          </span>
                          <h4 className="font-sans font-black text-xs truncate text-black mt-1 leading-normal group-hover:underline">
                            {item.title}
                          </h4>
                          <div className="flex gap-2 mt-1">
                            {item.summary && (
                              <span className="text-[9px] font-mono bg-[#FF90E8]/40 border border-black px-1 font-bold">
                                Ringkasan
                              </span>
                            )}
                            {item.mindmap && (
                              <span className="text-[9px] font-mono bg-[#33D6A6]/40 border border-black px-1 font-bold">
                                Mindmap ({item.mindmap.subtopics.length} Nodes)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1 items-center">
                          <ArrowRight size={14} className="text-black group-hover:translate-x-1 transition-transform" />
                          <button
                            onClick={(e) => deleteHistoryItem(item.id, e)}
                            className="p-1 text-gray-400 hover:text-[#FF90E8] hover:bg-white border hover:border-black transition-colors"
                            title="Hapus item"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* MINDMAP HIERARCHY TUTORIAL LIST */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative text-left">
              <div className="absolute top-[-18px] left-5 bg-black text-white px-3 py-1 font-sans font-black border-3 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs uppercase">
                ARSITEKTUR FITUR
              </div>

              <ul className="space-y-4 pt-2">
                <li className="flex gap-3">
                  <div className="bg-[#FFD100] text-black shrink-0 w-6 h-6 border-2 border-black flex items-center justify-center font-mono text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    1
                  </div>
                  <div>
                    <h5 className="font-sans font-black text-xs uppercase leading-tight">AI PDF Structured Summarizer</h5>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      Mengekstrak data mentah atau digital PDF menggunakan Gemini, menghasilkan ringkasan visual, poin-poin pokok materi, rencana tindak lanjut mandiri, dan integrasi FAQ.
                    </p>
                  </div>
                </li>

                <li className="flex gap-3">
                  <div className="bg-[#FF90E8] text-black shrink-0 w-6 h-6 border-2 border-black flex items-center justify-center font-mono text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    2
                  </div>
                  <div>
                    <h5 className="font-sans font-black text-xs uppercase leading-tight">AI Mindmap Text Generator</h5>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      Mengonversi materi teks yang panjang menjadi peta konsep visual terstruktur. AI menghasilkan output hierarki seperti Topik Utama -&gt; Sub-topik -&gt; Poin Detail, yang dirender menjadi kotak-kotak bagan terhubung secara visual.
                    </p>
                  </div>
                </li>

                <li className="flex gap-3">
                  <div className="bg-[#33D6A6] text-black shrink-0 w-6 h-6 border-2 border-black flex items-center justify-center font-mono text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    3
                  </div>
                  <div>
                    <h5 className="font-sans font-black text-xs uppercase leading-tight">Visual Connector Lines & Collapsed Modes</h5>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      Lengkap dengan garis hubung SVG, collapse/expand cabang sub-topik, penyaringan pencarian node interaktif, serta ekspor format diagram pohon teks ASCII.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

          </section>
        </main>

        {/* LOADING BOX COMPONENT */}
        <AnimatePresence>
          {(isLoadingSummary || isLoadingMindmap) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border-4 border-black p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#FF90E8] via-[#FFD100] to-[#33D6A6]"></div>
              
              <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
                <div className="relative">
                  <RefreshCw className="animate-spin text-black" size={48} />
                  <Sparkles size={20} className="absolute -top-1 -right-1 text-[#FF90E8] animate-ping" />
                </div>
                
                <h3 className="font-sans font-black text-xl uppercase tracking-wider text-black">
                  SEDANG MERAKIT MATERI AKADEMIK ANDA...
                </h3>
                
                <p className="font-mono text-xs text-black bg-[#FFD100]/20 border-2 border-dashed border-black px-4 py-2 max-w-lg mt-1 italic animate-pulse">
                  &ldquo;{loadingTips[loadingTipIndex]}&rdquo;
                </p>

                <p className="text-xs text-gray-600 font-bold uppercase tracking-tight max-w-md font-mono">
                  PROSES REQUEST GENERATION KUALITATIF MODEL INDONESIA
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OUTPUT AREA COMPONENT ScrollTarget */}
        <div ref={resultRef} className="scroll-mt-6">
          <AnimatePresence>
            {(summaryResult || mindmapResult) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
              >
                {/* Visual Tab Row */}
                <div className="bg-black text-white flex border-b-4 border-black">
                  
                  <button
                    onClick={() => setActiveTab("summary")}
                    className={`flex-1 py-4 px-6 text-xs sm:text-sm font-sans font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-r-3 border-black text-center ${
                      activeTab === "summary"
                        ? "bg-white text-black underline decoration-4 decoration-[#FFD100] underline-offset-4"
                        : "bg-[#1A1A1A] text-gray-400 hover:text-white"
                    }`}
                  >
                    <BookOpen size={18} /> 1_SUMMARIZER_RESULT
                    {summaryResult && (
                      <span className="text-[9px] font-mono bg-[#FF90E8] text-black font-black px-1 py-0.5 border border-black shrink-0 hidden sm:inline ml-1">
                        READY
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("mindmap")}
                    className={`flex-1 py-4 px-6 text-xs sm:text-sm font-sans font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-center ${
                      activeTab === "mindmap"
                        ? "bg-white text-black underline decoration-4 decoration-[#33D6A6] underline-offset-4"
                        : "bg-[#1A1A1A] text-gray-400 hover:text-white"
                    }`}
                  >
                    <GitFork size={18} /> 2_MINDMAP_GENERATOR
                    {mindmapResult && (
                      <span className="text-[9px] font-mono bg-[#33D6A6] text-black font-black px-1 py-0.5 border border-black shrink-0 hidden sm:inline ml-1">
                        READY
                      </span>
                    )}
                  </button>

                </div>

                {/* Tab Contents Frame */}
                <div className="p-4 sm:p-6 bg-white">
                  
                  {/* TAB 1: SUMMARIZER RESULTS */}
                  {activeTab === "summary" && (
                    <div className="space-y-6">
                      {summaryResult ? (
                        <>
                          {/* Header Summary Info */}
                          <div className="p-4 bg-[#FFD100] text-black border-3 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                            <div className="space-y-1">
                              <span className="font-mono text-[9px] bg-black text-[#FFD100] px-1.5 py-0.5 font-black uppercase">
                                HASIL RINGKASAN KONSEP UTAMA
                              </span>
                              <h2 className="text-xl md:text-2xl font-sans font-black uppercase tracking-tight">
                                {summaryResult.title}
                              </h2>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={copySummaryToClipboard}
                                className="px-3 py-1.5 bg-white text-black border-2 border-black text-xs font-black font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5 leading-normal"
                              >
                                {copiedSuccess ? (
                                  <>
                                    <Check size={14} className="text-[#33D6A6] animate-bounce" /> Tersalin!
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} /> Salin Ringkasan
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Grid Bento Content */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                            
                            {/* General Summary Card (Col 7) */}
                            <div className="md:col-span-7 bg-white border-3 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
                              <h3 className="font-sans font-black text-xs uppercase bg-black text-white inline-block px-2.5 py-1">
                                Intisari Pembahasan (General Summary)
                              </h3>
                              <p className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line font-medium">
                                {summaryResult.summary}
                              </p>
                              
                              <hr className="border-t-3 border-black border-dashed" />
                              
                              <div className="space-y-3">
                                <h4 className="font-sans font-black text-xs uppercase text-black">
                                  TERMINOLOGI & POIN-POIN POKOK MATERI (KEY POINTS):
                                </h4>
                                <ul className="space-y-2.5">
                                  {summaryResult.keyPoints.map((point, index) => (
                                    <li key={index} className="flex gap-2.5 text-xs text-slate-800 items-start">
                                      <span className="bg-[#FFD100] text-black border-2 border-black font-black shrink-0 text-[10px] w-6 h-6 flex items-center justify-center font-mono shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                        {index + 1}
                                      </span>
                                      <span className="leading-relaxed font-semibold">{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Right Columns: Rencana Tindakan (Action Items) & FAQ list (Col 5) */}
                            <div className="md:col-span-5 space-y-6">
                              
                              {/* Todolist Checkbox Widget */}
                              <div className="bg-[#fafafa] border-3 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                <h3 className="font-sans font-black text-xs uppercase bg-[#FF90E8] text-black inline-block px-2.5 py-1 mb-3">
                                  Daftar Rencana Tindakan Belajar
                                </h3>
                                <p className="text-[11px] text-gray-600 mb-3 font-mono font-bold">
                                  Centang butir di bawah jika Anda sudah memahami dasar teorinya:
                                </p>
                                
                                <div className="space-y-2.5">
                                  {summaryResult.actionItems.map((item, index) => {
                                    const isChecked = actionItemsChecked[index] || false;
                                    return (
                                      <div
                                        key={index}
                                        onClick={() =>
                                          setActionItemsChecked((prev) => ({
                                            ...prev,
                                            [index]: !isChecked
                                          }))
                                        }
                                        className={`p-3 border-2 border-black flex items-start gap-2.5 cursor-pointer hover:bg-white transition-colors ${
                                          isChecked ? "bg-[#33D6A6]/20 line-through text-gray-500" : "bg-white"
                                        }`}
                                      >
                                        <div
                                          className={`shrink-0 border-2 border-black w-5 h-5 mt-0.5 flex items-center justify-center transition-all ${
                                            isChecked ? "bg-[#33D6A6]" : "bg-white"
                                          }`}
                                        >
                                          {isChecked && <Check size={14} className="text-black font-bold" />}
                                        </div>
                                        <span className="text-xs font-bold leading-relaxed">{item}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Interactive Q&A (FAQ Accordion) */}
                              <div className="bg-white border-3 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
                                <h3 className="font-sans font-black text-xs uppercase bg-[#33D6A6] text-black inline-block px-2.5 py-1">
                                  Tanya Jawab Pemahaman (FAQs)
                                </h3>
                                
                                <div className="space-y-2 pt-1">
                                  {summaryResult.faqs.map((faq, index) => {
                                    const isOpen = faqOpenState[index] || false;
                                    return (
                                      <div key={index} className="border-2 border-black overflow-hidden">
                                        <button
                                          onClick={() =>
                                            setFaqOpenState((prev) => ({
                                              ...prev,
                                              [index]: !isOpen
                                            }))
                                          }
                                          className="w-full bg-[#fafafa] p-3 text-left font-sans font-black text-xs flex items-center justify-between gap-2 border-b-2 border-black hover:bg-[#FFD100]/25 transition-colors focus:outline-none"
                                        >
                                          <span className="leading-normal">{faq.question}</span>
                                          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                        {isOpen && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="p-3 bg-white text-xs text-slate-800 leading-relaxed font-sans font-medium"
                                          >
                                            {faq.answer}
                                          </motion.div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 bg-[#fafafa] border-2 border-dashed border-black text-left">
                          <BookOpen className="mx-auto text-slate-400 mb-2" size={40} />
                          <h4 className="font-sans font-black text-md uppercase">Belum ada hasil ringkasan</h4>
                          <p className="text-xs font-mono text-gray-500 max-w-sm mx-auto mt-1">
                            Tekan tombol <strong className="text-black bg-[#FF90E8] px-1">1. Buat Ringkasan</strong> di kolom atas untuk menganalisis dokumen menggunakan AI.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: AI MINDMAP TEXT GENERATOR & HIERARCHY BAGAN */}
                  {activeTab === "mindmap" && (
                    <div className="space-y-6">
                      {mindmapResult ? (
                        <>
                          {/* Mindmap Interactive Header Panel */}
                          <div className="p-4 bg-[#33D6A6] text-black border-3 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                            <div className="space-y-1">
                              <span className="font-mono text-[9px] bg-black text-[#33D6A6] px-1.5 py-0.5 font-black uppercase">
                                ARSIP PETA KONSEP DIAGRAM // NEO-BRUTALIST
                              </span>
                              <h2 className="text-xl md:text-2xl font-sans font-black uppercase tracking-tight">
                                {mindmapResult.topic}
                              </h2>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 items-center">
                              {/* Display View Choices */}
                              <div className="flex bg-black p-1 border border-black gap-1 shrink-0">
                                <button
                                  onClick={() => setMindmapViewStyle("visual-tree")}
                                  className={`px-3 py-1 font-mono text-[10px] font-black uppercase flex items-center gap-1 ${
                                    mindmapViewStyle === "visual-tree"
                                      ? "bg-[#FFD100] text-black"
                                      : "text-gray-400 hover:text-white"
                                  }`}
                                >
                                  <Layers size={11} /> 2D_COSMIC_TREE
                                </button>
                                <button
                                  onClick={() => setMindmapViewStyle("bento-flow")}
                                  className={`px-3 py-1 font-mono text-[10px] font-black uppercase flex items-center gap-1 ${
                                    mindmapViewStyle === "bento-flow"
                                      ? "bg-[#FFD100] text-black"
                                      : "text-gray-400 hover:text-white"
                                  }`}
                                >
                                  <ChevronRight size={11} /> BENTO_FLOW_COL
                                </button>
                              </div>

                              <button
                                onClick={copyMindmapToClipboard}
                                className="px-3 py-1.5 bg-white text-black border-2 border-black text-xs font-black font-mono shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-1.5 leading-normal shrink-0"
                              >
                                {copiedTextSuccess ? (
                                  <>
                                    <Check size={14} className="text-[#33D6A6] animate-bounce" /> Tersalin!
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} /> EXPORT_ASCII_PETA
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Search Query inside Mindmap */}
                          <div className="p-3 bg-white border-3 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-3">
                            <Search size={18} className="text-black shrink-0" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Ketik kata kunci untuk menandai dan mencari poin node di dalam bagan mindmap..."
                              className="w-full bg-[#fafafa] border-2 border-black p-2 font-mono text-xs focus:outline-none focus:bg-white text-black font-bold uppercase"
                            />
                            {searchQuery && (
                              <button
                                onClick={() => setSearchQuery("")}
                                className="text-xs font-mono font-black text-[#FF90E8] hover:underline"
                              >
                                CLEAR_SEARH
                              </button>
                            )}
                          </div>

                          {/* STYLE VIEW 1: MASTER VISUAL TREE CANVASES WITH CONNECTIONS */}
                          {mindmapViewStyle === "visual-tree" ? (
                            <div className="relative border-4 border-black p-6 bg-[#fafafa] shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-x-auto min-w-0">
                              
                              {/* Central Root Node (Top) */}
                              <div className="flex justify-center mb-8 relative z-10 w-full min-w-[700px]">
                                <motion.div
                                  whileHover={{ scale: 1.03 }}
                                  className="border-4 border-black bg-[#FFD100] p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] max-w-md text-center inline-block"
                                >
                                  <span className="font-mono text-[9px] bg-black text-[#FFD100] px-2 py-0.5 font-bold uppercase tracking-wider block mb-1">
                                    TOPIK SENTRAL UTAMA
                                  </span>
                                  <h3 className="font-sans font-black text-lg md:text-xl uppercase tracking-tight text-black flex items-center justify-center gap-2">
                                    <Sparkles size={18} className="text-[#FF90E8]" /> {mindmapResult.topic}
                                  </h3>
                                  <p className="text-[10px] text-gray-800 font-mono mt-1 font-bold">
                                    MEMILIKI {mindmapResult.subtopics.length} CABANG INTERAKTIF
                                  </p>
                                </motion.div>
                              </div>

                              {/* Decorative Root Down Connector Lines (pure SVG) */}
                              <div className="relative h-6 w-full hidden md:block min-w-[700px] pointer-events-none">
                                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                  {/* Draw line downward and branch out */}
                                  <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="black" strokeWidth="4" />
                                  <line x1="12.5%" y1="100%" x2="87.5%" y2="100%" stroke="black" strokeWidth="4" />
                                </svg>
                              </div>

                              {/* Columns for branches (Subtopics) */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 w-full min-w-[700px]">
                                {mindmapResult.subtopics.map((sub, idx) => {
                                  const colors = ["#FF90E8", "#33D6A6", "#4D96FF", "#FFB534", "#FF6B6B"];
                                  const columnColor = colors[idx % colors.length];
                                  const isCollapsed = collapsedNodes[sub.title] || false;
                                  
                                  const subtopicHighlighted = searchQuery && matchesSearch(sub.title);
                                  const hasPointMatch = sub.points.some(p => matchesSearch(p));

                                  return (
                                    <div
                                      key={idx}
                                      className={`flex flex-col relative transition-all duration-300 ${isCollapsed ? "shrink-0" : ""}`}
                                      onMouseEnter={() => setHighlightedSubtopic(sub.title)}
                                      onMouseLeave={() => setHighlightedSubtopic(null)}
                                    >
                                      {/* Visual SVG line connector vertical down to subtopic */}
                                      <div className="h-6 w-full hidden md:block pointer-events-none">
                                        <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="black" strokeWidth="4" />
                                        </svg>
                                      </div>

                                      {/* Subtopic Header Box */}
                                      <motion.div
                                        onClick={() => toggleCollapseNode(sub.title)}
                                        className={`border-3 border-black p-4 text-left shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer transition-all ${
                                          subtopicHighlighted || hasPointMatch
                                            ? "border-dashed outline-3 outline-black"
                                            : ""
                                        }`}
                                        style={{ backgroundColor: columnColor }}
                                        whileHover={{ y: -2 }}
                                      >
                                        <div className="flex justify-between items-start gap-2">
                                          <span className="font-mono text-[9px] bg-black text-white px-1.5 py-0.5 font-bold uppercase">
                                            BRANCH_0{idx + 1}
                                          </span>
                                          <button className="text-black hover:scale-110">
                                            {isCollapsed ? <Layers size={14} /> : <ListCollapse size={14} />}
                                          </button>
                                        </div>
                                        
                                        <h4 className="font-sans font-black text-xs sm:text-sm uppercase tracking-tight text-black mt-2 leading-tight">
                                          {sub.title}
                                        </h4>
                                        
                                        <div className="flex justify-between items-center mt-2">
                                          <span className="text-[10px] font-mono bg-white/60 px-1 border border-black font-bold">
                                            {sub.points.length} KEYS
                                          </span>
                                          <span className="text-[9px] font-mono opacity-80 underline">
                                            {isCollapsed ? "[ EXPAND ]" : "[ HOVER ]"}
                                          </span>
                                        </div>
                                      </motion.div>

                                      {/* Leaves / Detail Points Container */}
                                      <AnimatePresence>
                                        {!isCollapsed && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-3 mt-4 overflow-hidden text-left"
                                          >
                                            {sub.points.map((point, pIdx) => {
                                              const pointHighlighted = searchQuery && matchesSearch(point);
                                              return (
                                                <div key={pIdx} className="relative pl-4">
                                                  {/* Branch Line Visual */}
                                                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-black/50"></div>
                                                  
                                                  <motion.div
                                                    whileHover={{ x: 2 }}
                                                    className={`p-3 bg-white border-2 border-black text-xs leading-relaxed font-sans shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all ${
                                                      pointHighlighted 
                                                        ? "bg-[#FFD100]/30 border-dashed outline-1 outline-black" 
                                                        : "text-slate-800"
                                                    }`}
                                                  >
                                                    <div className="flex gap-1.5 mb-1 items-center">
                                                      <div className="w-2.5 h-2.5 bg-black shrink-0"></div>
                                                      <span className="font-mono text-[9px] text-gray-500 font-bold uppercase">
                                                        DETAIL_0{pIdx+1}
                                                      </span>
                                                    </div>
                                                    <p className="font-bold leading-normal text-black font-sans">{point}</p>
                                                  </motion.div>
                                                </div>
                                              );
                                            })}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Tutorial tag for Visual navigation */}
                              <div className="mt-8 pt-4 border-t-2 border-black border-dashed flex items-center justify-between text-[11px] font-mono font-bold text-gray-500">
                                <span>TIPS: KLIK KARTU SUBTOPIK UNTUK COLLAPSE/EXPAND CABANG</span>
                                <div>LATENCY_CONVERT: ~120ms</div>
                              </div>

                            </div>
                          ) : (
                            /* STYLE VIEW 2: BENTO GRID VERTICAL COL FLOW */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                              {mindmapResult.subtopics.map((sub, idx) => {
                                const colors = ["#FFD100", "#FF90E8", "#33D6A6", "#4D96FF"];
                                const currentBg = colors[idx % colors.length];
                                return (
                                  <div
                                    key={idx}
                                    className="border-4 border-black bg-white p-5 shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col gap-3 transition-transform hover:-translate-y-1"
                                  >
                                    <div className="flex justify-between items-center">
                                      <h3
                                        className="font-sans font-black text-xs uppercase text-black inline-block px-2.5 py-1 border-2 border-black shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]"
                                        style={{ backgroundColor: currentBg }}
                                      >
                                        {sub.title}
                                      </h3>
                                      <span className="font-mono text-xs font-bold text-gray-400">CABANG 0{idx+1}</span>
                                    </div>

                                    <ul className="space-y-2 pt-2 flex-grow">
                                      {sub.points.map((point, pIdx) => {
                                        const queryMatch = searchQuery && matchesSearch(point);
                                        return (
                                          <li
                                            key={pIdx}
                                            className={`p-2.5 border-2 border-black text-xs leading-relaxed font-bold font-sans flex gap-2 items-start ${
                                              queryMatch ? "bg-[#33D6A6]/20 border-dashed" : "bg-[#fafafa]"
                                            }`}
                                          >
                                            <span className="bg-black text-white px-1.5 font-mono text-[9px] font-bold mt-0.5">
                                              {pIdx+1}
                                            </span>
                                            <span className="text-black font-sans leading-normal">{point}</span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Print ASCII Code section */}
                          <div className="bg-[#fafafa] border-4 border-black p-4 text-left shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            <span className="block text-xs font-mono font-extrabold text-black uppercase mb-1">
                              PRINTOUT TREE SYSTEM: 
                            </span>
                            <pre className="p-3 bg-black text-[#51ff56] font-mono text-[10px] sm:text-xs overflow-x-auto leading-relaxed border-2 border-black select-all">
                              {`[TOPIC]: ${mindmapResult.topic.toUpperCase()}\n` +
                                mindmapResult.subtopics.map((sub, i) => {
                                  let res = ` ├── [SUBTOPIC ${i+1}]: ${sub.title.toUpperCase()}\n`;
                                  sub.points.forEach((pt) => {
                                    res += `      └── ${pt}\n`;
                                  });
                                  return res;
                                }).join("")}
                            </pre>
                            <span className="text-[10px] font-mono text-gray-500 font-bold block mt-1">
                              Klik double untuk menyalin seluruh bagan pohon teks di atas guna lampiran studi/tugas Markdown!
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 bg-[#fafafa] border-2 border-dashed border-black text-left">
                          <GitFork className="mx-auto text-slate-400 mb-2" size={40} />
                          <h4 className="font-sans font-black text-md uppercase">Belum ada peta konsep pikiran</h4>
                          <p className="text-xs font-mono text-gray-500 max-w-sm mx-auto mt-1">
                            Tekan tombol <strong className="text-black bg-[#33D6A6] px-1">2. Generate Mindmap</strong> di kolom atas untuk menyusun materi akademik Anda ke bentuk bagan visual menggunakan AI.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* BRUTALIST FOOTER */}
        <footer className="bg-black text-white p-6 border-4 border-black text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
          <div className="text-xs font-mono text-zinc-400">
            ARSITEKTUR_SISTEM • CONFIG_CLOUD_CONTAINER PORT: 3000 • DIKEMBANGKAN OLEH <span className="font-bold text-[#FFD100] hover:underline cursor-pointer">AI STUDY ASSISTANT TEAM</span> • © 2026
          </div>
          <div className="flex gap-2">
            <span className="font-mono text-[10px] bg-[#FFD100] text-black px-2 py-0.5 border border-black font-extrabold uppercase tracking-wider">
              MODEL: GEMINI_3.5_FLASH
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
}
