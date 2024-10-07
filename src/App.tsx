import axios from 'axios';
import './index.css';
import Chat from './components/Chat';
import Upload from './components/Upload';

const baseUrl = 'http://localhost:9000';
axios.defaults.baseURL = baseUrl;
axios.defaults.headers.post['Content-Type'] = 'application/json';

function App() {
  return (
    <div className="flex h-screen w-screen bg-black text-gray-200 content-center justify-center font-paji subpixel-antialiased font-extralight tracking-wide">
      <Chat />
      <Upload />
    </div>
  );
}

export default App;
