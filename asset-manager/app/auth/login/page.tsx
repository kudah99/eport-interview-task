import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div 
      className="flex min-h-svh w-full"
      style={{ 
        backgroundColor: "#f5f5f5",
        background: "linear-gradient(135deg, #20b2aa 0%, #17a2b8 100%)"
      }}
    >
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">Asset Manager</h1>
            <p className="text-xl text-white/90">
              Streamline your asset management with our powerful platform
            </p>
          </div>
          <AssetIllustration />
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-4xl font-bold text-white mb-2">Asset Manager</h1>
            <p className="text-white/90">Sign in to your account</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

function AssetIllustration() {
  return (
    <svg
      viewBox="0 0 600 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      {/* Background shapes */}
      <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.1)" />
      <circle cx="500" cy="400" r="100" fill="rgba(255,255,255,0.08)" />
      <circle cx="450" cy="100" r="60" fill="rgba(255,255,255,0.1)" />
      
      {/* Main building/office structure */}
      <rect x="150" y="200" width="300" height="200" fill="rgba(255,255,255,0.15)" rx="8" />
      <rect x="170" y="220" width="260" height="160" fill="rgba(255,255,255,0.2)" rx="4" />
      
      {/* Windows grid */}
      <rect x="190" y="240" width="50" height="50" fill="rgba(255,255,255,0.3)" rx="4" />
      <rect x="260" y="240" width="50" height="50" fill="rgba(255,255,255,0.3)" rx="4" />
      <rect x="330" y="240" width="50" height="50" fill="rgba(255,255,255,0.3)" rx="4" />
      <rect x="190" y="310" width="50" height="50" fill="rgba(255,255,255,0.3)" rx="4" />
      <rect x="260" y="310" width="50" height="50" fill="rgba(255,255,255,0.3)" rx="4" />
      <rect x="330" y="310" width="50" height="50" fill="rgba(255,255,255,0.3)" rx="4" />
      
      {/* Asset icons floating */}
      <g transform="translate(80, 350)">
        <rect x="0" y="0" width="40" height="40" fill="rgba(255,255,255,0.25)" rx="6" />
        <rect x="8" y="8" width="24" height="24" fill="rgba(255,255,255,0.4)" rx="2" />
        <circle cx="20" cy="20" r="4" fill="rgba(255,255,255,0.6)" />
      </g>
      
      <g transform="translate(480, 250)">
        <rect x="0" y="0" width="40" height="40" fill="rgba(255,255,255,0.25)" rx="6" />
        <rect x="8" y="8" width="24" height="24" fill="rgba(255,255,255,0.4)" rx="2" />
        <circle cx="20" cy="20" r="4" fill="rgba(255,255,255,0.6)" />
      </g>
      
      <g transform="translate(50, 200)">
        <rect x="0" y="0" width="40" height="40" fill="rgba(255,255,255,0.25)" rx="6" />
        <rect x="8" y="8" width="24" height="24" fill="rgba(255,255,255,0.4)" rx="2" />
        <circle cx="20" cy="20" r="4" fill="rgba(255,255,255,0.6)" />
      </g>
      
      {/* Chart/graph representation */}
      <g transform="translate(200, 100)">
        <rect x="0" y="0" width="200" height="80" fill="rgba(255,255,255,0.15)" rx="8" />
        <line x1="20" y1="60" x2="40" y2="40" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
        <line x1="40" y1="40" x2="60" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
        <line x1="60" y1="50" x2="80" y2="30" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
        <line x1="80" y1="30" x2="100" y2="45" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
        <line x1="100" y1="45" x2="120" y2="25" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
        <line x1="120" y1="25" x2="140" y2="35" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
        <line x1="140" y1="35" x2="160" y2="20" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
        <line x1="160" y1="20" x2="180" y2="30" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
      </g>
      
      {/* Connection lines */}
      <line x1="120" y1="370" x2="200" y2="400" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5,5" />
      <line x1="520" y1="270" x2="450" y2="400" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5,5" />
    </svg>
  );
}
