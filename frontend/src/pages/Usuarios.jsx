import React, { useEffect, useState } from "react";
import { Plus, Unlock, Trash2, KeyRound } from "lucide-react";
import { Card, Empty, Badge } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../lib/constants";
import { fmtDateShort } from "../lib/helpers";
import { listUsers, createUser, updateUser, deleteUser } from "../lib/localAuth.js";

export default function Usuarios() {
  const { session } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ usuario: "", pin: "", nombre: "", rol: ROLES[0] });
  const [editingPin, setEditingPin] = useState(null);
  const [newPin, setNewPin] = useState("");

  const isAdmin = session?.rol === "Admin";

  const load = () => setUsers(listUsers());

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAdmin) {
    return (
      <>
        <h1 className="h1">Usuarios</h1>
        <div className="h1-sub">Gestiona quién puede entrar al sistema y con qué rol.</div>
        <Card>
          <Empty title="No tienes permiso para ver esta sección." subtitle="Solo las cuentas con rol Admin pueden administrar usuarios." />
        </Card>
      </>
    );
  }

  const crear = async () => {
    setError("");
    const res = await createUser(form);
    if (!res.ok) return setError(res.error);
    setForm({ usuario: "", pin: "", nombre: "", rol: ROLES[0] });
    setShowForm(false);
    load();
  };

  const cambiarRol = async (id, rol) => {
    setError("");
    const res = await updateUser(id, { rol });
    if (!res.ok) return setError(res.error);
    load();
  };

  const desbloquear = async (id) => {
    setError("");
    const res = await updateUser(id, { unlock: true });
    if (!res.ok) return setError(res.error);
    load();
  };

  const resetPin = async (id) => {
    setError("");
    if (!/^\d{6}$/.test(newPin)) {
      setError("El nuevo PIN debe tener exactamente 6 dígitos.");
      return;
    }
    const res = await updateUser(id, { pin: newPin });
    if (!res.ok) return setError(res.error);
    setEditingPin(null);
    setNewPin("");
    load();
  };

  const eliminar = (id, nombre) => {
    setError("");
    if (!window.confirm(`¿Eliminar a ${nombre}? No va a poder volver a iniciar sesión.`)) return;
    const res = deleteUser(id, session?.id);
    if (!res.ok) return setError(res.error);
    load();
  };

  return (
    <>
      <h1 className="h1">Usuarios</h1>
      <div className="h1-sub">Gestiona quién puede entrar al sistema y con qué rol.</div>
      <Card right={<button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}><Plus size={14} /> Nuevo usuario</button>}>
        {error && <div className="login-error" style={{ marginBottom: 10 }}>{error}</div>}

        {showForm && (
          <div className="inline-form-grid">
            <input className="input" placeholder="usuario (para iniciar sesión)" value={form.usuario} onChange={(e) => setForm((f) => ({ ...f, usuario: e.target.value }))} />
            <input className="input" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
            <input className="input" placeholder="PIN de 6 dígitos" maxLength={6} value={form.pin} onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))} />
            <select className="select" value={form.rol} onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button className="btn btn-primary" onClick={crear}>Crear usuario</button>
          </div>
        )}

        {!users ? (
          <div className="empty-inline">Cargando…</div>
        ) : users.length === 0 ? (
          <Empty title="No hay usuarios todavía." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Creado</th><th></th></tr></thead>
              <tbody>
                {users.map((u) => {
                  const locked = u.lockedUntil && new Date(u.lockedUntil) > new Date();
                  return (
                    <tr key={u.id}>
                      <td>{u.usuario}</td>
                      <td>{u.nombre}</td>
                      <td>
                        <select className="select-inline" value={u.rol} onChange={(e) => cambiarRol(u.id, e.target.value)}>
                          {ROLES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </td>
                      <td>{locked ? <Badge tone="red">Bloqueado</Badge> : <Badge tone="green">Activo</Badge>}</td>
                      <td>{fmtDateShort(u.createdAt)}</td>
                      <td className="row-actions">
                        {locked && (
                          <button className="btn btn-secondary" onClick={() => desbloquear(u.id)}>
                            <Unlock size={14} /> Desbloquear
                          </button>
                        )}
                        {editingPin === u.id ? (
                          <div className="inline-form">
                            <input className="input" placeholder="Nuevo PIN" maxLength={6} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} />
                            <button className="btn btn-primary" onClick={() => resetPin(u.id)}>Guardar</button>
                            <button className="btn btn-ghost" onClick={() => { setEditingPin(null); setNewPin(""); }}>Cancelar</button>
                          </div>
                        ) : (
                          <button className="btn-icon" title="Restablecer PIN" onClick={() => { setEditingPin(u.id); setNewPin(""); }}>
                            <KeyRound size={14} />
                          </button>
                        )}
                        <button className="btn-icon" title="Eliminar" onClick={() => eliminar(u.id, u.nombre)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
