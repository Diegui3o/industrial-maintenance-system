// data/repository/EquipoRepository.kt
package com.planta.mantenimiento.data.repository

import com.planta.mantenimiento.data.local.dao.EquipoDao
import com.planta.mantenimiento.data.remote.ApiService
import com.planta.mantenimiento.model.Equipo
import kotlinx.coroutines.flow.Flow

class EquipoRepository(
    private val dao: EquipoDao,
    private val api: ApiService
) {
    val equipos: Flow<List<Equipo>> = dao.listarTodos()

    suspend fun crearEquipo(equipo: Equipo) {
        // 1. Guardar local SIEMPRE
        dao.insertar(equipo.copy(syncStatus = "PENDING"))
        // 2. Intentar enviar al backend
        try {
            api.crearEquipo(equipo)
            dao.actualizar(equipo.copy(syncStatus = "SYNCED"))
        } catch (_: Exception) {
            // Se queda PENDING, WorkManager lo sincroniza después
        }
    }

    suspend fun sincronizarPendientes() {
        val pendientes = dao.obtenerPendientes()
        pendientes.forEach { equipo ->
            try {
                api.crearEquipo(equipo)
                dao.actualizar(equipo.copy(syncStatus = "SYNCED"))
            } catch (_: Exception) { }
        }
    }
}