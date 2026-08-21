import { useState, useEffect } from 'react'
import { adminApi } from '../../api/endpoints'
import { IconUsers, IconRefresh, IconSearch, IconShield, IconAlertTriangle } from '../../components/Icons'

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [search, setSearch] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  const fetchUsuarios = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.getUsuarios()
      setUsuarios(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleToggleUsuario = async (id) => {
    setActionLoadingId(`toggle-${id}`)
    setActionError('')
    setActionSuccess('')
    try {
      const updated = await adminApi.toggleUsuario(id)
      setActionSuccess(`Estado de cuenta de #${id} (${updated.name}) actualizado a: ${updated.enabled ? 'HABILITADO' : 'DESHABILITADO'}`)
      fetchUsuarios()
    } catch (err) {
      setActionError(err.message || 'Error al cambiar estado del usuario')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleApproveTransportista = async (id, approved) => {
    setActionLoadingId(`approve-${id}`)
    setActionError('')
    setActionSuccess('')
    try {
      await adminApi.approveTransportista(id, approved)
      setActionSuccess(`Transportista #${id} ${approved ? 'APROBADO' : 'DESAPROBADO'} exitosamente.`)
      fetchUsuarios()
    } catch (err) {
      setActionError(err.message || 'Error al cambiar aprobación del transportista')
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredUsuarios = usuarios.filter((u) => {
    const matchesRole = !filterRole || u.role === filterRole
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchesRole && matchesSearch
  })

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconUsers size={28} color="var(--color-primary)" />
              <span>Gestión de Usuarios y Aprobaciones</span>
            </h1>
            <p className="subtitle">
              Administra todas las cuentas de la plataforma, activa o suspende accesos y autoriza transportistas.
            </p>
          </div>
          <button onClick={fetchUsuarios} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
            <IconRefresh size={15} />
            <span>Actualizar Lista</span>
          </button>
        </div>
      </div>

      {/* Toolbar / Card de Filtros Rediseñada */}
      <div className="card" style={{ padding: '22px 28px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, flex: '2', minWidth: '280px' }}>
            <label htmlFor="search-user" style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '8px' }}>
              Buscar Usuario:
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '14px', color: 'var(--color-muted)', pointerEvents: 'none' }}>
                <IconSearch size={18} />
              </span>
              <input
                id="search-user"
                type="text"
                placeholder="Nombre o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '42px', height: '44px', width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0, flex: '1', minWidth: '220px' }}>
            <label htmlFor="role-filter" style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '8px' }}>
              Filtrar por Rol:
            </label>
            <select
              id="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input-field"
              style={{ height: '44px', width: '100%' }}
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">Administrador</option>
              <option value="PRODUCTOR">Productor</option>
              <option value="TIENDA">Tienda</option>
              <option value="TRANSPORTISTA">Transportista</option>
            </select>
          </div>
        </div>
      </div>

      {actionError && <div className="error-box">{actionError}</div>}
      {actionSuccess && <div className="success-box">{actionSuccess}</div>}

      {loading && <div className="card loading-state">Cargando directorio de usuarios...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="card table-card">
          <div className="table-header">
            <h3>Usuarios Registrados ({filteredUsuarios.length})</h3>
          </div>

          {filteredUsuarios.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron usuarios con los filtros aplicados.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th># ID</th>
                    <th>Nombre / Email</th>
                    <th>Rol</th>
                    <th>Teléfono</th>
                    <th>Estado Cuenta</th>
                    <th>Aprobación Admin</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map((u) => (
                    <tr key={u.id}>
                      <td className="font-bold">#{u.id}</td>
                      <td>
                        <strong>{u.name}</strong>
                        <div className="muted-text" style={{ fontSize: '0.85rem' }}>{u.email}</div>
                      </td>
                      <td>
                        <span className={`role-badge role-${u.role.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.phone || <span className="muted-text">N/A</span>}</td>
                      <td>
                        <span className={`status-pill ${u.enabled ? 'status-aceptado' : 'status-cancelado'}`}>
                          {u.enabled ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                      </td>
                      <td>
                        {u.role === 'TRANSPORTISTA' ? (
                          <span style={{ fontWeight: '700', color: u.approved ? '#2e7d32' : '#f57f17' }}>
                            {u.approved ? 'Aprobado' : 'Pendiente'}
                          </span>
                        ) : (
                          <span className="muted-text">-</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleUsuario(u.id)}
                            disabled={actionLoadingId === `toggle-${u.id}`}
                            className={`btn btn-sm ${u.enabled ? 'btn-outline-danger' : 'btn-secondary'}`}
                            style={{ width: '100%' }}
                          >
                            {u.enabled ? 'Deshabilitar' : 'Habilitar'}
                          </button>

                          {u.role === 'TRANSPORTISTA' && (
                            <button
                              type="button"
                              onClick={() => handleApproveTransportista(u.id, !u.approved)}
                              disabled={actionLoadingId === `approve-${u.id}`}
                              className={`btn btn-sm ${u.approved ? 'btn-secondary' : 'btn-primary'}`}
                              style={{ width: '100%' }}
                            >
                              {u.approved ? 'Revocar Aprobación' : 'Aprobar Transportista'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
