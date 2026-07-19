package com.planta.mantenimiento.ui.viewmodel

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.planta.mantenimiento.data.local.AppDatabase
import com.planta.mantenimiento.data.local.PreferencesManager
import com.planta.mantenimiento.data.remote.ApiClient
import com.planta.mantenimiento.data.remote.ApiService
import com.planta.mantenimiento.data.repository.EquipoRepository
import com.planta.mantenimiento.model.Equipo
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class EquipoViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getInstance(application)
    private val prefs = PreferencesManager(application)
    private val api = ApiClient.getApi(prefs)
    private val repository = EquipoRepository(db, api)

    val equipos: Flow<List<Equipo>> = db.equipoDao().listarTodos()

    init {
        cargarDesdeBackend()
    }

    fun cargarDesdeBackend() {
        viewModelScope.launch {
            try {
                Log.d("EquipoVM", "Cargando equipos desde: ${prefs.backendUrl}")
                val remotos = api.listarEquipos()
                Log.d("EquipoVM", "Recibidos: ${remotos.size} equipos")
                remotos.forEach { equipo ->
                    db.equipoDao().insertar(equipo.copy(syncStatus = "SYNCED"))
                }
            } catch (e: Exception) {
                Log.e("EquipoVM", "Error cargando equipos: ${e.message}", e)
            }
        }
    }

    fun crearEquipo(codigo: String, nombre: String, area: String) {
        viewModelScope.launch {
            repository.crearEquipo(Equipo(codigo = codigo, nombre = nombre, area = area, tipo = "bomba"))
        }
    }

    fun sincronizar() {
        viewModelScope.launch {
            repository.sincronizarPendientes()
        }
    }
}