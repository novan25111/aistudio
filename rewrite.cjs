const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

function range(start, end) {
  return lines.slice(start, end + 1).join('\n');
}

const banner = range(294, 334);
const grafik = range(340, 352);
const news = range(355, 463);
const aktivitas = range(470, 520);
const rekomendasi = range(522, 600);
const kalender = range(601, 628);
const aiConsult = range(629, 638); // the part with Butuh Konsultasi AI?

let dynamicNews = news.replace("filteredNewsList.slice(0, 100)", "filteredNewsList.slice(0, activeTab === 'News' ? 100 : 7)");
dynamicNews = dynamicNews.replace('<div className="pt-4 h-[450px] sm:h-[550px] lg:h-[650px] flex flex-col">', '<div className={cn("pt-4 flex flex-col", activeTab === "News" ? "h-[75vh]" : "h-[450px] sm:h-[550px]")}>');

const newMainContent = `
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight hidden sm:block">CNHL Platform</h2>
          <div className="flex w-full overflow-x-auto sm:w-auto space-x-1 rounded-2xl bg-neutral-100 p-1.5 dark:bg-neutral-800/50 shadow-inner" style={{ scrollbarWidth: 'none' }}>
            {['Dashboard', 'News', 'Rekomendasi Saham'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "whitespace-nowrap flex-1 sm:flex-none rounded-xl px-4 sm:px-6 py-2.5 text-sm font-bold transition-all",
                  activeTab === tab 
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white ring-1 ring-black/5 dark:ring-white/10" 
                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'Dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            ${banner}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                ${dynamicNews}
              </div>
              <div className="space-y-8">
                ${aktivitas}
                ${aiConsult}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'News' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            ${dynamicNews}
          </div>
        )}

        {activeTab === 'Rekomendasi Saham' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                ${grafik}
                ${kalender}
              </div>
              <div className="space-y-8">
                ${rekomendasi}
              </div>
            </div>
          </div>
        )}
      </main>
`;

let newCode = lines.slice(0, 294).join('\n') + '\n' + newMainContent + '\n' + lines.slice(643).join('\n');
newCode = newCode.replace("useState('overview')", "useState('Dashboard')");

fs.writeFileSync('src/App.tsx', newCode);
console.log('Update complete');
