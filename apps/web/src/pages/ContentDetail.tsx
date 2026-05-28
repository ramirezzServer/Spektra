import { useParams } from 'react-router-dom';

export function ContentDetail() {
  const { type, id } = useParams();
  return (
    <div className="text-content-secondary text-sm">
      Loading {type} #{id}...
    </div>
  );
}
