import { useEffect, useRef, useState } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

const ghostBtn =
  'rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5 disabled:opacity-40';

export default function ImageUploadField({
  label,
  value,
  pendingFile,
  busy = false,
  onPick,
  onRemove,
}) {
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pendingFile]);

  const shown = previewUrl || value || null;

  const handleChange = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError('Use a JPEG, PNG, GIF or WebP image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError('The image is larger than 10 MB.');
      return;
    }
    setLocalError('');
    onPick(file);
  };

  const handleRemove = () => {
    setLocalError('');
    onRemove();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/80">{label}</label>

      {shown && (
        <div className="space-y-2">
          <img
            src={shown}
            alt={label}
            className="max-h-64 rounded-lg border border-white/10 bg-black/20"
          />
          {pendingFile && (
            <p className="text-xs text-amber-200">
              New image, not uploaded yet: {pendingFile.name}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleChange}
        />
        <button
          type="button"
          className={ghostBtn}
          disabled={busy}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          {shown ? 'Replace image' : 'Choose image'}
        </button>
        {shown && (
          <button
            type="button"
            className={ghostBtn + ' hover:text-red-300'}
            disabled={busy}
            onClick={handleRemove}
          >
            Remove
          </button>
        )}
        {busy && <span className="text-xs text-white/50">Working…</span>}
      </div>

      {localError && <p className="text-xs text-red-400">{localError}</p>}
      <p className="text-xs text-white/50">JPEG, PNG, GIF or WebP, up to 10 MB.</p>
    </div>
  );
}