import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Construction } from 'lucide-react';

export default function GenericPage() {
  const { pageId } = useParams();

  const getPageTitle = (id) => {
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0B1220] flex flex-col items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl backdrop-blur-xl">
        <div className="w-20 h-20 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Construction className="w-10 h-10 text-orange" />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">{getPageTitle(pageId)} Page</h1>
        <p className="text-gray-400 mb-8">
          This is a secondary page for the RoadFixNow demo. It is fully routed but the custom UI has not been built out yet for the MVP.
        </p>
        <Link to="/" className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition inline-block">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
