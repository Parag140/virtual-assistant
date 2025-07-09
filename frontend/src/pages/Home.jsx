import React, { useContext, useEffect, useRef, useState } from "react";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { TiThMenu } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import { FiLogOut, FiSettings, FiClock } from 'react-icons/fi';

const Home = () => {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(UserDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [history, setHistory] = useState([]);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const synth = window.speechSynthesis;

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (err) {
      console.log(err);
    }
  };

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
        console.log("recognition requested to start");
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("start error:", error);
        }
      }
    }
  };

  const speak = (text) => {
    const utterence = new window.SpeechSynthesisUtterance(text);
    utterence.lang = "hi-IN";
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang === "hi-IN");
    if (hindiVoice) {
      utterence.voice = hindiVoice;
    }
    isSpeakingRef.current = true;
    utterence.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 800);
    };
    synth.cancel();
    synth.speak(utterence);
  };

  const handleCommand = (data) => {
    if (!data) {
      console.error("handleCommand called with undefined/null data");
      return;
    }
    const { type, userInput, response } = data;

    // Add to history before speaking
    setHistory(prev => [
      ...prev,
      { 
        query: userInput, 
        response: response,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    speak(response);

    if (type === "google-search") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
    }

    if (type === "calculator-open") {
      window.open(`https://www.google.com/search?q=calculator`, "_blank");
    }

    if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, "_blank");
    }

    if (type === "facebook-open") {
      window.open(`https://www.facebook.com/`, "_blank");
    }

    if (type === "weather-show") {
      window.open(`https://www.google.com/search?q=weather`, "_blank");
    }

    if (type === "youtube-search" || type === "youtube-play") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognitionRef.current = recognition;
    let isMounted = true;

    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Recognition requested to start");
        } catch (e) {
          if (e.name !== "InvalidStateError") {
            console.error(e);
          }
        }
      }
    }, 1000);

    const safeRecognition = () => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("recognition request to start");
        } catch (error) {
          if (error.name !== "InvalidStateError") {
            console.error("start error: ", error);
          }
        }
      }
    };

    recognition.onstart = () => {
      console.log("Recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      console.log("Recognition ended");
      isRecognizingRef.current = false;
      setListening(false);

      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Recognition restarted");
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Recognition restarted after error");
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("heard: " + transcript);

      if (
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        console.log(data);
        handleCommand(data);
        setAiText(data.response);
        setUserText("");
      }
    };

    const fallback = setInterval(() => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        safeRecognition();
      }
    }, 10000);

    safeRecognition();

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
      clearInterval(fallback);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#000000] to-[#0a0a5a] flex justify-center items-center flex-col gap-6 relative overflow-hidden p-4">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Mobile menu button - visible only on small screens */}
      <div className="fixed top-5 right-5 z-50 md:hidden flex gap-3">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="text-white w-6 h-6 transition-transform hover:scale-110 active:scale-95"
        >
          <FiClock />
        </button>
        <TiThMenu
          className="text-white w-6 h-6 transition-transform hover:scale-110 active:scale-95"
          onClick={() => setMenuOpen(true)}
        />
      </div>

      {/* Mobile menu (covers everything, including desktop buttons) */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-lg flex flex-col justify-center items-center gap-8 animate-fadeIn">
          <div className="absolute top-5 right-5">
            <ImCross
              className="text-white w-6 h-6 transition-transform hover:scale-110 active:scale-95"
              onClick={() => setMenuOpen(false)}
            />
          </div>
          <button
            onClick={handleLogOut}
            className="relative overflow-hidden min-w-[180px] h-14 bg-white rounded-full font-bold text-black text-lg px-6 py-2 group transition-all hover:bg-opacity-90 active:scale-95"
          >
            <span className="relative z-10">Log Out</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>

          <button
            onClick={() => navigate("/customize")}
            className="relative overflow-hidden min-w-[220px] h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full font-bold text-white text-lg px-6 py-2 group transition-all hover:bg-opacity-90 active:scale-95 shadow-lg shadow-purple-500/30"
          >
            <span className="relative z-10">Customize Assistant</span>
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </div>
      )}

      {/* History Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-y-0 left-0 z-40 w-64 bg-black/80 backdrop-blur-lg p-4 overflow-y-auto animate-slideIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-bold">History</h2>
            <ImCross
              className="text-white w-5 h-5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-3">
                  <p className="text-white font-medium">{item.query}</p>
                  <p className="text-white/70 text-sm mt-1">{item.response}</p>
                  <p className="text-white/50 text-xs mt-2">{item.timestamp}</p>
                </div>
              ))
            ) : (
              <p className="text-white/50 text-center py-4">No history yet</p>
            )}
          </div>
        </div>
      )}

      {/* Desktop buttons - visible only on md and up, and hidden if mobile menu is open */}
      <div className={`hidden md:flex absolute top-5 right-5 gap-3 ${menuOpen ? 'pointer-events-none opacity-0' : ''}`}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full font-semibold text-white text-base transition-all hover:bg-white/20 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          <FiClock className="w-5 h-5" />
        </button>
        <button
          onClick={handleLogOut}
          className="flex items-center justify-center min-w-[150px] h-12 bg-white/90 rounded-full font-semibold text-black text-base px-5 py-2 transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          Log Out
          <FiLogOut className="ml-2" />
        </button>
        <button
          onClick={() => navigate("/customize")}
          className="flex items-center justify-center min-w-[180px] h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full font-semibold text-white text-base px-5 py-2 transition-all hover:opacity-90 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          Customize
          <FiSettings className="ml-2" />
        </button>
      </div>

      {/* Assistant image with 3D effect */}
      <div className="relative w-72 h-96 md:w-80 md:h-[28rem] flex justify-center items-center rounded-2xl overflow-hidden group z-20 mt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl group-hover:opacity-80 transition-opacity"></div>
        <img
          src={userData?.assistantImage}
          alt="Assistant"
          className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500"
        />
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-2">
          <h1 className="text-white text-xl font-bold tracking-wide">
            I'm {userData?.assistantName}
          </h1>
        </div>
      </div>

      {/* Speech bubble with typing animation */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-6 max-w-md w-full min-h-24 flex items-center justify-center border border-white/20 shadow-lg mt-6">
        {(userText || aiText) ? (
          <p className="text-white text-center text-lg font-medium animate-typing">
            {userText || aiText}
          </p>
        ) : (
          <div className="flex flex-col items-center">
            <img
              src={userImg}
              alt="User"
              className="w-32 h-32 object-contain animate-pulse-slow"
            />
            <p className="text-white/70 mt-2">Waiting for your message...</p>
          </div>
        )}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white/10 backdrop-blur-md rotate-45 border-b border-r border-white/20"></div>
      </div>

      {/* Add these to your global CSS or CSS-in-JS */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-100px) translateX(20px); }
          100% { transform: translateY(-200px) translateX(0); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes typing {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        .animate-typing {
          animation: typing 0.5s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;