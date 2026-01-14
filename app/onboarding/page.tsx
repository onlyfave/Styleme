import { Heart, Sparkles, Shield } from "lucide-react";

export default function SplashScreen() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-pink-300 opacity-50 blur-2xl"></div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-400 shadow-xl">
              <Heart className="h-12 w-12 text-white" fill="white" />
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="mb-4 text-5xl font-bold text-gray-800 font-crimson-text">
          StyleLove
        </h1>

        {/* Tagline */}
        <p className="mb-12 text-xl text-gray-700 font-light">
          Let's find styles that love your body back
        </p>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <a
            href="/account/signup"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-pink-500 hover:to-purple-500 hover:shadow-xl"
          >
            <Sparkles className="h-5 w-5" />
            Sign Up with Email
          </a>

          <a
            href="/onboarding?guest=true"
            className="flex w-full items-center justify-center rounded-xl border-2 border-pink-300 bg-white px-6 py-4 text-lg font-semibold text-gray-800 transition-all hover:border-pink-400 hover:bg-pink-50"
          >
            Continue as Guest
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-600">
          <Shield className="h-4 w-4 text-pink-400" />
          <span>Body-positive • Judgment-free • Empowering</span>
        </div>
      </div>
    </div>
  );
}