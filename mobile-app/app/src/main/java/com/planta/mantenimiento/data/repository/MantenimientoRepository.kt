package com.planta.mantenimiento.data.repository

import com.planta.mantenimiento.data.local.AppDatabase
import com.planta.mantenimiento.data.remote.ApiService
import com.planta.mantenimiento.model.Mantenimiento
import kotlinx.coroutines.flow.Flow

class MantenimientoRepository(
    private val db: AppDatabase,
    private val api: ApiService
) {
    fun listarTodos(): Flow<List<Mantenimiento>> = db.mantenimientoDao().listarTodos()

    suspend fun crear(mantenimiento: Mantenimiento) {
        db.mantenimientoDao().insertar(mantenimiento.copy(syncStatus = "PENDING"))
        try {
            val created = api.crearMantenimiento(mantenimiento)
            db.mantenimientoDao().actualizar(created.copy(syncStatus = "SYNCED"))
        } catch (_: Exception) { }
    }

    suspend fun sincronizarPendientes(): Int {
        val pendientes = db.mantenimientoDao().obtenerPendientes()
        var exitos = 0
        pendientes.forEach { m ->
            try {
                val created = api.crearMantenimiento(m)
                db.mantenimientoDao().actualizar(created.copy(syncStatus = "SYNCED"))
                exitos++
            } catch (_: Exception) { }
        }
        return exitos
    }
}