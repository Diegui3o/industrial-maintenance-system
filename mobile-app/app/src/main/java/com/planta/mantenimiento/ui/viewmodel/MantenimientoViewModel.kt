package com.planta.mantenimiento.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.planta.mantenimiento.data.local.AppDatabase
import com.planta.mantenimiento.data.remote.ApiService
import com.planta.mantenimiento.data.repository.MantenimientoRepository
import com.planta.mantenimiento.model.Mantenimiento
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class MantenimientoViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getInstance(application)
    private val api = Retrofit.Builder()
        .baseUrl("http://10.30.33:1880/") // Cambiar por IP real
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)
    private val repository = MantenimientoRepository(db, api)

    val mantenimientos: Flow<List<Mantenimiento>> = repository.listarTodos()

    private val _syncStatus = MutableStateFlow<String?>(null)
    val syncStatus: StateFlow<String?> = _syncStatus

    fun crear(mantenimiento: Mantenimiento) {
        viewModelScope.launch {
            repository.crear(mantenimiento)
        }
    }

    fun sincronizar() {
        viewModelScope.launch {
            _syncStatus.value = "Sincronizando..."
            val exitos = repository.sincronizarPendientes()
            _syncStatus.value = "Sincronizado: $exitos reportes"
        }
    }
}