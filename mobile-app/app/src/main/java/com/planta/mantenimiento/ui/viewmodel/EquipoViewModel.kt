package com.planta.mantenimiento.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.planta.mantenimiento.data.local.AppDatabase
import com.planta.mantenimiento.data.remote.ApiService
import com.planta.mantenimiento.data.repository.EquipoRepository
import com.planta.mantenimiento.model.Equipo
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class EquipoViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getInstance(application)
    private val api = Retrofit.Builder()
        .baseUrl("http://10.30.33:1880/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)
    private val repository = EquipoRepository(db, api)

    val equipos = repository.equipos

    fun crearEquipo(codigo: String, nombre: String, area: String) {
        viewModelScope.launch {
            repository.crearEquipo(
                Equipo(codigo = codigo, nombre = nombre, area = area, tipo = "bomba")
            )
        }
    }

    fun sincronizar() {
        viewModelScope.launch {
            repository.sincronizarPendientes()
        }
    }

    fun cargarDesdeBackend() {
        viewModelScope.launch {
            try {
                val remotos = api.listarEquipos()
                remotos.forEach { equipo ->
                    db.equipoDao().insertar(equipo.copy(syncStatus = "SYNCED"))
                }
            } catch (_: Exception) { }
        }
    }
}