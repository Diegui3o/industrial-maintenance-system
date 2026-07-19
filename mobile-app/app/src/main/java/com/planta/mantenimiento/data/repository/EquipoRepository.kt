package com.planta.mantenimiento.data.repository

import com.planta.mantenimiento.data.local.AppDatabase
import com.planta.mantenimiento.data.remote.ApiService
import com.planta.mantenimiento.model.Equipo
import kotlinx.coroutines.flow.Flow

class EquipoRepository(
    private val db: AppDatabase,
    private val api: ApiService
) {
    val equipos: Flow<List<Equipo>> = db.equipoDao().listarTodos()

    suspend fun crearEquipo(equipo: Equipo) {
        db.equipoDao().insertar(equipo.copy(syncStatus = "PENDING"))
        try {
            api.crearEquipo(equipo)
            db.equipoDao().actualizar(equipo.copy(syncStatus = "SYNCED"))
        } catch (_: Exception) { }
    }

    suspend fun sincronizarPendientes(): Int {
        val pendientes = db.equipoDao().obtenerPendientes()
        var exitos = 0
        pendientes.forEach { equipo ->
            try {
                api.crearEquipo(equipo)
                db.equipoDao().actualizar(equipo.copy(syncStatus = "SYNCED"))
                exitos++
            } catch (_: Exception) { }
        }
        return exitos
    }
}