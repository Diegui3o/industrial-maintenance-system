package com.planta.mantenimiento.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.planta.mantenimiento.model.Mantenimiento
import com.planta.mantenimiento.ui.viewmodel.MantenimientoViewModel
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MantenimientoFormScreen(navController: NavController, viewModel: MantenimientoViewModel = viewModel()) {
    var equipoId by remember { mutableStateOf("") }
    var fase by remember { mutableStateOf("FASE II") }
    var taller by remember { mutableStateOf("MECANICO") }
    var tipoCriticidad by remember { mutableStateOf("TOP TEN") }
    var sistema by remember { mutableStateOf("") }
    var tipoIntervencion by remember { mutableStateOf("MPV") }
    var modoFalla by remember { mutableStateOf("") }
    var consecuencia by remember { mutableStateOf("") }
    var descripcion by remember { mutableStateOf("") }
    var standBy by remember { mutableStateOf(false) }
    var prodAfectada by remember { mutableStateOf(false) }
    var horas by remember { mutableStateOf("") }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Nuevo Reporte") }) }
    ) { padding ->
        Column(
            modifier = Modifier.padding(padding).padding(16.dp).verticalScroll(rememberScrollState())
        ) {
            OutlinedTextField(value = equipoId, onValueChange = { equipoId = it }, label = { Text("ID Equipo") })
            OutlinedTextField(value = fase, onValueChange = { fase = it }, label = { Text("Fase") })
            OutlinedTextField(value = taller, onValueChange = { taller = it }, label = { Text("Taller") })
            OutlinedTextField(value = tipoCriticidad, onValueChange = { tipoCriticidad = it }, label = { Text("Tipo Criticidad") })
            OutlinedTextField(value = sistema, onValueChange = { sistema = it }, label = { Text("Sistema") })
            OutlinedTextField(value = tipoIntervencion, onValueChange = { tipoIntervencion = it }, label = { Text("Tipo Intervención") })
            OutlinedTextField(value = modoFalla, onValueChange = { modoFalla = it }, label = { Text("Modo de Falla") })
            OutlinedTextField(value = consecuencia, onValueChange = { consecuencia = it }, label = { Text("Consecuencia Inmediata") })
            OutlinedTextField(value = descripcion, onValueChange = { descripcion = it }, label = { Text("Descripción del Evento") }, maxLines = 3)
            OutlinedTextField(value = horas, onValueChange = { horas = it }, label = { Text("Horas") })
            Row {
                Checkbox(checked = standBy, onCheckedChange = { standBy = it })
                Text("Stand By")
            }
            Row {
                Checkbox(checked = prodAfectada, onCheckedChange = { prodAfectada = it })
                Text("Producción Afectada")
            }
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = {
                val m = Mantenimiento(
                    equipoId = equipoId.toIntOrNull() ?: 0,
                    fechaReporte = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                    fase = fase,
                    taller = taller,
                    tipoCriticidad = tipoCriticidad,
                    sistema = sistema,
                    tipoIntervencion = tipoIntervencion,
                    modoFalla = modoFalla,
                    consecuenciaInmediata = consecuencia,
                    descripcionEvento = descripcion,
                    standBy = standBy,
                    produccionAfectada = prodAfectada,
                    horas = horas.toDoubleOrNull() ?: 0.0
                )
                viewModel.crear(m)
                navController.popBackStack()
            }, modifier = Modifier.fillMaxWidth()) {
                Text("Guardar Reporte")
            }
        }
    }
}