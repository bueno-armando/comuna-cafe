// Lógica frontend para el módulo de Reportes

const API_URL = '/api/reportes';
const JWT = localStorage.getItem('token');

// Utilidad para formatear fechas (YYYY-MM-DD a DD/MM/YY)
function formatFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d)) return fecha;
  return d.toLocaleDateString('es-MX', { year: '2-digit', month: '2-digit', day: '2-digit' });
}

// Mostrar notificación (puedes mejorar con Toasts de Bootstrap)
function showNotif(msg, type = 'success') {
  // Simple: alert, reemplaza por toast si tienes
  alert(msg);
}

// Generar reporte
async function generarReporte() {
  const tipo = document.getElementById('tipoReporte').value;
  const fecha_inicio = document.getElementById('fechaGenInicio').value;
  const fecha_fin = document.getElementById('fechaGenFin').value;
  if (!tipo || !fecha_inicio || !fecha_fin) {
    showNotif('Completa todos los campos para generar el reporte', 'danger');
    return;
  }
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + JWT
      },
      body: JSON.stringify({ tipo, fecha_inicio, fecha_fin })
    });
    const data = await res.json();
    if (res.ok) {
      showNotif('Reporte generado exitosamente');
      buscarReportes(); // Refresca la tabla
    } else {
      showNotif(data.message || 'Error al generar reporte', 'danger');
    }
  } catch (err) {
    showNotif('Error de red al generar reporte', 'danger');
  }
}

// Buscar/listar reportes
async function buscarReportes() {
  const fechaInicio = document.getElementById('fechaBusqInicio').value;
  const fechaFin = document.getElementById('fechaBusqFin').value;
  const tipo = document.getElementById('tipoReporte').value;
  let url = API_URL + `?limit=10`;
  if (fechaInicio) url += `&fechaInicio=${fechaInicio}`;
  if (fechaFin) url += `&fechaFin=${fechaFin}`;
  if (tipo) url += `&tipo=${tipo}`;
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + JWT }
    });
    const data = await res.json();
    if (res.ok) {
      llenarTablaReportes(data.reportes);
    } else {
      showNotif(data.message || 'Error al buscar reportes', 'danger');
    }
  } catch (err) {
    showNotif('Error de red al buscar reportes', 'danger');
  }
}

// Llenar la tabla de reportes
function llenarTablaReportes(reportes) {
  const tbody = document.getElementById('reportesTableBody');
  tbody.innerHTML = '';
  if (!reportes || reportes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4">No hay reportes generados.</td></tr>`;
    return;
  }
  reportes.forEach(rep => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${rep.ID_Reporte}</td>
      <td>${rep.Tipo}</td>
      <td>${formatFecha(rep.Fecha_Inicio)}</td>
      <td>${formatFecha(rep.Fecha_Fin)}</td>
      <td>$${rep.Total_Gastos}</td>
      <td>$${rep.Total_Ventas}</td>
      <td>$${rep.Ganancia}</td>
      <td><button class="btn btn-sm btn-outline-success ver-detalle-reporte-btn" data-reporte-id="${rep.ID_Reporte}" data-bs-toggle="modal" data-bs-target="#detalleReporteModal">Ver detalles</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Mostrar detalles de un reporte
async function mostrarDetalleReporte(id) {
  try {
    // Encabezado
    const res = await fetch(`${API_URL}/${id}`, { headers: { 'Authorization': 'Bearer ' + JWT } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    const rep = data.reporte;
    document.getElementById('detalleReporteId').value = rep.ID_Reporte;
    document.getElementById('detalleReporteTipo').value = rep.Tipo;
    document.getElementById('detalleReporteFechaInicio').value = formatFecha(rep.Fecha_Inicio);
    document.getElementById('detalleReporteFechaFin').value = formatFecha(rep.Fecha_Fin);
    document.getElementById('detalleReporteGanancia').value = `$${rep.Ganancia}`;
    document.getElementById('detalleReporteGastos').value = `$${rep.Total_Gastos}`;
    // Ventas
    const ventasRes = await fetch(`${API_URL}/${id}/ventas`, { headers: { 'Authorization': 'Bearer ' + JWT } });
    const ventasData = await ventasRes.json();
    llenarTablaDetalleVentas(ventasData.ventas);
    // Gastos
    const gastosRes = await fetch(`${API_URL}/${id}/gastos`, { headers: { 'Authorization': 'Bearer ' + JWT } });
    const gastosData = await gastosRes.json();
    llenarTablaDetalleGastos(gastosData.gastos);
    // Producto más vendido
    const prodRes = await fetch(`${API_URL}/${id}/producto-mas-vendido`, { headers: { 'Authorization': 'Bearer ' + JWT } });
    const prodData = await prodRes.json();
    document.getElementById('detalleReporteMasVendido').value = prodData.producto || 'N/A';
    // Día con más ventas
    const diaRes = await fetch(`${API_URL}/${id}/dia-mas-ventas`, { headers: { 'Authorization': 'Bearer ' + JWT } });
    const diaData = await diaRes.json();
    document.getElementById('detalleReporteDiaMasVentas').value = diaData.fecha ? formatFecha(diaData.fecha) : 'N/A';
  } catch (err) {
    showNotif('Error al cargar detalles del reporte: ' + err.message, 'danger');
  }
}

function llenarTablaDetalleVentas(ventas) {
  const tbody = document.getElementById('detalleReporteVentas');
  tbody.innerHTML = '';
  if (!ventas || ventas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Sin ventas</td></tr>`;
    return;
  }
  ventas.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${v.ID_Venta}</td>
      <td>${formatFecha(v.Fecha)}</td>
      <td>$${v.Total}</td>
      <td>${v.Metodo_Pago}</td>
      <td>${v.Usuario}</td>
    `;
    tbody.appendChild(tr);
  });
}

function llenarTablaDetalleGastos(gastos) {
  const tbody = document.getElementById('detalleReporteGastos');
  tbody.innerHTML = '';
  if (!gastos || gastos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">Sin gastos</td></tr>`;
    return;
  }
  gastos.forEach(g => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${g.ID_Gasto}</td>
      <td>${g.Descripcion}</td>
      <td>$${g.Monto}</td>
      <td>${formatFecha(g.Fecha)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Eventos

document.getElementById('generarReporteBtn').addEventListener('click', generarReporte);
document.getElementById('buscarReportesBtn').addEventListener('click', buscarReportes);

document.getElementById('reportesTableBody').addEventListener('click', function(e) {
  if (e.target.classList.contains('ver-detalle-reporte-btn')) {
    const id = e.target.getAttribute('data-reporte-id');
    mostrarDetalleReporte(id);
  }
});

// Inicializar tabla al cargar
window.addEventListener('DOMContentLoaded', buscarReportes);

// Placeholders para exportar a PDF/Excel
// document.querySelector('.btn-success').addEventListener('click', exportarPDF);
// document.querySelector('.btn-cafe').addEventListener('click', exportarExcel); 