import React, { useState, useEffect, useRef } from "react";
import { 
  Smartphone, 
  Database, 
  Code, 
  BookOpen, 
  Copy, 
  Check, 
  RotateCcw, 
  Key, 
  Mail, 
  Lock, 
  User, 
  Plus, 
  Minus, 
  Info, 
  X, 
  ChevronRight, 
  Trash2, 
  History, 
  FileText, 
  SmartphoneIcon, 
  ExternalLink,
  Github,
  CheckCircle,
  HelpCircle,
  Sunset,
  Moon,
  Sun,
  Shield,
  Send,
  Sparkles,
  ToggleLeft,
  AlertTriangle,
  Flame,
  CheckCheck,
  CircleAlert
} from "lucide-react";
import { EXPO_PROJECT_FILES, ExpoFile } from "./data/expoFiles";

// Definindo interfaces para o nosso banco de dados simulado
interface SimulatedUser {
  id: string;
  email: string;
  fullName: string;
  password?: string;
  createdAt: string;
}

interface SimulatedCalculo {
  id: string;
  user_id: string;
  expressao: string;
  resultado: string;
  data_hora: string;
}

interface LogEntry {
  timestamp: string;
  type: "AUTH" | "DATABASE" | "APP";
  message: string;
  isSuccess: boolean;
}

export default function App() {
  // Estado do painel principal
  const [selectedMainTab, setSelectedMainTab] = useState<"simulator" | "code" | "database" | "guide">("simulator");
  const [activeCodeFileIndex, setActiveCodeFileIndex] = useState(0);
  const [codeCopied, setCodeCopied] = useState(false);
  const [dbCopied, setDbCopied] = useState(false);
  const [guideCopied, setGuideCopied] = useState(false);

  // Estados do Simulador de Banco de Dados local (LocalStorage)
  const [dbUsers, setDbUsers] = useState<SimulatedUser[]>([]);
  const [dbCalculos, setDbCalculos] = useState<SimulatedCalculo[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sessionLogs, setSessionLogs] = useState<LogEntry[]>([]);

  // Relógio do celular na barra de status
  const [mobileTime, setMobileTime] = useState("");

  // Controladores de formulário dentro da tela do celular
  const [mobileScreen, setMobileScreen] = useState<"LOGIN" | "REGISTER" | "FORGOT" | "APP">("LOGIN");
  const [activeAppTab, setActiveAppTab] = useState<"CALC" | "HIST" | "PROF">("CALC");
  const [isMobileDarkMode, setIsMobileDarkMode] = useState(true);

  // Form Fields do celular
  const [loginEmail, setLoginEmail] = useState("muriloheroflu@gmail.com");
  const [loginPassword, setLoginPassword] = useState("123456");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [profNewPass, setProfNewPass] = useState("");
  const [profConfirmPass, setProfConfirmPass] = useState("");

  // Alerta interno do celular
  const [mobileAlert, setMobileAlert] = useState<{ title: string; message: string; type: "error" | "success" | "info" } | null>(null);

  // Estados da calculadora simulada
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcEquation, setCalcEquation] = useState("");
  const [calcIsFinished, setCalcIsFinished] = useState(false);

  // Log de auditoria helper
  const addLog = (type: "AUTH" | "DATABASE" | "APP", message: string, isSuccess: boolean = true) => {
    const timestamp = new Date().toLocaleTimeString("pt-BR", { hour12: false });
    setSessionLogs(prev => [{ timestamp, type, message, isSuccess }, ...prev].slice(0, 40));
  };

  // Inicialização e sementes do Banco de Dados
  useEffect(() => {
    // Sincronizar Relógio do Celular
    const updateClock = () => {
      const now = new Date();
      setMobileTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);

    // Carregar Banco de Dados do localStorage
    const savedUsers = localStorage.getItem("expo_calc_users");
    const savedCalculos = localStorage.getItem("expo_calc_exprs");

    let loadedUsers: SimulatedUser[] = [];
    let loadedCalculos: SimulatedCalculo[] = [];

    if (savedUsers) {
      loadedUsers = JSON.parse(savedUsers);
    } else {
      // Semente de Usuário Padrão
      loadedUsers = [
        {
          id: "usr-4921-bc74",
          email: "muriloheroflu@gmail.com",
          fullName: "Murilo Hero",
          password: "123456",
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem("expo_calc_users", JSON.stringify(loadedUsers));
    }

    if (savedCalculos) {
      loadedCalculos = JSON.parse(savedCalculos);
    } else {
      // Sementes de Cálculos do Usuário
      loadedCalculos = [
        {
          id: "calc-1",
          user_id: "usr-4921-bc74",
          expressao: "250 + 420 × 2",
          resultado: "1090",
          data_hora: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: "calc-2",
          user_id: "usr-4921-bc74",
          expressao: "1500 ÷ 12",
          resultado: "125",
          data_hora: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          id: "calc-3",
          user_id: "usr-4921-bc74",
          expressao: "800 - 15%",
          resultado: "680",
          data_hora: new Date(Date.now() - 864 * 360000).toISOString()
        }
      ];
      localStorage.setItem("expo_calc_exprs", JSON.stringify(loadedCalculos));
    }

    setDbUsers(loadedUsers);
    setDbCalculos(loadedCalculos);

    addLog("DATABASE", "Supabase DB Core Simulador Inicializado e Sementes Carregadas");
    addLog("AUTH", "Sessão iniciada como Convidado na porta local 19002");

    return () => clearInterval(timer);
  }, []);

  // Persistir DB do simulador sempre que carregar ou mudar
  const persistUsers = (usersList: SimulatedUser[]) => {
    setDbUsers(usersList);
    localStorage.setItem("expo_calc_users", JSON.stringify(usersList));
  };

  const persistCalculos = (calculosList: SimulatedCalculo[]) => {
    setDbCalculos(calculosList);
    localStorage.setItem("expo_calc_exprs", JSON.stringify(calculosList));
  };

  // Funções de Autenticação do Celular
  const handleMobileLogin = () => {
    if (!loginEmail || !loginPassword) {
      triggerMobileAlert("Preencha Tudo", "Por favor, digite seu e-mail e senha de teste.", "error");
      addLog("AUTH", "Login de teste rejeitado: campos em branco", false);
      return;
    }

    // Procurar usuário
    const user = dbUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    
    if (!user) {
      triggerMobileAlert("Cadastro não encontrado", "Este e-mail não está registrado no Supabase simulado.", "error");
      addLog("AUTH", `Falha de autenticação Supabase: Usuário não existe (${loginEmail})`, false);
      return;
    }

    if (user.password !== loginPassword) {
      triggerMobileAlert("Autenticação Falhou", "Senha incorreta para esta simulação.", "error");
      addLog("AUTH", `Falha de autenticação Supabase: Senha inválida para ${loginEmail}`, false);
      return;
    }

    // Sucesso
    setCurrentUserId(user.id);
    setMobileScreen("APP");
    setActiveAppTab("CALC");
    addLog("AUTH", `Supabase Auth: Token JWT gerado para ${user.fullName} (${user.email}). Sessão Salva.`, true);
    triggerMobileAlert("Bem-vindo!", `Logado com sucesso como ${user.fullName}`, "success");
    
    // Limpar campos
    setLoginPassword("");
  };

  const handleMobileRegister = () => {
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      triggerMobileAlert("Aviso", "Preencha todos os campos obrigatórios.", "error");
      addLog("AUTH", "Cadastro no Supabase impedido: campos incompletos", false);
      return;
    }

    if (regPassword !== regConfirm) {
      triggerMobileAlert("Falha na confirmação", "As duas senhas preenchidas não conferem.", "error");
      addLog("AUTH", "Cadastro no Supabase impedido: divergência em senhas", false);
      return;
    }

    if (regPassword.length < 6) {
      triggerMobileAlert("SenhaFraca", "Seu código de acesso deve ter pelo menos 6 dígitos.", "error");
      addLog("AUTH", "Cadastro impedido: regra de complexidade de senha violada", false);
      return;
    }

    // Email duplicado
    const exists = dbUsers.some(u => u.email.toLowerCase() === regEmail.toLowerCase());
    if (exists) {
      triggerMobileAlert("Email Registrado", "Esse endereço de e-mail já pertence a uma conta ativa.", "error");
      addLog("AUTH", `Erro Supabase Auth: Cadastro duplo para ${regEmail}`, false);
      return;
    }

    // Criar usuário
    const newUser: SimulatedUser = {
      id: "usr-" + Math.floor(Math.random() * 9000 + 1000) + "-xbd3",
      email: regEmail,
      fullName: regName,
      password: regPassword,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...dbUsers, newUser];
    persistUsers(updatedUsers);

    addLog("AUTH", `Supabase Auth: Cadastrado ${newUser.fullName} com ID ${newUser.id} e JWT`, true);
    triggerMobileAlert("Sucesso!", "Sua conta fictícia foi gerada com perfil Supabase. Favor realizar login.", "success");
    
    // Configurar login com o recém-criado
    setLoginEmail(regEmail);
    setLoginPassword(regPassword);
    
    // Limpar campos de cadastro
    setRegName("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirm("");
    setMobileScreen("LOGIN");
  };

  const handleMobileForgotPassword = () => {
    if (!forgotEmail) {
      triggerMobileAlert("E-mail necessário", "Escreva o e-mail cadastrado antes de enviar.", "error");
      return;
    }
    
    addLog("AUTH", `Supabase Auth: Solicitada redefinição para ${forgotEmail}`, true);
    triggerMobileAlert("E-mail Enviado!", `Um e-mail de redefinição fictício foi remetido para ${forgotEmail}.`, "success");
    setForgotEmail("");
    setMobileScreen("LOGIN");
  };

  const handleMobilePasswordChange = () => {
    if (!profNewPass || !profConfirmPass) {
      triggerMobileAlert("Erro", "Preencha os dois campos de nova senha.", "error");
      return;
    }

    if (profNewPass !== profConfirmPass) {
      triggerMobileAlert("Diferença Encontrada", "As senhas não se correspondem.", "error");
      return;
    }

    // Atualizar
    const updatedUsers = dbUsers.map(u => {
      if (u.id === currentUserId) {
        return { ...u, password: profNewPass };
      }
      return u;
    });

    persistUsers(updatedUsers);
    addLog("AUTH", "Supabase Auth: Alterada senha do usuário ativo com sucesso", true);
    triggerMobileAlert("Sucesso!", "Sua senha foi redefinida no Supabase local de teste.", "success");
    setProfNewPass("");
    setProfConfirmPass("");
  };

  const handleMobileLogout = () => {
    const user = dbUsers.find(u => u.id === currentUserId);
    addLog("AUTH", `Supabase Auth: Sessão terminada para ${user?.fullName ?? "Desconhecido"}`);
    setCurrentUserId(null);
    setMobileScreen("LOGIN");
    triggerMobileAlert("Desconectado", "Você encerrou a sessão no aplicativo", "info");
  };

  // Triggers de Alertas do celular simulado
  const triggerMobileAlert = (title: string, message: string, type: "error" | "success" | "info") => {
    setMobileAlert({ title, message, type });
    setTimeout(() => {
      setMobileAlert(null);
    }, 4500);
  };

  // Funções da calculadora simulada
  const handleCalcKeyPress = (label: string, type: "num" | "op" | "etc") => {
    // Tocar feedback sonoro simples se suportado ou visual
    if (type === "num") {
      if (calcDisplay === "0" || calcDisplay === "Erro" || calcIsFinished) {
        setCalcDisplay(label);
        setCalcIsFinished(false);
      } else {
        setCalcDisplay(calcDisplay + label);
      }
    } else if (type === "op") {
      // Evitar múltiplos operadores consecutivos
      const lastChar = calcDisplay.trim().slice(-1);
      if (["+", "-", "×", "÷", "%"].includes(lastChar)) {
        setCalcDisplay(calcDisplay.slice(0, -1) + label);
      } else {
        setCalcDisplay(calcDisplay + " " + label + " ");
      }
      setCalcIsFinished(false);
    } else if (label === "C") {
      setCalcDisplay("0");
      setCalcEquation("");
      setCalcIsFinished(false);
    } else if (label === "=") {
      // Avaliação da expressão
      try {
        let mathExpr = calcDisplay
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/%/g, "/100");

        // Executar math de forma segura
        // Limpar espaços extras
        mathExpr = mathExpr.replace(/\s+/g, "");

        // Validar apenas caracteres matemáticos seguros
        if (!/^[0-9+\-*/().]+$/.test(mathExpr)) {
          throw new Error("Caracteres inválidos na expressão");
        }

        const result = Function(`"use strict"; return (${mathExpr})`)();
        
        if (result === undefined || isNaN(result) || !isFinite(result)) {
          setCalcDisplay("Erro");
          addLog("APP", `Erro matemático ao calcular "${calcDisplay}": resultado indefinido`, false);
          return;
        }

        const formattedResult = Number(Number(result).toFixed(6)).toString();
        
        setCalcEquation(calcDisplay + " =");
        setCalcDisplay(formattedResult);
        setCalcIsFinished(true);

        // Salvar automaticamente no Supabase simulado se estuar logado
        if (currentUserId) {
          const newCalc: SimulatedCalculo = {
            id: "calc-" + Date.now(),
            user_id: currentUserId,
            expressao: calcDisplay,
            resultado: formattedResult,
            data_hora: new Date().toISOString()
          };
          const updatedCalculos = [newCalc, ...dbCalculos];
          persistCalculos(updatedCalculos);
          addLog("DATABASE", `Supabase DB: Sucesso ao salvar cálculo ${calcDisplay} = ${formattedResult} na tabela 'historico_calculos'`, true);
        } else {
          addLog("APP", `Cálculo concluído localmente: ${calcDisplay} = ${formattedResult}, mas sem login para salvar.`, false);
        }

      } catch (err) {
        setCalcDisplay("Erro");
        addLog("APP", `Erro de sintaxe matemática na expressão "${calcDisplay}"`, false);
      }
    }
  };

  // Excluir cálculo individual
  const handleDeleteCalculo = (id: string, name: string) => {
    const updated = dbCalculos.filter(c => c.id !== id);
    persistCalculos(updated);
    addLog("DATABASE", `Supabase DB: Removido item de ID ${id} da tabela 'historico_calculos'`, true);
    triggerMobileAlert("Cálculo Apagado", "Visualização excluída com sucesso", "info");
  };

  // Limpar todo o histórico do usuário logado
  const handleClearAllHistory = () => {
    if (!currentUserId) return;
    const itemsFiltered = dbCalculos.filter(c => c.user_id !== currentUserId);
    persistCalculos(itemsFiltered);
    addLog("DATABASE", `Supabase DB: Limpeza completa de registros solicitada para o usuário ID ${currentUserId}`, true);
    triggerMobileAlert("Histórico Limpo", "Todos os seus registros foram deletados.", "info");
  };

  // Copiar código da aba do explorer de código
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopyDb = (code: string) => {
    navigator.clipboard.writeText(code);
    setDbCopied(true);
    setTimeout(() => setDbCopied(false), 2000);
  };

  // Informações úteis do usuário logado no celular
  const currentUserObj = dbUsers.find(u => u.id === currentUserId);

  // Lista de cálculos do usuário logado
  const currentUserHistory = dbCalculos.filter(c => c.user_id === currentUserId);

  return (
    <div id="applet-root" className="min-h-screen bg-[#070b19] bg-radial-to-br from-[#0c1435] via-[#070b19] to-[#04060d] text-slate-100 font-sans flex flex-col antialiased selection:bg-indigo-600 selection:text-white relative overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_40%)] before:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.06),transparent_40%)] after:pointer-events-none">
      
      {/* HEADER DE COMANDO GERAL */}
      <header className="border-b border-indigo-500/10 bg-slate-950/65 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md shadow-indigo-500/5">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-500 via-pink-500 to-rose-500 rounded-2xl p-2.5 shadow-lg shadow-indigo-500/30">
            <Smartphone className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-rose-400 font-sans">CalPro</h1>
              <span className="bg-emerald-500/15 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium border border-emerald-500/25 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Expo Go Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">Plataforma de Desenvolvimento e Visualização do Aplicativo de Calculadora com Supabase</p>
          </div>
        </div>

        {/* Informações Rápidas e Botão de Exportar */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-indigo-950/40 border border-indigo-500/20 shadow-xs shadow-indigo-500/5 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-slate-300">Supabase: <strong className="text-white">Active</strong></span>
          </div>
          <div className="bg-rose-950/40 border border-rose-500/20 shadow-xs shadow-rose-500/5 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <SmartphoneIcon className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-mono text-slate-300">Simulador: <strong className="text-emerald-400">Online</strong></span>
          </div>
        </div>
      </header>

      {/* WORKSPACE CENTRAL - SPLIT PANEL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA (12/5) - O SMARTPHONE EMULATOR */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          <div className="w-full text-center mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-300 font-mono mb-1">📱 Simulador Tátil Integrado</h2>
            <p className="text-xs text-slate-400">Experimente o aplicativo de celular em tempo real antes de exportar o código</p>
          </div>

          {/* IPHONE 15 PHYSICAL FRAME */}
          <div className="relative w-[340px] h-[670px] bg-slate-950 rounded-[54px] p-3.5 shadow-[0_0_80px_rgba(99,102,241,0.22)] ring-12 ring-slate-900/90 overflow-hidden flex flex-col select-none border border-indigo-500/20">
            
            {/* Dynamic Island (Câmera Notch) */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-center px-2 border border-slate-800/40 shadow-inner">
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full mr-auto border border-white/5"></div>
              <div className="w-1.5 h-1.5 bg-indigo-950 rounded-full border border-white/5"></div>
            </div>

            {/* Speaker Top Notch Bar */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-neutral-900 rounded-full z-40"></div>

            {/* Apple Internals Frame Overlay (Status Bar) */}
            <div className={`h-11 px-6 pt-3 flex justify-between items-center z-30 font-sans font-medium text-xs rounded-t-[40px] select-none ${isMobileDarkMode ? "bg-slate-950/90 text-slate-300" : "bg-[#f1f3f7] text-slate-700"}`}>
              <span className="text-[11px] select-none transition-all duration-300 font-mono font-semibold">{mobileTime}</span>
              <div className="flex items-center gap-1.5">
                {/* Antenas */}
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 3c-1.2 0-2.4.2-3.6.7L12 8.3l3.6-4.6c-1.2-.5-2.4-.7-3.6-.7zm0 13c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm0-10c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z"/>
                </svg>
                {/* Wifi */}
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L12 15v5c.34 0 .67-.03 1-.07zm1-1.08V14l-5.91-5.91c.75-2.33 2.92-4 5.5-4 3.03 0 5.5 2.18 5.91 5h1c-.42-3.37-3.26-6-6.73-6-3.94 0-7.14 3.14-7.27 7.07L11.5 16h2.5c0-.42.08-.83.22-1.21L14 16.85z"/>
                </svg>
                {/* Bateria */}
                <div className="w-4.5 h-2.5 rounded-xs p-0.5 border flex items-center border-current">
                  <div className="h-full w-[85%] bg-current rounded-3xs"></div>
                </div>
              </div>
            </div>

            {/* MOBILE NOTIFICATION TOAST OVERLAY (Simulated iOS Banner) */}
            {mobileAlert && (
              <div className="absolute top-14 left-4 right-4 bg-slate-950/95 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-3 shadow-2xl z-50 flex items-start gap-2.5 animate-bounce ring-1 ring-indigo-500/30">
                <div className={`p-1.5 rounded-lg ${
                  mobileAlert.type === "error" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                  mobileAlert.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                }`}>
                  {mobileAlert.type === "error" ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white leading-tight truncate">{mobileAlert.title}</h4>
                  <p className="text-[10px] text-slate-300 leading-normal mt-0.5 pr-2 break-words">{mobileAlert.message}</p>
                </div>
              </div>
            )}

            {/* APP CONTENT WRAPPER */}
            <div className={`flex-1 rounded-b-[36px] flex flex-col relative overflow-hidden font-sans transition-all duration-300 ${
              isMobileDarkMode ? "bg-gradient-to-b from-[#090e1d] to-[#04060c] text-slate-100" : "bg-gradient-to-b from-[#f8fafc] to-[#eef2f6] text-slate-900"
            }`}>

              {/* TELA DE LOGIN */}
              {mobileScreen === "LOGIN" && (
                <div className="flex-1 flex flex-col justify-center px-6 py-4 font-sans">
                  <div className="text-center mb-6">
                    <div className="w-13 h-13 mx-auto bg-gradient-to-tr from-indigo-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center text-white mb-2.5 shadow-md shadow-indigo-500/20">
                      <Smartphone className="w-6.5 h-6.5 animate-float" />
                    </div>
                    <h3 className={`text-2xl font-extrabold font-sans bg-clip-text text-transparent bg-gradient-to-r ${isMobileDarkMode ? "from-indigo-300 via-pink-300 to-rose-300" : "from-indigo-600 via-pink-650 to-rose-600"} tracking-tight`}>CalPro</h3>
                    <p className={`text-[11px] mt-1 font-medium ${isMobileDarkMode ? "text-slate-400" : "text-slate-500"}`}>Sua calculadora integrada com Supabase Auth</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isMobileDarkMode ? "text-indigo-300" : "text-slate-505"}`}>E-mail</label>
                      <div className="relative">
                        <input 
                           type="email" 
                           value={loginEmail}
                           onChange={(e) => setLoginEmail(e.target.value)}
                           placeholder="exemplo@email.com"
                           className={`w-full h-10 px-3 pl-9 rounded-xl text-sm border focus:outline-none transition-all ${
                             isMobileDarkMode 
                               ? "bg-slate-900/50 border-slate-800 text-white placeholder-slate-650 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50" 
                               : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50"
                           }`}
                        />
                        <Mail className={`absolute left-3 top-3 w-4 h-4 ${isMobileDarkMode ? "text-slate-600" : "text-slate-400"}`} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${isMobileDarkMode ? "text-indigo-300" : "text-slate-505"}`}>Senha</label>
                        <button 
                          onClick={() => setMobileScreen("FORGOT")}
                          className="text-[10px] font-bold text-pink-500 hover:text-pink-400 hover:underline"
                        >
                          Esqueceu?
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                           type="password" 
                           value={loginPassword}
                           onChange={(e) => setLoginPassword(e.target.value)}
                           placeholder="••••••••"
                           className={`w-full h-10 px-3 pl-9 rounded-xl text-sm border focus:outline-none transition-all ${
                             isMobileDarkMode 
                               ? "bg-slate-900/50 border-slate-800 text-white placeholder-slate-650 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50" 
                               : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50"
                           }`}
                        />
                        <Lock className={`absolute left-3 top-3 w-4 h-4 ${isMobileDarkMode ? "text-slate-600" : "text-slate-400"}`} />
                      </div>
                    </div>

                    <button 
                      onClick={handleMobileLogin}
                      className="w-full h-10 mt-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase shadow-md shadow-indigo-500/10 transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Entrar</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="text-center pt-1.5">
                      <p className="text-[11px] text-slate-500 font-medium">
                        Não tem uma conta?{" "}
                        <button 
                          onClick={() => setMobileScreen("REGISTER")}
                          className="font-bold text-indigo-500 hover:text-indigo-400 hover:underline"
                        >
                          Cadastre-se
                        </button>
                      </p>
                    </div>

                    {/* Preconcebidos para agilizar */}
                    <div className="border-t border-slate-800/10 dark:border-indigo-500/5 pt-3.5 mt-2">
                      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-2.5 text-center">
                        <span className="text-[9px] text-indigo-400 font-bold block mb-1">💡 DICA DE TESTE RÁPIDO</span>
                        <div className="flex justify-center gap-1.5">
                          <button 
                            type="button"
                            onClick={() => {
                              setLoginEmail("muriloheroflu@gmail.com");
                              setLoginPassword("123456");
                              addLog("APP", "Utilizado usuário padrão Murilo Hero para preenchimento de teste");
                            }}
                            className="bg-indigo-650/15 hover:bg-indigo-600/35 text-indigo-400 border border-indigo-550/20 text-[9px] font-bold py-1 px-2.5 rounded-lg transition-all"
                          >
                            Usar Conta Murilo (123456)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TELA DE CADASTRO */}
              {mobileScreen === "REGISTER" && (
                <div className="flex-1 flex flex-col justify-center px-6 py-4 font-sans">
                  <div className="mb-3">
                    <button 
                      onClick={() => setMobileScreen("LOGIN")}
                      className="text-[11px] text-indigo-500 font-bold flex items-center gap-1 hover:underline mb-1"
                    >
                      ← Voltar ao login
                    </button>
                    <h3 className={`text-xl font-extrabold ${isMobileDarkMode ? "text-white" : "text-slate-800"} tracking-tight`}>Criar Conta Supabase</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Registre suas credenciais na autenticação corporativa</p>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[390px] pr-1">
                    <div>
                      <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isMobileDarkMode ? "text-indigo-300" : "text-slate-500"}`}>Nome Completo</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Seu nome"
                          className={`w-full h-9 px-3 pl-8.5 rounded-xl text-xs border focus:outline-none transition-all ${
                            isMobileDarkMode 
                              ? "bg-slate-900/50 border-slate-800 text-white placeholder-slate-700 focus:border-indigo-500" 
                              : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                          }`}
                        />
                        <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isMobileDarkMode ? "text-indigo-300" : "text-slate-500"}`}>E-mail</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="seu@parceiro.com"
                          className={`w-full h-9 px-3 pl-8.5 rounded-xl text-xs border focus:outline-none transition-all ${
                            isMobileDarkMode 
                              ? "bg-slate-900/50 border-slate-800 text-white placeholder-slate-700 focus:border-indigo-500" 
                              : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                          }`}
                        />
                        <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isMobileDarkMode ? "text-indigo-300" : "text-slate-500"}`}>Senha</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min. 6 caracteres"
                          className={`w-full h-9 px-3 pl-8.5 rounded-xl text-xs border focus:outline-none transition-all ${
                            isMobileDarkMode 
                              ? "bg-slate-900/50 border-slate-800 text-white placeholder-slate-700 focus:border-indigo-500" 
                              : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                          }`}
                        />
                        <Lock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isMobileDarkMode ? "text-indigo-300" : "text-slate-500"}`}>Confirmar Senha</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          value={regConfirm}
                          onChange={(e) => setRegConfirm(e.target.value)}
                          placeholder="Repita a senha"
                          className={`w-full h-9 px-3 pl-8.5 rounded-xl text-xs border focus:outline-none transition-all ${
                            isMobileDarkMode 
                              ? "bg-slate-900/50 border-slate-800 text-white placeholder-slate-700 focus:border-indigo-500" 
                              : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                          }`}
                        />
                        <Lock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </div>

                    <button 
                      onClick={handleMobileRegister}
                      className="w-full h-9.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-extrabold rounded-xl text-xs uppercase shadow-md tracking-wider transition-all active:scale-[0.97] cursor-pointer"
                    >
                      Concluir Cadastro
                    </button>
                  </div>
                </div>
              )}

              {/* TELA DE ESQUECI MINHA SENHA */}
              {mobileScreen === "FORGOT" && (
                <div className="flex-1 flex flex-col justify-center px-6 py-4 font-sans">
                  <div className="mb-5">
                    <button 
                      onClick={() => setMobileScreen("LOGIN")}
                      className="text-[11px] text-indigo-500 font-bold flex items-center gap-1 hover:underline mb-1"
                    >
                      ← Voltar ao login
                    </button>
                    <h3 className={`text-xl font-extrabold ${isMobileDarkMode ? "text-white" : "text-slate-800"} tracking-tight`}>Recuperar Acesso</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Enviaremos orientações automáticas de redefinição via e-mail</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isMobileDarkMode ? "text-indigo-300" : "text-slate-500"}`}>Insira seu E-mail Cadastrado</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="exemplo@email.com"
                          className={`w-full h-10 px-3 pl-9 rounded-xl text-sm border focus:outline-none transition-all ${
                            isMobileDarkMode 
                              ? "bg-slate-900/50 border-slate-800 text-white placeholder-slate-705 focus:border-indigo-500" 
                              : "bg-white border-slate-200 text-slate-805 placeholder-slate-400 focus:border-indigo-500"
                          }`}
                        />
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      </div>
                    </div>

                    <button 
                      onClick={handleMobileForgotPassword}
                      className="w-full h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.97]"
                    >
                      Disparar Link
                    </button>
                  </div>
                </div>
              )}

              {/* CORE APP LAYOUT (LOGIN EFETUADO COM SUCESSO DO USUÁRIO) */}
              {mobileScreen === "APP" && (
                <div className="flex-1 flex flex-col relative">
                  
                  {/* TAB 1: CALCULADORA CORE */}
                  {activeAppTab === "CALC" && (
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Área de Informação / Expressão */}
                      <div className={`p-4 pt-2.5 text-right transition-all flex flex-col justify-end min-h-[145px] ${
                        isMobileDarkMode 
                          ? "bg-slate-950/80 border-b border-indigo-500/10" 
                          : "bg-indigo-50/30 border-b border-indigo-500/10"
                      }`}>
                        {/* Indicador de Usuário no Topo do Celular */}
                        <div className="flex items-center justify-between mb-auto py-1">
                          <span className="text-[10px] text-indigo-400 font-mono font-bold flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            {currentUserObj?.fullName || "Murilo"}
                          </span>
                          <button 
                            title="Alternar Tema Claro/Escuro" 
                            onClick={() => setIsMobileDarkMode(!isMobileDarkMode)}
                            className="p-1 rounded-full text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
                          >
                            {isMobileDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
                          </button>
                        </div>
                        
                        <div className="text-slate-500 text-[12px] font-mono h-5 overflow-hidden tracking-tight">{calcEquation}</div>
                        <div className={`text-4xl font-black font-mono tracking-tighter truncate mt-1 ${isMobileDarkMode ? "text-white" : "text-slate-900"}`}>{calcDisplay}</div>
                      </div>
 
                      {/* Botões Táteis Teclado */}
                      <div className={`p-3 grid grid-cols-4 gap-2 transition-all ${
                        isMobileDarkMode ? "bg-slate-950/90 border-t border-slate-900" : "bg-white border-t border-slate-105"
                      }`}>
                        
                        {/* Linha 1 */}
                        <button 
                          onClick={() => handleCalcKeyPress("C", "etc")}
                          className="col-span-2 h-11 bg-rose-500/10 hover:bg-rose-500/20 text-rose-505 font-extrabold rounded-xl text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-rose-500/20"
                        >
                          Clear (C)
                        </button>
                        <button 
                          onClick={() => handleCalcKeyPress("%", "op")}
                          className={`h-11 rounded-xl text-sm font-extrabold transition-all active:scale-95 flex items-center justify-center border cursor-pointer ${
                            isMobileDarkMode 
                              ? "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800" 
                              : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          %
                        </button>
                        <button 
                          onClick={() => handleCalcKeyPress("÷", "op")}
                          className="h-11 bg-gradient-to-tr from-orange-500 to-rose-500 text-white rounded-xl text-base font-extrabold transition-all active:scale-95 hover:opacity-95 shadow-md shadow-orange-500/10 cursor-pointer"
                        >
                          ÷
                        </button>
 
                        {/* Linha 2 */}
                        {["7", "8", "9"].map(n => (
                          <button 
                            key={n}
                            onClick={() => handleCalcKeyPress(n, "num")}
                            className={`h-11 rounded-xl text-sm font-extrabold transition-all active:scale-95 border cursor-pointer ${
                              isMobileDarkMode 
                                ? "bg-slate-900/40 hover:bg-indigo-950/20 border-slate-850 text-slate-200 hover:text-white" 
                                : "bg-white hover:bg-slate-100 border-slate-200/60 text-slate-800 shadow-xs"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                        <button 
                          onClick={() => handleCalcKeyPress("×", "op")}
                          className="h-11 bg-gradient-to-tr from-orange-500 to-rose-500 text-white rounded-xl text-base font-extrabold transition-all active:scale-95 hover:opacity-95 shadow-md shadow-orange-500/10 cursor-pointer"
                        >
                          ×
                        </button>
 
                        {/* Linha 3 */}
                        {["4", "5", "6"].map(n => (
                          <button 
                            key={n}
                            onClick={() => handleCalcKeyPress(n, "num")}
                            className={`h-11 rounded-xl text-sm font-extrabold transition-all active:scale-95 border cursor-pointer ${
                              isMobileDarkMode 
                                ? "bg-slate-900/40 hover:bg-indigo-950/20 border-slate-850 text-slate-200 hover:text-white" 
                                : "bg-white hover:bg-slate-100 border-slate-200/60 text-slate-800 shadow-xs"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                        <button 
                          onClick={() => handleCalcKeyPress("-", "op")}
                          className="h-11 bg-gradient-to-tr from-orange-500 to-rose-500 text-white rounded-xl text-base font-extrabold transition-all active:scale-95 hover:opacity-95 shadow-md shadow-orange-500/10 cursor-pointer"
                        >
                          -
                        </button>
 
                        {/* Linha 4 */}
                        {["1", "2", "3"].map(n => (
                          <button 
                            key={n}
                            onClick={() => handleCalcKeyPress(n, "num")}
                            className={`h-11 rounded-xl text-sm font-extrabold transition-all active:scale-95 border cursor-pointer ${
                              isMobileDarkMode 
                                ? "bg-slate-900/40 hover:bg-indigo-950/20 border-slate-850 text-slate-200 hover:text-white" 
                                : "bg-white hover:bg-slate-100 border-slate-200/60 text-slate-800 shadow-xs"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                        <button 
                          onClick={() => handleCalcKeyPress("+", "op")}
                          className="h-11 bg-gradient-to-tr from-orange-500 to-rose-500 text-white rounded-xl text-base font-extrabold transition-all active:scale-95 hover:opacity-95 shadow-md shadow-orange-500/10 cursor-pointer"
                        >
                          +
                        </button>
 
                        {/* Linha 5 */}
                        <button 
                          onClick={() => handleCalcKeyPress("0", "num")}
                          className={`col-span-2 h-11 rounded-xl text-sm font-extrabold transition-all active:scale-95 border cursor-pointer ${
                            isMobileDarkMode 
                              ? "bg-slate-900/40 hover:bg-indigo-950/20 border-slate-850 text-slate-200 hover:text-white" 
                              : "bg-white hover:bg-slate-100 border-slate-200/60 text-slate-800 shadow-xs"
                          }`}
                        >
                          0
                        </button>
                        <button 
                          onClick={() => handleCalcKeyPress(".", "num")}
                          className={`h-11 rounded-xl text-sm font-extrabold transition-all active:scale-95 border cursor-pointer ${
                            isMobileDarkMode 
                              ? "bg-slate-900/40 hover:bg-indigo-950/20 border-slate-850 text-slate-200 hover:text-white" 
                              : "bg-white hover:bg-slate-100 border-slate-200/60 text-slate-800 shadow-xs"
                          }`}
                        >
                          .
                        </button>
                        <button 
                          onClick={() => handleCalcKeyPress("=", "etc")}
                          className="h-11 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl text-base font-extrabold transition-all active:scale-95 shadow-md shadow-indigo-500/20 hover:opacity-95 cursor-pointer"
                        >
                          =
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: HISTÓRICO DE CÁLCULOS */}
                  {activeAppTab === "HIST" && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className={`p-3 border-b flex items-center justify-between ${
                        isMobileDarkMode ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-205"
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {currentUserHistory.length} salvos no Supabase
                        </span>
                        {currentUserHistory.length > 0 && (
                          <button 
                            onClick={handleClearAllHistory}
                            className="text-[10px] text-rose-500 font-extrabold hover:underline"
                          >
                            Apagar Tudo
                          </button>
                        )}
                      </div>

                      {/* Lista de cálculos */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {currentUserHistory.length === 0 ? (
                          <div className="text-center py-12 px-4 flex flex-col items-center">
                            <History className="w-8 h-8 text-indigo-400 mb-2 stroke-1 animate-pulse" />
                            <p className="text-[11px] font-bold text-slate-500 leading-tight">Nenhum cálculo arquivado ainda.</p>
                            <p className="text-[10px] text-slate-600 mt-1 leading-normal text-center">Gere resultados clicando no sinal de (=) da calculadora.</p>
                          </div>
                        ) : (
                          currentUserHistory.map((item) => (
                            <div 
                              key={item.id} 
                              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all leading-snug ${
                                isMobileDarkMode 
                                  ? "bg-slate-900/40 border-slate-850 hover:border-slate-800 text-white" 
                                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-xs"
                              }`}
                            >
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="text-[11px] font-mono text-slate-400 truncate tracking-tight">{item.expressao}</p>
                                <p className="text-sm font-extrabold font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500 mt-0.5">= {item.resultado}</p>
                                <span className="text-[8px] text-slate-500 block mt-1 font-mono">
                                  {new Date(item.data_hora).toLocaleTimeString("pt-BR")} | {new Date(item.data_hora).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                              <button 
                                onClick={() => handleDeleteCalculo(item.id, item.expressao)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all rounded-lg"
                                title="Excluir cálculo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: PROMO / CONFIGURAÇÕES PERFIL */}
                  {activeAppTab === "PROF" && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      
                      {/* Cartão de Identidade do Cliente */}
                      <div className={`p-4 rounded-2xl border text-center relative overflow-hidden ${
                        isMobileDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-xs"
                      }`}>
                        <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-500 via-pink-500 to-rose-500 text-white flex items-center justify-center font-black text-lg mx-auto mb-2 shadow-md shadow-indigo-500/10">
                          {currentUserObj?.fullName?.charAt(0).toUpperCase() || "M"}
                        </div>
                        <h4 className="text-xs font-extrabold leading-tight">{currentUserObj?.fullName || "Murilo Hero"}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-1 select-all">{currentUserObj?.email}</p>
                        
                        <div className="mt-2.5 bg-indigo-550/10 text-indigo-400 py-0.5 px-3 rounded-full text-[8.5px] font-black uppercase tracking-wider inline-block border border-indigo-500/15">
                          Active Token via Supabase Auth
                        </div>
                      </div>

                      {/* Caixa de Alterar Senha solicitada */}
                      <div className={`p-3.5 rounded-2xl border ${
                        isMobileDarkMode ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-200"
                      }`}>
                        <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Alterar Senha do Cadastro</h5>
                        
                        <div className="space-y-2.5">
                          <input 
                            type="password" 
                            placeholder="Nova senha (mínimo 6)"
                            value={profNewPass}
                            onChange={(e) => setProfNewPass(e.target.value)}
                            className={`w-full h-8 px-2.5 rounded-xl text-[11px] border focus:outline-none transition-all ${
                              isMobileDarkMode 
                                ? "bg-slate-950 border-slate-850 text-white placeholder-slate-700 focus:border-indigo-500" 
                                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                            }`}
                          />
                          <input 
                            type="password" 
                            placeholder="Confirme nova senha"
                            value={profConfirmPass}
                            onChange={(e) => setProfConfirmPass(e.target.value)}
                            className={`w-full h-8 px-2.5 rounded-xl text-[11px] border focus:outline-none transition-all ${
                              isMobileDarkMode 
                                ? "bg-slate-950 border-slate-850 text-white placeholder-slate-700 focus:border-indigo-500" 
                                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                            }`}
                          />
                          <button 
                            type="button"
                            onClick={handleMobilePasswordChange}
                            className="w-full h-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold rounded-xl text-[10px] transition-all cursor-pointer shadow-xs uppercase tracking-wider active:scale-[0.98]"
                          >
                            Redefinir Dados
                          </button>
                        </div>
                      </div>

                      {/* Botão Logout Técnico */}
                      <button 
                        onClick={handleMobileLogout}
                        className="w-full h-9 rounded-xl border border-red-500/20 text-red-500 hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-red-500/5 cursor-pointer hover:border-red-500/30 active:scale-[0.98]"
                      >
                        Desconectar Conta (Sair)
                      </button>
                    </div>
                  )}

                  {/* BOTTOM MOBILE TAB NAVIGATOR */}
                  <div className={`h-13 border-t grid grid-cols-3 items-center text-center z-13 select-none ${
                    isMobileDarkMode ? "bg-slate-950 border-slate-900 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}>
                    <button 
                      onClick={() => setActiveAppTab("CALC")}
                      className={`h-full flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                        activeAppTab === "CALC" 
                          ? "text-indigo-505 font-black border-t-2 border-indigo-500" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-[9px]">Calculadora</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveAppTab("HIST")}
                      className={`h-full flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                        activeAppTab === "HIST" 
                          ? "text-indigo-505 font-black border-t-2 border-indigo-500" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <History className="w-4 h-4" />
                      <span className="text-[9px]">Histórico</span>
                    </button>

                    <button 
                      onClick={() => setActiveAppTab("PROF")}
                      className={`h-full flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                        activeAppTab === "PROF" 
                          ? "text-indigo-505 font-black border-t-2 border-indigo-500" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-[9px]">Perfil</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Apple Home Indicator Bar */}
            <div className="absolute bottom-1 right-0 left-0 h-4 flex items-center justify-center z-45">
              <div className="w-28 h-1 bg-slate-800 rounded-full"></div>
            </div>
          </div>

          {/* SIMULATED CONSOLE LOGS AT BOTTOM */}
          <div className="w-full max-w-[340px] mt-4 bg-slate-950/60 border border-slate-900 rounded-2xl p-3.5 shadow-sm shadow-indigo-500/5">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                Console Supabase Link
              </span>
              <button 
                onClick={() => setSessionLogs([])}
                className="text-[9px] text-slate-500 hover:text-pink-400 hover:underline font-extrabold"
              >
                Limpar Logs
              </button>
            </div>
            
            <div className="space-y-1 max-h-[100px] overflow-y-auto font-mono text-[9px] select-all leading-normal whitespace-pre-line text-slate-300 pr-1">
              {sessionLogs.length === 0 ? (
                <p className="text-slate-600 text-center py-1">Nenhum evento registrado ainda.</p>
              ) : (
                sessionLogs.map((log, index) => (
                  <div key={index} className="flex gap-1 items-start py-0.5 border-b border-indigo-900/5">
                    <span className="text-[8.5px] text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span className={`px-1.5 py-[1px] rounded-sm uppercase text-[7.5px] font-black shrink-0 ${
                      log.type === "AUTH" ? "bg-amber-500/10 text-amber-400 border border-amber-500/10" :
                      log.type === "DATABASE" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10" :
                      "bg-slate-800 text-slate-400"
                    }`}>
                      {log.type}
                    </span>
                    <span className="break-all">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (12/7) - DASHBOARD DESENVOLVEDOR */}
        <div className="lg:col-span-7 flex flex-col h-full">
          
          {/* TAB BAR DA DASHBOARD */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-1.5 flex flex-wrap gap-1 mb-5">
            <button
              onClick={() => setSelectedMainTab("simulator")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedMainTab === "simulator" 
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/15" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-905"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instruções Rápidas</span>
            </button>

            <button
              onClick={() => setSelectedMainTab("code")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedMainTab === "code" 
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/15" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-905"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Código React Native (Expo)</span>
            </button>

            <button
              onClick={() => setSelectedMainTab("database")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedMainTab === "database" 
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/15" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-905"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Estrutura SQL Supabase</span>
            </button>

            <button
              onClick={() => setSelectedMainTab("guide")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedMainTab === "guide" 
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/15" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-905"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Instalação & Configuração</span>
            </button>
          </div>

          {/* TAB CONTENT PANEL */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 md:p-6 flex-1 min-h-[500px] flex flex-col justify-between">
            
            {/* 1. ABA DE VISÃO GERAL / SIMULADOR DETALHES */}
            {selectedMainTab === "simulator" && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400 border border-indigo-500/10">
                    <Info className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white leading-snug tracking-tight">CalPro: Calculadora Corporativa Expo</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Visão geral sobre a simulação integrada e dados armazenados do Supabase</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-extrabold text-indigo-300 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      Sistema Supabase Auth
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Gerencie usuários com cadastro novo, controle de senha de no mínimo 6 caracteres, validação de coincidência de senha, logout ativo e recuperação rápida.
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono pt-1">
                      Instância de autenticação simulada localmente com feedbacks em JSON.
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-extrabold text-pink-300 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                      <Database className="w-3.5 h-3.5 text-pink-400" />
                      Sincronização de Histórico
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Toda expressão que você calcula no simulador usando o sinal (<strong className="text-indigo-400">=</strong>) é injetada automaticamente vinculada ao UID do usuário logado.
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono pt-1">
                      Armazenagem persistente com operações de delete vinculadas por perfil.
                    </div>
                  </div>
                </div>

                {/* Demonstração visual de contas integradas na simulação */}
                <div className="border border-slate-900 rounded-2xl p-4 bg-slate-950/50">
                  <h4 className="text-xs font-black text-slate-300 mb-3.5 uppercase font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                    Contas de teste registradas no Supabase Local ({dbUsers.length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] font-mono leading-normal">
                      <thead>
                        <tr className="border-b border-indigo-500/10 text-slate-400 text-left">
                          <th className="pb-2 font-black uppercase tracking-wider text-[10px]">Nome Completo</th>
                          <th className="pb-2 font-black uppercase tracking-wider text-[10px]">E-mail no Supabase</th>
                          <th className="pb-2 font-black uppercase tracking-wider text-[10px]">Senha</th>
                          <th className="pb-2 font-black uppercase tracking-wider text-[10px] text-right">Cálculos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-500/5">
                        {dbUsers.map(user => (
                          <tr key={user.id} className="text-slate-300 hover:bg-slate-900/10">
                            <td className="py-2.5 max-w-[120px] truncate font-bold text-white">{user.fullName}</td>
                            <td className="py-2.5 select-all text-indigo-300 max-w-[150px] truncate">{user.email}</td>
                            <td className="py-2.5 text-slate-400">{user.password}</td>
                            <td className="py-2.5 text-pink-400 font-extrabold text-right">{dbCalculos.filter(c => c.user_id === user.id).length} salvos</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-500/10 to-pink-500/5 border border-indigo-500/10 text-indigo-300 p-4 rounded-xl text-xs space-y-1.5">
                  <span className="font-extrabold block uppercase tracking-wider text-[10px] font-mono text-indigo-400">⚡ Destaque Rápido</span>
                  <p className="leading-relaxed">
                    Este simulador utiliza as mesmas regras arquitetônicas, componentes de UI e interações do <strong>React Native com Expo</strong>. Altere as abas superiores para acessar e copiar o código completo de produção do frontend em React Native e do banco Supabase!
                  </p>
                </div>
              </div>
            )}

            {/* 2. EXPLORER DE CÓDIGOS DO PROJETO */}
            {selectedMainTab === "code" && (
              <div className="space-y-4 flex-1 flex flex-col animate-fade-in">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-2 border-b border-indigo-500/10">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-indigo-400" />
                      Estrutura de Pastas do Aplicativo Móvel (React Native Expo)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Explore todos os arquivos prontos para acoplamento e produção</p>
                  </div>
                  <button
                    onClick={() => handleCopyCode(EXPO_PROJECT_FILES[activeCodeFileIndex].code)}
                    className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-95 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all select-none font-bold cursor-pointer"
                  >
                    {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{codeCopied ? "Copiado!" : "Copiar Arquivo"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 items-stretch">
                  
                  {/* Navegador de Árvore Física de Arquivos */}
                  <div className="md:col-span-4 bg-slate-950/80 border border-slate-900 rounded-2xl p-3 flex flex-col space-y-1 max-h-[460px] overflow-y-auto">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Estrutura de Pastas (src/)</span>
                    
                    {EXPO_PROJECT_FILES.map((file, idx) => {
                      const isActive = idx === activeCodeFileIndex;
                      return (
                        <button
                          key={file.path}
                          onClick={() => setActiveCodeFileIndex(idx)}
                          className={`w-full text-left py-2 px-2.5 rounded-xl text-xs flex items-start gap-2 transition-all cursor-pointer ${
                            isActive 
                              ? "bg-indigo-500/10 text-indigo-400 font-extrabold border-l-2 border-indigo-500 pl-2" 
                              : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/40"
                          }`}
                        >
                          <FileText className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                          <div className="truncate">
                            <p className="truncate font-mono">{file.path}</p>
                            <p className="text-[9px] text-slate-500 truncate mt-0.5 font-medium">{file.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Visualizador de Código com sintaxe e highlight */}
                  <div className="md:col-span-8 bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden flex flex-col justify-between max-h-[460px]">
                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-850 flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>/{EXPO_PROJECT_FILES[activeCodeFileIndex].path}</span>
                      <span className="text-[9px] uppercase bg-indigo-500/10 font-bold border border-indigo-500/10 px-1.5 py-0.5 rounded-md text-indigo-400">
                        {EXPO_PROJECT_FILES[activeCodeFileIndex].language}
                      </span>
                    </div>

                    <pre className="p-4 overflow-auto text-[11px] font-mono leading-relaxed text-slate-350 bg-slate-950 flex-1 scrollbar-thin select-all">
                      {EXPO_PROJECT_FILES[activeCodeFileIndex].code}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ABA CONFIGURAÇÃO SCHEMAS SQL SUPABASE */}
            {selectedMainTab === "database" && (
              <div className="space-y-4 flex-1 flex flex-col animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-500/10">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-pink-400" />
                      Configuração SQL da Tabela historico_calculos
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Execute esta consulta SQL no painel de controle ou no Editor de Consultas do Supabase</p>
                  </div>
                  <button
                    onClick={() => handleCopyDb(EXPO_PROJECT_FILES[7].code)}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all select-none font-bold cursor-pointer"
                  >
                    {dbCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{dbCopied ? "Copiado!" : "Copiar SQL"}</span>
                  </button>
                </div>

                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="bg-amber-500/5 border border-amber-550/20 text-amber-305 p-3.5 rounded-xl text-xs space-y-1.5">
                    <span className="font-extrabold block uppercase tracking-wider text-[9px] font-mono flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      AVISO DE SEGURANÇA SUPABASE RLS (ROW LEVEL SECURITY)
                    </span>
                    <p className="leading-relaxed">
                      Para que o aplicativo funcione com segurança de dados isolados, nossa consulta cria as tabelas e já ativa o <strong>Row Level Security (RLS)</strong>. Cada usuário só consegue visualizar, deletar ou criar registros associados ao seu ID do Auth, impedindo vazamentos mútuos de dados sensíveis de cálculos.
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden flex flex-col flex-1 max-h-[300px]">
                    <div className="bg-slate-905 px-4 py-2 border-b border-slate-850 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>supabase-schema.sql</span>
                      <span className="bg-pink-500/10 text-pink-400 border border-pink-500/10 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase">Schema</span>
                    </div>
                    <pre className="p-4 overflow-y-auto text-[11px] font-mono leading-relaxed text-slate-350 bg-slate-950 flex-1 select-all scrollbar-thin">
                      {EXPO_PROJECT_FILES[7].code}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ABA MANUAL GUIA COMPLETO DE INSTALAÇÃO */}
            {selectedMainTab === "guide" && (
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-500/10">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-pink-400" />
                      Passo a Passo de Instalação e Execução Completo
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Manual completo em português para rodar o projeto do zero no seu computador</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                  
                  <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-900/40">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-pink-500 text-white rounded-full flex items-center justify-center font-mono font-bold text-[10px] shadow-sm">1</span>
                      Passo 1: Instalar Expo CLI e Inicializar o Template
                    </h4>
                    <p className="text-slate-400 pl-7">
                      No seu terminal de preferência (VS Code, CMD ou Terminal macOS), crie a estrutura padrão para o template e entre na pasta:
                    </p>
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 font-mono font-bold text-indigo-400 pl-10 select-all leading-normal">
                      npx create-expo-app expo-supabase-calculator -t expo-template-blank-typescript<br/>
                      cd expo-supabase-calculator
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-900/40">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-pink-500 text-white rounded-full flex items-center justify-center font-mono font-bold text-[10px] shadow-sm">2</span>
                      Passo 2: Instalar Dependências Peer dos Serviços
                    </h4>
                    <p className="text-slate-400 pl-7">
                      Importe as dependências de navegação, ícones e essencialmente os pacotes do Supabase com AsyncStorage seguro:
                    </p>
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 font-mono font-bold text-indigo-400 pl-10 select-all leading-normal">
                      npx expo install @supabase/supabase-js @react-native-async-storage/async-storage<br/>
                      npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack<br/>
                      npx expo install react-native-safe-area-context react-native-screens lucide-react-native react-native-url-polyfill
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-900/40">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-pink-500 text-white rounded-full flex items-center justify-center font-mono font-bold text-[10px] shadow-sm">3</span>
                      Passo 3: Configurar Credenciais do Supabase
                    </h4>
                    <p className="text-slate-400 pl-7">
                      Acesse seu console no <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-pink-400 font-extrabold hover:underline transition-colors">Supabase Dashboard</a>, crie um novo projeto, vá em Project Settings → API e copie as chaves. Depois insira em <code className="text-indigo-400 font-mono">src/services/supabase.ts</code> do seu projeto:
                    </p>
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 font-mono font-bold text-slate-350 pl-10 select-all leading-normal">
                      const supabaseUrl = 'SUA_URL_AQUI';<br/>
                      const supabaseAnonKey = 'SUA_CHAVE_AQUI';
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-900/40">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-pink-500 text-white rounded-full flex items-center justify-center font-mono font-bold text-[10px] shadow-sm">4</span>
                      Passo 4: Integrar Código-fonte
                    </h4>
                    <p className="text-slate-400 pl-7">
                      Crie os arquivos correspondentes na pasta <code className="text-pink-400 font-mono font-bold">src/</code> exatamente conforme ensinados em nossa aba "Código React Native (Expo)" utilizando a hierarquia recomendada.
                    </p>
                  </div>

                  <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-900/40">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-pink-500 text-white rounded-full flex items-center justify-center font-mono font-bold text-[10px] shadow-sm">5</span>
                      Passo 5: Executar o Aplicativo no Celular com Expo Go
                    </h4>
                    <p className="text-slate-400 pl-7">
                      Inicie o servidor local do desenvolvedor:
                    </p>
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 font-mono font-bold text-pink-400 pl-10 select-all leading-normal">
                      npx expo start
                    </div>
                    <p className="text-slate-400 pl-7">
                      Scaneie o QR Code exibido no terminal utilizando a câmera do seu celular (iOS) ou pelo app oficial <strong className="text-white">Expo Go</strong> no Android para interagir de forma nativa e profissional com seu aplicativo real pronto para produção!
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* DASHBOARD BOTTOM FOOTER */}
            <div className="border-t border-slate-900 pt-4 mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span className="font-mono">Desenvolvido com 🩵 Expo & Supabase Auth</span>
              <div className="flex gap-4">
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-pink-400 transition-colors flex items-center gap-1 font-bold"
                >
                  Supabase Devs
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href="https://expo.dev" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1 font-bold"
                >
                  Expo Docs
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* FOOTER DO PROJETO COMPLETO */}
      <footer className="border-t border-slate-900/60 bg-slate-950/20 text-slate-500 py-6 px-6 text-center text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 CalPro. Sistema de Emulação Mobile & Distribuição Integrada de Projeto.</p>
          <div className="flex gap-4">
            <span className="text-slate-450 font-bold">Desenvolvimento Seguro corporativo</span>
            <span>•</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-450 font-black">TypeScript Ativo</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
