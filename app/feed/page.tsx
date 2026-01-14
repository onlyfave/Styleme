"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Home,
  User as UserIcon,
  Search,
  MessageCircle,
  X,
  Send,
} from "lucide-react";

type Message = {
  role: string;
  content: string;
};

type Outfit = {
  id: number;
  category: string;
  image_url: string;
  title: string;
  description: string;
  body_types: string[];
  source: string;
};

type Favorite = {
  outfit_id: number;
};

type User = {
  id: string;
  email?: string;
  name?: string;
} | null;

// Simple useUser hook
function useUser() {
  const [data, setData] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/token')
      .then(res => res.ok ? res.json() : null)
      .then(data => setData(data?.user || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

const categories = ["All", "Tops", "Bottoms", "Dresses", "Outerwear"];

export default function FeedPage() {
  const { data: user, loading: userLoading } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [favorites, setFavorites] = useState(new Set<number>());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchOutfits();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchOutfits = async () => {
    try {
      const response = await fetch("/api/outfits");
      if (response.ok) {
        const data = await response.json();
        setOutfits(data.outfits || []);
      }
    } catch (error) {
      console.error("Error fetching outfits:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(new Set(data.favorites.map((f: Favorite) => f.outfit_id)));
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (outfitId: number) => {
    if (!user) {
      window.location.href = "/account/signin?callbackUrl=/feed";
      return;
    }

    const isFavorited = favorites.has(outfitId);

    // Optimistic update
    const newFavorites = new Set(favorites);
    if (isFavorited) {
      newFavorites.delete(outfitId);
    } else {
      newFavorites.add(outfitId);
    }
    setFavorites(newFavorites);

    try {
      if (isFavorited) {
        await fetch(`/api/favorites/${outfitId}`, { method: "DELETE" });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outfitId }),
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert on error
      setFavorites(favorites);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      fetchOutfits();
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          filters: { category: selectedCategory },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutfits(data.hits || []);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { role: "user", content: chatInput };
    setChatMessages([...chatMessages, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/ai-stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatMessages,
          userMessage: chatInput,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages([
          ...chatMessages,
          userMessage,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setChatMessages([
        ...chatMessages,
        userMessage,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble right now. Please try again!",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredOutfits =
    selectedCategory === "All"
      ? outfits
      : outfits.filter((outfit: Outfit) => outfit.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
        <p className="text-lg text-gray-600">Loading your styles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="mb-4 text-3xl font-bold text-gray-800 font-crimson-text">
            Your Style Feed
          </h1>

          {/* Search bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search styles, occasions, vibes..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-pink-400 border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-pink-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Outfits grid */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {filteredOutfits.map((outfit) => (
            <div
              key={outfit.id}
              className="overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-xl"
            >
              <div className="relative aspect-square">
                <img
                  src={outfit.image_url}
                  alt={outfit.title}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => toggleFavorite(outfit.id)}
                  className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-md transition-all hover:scale-110"
                >
                  <Heart
                    className={`h-6 w-6 ${
                      favorites.has(outfit.id)
                        ? "fill-pink-500 text-pink-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
              <div className="p-4">
                <h3 className="mb-2 font-semibold text-gray-800">
                  {outfit.title}
                </h3>
                <p className="mb-3 text-sm text-gray-600">
                  {outfit.description}
                </p>
                <p className="text-xs text-gray-500">{outfit.source}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredOutfits.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-600">
              No styles found in this category yet!
            </p>
          </div>
        )}
      </div>

      {/* AI Stylist Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-24 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
      >
        {showChat ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* AI Stylist Chat Window */}
      {showChat && (
        <div className="fixed bottom-24 right-6 z-20 mb-4 w-80 overflow-hidden rounded-2xl bg-white shadow-2xl sm:w-96">
          <div className="bg-gradient-to-r from-pink-400 to-purple-400 p-4 text-white">
            <h3 className="font-semibold font-crimson-text text-lg">
              Your AI Stylist 💕
            </h3>
            <p className="text-sm text-pink-50">Ask me anything about style!</p>
          </div>

          <div className="flex h-96 flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 text-sm pt-8">
                  <p className="mb-2">👋 Hi! I'm your personal stylist!</p>
                  <p className="text-xs">
                    Ask me about outfit ideas, styling tips, or what works for
                    your body type!
                  </p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400"></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-pink-400"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-pink-400"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                  disabled={chatLoading}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 px-4 py-2 text-white transition-all hover:from-pink-500 hover:to-purple-500 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-around py-3">
          <a
            href="/feed"
            className="flex flex-col items-center gap-1 text-pink-500"
          >
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
          </a>
          <a
            href="/vault"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-pink-500"
          >
            <Heart className="h-6 w-6" />
            <span className="text-xs font-medium">Vault</span>
          </a>
          <a
            href="/profile"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-pink-500"
          >
            <UserIcon className="h-6 w-6" />
            <span className="text-xs font-medium">Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
}