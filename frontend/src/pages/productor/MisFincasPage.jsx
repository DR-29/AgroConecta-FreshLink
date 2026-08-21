import { useState, useEffect } from 'react'
import { productorApi } from '../../api/endpoints'
import { IconHome, IconRefresh, IconMapPin } from '../../components/Icons'

export default function MisFincasPage() {
  const [fincas, setFincas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal para registrar finca
  const [showModal, setShowModal] = useState(false)
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [latitud, setLatitud] = useState('')
  const [longitud, setLongitud] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  // Modal para editar finca
  const [editingFinca, setEditingFinca] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editDireccion, setEditDireccion] = useState('')
  const [editLatitud, setEditLatitud] = useState('')
  const [editLongitud, setEditLongitud] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  // Eliminación
  const [deleteLoadingId, setDeleteLoadingId] = useState(null)

  const fetchFincas = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await productorApi.getFincas()
      setFincas(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar las fincas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFincas()
  }, [])

  const handleOpenModal = () => {
    setNombre('')
    setDireccion('')
    setLatitud('')
    setLongitud('')
    setCreateError('')
    setCreateSuccess('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleCreateFinca = async (e) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError('')
    setCreateSuccess('')

    try {
      const payload = {
        nombre: nombre.trim(),
        direccion: direccion.trim() || undefined,
        latitud: latitud !== '' ? parseFloat(latitud) : undefined,
        longitud: longitud !== '' ? parseFloat(longitud) : undefined,
      }

      await productorApi.createFinca(payload)
      setCreateSuccess('¡Finca registrada exitosamente!')
      fetchFincas()
      setTimeout(() => {
        handleCloseModal()
      }, 1200)
    } catch (err) {
      setCreateError(err.message || 'Error al crear la finca')
    } finally {
      setCreateLoading(false)
    }
  }

  // Editar Finca
  const handleOpenEditModal = (finca) => {
    setEditingFinca(finca)
    setEditNombre(finca.nombre)
    setEditDireccion(finca.direccion || '')
    setEditLatitud(finca.latitud !== undefined && finca.latitud !== null ? finca.latitud : '')
    setEditLongitud(finca.longitud !== undefined && finca.longitud !== null ? finca.longitud : '')
    setEditError('')
    setEditSuccess('')
  }

  const handleCloseEditModal = () => {
    setEditingFinca(null)
  }

  const handleUpdateFinca = async (e) => {
    e.preventDefault()
    if (!editingFinca) return

    setEditLoading(true)
    setEditError('')
    setEditSuccess('')

    try {
      const payload = {
        nombre: editNombre.trim(),
        direccion: editDireccion.trim() || undefined,
        latitud: editLatitud !== '' ? parseFloat(editLatitud) : undefined,
        longitud: editLongitud !== '' ? parseFloat(editLongitud) : undefined,
      }

      await productorApi.updateFinca(editingFinca.id, payload)
      setEditSuccess('¡Finca actualizada exitosamente!')
      fetchFincas()
      setTimeout(() => {
        handleCloseEditModal()
      }, 1200)
    } catch (err) {
      setEditError(err.message || 'Error al actualizar la finca')
    } finally {
      setEditLoading(false)
    }
  }

  // Eliminar Finca
  const handleDeleteFinca = async (fincaId, fincaNombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la finca "${fincaNombre}"?`)) return

    setDeleteLoadingId(fincaId)
    try {
      await productorApi.deleteFinca(fincaId)
      fetchFincas()
    } catch (err) {
      alert(err.message || 'Error al eliminar la finca')
    } finally {
      setDeleteLoadingId(null)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconHome size={28} color="var(--color-primary)" />
              <span>Mis Fincas y Predios</span>
            </h1>
            <p className="subtitle">Registra, edita o administra tus predios agrícolas y lugares de cultivo.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchFincas} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
              <IconRefresh size={15} />
              <span>Actualizar</span>
            </button>
            <button onClick={handleOpenModal} className="btn btn-primary">
              + Registrar Nueva Finca
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="card loading-state">Cargando fincas...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="dashboard-grid">
          {fincas.length === 0 ? (
            <div className="card empty-state" style={{ gridColumn: '1 / -1' }}>
              <p>No tienes ninguna finca registrada aún. Haz clic en <strong>"+ Registrar Nueva Finca"</strong> para añadir tu primera finca.</p>
            </div>
          ) : (
            fincas.map((finca) => (
              <div key={finca.id} className="card">
                <div className="card-header">
                  <h3>{finca.nombre}</h3>
                  <span className="card-tag">Finca #{finca.id}</span>
                </div>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconMapPin size={16} color="var(--color-primary)" />
                  <strong>Ubicación:</strong> {finca.direccion || 'Sin dirección registrada'}
                </p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.86rem', color: 'var(--color-muted)' }}>
                  <div><strong>Lat:</strong> {finca.latitud ?? 'N/A'}</div>
                  <div><strong>Lng:</strong> {finca.longitud ?? 'N/A'}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(finca)}
                    className="btn btn-sm btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFinca(finca.id, finca.nombre)}
                    disabled={deleteLoadingId === finca.id}
                    className="btn btn-sm btn-outline-danger"
                    style={{ flex: 1 }}
                  >
                    {deleteLoadingId === finca.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Registrar Finca */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconHome size={22} color="var(--color-primary)" />
                <span>Registrar Nueva Finca</span>
              </h2>
              <button type="button" className="btn-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <form onSubmit={handleCreateFinca} className="standard-form">
              <div className="form-group">
                <label htmlFor="finca-nombre">Nombre de la Finca: *</label>
                <input
                  id="finca-nombre"
                  type="text"
                  placeholder="Ej: Finca Los Naranjos"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="finca-direccion">Dirección o Vereda: *</label>
                <input
                  id="finca-direccion"
                  type="text"
                  placeholder="Ej: Vereda La Esmeralda, Km 4"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="finca-lat">Latitud (Opcional):</label>
                  <input
                    id="finca-lat"
                    type="number"
                    step="any"
                    placeholder="Ej: 10.7899"
                    value={latitud}
                    onChange={(e) => setLatitud(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="finca-lng">Longitud (Opcional):</label>
                  <input
                    id="finca-lng"
                    type="number"
                    step="any"
                    placeholder="Ej: -74.7500"
                    value={longitud}
                    onChange={(e) => setLongitud(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                  />
                </div>
              </div>

              {createError && <div className="error-box">{createError}</div>}
              {createSuccess && <div className="success-box">{createSuccess}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={createLoading} className="btn btn-primary">
                  {createLoading ? 'Guardando...' : 'Guardar Finca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Finca */}
      {editingFinca && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconHome size={22} color="var(--color-primary)" />
                <span>Editar Finca: {editingFinca.nombre}</span>
              </h2>
              <button type="button" className="btn-close" onClick={handleCloseEditModal}>&times;</button>
            </div>

            <form onSubmit={handleUpdateFinca} className="standard-form">
              <div className="form-group">
                <label htmlFor="edit-finca-nombre">Nombre de la Finca: *</label>
                <input
                  id="edit-finca-nombre"
                  type="text"
                  placeholder="Ej: Finca Los Naranjos"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-finca-direccion">Dirección o Vereda: *</label>
                <input
                  id="edit-finca-direccion"
                  type="text"
                  placeholder="Ej: Vereda La Esmeralda, Km 4"
                  value={editDireccion}
                  onChange={(e) => setEditDireccion(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="edit-finca-lat">Latitud (Opcional):</label>
                  <input
                    id="edit-finca-lat"
                    type="number"
                    step="any"
                    placeholder="Ej: 10.7899"
                    value={editLatitud}
                    onChange={(e) => setEditLatitud(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-finca-lng">Longitud (Opcional):</label>
                  <input
                    id="edit-finca-lng"
                    type="number"
                    step="any"
                    placeholder="Ej: -74.7500"
                    value={editLongitud}
                    onChange={(e) => setEditLongitud(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                  />
                </div>
              </div>

              {editError && <div className="error-box">{editError}</div>}
              {editSuccess && <div className="success-box">{editSuccess}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseEditModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={editLoading} className="btn btn-primary">
                  {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
