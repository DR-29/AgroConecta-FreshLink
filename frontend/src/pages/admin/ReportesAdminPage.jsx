import { useState, useEffect } from 'react'
import { adminApi } from '../../api/endpoints'
import { IconChart, IconUsers, IconBox, IconStar, IconRefresh } from '../../components/Icons'

export default function ReportesAdminPage() {
  const [reporteUsuarios, setReporteUsuarios] = useState(null)
  const [reportePedidos, setReportePedidos] = useState(null)
  const [reporteCalificaciones, setReporteCalificaciones] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModalRatings, setShowModalRatings] = useState(false)

  const fetchReportes = async () => {
    setLoading(true)
    setError('')
    try {
      const [uData, pData, cData] = await Promise.all([
        adminApi.getReporteUsuarios(),
        adminApi.getReportePedidos(),
        adminApi.getReporteCalificaciones(),
      ])
      setReporteUsuarios(uData)
      setReportePedidos(pData)
      setReporteCalificaciones(cData)
    } catch (err) {
      setError(err.message || 'Error al cargar los reportes e indicadores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportes()
  }, [])

  const getTotalUsersCount = () => reporteUsuarios?.total || 1
  const getTotalOrdersCount = () => reportePedidos?.total || 1

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IconStar
          key={i}
          size={16}
          color={i <= rating ? '#f57f17' : '#cfd8dc'}
        />
      )
    }
    return <span style={{ display: 'inline-flex', gap: '2px' }}>{stars}</span>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconChart size={28} color="var(--color-accent)" />
              <span>Reportes e Indicadores de Gestión</span>
            </h1>
            <p className="subtitle">
              Métricas consolidadas de la plataforma: distribución de usuarios, flujo de pedidos y satisfacción.
            </p>
          </div>
          <button onClick={fetchReportes} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
            <IconRefresh size={15} />
            <span>Actualizar Métricas</span>
          </button>
        </div>
      </div>

      {loading && <div className="card loading-state">Calculando estadísticas y métricas...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tarjetas Superiores de Métricas Clave */}
          <div className="dashboard-grid">
            <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconUsers size={20} color="var(--color-primary)" />
                  <span>Total Usuarios</span>
                </h3>
                <span className="card-tag">Cuentas</span>
              </div>
              <div style={{ fontSize: '2.6rem', fontWeight: '800', color: 'var(--color-primary-dark)', fontFamily: 'Outfit, sans-serif' }}>
                {reporteUsuarios?.total ?? 0}
              </div>
              <p className="muted-text">Cuentas registradas en la plataforma.</p>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
              <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconBox size={20} color="var(--color-accent)" />
                  <span>Total Pedidos</span>
                </h3>
                <span className="card-tag">Órdenes</span>
              </div>
              <div style={{ fontSize: '2.6rem', fontWeight: '800', color: 'var(--color-accent-dark)', fontFamily: 'Outfit, sans-serif' }}>
                {reportePedidos?.total ?? 0}
              </div>
              <p className="muted-text">Órdenes generadas por tiendas.</p>
            </div>

            {/* Tarjeta de Satisfacción Interactiva */}
            <div
              className="card"
              onClick={() => setShowModalRatings(true)}
              style={{
                borderLeft: '4px solid var(--color-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Haz clic para ver la lista completa de reseñas"
            >
              <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconStar size={20} color="var(--color-secondary)" />
                  <span>Satisfacción</span>
                </h3>
                <span className="card-tag" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
                  Ver Reseñas
                </span>
              </div>
              <div style={{ fontSize: '2.6rem', fontWeight: '800', color: 'var(--color-secondary-dark)', fontFamily: 'Outfit, sans-serif' }}>
                {Number(reporteCalificaciones?.promedio ?? 0).toFixed(1)} / 5.0
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="muted-text" style={{ margin: 0 }}>
                  Basado en {reporteCalificaciones?.total ?? 0} calificaciones enviadas.
                </p>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                  Abrir detalles →
                </span>
              </div>
            </div>
          </div>

          {/* Desglose Visual con Barras de Progreso */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
            {/* Usuarios por Rol */}
            <div className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <h3>Distribución de Usuarios por Rol</h3>
              </div>
              {reporteUsuarios?.porRol ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
                  {Object.entries(reporteUsuarios.porRol).map(([role, count]) => {
                    const percentage = Math.round((count / getTotalUsersCount()) * 100)
                    return (
                      <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={`role-badge role-${role.toLowerCase()}`}>{role}</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div style={{ height: '8px', width: '100%', backgroundColor: '#eceff1', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${percentage}%`,
                              backgroundColor:
                                role === 'PRODUCTOR' ? 'var(--color-primary)' :
                                role === 'TIENDA' ? 'var(--color-secondary-dark)' :
                                role === 'TRANSPORTISTA' ? 'var(--color-accent)' : '#7b1fa2',
                              borderRadius: '4px',
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="muted-text">Sin datos de roles.</p>
              )}
            </div>

            {/* Pedidos por Estado */}
            <div className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <h3>Distribución de Pedidos por Estado</h3>
              </div>
              {reportePedidos?.porEstado ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
                  {Object.entries(reportePedidos.porEstado).map(([estado, count]) => {
                    const percentage = Math.round((count / getTotalOrdersCount()) * 100)
                    return (
                      <div key={estado} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="status-pill status-default">{estado}</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                            {count} órdenes ({percentage}%)
                          </span>
                        </div>
                        <div style={{ height: '8px', width: '100%', backgroundColor: '#eceff1', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${percentage}%`,
                              backgroundColor:
                                estado === 'ENTREGADO' ? '#2e7d32' :
                                estado === 'ACEPTADO' ? '#4caf50' :
                                estado === 'EN_TRANSPORTE' ? '#1976d2' :
                                estado === 'PENDIENTE' ? '#f57f17' : '#d32f2f',
                              borderRadius: '4px',
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="muted-text">Sin datos de pedidos.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Pop-up para Ver la Lista de Calificaciones y Reseñas */}
      {showModalRatings && (
        <div className="modal-overlay" onClick={() => setShowModalRatings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 640px)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconStar size={22} color="var(--color-secondary)" />
                <span>Reseñas y Calificaciones Recibidas</span>
              </h2>
              <button type="button" className="btn-close" onClick={() => setShowModalRatings(false)}>
                &times;
              </button>
            </div>

            {!reporteCalificaciones?.lista || reporteCalificaciones.lista.length === 0 ? (
              <div className="empty-state">
                <p>Aún no se han enviado calificaciones individuales de pedidos.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '6px' }}>
                {reporteCalificaciones.lista.map((cal) => {
                  const isProductor = Boolean(cal.productorId) || cal.tipoEvaluado === 'PRODUCTOR'
                  const destinatarioNombre = isProductor
                    ? (cal.productorNombre || `Productor #${cal.productorId}`)
                    : (cal.transportistaNombre || `Transportista #${cal.transportistaId}`)
                  const tiendaNombre = cal.tiendaNombre || `Tienda #${cal.tiendaId}`

                  return (
                    <div
                      key={cal.id}
                      style={{
                        padding: '16px 20px',
                        backgroundColor: '#f7faf7',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {renderStars(cal.puntuacion)}
                          <strong style={{ fontSize: '1rem', color: '#1b5e20' }}>
                            {cal.puntuacion}.0 / 5.0
                          </strong>
                        </div>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            backgroundColor: isProductor ? '#e8f5e9' : '#e3f2fd',
                            color: isProductor ? '#1b5e20' : '#0d47a1',
                            border: `1px solid ${isProductor ? '#a5d6a7' : '#90caf9'}`,
                          }}
                        >
                          {isProductor ? 'Reseña a Productor' : 'Reseña a Transportista'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <div>
                          <strong>Destinatario:</strong> <span style={{ color: 'var(--color-primary-dark)', fontWeight: '700' }}>{destinatarioNombre}</span>
                        </div>
                        <div className="muted-text" style={{ fontSize: '0.85rem' }}>
                          Pedido #{cal.pedidoId} &bull; Emisor: <strong style={{ color: 'var(--color-text)' }}>{tiendaNombre}</strong>
                        </div>
                      </div>

                      {cal.comentario ? (
                        <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text)', fontSize: '0.95rem', backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          "{cal.comentario}"
                        </p>
                      ) : (
                        <p className="muted-text" style={{ margin: 0, fontSize: '0.88rem', fontStyle: 'italic' }}>
                          Sin comentario adicional escrito.
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModalRatings(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
