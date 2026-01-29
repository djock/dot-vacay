import React, { useEffect, useState } from 'react';
import { TravelList } from '../types';

interface ListViewProps {
  lists: TravelList[];
  error?: string | null;
  onCreateList: (title: string) => void;
  onDeleteList: (listId: number) => void;
  onAddItem: (listId: number, content: string) => void;
  onToggleItem: (listId: number, itemId: number, nextValue: boolean) => void;
  onDeleteItem: (listId: number, itemId: number) => void;
}

const ListView: React.FC<ListViewProps> = ({
  lists,
  error,
  onCreateList,
  onDeleteList,
  onAddItem,
  onToggleItem,
  onDeleteItem
}) => {
  const [activeListId, setActiveListId] = useState<number | null>(lists[0]?.id || null);
  const [newItemText, setNewItemText] = useState('');
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  useEffect(() => {
    if (lists.length && !lists.find((list) => list.id === activeListId)) {
      setActiveListId(lists[0].id);
    }
  }, [lists, activeListId]);

  const activeList = lists.find((list) => list.id === activeListId) || null;

  const toggleItem = (listId: number, itemId: number, completed: boolean) => {
    onToggleItem(listId, itemId, !completed);
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText || !activeListId) return;
    onAddItem(activeListId, newItemText);
    setNewItemText('');
  };

  const handleCreateList = () => {
    if (!newListTitle.trim()) return;
    onCreateList(newListTitle.trim());
    setNewListTitle('');
    setShowCreateList(false);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-80 shrink-0 space-y-4">
        <div className="flex items-center justify-between mb-2 px-2">
          <h1 className="text-2xl font-bold text-slate-800">My Lists</h1>
          <button
            className="text-sky-600 hover:bg-sky-50 p-1 rounded-lg transition-colors"
            onClick={() => setShowCreateList(true)}
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => setActiveListId(list.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                activeListId === list.id
                  ? 'bg-white border-sky-300 shadow-md ring-2 ring-sky-100'
                  : 'bg-white/50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">{list.title}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    list.type === 'packing' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'
                  }`}
                >
                  {list.type}
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-400">
                <div className="w-full bg-slate-100 h-1 rounded-full mr-3 overflow-hidden">
                  <div
                    className="bg-sky-500 h-full transition-all duration-500"
                    style={{
                      width: `${list.items.length ? (list.items.filter((item) => item.completed).length / list.items.length) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                <span>
                  {list.items.filter((item) => item.completed).length}/{list.items.length || 0}
                </span>
              </div>
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-red-100 bg-red-500/80 px-3 py-2 rounded-xl">{error}</p>}
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col min-w-0">
        {activeList ? (
          <>
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{activeList.title}</h2>
                <p className="text-sm text-slate-500 mt-1">Manage items for your upcoming trip.</p>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-slate-400 hover:text-sky-600 transition-colors" type="button">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  onClick={() => onDeleteList(activeList.id)}
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-3">
              {activeList.items.map((item) => (
                <div
                  key={item.id}
                  className={`group flex items-center space-x-4 p-4 rounded-2xl transition-all border ${
                    item.completed ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 hover:border-sky-200 hover:shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(activeList.id, item.id, item.completed)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      item.completed ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300 text-transparent hover:border-sky-400'
                    }`}
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {item.content}
                    </p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-600 hover:underline flex items-center mt-0.5"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9m1.758-1.758l1.359-1.359a4 4 0 015.656 5.656l-1.101 1.101m-.758 4.826L12.758 15" />
                        </svg>
                        View Website
                      </a>
                    )}
                  </div>
                  <button
                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDeleteItem(activeList.id, item.id)}
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="p-8 border-t border-slate-100">
              <form onSubmit={addItem} className="flex space-x-3">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Add an item, link or location..."
                  className="flex-1 px-5 py-3 bg-slate-100 rounded-2xl border-transparent focus:bg-white focus:border-sky-300 focus:ring-0 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="bg-sky-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20 active:scale-95 transform disabled:opacity-50"
                  disabled={!newItemText}
                >
                  Add Item
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-lg font-bold">Select a list to view contents</p>
            <p className="text-sm">Organize your packing or dream locations.</p>
          </div>
        )}
      </div>

      {showCreateList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">New Travel List</h3>
              <button
                onClick={() => setShowCreateList(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">List Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g. Packing Essentials"
                  value={newListTitle}
                  onChange={(event) => setNewListTitle(event.target.value)}
                />
              </div>
              <button
                className="w-full bg-sky-600 text-white py-4 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20"
                onClick={handleCreateList}
                type="button"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListView;
