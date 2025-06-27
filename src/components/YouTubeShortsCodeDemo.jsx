"use client";
import React, { useState, useRef, useCallback, useLayoutEffect } from 'react';
import SyntaxHighlighter from './SyntaxHighlighter';
import TypingSimulator from '../utils/TypingSimulator';
import translations from '../i18n/translations';
import templates from '../utils/TemplateManager';
import '@fontsource-variable/montserrat';

const YouTubeShortsCodeDemo = () => {
  const [language, setLanguage] = useState('ru');
  const [inputCode, setInputCode] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState({ min: 30, max: 80 });
  const [errorRate, setErrorRate] = useState(0);
  const [demoTitle, setDemoTitle] = useState('');
  const [phoneTheme, setPhoneTheme] = useState('dark');
  const [simulationKey, setSimulationKey] = useState(0);
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerPosition, setBannerPosition] = useState(20);
  const [bannerContent, setBannerContent] = useState('');
  const [bannerType, setBannerType] = useState('text');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerOpacity, setBannerOpacity] = useState(1);
  const [bannerTextColor, setBannerTextColor] = useState('#ffffff');
  const [bannerBackgroundColor, setBannerBackgroundColor] = useState('#ef4444');
  const [bannerLogoColor, setBannerLogoColor] = useState('#3b82f6');
  const [bannerLogoBgColor, setBannerLogoBgColor] = useState('#ffffff');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = React.useState(false);
  const [bannerLogoImageFile, setBannerLogoImageFile] = useState(null);
  const [bannerLogoImageUrl, setBannerLogoImageUrl] = useState('');

  const codeEditorRef = useRef(null);
  const resultFrameRef = useRef(null);
  const codeScrollRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const isRunningRef = useRef(false);
  const currentSimulationId = useRef(0);
  const bannerRef = useRef(null);
  const phoneScreenRef = useRef(null);
  const keyAudioRef = React.useRef(null);
  const keyLoopAudioRef = React.useRef(null);

  const t = translations[language];

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    setDemoTitle(t.defaultTitle);
    setBannerContent(t.defaultBannerText);
  }, [language, t.defaultTitle, t.defaultBannerText]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    
    keyAudioRef.current = typeof Audio !== 'undefined' ? new Audio('/keyboard.mp3') : null;
    if (keyAudioRef.current) {
      keyAudioRef.current.volume = 0.25;
    }
  }, []);

  React.useEffect(() => {
    keyLoopAudioRef.current = typeof Audio !== 'undefined' ? new Audio('/keyboard.mp3') : null;
    if (keyLoopAudioRef.current) {
      keyLoopAudioRef.current.loop = true;
      keyLoopAudioRef.current.volume = 0.25;
    }
  }, []);

  React.useEffect(() => {
    if (!keyLoopAudioRef.current) return;
    if (isTyping) {
      keyLoopAudioRef.current.currentTime = 0;
      keyLoopAudioRef.current.play();
    } else {
      keyLoopAudioRef.current.pause();
      keyLoopAudioRef.current.currentTime = 0;
    }
  }, [isTyping]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false
    });
  };

  const getTotalLines = useCallback((code) => {
    if (!code) return 1;
    const lines = code.split('\n');
    return code.endsWith('\n') ? lines.length + 1 : lines.length;
  }, []);

  const getCurrentLines = useCallback((code) => {
    if (!code) return 1;
    return code.split('\n').length;
  }, []);

  const handleCodeScroll = useCallback(() => {
    if (codeScrollRef.current && lineNumbersRef.current) {
      const scrollTop = codeScrollRef.current.scrollTop;
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (codeScrollRef.current && isTyping) {
      const container = codeScrollRef.current;
      if ('scrollTo' in container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = container.scrollTop;
      }
      console.log('scrollToBottom вызван:', container.scrollTop, container.scrollHeight);
    }
  }, [isTyping]);

  // useLayoutEffect для автоскролла сразу после обновления DOM
  React.useLayoutEffect(() => {
    if (isTyping && currentCode) {
      scrollToBottom();
    }
  }, [currentCode, isTyping, scrollToBottom]);

  const handleBannerMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    const phoneRect = phoneScreenRef.current?.getBoundingClientRect();
    if (!phoneRect) return;
    const handleMouseMove = (moveEvent) => {
      const phoneRect = phoneScreenRef.current?.getBoundingClientRect();
      if (!phoneRect) return;
      const relativeY = moveEvent.clientY - phoneRect.top;
      let percentage = Math.max(0, Math.min(80, (relativeY / phoneRect.height) * 100));
      setBannerPosition(percentage);
      if (percentage === 0 || percentage === 80) {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleImageFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerImageFile(e.target.result);
        setBannerImageUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerLogoImageFile(e.target.result);
        setBannerLogoImageUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  const renderBannerContent = () => {
    const containerStyle = {
      opacity: bannerOpacity
    };
    switch (bannerType) {
      case 'text':
        return (
          <div 
            className="font-bold text-sm text-center px-2 py-1 rounded-lg shadow-lg"
            style={{
              ...containerStyle,
              color: bannerTextColor,
              backgroundColor: bannerBackgroundColor,
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '90%',
              margin: '0 auto',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {bannerContent}
          </div>
        );
      case 'image':
        const imageSource = bannerImageFile || bannerImageUrl;
        return imageSource ? (
          <img 
            src={imageSource} 
            alt="Banner" 
            className="max-w-full max-h-12 object-contain rounded shadow-lg"
            style={containerStyle}
            onError={(e) => {
              e.target.style.display = 'none';
              console.error('Ошибка загрузки изображения баннера');
            }}
          />
        ) : (
          <div 
            className="text-xs px-2 py-1 rounded"
            style={{
              ...containerStyle,
              color: '#ffffff',
              backgroundColor: '#6b7280'
            }}
          >
            {t.bannerImagePlaceholder}
          </div>
        );
      case 'logo':
        const logoImageSource = bannerLogoImageFile || bannerLogoImageUrl;
        return logoImageSource ? (
          <img 
            src={logoImageSource} 
            alt="Logo" 
            className="max-w-[48px] max-h-[48px] object-contain rounded-full shadow-lg bg-white"
            style={containerStyle}
            onError={(e) => {
              e.target.style.display = 'none';
              console.error('Ошибка загрузки логотипа');
            }}
          />
        ) : (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: bannerLogoColor, ...containerStyle }}
          >
            <span className="text-white text-lg font-bold">
              {(bannerContent || 'Logo').charAt(0).toUpperCase()}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const playKeySound = (char) => {
    if (keyAudioRef.current) {
      try {
        keyAudioRef.current.currentTime = 0;
        keyAudioRef.current.play();
      } catch (e) {}
    }
  };

  const startDemo = useCallback(async () => {
    if (!inputCode.trim()) {
      alert(language === 'ru' ? 'Добавьте код для демонстрации!' : 
            language === 'en' ? 'Please add code for demonstration!' :
            'Veuillez ajouter du code pour la démonstration!');
      return;
    }
    const thisSimulationId = Date.now();
    currentSimulationId.current = thisSimulationId;
    setSimulationKey(prev => prev + 1);
    isRunningRef.current = false;
    await new Promise(resolve => setTimeout(resolve, 100));
    if (currentSimulationId.current !== thisSimulationId) return;
    setIsTyping(true);
    setShowResult(false);
    setCurrentCode('');
    isRunningRef.current = true;
    try {
      const simulator = new TypingSimulator(typingSpeed, errorRate);
      await simulator.typeText(
        inputCode,
        (text) => {
          if (currentSimulationId.current !== thisSimulationId) return;
          if (!isRunningRef.current) return;
          setCurrentCode(text);
        }
      );
      if (currentSimulationId.current !== thisSimulationId) return;
      if (!isRunningRef.current) return;
      setIsTyping(false);
      setIsProcessing(true);
      await simulator.pause(2000, 2000);
      if (currentSimulationId.current !== thisSimulationId) return;
      if (!isRunningRef.current) return;
      setShowResult(true);
      setIsProcessing(false);
    } catch (error) {
      console.error('Ошибка демонстрации:', error);
    } finally {
      if (currentSimulationId.current === thisSimulationId) {
        setIsTyping(false);
        isRunningRef.current = false;
      }
    }
  }, [inputCode, typingSpeed, errorRate, language]);

  const resetDemo = () => {
    currentSimulationId.current = 0;
    isRunningRef.current = false;
    setSimulationKey(prev => prev + 1);
    setIsTyping(false);
    setShowResult(false);
    setCurrentCode('');
    setIsProcessing(false);
    setTimeout(() => {
      if (resultFrameRef.current) {
        resultFrameRef.current.srcDoc = '';
        resultFrameRef.current.src = 'about:blank';
      }
    }, 50);
  };

  const handleRunClick = (e) => {
    if (!inputCode.trim() || isTyping) return;
    e.target.classList.add('button-click');
    setTimeout(() => {
      e.target.classList.remove('button-click');
    }, 300);
    startDemo();
  };

  const loadTemplate = (templateKey) => {
    const template = templates[templateKey];
    setInputCode(template.code);
    setDemoTitle(template.title);
    resetDemo();
  };

  const estimateTypingTime = useCallback(() => {
    if (!inputCode.trim()) return 0;
    const charCount = inputCode.length;
    const avgSpeed = (typingSpeed.min + typingSpeed.max) / 2;
    const baseTime = (charCount * avgSpeed) / 1000;
    const errorTime = baseTime * errorRate * 3;
    const pauseTime = baseTime * 0.1;
    return Math.round(baseTime + errorTime + pauseTime);
  }, [inputCode, typingSpeed, errorRate]);

  const handleBannerTouchStart = useCallback((e) => {
    setIsDragging(true);
    const phoneRect = phoneScreenRef.current?.getBoundingClientRect();
    if (!phoneRect) return;
    const handleTouchMove = (moveEvent) => {
      const phoneRect = phoneScreenRef.current?.getBoundingClientRect();
      if (!phoneRect) return;
      const touch = moveEvent.touches[0];
      let relativeY = touch.clientY - phoneRect.top;
      let percentage = Math.max(0, Math.min(80, (relativeY / phoneRect.height) * 100));
      setBannerPosition(percentage);
      if (percentage === 0 || percentage === 80) {
        setIsDragging(false);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };
    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, []);

  return (
    <div className="min-h-screen font-montserrat relative bg-[#f9fafc]">
      {/* Светлый фон */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute w-full h-full bg-[#f9fafc]" />
      </div>
      <div className="min-h-screen p-4 space-y-10">
        {/* Заголовок */}
        <div className="text-center py-4 mb-6 bg-white rounded-2xl shadow-lg border-b-4 border-[#74b9ff]">
          <h1 className="text-2xl font-bold text-[#2d3436] mb-1">{t.title}</h1>
          <p className="text-sm text-[#636e72]">{t.subtitle}</p>
        </div>
        {/* Переключатель языка */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 bg-white rounded-xl shadow border border-[#e0e0e0] px-4 py-2">
            {[
              { code: 'ru', label: '🇷🇺 Русский' },
              { code: 'en', label: '🇬🇧 English' },
              { code: 'fr', label: '🇫🇷 Français' }
            ].map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm border
                  ${language === code
                    ? 'bg-[#74b9ff] text-white border-[#0984e3] shadow-md scale-105'
                    : 'bg-[#f9fafc] text-[#2d3436] border-transparent hover:bg-[#e3f6fd] hover:text-[#0984e3]'}
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* Настройки */}
        <div className="mb-10 bg-[#f1f2f6] rounded-2xl shadow-lg border border-[#e0e0e0] p-6">
          <div className="space-y-4">
            {/* Название демо */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">{t.nameLabel}</label>
              <input
                type="text"
                value={demoTitle}
                onChange={(e) => setDemoTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#f9fafc] text-[#2d3436] placeholder-[#636e72] border border-[#e0e0e0] focus:ring-2 focus:ring-[#74b9ff] text-sm"
                placeholder={t.namePlaceholder}
              />
            </div>

            {/* Скорость печати */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                {t.speedLabel}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{t.speedMin}</span>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={typingSpeed.min}
                      onChange={(e) => {
                        const val = Math.max(10, Math.min(300, parseInt(e.target.value) || 10));
                        setTypingSpeed(prev => ({ ...prev, min: val }));
                      }}
                      className="w-16 px-2 py-1 text-xs bg-[#f9fafc] text-[#2d3436] border border-[#e0e0e0] rounded"
                    />
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    value={typingSpeed.min}
                    onChange={(e) => setTypingSpeed(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{t.speedMax}</span>
                    <input
                      type="number"
                      min="20"
                      max="500"
                      value={typingSpeed.max}
                      onChange={(e) => {
                        const val = Math.max(20, Math.min(500, parseInt(e.target.value) || 20));
                        setTypingSpeed(prev => ({ ...prev, max: val }));
                      }}
                      className="w-16 px-2 py-1 text-xs bg-white text-[#2d3436] border border-[#f1f2f6] rounded"
                    />
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="500" 
                    value={typingSpeed.max}
                    onChange={(e) => setTypingSpeed(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setTypingSpeed({ min: 10, max: 30 })}
                  className="px-2 py-1 bg-[#ff7675] text-white text-xs rounded-xl shadow hover:bg-[#ff6b6b] border-none"
                >
                  {t.speedTurbo}
                </button>
                <button
                  onClick={() => setTypingSpeed({ min: 20, max: 60 })}
                  className="px-2 py-1 bg-[#74b9ff] text-white text-xs rounded-xl shadow hover:bg-[#0984e3] border-none"
                >
                  {t.speedFast}
                </button>
                <button
                  onClick={() => setTypingSpeed({ min: 50, max: 120 })}
                  className="px-2 py-1 bg-[#fdcb6e] text-[#2d3436] text-xs rounded-xl shadow hover:bg-[#ffeaa7] border-none"
                >
                  {t.speedNormal}
                </button>
                <button
                  onClick={() => setTypingSpeed({ min: 100, max: 250 })}
                  className="px-2 py-1 bg-[#636e72] text-white text-xs rounded-xl shadow hover:bg-[#b2bec3] border-none"
                >
                  {t.speedSlow}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {t.speedTip}
              </div>
            </div>

            {/* Частота ошибок */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                {t.errorsLabel} {Math.round(errorRate * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="0.1"
                step="0.01"
                value={errorRate}
                onChange={(e) => setErrorRate(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Рекламный баннер */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-700 font-medium text-sm">
                  {t.bannerLabel}
                </label>
                <button
                  onClick={() => setBannerEnabled(!bannerEnabled)}
                  className={`px-5 py-2 rounded-xl text-base font-bold shadow-lg flex items-center gap-2 transition-all duration-200 border-2
                    ${bannerEnabled
                      ? 'bg-gradient-to-r from-[#74b9ff] to-[#fdcb6e] text-[#2d3436] border-[#fdcb6e] scale-105'
                      : 'bg-gradient-to-r from-[#fff] to-[#e3f6fd] text-[#0984e3] border-[#74b9ff] hover:from-[#e3f6fd] hover:to-[#fdcb6e] hover:text-[#d35400] hover:scale-105'}
                  `}
                  style={{ boxShadow: bannerEnabled ? '0 4px 16px 0 #fdcb6e44' : '0 2px 8px 0 #74b9ff22' }}
                >
                  <span className="text-xl">📢</span>
                  {bannerEnabled ? t.bannerEnabled : t.bannerDisabled}
                </button>
              </div>
              
              {bannerEnabled && (
                <div className="space-y-3 p-3 bg-[#f9fafc] rounded-lg border border-[#f1f2f6]">
                  {/* Тип баннера */}
                  <div>
                    <label className="block text-gray-700 text-xs mb-2">{t.bannerType}</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'text', label: t.bannerText },
                        { value: 'image', label: t.bannerImage },
                        { value: 'logo', label: t.bannerLogo }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setBannerType(value)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                            bannerType === value
                              ? 'bg-blue-500 text-white'
                              : 'bg-[#f9fafc] text-[#2d3436] hover:bg-gray-400'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Содержимое баннера */}
                  {/* Прозрачность баннера */}
                  <div>
                    <label className="block text-gray-700 text-xs mb-2">
                      {t.bannerOpacity} {Math.round(bannerOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={bannerOpacity}
                      onChange={(e) => setBannerOpacity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {bannerType === 'text' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-700 text-xs mb-1">{t.bannerTextLabel}</label>
                        <textarea
                          value={bannerContent}
                          onChange={(e) => setBannerContent(e.target.value)}
                          placeholder={t.bannerTextPlaceholder}
                          className="w-full px-2 py-1 text-xs bg-[#f9fafc] text-[#2d3436] placeholder-[#636e72] border border-[#f1f2f6] rounded focus:border-blue-400 focus:outline-none resize-y min-h-[40px] max-h-32"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-gray-700 text-xs mb-1">{t.bannerTextColor}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bannerTextColor}
                              onChange={(e) => setBannerTextColor(e.target.value)}
                              className="w-8 h-6 rounded border border-[#f1f2f6]"
                            />
                            <input
                              type="text"
                              value={bannerTextColor}
                              onChange={(e) => setBannerTextColor(e.target.value)}
                              className="flex-1 px-2 py-1 text-xs bg-[#f9fafc] text-[#2d3436] border border-[#f1f2f6] rounded focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 text-xs mb-1">{t.bannerBgColor}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bannerBackgroundColor}
                              onChange={(e) => setBannerBackgroundColor(e.target.value)}
                              className="w-8 h-6 rounded border border-[#f1f2f6]"
                            />
                            <input
                              type="text"
                              value={bannerBackgroundColor}
                              onChange={(e) => setBannerBackgroundColor(e.target.value)}
                              className="flex-1 px-2 py-1 text-xs bg-[#f9fafc] text-[#2d3436] border border-[#f1f2f6] rounded focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {bannerType === 'image' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-700 text-xs mb-1">{t.bannerUpload}</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="w-full px-2 py-1 text-xs bg-[#f9fafc] text-[#2d3436] border border-[#f1f2f6] rounded focus:border-blue-400 focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-500 file:text-white file:text-xs hover:file:bg-blue-600"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-2 flex items-center text-gray-500 text-xs pointer-events-none">
                          {t.bannerUrl}
                        </div>
                        <input
                          type="url"
                          value={bannerImageUrl}
                          onChange={(e) => {
                            setBannerImageUrl(e.target.value);
                            if (e.target.value) setBannerImageFile(null); 
                          }}
                          placeholder="      https://example.com/image.png"
                          className="w-full px-2 py-1 text-xs bg-[#f9fafc] text-[#2d3436] placeholder-[#636e72] border border-[#f1f2f6] rounded focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                      {(bannerImageFile || bannerImageUrl) && (
                        <div className="text-xs text-green-200 bg-green-500/10 p-2 rounded border border-green-500/20">
                          {t.bannerImageUploaded} {bannerImageFile ? t.bannerImageDevice : t.bannerImageUrl}
                        </div>
                      )}
                    </div>
                  )}

                  {bannerType === 'logo' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-700 text-xs mb-1">{t.bannerBrand}</label>
                        <input
                          type="text"
                          value={bannerContent}
                          onChange={(e) => setBannerContent(e.target.value)}
                          placeholder={t.bannerBrandPlaceholder}
                          className="w-full px-2 py-1 text-xs bg-[#f9fafc] text-[#2d3436] placeholder-[#636e72] border border-[#f1f2f6] rounded focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs mb-1">Загрузить логотип</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileUpload}
                          className="w-full px-2 py-1 text-xs bg-[#f9fafc] text-[#2d3436] border border-[#f1f2f6] rounded focus:border-blue-400 focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-500 file:text-white file:text-xs hover:file:bg-blue-600"
                        />
                        {/* Превью загруженного логотипа и кнопка удаления */}
                        {(bannerLogoImageFile || bannerLogoImageUrl) && (
                          <div className="flex items-center gap-2 mt-2">
                            <img src={bannerLogoImageFile || bannerLogoImageUrl} alt="logo preview" className="w-10 h-10 object-contain rounded-full border border-gray-300 bg-white" />
                            <button
                              type="button"
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              onClick={() => { setBannerLogoImageFile(null); setBannerLogoImageUrl(''); }}
                            >Удалить</button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-gray-700 text-xs mb-1">{t.bannerLogoColor}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bannerLogoColor}
                              onChange={(e) => setBannerLogoColor(e.target.value)}
                              className="w-8 h-6 rounded border border-[#f1f2f6]"
                            />
                            <input
                              type="text"
                              value={bannerLogoColor}
                              onChange={(e) => setBannerLogoColor(e.target.value)}
                              className="flex-1 px-2 py-1 text-xs bg-[#f9fafc] text-[#2d3436] border border-[#f1f2f6] rounded focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Позиция баннера */}
                  <div>
                    <label className="block text-gray-700 text-xs mb-2">
                      {t.bannerPosition} {Math.round(bannerPosition)}% {language === 'ru' ? 'от верха экрана' : language === 'en' ? 'from top' : 'du haut'}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={bannerPosition}
                      onChange={(e) => setBannerPosition(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{t.bannerPositionTop}</span>
                      <span>{t.bannerPositionBottom}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-[#e3f6fd] border-l-4 border-[#74b9ff] rounded-xl shadow text-[#2d3436]">
                    <div className="text-base font-bold flex items-center mb-2"><span className="mr-2">💡</span>{t.tipsTitle}</div>
                    <ul className="mt-1 space-y-2 text-sm font-medium pl-2">
                      {t.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1 w-2 h-2 rounded-full bg-[#74b9ff] flex-shrink-0"></span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Шаблоны */}
        <div className="mb-10 bg-white rounded-2xl shadow-lg border-l-4 border-[#fdcb6e] p-6">
          <h3 className="text-lg font-bold text-[#2d3436] mb-3">{t.templatesTitle}</h3>
          <div className="space-y-2">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => loadTemplate(key)}
                className="w-full p-3 rounded-xl bg-[#f9fafc] shadow hover:bg-[#74b9ff]/10 transition-all text-left"
              >
                <div className="text-sm font-medium text-[#2d3436]">{template.title}</div>
                <div className="text-xs text-[#636e72] mt-1">{t.templateClick}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Редактор кода */}
        <div className="mb-10 bg-[#f1f2f6] rounded-2xl shadow-lg border-l-4 border-[#ff7675] p-6 max-w-[590px] mx-auto">
          <h3 className="text-lg font-bold text-[#2d3436] mb-3">{t.codeTitle}</h3>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder={t.codePlaceholder}
            className="w-full h-40 p-3 bg-[#f9fafc] text-[#2d3436] font-mono text-xs rounded-xl border border-[#f1f2f6] focus:ring-2 focus:ring-[#74b9ff] resize-none sm:min-w-[365px] sm:max-w-[590px] mx-auto"
            disabled={isTyping}
          />
        </div>

        {/* Демонстрация - Телефонный формат с кнопками справа */}
        <div className="mb-10 bg-white rounded-3xl shadow-2xl border border-[#636e72] p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-[#2d3436]">📱 {demoTitle}</h3>
            {showResult && (
              <div className="text-[#00b894] font-medium text-sm">{t.statusReady}</div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-center sm:items-start items-center gap-4 sm:gap-6 w-full">
            {/* Компактный переключатель темы телефона */}
            <div className="flex flex-col items-center gap-2 sm:gap-4 mt-4 sm:mt-10 w-full sm:w-auto">
              <div className="flex gap-2 mb-2 justify-center w-full">
                <button
                  onClick={() => setPhoneTheme('light')}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-150 shadow-sm text-xl
                    ${phoneTheme === 'light' ? 'bg-yellow-100 border-yellow-400 text-yellow-500 scale-110' : 'bg-white border-gray-300 text-gray-400 hover:border-yellow-400 hover:text-yellow-500'}`}
                  title="Светлая тема"
                >
                  ☀️
                </button>
                <button
                  onClick={() => setPhoneTheme('dark')}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-150 shadow-sm text-xl
                    ${phoneTheme === 'dark' ? 'bg-gray-800 border-gray-600 text-blue-300 scale-110' : 'bg-white border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500'}`}
                  title="Тёмная тема"
                >
                  🌙
                </button>
              </div>
            </div>
            {/* Телефон и большая кнопка в адаптивном flex-контейнере */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8">
              {/* Телефонное окно демо */}
              <div className="relative flex-shrink-0 w-[calc(98vw-10px)] max-w-none mx-auto aspect-[9/19.5] min-h-[350px] sm:w-[420px] sm:max-w-[420px] sm:aspect-[9/18] sm:min-h-[500px]">
                {/* Корпус телефона */}
                <div
                  className={`absolute inset-0 rounded-[2.5rem] border-[3px] shadow-2xl ${phoneTheme === 'light' ? 'bg-gradient-to-br from-[#23272e] via-[#353a42] to-[#23272e] border-[#444]' : 'bg-gradient-to-br from-white via-[#e3e6ea] to-[#cfd8dc] border-[#222]'}`}
                  style={phoneTheme === 'light'
                    ? { boxShadow: '0 8px 32px 0 rgba(30,30,30,0.25), 0 1.5px 0 0 #444 inset', zIndex: 0 }
                    : { boxShadow: '0 8px 32px 0 rgba(60,60,60,0.25), 0 1.5px 0 0 #fff inset', zIndex: 0 }
                  }
                ></div>
                {/* Визуальная граница между корпусом и экраном */}
                <div className="absolute inset-0 rounded-[2.25rem] border-[2px] border-[#a0a4aa] bg-transparent" style={{zIndex: 2, pointerEvents: 'none', opacity: 1, boxShadow: '0 2px 8px 0 #0002 inset'}}></div>
                <div className="absolute left-6 top-3 w-2/3 h-6 rounded-full bg-white/40 blur-md opacity-60 pointer-events-none" style={{zIndex: 1}}></div>
                <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{zIndex: 1}}>
                  <div className="w-16 h-2 bg-[#444] rounded-full shadow-inner border border-[#222]" />
                  <div className="w-3 h-3 bg-[#222] rounded-full ml-2 border border-[#888] shadow" />
                </div>
                {/* Экран телефона */}
                <div className="absolute inset-0 flex flex-col rounded-[2.1rem] overflow-hidden shadow-inner z-10 p-[14px]">
                  {/* Статус бар телефона */}
                  <div className={`text-xs flex justify-between items-center mb-1 px-4 pt-8 pb-2 ${phoneTheme === 'light' ? 'text-[#f4f6fa]' : 'text-[#2d3436]'}`}> 
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{mounted ? formatTime(currentTime) : ''}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <svg className={`w-3 h-3 animate-pulse drop-shadow ${phoneTheme === 'light' ? 'text-[#f4f6fa]' : 'text-[#636e72]'}`} fill="currentColor" viewBox="0 0 24 24" style={{ animationDelay: '2s', filter: 'drop-shadow(0 1px 2px #0008)' }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <svg className={`w-3 h-3 animate-bounce drop-shadow ${phoneTheme === 'light' ? 'text-[#f4f6fa]' : 'text-[#2d3436]'}`} fill="currentColor" viewBox="0 0 24 24" style={{ animationDuration: '3s', animationDelay: '1s', filter: 'drop-shadow(0 1px 2px #0008)' }}>
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                      </svg>
                      
                      <div className="flex items-center gap-px">
                        <div className={`w-1 h-2 rounded-sm animate-pulse ${phoneTheme === 'light' ? 'bg-[#f4f6fa]' : 'bg-[#636e72]'}`} style={{ animationDelay: '0s', filter: 'drop-shadow(0 1px 2px #0008)' }}></div>
                        <div className={`w-1 h-3 rounded-sm animate-pulse ${phoneTheme === 'light' ? 'bg-[#f4f6fa]' : 'bg-[#636e72]'}`} style={{ animationDelay: '0.2s', filter: 'drop-shadow(0 1px 2px #0008)' }}></div>
                        <div className={`w-1 h-4 rounded-sm animate-pulse ${phoneTheme === 'light' ? 'bg-[#f4f6fa]' : 'bg-[#636e72]'}`} style={{ animationDelay: '0.4s', filter: 'drop-shadow(0 1px 2px #0008)' }}></div>
                        <div className={`w-1 h-3 animate-pulse ${phoneTheme === 'light' ? 'bg-[#f4f6fa]' : 'bg-[#636e72]'}`} style={{ animationDelay: '0.6s', filter: 'drop-shadow(0 1px 2px #0008)' }}></div>
                      </div>
                      
                      <svg className={`w-3 h-3 animate-pulse drop-shadow ${phoneTheme === 'light' ? 'text-[#f4f6fa]' : 'text-[#2d3436]'}`} fill="currentColor" viewBox="0 0 24 24" style={{ animationDelay: '1.5s', filter: 'drop-shadow(0 1px 2px #0008)' }}>
                        <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                      </svg>
                      
                      <div className="flex items-center gap-1">
                        <div className={`w-6 h-3 border rounded-sm relative`} style={{ filter: 'drop-shadow(0 1px 2px #0008)', borderColor: phoneTheme === 'light' ? '#f4f6fa' : '#636e72' }}>
                          <div className="w-5 h-2 bg-green-400 rounded-xs absolute top-0.5 left-0.5 animate-pulse" style={{ filter: 'drop-shadow(0 1px 2px #0008)' }}></div>
                          <div className={`w-0.5 h-1.5 rounded-r absolute -right-1 top-0.5`} style={{ filter: 'drop-shadow(0 1px 2px #0008)', background: phoneTheme === 'light' ? '#f4f6fa' : '#636e72' }}></div>
                        </div>
                        <span className="text-xs animate-pulse" style={{ animationDelay: '0.8s', filter: 'drop-shadow(0 1px 2px #0008)', color: phoneTheme === 'light' ? '#f4f6fa' : '#636e72' }}>100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Область кода/результата — только она скроллится! */}
                  <div 
                    className={`flex-1 overflow-y-auto ${phoneTheme === 'dark' ? 'bg-[#181f2a]' : 'bg-gray-100'}`}
                    style={{ minHeight: 0 }}
                    ref={phoneScreenRef}
                    key={`simulation-${simulationKey}`}
                  >
                    {/* Код-редактор - скрываем когда показан результат */}
                    {!showResult && (
                      <div className="flex flex-col h-full">
                        <div className={`${phoneTheme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'} px-3 py-2 text-xs flex items-center gap-2 flex-shrink-0 relative`}>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                          <span className="ml-1">index.html</span>
                          {/* Маленькая кнопка Run внутри телефона */}
                          {!showResult && (
                            <button
                              onClick={handleRunClick}
                              disabled={!inputCode.trim() || isTyping || isProcessing}
                              className={`ml-auto px-2 py-1 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-bold rounded-lg shadow border border-green-500 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed ${isTyping || isProcessing ? '' : 'hover:from-green-500 hover:to-green-700'}`}
                              style={{ minWidth: '70px' }}
                              title={
                                isTyping ? t.runButtonTyping :
                                isProcessing ? t.runButtonRunning :
                                t.runButton
                              }
                            >
                              {isTyping ? t.runButtonTyping : isProcessing ? t.runButtonRunning : t.runButton}
                            </button>
                          )}
                        </div>
                        
                        <div 
                          className="flex flex-1 overflow-hidden"
                          style={{ 
                            height: '560px'
                          }}
                        >
                          {/* Нумерация строк - с фиксированной шириной и синхронизированным скроллом */}
                          <div 
                            ref={lineNumbersRef}
                            className={`flex-shrink-0 ${phoneTheme === 'dark' ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-200 text-gray-600 border-gray-300'} text-xs font-mono px-2 py-3 border-r select-none`}
                            style={{ 
                              width: '40px',
                              height: '100%',
                              overflow: 'hidden',
                              scrollbarWidth: 'none',
                              msOverflowStyle: 'none'
                            }}
                          >
                            {(() => {
                              
                              if (isTyping || currentCode) {
                                const totalLines = getTotalLines(inputCode);
                                const currentLines = getCurrentLines(currentCode);
                                
                                return Array.from({ length: totalLines }, (_, index) => (
                                  <div 
                                    key={`line-${simulationKey}-${index}`} 
                                    className={`text-right pr-1 ${
                                      index < currentLines 
                                        ? phoneTheme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                                        : phoneTheme === 'dark' ? 'text-gray-600' : 'text-gray-500'
                                    }`} 
                                    style={{ 
                                      height: '16px',
                                      lineHeight: '16px',
                                      fontSize: '12px'
                                    }}
                                  >
                                    {index + 1}
                                  </div>
                                ));
                              } else {
                                
                                return (
                                  <div 
                                    className={`text-right pr-1 ${phoneTheme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`} 
                                    style={{ 
                                      height: '16px',
                                      lineHeight: '16px',
                                      fontSize: '12px'
                                    }}
                                  >
                                    1
                                  </div>
                                );
                              }
                            })()}
                          </div>
                          
                          {/* Код с подсветкой - прокручиваемая область */}
                          <div 
                            className="flex-1 overflow-auto p-3 max-w-full"
                            ref={codeScrollRef}
                            onScroll={handleCodeScroll}
                            style={{
                              height: 'calc(100% - 28px)',
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#4B5563 #1F2937',
                              maxWidth: '100%'
                            }}
                          >
                            <pre 
                              className="font-mono text-xs whitespace-pre-wrap max-w-full overflow-x-auto" 
                              style={{ 
                                lineHeight: '16px',
                                fontSize: '12px',
                                margin: 0,
                                padding: 0,
                                maxWidth: '100%',
                                overflowX: 'auto'
                              }} 
                              key={`code-${simulationKey}-${currentCode.length}`}
                            >
                              <SyntaxHighlighter code={currentCode} theme={phoneTheme} />
                              {isTyping && <span className="animate-pulse text-green-400">|</span>}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Результат на полный экран с анимацией */}
                    {showResult && (
                      <div className="h-full flex flex-col animate-fadeIn">
                        <div className="bg-gray-200 px-3 py-2 text-xs text-gray-600 flex items-center gap-2 flex-shrink-0 animate-slideDown">
                          <span>📱 {demoTitle}</span>
                          
                          <div className="ml-auto flex items-center gap-2">
                            <div className="text-green-600 text-xs animate-pulse">
                              {t.statusLive}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 bg-white overflow-auto animate-expandUp relative">
                          <iframe
                            key={`iframe-${simulationKey}`}
                            ref={resultFrameRef}
                            srcDoc={currentCode}
                            className="w-full h-full border-0"
                            title="Результат демо"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                            style={{ 
                              overflow: 'auto',
                              scrollbarWidth: 'none',
                              msOverflowStyle: 'none',
                              pointerEvents: 'auto'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Рекламный баннер - поверх всего контента */}
                    {bannerEnabled && (
                      <div
                        ref={bannerRef}
                        className={`absolute left-1/2 transform -translate-x-1/2 z-50 cursor-move ${isDragging ? 'scale-105' : 'hover:scale-102'} transition-transform`}
                        style={{ 
                          top: `${bannerPosition}%`,
                          userSelect: 'none'
                        }}
                        onMouseDown={handleBannerMouseDown}
                        onTouchStart={handleBannerTouchStart}
                        title="Перетащите, чтобы изменить позицию"
                      >
                        {renderBannerContent()}
                        
                        {/* Индикатор перетаскивания */}
                        <div className={`absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        
                        {/* Тень при перетаскивании */}
                        {isDragging && (
                          <div className="absolute inset-0 bg-black/20 rounded-lg -z-10 transform translate-y-1 blur-sm"></div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Home-бар */}
                  <div className="w-full h-7 bg-gradient-to-b from-[#e3e6ea] to-[#cfd8dc] rounded-b-[2.5rem] flex items-center justify-center border-t border-[#d1d5db]" style={{minHeight:'28px', maxHeight:'28px'}}>
                    <div className="w-16 h-2 bg-[#e0e0e0] rounded-full shadow-inner" />
                  </div>
                </div>
              </div>
            </div>
            {/* Кнопки управления автопечатью */}
            <div className="flex flex-col gap-3 mt-4 sm:mt-0 sm:ml-4 items-center w-full max-w-xs mx-auto sm:w-56">
              <button
                onClick={handleRunClick}
                disabled={!inputCode.trim() || isTyping || isProcessing}
                className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-400 to-green-600 text-white text-base sm:text-lg font-bold rounded-xl shadow-lg border-2 border-green-500 hover:from-green-500 hover:to-green-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                ▶️ {t.startDemo}
              </button>
              <button
                onClick={resetDemo}
                disabled={!(isTyping || isProcessing)}
                className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-400 to-red-600 text-white text-base sm:text-lg font-bold rounded-xl shadow-lg border-2 border-red-500 hover:from-red-500 hover:to-red-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                ⏹ {t.stopButton}
              </button>
              {!inputCode.trim() && (
                <div className="mt-2 text-center text-[#0984e3] text-base font-semibold opacity-80 select-none">
                  {t.startDemo}
                </div>
              )}
              {inputCode.trim() && (
                <div className="mt-4 sm:mt-6 p-5 w-full max-w-xs bg-gradient-to-br from-white via-[#e3f6fd] to-[#f9fafc] rounded-2xl border border-[#74b9ff] shadow-2xl flex flex-col items-center gap-2">
                  <div className="grid grid-cols-2 gap-4 w-full text-center mb-2">
                    <div>
                      <div className="text-2xl">📝</div>
                      <div className="text-2xl font-extrabold text-[#0984e3]">{inputCode.length}</div>
                    </div>
                    <div>
                      <div className="text-2xl">⏱️</div>
                      <div className="text-2xl font-extrabold text-[#0984e3]">~{estimateTypingTime()}с</div>
                    </div>
                  </div>
                  {estimateTypingTime() > 60 && (
                    <div className="mt-2 text-base text-[#e17055] font-bold flex items-center gap-2 bg-[#fff6e3] rounded-lg px-2 py-1 border border-[#fdcb6e]">
                      <span className="text-xl">⚠️</span> {t.codeLongWarning}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Инструкция */}
        <div className="pb-6">
          <div className="p-4 bg-[#e3f6fd] border-l-4 border-[#74b9ff] rounded-xl shadow text-[#2d3436]">
            <div className="text-base font-bold mb-3">{t.instructionsTitle}</div>
            <div className="text-sm space-y-4">
              <div>
                <div className="font-semibold mb-1">{t.instructionsPrep}</div>
                <ul className="ml-4 list-disc space-y-1">
                  {t.instructionsPrepSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-1">{t.instructionsRecord}</div>
                <ul className="ml-4 list-disc space-y-1">
                  {t.instructionsRecordSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Блок поддержки проекта */}
      <div className="w-full flex justify-center mt-8 mb-4">
        <div className="bg-white/80 border border-[#74b9ff] rounded-xl shadow p-4 flex flex-col items-center text-center max-w-md">
          <div className="font-semibold text-[#0984e3] mb-2">Поддержать проект</div>
          <div className="mb-2">
            <a href="https://github.com/mrKamanov/ytubshorts" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded bg-[#f1f2f6] border border-[#0984e3] text-[#0984e3] font-bold hover:bg-[#e3f6fd] transition">⭐️ Поставить звезду на GitHub</a>
          </div>
          <div className="text-xs text-gray-600 mb-1">Bitcoin: <span className="font-mono select-all">19i9JauVSyDzv9KNDKV1Da9v36GwiZ6at3</span></div>
          <div className="text-xs text-gray-600">Toncoin: <span className="font-mono select-all">UQB2pUhI3rUKiy-hR3mHMAcXvQ4_QNVGDEuFZcRU9qa7MMeA</span></div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeShortsCodeDemo; 