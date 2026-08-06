package com.planta.mantenimiento.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.planta.mantenimiento.data.local.dao.EquipoDao
import com.planta.mantenimiento.data.local.dao.MantenimientoDao
import com.planta.mantenimiento.model.Equipo
import com.planta.mantenimiento.model.Mantenimiento

@Database(entities = [Equipo::class, Mantenimiento::class], version = 3, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun equipoDao(): EquipoDao
    abstract fun mantenimientoDao(): MantenimientoDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "mantenimiento.db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                    .also { INSTANCE = it }
            }
        }
    }
}