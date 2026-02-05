"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Activity, 
  Database, 
  Server, 
  Zap, 
  LogOut, 
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Key,
  Send,
  Plus,
  Trash2,
  Settings,
  Layers,
  Route,
  FolderOpen
} from "lucide-react";
import { GlassCard, GlassButton, GlassInput, StatusBadge, Logo } from "@/components/glass";
import { api, getApiKey, removeApiKey, setApiKey, type HealthResponse, type Credential } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";

const PROVIDERS = [
  { id: "openai", name: "OpenAI", placeholder: "sk-..." },
  { id: "anthropic", name: "Anthropic", placeholder: "sk-ant-..." },
  { id: "google", name: "Google", placeholder: "AIza..." },
  { id: "groq", name: "Groq", placeholder: "gsk_..." },
  { id: "mistral", name: "Mistral", placeholder: "..." },
  { id: "together", name: "Together", placeholder: "..." },
  { id: "perplexity", name: "Perplexity", placeholder: "pplx-..." },
  { id: "cohere", name: "Cohere", placeholder: "..." },
];

export default function AppPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, accessToken, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "credentials" | "test">("overview");
  
  // Test request state
  const [testPrompt, setTestPrompt] = useState("Say hello in one word.");
  const [testModel, setTestModel] = useState("gpt-4o-mini");
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  
  // Credentials state
  const [newProvider, setNewProvider] = useState("");
  const [newApiKey, setNewApiKey] = useState("");

  // Get the token to use for API calls (Cognito JWT or legacy API key)
  const currentToken = accessToken || getApiKey();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, authLoading, isAuthenticated, router]);

  // Sync Cognito token to localStorage for API calls
  useEffect(() => {
    if (accessToken) {
      setApiKey(accessToken);
    }
  }, [accessToken]);

  const { data: health, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    refetchInterval: 30000,
    enabled: mounted && !!currentToken,
  });

  const { data: credentialsData, refetch: refetchCredentials } = useQuery({
    queryKey: ["credentials"],
    queryFn: api.credentials.list,
    enabled: mounted && !!currentToken,
  });

  const handleLogout = async () => {
    await logout();
    removeApiKey();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleTestRequest = async () => {
    setTestLoading(true);
    setTestResponse(null);
    
    try {
      const response = await fetch("http://localhost:8080/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: "user", content: testPrompt }],
        }),
      });
      
      const data = await response.json();
      const provider = response.headers.get("x-relaystack-provider");
      const latency = response.headers.get("x-relaystack-latency");
      const requestId = response.headers.get("x-relaystack-request-id");
      const fallback = response.headers.get("x-relaystack-fallback");
      
      setTestResponse({
        status: response.status,
        data,
        provider,
        latency,
        requestId,
        fallback: fallback === "true",
      });
      
      if (response.ok) {
        toast.success(`Response from ${provider || "gateway"}`);
      } else if (response.status === 429) {
        toast.error("Rate limit exceeded");
      } else {
        toast.error(data.message || "Request failed");
      }
    } catch (err) {
      toast.error("Failed to send request");
      setTestResponse({ error: "Failed to connect to gateway" });
    } finally {
      setTestLoading(false);
    }
  };

  const handleAddCredential = async () => {
    if (!newProvider || !newApiKey) {
      toast.error("Select a provider and enter API key");
      return;
    }
    
    try {
      await api.credentials.create(newProvider, newApiKey);
      toast.success(`${newProvider} API key saved`);
      setNewProvider("");
      setNewApiKey("");
      refetchCredentials();
    } catch (err: any) {
      toast.error(err.message || "Failed to save credential");
    }
  };

  const handleDeleteCredential = async (id: string, provider: string) => {
    try {
      await api.credentials.delete(id);
      toast.success(`${provider} API key deleted`);
      refetchCredentials();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete credential");
    }
  };

  if (!mounted) return null;
  
  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "credentials", label: "API Keys", icon: Key },
    { id: "test", label: "Test Request", icon: Send },
  ];

  const futureNavItems = [
    { label: "Projects", icon: FolderOpen },
    { label: "Environments", icon: Layers },
    { label: "Routes", icon: Route },
    { label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 border-r border-white/5 p-6 flex flex-col"
      >
        <Logo className="mb-8" />
        
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-white/5">
            <p className="px-4 text-xs text-white/30 uppercase tracking-wider mb-3">Coming Soon</p>
            {futureNavItems.map((item) => (
              <div
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/30 cursor-not-allowed"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
            ))}
          </div>
        </nav>

        <GlassButton onClick={handleLogout} className="flex items-center justify-center gap-2 mt-4">
          <LogOut className="w-4 h-4" />
          Logout
        </GlassButton>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold mb-1">
                {activeTab === "overview" && "Dashboard"}
                {activeTab === "credentials" && "Provider API Keys"}
                {activeTab === "test" && "Test Request"}
              </h1>
              <p className="text-white/50 text-sm">
                {activeTab === "overview" && "Monitor your AI Gateway status"}
                {activeTab === "credentials" && "Manage your AI provider credentials"}
                {activeTab === "test" && "Send a test request to the gateway"}
              </p>
            </div>
            <GlassButton
              onClick={() => refetch()}
              disabled={isRefetching}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
              Refresh
            </GlassButton>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Status cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/5">
                      <Server className="w-6 h-6 text-white/80" />
                    </div>
                    {isLoading ? (
                      <Skeleton className="w-16 h-6 bg-white/10" />
                    ) : (
                      <StatusBadge 
                        status={health?.status === "ok" ? "ok" : error ? "error" : "loading"} 
                        label={health?.status === "ok" ? "Online" : error ? "Offline" : "Checking"}
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-medium mb-1">Gateway</h3>
                  <p className="text-white/40 text-sm">localhost:8080</p>
                </GlassCard>

                <GlassCard>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/5">
                      <Database className="w-6 h-6 text-white/80" />
                    </div>
                    {isLoading ? (
                      <Skeleton className="w-16 h-6 bg-white/10" />
                    ) : (
                      <StatusBadge 
                        status={health?.db === "ok" ? "ok" : "error"} 
                        label={health?.db === "ok" ? "Connected" : "Error"}
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-medium mb-1">PostgreSQL</h3>
                  <p className="text-white/40 text-sm">Database</p>
                </GlassCard>

                <GlassCard>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/5">
                      <Zap className="w-6 h-6 text-white/80" />
                    </div>
                    {isLoading ? (
                      <Skeleton className="w-16 h-6 bg-white/10" />
                    ) : (
                      <StatusBadge 
                        status={health?.redis === "ok" ? "ok" : "error"} 
                        label={health?.redis === "ok" ? "Connected" : "Error"}
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-medium mb-1">Redis</h3>
                  <p className="text-white/40 text-sm">Cache & Rate Limits</p>
                </GlassCard>
              </div>

              {/* Quick stats */}
              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Configured Providers</h3>
                <div className="flex flex-wrap gap-2">
                  {credentialsData?.credentials.length ? (
                    credentialsData.credentials.map((cred) => (
                      <span
                        key={cred.id}
                        className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm border border-emerald-500/30"
                      >
                        {cred.provider}
                      </span>
                    ))
                  ) : (
                    <p className="text-white/40 text-sm">No providers configured. Add API keys to start making requests.</p>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Credentials Tab */}
          {activeTab === "credentials" && (
            <div className="space-y-6">
              {/* Add new credential */}
              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Add Provider API Key</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    className="px-4 py-3 rounded-xl glass-input text-white bg-transparent"
                  >
                    <option value="" className="bg-black">Select Provider</option>
                    {PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id} className="bg-black">
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <GlassInput
                    type="password"
                    placeholder={PROVIDERS.find(p => p.id === newProvider)?.placeholder || "API Key"}
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                  />
                  <GlassButton
                    variant="primary"
                    onClick={handleAddCredential}
                    className="flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Key
                  </GlassButton>
                </div>
              </GlassCard>

              {/* Existing credentials */}
              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Your API Keys</h3>
                {credentialsData?.credentials.length ? (
                  <div className="space-y-3">
                    {credentialsData.credentials.map((cred) => (
                      <div
                        key={cred.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-white/5">
                            <Key className="w-5 h-5 text-white/60" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{cred.provider}</p>
                            <p className="text-sm text-white/40">
                              Added {new Date(cred.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <GlassButton
                          onClick={() => handleDeleteCredential(cred.id, cred.provider)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </GlassButton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-center py-8">
                    No API keys configured yet. Add your first provider above.
                  </p>
                )}
              </GlassCard>
            </div>
          )}

          {/* Test Request Tab */}
          {activeTab === "test" && (
            <div className="space-y-6">
              <GlassCard>
                <h3 className="text-lg font-medium mb-4">Send Test Request</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                      value={testModel}
                      onChange={(e) => setTestModel(e.target.value)}
                      className="px-4 py-3 rounded-xl glass-input text-white bg-transparent"
                    >
                      <optgroup label="OpenAI" className="bg-black">
                        <option value="gpt-4o" className="bg-black">gpt-4o</option>
                        <option value="gpt-4o-mini" className="bg-black">gpt-4o-mini</option>
                        <option value="gpt-3.5-turbo" className="bg-black">gpt-3.5-turbo</option>
                      </optgroup>
                      <optgroup label="Anthropic" className="bg-black">
                        <option value="claude-3-opus-20240229" className="bg-black">claude-3-opus</option>
                        <option value="claude-3-sonnet-20240229" className="bg-black">claude-3-sonnet</option>
                        <option value="claude-3-haiku-20240307" className="bg-black">claude-3-haiku</option>
                      </optgroup>
                      <optgroup label="Google" className="bg-black">
                        <option value="gemini-1.5-pro" className="bg-black">gemini-1.5-pro</option>
                        <option value="gemini-1.5-flash" className="bg-black">gemini-1.5-flash</option>
                      </optgroup>
                    </select>
                    <div className="md:col-span-2">
                      <GlassInput
                        placeholder="Enter your prompt..."
                        value={testPrompt}
                        onChange={(e) => setTestPrompt(e.target.value)}
                      />
                    </div>
                    <GlassButton
                      variant="primary"
                      onClick={handleTestRequest}
                      loading={testLoading}
                      className="flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>

              {/* Response */}
              {testResponse && (
                <GlassCard>
                  <h3 className="text-lg font-medium mb-4">Response</h3>
                  
                  {/* Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-xs text-white/40 mb-1">Status</p>
                      <p className={`font-medium ${testResponse.status === 200 ? "text-emerald-400" : testResponse.status === 429 ? "text-amber-400" : "text-red-400"}`}>
                        {testResponse.status === 200 ? "Success" : testResponse.status === 429 ? "Rate Limited" : `Error ${testResponse.status}`}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-xs text-white/40 mb-1">Provider</p>
                      <p className="font-medium capitalize">{testResponse.provider || "—"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-xs text-white/40 mb-1">Latency</p>
                      <p className="font-medium">{testResponse.latency ? `${testResponse.latency}ms` : "—"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-xs text-white/40 mb-1">Fallback Used</p>
                      <p className={`font-medium ${testResponse.fallback ? "text-amber-400" : "text-white/60"}`}>
                        {testResponse.fallback ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  {/* Request ID */}
                  {testResponse.requestId && (
                    <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-xs text-white/40 mb-1">Request ID (logged to Postgres)</p>
                      <p className="font-mono text-sm">{testResponse.requestId}</p>
                    </div>
                  )}

                  {/* Response content */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-xs text-white/40 mb-2">Response Body</p>
                    <pre className="text-sm text-white/80 overflow-auto max-h-64 whitespace-pre-wrap">
                      {testResponse.data?.choices?.[0]?.message?.content || 
                       testResponse.data?.message || 
                       testResponse.error ||
                       JSON.stringify(testResponse.data, null, 2)}
                    </pre>
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
