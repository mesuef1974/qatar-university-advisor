import React from 'react';
import { GraduationCapIcon, SendIcon, UniversityIcon, SearchIcon, ScholarshipIcon, BookIcon } from './icons/Icons';

const welcomeCards = [
  { icon: UniversityIcon, text: 'استكشف الجامعات القطرية', query: 'ما هي الجامعات المتاحة في قطر؟' },
  { icon: SearchIcon, text: 'ابحث عن تخصصك', query: 'ما هي التخصصات المتاحة؟' },
  { icon: ScholarshipIcon, text: 'المنح الدراسية', query: 'ما هي المنح الدراسية المتاحة؟' },
  { icon: BookIcon, text: 'شروط القبول', query: 'ما هي شروط القبول في الجامعات؟' },
];

const quickSuggestions = [
  'جامعات مجانية للقطريين',
  'أفضل تخصصات الهندسة',
  'جامعات تقبل 70%',
  'الفرق بين جامعة قطر وحمد بن خليفة',
];

export default function ChatView({ messages, isTyping, input, setInput, sendMessage, messagesEndRef, userProfile, pdfLoading: _pdfLoading, setPdfLoading: _setPdfLoading }) {
  const hasMessages = messages && messages.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) sendMessage(input);
  };

  const handleSuggestion = (text) => {
    sendMessage(text);
  };

  const getUserInitial = () => {
    if (userProfile?.name) return userProfile.name.charAt(0);
    return 'أ';
  };

  return (
    <div className="eds-chat">
      <div className="eds-chat__messages">
        {!hasMessages ? (
          <div className="eds-chat__welcome">
            <div className="eds-chat__welcome-icon">
              <GraduationCapIcon size={48} color="#8A1538" />
            </div>
            <h1 className="eds-chat__welcome-title">مرحبا بك في المستشار الجامعي القطري</h1>
            <p className="eds-chat__welcome-subtitle">
              مساعدك الذكي للبحث عن الجامعات والتخصصات في قطر
            </p>
            <div className="eds-chat__welcome-grid">
              {welcomeCards.map((card, i) => (
                <button
                  key={i}
                  className="eds-chat__welcome-card"
                  onClick={() => handleSuggestion(card.query)}
                >
                  <card.icon size={24} color="#8A1538" />
                  <span>{card.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`eds-chat__msg ${msg.sender === 'user' ? 'eds-chat__msg--user' : 'eds-chat__msg--bot'}`}
              >
                <div className="eds-chat__msg-avatar">
                  {msg.sender === 'user' ? (
                    <span className="eds-chat__avatar-letter">{getUserInitial()}</span>
                  ) : (
                    <GraduationCapIcon size={18} color="#FFFFFF" />
                  )}
                </div>
                <div className="eds-chat__msg-content">
                  {msg.sender === 'bot' ? (
                    <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="eds-chat__msg eds-chat__msg--bot">
                <div className="eds-chat__msg-avatar">
                  <GraduationCapIcon size={18} color="#FFFFFF" />
                </div>
                <div className="eds-chat__msg-content">
                  <div className="eds-chat__typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Suggestions bar */}
      {hasMessages && (
        <div className="eds-chat__suggestions">
          {quickSuggestions.map((s, i) => (
            <button key={i} className="eds-chat__suggestion-pill" onClick={() => handleSuggestion(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="eds-chat__input-area">
        <form className="eds-chat__input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="eds-chat__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            dir="rtl"
          />
          <button
            type="submit"
            className="eds-chat__send-btn"
            disabled={!input.trim()}
            aria-label="إرسال"
          >
            <SendIcon size={18} color="#FFFFFF" />
          </button>
        </form>
      </div>
    </div>
  );
}
