"use client";

import { useState } from "react";
import { Database, CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/search/sync-algolia", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to sync");
      }
    } catch (err) {
      console.error("Sync error:", err);
      setError( "An error occurred while syncing" );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-pink-100 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-800 font-crimson-text">
            Admin: Algolia Sync
          </h1>
          <p className="text-gray-600">
            Sync outfit data from your database to Algolia search index
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 flex items-start gap-4 rounded-xl bg-blue-50 p-4">
            <Database className="shrink-0 text-blue-500" />
            <div className="text-sm text-blue-900">
              <p className="mb-2 font-semibold">Before you sync:</p>
              <ol className="list-inside list-decimal space-y-1">
                <li>Make sure you've set up your Algolia account</li>
                <li>Add your Algolia credentials to environment variables</li>
                <li>Click the sync button below to index all outfits</li>
              </ol>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-pink-400 to-purple-400 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-pink-500 hover:to-purple-500 disabled:opacity-50"
          >
            {syncing ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Database className="h-5 w-5" />
                Sync to Algolia
              </>
            )}
          </button>

          {result && (
            <div className="rounded-xl bg-green-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <p className="font-semibold">Sync Successful!</p>
              </div>
              <p className="text-sm text-green-600">
                Successfully synced {result} outfits to Algolia
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p className="font-semibold">Sync Failed</p>
              </div>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Environment Variables Needed
          </h2>
          <div className="space-y-3 rounded-xl bg-gray-50 p-4 font-mono text-sm">
            <div>
              <span className="text-gray-600">ALGOLIA_APP_ID=</span>
              <span className="text-pink-600">your_app_id</span>
            </div>
            <div>
              <span className="text-gray-600">ALGOLIA_ADMIN_API_KEY=</span>
              <span className="text-pink-600">your_admin_key</span>
            </div>
            <div>
              <span className="text-gray-600">ALGOLIA_SEARCH_API_KEY=</span>
              <span className="text-pink-600">your_search_key</span>
            </div>
            <div>
              <span className="text-gray-600">ALGOLIA_INDEX_NAME=</span>
              <span className="text-pink-600">outfits</span>
              <span className="ml-2 text-gray-500">
                (optional, defaults to "outfits")
              </span>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p className="mb-2 font-semibold">
              How to get your Algolia credentials:
            </p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Sign up at algolia.com (free tier available)</li>
              <li>Go to Settings → API Keys</li>
              <li>Copy your Application ID and API keys</li>
              <li>
                Add them as environment variables in your Anything project
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/feed" className="text-sm text-pink-500 hover:text-pink-600">
            ← Back to Feed
          </a>
        </div>
      </div>
    </div>
  );
}