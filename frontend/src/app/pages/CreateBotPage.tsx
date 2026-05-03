import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Upload, X } from 'lucide-react';

const steps = ['Identity', 'Knowledge', 'Preview'];
const emojis = ['💬', '💼', '🤖', '🎓', '📦', '⚡', '🔮', '🧠'];
const colors = ['#0A0A0A', '#2A2A2A', '#4A4A4A', '#1A6B3C', '#1A4A6B', '#6B1A4A'];

export function CreateBotPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [botName, setBotName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💬');
  const [selectedColor, setSelectedColor] = useState('#0A0A0A');
  const [selectedTab, setSelectedTab] = useState<'file' | 'url' | 'text'>('file');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleFileUpload = () => {
    setUploadedFiles([...uploadedFiles, 'example-doc.pdf']);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="h-[60px] border-b border-[var(--border-default)] px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1" style={{ fontWeight: 500, fontSize: '15px' }}>
          <span>botbase</span>
          <span style={{ color: 'var(--text-secondary)' }}>.ai</span>
        </Link>
        <Link to="/dashboard" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Cancel
        </Link>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center py-8 gap-12">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all"
                style={{
                  background: index <= currentStep ? 'var(--text-primary)' : 'transparent',
                  color: index <= currentStep ? 'white' : 'var(--text-tertiary)',
                  border: index <= currentStep ? 'none' : '1px solid var(--border-default)',
                }}
              >
                {index < currentStep ? <Check size={16} /> : index + 1}
              </div>
              <span
                className="text-sm"
                style={{
                  color: index <= currentStep ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontWeight: index === currentStep ? 500 : 400,
                }}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className="w-[40px] h-[1px]"
                style={{
                  background: index < currentStep ? 'var(--text-primary)' : 'var(--border-default)',
                  borderStyle: index < currentStep ? 'solid' : 'dashed',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {currentStep === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Column */}
            <div className="space-y-6">
              <h2 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.4px' }}>Name your bot</h2>

              <div>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="e.g. Support Bot, Product FAQ..."
                  className="w-full px-4 rounded-lg border transition-all"
                  style={{
                    border: '1px solid var(--border-default)',
                    fontSize: '18px',
                    height: '48px',
                  }}
                />
                <p className="text-xs text-right mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {botName.length} / 40
                </p>
              </div>

              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                  CHOOSE AN AVATAR
                </p>
                <div className="grid grid-cols-8 gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: selectedEmoji === emoji ? '2px solid var(--text-primary)' : '2px solid transparent',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                  ACCENT COLOR
                </p>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="w-7 h-7 rounded-full transition-all hover:scale-110"
                      style={{
                        background: color,
                        outline: selectedColor === color ? '2px solid var(--text-primary)' : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Column */}
            <div className="sticky top-8">
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                LIVE PREVIEW
              </p>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4 h-[400px] relative">
                <div className="absolute bottom-6 right-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg cursor-pointer transition-all hover:scale-110"
                    style={{ background: selectedColor }}
                  >
                    {selectedEmoji}
                  </div>
                </div>
              </div>
              <p className="text-xs text-center mt-2" style={{ color: 'var(--text-tertiary)' }}>
                This is how visitors will see your bot.
              </p>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.4px' }}>What should your bot know?</h2>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-[var(--bg-secondary)] rounded-lg w-fit">
              {[
                { id: 'file', label: 'Upload file' },
                { id: 'url', label: 'Paste URL' },
                { id: 'text', label: 'Write text' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                  className="px-4 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: selectedTab === tab.id ? 'white' : 'transparent',
                    color: selectedTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: selectedTab === tab.id ? 500 : 400,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {selectedTab === 'file' && (
              <div>
                <div
                  className="h-[200px] border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-solid hover:scale-[1.01] transition-all"
                  style={{
                    border: '1px dashed var(--border-strong)',
                    background: 'var(--bg-secondary)',
                  }}
                  onClick={handleFileUpload}
                >
                  <Upload size={24} style={{ color: 'var(--text-tertiary)' }} />
                  <h3 style={{ fontSize: '15px', fontWeight: 500 }}>Drop files here</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>PDF, DOCX, TXT — up to 20MB</p>
                  <button className="text-sm underline" style={{ textDecorationOffset: '2px' }}>
                    Browse files
                  </button>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        style={{ border: '1px solid var(--border-default)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[var(--bg-secondary)] flex items-center justify-center text-xs">
                            PDF
                          </div>
                          <span className="text-sm">{file}</span>
                        </div>
                        <button onClick={() => setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))}>
                          <X size={16} style={{ color: 'var(--text-tertiary)' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'url' && (
              <div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://docs.yoursite.com/..."
                    className="flex-1 h-[36px] px-3 rounded-lg border"
                    style={{ border: '1px solid var(--border-default)', fontSize: '14px' }}
                  />
                  <button
                    className="px-4 rounded-lg text-white"
                    style={{ background: 'var(--text-primary)', fontSize: '14px' }}
                  >
                    Fetch & analyze →
                  </button>
                </div>
              </div>
            )}

            {selectedTab === 'text' && (
              <textarea
                placeholder="Paste your FAQs, product descriptions, support docs..."
                className="w-full min-h-[200px] p-3 rounded-lg border resize-none"
                style={{ border: '1px solid var(--border-default)', fontSize: '14px' }}
              />
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.4px' }}>Your bot is ready.</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Test it, then grab your script tag.
                </p>
              </div>

              <div
                className="p-4 rounded-lg border font-mono text-xs"
                style={{ border: '1px solid var(--border-default)', background: 'var(--bg-secondary)' }}
              >
                <code>&lt;script src="https://botbase.ai/widget.js" data-bot-id="abc123"&gt;&lt;/script&gt;</code>
              </div>

              <button className="w-full h-[36px] rounded-lg border transition-all hover:bg-[var(--bg-secondary)]" style={{ border: '1px solid var(--border-default)' }}>
                Copy script tag
              </button>
            </div>

            <div>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4 h-[400px] flex items-center justify-center">
                <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Chat preview would appear here</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--border-default)]">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 h-[36px] rounded-lg border transition-all hover:bg-[var(--bg-secondary)]"
              style={{ border: '1px solid var(--border-default)' }}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-6 h-[36px] rounded-lg text-white transition-all hover:bg-[#2A2A2A]"
            style={{ background: 'var(--text-primary)' }}
          >
            {currentStep === steps.length - 1 ? 'Go to dashboard →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
