import {
  CheckCircle,
  Clock,
  ExternalLink,
  Mail,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SerenaLogo from "../../public/icons/icon.svg";
import { supabase } from "../lib/supabaseClient";

export default function EmailVerification() {
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const emailParam = urlParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }

    const checkVerificationStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setIsVerified(true);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    checkVerificationStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
        setIsVerified(true);
        toast.success("Email verificado com sucesso!");
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, [location.search, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !email) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        throw error;
      }

      toast.success("Email de verificação reenviado!");
      setResendCooldown(60);
    } catch (error) {
      console.error("Erro ao reenviar email:", error);
      toast.error("Erro ao reenviar email. Tente novamente.");
    } finally {
      setIsResending(false);
    }
  };

  const openEmailProvider = (provider: "gmail" | "outlook") => {
    let url = "";

    if (provider === "gmail") {
      url = "https://mail.google.com";
    } else if (provider === "outlook") {
      url = "https://outlook.live.com";
    }

    window.open(url, "_blank");
  };

  const getEmailProvider = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain?.includes("gmail")) return "gmail";
    if (
      domain?.includes("outlook") ||
      domain?.includes("hotmail") ||
      domain?.includes("live")
    )
      return "outlook";
    return null;
  };

  const detectedProvider = email ? getEmailProvider(email) : null;

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="shadow-lg">
                <img src={SerenaLogo} alt="Serena" className="h-16 w-16" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-green-500 bg-clip-text text-transparent">
              Serena
            </h1>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email verificado!
              </h2>
              <p className="text-gray-600">
                Sua conta foi ativada com sucesso. Você será redirecionado em
                alguns segundos...
              </p>
            </div>

            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="shadow-lg">
              <img src={SerenaLogo} alt="Serena" className="h-16 w-16" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-pink-500 bg-clip-text text-transparent">
            Serena
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-6">
            <Mail className="h-16 w-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifique seu email
            </h2>
            <p className="text-gray-600">
              Enviamos um link de verificação para:
            </p>
            <p className="text-pink-600 font-medium mt-1">{email}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Próximos passos:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Abra seu email</li>
                    <li>Clique no link de verificação</li>
                    <li>Volte aqui para continuar</li>
                  </ol>
                </div>
              </div>
            </div>

            {detectedProvider && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Abrir seu provedor de email:
                </p>
                <div className="flex gap-2">
                  {detectedProvider === "gmail" && (
                    <button
                      onClick={() => openEmailProvider("gmail")}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Gmail
                    </button>
                  )}
                  {detectedProvider === "outlook" && (
                    <button
                      onClick={() => openEmailProvider("outlook")}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Outlook
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-3">
                Ou abrir manualmente:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openEmailProvider("gmail")}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Gmail
                </button>
                <button
                  onClick={() => openEmailProvider("outlook")}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Outlook
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-pink-300 text-pink-600 rounded-xl hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isResending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                  Reenviando...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className="h-4 w-4" />
                  Reenviar em {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Reenviar email
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não recebeu o email? Verifique sua caixa de spam ou{" "}
                <button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCooldown > 0}
                  className="text-pink-600 hover:text-pink-500 font-medium disabled:opacity-50"
                >
                  reenvie aqui
                </button>
              </p>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Problemas com a verificação?{" "}
                <Link
                  to="/register"
                  className="text-pink-600 hover:text-pink-500 font-medium"
                >
                  Voltar ao cadastro
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
