package com.planta.mantenimiento.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.planta.mantenimiento.ui.viewmodel.MantenimientoViewModel

@Composable
fun MantenimientoListScreen(navController: NavController, viewModel: MantenimientoViewModel = viewModel()) {
    val mantenimientos by viewModel.mantenimientos.collectAsState(initial = emptyList())
    val syncMsg by viewModel.syncStatus.collectAsState()

    Scaffold(
        floatingActionButton = {
            Column(horizontalAlignment = Alignment.End) {
                FloatingActionButton(onClick = { navController.navigate("mantenimiento/crear") }) {
                    Text("+")
                }
                Spacer(modifier = Modifier.height(8.dp))
                FloatingActionButton(onClick = { viewModel.sincronizar() }) {
                    Text("🔄")
                }
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            if (syncMsg != null) {
                Text(text = syncMsg!!, color = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.height(8.dp))
            }
            Text("Reportes de Mantenimiento", style = MaterialTheme.typography.titleLarge)
            Spacer(modifier = Modifier.height(8.dp))
            LazyColumn {
                items(mantenimientos) { m ->
                    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Equipo: ${m.equipoId} - ${m.tipoIntervencion}", style = MaterialTheme.typography.titleMedium)
                            Text("${m.fechaReporte} | ${m.taller} | ${m.horas}h")
                            Text("Estado: ${m.estadoFalla} | Sync: ${if (m.syncStatus == "SYNCED") "✅" else "⏳"}")
                        }
                    }
                }
            }
        }
    }
}