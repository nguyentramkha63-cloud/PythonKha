
// Add React import to resolve "Cannot find namespace 'React'" errors.
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { interpretPythonCode, getThayKhaHints, getThayKhaChallenge, getGuidanceForChallenge, analyzeProblemFile, getSolutionForChallenge } from './services/geminiService';
import { ExecutionResult, Difficulty } from './types';
import { PYTHON_EXAMPLES } from './constants';
import StickFigure from './components/StickFigure';

interface FileEntry {
  id: string;
  name: string;
  content: string;
  miniChatHistory?: ChatMessage[];
}

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  filePreview?: { data: string, type: string, name: string };
}

const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];
const EDITOR_LINE_HEIGHT = 1.5;

const MASTER_KEY = "KHA@2025!";

const UI_STRINGS: Record<string, any> = {
  en: {
    new: "NEW", open: "OPEN", export: "EXPORT", copy: "COPY", run: "RUN", examples: "EXAMPLES", lang: "LANG",
    fullscreen: "FULL", exitFullscreen: "EXIT FULL",
    editorTitle: "PYTHON CODE SPACE", chatTitle: "TEACHER KHA'S STATION",
    chatPlaceholder: "How can I help you today?", aiSuggest: "CHALLENGE WITH TEACHER KHA",
    resultTitle: "TEACHER KHA'S FEEDBACK", close: "CLOSE [X]", awaitingInput: "Waiting for input: ",
    inputPlaceholder: "Waiting for input...", inputSubmit: "SEND", line: "Code Line", file: "File",
    loading: "SCANNING...", feedbackTitle: "Comment from Teacher Kha:",
    welcome: "Hi there! I'm Teacher Kha. How can I help you learn Python today?",
    lessonTitle: "📖 EXAMPLE LESSONS", langTitle: "🌍 SELECT LANGUAGE",
    exportTitle: "💾 SAVE YOUR CODE", exportName: "File name:", saveBtn: "DOWNLOAD",
    copySuccess: "Code copied to clipboard!", emptyAlert: "Code is empty!",
    levelBeginner: "🌱 BEGINNER", levelAdvanced: "🔥 TEACHER'S PROB", levelHSG: "🏆 HSG REVIEW",
    lockTitle: "TEACHER'S MASTER LOCK", lockPlaceholder: "Enter Master Key...",
    lockError: "Wrong Key!", lockSuccess: "Access Granted!",
    showFeedback: "💬 Teacher's Advice", hideFeedback: "🔽 Hide Advice",
    miniChatTitle: "Quick Help", miniChatPlaceholder: "Em bí chỗ nào?",
    showStation: "🔼 SHOW TEACHER KHA'S STATION", hideStation: "🔽 HIDE STATION",
    executionReady: "Wait a moment!", fontSize: "Size", uploadFile: "Upload File",
    previewTitle: "PROBLEM VIEW",
    selectKey: "SET API KEY",
    keySelected: "KEY READY ✅", keyMissing: "KEY REQUIRED 🔑",
    keyRequiredMsg: "Please enter your Gemini API Key to continue!",
    getApiKey: "GET API KEY", pasteApiKey: "PASTE API KEY", saveKey: "SAVE & START",
    apiKeyHint: "Get your free key at Google AI Studio",
    invalidKey: "Please enter a valid API Key!",
    forceKeyWarning: "Please set your API Key before using the app! Thank you!",
    keyStep1: "1. Click 'GET API KEY' button",
    keyStep2: "2. Click 'Create API key'",
    keyStep3: "3. Copy & Paste into Step 2 below",
    nameLabel: "What's your name?",
    namePlaceholder: "Enter your name..."
  },
  vi: {
    new: "MỚI", open: "MỞ", export: "LƯU", copy: "CHÉP", run: "CHẠY", examples: "VÍ DỤ", lang: "NGÔN NGỮ",
    fullscreen: "FULL", exitFullscreen: "THOÁT FULL",
    editorTitle: "KHÔNG GIAN VIẾT CODE", chatTitle: "TRẠM HỖ TRỢ THẦY KHA",
    chatPlaceholder: "Em muốn hỏi gì? Thầy sẽ giúp!", aiSuggest: "THỬ THÁCH CÙNG THẦY KHA",
    resultTitle: "KẾT QUẢ TỪ THẦY KHA", close: "ĐÓNG [X]", awaitingInput: "Thầy đang đợi em nhập: ",
    inputPlaceholder: "Thầy đang đợi em nhập...", inputSubmit: "GỬI", line: "Dòng code", file: "Tập tin",
    loading: "ĐANG RÀ...", feedbackTitle: "Nhận xét của Thầy Kha:",
    welcome: "Chào em! Thầy Kha đây. Hôm nay em muốn học gì nào?",
    lessonTitle: "📖 BÀI HỌC MẪU", langTitle: "🌍 CHỌN NGÔN NGỮ",
    exportTitle: "LƯU TRỮ CODE", exportName: "Tên tập tin:", saveBtn: "TẢI VỀ",
    copySuccess: "Đã sao chép code vào bộ nhớ tạm!", emptyAlert: "Code trống trơn em ơi!",
    levelBeginner: "🌱 CƠ BẢN", levelAdvanced: "🔥 ĐỀ THẦY CHO", levelHSG: "🏆 ÔN TẬP HSG",
    lockTitle: "KHÓA BẢM MẬT CỦ của THẦY KHA", lockPlaceholder: "Nhập mã khóa...",
    lockError: "Sai mã rồi!", lockSuccess: "Xác thực thành công!",
    showFeedback: "💬 Xem lời thầy dặn", hideFeedback: "🔽 Hide Advice",
    miniChatTitle: "Cứu trợ nhanh", miniChatPlaceholder: "Em bí chỗ nào?",
    showStation: "🔼 HIỆN TRẠM HỖ TRỢ THẦY KHA", hideStation: "🔽 ẨN TRẠM HỖ TRỢ",
    executionReady: "Chờ thầy chút xíu!", fontSize: "Cỡ chữ", uploadFile: "Tải đề lên",
    previewTitle: "XEM ĐỀ BÀI",
    selectKey: "CÀI ĐẶT API",
    keySelected: "KEY ĐÃ LƯU ✅", keyMissing: "CHƯA CÓ KEY 🔑",
    keyRequiredMsg: "Em hãy nhập Gemini API Key của mình để tiếp tục bài học nha!",
    getApiKey: "LẤY API KEY", pasteApiKey: "DÁN API KEY VÀO ĐÂY", saveKey: "LƯU & BẮT ĐẦU",
    apiKeyHint: "Lấy key miễn phí tại Google AI Studio",
    invalidKey: "Em chưa nhập API Key kìa!",
    forceKeyWarning: "Bạn vui lòng lấy API trước khi sử dụng! Cám ơn!",
    keyStep1: "1. Nhấn nút 'LẤY API KEY' phía trên",
    keyStep2: "2. Nhấn 'Create API key' (màu xanh)",
    keyStep3: "3. Copy mã đó và Dán vào ô Bước 2 bên dưới",
    nameLabel: "Em tên gì?",
    namePlaceholder: "Nhập tên của em..."
  }
};

const getUI = (lang: string, key: string) => UI_STRINGS[lang]?.[key] || UI_STRINGS['vi'][key];

const App: React.FC = () => {
  const [lang, setLang] = useState(() => localStorage.getItem('thay_kha_lang') || 'vi');
  const [difficulty, setDifficulty] = useState<Difficulty>(() => (localStorage.getItem('thay_kha_diff') as Difficulty) || 'beginner');
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('thay_kha_font_size')) || 16);
  
  const [files, setFiles] = useState<FileEntry[]>(() => {
    const saved = localStorage.getItem('thay_kha_files');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [{ id: '1', name: 'my_code.py', content: '', miniChatHistory: [] }];
  });

  const [activeFileId, setActiveFileId] = useState<string>(files[0].id);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockInput, setLockInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [exportFileName, setExportFileName] = useState("");
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMiniRecording, setIsMiniRecording] = useState(false);

  const [isMainChatOpen, setIsMainChatOpen] = useState(false);
  const [isMiniChatOpen, setIsMiniChatOpen] = useState(false);
  const [miniChatInput, setMiniChatInput] = useState('');
  const [miniChatMessages, setMiniChatMessages] = useState<ChatMessage[]>([]);
  const [isMiniChatLoading, setIsMiniChatLoading] = useState(false);
  const miniChatEndRef = useRef<HTMLDivElement>(null);

  const [stationHeight, setStationHeight] = useState(280);
  const [isResizing, setIsResizing] = useState(false);

  const [resultPanelHeight, setResultPanelHeight] = useState(window.innerHeight * 0.45);
  const [isResizingResult, setIsResizingResult] = useState(false);

  const [lastChallenge, setLastChallenge] = useState<string | null>(null);

  const [isAwaitingInput, setIsAwaitingInput] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentInputValue, setCurrentInputValue] = useState("");
  const [allInputs, setAllInputs] = useState<string[]>([]);

  const [previewFile, setPreviewFile] = useState<{ data: string, type: string, name: string } | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [activeProblemFile, setActiveProblemFile] = useState<{ base64: string, mimeType: string } | null>(null);

  const [hasApiKey, setHasApiKey] = useState(() => !!localStorage.getItem('thay_kha_custom_api_key'));
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [studentName, setStudentName] = useState(() => localStorage.getItem('thay_kha_student_name') || '');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const problemFileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const feedbackScrollRef = useRef<HTMLDivElement>(null);
  const stationChatInputRef = useRef<HTMLTextAreaElement>(null);
  const miniChatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem('thay_kha_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('thay_kha_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('thay_kha_diff', difficulty);
  }, [difficulty]);

  useEffect(() => {
    localStorage.setItem('thay_kha_font_size', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    setChatMessages([{ role: 'bot', text: getUI(lang, 'welcome') }]);
  }, [lang]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const active = files.find(f => f.id === activeFileId);
    if (active) {
      if (active.miniChatHistory && active.miniChatHistory.length > 0) {
        setMiniChatMessages(active.miniChatHistory);
      } else {
        setMiniChatMessages([{ role: 'bot', text: getUI(lang, 'miniChatPlaceholder') }]);
      }
    }
  }, [activeFileId, lang]);

  const activeFile = useMemo(() => files.find(f => f.id === activeFileId) || files[0], [files, activeFileId]);
  
  useEffect(() => {
    setExportFileName(activeFile.name);
  }, [activeFile]);

  const setCode = (newContent: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
  };

  const lineCount = activeFile.content.split('\n').length;
  const isOutputVisible = isLoading || result !== null || isAwaitingInput;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, isChatLoading]);
  useEffect(() => { miniChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [miniChatMessages, isMiniChatLoading]);

  // Auto-resize station chat input
  useEffect(() => {
    if (stationChatInputRef.current) {
      stationChatInputRef.current.style.height = 'auto';
      stationChatInputRef.current.style.height = `${Math.min(stationChatInputRef.current.scrollHeight, 150)}px`;
    }
  }, [chatInput]);

  // Auto-resize mini chat input
  useEffect(() => {
    if (miniChatInputRef.current) {
      miniChatInputRef.current.style.height = 'auto';
      miniChatInputRef.current.style.height = `${Math.min(miniChatInputRef.current.scrollHeight, 120)}px`;
    }
  }, [miniChatInput]);

  const handleNewFile = () => {
    const newId = Date.now().toString();
    setFiles(prev => [...prev, { id: newId, name: `code_${files.length + 1}.py`, content: '', miniChatHistory: [] }]);
    setActiveFileId(newId);
    setResult(null);
  };

  const handleCloseFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length === 1) { setCode(''); return; }
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) setActiveFileId(newFiles[newFiles.length - 1].id);
    setResult(null);
  };

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) setHasApiKey(true);
      }
      if (!localStorage.getItem('thay_kha_custom_api_key')) {
        setShowApiKeyModal(true);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    setShowApiKeyModal(true);
  };

  const handleSaveApiKey = () => {
    if (!tempApiKey.trim() && !hasApiKey) return alert(getUI(lang, 'invalidKey'));
    if (tempApiKey.trim()) localStorage.setItem('thay_kha_custom_api_key', tempApiKey.trim());
    localStorage.setItem('thay_kha_student_name', studentName.trim());
    setHasApiKey(true);
    setShowApiKeyModal(false);
    setTempApiKey('');
  };

  const handleSendChat = async (text?: string) => {
    const message = text || chatInput;
    if (!message.trim() || isChatLoading) return;
    
    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    setChatInput('');
    setIsChatLoading(true);
    
    const cleanMsg = message.trim().toUpperCase();
    const isSecretYC = cleanMsg === 'YC';
    const isSecretY = cleanMsg === 'Y';
    
    try {
      if ((lastChallenge || activeProblemFile) && (isSecretY || isSecretYC)) {
        const context = lastChallenge || (lang === 'vi' ? "Bài tập trong file đính kèm" : "Problem in attached file");
        if (isSecretYC) {
          const solutionCode = await getSolutionForChallenge(context, lang, difficulty, studentName, activeProblemFile || undefined);
          const cleanCode = solutionCode.replace(/```python\n|```/g, '').trim();
          setCode(cleanCode);
          setChatMessages(prev => [...prev, { role: 'bot', text: lang === 'vi' ? "Suỵt! Thầy đã 'phù phép' viết xong code vào bảng cho em rồi đó. Em xem thử nhé! 😉" : "Shh! I've 'magically' written the code in the editor for you. Check it out! 😉" }]);
        } else {
          const guidance = await getGuidanceForChallenge(context, lang, difficulty, studentName, activeProblemFile || undefined);
          setChatMessages(prev => [...prev, { role: 'bot', text: guidance }]);
        }
        // Don't clear lastChallenge here so they can ask for YC after Y
      } else {
        const hint = await getThayKhaHints(message, lang, difficulty, activeFile.content, studentName, activeProblemFile || undefined);
        setChatMessages(prev => [...prev, { role: 'bot', text: hint }]);
        // Update lastChallenge with the user's message so they can use "YC" for manual input
        if (message.length > 10) { // Only set if it's a reasonably long message (likely a problem description)
          setLastChallenge(message);
        }
      }
    } catch (e: any) { 
      if (e.message === "API_KEY_REQUIRED" || e.message === "API_KEY_MISSING") {
        alert(getUI(lang, 'keyRequiredMsg'));
        handleSelectApiKey();
      }
      console.error(e); 
    } finally { setIsChatLoading(false); }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsChatLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const fullData = ev.target?.result as string;
      const base64Data = fullData.split(',')[1];
      
      const fileInfo = { data: fullData, type: file.type, name: file.name };
      setPreviewFile(fileInfo);
      setActiveProblemFile({ base64: base64Data, mimeType: file.type });
      
      const isPdf = file.type === 'application/pdf';
      const fileLabel = isPdf ? (lang === 'vi' ? `[Đã gửi file: ${file.name}]` : `[File sent: ${file.name}]`) : (lang === 'vi' ? `[Đã gửi ảnh: ${file.name}]` : `[Image sent: ${file.name}]`);
      
      setChatMessages(prev => [...prev, { role: 'user', text: fileLabel, filePreview: fileInfo }]);
      
      try {
        const response = await analyzeProblemFile(base64Data, file.type, lang, difficulty, studentName);
        setChatMessages(prev => [...prev, { role: 'bot', text: response }]);
        setLastChallenge(response); // Set the analysis as the current challenge context
      } catch (err) {
        console.error(err);
        setChatMessages(prev => [...prev, { role: 'bot', text: lang === 'vi' ? "Thầy không đọc được file này, em gửi lại nhé!" : "I can't read this file, please resend!" }]);
      } finally {
        setIsChatLoading(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const updateFileChatHistory = (messages: ChatMessage[]) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, miniChatHistory: messages } : f));
  };

  const handleSendMiniChat = async (text?: string) => {
    const message = text || miniChatInput;
    if (!message.trim() || isMiniChatLoading) return;
    
    const userMsg: ChatMessage = { role: 'user', text: message };
    const newMessages = [...miniChatMessages, userMsg];
    setMiniChatMessages(newMessages);
    updateFileChatHistory(newMessages);
    
    setMiniChatInput('');
    if (miniChatInputRef.current) {
      miniChatInputRef.current.style.height = 'auto';
    }
    setIsChatLoading(true);
    setIsMiniChatLoading(true);
    try {
      const hint = await getThayKhaHints(message, lang, difficulty, activeFile.content, studentName);
      const botMsg: ChatMessage = { role: 'bot', text: hint };
      const updatedMessages = [...newMessages, botMsg];
      setMiniChatMessages(updatedMessages);
      updateFileChatHistory(updatedMessages);
    } catch (e: any) { 
      if (e.message === "API_KEY_REQUIRED" || e.message === "API_KEY_MISSING") {
        alert(getUI(lang, 'keyRequiredMsg'));
        handleSelectApiKey();
      }
      console.error(e); 
    } finally { 
      setIsMiniChatLoading(false); 
      setIsChatLoading(false);
    }
  };

  const handleAiSuggest = async () => {
    if (isChatLoading) return;
    setIsChatLoading(true);
    try {
      const challenge = await getThayKhaChallenge(lang, difficulty, studentName);
      setChatMessages(prev => [...prev, { role: 'bot', text: challenge }]);
      setLastChallenge(challenge);
    } catch (e: any) { 
      if (e.message === "API_KEY_REQUIRED" || e.message === "API_KEY_MISSING") {
        alert(getUI(lang, 'keyRequiredMsg'));
        handleSelectApiKey();
      }
      console.error(e); 
    } finally { setIsChatLoading(false); }
  };

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window)) return alert("Browser not supported!");
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
    if (!isRecording) {
      setIsRecording(true);
      recognition.start();
      recognition.onresult = (event: any) => { handleSendChat(event.results[0][0].transcript); setIsRecording(false); };
      recognition.onend = () => setIsRecording(false);
    }
  };

  const toggleRecordingMini = () => {
    if (!('webkitSpeechRecognition' in window)) return alert("Browser not supported!");
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
    if (!isMiniRecording) {
      setIsMiniRecording(true);
      recognition.start();
      recognition.onresult = (event: any) => { handleSendMiniChat(event.results[0][0].transcript); setIsMiniRecording(false); };
      recognition.onend = () => setIsMiniRecording(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const highlightPython = (text: string) => {
    const bracketColors = ['text-amber-400', 'text-purple-400', 'text-blue-400', 'text-rose-400'];
    let globalBracketLevel = 0;
    const lines = text.split('\n');
    return lines.map((lineText, lineIdx) => {
      const isErrorLine = result?.errorLines?.includes(lineIdx + 1);
      const tokens = [
        { regex: /#.*$/gm, color: 'text-yellow-400 italic font-medium' }, 
        { regex: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, color: 'text-orange-400 font-medium' },
        { regex: /\b(def|class|if|else|elif|for|while|return|import|from|as|try|except|finally|with|in|is|not|and|or|lambda|None|True|False|break|continue|pass|global|yield|del|assert)\b/g, color: 'text-fuchsia-400 font-black' },
        { regex: /\b(print|input|range|len|str|int|float|list|dict|set|tuple|open|type|abs|max|min|sum|zip|enumerate|map|filter|bool)\b/g, color: 'text-blue-400 font-bold' },
        { regex: /\b\d+\.?\d*\b/g, color: 'text-indigo-300 font-bold' },
      ];
      let parts: { text: string; color?: string }[] = [{ text: lineText }];
      tokens.forEach(token => {
        let nextParts: { text: string; color?: string }[] = [];
        parts.forEach(part => {
          if (part.color) { nextParts.push(part); return; }
          let lastIndex = 0; let match; const re = new RegExp(token.regex);
          while ((match = re.exec(part.text)) !== null) {
            if (part.text.slice(lastIndex, match.index)) nextParts.push({ text: part.text.slice(lastIndex, match.index) });
            nextParts.push({ text: match[0], color: token.color });
            lastIndex = re.lastIndex;
          }
          if (part.text.slice(lastIndex)) nextParts.push({ text: part.text.slice(lastIndex) });
        });
        parts = nextParts;
      });
      const lineElements = parts.map((part, pIdx) => {
        if (part.color) return <span key={pIdx} className={part.color}>{part.text}</span>;
        return part.text.split('').map((char, cIdx) => {
          if ('([{'.includes(char)) {
            const color = bracketColors[globalBracketLevel % bracketColors.length];
            globalBracketLevel++;
            return <span key={`${pIdx}-${cIdx}`} className={`${color} font-black`}>{char}</span>;
          } else if (')]}'.includes(char)) {
            globalBracketLevel = Math.max(0, globalBracketLevel - 1);
            const color = bracketColors[globalBracketLevel % bracketColors.length];
            return <span key={`${pIdx}-${cIdx}`} className={`${color} font-black`}>{char}</span>;
          }
          return char;
        });
      });

      return (
        <div key={lineIdx} className={`relative ${isErrorLine ? 'bg-red-500/20' : ''}`} style={{ minHeight: `${EDITOR_LINE_HEIGHT}em`, lineHeight: EDITOR_LINE_HEIGHT }}>
          <span 
            className={`absolute -left-[3rem] w-10 text-right pr-2 select-none text-slate-500 font-mono ${isErrorLine ? 'bg-red-500 text-white font-black rounded-sm' : ''}`} 
            style={{ 
              lineHeight: EDITOR_LINE_HEIGHT,
              fontSize: `${fontSize * 0.8}px` 
            }}
          >
            {lineIdx + 1}
          </span>
          {lineElements}
          {lineIdx < lines.length - 1 && '\n'}
        </div>
      );
    });
  };

  const highlightedCode = useMemo(() => highlightPython(activeFile.content), [activeFile.content, result, fontSize]);

  const syncScroll = () => {
    if (textareaRef.current) {
      if (highlighterRef.current) highlighterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const startExecution = async () => {
    if (isLoading) return;
    setIsLoading(true); setResult(null); setIsAwaitingInput(false); setAllInputs([]); setIsFeedbackVisible(false);
    try {
      const interpretation = await interpretPythonCode(activeFile.content, [], lang, studentName);
      setResult(interpretation);
      if (interpretation.needsInput) { setIsAwaitingInput(true); setCurrentPrompt(interpretation.inputPrompt || "Input:"); }
    } catch (e: any) {
      if (e.message === "API_KEY_REQUIRED" || e.message === "API_KEY_MISSING") {
        alert(getUI(lang, 'keyRequiredMsg'));
        handleSelectApiKey();
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSubmit = async () => {
    if (isLoading) return;
    const nextInputs = [...allInputs, currentInputValue];
    setAllInputs(nextInputs);
    setCurrentInputValue("");
    setIsLoading(true);
    setIsAwaitingInput(false);
    try {
      const interpretation = await interpretPythonCode(activeFile.content, nextInputs, lang, studentName);
      setResult(interpretation);
      if (interpretation.needsInput) { setIsAwaitingInput(true); setCurrentPrompt(interpretation.inputPrompt || "Input:"); }
    } catch (e: any) {
      if (e.message === "API_KEY_REQUIRED" || e.message === "API_KEY_MISSING") {
        alert(getUI(lang, 'keyRequiredMsg'));
        handleSelectApiKey();
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!activeFile.content.trim()) return alert(getUI(lang, 'emptyAlert'));
    try { await navigator.clipboard.writeText(activeFile.content); alert(getUI(lang, 'copySuccess')); } catch (err) { alert(getUI(lang, 'copySuccess')); }
  };

  const handleDownloadFile = () => {
    let name = exportFileName.trim() || activeFile.name;
    if (!name.toLowerCase().endsWith('.py')) name += '.py';
    const blob = new Blob([activeFile.content], { type: 'text/x-python;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setShowExportModal(false);
  };

  const handleUnlock = () => {
    if (lockInput === MASTER_KEY) { setIsUnlocked(true); setShowLockModal(false); alert(getUI(lang, 'lockSuccess')); } 
    else alert(getUI(lang, 'lockError'));
    setLockInput("");
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMainChatOpen) return;
    setIsResizing(true);
    e.stopPropagation();
  };

  const handleResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isResizing) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const newHeight = window.innerHeight - clientY;
    const minHeight = 60; 
    const maxHeight = window.innerHeight * 0.9;
    if (newHeight > minHeight && newHeight < maxHeight) {
      setStationHeight(newHeight);
    }
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleResultResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsResizingResult(true);
    e.stopPropagation();
  };

  const handleResultResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isResizingResult) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const newHeight = window.innerHeight - clientY;
    const minHeight = 100;
    const maxHeight = window.innerHeight * 0.9;
    if (newHeight > minHeight && newHeight < maxHeight) {
      setResultPanelHeight(newHeight);
    }
  }, [isResizingResult]);

  const handleResultResizeEnd = useCallback(() => {
    setIsResizingResult(false);
  }, []);

  const handleScrollFeedback = (direction: 'up' | 'down') => {
    if (feedbackScrollRef.current) {
      const scrollAmount = 60;
      feedbackScrollRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('touchmove', handleResizeMove);
      window.addEventListener('touchend', handleResizeEnd);
    } else {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('touchmove', handleResizeMove);
      window.removeEventListener('touchend', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('touchmove', handleResizeMove);
      window.removeEventListener('touchend', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  useEffect(() => {
    if (isResizingResult) {
      window.addEventListener('mousemove', handleResultResizeMove);
      window.addEventListener('mouseup', handleResultResizeEnd);
      window.addEventListener('touchmove', handleResultResizeMove);
      window.addEventListener('touchend', handleResultResizeEnd);
    } else {
      window.removeEventListener('mousemove', handleResultResizeMove);
      window.removeEventListener('mouseup', handleResultResizeEnd);
      window.removeEventListener('touchmove', handleResultResizeMove);
      window.removeEventListener('touchend', handleResultResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResultResizeMove);
      window.removeEventListener('mouseup', handleResultResizeEnd);
      window.removeEventListener('touchmove', handleResultResizeMove);
      window.removeEventListener('touchend', handleResultResizeEnd);
    };
  }, [isResizingResult, handleResultResizeMove, handleResultResizeEnd]);

  return (
    <div className={`h-screen flex flex-col bg-slate-900 overflow-hidden text-slate-200 ${(isResizing || isResizingResult) ? 'select-none' : ''}`}>
      <input type="file" ref={fileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const r = new FileReader();
          r.onload = (ev) => {
            const id = Date.now().toString();
            setFiles(prev => [...prev, { id, name: file.name, content: ev.target?.result as string, miniChatHistory: [] }]);
            setActiveFileId(id); setResult(null);
          };
          r.readAsText(file);
        }
      }} className="hidden" accept=".py,.txt" />
      
      <input type="file" ref={problemFileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf" />

      <div className="bg-[#022c22] px-3 py-1 flex items-center justify-between border-b border-emerald-900 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-[#10b981] overflow-hidden bg-white shadow-sm">
            <img src="https://lh3.googleusercontent.com/d/1JGYdJXUL5BiUucIxcxGQvNk5RIP3RXTR" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] shimmer-text">PYTHON CÙNG THẦY KHA - THCS&THPT NAM YÊN - AG</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[8px] text-yellow-400 font-bold tracking-widest uppercase">Version 5.3 - Premium</div>
        </div>
      </div>

      <header className="bg-[#064e3b] p-2 flex justify-between items-center border-b border-emerald-800 shrink-0 shadow-md">
        <div className="flex gap-1.5 sm:gap-2 items-center">
          <button onClick={handleSelectApiKey} className={`text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 rounded transition-all font-bold uppercase flex items-center gap-1 ${hasApiKey ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' : 'bg-amber-600 text-white hover:bg-amber-500'}`}>
            <span>{hasApiKey ? '✅' : '🔑'}</span>
            {hasApiKey ? getUI(lang, 'keySelected') : getUI(lang, 'selectKey')}
          </button>
          <button onClick={() => setShowLockModal(true)} className={`text-[12px] p-1.5 rounded-full transition-all ${isUnlocked ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-yellow-500'}`}>{isUnlocked ? '🔓' : '🔒'}</button>
          <button onClick={handleNewFile} className="text-[9px] sm:text-[10px] bg-slate-700 px-2 sm:px-3 py-1 rounded hover:bg-slate-600 transition-colors font-bold uppercase">{getUI(lang, 'new')}</button>
          <button onClick={() => fileInputRef.current?.click()} className="text-[9px] sm:text-[10px] bg-slate-700 px-2 sm:px-3 py-1 rounded hover:bg-slate-600 transition-colors font-bold uppercase">{getUI(lang, 'open')}</button>
          <button onClick={() => setShowExportModal(true)} className="text-[9px] sm:text-[10px] bg-indigo-600 px-2 sm:px-3 py-1 rounded hover:bg-indigo-500 transition-colors font-bold uppercase">{getUI(lang, 'export')}</button>
          <button onClick={startExecution} disabled={isLoading} className={`text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 rounded transition-all font-bold uppercase ${isLoading ? 'bg-slate-600 animate-pulse' : 'bg-[#059669] hover:bg-[#10b981]'}`}>{isLoading ? getUI(lang, 'loading') : getUI(lang, 'run')}</button>
          <button onClick={toggleFullscreen} className="text-[9px] sm:text-[10px] bg-amber-600 px-2 sm:px-3 py-1 rounded hover:bg-amber-500 transition-colors font-bold uppercase">{isFullscreen ? getUI(lang, 'exitFullscreen') : getUI(lang, 'fullscreen')}</button>
        </div>
        <div className="flex gap-1.5 sm:gap-2 items-center">
           <button onClick={() => setShowExamples(!showExamples)} className="text-[9px] sm:text-[10px] bg-slate-700 px-2 sm:px-3 py-1 rounded font-bold uppercase">{getUI(lang, 'examples')}</button>
           <button onClick={() => setShowLangMenu(!showLangMenu)} className="text-[9px] sm:text-[10px] bg-slate-700 px-2 sm:px-3 py-1 rounded font-bold flex items-center gap-1"><span>{LANGUAGES.find(l => l.code === lang)?.flag}</span></button>
        </div>
      </header>

      <div className="bg-slate-800/50 flex overflow-x-auto border-b border-slate-700/50 shrink-0 scrollbar-hide">
        {files.map(file => (
          <div key={file.id} onClick={() => { setActiveFileId(file.id); setResult(null); }} className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-slate-700/30 text-[11px] font-medium whitespace-nowrap ${activeFileId === file.id ? 'bg-[#059669] text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}>
            <span>🐍</span>{file.name}<button onClick={(e) => handleCloseFile(file.id, e)} className="ml-1 hover:text-red-400 px-1 rounded-full hover:bg-slate-600/50">×</button>
          </div>
        ))}
      </div>

      <main className="flex-1 flex flex-col overflow-hidden bg-slate-900 relative">
        <div className="flex-1 transition-all duration-300 relative flex flex-col overflow-hidden">
          <div className="flex-1 bg-slate-900 overflow-hidden shadow-xl relative flex flex-col">
            <div className="px-5 py-2 bg-slate-800 border-b border-[#10b981]/30 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><span className="text-base">🐍</span> {getUI(lang, 'editorTitle')}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{getUI(lang, 'fontSize')}:</span>
                  <select 
                    value={fontSize} 
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="bg-slate-900 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-900 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {FONT_SIZES.map(sz => <option key={sz} value={sz}>{sz}px</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="flex absolute inset-0">
                <div className="editor-container">
                  <div 
                    ref={highlighterRef} 
                    className="editor-layer text-slate-200"
                    style={{ fontSize: `${fontSize}px`, lineHeight: EDITOR_LINE_HEIGHT }}
                  >
                    {highlightedCode}
                  </div>
                  <textarea 
                    ref={textareaRef} 
                    value={activeFile.content} 
                    onChange={(e) => { setCode(e.target.value); if (result) setResult(null); }} 
                    onKeyDown={(e) => {
                      const { selectionStart, selectionEnd, value } = e.currentTarget;
                      if (e.key === 'Tab') { e.preventDefault(); setCode(value.substring(0, selectionStart) + "    " + value.substring(selectionEnd)); setTimeout(() => { if (textareaRef.current) textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 4; }, 0); }
                      if (e.key === 'Backspace') {
                        if (selectionStart === selectionEnd) {
                          const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
                          const col = selectionStart - lineStart;
                          const textBefore = value.substring(lineStart, selectionStart);
                          if (col >= 4 && textBefore.endsWith('    ')) {
                            e.preventDefault();
                            setCode(value.substring(0, selectionStart - 4) + value.substring(selectionEnd));
                            setTimeout(() => { if (textareaRef.current) textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart - 4; }, 0);
                          }
                        }
                      }
                      if (e.key === 'Enter') { 
                        e.preventDefault(); 
                        let ind = (value.substring(0, selectionStart).split('\n').pop()?.match(/^\s*/) || [""])[0]; 
                        if (value.substring(0, selectionStart).trim().endsWith(':')) ind += "    "; 
                        setCode(value.substring(0, selectionStart) + "\n" + ind + value.substring(selectionEnd)); 
                        setTimeout(() => { if (textareaRef.current) { textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 1 + ind.length; syncScroll(); } }, 0); 
                      }
                    }} 
                    onScroll={syncScroll} 
                    className="editor-textarea" 
                    spellCheck={false} 
                    placeholder="# Viết Python ở đây em nhé..."
                    style={{ fontSize: `${fontSize}px`, lineHeight: EDITOR_LINE_HEIGHT }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 z-[70]">
            <button onClick={(e) => { e.stopPropagation(); setIsMiniChatOpen(!isMiniChatOpen); }} className={`w-14 h-14 sm:w-16 sm:h-16 bg-white border-4 border-blue-600 rounded-full shadow-[0_15px_35px_-10px_rgba(37,99,235,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative ${isMiniChatOpen ? 'rotate-12 border-yellow-400' : ''}`}>
              <StickFigure action={isMiniChatLoading ? 'think' : (isMiniChatOpen ? 'wave' : 'celebrate')} enableReveal={false} />
              {!isMiniChatOpen && <div className="absolute top-0 right-0 bg-red-500 w-6 h-6 rounded-full border-4 border-white animate-pulse shadow-md z-10 flex items-center justify-center"><span className="text-white text-[10px] font-black">!</span></div>}
            </button>
          </div>
        </div>

        {isMiniChatOpen && (
          <div className="fixed bottom-24 right-10 sm:right-16 w-[320px] sm:w-[480px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-160px)] bg-slate-900 rounded-3xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8)] border-4 border-blue-600 flex flex-col z-[100] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="bg-blue-600 p-4 flex justify-between items-center shadow-md shrink-0">
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-widest flex items-center gap-3"><span className="bg-white/30 p-2 rounded-full shadow-inner"><StickFigure action={isMiniChatLoading ? 'think' : 'celebrate'} enableReveal={false} /></span>{getUI(lang, 'miniChatTitle')}</span>
              <button onClick={() => setIsMiniChatOpen(false)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase shadow-lg transition-all active:scale-90 flex items-center gap-1.5">ĐÓNG <span>✕</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900 custom-scrollbar">
              {miniChatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-2xl px-5 py-3 text-sm sm:text-lg font-bold shadow-md leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-blue-800 text-white rounded-tl-none border border-blue-400/30'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isMiniChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-blue-800 border border-blue-400/30 rounded-2xl px-6 py-3 rounded-tl-none shadow-md flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={miniChatEndRef} />
            </div>
            <div className="p-4 border-t-2 border-slate-700 bg-slate-800 flex gap-2 sm:gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] shrink-0 items-center">
              <button onClick={toggleRecordingMini} className={`p-3 rounded-xl transition-all shadow-lg ${isMiniRecording ? 'bg-red-50 animate-pulse text-white ring-4 ring-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-500'}`}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg></button>
              <textarea 
                ref={miniChatInputRef}
                rows={1}
                value={miniChatInput} 
                onChange={(e) => setMiniChatInput(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleSendMiniChat();
                  }
                }} 
                placeholder={getUI(lang, 'miniChatPlaceholder')} 
                className="flex-1 bg-slate-900 border-2 border-slate-700 rounded-2xl px-6 py-3 text-sm sm:text-lg text-slate-200 font-bold outline-none focus:border-blue-500 transition-all shadow-inner min-w-0 resize-none custom-scrollbar" 
              />
              <button 
                onClick={() => handleSendMiniChat()} 
                disabled={isMiniChatLoading || !miniChatInput.trim()}
                className={`text-white p-3.5 sm:px-6 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center shrink-0 ${isMiniChatLoading || !miniChatInput.trim() ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isMiniChatLoading ? (
                  <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        <div 
          style={{ height: isMainChatOpen ? `${stationHeight}px` : '60px' }}
          className={`transition-[height] duration-300 ease-out bg-slate-800 border-t-[3px] border-[#10b981] flex flex-col shadow-2xl overflow-hidden shrink-0 z-50 ${isResizing ? 'transition-none' : ''}`}
        >
          <div 
            onClick={(e) => {
              if (!isResizing) setIsMainChatOpen(!isMainChatOpen);
            }} 
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            className={`h-[60px] sm:h-[40px] bg-slate-800 border-b border-[#10b981]/30 flex items-center justify-between px-5 shrink-0 ${isMainChatOpen ? 'cursor-ns-resize' : 'cursor-pointer hover:bg-slate-700'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base pointer-events-none">👨‍🏫</span>
              <span className="text-[10px] sm:text-[11px] font-black text-emerald-400 uppercase tracking-widest pointer-events-none">{getUI(lang, 'chatTitle')}</span>
              {isMainChatOpen && <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto hidden sm:block"></div>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-tighter pointer-events-none">
                {isMainChatOpen ? getUI(lang, 'hideStation') : getUI(lang, 'showStation')}
              </span>
              {!isMainChatOpen && <span className="animate-bounce text-emerald-400">🔼</span>}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            <div className="px-5 py-3 bg-slate-800 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <StickFigure action={isChatLoading ? 'think' : 'none'} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-700 p-0.5 rounded-lg border border-slate-600 overflow-x-auto">
                    <button onClick={(e) => { e.stopPropagation(); setDifficulty('beginner'); }} className={`text-[8px] sm:text-[9px] px-2 py-1 rounded-md font-black transition-all ${difficulty === 'beginner' ? 'bg-slate-900 text-emerald-400 shadow-sm' : 'text-white'}`}>{getUI(lang, 'levelBeginner')}</button>
                    <button onClick={(e) => { e.stopPropagation(); setDifficulty('advanced'); }} className={`text-[8px] sm:text-[9px] px-2 py-1 rounded-md font-black transition-all ${difficulty === 'advanced' ? 'bg-slate-900 text-emerald-400 shadow-sm' : 'text-white'}`}>{getUI(lang, 'levelAdvanced')}</button>
                    <button onClick={(e) => { e.stopPropagation(); setDifficulty('hsg'); }} className={`text-[8px] sm:text-[9px] px-2 py-1 rounded-md font-black transition-all ${difficulty === 'hsg' ? 'bg-slate-900 text-emerald-400 shadow-sm' : 'text-white'}`}>{getUI(lang, 'levelHSG')}</button>
                  </div>
                </div>
                <button onClick={handleAiSuggest} disabled={isChatLoading} className={`bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-emerald-700 transition-all shadow-md uppercase tracking-tight ${isChatLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>{getUI(lang, 'aiSuggest')}</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-900 custom-scrollbar">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm font-medium shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-blue-800 text-white rounded-tl-none border border-blue-400/20'}`}>
                    {msg.text}
                    {msg.filePreview && (
                      <div 
                        className="mt-2 w-24 h-24 rounded-lg overflow-hidden border-2 border-white/20 cursor-zoom-in group relative"
                        onClick={() => { setPreviewFile(msg.filePreview!); setShowFullPreview(true); }}
                      >
                        {msg.filePreview.type.startsWith('image/') ? (
                          <img src={msg.filePreview.data} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-slate-700 flex items-center justify-center flex-col p-2">
                             <span className="text-2xl">📄</span>
                             <span className="text-[8px] font-bold truncate w-full text-center">{msg.filePreview.name}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-xs font-black text-white">XEM ĐỀ</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-blue-800 border border-blue-400/20 rounded-2xl px-5 py-3 rounded-tl-none shadow-sm flex items-center gap-1.5 min-w-[60px] justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-slate-800 border-t border-white/5 shrink-0">
              {previewFile && !showFullPreview && (
                <div className="mb-2 p-2 bg-slate-900 border border-emerald-500/30 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-800 border border-white/10">
                        {previewFile.type.startsWith('image/') ? <img src={previewFile.data} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">📄</div>}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{getUI(lang, 'previewTitle')}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{previewFile.name}</span>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => setShowFullPreview(true)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-xs">👁️</button>
                      <button onClick={() => { setPreviewFile(null); setActiveProblemFile(null); }} className="p-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors text-xs">✕</button>
                   </div>
                </div>
              )}

              <div className="flex gap-2 items-end max-w-4xl mx-auto">
                <button 
                  onClick={() => problemFileInputRef.current?.click()} 
                  title={getUI(lang, 'uploadFile')}
                  className="p-3 rounded-xl transition-all shadow-lg bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 mb-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button onClick={toggleRecording} className={`p-3 rounded-xl transition-all shadow-lg mb-1 ${isRecording ? 'bg-red-50 animate-pulse text-white ring-4 ring-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-500'}`}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg></button>
                <textarea 
                  ref={stationChatInputRef}
                  rows={1}
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }} 
                  placeholder={getUI(lang, 'chatPlaceholder')} 
                  className="flex-1 bg-slate-900 border-2 border-emerald-600 rounded-2xl px-4 py-3 text-sm focus:border-emerald-400 text-slate-200 outline-none transition-colors resize-none max-h-[150px] custom-scrollbar"
                />
                <button 
                  onClick={() => handleSendChat()} 
                  disabled={isChatLoading || !chatInput.trim()}
                  className={`p-3 rounded-xl transition-all shadow-lg mb-1 flex items-center justify-center shrink-0 ${isChatLoading || !chatInput.trim() ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95'}`}
                >
                  {isChatLoading ? (
                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* RESULT PANEL */}
      <div 
        style={{ height: isOutputVisible ? `${resultPanelHeight}px` : '0px', pointerEvents: isOutputVisible ? 'auto' : 'none' }}
        className={`fixed bottom-0 left-0 w-full z-[1000] flex flex-col shadow-[0_-15px_60px_rgba(0,0,0,0.6)] rounded-t-[2.5rem] bg-white text-slate-900 transition-all duration-300 ease-out ${isResizingResult ? 'transition-none' : ''} ${isOutputVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}
      >
        <div 
          onMouseDown={handleResultResizeStart}
          onTouchStart={handleResultResizeStart}
          className="h-14 bg-slate-50 border-b flex items-center justify-between px-8 rounded-t-[2.5rem] shrink-0 cursor-ns-resize hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className={`text-xl ${isLoading ? 'animate-spin' : 'animate-pulse'}`}>{isLoading ? '⌛' : '⚡'}</span>
            <span className="text-[11px] font-black text-[#059669] uppercase tracking-[0.2em]">{getUI(lang, 'resultTitle')}</span>
          </div>
          <div className="w-20 h-1.5 bg-slate-200 rounded-full"></div>
          <button onClick={() => { setResult(null); setIsLoading(false); setIsAwaitingInput(false); }} className="bg-slate-200 hover:bg-red-100 text-red-500 hover:text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all">{getUI(lang, 'close')}</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-6 custom-scrollbar">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10">
              <div className="w-16 h-16 border-8 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">{getUI(lang, 'loading')}</p>
              <StickFigure action="think" />
            </div>
          ) : isAwaitingInput ? (
            <div className="bg-emerald-600 text-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-white/20 rounded-full"><span className="text-3xl">💬</span></div>
                 <h3 className="text-lg font-black tracking-tight leading-tight"><span className="uppercase">{getUI(lang, 'awaitingInput')}</span> <br/><span className="text-yellow-300">"{currentPrompt}"</span></h3>
              </div>
              <div className="flex gap-3">
                <input autoFocus type="text" value={currentInputValue} onChange={(e) => setCurrentInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()} className="flex-1 bg-white text-slate-900 rounded-2xl px-6 py-4 text-xl font-bold shadow-inner outline-none focus:ring-4 ring-yellow-400/50 transition-all" placeholder={getUI(lang, 'inputPlaceholder')} />
                <button onClick={handleInputSubmit} className="bg-yellow-400 hover:bg-yellow-300 text-emerald-900 font-black px-10 rounded-2xl uppercase shadow-lg transition-all active:scale-95">{getUI(lang, 'inputSubmit')}</button>
              </div>
            </div>
          ) : result ? (
            <div className="flex flex-col gap-6 h-full">
              <div className={`font-mono text-base flex-1 border-4 overflow-y-auto whitespace-pre-wrap rounded-3xl p-6 shadow-inner custom-scrollbar ${result.isError ? 'bg-red-950 text-red-400 border-red-900/50' : 'bg-slate-900 text-emerald-400 border-emerald-900/30'}`}>
                {result.output || (lang === 'vi' ? "# Code đang chạy em nhé..." : "# Code is running...")}
              </div>
              
              <div className="shrink-0 flex flex-col gap-4">
                <div className="flex justify-center">
                  <button onClick={() => setIsFeedbackVisible(!isFeedbackVisible)} className="bg-emerald-100 text-[#059669] px-6 py-2.5 rounded-full text-xs font-black shadow-md border-2 border-emerald-200 hover:bg-emerald-200 transition-all flex items-center gap-3">
                    <span className="text-base">{isFeedbackVisible ? '🔽' : '💬'}</span>
                    {isFeedbackVisible ? getUI(lang, 'hideFeedback') : getUI(lang, 'showFeedback')}
                  </button>
                </div>
                
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFeedbackVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className={`p-4 sm:p-6 rounded-[2rem] border-4 flex items-start gap-3 sm:gap-6 shadow-xl ${result.isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                    <div className="shrink-0 scale-100 sm:scale-125">
                      <StickFigure action={result.isError ? 'error' : 'celebrate'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mb-2">{getUI(lang, 'feedbackTitle')}</p>
                      <div className="flex items-start">
                        <div ref={feedbackScrollRef} className="flex-1 max-h-48 overflow-y-auto custom-scrollbar">
                          <p className="text-base sm:text-lg font-bold italic leading-relaxed">"{result.explanation}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {showFullPreview && previewFile && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowFullPreview(false)}>
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-slate-100 border-b flex justify-between items-center">
               <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><span>📂</span> {previewFile.name}</h2>
               <button onClick={() => setShowFullPreview(false)} className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-red-600 transition-all">✕</button>
            </div>
            <div className="flex-1 bg-slate-200 overflow-auto p-4 flex items-start justify-center">
               {previewFile.type.startsWith('image/') ? (
                  <img src={previewFile.data} alt="Full đề bài" className="max-w-full shadow-lg rounded-lg" />
               ) : (
                  <iframe src={previewFile.data} className="w-full h-full border-none rounded-lg shadow-lg bg-white" title="PDF Preview" />
               )}
            </div>
          </div>
        </div>
      )}

      {showApiKeyModal && (
        <div className="fixed inset-0 bg-slate-900/95 z-[4000] flex items-center justify-center p-4 backdrop-blur-xl" onClick={() => hasApiKey && setShowApiKeyModal(false)}>
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-black text-blue-600 uppercase tracking-tighter">{getUI(lang, 'selectKey')}</h2>
               {hasApiKey && <button onClick={() => setShowApiKeyModal(false)} className="text-slate-300 hover:text-red-500 font-black">✕</button>}
             </div>
             
             {!hasApiKey && (
               <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-amber-800 text-xs font-bold text-center leading-relaxed">
                 ⚠️ {getUI(lang, 'forceKeyWarning')}
               </div>
             )}

             <div className="space-y-4">
               <div className="flex flex-col gap-2">
                 <p className="text-xs font-black text-black uppercase tracking-widest">{getUI(lang, 'nameLabel')}</p>
                 <input 
                   type="text" 
                   value={studentName} 
                   onChange={(e) => setStudentName(e.target.value)} 
                   placeholder={getUI(lang, 'namePlaceholder')} 
                   className="w-full bg-emerald-50 border-2 border-blue-500 rounded-2xl px-5 py-3 font-bold outline-none text-center text-sm text-slate-800" 
                 />
               </div>

               <div className="flex flex-col gap-2">
                 <p className="text-xs font-black text-black uppercase tracking-widest">Bước 1:</p>
                 <a 
                   href="https://aistudio.google.com/app/apikey" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="bg-blue-50 text-blue-600 font-black py-3 rounded-2xl border-2 border-blue-100 hover:bg-blue-100 transition-all text-center flex items-center justify-center gap-2 group text-sm"
                 >
                   <span className="text-lg group-hover:scale-125 transition-transform">🔑</span>
                   {getUI(lang, 'getApiKey')}
                 </a>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hướng dẫn:</p>
                   <p className="text-[11px] text-slate-600 font-medium">{getUI(lang, 'keyStep1')}</p>
                   <p className="text-[11px] text-slate-600 font-medium">{getUI(lang, 'keyStep2')}</p>
                   <p className="text-[11px] text-slate-600 font-medium">{getUI(lang, 'keyStep3')}</p>
                 </div>
                 <p className="text-[10px] text-slate-400 text-center italic">{getUI(lang, 'apiKeyHint')}</p>
               </div>

               <div className="flex flex-col gap-2">
                 <p className="text-xs font-black text-black uppercase tracking-widest">Bước 2:</p>
                 <input 
                   type="password" 
                   value={tempApiKey} 
                   onChange={(e) => setTempApiKey(e.target.value)} 
                   onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
                   placeholder={getUI(lang, 'pasteApiKey')} 
                   className="w-full bg-emerald-50 border-2 border-blue-500 rounded-2xl px-5 py-3 font-bold outline-none text-center text-sm text-slate-800" 
                 />
               </div>

               <button 
                 onClick={handleSaveApiKey} 
                 className="w-full bg-blue-600 text-white font-black py-3 rounded-2xl shadow-lg uppercase text-sm transition-all active:scale-95 hover:bg-blue-700"
               >
                 {getUI(lang, 'saveKey')}
               </button>
             </div>
          </div>
        </div>
      )}

      {showLockModal && (
        <div className="fixed inset-0 bg-slate-900/90 z-[3000] flex items-center justify-center p-4 backdrop-blur-xl" onClick={() => setShowLockModal(false)}>
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black text-[#059669] uppercase tracking-tighter">{getUI(lang, 'lockTitle')}</h2><button onClick={() => setShowLockModal(false)} className="text-slate-300 hover:text-red-500 font-black">X</button></div>
             <input type="password" value={lockInput} onChange={(e) => setLockInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlock()} placeholder={getUI(lang, 'lockPlaceholder')} className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 mb-6 font-bold focus:border-yellow-500 outline-none text-center tracking-widest" />
             <button onClick={handleUnlock} className="w-full bg-yellow-500 text-slate-900 font-black py-3 rounded-xl shadow-lg uppercase text-[12px] transition-all active:scale-95">XÁC THỰC</button>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/90 z-[150] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setShowExportModal(false)}>
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black text-[#059669] uppercase tracking-tighter">{getUI(lang, 'exportTitle')}</h2><button onClick={() => setShowExportModal(false)} className="text-slate-300 hover:text-red-500 font-black">X</button></div>
             <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{getUI(lang, 'exportName')}</p>
             <input type="text" value={exportFileName} onChange={(e) => setExportFileName(e.target.value)} className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 mb-6 font-bold focus:border-[#059669] outline-none" />
             <div className="grid grid-cols-2 gap-3">
               <button onClick={handleCopyCode} className="bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all uppercase text-[10px]">{getUI(lang, 'copy')}</button>
               <button onClick={handleDownloadFile} className="bg-[#059669] text-white font-black py-3 rounded-xl shadow-lg hover:bg-[#065f46] transition-all uppercase text-[10px]">{getUI(lang, 'saveBtn')}</button>
             </div>
          </div>
        </div>
      )}

      {showExamples && (
        <div className="fixed inset-0 bg-slate-900/80 z-[150] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setShowExamples(false)}>
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center bg-emerald-50">
              <h2 className="text-xl font-black text-emerald-800 uppercase tracking-widest">{getUI(lang, 'lessonTitle')}</h2>
              <button onClick={() => setShowExamples(false)} className="text-slate-400 hover:text-red-500 font-black text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {PYTHON_EXAMPLES.map((ex, i) => (
                <div key={i} className="p-4 border-2 border-emerald-100 rounded-2xl hover:border-emerald-500 transition-all cursor-pointer group bg-white" onClick={() => { setCode(ex.code); setShowExamples(false); setActiveFileId(files[0].id); }}>
                  <h3 className="font-black text-emerald-700 mb-1 group-hover:text-emerald-900">{ex.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{ex.description}</p>
                  <pre className="text-[10px] bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono overflow-x-auto">{ex.code}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLangMenu && (
        <div className="fixed inset-0 bg-slate-900/60 z-[150] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowLangMenu(false)}>
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-xs p-6 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-center text-slate-800 mb-6 uppercase tracking-widest">{getUI(lang, 'langTitle')}</h2>
            <div className="grid grid-cols-1 gap-2">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => { setLang(l.code); setShowLangMenu(false); }} className={`flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${lang === l.code ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                  <span className="text-2xl">{l.flag}</span>
                  <span className="font-bold">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="px-4 py-1 text-[9px] text-slate-500 bg-slate-900 border-t border-slate-800 flex justify-between shrink-0">
        <div className="flex gap-4 uppercase tracking-tighter">
          <span>{getUI(lang, 'file')}: <span className="text-slate-300">{activeFile.name}</span></span>
          <span>{getUI(lang, 'line')}: <span className="text-slate-300">{lineCount}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-500 uppercase opacity-80 tracking-widest">Python Academy &bull; Thầy Kha</span>
          {isUnlocked && <span className="text-[7px] bg-yellow-600 text-white px-1 rounded font-black">MASTER</span>}
        </div>
      </footer>
    </div>
  );
};

export default App;
