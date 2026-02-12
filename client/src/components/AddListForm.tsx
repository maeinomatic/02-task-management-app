import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { createList } from '../store/slices/listsSlice';

interface Props {
  boardId: string;
}

const AddListForm: React.FC<Props> = ({ boardId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await dispatch(createList({ title, boardId })).unwrap();
      setTitle('');
    } catch {
      // swallow for now
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Column title" className="w-full border px-2 py-1 rounded" />
      <div className="flex justify-end">
        <button className="px-2 py-1 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
      </div>
    </form>
  );
};

export default AddListForm;
