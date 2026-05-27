import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return (
    <div className="grid min-h-screen place-items-center bg-app-bg px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <div className="mt-5 space-y-3">
          <Input placeholder="Email" type="email" />
          <Input placeholder="Password" type="password" />
          <Button className="w-full" onClick={() => { setAuth('demo-token', { id: 'demo', username: 'demo', email: 'demo@spektra.test', avatarUrl: null, bio: null, createdAt: new Date().toISOString() }); navigate('/'); }}>Log in</Button>
        </div>
        <p className="mt-4 text-sm text-app-muted">No account? <Link className="font-semibold text-app-accent" to="/register">Create one</Link></p>
      </Card>
    </div>
  );
}
