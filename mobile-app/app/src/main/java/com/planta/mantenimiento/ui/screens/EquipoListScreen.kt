package com.planta.mantenimiento.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.planta.mantenimiento.ui.viewmodel.EquipoViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EquipoListScreen(viewModel: EquipoViewModel = viewModel()) {
    val equipos by viewModel.equipos.collectAsState(initial = emptyList())

    LaunchedEffect(Unit) {
        viewModel.cargarDesdeBackend()
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Equipos") }) }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding).padding(16.dp)) {
            items(equipos) { equipo ->
                Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("${equipo.codigo} - ${equipo.nombre}", style = MaterialTheme.typography.titleMedium)
                        Text("${equipo.area} | ${equipo.estadoEquipo}")
                    }
                }
            }
        }
    }
}