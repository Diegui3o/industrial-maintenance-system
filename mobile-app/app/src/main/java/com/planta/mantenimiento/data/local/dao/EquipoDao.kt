package com.planta.mantenimiento.data.local.dao

import androidx.room.*
import com.planta.mantenimiento.model.Equipo
import kotlinx.coroutines.flow.Flow

@Dao
interface EquipoDao {
    @Query("SELECT * FROM equipos ORDER BY id DESC")
    fun listarTodos(): Flow<List<Equipo>>

    @Query("SELECT * FROM equipos WHERE syncStatus = 'PENDING'")
    suspend fun obtenerPendientes(): List<Equipo>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertar(equipo: Equipo)

    @Update
    suspend fun actualizar(equipo: Equipo)
}