'use client';
export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-white font-display font-bold text-lg mb-3">MindMesh</div>
            <p className="text-gray-500 text-sm leading-relaxed">The ultimate competitive programming companion for students targeting top tech companies.</p>
          </div>
          {[
            { title: 'Platform', links: ['Problems', 'Sheets', 'Leaderboard', 'Community'] },
            { title: 'Tools', links: ['Code Editor', 'Canvas Visualizer', 'AI Notes', 'Analytics'] },
            { title: 'Company', links: ['About', 'Blog', 'Privacy', 'Terms'] },
          ].map((col, i) => (
            <div key={i}>
              <div className="text-white font-semibold text-sm mb-3">{col.title}</div>
              <ul className="space-y-2">
                {col.links.map(link => <li key={link}><a href="#" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">{link}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2025 MindMesh. Built with ❤️ for students.</p>
          <div className="flex items-center gap-4">
            {['Twitter', 'GitHub', 'Discord', 'LinkedIn'].map(s => <a key={s} href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">{s}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
