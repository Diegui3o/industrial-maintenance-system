package com.planta.mantenimiento.data.local.dao

import androidx.room.*
import com.planta.mantenimiento.model.Mantenimiento
import kotlinx.coroutines.flow.Flow

@Dao
interface MantenimientoDao {
    @Query("SELECT * FROM mantenimiento ORDER BY fechaReporte DESC")
    fun listarTodos(): Flow<List<Mantenimiento>>

    @Query("SELECT * FROM mantenimiento WHERE equipoId = :equipoId ORDER BY fechaReporte DESC")
    fun listarPorEquipo(equipoId: Int): Flow<List<Mantenimiento>>

    @Query("SELECT * FROM mantenimiento WHERE syncStatus = 'PENDING'")
    suspend fun obtenerPendientes(): List<Mantenimiento>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertar(mantenimiento: Mantenimiento)

    @Update
    suspend fun actualizar(mantenimiento: Mantenimiento)
}