import { useState } from 'react';
import Upload from './pages/Upload.jsx';
import Chat from './pages/Chat.jsx';

export default function App() {
  // Simple routing via state — no react-router needed for Phase 1
  const [page, setPage] = useState('upload'); // 'upload' | 'chat'
  const [bot, setBot] = useState(null);

  // bot = { botId, botName, chunkCount, source }

  function onBotCreated(botData) {
    setBot(botData);
    setPage('chat');
  }

  function onBack() {
    setPage('upload');
    setBot(null);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {page === 'upload' && <Upload onBotCreated={onBotCreated} />}
      {page === 'chat'   && <Chat bot={bot} onBack={onBack} />}
    </div>
  );
}
