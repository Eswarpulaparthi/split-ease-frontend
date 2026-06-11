import { useAuth } from "../context/AuthContext";

export default function LoginModal({ onClose }) {
  const { googleLogin } = useAuth();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-7">
          <span className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
            S
          </span>
          <span className="font-semibold text-gray-900 text-lg">SplitEase</span>
        </div>

        <p className="text-lg font-semibold text-gray-900 text-center mb-1">
          Welcome 👋 Let's Get Started!
        </p>

        <p className="text-sm text-center mb-6 text-gray-500">
          Split expenses with friends, stress-free.
        </p>

        <button
          onClick={googleLogin}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl py-2.5 px-4 text-sm transition-colors"
          style={{
            background: "#fff",
            border: "1px solid #d1d5db",
            color: "#111827",
          }}
        >
          <GoogleLogo />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.148 17.64 11.84 17.64 9.2z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
