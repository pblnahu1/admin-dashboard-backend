import { Lock, Mail, AlertCircle, ShieldCheck, Database, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useLoginForm } from './useLoginForm';
import { useTranslation } from '../../hooks/useTranslation';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const LoginForm = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
    handleAutofill
  } = useLoginForm();
  
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 bg-slate-50 overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-100/40 to-purple-100/40 blur-3xl" />
        <div className="absolute bottom-[0%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-sky-100/40 to-blue-50/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row bg-white/80 backdrop-blur-xl border border-white/50 ring-1 ring-slate-900/5">
        
        {/* Left Panel: Hero & Info */}
        <div className="relative w-full md:w-5/12 lg:w-1/2 p-8 md:p-12 text-white flex flex-col justify-between overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-slate-900">
            {/* Dark mode background elements */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-screen blur-[100px] animate-blob"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/30 rounded-full mix-blend-screen blur-[100px] animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-indigo-300" />
              </div>
              <span className="text-xl font-bold tracking-tight">{t.auth.login.appName}</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
                {t.auth.login.titlePrimary}<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-sky-300">{t.auth.login.titleHighlight}</span>{t.auth.login.titleSecondary}
              </h1>
              <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-md font-light">
                {t.auth.login.subtitle}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-12 space-y-5 hidden md:block">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-4 ring-1 ring-white/10 transition-transform hover:-translate-y-1 duration-300">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-medium text-white">{t.auth.login.feature1Title}</h3>
                <p className="text-sm text-slate-400">{t.auth.login.feature1Desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-4 ring-1 ring-white/10 transition-transform hover:-translate-y-1 duration-300">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5 text-sky-300" />
              </div>
              <div>
                <h3 className="font-medium text-white">{t.auth.login.feature2Title}</h3>
                <p className="text-sm text-slate-400">{t.auth.login.feature2Desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="w-full md:w-7/12 lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/60">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{t.auth.login.formTitle}</h2>
              <p className="text-slate-500">{t.auth.login.formSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/50 p-4 text-red-800 animate-in slide-in-from-top-2 fade-in duration-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-5">
                <Input
                  label={t.auth.login.emailLabel}
                  id="email"
                  type="email"
                  icon={<Mail />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.login.emailPlaceholder}
                  required
                />

                <Input
                  label={t.auth.login.passwordLabel}
                  id="password"
                  type="password"
                  icon={<Lock />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.login.passwordPlaceholder}
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  isLoading={loading}
                  loadingText={t.auth.login.loadingBtn}
                  rightIcon={<ArrowRight />}
                >
                  {t.auth.login.submitBtn}
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-2">
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                <p className="text-xs font-medium text-indigo-900/60 uppercase tracking-wider mb-2">{t.auth.login.testCredsTitle}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-600">Email:</div>
                  <div className="font-medium text-slate-900">admin@gmail.com</div>
                  <div className="text-slate-600">Password:</div>
                  <div className="font-medium text-slate-900">12345678</div>
                </div>
                <button 
                  type="button"
                  onClick={handleAutofill}
                  className="mt-3 w-full py-2 text-xs font-semibold text-indigo-600 bg-indigo-100/50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  {t.auth.login.autofillBtn}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
