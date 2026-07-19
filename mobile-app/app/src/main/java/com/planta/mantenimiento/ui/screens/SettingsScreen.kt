package com.planta.mantenimiento.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.planta.mantenimiento.data.local.PreferencesManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(prefs: PreferencesManager, onBack: () -> Unit) {
    var ip by remember { mutableStateOf(prefs.backendUrl) }
    var username by remember { mutableStateOf(prefs.username) }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Configuración") }) }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Conexión al Servidor", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = ip,
                onValueChange = { ip = it },
                label = { Text("URL del Backend") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Usuario (opcional)") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = {
                prefs.backendUrl = ip
                prefs.username = username
                onBack()
            }, modifier = Modifier.fillMaxWidth()) {
                Text("Guardar y Volver")
            }
        }
    }
}