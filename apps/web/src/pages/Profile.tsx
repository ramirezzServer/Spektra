import { useParams } from 'react-router-dom';

export function Profile() {
  const { username } = useParams();
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center text-accent text-xl font-semibold">
          {username?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-content-primary">@{username}</h1>
          <p className="text-content-secondary text-sm">Member of Spektra</p>
        </div>
      </div>
    </div>
  );
}
