package com.planta.mantenimiento.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.planta.mantenimiento.data.local.dao.EquipoDao
import com.planta.mantenimiento.model.Equipo

@Database(entities = [Equipo::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun equipoDao(): EquipoDao
}