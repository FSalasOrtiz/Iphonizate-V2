import React, { useState } from "react";
import { User, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(usuario, pin);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      setPin("");
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <div className="brand">
          <div className="brand-badge">i</div>
          <div className="brand-name">
            iPhonizate <span>OS</span>
          </div>
        </div>

        <h1 className="login-title">Ingresar</h1>
        <p className="login-sub">Usa tu usuario y tu PIN de 6 dígitos.</p>

        <label className="field">
          <span className="field-label">USUARIO</span>
          <div className="icon-input">
            <User size={16} />
            <input
              className="icon-input-field"
              placeholder="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </div>
        </label>

        <label className="field">
          <span className="field-label">PIN</span>
          <div className="icon-input">
            <KeyRound size={16} />
            <input
              className="icon-input-field"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              autoComplete="current-password"
            />
          </div>
        </label>

        {error && <div className="login-error">{error}</div>}

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>

        <div className="login-footnote">Tras 5 intentos fallidos la cuenta se bloquea por 15 minutos.</div>
      </form>
    </div>
  );
}
