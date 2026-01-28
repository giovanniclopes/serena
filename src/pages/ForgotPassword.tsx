import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import SerenaLogo from "../../public/icons/icon.svg";
import PageTitle from "../components/PageTitle";
import { useAuth } from "../context/AuthContext";
import { useWorkspaceColor } from "../hooks/useWorkspaceColor";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { resetPassword, loading } = useAuth();
  const workspaceColor = useWorkspaceColor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email é obrigatório");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Email inválido");
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      console.log("💥 Erro ao solicitar recuperação de senha:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao solicitar recuperação"
      );
    }
  };

  return (
    <>
      <PageTitle />
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
            <p className="text-gray-700 mt-2">Recuperação de acesso</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            {!success ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Esqueceu sua senha?
                  </h2>
                  <p className="text-gray-700">
                    Insira seu e-mail abaixo para receber as instruções de
                    recuperação.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        style={
                          {
                            "--tw-ring-color": workspaceColor
                          } as React.CSSProperties
                        }
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    style={
                      {
                        backgroundColor: workspaceColor,
                        "--tw-ring-color": workspaceColor
                      } as React.CSSProperties
                    }
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      "Enviar instruções"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${workspaceColor}20` }}
                  >
                    <Mail
                      className="h-6 w-6"
                      style={{ color: workspaceColor }}
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  E-mail enviado!
                </h2>
                <p className="text-gray-700 mb-6">
                  Verifique sua caixa de entrada (e a pasta de spam) para as
                  instruções de redefinição de senha.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium transition-colors duration-200"
                  style={{ color: workspaceColor }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para o login
                </Link>
              </div>
            )}

            {!success && (
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium transition-colors duration-200"
                  style={{ color: workspaceColor }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para o login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
