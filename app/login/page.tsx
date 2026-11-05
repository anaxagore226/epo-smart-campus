import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "Connexion · EPO Smart Campus" };

const inputClass =
  "mt-2 w-full rounded-xl border border-line-strong bg-[#fafcfb] px-4 py-3 text-sm font-normal text-ink outline-none focus:border-[#6e9c84]";

// Écran absent du design Figma : composé avec les mêmes éléments visuels.
// L'authentification JWT sera branchée sur l'API Rust (backend/src/routes/auth.rs).
export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas p-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-lime text-forest-950">
            <Icon name="leaf" size={22} />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">EPO Smart</p>
            <p className="text-xs text-muted">Campus intelligent</p>
          </div>
        </div>

        <form action="/dashboard" className="panel space-y-4 p-6 shadow-soft">
          <div>
            <h1 className="text-xl font-bold">Connexion</h1>
            <p className="mt-1 text-xs text-subtle">Accédez à l’espace de gestion du campus.</p>
          </div>
          <label className="block text-xs font-semibold text-[#5f6b64]">
            Adresse e-mail
            <input type="email" name="email" autoComplete="email" placeholder="prenom.nom@epo.bf" className={inputClass} />
          </label>
          <label className="block text-xs font-semibold text-[#5f6b64]">
            Mot de passe
            <input type="password" name="password" autoComplete="current-password" className={inputClass} />
          </label>
          <button type="submit" className="flex w-full items-center justify-between rounded-xl bg-forest-800 px-4 py-3.5 text-sm font-bold text-white">
            Se connecter <Icon name="chevron" size={17} />
          </button>
          <p className="text-center text-[10px] text-[#a0a8a3]">
            Mode démonstration : <Link href="/dashboard" className="font-semibold text-brand">accéder directement</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
