package com.planta.mantenimiento

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.room.Room
import com.planta.mantenimiento.data.local.AppDatabase
import com.planta.mantenimiento.data.remote.ApiService
import com.planta.mantenimiento.data.repository.EquipoRepository
import com.planta.mantenimiento.ui.viewmodel.EquipoViewModel
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Inicializar Room y Retrofit
        val db = Room.databaseBuilder(applicationContext, AppDatabase::class.java, "mantenimiento.db").build()
        val api = Retrofit.Builder()
            .baseUrl("http://192.168.1.71:1880/")  // ← Cambia por la IP de tu backend Go
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)

        val repository = EquipoRepository(db.equipoDao(), api)

        setContent {
            val viewModel = remember { EquipoViewModel(repository) }
            val equipos by viewModel.equipos.collectAsState(initial = emptyList())

            // Variables para el formulario
            var codigo by remember { mutableStateOf("") }
            var nombre by remember { mutableStateOf("") }
            var area by remember { mutableStateOf("") }

            Scaffold(
                floatingActionButton = {
                    FloatingActionButton(onClick = { viewModel.sincronizar() }) {
                        Text("Sync")
                    }
                }
            ) { padding ->
                Column(modifier = Modifier.padding(padding).padding(16.dp)) {
                    // Formulario simple
                    OutlinedTextField(value = codigo, onValueChange = { codigo = it }, label = { Text("Código") })
                    OutlinedTextField(value = nombre, onValueChange = { nombre = it }, label = { Text("Nombre") })
                    OutlinedTextField(value = area, onValueChange = { area = it }, label = { Text("Área") })
                    Button(onClick = {
                        if (codigo.isNotBlank()) {
                            viewModel.crearEquipo(codigo, nombre, area)
                            codigo = ""; nombre = ""; area = ""
                        }
                    }) { Text("Guardar (offline)") }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Lista de equipos
                    Text("Equipos (${equipos.size})", style = MaterialTheme.typography.titleMedium)
                    LazyColumn {
                        items(equipos) { equipo ->
                            Card(modifier = Modifier.fillMaxWidth().padding(4.dp)) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text("${equipo.codigo} - ${equipo.nombre}")
                                    Text(equipo.area, style = MaterialTheme.typography.bodySmall)
                                    Text(if (equipo.syncStatus == "SYNCED") "✅" else "⏳ Pendiente")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}