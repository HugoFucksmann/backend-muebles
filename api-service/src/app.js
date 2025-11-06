
require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const clientesRouter = require('./routes/clientes.routes');
const mueblesRouter = require('./routes/muebles.routes');
const proveedoresRouter = require('./routes/proveedores.routes');
const presupuestosRouter = require('./routes/presupuestos.routes');
const pedidosRouter = require('./routes/pedidos.routes');
const remitosRouter = require('./routes/remitos.routes');
const alertasRouter = require('./routes/alertas.routes');
const authRouter = require('./routes/auth.routes');
const statisticsRouter = require('./routes/statistics.routes');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Service is running!');
});

app.use('/auth', authRouter);
app.use('/statistics', statisticsRouter);
app.use('/clientes', clientesRouter);
app.use('/muebles', mueblesRouter);
app.use('/proveedores', proveedoresRouter);
app.use('/presupuestos', presupuestosRouter);
app.use('/pedidos', pedidosRouter);
app.use('/remitos', remitosRouter);
app.use('/alertas', alertasRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
