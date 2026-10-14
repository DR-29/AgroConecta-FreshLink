const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const metodosPagoRoutes = require('./routes/metodosPagoRoutes');
const transaccionesRoutes = require('./routes/transaccionesRoutes');
const facturasRoutes = require('./routes/facturasRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/metodos-pago', metodosPagoRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/facturas', facturasRoutes);

app.get('/', (req, res) => {
  res.json({
    sistema: 'API Auxiliar - Pagos y Facturación AgroConecta',
    evaluacion: 'Parcial I - Entregable 2 (Express + MySQL 30%)',
    estado: 'Servicio en ejecución',
    rutas_disponibles: {
      metodos_pago: '/api/metodos-pago',
      transacciones: '/api/transacciones',
      facturas: '/api/facturas',
      salud: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'agroconecta-pagos-express', timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada en la API auxiliar' });
});

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en: http://localhost:${PORT}`);
});
