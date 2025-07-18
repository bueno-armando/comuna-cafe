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

// Mostrar notificación con modal de Bootstrap
function showNotif(msg, type = 'success') {
  const modal = new bootstrap.Modal(document.getElementById('notificacionModal'));
  const titulo = document.getElementById('notificacionTitulo');
  const mensaje = document.getElementById('notificacionMensaje');
  const icono = titulo.querySelector('i');
  
  // Configurar según el tipo
  if (type === 'success') {
    titulo.innerHTML = '<i class="bi bi-check-circle me-2"></i>Éxito';
    titulo.className = 'modal-title text-success';
  } else if (type === 'danger' || type === 'error') {
    titulo.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>Error';
    titulo.className = 'modal-title text-danger';
  } else {
    titulo.innerHTML = '<i class="bi bi-info-circle me-2"></i>Información';
    titulo.className = 'modal-title text-info';
  }
  
  mensaje.textContent = msg;
  modal.show();
}

// Exportar reporte a PDF
async function exportarPDF() {
  const reporteId = document.getElementById('detalleReporteId').value;
  if (!reporteId) {
    showNotif('No hay reporte seleccionado', 'danger');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/${reporteId}/exportar/pdf`, {
      headers: {
        'Authorization': 'Bearer ' + JWT
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al exportar PDF');
    }
    
    // Crear blob y descargar
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${reporteId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotif('PDF exportado exitosamente');
  } catch (error) {
    showNotif('Error al exportar PDF: ' + error.message, 'danger');
  }
}

// Exportar reporte a Excel
async function exportarExcel() {
  const reporteId = document.getElementById('detalleReporteId').value;
  if (!reporteId) {
    showNotif('No hay reporte seleccionado', 'danger');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/${reporteId}/exportar/excel`, {
      headers: {
        'Authorization': 'Bearer ' + JWT
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al exportar Excel');
    }
    
    // Crear blob y descargar
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${reporteId}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotif('Excel exportado exitosamente');
  } catch (error) {
    showNotif('Error al exportar Excel: ' + error.message, 'danger');
  }
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
      buscarReportes(false); // Refresca la tabla sin filtro de tipo
    } else {
      showNotif(data.message || 'Error al generar reporte', 'danger');
    }
  } catch (err) {
    showNotif('Error de red al generar reporte', 'danger');
  }
}

// Buscar/listar reportes
async function buscarReportes(applyTipoFilter = false) {
  const fechaInicio = document.getElementById('fechaBusqInicio').value;
  const fechaFin = document.getElementById('fechaBusqFin').value;
  const tipo = document.getElementById('tipoReporte').value;
  let url = API_URL + `?limit=10`;
  if (fechaInicio) url += `&fechaInicio=${fechaInicio}`;
  if (fechaFin) url += `&fechaFin=${fechaFin}`;
  // Solo aplicar filtro de tipo si se solicita explícitamente o si hay filtros de fecha
  if (applyTipoFilter && tipo) url += `&tipo=${tipo}`;
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

// Aplicar filtro rápido
function aplicarFiltroRapido(periodo) {
  const fechaInicio = document.getElementById('fechaBusqInicio');
  const fechaFin = document.getElementById('fechaBusqFin');
  const datePickerContainer = document.getElementById('datePickerContainer');
  const aplicarFiltrosContainer = document.getElementById('aplicarFiltrosContainer');
  
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  
  // Limpiar fechas primero
  fechaInicio.value = '';
  fechaFin.value = '';
  
  switch (periodo) {
    case 'hoy':
      fechaInicio.value = hoy.toISOString().split('T')[0];
      fechaFin.value = hoy.toISOString().split('T')[0];
      datePickerContainer.style.display = 'none';
      aplicarFiltrosContainer.classList.add('d-none');
      mostrarFiltrosAplicados();
      buscarReportes(false);
      break;
    case 'semana':
      fechaInicio.value = inicioSemana.toISOString().split('T')[0];
      fechaFin.value = finSemana.toISOString().split('T')[0];
      datePickerContainer.style.display = 'none';
      aplicarFiltrosContainer.classList.add('d-none');
      mostrarFiltrosAplicados();
      buscarReportes(false);
      break;
    case 'mes':
      fechaInicio.value = inicioMes.toISOString().split('T')[0];
      fechaFin.value = finMes.toISOString().split('T')[0];
      datePickerContainer.style.display = 'none';
      aplicarFiltrosContainer.classList.add('d-none');
      mostrarFiltrosAplicados();
      buscarReportes(false);
      break;
    case 'personalizado':
      datePickerContainer.style.display = 'block';
      aplicarFiltrosContainer.classList.remove('d-none');
      document.getElementById('filtrosAplicados').classList.add('d-none');
      break;
  }
}

// Limpiar filtros
function limpiarFiltros() {
  document.getElementById('fechaBusqInicio').value = '';
  document.getElementById('fechaBusqFin').value = '';
  document.getElementById('datePickerContainer').style.display = 'none';
  document.getElementById('aplicarFiltrosContainer').classList.add('d-none');
  
  // Resetear botones de filtros rápidos
  document.querySelectorAll('[data-period]').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Ocultar indicador de filtros aplicados
  document.getElementById('filtrosAplicados').classList.add('d-none');
  
  buscarReportes(false); // Sin filtro de tipo
}

// Mostrar indicador de filtros aplicados
function mostrarFiltrosAplicados() {
  const fechaInicio = document.getElementById('fechaBusqInicio').value;
  const fechaFin = document.getElementById('fechaBusqFin').value;
  const filtrosAplicados = document.getElementById('filtrosAplicados');
  const textoFiltrosAplicados = document.getElementById('textoFiltrosAplicados');
  
  if (fechaInicio || fechaFin) {
    let texto = 'Filtros aplicados: ';
    if (fechaInicio && fechaFin) {
      texto += `Desde ${new Date(fechaInicio).toLocaleDateString('es-MX')} hasta ${new Date(fechaFin).toLocaleDateString('es-MX')}`;
    } else if (fechaInicio) {
      texto += `Desde ${new Date(fechaInicio).toLocaleDateString('es-MX')}`;
    } else if (fechaFin) {
      texto += `Hasta ${new Date(fechaFin).toLocaleDateString('es-MX')}`;
    }
    textoFiltrosAplicados.textContent = texto;
    filtrosAplicados.classList.remove('d-none');
  } else {
    filtrosAplicados.classList.add('d-none');
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
document.getElementById('buscarReportesBtn').addEventListener('click', function() {
  mostrarFiltrosAplicados();
  buscarReportes(true); // Aplicar filtro de tipo cuando se hace clic explícitamente
});
document.getElementById('cerrarFiltros').addEventListener('click', limpiarFiltros);
document.getElementById('cerrarFiltrosX').addEventListener('click', limpiarFiltros);

// Eventos para filtros rápidos
document.querySelectorAll('[data-period]').forEach(btn => {
  btn.addEventListener('click', function() {
    // Remover clase active de todos los botones
    document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
    // Agregar clase active al botón clickeado
    this.classList.add('active');
    // Aplicar filtro
    aplicarFiltroRapido(this.getAttribute('data-period'));
  });
});

document.getElementById('reportesTableBody').addEventListener('click', function(e) {
  if (e.target.classList.contains('ver-detalle-reporte-btn')) {
    const id = e.target.getAttribute('data-reporte-id');
    mostrarDetalleReporte(id);
  }
});

// Inicializar tabla al cargar
window.addEventListener('DOMContentLoaded', () => buscarReportes(false));

// Función de inicialización
function initReportes() {
  // Cargar reportes al inicio
  buscarReportes(false);
  
  // Evento para mostrar el modal de detalles de reporte
  document.getElementById('detalleReporteModal').addEventListener('show.bs.modal', function(event) {
    const button = event.relatedTarget;
    const reporteId = button.getAttribute('data-reporte-id');
    if (reporteId) {
      mostrarDetalleReporte(reporteId);
    }
  });
}

// Inicializar cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', initReportes);

// Funciones de exportación
window.exportarPDF = exportarPDF;
window.exportarExcel = exportarExcel; 