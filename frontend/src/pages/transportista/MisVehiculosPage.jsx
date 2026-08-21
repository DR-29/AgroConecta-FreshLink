import { useState, useEffect } from 'react'
import { transportistaApi } from '../../api/endpoints'
import { IconTruck, IconRefresh } from '../../components/Icons'

export default function MisVehiculosPage() {
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal Registrar Vehículo
  const [showModal, setShowModal] = useState(false)
  const [tipo, setTipo] = useState('Camión')
  const [placa, setPlaca] = useState('')
  const [capacidadCarga, setCapacidadCarga] = useState('')
  const [refrigerado, setRefrigerado] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  const fetchVehiculos = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await transportistaApi.getVehiculos()
      setVehiculos(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar los vehículos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehiculos()
  }, [])

  const handleOpenModal = () => {
    setTipo('Camión')
    setPlaca('')
    setCapacidadCarga('')
    setRefrigerado(false)
    setCreateError('')
    setCreateSuccess('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleCreateVehiculo = async (e) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError('')
    setCreateSuccess('')

    try {
      const payload = {
        tipo: tipo.trim(),
        placa: placa.trim().toUpperCase(),
        capacidadCarga: parseFloat(capacidadCarga) || 0.0,
        refrigerado,
      }

      await transportistaApi.createVehiculo(payload)
      setCreateSuccess('¡Vehículo registrado exitosamente!')
      fetchVehiculos()
      setTimeout(() => {
        handleCloseModal()
      }, 1200)
    } catch (err) {
      setCreateError(err.message || 'Error al registrar vehículo')
    } finally {
      setCreateLoading(false)
    }
  }

  const tiposVehiculo = ['Camión', 'Camioneta', 'Furgón', 'Tractomula', 'Furgón Refrigerado', 'Motocarro']

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconTruck size={28} color="var(--color-primary)" />
              <span>Mis Vehículos y Flota</span>
            </h1>
            <p className="subtitle">Registra y administra tu flota de vehículos de carga autorizados.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchVehiculos} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
              <IconRefresh size={15} />
              <span>Actualizar</span>
            </button>
            <button onClick={handleOpenModal} className="btn btn-primary">
              + Registrar Vehículo
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="card loading-state">Cargando vehículos...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="dashboard-grid">
          {vehiculos.length === 0 ? (
            <div className="card empty-state" style={{ gridColumn: '1 / -1' }}>
              <p>No tienes vehículos registrados aún. Haz clic en <strong>"+ Registrar Vehículo"</strong> para inscribir tu primer vehículo de carga.</p>
            </div>
          ) : (
            vehiculos.map((v) => (
              <div key={v.id} className="card">
                <div className="card-header">
                  <h3>{v.tipo}</h3>
                  <span className="card-tag font-bold" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>
                    {v.placa}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span className="muted-text">Capacidad de carga:</span>
                    <strong>{v.capacidadCarga} Toneladas</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span className="muted-text">Sistema Refrigerado:</span>
                    <strong style={{ color: v.refrigerado ? '#2e7d32' : 'var(--color-muted)' }}>
                      {v.refrigerado ? 'Sí cuenta' : 'No'}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Registrar Vehículo */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 500px)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconTruck size={22} color="var(--color-primary)" />
                <span>Registrar Nuevo Vehículo</span>
              </h2>
              <button type="button" className="btn-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <form onSubmit={handleCreateVehiculo} className="standard-form">
              <div className="form-group">
                <label htmlFor="veh-tipo">Tipo de Vehículo: *</label>
                <select
                  id="veh-tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                >
                  {tiposVehiculo.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="veh-placa">Placa o Matrícula: *</label>
                <input
                  id="veh-placa"
                  type="text"
                  placeholder="Ej: ABC-123"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="veh-capacidad">Capacidad de Carga (Toneladas): *</label>
                <input
                  id="veh-capacidad"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Ej: 2.5"
                  value={capacidadCarga}
                  onChange={(e) => setCapacidadCarga(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    checked={refrigerado}
                    onChange={(e) => setRefrigerado(e.target.checked)}
                  />
                  <span>¿El vehículo cuenta con compartimiento refrigerado?</span>
                </label>
              </div>

              {createError && <div className="error-box">{createError}</div>}
              {createSuccess && <div className="success-box">{createSuccess}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={createLoading} className="btn btn-primary">
                  {createLoading ? 'Guardando...' : 'Guardar Vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
