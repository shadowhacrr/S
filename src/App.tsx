import { useState, useEffect } from 'react';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Eye, 
  Share2, 
  Star, 
  Music2,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import './App.css';

// API base URL
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'online' | 'offline' | 'updating';
  lastUpdated: string;
  description: string;
}

const services: Service[] = [
  { 
    id: 'followers', 
    name: 'Followers', 
    icon: <Users className="w-5 h-5" />, 
    status: 'online', 
    lastUpdated: '1 day ago',
    description: 'Get free TikTok followers'
  },
  { 
    id: 'hearts', 
    name: 'Hearts', 
    icon: <Heart className="w-5 h-5" />, 
    status: 'online', 
    lastUpdated: '1 hour ago',
    description: 'Get free TikTok likes'
  },
  { 
    id: 'comments', 
    name: 'Comments Hearts', 
    icon: <MessageCircle className="w-5 h-5" />, 
    status: 'online', 
    lastUpdated: '2 hours ago',
    description: 'Get free comment likes'
  },
  { 
    id: 'views', 
    name: 'Views', 
    icon: <Eye className="w-5 h-5" />, 
    status: 'updating', 
    lastUpdated: '1 week ago',
    description: 'Get free TikTok views'
  },
  { 
    id: 'shares', 
    name: 'Shares', 
    icon: <Share2 className="w-5 h-5" />, 
    status: 'updating', 
    lastUpdated: '3 days ago',
    description: 'Get free TikTok shares'
  },
  { 
    id: 'favorites', 
    name: 'Favorites', 
    icon: <Star className="w-5 h-5" />, 
    status: 'online', 
    lastUpdated: '30 minutes ago',
    description: 'Get free TikTok favorites'
  },
];

function App() {
  const [selectedService, setSelectedService] = useState<string>('hearts');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Generate session ID on mount
  useEffect(() => {
    const sid = Math.random().toString(36).substring(2, 15);
    setSessionId(sid);
    generateCaptcha();
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (cooldownActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCooldownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownActive, timer]);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  const handleSubmit = async () => {
    // Reset message
    setMessage(null);

    // Validate URL
    if (!tiktokUrl.trim()) {
      setMessage({ type: 'error', text: 'Please enter a TikTok URL' });
      return;
    }

    if (!tiktokUrl.includes('tiktok.com')) {
      setMessage({ type: 'error', text: 'Please enter a valid TikTok URL' });
      return;
    }

    // Validate CAPTCHA
    if (captchaInput.toUpperCase() !== captchaCode) {
      setMessage({ type: 'error', text: 'Invalid CAPTCHA code' });
      generateCaptcha();
      return;
    }

    // Check cooldown
    if (cooldownActive) {
      setMessage({ type: 'error', text: `Please wait ${timer} seconds before trying again` });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/submit`, {
        service: selectedService,
        url: tiktokUrl,
        sessionId: sessionId,
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setTimer(response.data.cooldown || 60);
        setCooldownActive(true);
        setTiktokUrl('');
        generateCaptcha();
      } else {
        setMessage({ type: 'error', text: response.data.message });
        if (response.data.cooldown) {
          setTimer(response.data.cooldown);
          setCooldownActive(true);
        }
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Something went wrong. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'updating': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Working';
      case 'offline': return 'Offline';
      case 'updating': return 'Updating';
      default: return 'Unknown';
    }
  };

  const currentService = services.find(s => s.id === selectedService);

  return (
    <div className="zefoy-bg min-h-screen">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <Music2 className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg blur opacity-30"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Shadow Booster
            </h1>
          </div>
          <p className="text-center text-gray-400 mt-2 text-sm">
            Free TikTok Engagement Tool - No Login Required
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Services Sidebar */}
          <div className="lg:col-span-1">
            <div className="zefoy-card p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-300">Services</h2>
              <div className="space-y-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`service-btn ${selectedService === service.id ? 'active' : ''}`}
                  >
                    {service.icon}
                    <div className="flex-1">
                      <div className="font-medium">{service.name}</div>
                      <div className={`text-xs ${getStatusColor(service.status)}`}>
                        {getStatusText(service.status)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-3">
            <div className="zefoy-card p-6">
              {/* Service Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  {currentService?.icon}
                  <h2 className="text-2xl font-bold text-white">{currentService?.name}</h2>
                </div>
                <p className="text-gray-400">{currentService?.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: <span className={getStatusColor(currentService?.status || '')}>
                    {currentService?.lastUpdated}
                  </span>
                </p>
              </div>

              {/* Cooldown Timer */}
              {cooldownActive && timer > 0 && (
                <div className="mb-6 p-6 bg-gradient-to-r from-pink-900/30 to-purple-900/30 rounded-lg border border-pink-500/30">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Clock className="w-6 h-6 text-pink-500" />
                    <span className="text-lg font-semibold text-pink-400">Please Wait</span>
                  </div>
                  <div className="timer-display">{formatTime(timer)}</div>
                  <p className="text-center text-gray-400 mt-2">
                    Please wait before using this service again
                  </p>
                </div>
              )}

              {/* Input Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    TikTok Video URL
                  </label>
                  <input
                    type="text"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@username/video/1234567890"
                    className="zefoy-input"
                    disabled={cooldownActive}
                  />
                </div>

                {/* CAPTCHA */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Security Verification
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="captcha-box flex-1">
                      {captchaCode}
                    </div>
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="zefoy-input sm:w-32"
                      maxLength={6}
                      disabled={cooldownActive}
                    />
                    <button
                      onClick={generateCaptcha}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                      disabled={cooldownActive}
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || cooldownActive}
                  className="zefoy-btn w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : cooldownActive ? (
                    <>
                      <Clock className="w-5 h-5" />
                      Wait {formatTime(timer)}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit
                    </>
                  )}
                </button>

                {/* Message Display */}
                {message && (
                  <div
                    className={`p-4 rounded-lg flex items-center gap-3 ${
                      message.type === 'success'
                        ? 'bg-green-900/30 border border-green-500/30 text-green-400'
                        : 'bg-red-900/30 border border-red-500/30 text-red-400'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{message.text}</span>
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                <h3 className="font-semibold text-gray-300 mb-2">How to use:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-400">
                  <li>Copy your TikTok video URL</li>
                  <li>Paste it in the field above</li>
                  <li>Enter the security code shown</li>
                  <li>Click Submit and wait for processing</li>
                  <li>Wait for the cooldown period before next use</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="zefoy-card p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">100% Free</h3>
            <p className="text-gray-400 text-sm">All services are completely free to use. No hidden charges.</p>
          </div>

          <div className="zefoy-card p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Login Required</h3>
            <p className="text-gray-400 text-sm">We never ask for your password or personal information.</p>
          </div>

          <div className="zefoy-card p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Fast Delivery</h3>
            <p className="text-gray-400 text-sm">Get your engagement delivered within minutes.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Shadow Booster. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            This tool is for educational purposes only. Use at your own risk.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
