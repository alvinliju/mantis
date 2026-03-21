export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 bg-background">
      {children}
    </div>
  );
}
