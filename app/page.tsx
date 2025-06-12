import type { NextPage } from 'next';
import MarkdownEditor from '../components/MarkdownEditor';

const Home : NextPage = () => {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Next.js + React Markdown Demo</h1>
      <MarkdownEditor />
    </div>
  );
}
export default Home;
