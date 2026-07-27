package com.planta.mantenimiento.data.remote

import com.planta.mantenimiento.data.local.PreferencesManager
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    private var currentUrl: String = ""
    private var apiService: ApiService? = null

    fun getApi(prefs: PreferencesManager): ApiService {
        val url = prefs.backendUrl
        if (url != currentUrl || apiService == null) {
            currentUrl = url
            apiService = Retrofit.Builder()
                .baseUrl(url)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ApiService::class.java)
        }
        return apiService!!
    }
}